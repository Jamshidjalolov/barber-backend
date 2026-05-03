from __future__ import annotations

from pathlib import Path

backend_app = Path(__file__).resolve().parents[1] / "backend" / "app"
if backend_app.exists():
    __path__.append(str(backend_app))
