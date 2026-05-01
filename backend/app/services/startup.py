from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from alembic import command
from alembic.config import Config

from app.core.database import SessionLocal
from app.services.seed import seed_demo_data

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[2]
ALEMBIC_INI = BACKEND_DIR / "alembic.ini"


def run_migrations() -> None:
    config = Config(str(ALEMBIC_INI))
    command.upgrade(config, "head")


async def run_database_startup_jobs() -> None:
    while True:
        try:
            await asyncio.to_thread(run_migrations)
            async with SessionLocal() as session:
                await seed_demo_data(session)
            logger.info("Database startup jobs completed")
            return
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Database startup jobs failed; retrying")
            await asyncio.sleep(10)
