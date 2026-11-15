"""
ORBY NASA API Client
Fetches DONKI (FLR/CME/SEP), OSDR Search, and RadLab data.
Loads NASA_API_KEY from project root .env via python-dotenv.
"""

import os
import time
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load .env from project root (two levels up from src/)
_project_root = Path(__file__).resolve().parent.parent
load_dotenv(_project_root / ".env")

NASA_API_KEY = os.environ.get("NASA_API_KEY", "DEMO_KEY")

DONKI_BASE       = "https://api.nasa.gov/DONKI"
DONKI_CCMC_BASE  = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get"  # direct CCMC fallback
OSDR_SEARCH      = "https://osdr.nasa.gov/osdr/data/search"
RADLAB_API       = "https://visualization.osdr.nasa.gov/radlab/gui/data-api/"

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# DONKI helpers
# ---------------------------------------------------------------------------

def _donki_get(endpoint: str, params: dict) -> list:
    """
    GET a DONKI endpoint via api.nasa.gov; on 403/429 falls back to CCMC direct.
    Returns parsed JSON list or [] on error.
    """
    params["api_key"] = NASA_API_KEY
    url = f"{DONKI_BASE}/{endpoint}"
    try:
        resp = requests.get(url, params=params, timeout=15)
        if resp.status_code in (403, 429):
            log.warning(
                "DONKI %s: api.nasa.gov returned %s — trying CCMC direct endpoint.",
                endpoint, resp.status_code,
            )
            return _donki_ccmc_get(endpoint, {k: v for k, v in params.items() if k != "api_key"})
        resp.raise_for_status()
        data = resp.json()
        return data if isinstance(data, list) else []
    except requests.RequestException as exc:
        log.error("DONKI %s fetch failed: %s", endpoint, exc)
        return []


def _donki_ccmc_get(endpoint: str, params: dict) -> list:
    """Direct CCMC DONKI endpoint (no API key required, public)."""
    url = f"{DONKI_CCMC_BASE}/{endpoint}"
    try:
        resp = requests.get(url, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data if isinstance(data, list) else []
    except requests.RequestException as exc:
        log.error("DONKI CCMC %s fetch failed: %s", endpoint, exc)
        return []


def fetch_flr(start_date: str, end_date: str) -> list:
    """Fetch Solar Flare (FLR) events. Date format: YYYY-MM-DD."""
    # NASA updated DONKI: /DONKI/FLR → /DONKI/notifications?type=FLR
    return _donki_get("notifications", {"type": "FLR", "startDate": start_date, "endDate": end_date})


def fetch_cme_analysis(start_date: str, end_date: str) -> list:
    """
    Fetch CME Analysis events.
    DONKI max window per request is 60 days; this function splits automatically.
    """
    fmt = "%Y-%m-%d"
    s = datetime.strptime(start_date, fmt)
    e = datetime.strptime(end_date, fmt)
    all_results = []
    cursor = s
    while cursor < e:
        window_end = min(cursor + timedelta(days=59), e)
        chunk = _donki_get(
            "notifications",
            {"type": "CME", "startDate": cursor.strftime(fmt), "endDate": window_end.strftime(fmt)},
        )
        all_results.extend(chunk)
        cursor = window_end + timedelta(days=1)
        if cursor < e:
            time.sleep(0.5)
    return all_results


def fetch_sep(start_date: str, end_date: str) -> list:
    """Fetch Solar Energetic Particle (SEP) events."""
    return _donki_get("notifications", {"type": "SEP", "startDate": start_date, "endDate": end_date})


# ---------------------------------------------------------------------------
# OSDR Search API
# ---------------------------------------------------------------------------

def search_osdr(term: str, page: int = 0, size: int = 25) -> dict:
    """
    Search NASA OSDR (Open Science Data Repository).
    Handles HTTP 301 redirect from genelab.nasa.gov → osdr.nasa.gov automatically.
    Returns parsed JSON dict or {"hits": 0} on failure.
    """
    params = {"term": term, "from": page * size, "size": size}
    try:
        resp = requests.get(OSDR_SEARCH, params=params, timeout=15, allow_redirects=True)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        log.error("OSDR search failed for '%s': %s", term, exc)
        return {"hits": 0}


# ---------------------------------------------------------------------------
# RadLab Data API
# ---------------------------------------------------------------------------

def check_radlab_availability() -> bool:
    """
    Ping the RadLab Data API endpoint to confirm it is reachable.
    Returns True if HTTP 200, False otherwise.
    RadLab serves ISS/LRO radiation dosimetry used for Marcus Vance's triage.
    """
    try:
        resp = requests.get(RADLAB_API, timeout=10)
        return resp.status_code == 200
    except requests.RequestException as exc:
        log.error("RadLab ping failed: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Safe connectivity test (run with: python3 src/nasa_api_client.py)
# ---------------------------------------------------------------------------

def _run_connectivity_test():
    key_display = NASA_API_KEY[:4] + "…" if len(NASA_API_KEY) > 4 else NASA_API_KEY
    print(f"\n=== ORBY NASA API Connectivity Test ===")
    if NASA_API_KEY == "DEMO_KEY":
        key_note = "DEMO_KEY — rate-limited (get a free key at https://api.nasa.gov)"
    else:
        key_note = "project key from .env"
    print(f"API key loaded: {key_display}  ({key_note})")
    print("NOTE: If DONKI returns 403, the key may be expired/invalid — register a new one.")
    print("      The client auto-falls-back to the public CCMC DONKI endpoint on 403/429.\n")

    # 1. FLR — small window to stay inside rate limit
    print("1. DONKI FLR (2016-01-01 → 2016-01-07)…")
    flr = fetch_flr("2016-01-01", "2016-01-07")
    print(f"   → {len(flr)} flare event(s) returned")
    if flr:
        sample = flr[0]
        print(f"   Sample keys: {list(sample.keys())[:6]}")

    # 2. CME — 70-day span to exercise auto-split
    print("\n2. DONKI CMEAnalysis (2016-01-01 → 2016-03-11, auto-split at 60 d)…")
    cme = fetch_cme_analysis("2016-01-01", "2016-03-11")
    print(f"   → {len(cme)} CME analysis record(s) returned")

    # 3. SEP
    print("\n3. DONKI SEP (2016-01-01 → 2016-01-07)…")
    sep = fetch_sep("2016-01-01", "2016-01-07")
    print(f"   → {len(sep)} SEP event(s) returned")

    # 4. OSDR
    print("\n4. OSDR search ('spaceflight immune')…")
    osdr = search_osdr("spaceflight immune")
    hits_obj = osdr.get("hits", {})
    if isinstance(hits_obj, dict):
        hits = hits_obj.get("total", "?")
    elif isinstance(hits_obj, int):
        hits = hits_obj
    else:
        hits = "?"
    print(f"   → {hits} total result(s)")

    # 5. RadLab ping
    print("\n5. RadLab API availability…")
    ok = check_radlab_availability()
    print(f"   → {'reachable ✓' if ok else 'unreachable ✗'}")

    print("\nDone.\n")


if __name__ == "__main__":
    _run_connectivity_test()
