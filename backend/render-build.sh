#!/usr/bin/env bash
set -euo pipefail

echo "Python: $(python --version 2>&1 || true)"
echo "Poetry: $(poetry --version)"

poetry config virtualenvs.create true --local
poetry config virtualenvs.in-project true --local
poetry install --no-root

VENV_PATH="$(poetry env info -p 2>/dev/null || true)"
if [ -n "$VENV_PATH" ] && [ "$VENV_PATH" != "$PWD/.venv" ]; then
  rm -rf .venv
  ln -s "$VENV_PATH" .venv
fi

if [ ! -x .venv/bin/python ]; then
  if [ -x .venv/bin/python3 ]; then
    ln -sf python3 .venv/bin/python
  else
    PYTHON_BIN="$(poetry run python -c 'import sys; print(sys.executable)')"
    mkdir -p .venv/bin
    ln -sf "$PYTHON_BIN" .venv/bin/python
  fi
fi

.venv/bin/python -c "import fastapi, uvicorn; print('Render Python OK')"
