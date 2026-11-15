"""
ORBY CSV Audit & Cleaning Pipeline
Scans all LSDS-8_*, OSD-655_*, and lunar_radiation.csv in
./orby-mission-trainer/data/, prints a summary, and exports:
  ./data_audit/AUDIT_<name>.csv  — headers, dtypes, missing counts
  ./data_audit/CLEAN_<name>.csv  — trimmed, 100%-empty rows/cols dropped

RULE: Never invent, fill, or interpolate missing scientific measurements.
"""

import os
import sys
import re
from pathlib import Path

import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "orby-mission-trainer" / "data"
AUDIT_DIR = PROJECT_ROOT / "data_audit"

PATTERNS = [
    "LSDS-8_*.csv",
    "OSD-655_*.csv",
    "lunar_radiation.csv",
]

# ---------------------------------------------------------------------------
# File discovery
# ---------------------------------------------------------------------------

def collect_files() -> list[Path]:
    found = []
    for pat in PATTERNS:
        found.extend(sorted(DATA_DIR.glob(pat)))
    return found


# ---------------------------------------------------------------------------
# Audit one CSV
# ---------------------------------------------------------------------------

def audit_csv(path: Path) -> pd.DataFrame:
    """
    Returns a tidy audit DataFrame with one row per column:
      column, dtype, non_null, null_count, null_pct
    """
    df = _read_csv_safe(path)
    rows, cols = df.shape
    records = []
    for col in df.columns:
        null_count = int(df[col].isna().sum())
        records.append({
            "column": col,
            "dtype": str(df[col].dtype),
            "non_null": rows - null_count,
            "null_count": null_count,
            "null_pct": round(100.0 * null_count / rows, 1) if rows else 0.0,
        })
    audit_df = pd.DataFrame(records)
    return audit_df


# ---------------------------------------------------------------------------
# Clean one CSV
# ---------------------------------------------------------------------------

def clean_csv(path: Path) -> pd.DataFrame:
    """
    Returns cleaned DataFrame:
    - Strips leading/trailing whitespace from string cells
    - Drops columns that are 100 % null
    - Drops rows that are 100 % null
    DOES NOT fill, interpolate, or fabricate any missing values.
    """
    df = _read_csv_safe(path)

    # Trim whitespace in object (string) columns
    str_cols = df.select_dtypes(include=["object", "str"]).columns
    for col in str_cols:
        df[col] = df[col].str.strip()

    # Drop 100%-empty columns
    before_cols = df.shape[1]
    df = df.dropna(axis=1, how="all")
    dropped_cols = before_cols - df.shape[1]

    # Drop 100%-empty rows
    before_rows = df.shape[0]
    df = df.dropna(axis=0, how="all")
    dropped_rows = before_rows - df.shape[0]

    if dropped_cols:
        print(f"    Dropped {dropped_cols} fully-empty column(s).")
    if dropped_rows:
        print(f"    Dropped {dropped_rows} fully-empty row(s).")

    return df


# ---------------------------------------------------------------------------
# CSV reader that handles multi-header / encoding quirks in these files
# ---------------------------------------------------------------------------

def _read_csv_safe(path: Path) -> pd.DataFrame:
    """
    Read a CSV tolerating:
    - UTF-8-BOM (OSD-655 EvePanel has ﻿ BOM)
    - Sparse multi-header rows (OSD-655 FlightWater has two header rows)
    - 'N/A', 'NA', '' all become NaN
    """
    na_values = ["N/A", "NA", "n/a", "na", "", " ", "#REF!"]
    try:
        df = pd.read_csv(
            path,
            encoding="utf-8-sig",   # strips BOM if present
            na_values=na_values,
            dtype=str,              # read all as string to preserve raw values
            on_bad_lines="warn",
            low_memory=False,
        )
    except Exception as exc:
        print(f"    WARNING: could not parse {path.name}: {exc}")
        return pd.DataFrame()
    return df


# ---------------------------------------------------------------------------
# Summary printer
# ---------------------------------------------------------------------------

def print_summary(path: Path, audit_df: pd.DataFrame):
    high_miss = audit_df[audit_df["null_pct"] > 50].sort_values("null_pct", ascending=False)
    total_cols = len(audit_df)
    total_rows = int(audit_df["non_null"].max()) if not audit_df.empty else 0

    print(f"\n{'─'*60}")
    print(f"  FILE : {path.name}")
    print(f"  ROWS : ~{total_rows}  |  COLS : {total_cols}")
    if not audit_df.empty:
        print(f"  COLS WITH >50% MISSING:")
        if high_miss.empty:
            print("    (none)")
        else:
            for _, row in high_miss.iterrows():
                print(f"    {row['column'][:45]:<45}  {row['null_pct']:5.1f}%")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    files = collect_files()
    if not files:
        print(f"No matching CSVs found in {DATA_DIR}")
        sys.exit(1)

    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Audit output directory: {AUDIT_DIR}")
    print(f"Scanning {len(files)} CSV file(s) in {DATA_DIR}\n")

    for path in files:
        stem = re.sub(r"[^A-Za-z0-9_-]", "_", path.stem)

        # Audit
        audit_df = audit_csv(path)
        audit_out = AUDIT_DIR / f"AUDIT_{stem}.csv"
        audit_df.to_csv(audit_out, index=False)

        # Clean
        print(f"  Cleaning {path.name}…")
        clean_df = clean_csv(path)
        clean_out = AUDIT_DIR / f"CLEAN_{stem}.csv"
        clean_df.to_csv(clean_out, index=False)

        # Summary
        print_summary(path, audit_df)

    # Quick check: is OSD-575 "Master Chem" present?
    master_chem_files = [f for f in files if "Master" in f.name or "master" in f.name]
    print(f"\n{'─'*60}")
    if master_chem_files:
        print(f"  Master Chem file(s) found: {[f.name for f in master_chem_files]}")
    else:
        print("  NOTE: No 'Master Chem' file detected in data dir.")
        print("        OSD-575 LSDS-8_* files are the transformed variants only.")

    print(f"\nAll audit exports written to {AUDIT_DIR}/\n")


if __name__ == "__main__":
    main()
