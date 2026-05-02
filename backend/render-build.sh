#!/usr/bin/env bash
set -euo pipefail

poetry config virtualenvs.create true --local
poetry config virtualenvs.in-project true --local
poetry env remove --all || true
poetry install --no-root

test -x .venv/bin/python
