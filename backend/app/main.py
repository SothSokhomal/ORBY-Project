"""
ORBY Data Pipeline Server  (FastAPI + Uvicorn, port 8000)

Purpose: fetch and cache NASA data for the game's public/data/*.json baseline.
         This is NOT the game engine — game state lives in the browser only
         (Architecture decisions D-10 / D-11).

Endpoints
---------
GET  /api/health                 — liveness probe
GET  /api/donki                  — DONKI FLR/CME/SEP events (last 90 days)
GET  /api/osdr                   — OSDR study search (keyword param)
GET  /api/radlab                 — RadLab dose-rate snapshot
POST /api/power/simulate         — Run power-budget simulation (JSON body)
GET  /api/audit/summary          — Dataset audit summary
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# Local helpers
from app.nasa_api_client import (
    fetch_flr,
    fetch_cme_analysis,
    fetch_sep,
    search_osdr,
    check_radlab_availability,
)
from app.power_simulation import apply_power_tick, PowerState

log = logging.getLogger("uvicorn.error")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

app = FastAPI(
    title="ORBY Data Pipeline",
    description="NASA data access layer for the ORBY browser game. Never holds game state.",
    version="1.0.0",
)

# Allow Vite dev server on port 3005
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3005", "http://127.0.0.1:3005"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/api/health", tags=["infra"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "orby-data-pipeline"}


# ---------------------------------------------------------------------------
# DONKI
# ---------------------------------------------------------------------------

@app.get("/api/donki", tags=["nasa"])
def donki(days: int = Query(default=90, ge=1, le=365)) -> dict[str, Any]:
    """Return DONKI solar-flare, CME and SEP events for the last *days* days."""
    from datetime import datetime, timedelta
    end = datetime.utcnow()
    start = end - timedelta(days=days)
    start_str = start.strftime("%Y-%m-%d")
    end_str   = end.strftime("%Y-%m-%d")
    try:
        flr = fetch_flr(start_str, end_str)
        cme = fetch_cme_analysis(start_str, end_str)
        sep = fetch_sep(start_str, end_str)
        return {"flr": flr, "cme": cme, "sep": sep, "days_fetched": days}
    except Exception as exc:
        log.exception("DONKI fetch failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# OSDR
# ---------------------------------------------------------------------------

@app.get("/api/osdr", tags=["nasa"])
def osdr(keyword: str = Query(default="lunar radiation")) -> dict[str, Any]:
    """Search OSDR for studies matching *keyword*."""
    try:
        results = search_osdr(keyword)
        return {"keyword": keyword, "results": results}
    except Exception as exc:
        log.exception("OSDR fetch failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# RadLab
# ---------------------------------------------------------------------------

@app.get("/api/radlab", tags=["nasa"])
def radlab() -> dict[str, Any]:
    """Return whether RadLab API is reachable and responding."""
    try:
        available = check_radlab_availability()
        return {"available": available}
    except Exception as exc:
        log.exception("RadLab check failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Power simulation
# ---------------------------------------------------------------------------

@app.post("/api/power/simulate", tags=["simulation"])
def power_simulate(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Advance a power state by one hour.
    Body: { battery_kwh, sep_events, active_loads, illumination_pct, hour }
    """
    try:
        # active_loads may arrive as a list of enabled load names or a full dict
        if isinstance(payload.get("active_loads"), list):
            payload["active_loads"] = {k: True for k in payload["active_loads"]}
        state = PowerState(**payload)
        new_state, events = apply_power_tick(state)
        return {
            "state": {
                "battery_kwh": new_state.battery_kwh,
                "battery_pct": new_state.battery_pct,
                "hour": new_state.hour,
                "is_critical": new_state.is_critical,
                "is_warning": new_state.is_warning,
                "array_output_kw": new_state.array_output_kw,
                "load_kw": new_state.load_kw,
                "active_loads": new_state.active_loads,
            },
            "events": [{"hour": e.hour, "id": e.event_id, "msg": e.message, "severity": e.severity} for e in events],
        }
    except TypeError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        log.exception("Power simulation failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Audit summary
# ---------------------------------------------------------------------------

@app.get("/api/audit/summary", tags=["infra"])
def audit_summary() -> dict[str, Any]:
    """Return the pre-computed dataset audit summary if present."""
    summary_file = DATA_DIR / "audit" / "summary.json"
    if not summary_file.exists():
        raise HTTPException(status_code=404, detail="Audit summary not yet generated. Run: python backend/scripts/audit_nasa_csvs.py")
    return json.loads(summary_file.read_text())
