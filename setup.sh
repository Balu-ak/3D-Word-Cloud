#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Setting up backend environment..."

# Create the backend virtual environment once, then reuse it on later runs.
if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
fi

# Activate the backend environment and install Python dependencies.
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt"

echo "Setting up frontend dependencies..."

# Install frontend dependencies with npm.
cd "$FRONTEND_DIR"
npm install

echo
echo "Starting development servers..."
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo

# Start the FastAPI backend with the backend virtual environment active.
cd "$BACKEND_DIR"
uvicorn app.main:app --reload &
BACKEND_PID=$!

# Start the Vite frontend in a separate background process.
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

wait "$BACKEND_PID" "$FRONTEND_PID"
