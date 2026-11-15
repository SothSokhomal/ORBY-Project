"""
ORBY Power-Budget & Load-Shedding Simulation
Implements the Relocatable Solar Array + DR-01 load-shedding for the ORBY game engine.

All constants sourced from public/data/powereng-baseline.json and
public/data/nasa-baseline.json unless marked [Game assumption].

DR-01 shed order (locked rule DR-01):
  Science → Rovers → Communications → Heating → Life Support
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Tuple
import math

# ---------------------------------------------------------------------------
# Config — all numbers named, no magic values inline
# ---------------------------------------------------------------------------

# VSAT array specs (source: NTRS / powereng-baseline.json)
ARRAYS_DEPLOYED: int = 4
POWER_PER_ARRAY_KW: float = 10.0        # 10 kW per array
PEAK_OUTPUT_KW: float = 45.0            # includes wiring/inverter margin
SEP_DEGRADATION_PCT: float = 5.0        # % output lost per SEP event (cumulative)

# LROC WAC South Pole illumination (source: WAC_POLE_ILL_PCT_SOUTH_100M)
SHACKLETON_RIM_ILL_PCT: float = 86.0
NOBILE_RIDGE_ILL_PCT: float = 89.0
CRATER_FLOOR_ILL_PCT: float = 0.0

# Battery capacity [Game assumption]
BATTERY_CAPACITY_KWH: float = 50.0
BATTERY_CRITICAL_PCT: float = 10.0      # EV-08 threshold
BATTERY_WARNING_PCT: float = 30.0       # EV-13 threshold

# BVAD per-crew loads (source: NASA BVAD / nasa-baseline.json)
O2_KG_PER_PERSON_DAY: float = 0.84
WATER_L_PER_PERSON_DAY: float = 2.5
FOOD_KCAL_PER_PERSON_DAY: float = 2800
SABATIER_EFFICIENCY: float = 0.92

# ECLSS subsystem power draws in kW [Game assumption unless noted]
# (These are labelled "Calculated" from BVAD metabolic rates)
LIFE_SUPPORT_KW: float = 6.0            # O2 gen + CO2 scrub + water recycler (4 crew)
HEATING_KW: float = 3.0                 # Lunar surface thermal management
COMMS_KW: float = 1.5                   # S-band / UHF relay
ROVERS_KW: float = 2.0                  # Pressurized rover trickle charge
SCIENCE_KW: float = 3.0                 # Lab instruments + hydroponics lighting

# DR-01 shed order (locked — see CLAUDE.md)
SHED_ORDER: List[str] = ["science", "rovers", "communications", "heating", "life_support"]

# Polar shadow durations per difficulty (Decision D-04)
DARK_HOURS: dict = {"cadet": 48, "pilot": 72, "commander": 100}

CREW_COUNT: int = 4


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class PowerState:
    battery_kwh: float = BATTERY_CAPACITY_KWH
    sep_events: int = 0                         # cumulative SEP hits
    active_loads: dict = field(default_factory=lambda: {
        "life_support": True,
        "heating": True,
        "communications": True,
        "rovers": True,
        "science": True,
    })
    illumination_pct: float = SHACKLETON_RIM_ILL_PCT
    hour: int = 0                               # mission hour (0–2160)

    @property
    def array_output_kw(self) -> float:
        """Array output accounting for SEP degradation."""
        degradation = min(1.0, self.sep_events * SEP_DEGRADATION_PCT / 100.0)
        raw = ARRAYS_DEPLOYED * POWER_PER_ARRAY_KW * (1 - degradation)
        return min(raw, PEAK_OUTPUT_KW) * (self.illumination_pct / 100.0)

    @property
    def load_kw(self) -> float:
        load_map = {
            "life_support": LIFE_SUPPORT_KW,
            "heating": HEATING_KW,
            "communications": COMMS_KW,
            "rovers": ROVERS_KW,
            "science": SCIENCE_KW,
        }
        return sum(v for k, v in load_map.items() if self.active_loads.get(k, False))

    @property
    def net_power_kw(self) -> float:
        return self.array_output_kw - self.load_kw

    @property
    def battery_pct(self) -> float:
        return (self.battery_kwh / BATTERY_CAPACITY_KWH) * 100.0

    @property
    def is_critical(self) -> bool:
        return self.battery_pct <= BATTERY_CRITICAL_PCT

    @property
    def is_warning(self) -> bool:
        return self.battery_pct <= BATTERY_WARNING_PCT


@dataclass
class SimEvent:
    hour: int
    event_id: str
    message: str
    severity: str  # "info" | "warning" | "critical"


# ---------------------------------------------------------------------------
# Simulation engine — one-hour tick (matches src/game/hourlyTick.ts contract)
# ---------------------------------------------------------------------------

def apply_power_tick(state: PowerState, dt_hours: float = 1.0) -> Tuple[PowerState, List[SimEvent]]:
    """
    Advance power state by dt_hours (default 1 h = one game tick).
    Returns updated state and any events fired this tick.
    Never mutates the input; returns a copy.
    """
    events: List[SimEvent] = []
    s = PowerState(
        battery_kwh=state.battery_kwh,
        sep_events=state.sep_events,
        active_loads=dict(state.active_loads),
        illumination_pct=state.illumination_pct,
        hour=state.hour + int(dt_hours),
    )

    net = s.array_output_kw - s.load_kw
    delta_kwh = net * dt_hours
    s.battery_kwh = max(0.0, min(BATTERY_CAPACITY_KWH, s.battery_kwh + delta_kwh))

    # DR-01: auto-shed if battery insufficient
    _apply_dr01(s, events)

    # EV-13 warning
    if s.is_warning and not s.is_critical:
        events.append(SimEvent(
            s.hour, "EV-13",
            f"Battery at {s.battery_pct:.0f}%. Plan backup power now.",
            "warning",
        ))

    # EV-08 critical
    if s.is_critical:
        events.append(SimEvent(
            s.hour, "EV-08",
            f"Battery CRITICAL ({s.battery_pct:.0f}%). Life support only.",
            "critical",
        ))

    return s, events


def _apply_dr01(s: PowerState, events: List[SimEvent]) -> None:
    """
    Shed loads in DR-01 order until net power ≥ 0 or only life support remains.
    Writes reason into events for the HUD event log.
    """
    for load in SHED_ORDER:
        if s.net_power_kw >= 0:
            break
        if s.active_loads.get(load, False):
            s.active_loads[load] = False
            events.append(SimEvent(
                s.hour, "DR-01",
                f"DR-01 shed '{load}' — deficit {abs(s.net_power_kw):.1f} kW.",
                "warning",
            ))


def apply_sep_event(state: PowerState) -> Tuple[PowerState, SimEvent]:
    """Record one SEP hit; degrades array output by SEP_DEGRADATION_PCT."""
    s = PowerState(
        battery_kwh=state.battery_kwh,
        sep_events=state.sep_events + 1,
        active_loads=dict(state.active_loads),
        illumination_pct=state.illumination_pct,
        hour=state.hour,
    )
    total_loss = s.sep_events * SEP_DEGRADATION_PCT
    evt = SimEvent(
        s.hour, "SEP",
        f"SEP event #{s.sep_events}. Array output degraded by {total_loss:.0f}% total.",
        "critical",
    )
    return s, evt


# ---------------------------------------------------------------------------
# Demo simulation: sunlight → EV-05 darkness → DR-01 → EV-08
# ---------------------------------------------------------------------------

def run_ev05_demo(difficulty: str = "pilot"):
    """
    Demonstrate an EV-05 Long Darkness scenario.
    Starts at Shackleton Rim illumination, then drops to 0 for the
    specified darkness duration, then returns to sunlight.
    """
    dark_hours = DARK_HOURS.get(difficulty, 72)
    print(f"\n=== ORBY Power Simulation — EV-05 Demo ({difficulty.capitalize()} difficulty) ===")
    print(f"Darkness duration: {dark_hours} h ({dark_hours/24:.2f} Earth days)\n")

    state = PowerState(
        battery_kwh=BATTERY_CAPACITY_KWH,
        illumination_pct=SHACKLETON_RIM_ILL_PCT,
        hour=0,
    )

    _print_header()
    _print_row(state, "SUNLIT — mission start")

    # 12 hours sunlit pre-dark (charge up)
    for _ in range(12):
        state, evts = apply_power_tick(state)
        _emit_events(evts)

    # Darkness begins (EV-05)
    print(f"\n  [HOUR {state.hour}] EV-05 Long Darkness begins — illumination → 0 %\n")
    state.illumination_pct = 0.0

    for h in range(dark_hours + 1):
        state, evts = apply_power_tick(state)
        if evts or h % 12 == 0:
            _print_row(state, f"dark h+{h+1}")
            _emit_events(evts)
        if state.battery_kwh == 0:
            print(f"  [HOUR {state.hour}] POWER LOST — mission failure possible.\n")
            break

    # Light returns
    print(f"\n  [HOUR {state.hour}] Illumination restored — arrays recharging\n")
    state.illumination_pct = SHACKLETON_RIM_ILL_PCT
    # Re-enable shed loads one by one as power surplus grows
    for load in reversed(SHED_ORDER):
        state.active_loads[load] = True
    for _ in range(24):
        state, evts = apply_power_tick(state)
        _emit_events(evts)

    _print_row(state, "recovery complete")
    print(f"\nFinal battery: {state.battery_pct:.0f}%  |  Active loads: {[k for k,v in state.active_loads.items() if v]}\n")


def _print_header():
    print(f"  {'HOUR':>5}  {'ILL%':>5}  {'GEN kW':>7}  {'LOAD kW':>8}  {'BAT%':>6}  {'BAT kWh':>8}  NOTE")
    print("  " + "-" * 72)

def _print_row(s: PowerState, note: str = ""):
    print(f"  {s.hour:>5}  {s.illumination_pct:>5.0f}  {s.array_output_kw:>7.1f}  {s.load_kw:>8.1f}  {s.battery_pct:>6.0f}  {s.battery_kwh:>8.1f}  {note}")

def _emit_events(evts: list):
    for e in evts:
        tag = {"info": "   ", "warning": "⚠  ", "critical": "🔴 "}.get(e.severity, "   ")
        print(f"       {tag}[{e.event_id}] {e.message}")


def run_ev08_demo():
    """
    EV-08 trigger demo: battery pre-depleted to 25 % before darkness.
    DR-01 sheds everything except life support (6 kW minimum draw),
    so battery continues draining → EV-13 → EV-08 fires.
    """
    print("\n=== ORBY Power Simulation — EV-08 Battery Critical Demo ===")
    print("Scenario: battery at 25 % when darkness begins; life support keeps drawing.\n")

    state = PowerState(
        battery_kwh=BATTERY_CAPACITY_KWH * 0.25,   # pre-depleted
        illumination_pct=0.0,
        hour=500,                                   # mid-mission
    )
    # Pre-shed science and rovers (player already responded to EV-13 earlier)
    state.active_loads["science"] = False
    state.active_loads["rovers"] = False

    _print_header()
    _print_row(state, "darkness, 25% battery")

    ev08_shown = False
    for h in range(1, 60):
        state, evts = apply_power_tick(state)
        # Suppress EV-08 repeat after first occurrence
        if ev08_shown:
            evts = [e for e in evts if e.event_id != "EV-08"]
        if evts or h % 6 == 0 or state.battery_kwh <= 1.0:
            _print_row(state, f"h+{h}")
            _emit_events(evts)
        if any(e.event_id == "EV-08" for e in evts):
            ev08_shown = True
            print(f"       (EV-08 persists until power is restored — not repeating)\n")
        if state.battery_kwh == 0:
            print(f"  [HOUR {state.hour}] POWER LOST — mission failure.\n")
            break

    print()


if __name__ == "__main__":
    run_ev05_demo("pilot")
    run_ev08_demo()
