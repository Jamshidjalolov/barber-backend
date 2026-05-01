from __future__ import annotations

from collections import defaultdict
from typing import Any

from fastapi import WebSocket


class RealtimeBroker:
    def __init__(self) -> None:
        self._channels: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, channel: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._channels[channel].add(websocket)

    def disconnect(self, channel: str, websocket: WebSocket) -> None:
        if channel not in self._channels:
            return
        self._channels[channel].discard(websocket)
        if not self._channels[channel]:
            self._channels.pop(channel, None)

    async def publish(self, channel: str, payload: dict[str, Any]) -> None:
        listeners = list(self._channels.get(channel, set()))
        dead_connections: list[WebSocket] = []

        for websocket in listeners:
            try:
                await websocket.send_json(payload)
            except Exception:
                dead_connections.append(websocket)

        for websocket in dead_connections:
            self.disconnect(channel, websocket)


def make_channel(role: str, subject_id: str) -> str:
    return f"{role}:{subject_id}"


realtime_broker = RealtimeBroker()
