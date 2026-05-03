#!/usr/bin/env bash
set -euo pipefail

echo "Python: $(python --version 2>&1 || true)"
echo "Poetry: $(poetry --version)"

poetry config virtualenvs.create true --local
poetry config virtualenvs.in-project true --local
poetry install --no-root

poetry run python -c "import app.main; print('Root Render Python OK')"
