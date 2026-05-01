from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.realtime import make_channel, realtime_broker

router = APIRouter(prefix="/realtime", tags=["realtime"])


@router.websocket("/ws/{role}/{subject_id}")
async def realtime_socket(websocket: WebSocket, role: str, subject_id: str) -> None:
    channel = make_channel(role, subject_id)
    await realtime_broker.connect(channel, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        realtime_broker.disconnect(channel, websocket)
