#!/usr/bin/env bash
set -euo pipefail

echo "Starting backend with Poetry"
poetry run python -c "import asyncio; from app.core.config import settings; from app.services.startup import run_database_startup_jobs; asyncio.run(run_database_startup_jobs(settings.database_startup_max_attempts))"
exec poetry run python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
