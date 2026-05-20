"""Socket.IO broadcast helpers."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Optional

if TYPE_CHECKING:
    import socketio

_sio: Optional["socketio.AsyncServer"] = None


def set_socket_server(sio: "socketio.AsyncServer") -> None:
    global _sio
    _sio = sio


def _dump(model: Any) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump(mode="json")
    return dict(model)


async def emit_crisis_new(event: Any) -> None:
    if _sio:
        await _sio.emit("crisis:new", _dump(event))


async def emit_crisis_updated(event: Any) -> None:
    if _sio:
        await _sio.emit("crisis:updated", _dump(event))


async def emit_crisis_resolved(crisis_id: str) -> None:
    if _sio:
        await _sio.emit("crisis:resolved", {"crisisId": crisis_id})


async def emit_score_updated(crisis_id: str, score: float) -> None:
    if _sio:
        await _sio.emit("score:updated", {"crisisId": crisis_id, "score": score})


async def emit_commander_approval_required(crisis_id: str, event_id: str) -> None:
    if _sio:
        await _sio.emit(
            "commander:approval_required",
            {"crisisId": crisis_id, "eventId": event_id},
        )
