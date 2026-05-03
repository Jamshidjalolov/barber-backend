from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status

from app.api.deps import get_current_user
from app.core.config import BASE_DIR
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOADS_DIR = BASE_DIR / "uploads"
MAX_UPLOAD_BYTES = 12 * 1024 * 1024
ALLOWED_CONTENT_PREFIXES = ("image/", "video/")


def _safe_extension(filename: str, content_type: str) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix and len(suffix) <= 10:
        return suffix
    if content_type.startswith("image/"):
        return f".{content_type.split('/', 1)[1].replace('jpeg', 'jpg')}"
    if content_type.startswith("video/"):
        return f".{content_type.split('/', 1)[1]}"
    return ".bin"


@router.post("/media")
async def upload_media(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    content_type = file.content_type or ""
    if not any(content_type.startswith(prefix) for prefix in ALLOWED_CONTENT_PREFIXES):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Faqat rasm yoki video fayl yuklash mumkin.",
        )

    payload = await file.read()
    if not payload:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Fayl bo'sh.")
    if len(payload) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Fayl hajmi 12 MB dan oshmasin.",
        )

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{current_user.id}-{uuid4().hex}{_safe_extension(file.filename or '', content_type)}"
    target = UPLOADS_DIR / filename
    target.write_bytes(payload)

    base_url = str(request.base_url).rstrip("/")
    return {
        "url": f"{base_url}/uploads/{filename}",
        "content_type": content_type,
        "filename": filename,
    }
