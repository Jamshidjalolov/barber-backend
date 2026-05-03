#!/usr/bin/env bash
set -euo pipefail

echo "Starting root backend entrypoint with Poetry"
exec poetry run python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
