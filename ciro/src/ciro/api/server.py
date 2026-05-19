"""ASGI entry: FastAPI + Socket.IO for the mobile app."""

from __future__ import annotations

import os

import socketio
import uvicorn
from dotenv import load_dotenv

from ciro.api import events
from ciro.api.app import create_fastapi_app

load_dotenv()

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=os.getenv("CIRO_CORS_ORIGINS", "*").split(","),
)
events.set_socket_server(sio)

fastapi_app = create_fastapi_app()
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)


@sio.event
async def connect(sid: str, environ: dict) -> None:
    await sio.emit("connected", {"sid": sid}, to=sid)


@sio.on("subscribe:sector")
async def subscribe_sector(sid: str, data: dict) -> None:
    sectors = data.get("sectors", []) if isinstance(data, dict) else []
    await sio.save_session(sid, {"sectors": sectors})
    await sio.emit("subscribed", {"sectors": sectors}, to=sid)


def main() -> None:
    host = os.getenv("CIRO_HOST", "0.0.0.0")
    port = int(os.getenv("CIRO_PORT", "8000"))
    uvicorn.run(
        "ciro.api.server:app",
        host=host,
        port=port,
        reload=os.getenv("CIRO_RELOAD", "false").lower() == "true",
    )


if __name__ == "__main__":
    main()
