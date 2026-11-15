#!/usr/bin/env bash
# ORBY dev launcher — starts frontend (port 3005) + backend (port 8000)
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Install frontend dependencies if needed
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "→ Installing frontend dependencies..."
  cd "$ROOT/frontend" && npm install
fi

# Install Python dependencies if needed (into a .venv)
if [ ! -d "$ROOT/.venv" ]; then
  echo "→ Creating Python virtual environment..."
  python3 -m venv "$ROOT/.venv"
  "$ROOT/.venv/bin/pip" install -q -r "$ROOT/backend/requirements.txt"
fi

# Activate venv for the backend process
export PATH="$ROOT/.venv/bin:$PATH"

echo ""
echo "  ORBY Dev Stack"
echo "  Frontend  → http://localhost:3005"
echo "  Backend   → http://localhost:8000/docs"
echo ""

# Launch both concurrently
cd "$ROOT"
npm run dev
