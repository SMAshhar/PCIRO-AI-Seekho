"""FastAPI routes for the CIRO mobile app."""

from __future__ import annotations

import asyncio
import json
import os
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ciro.api import events
from ciro.api.flow_service import submit_flow_async
from ciro.api.pipeline import process_report
from ciro.api.schemas import (
    CommanderAction,
    CommanderResponse,
    CrisisEventOut,
    CrisisStatus,
    DeviceRegister,
    HealthResponse,
    ReportCreate,
    ReportResponse,
)
from ciro.api.store import crisis_store

router = APIRouter()
UPLOAD_DIR = Path(os.getenv("CIRO_UPLOAD_DIR", "data/uploads"))


async def _handle_report(payload: ReportCreate, event_id: str, *, is_new: bool) -> None:
    event = await asyncio.to_thread(process_report, payload, event_id)
    crisis_store.upsert(event)
    if is_new:
        await events.emit_crisis_new(event)
    else:
        await events.emit_crisis_updated(event)
    if event.status == CrisisStatus.AWAITING_APPROVAL:
        await events.emit_commander_approval_required(event.event_id, event.event_id)
    submit_flow_async(payload, event_id)


def _seed_demo_if_empty() -> None:
    if crisis_store.count() > 0 or os.getenv("CIRO_SEED_DEMO", "true").lower() == "false":
        return
    try:
        from ciro.api.schemas import CrisisLocation, CrisisType

        demo = ReportCreate(
            text="G-10 mein pani bhar gaya, road band hai",
            crisis_type=CrisisType.FLOOD,
            location=CrisisLocation(lat=33.6844, lon=73.0479, sector="G-10"),
            device_id="seed-demo",
        )
        event = process_report(demo)
        crisis_store.upsert(event)
    except Exception:
        pass


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(crises_count=crisis_store.count())


@router.get("/api/crises", response_model=list[CrisisEventOut])
async def list_crises() -> list[CrisisEventOut]:
    return crisis_store.list_active()


@router.get("/api/crises/{event_id}", response_model=CrisisEventOut)
async def get_crisis(event_id: str) -> CrisisEventOut:
    event = crisis_store.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Crisis not found")
    return event


@router.get("/api/crises/{event_id}/trace")
async def get_trace(event_id: str) -> JSONResponse:
    event = crisis_store.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Crisis not found")
    trace = [s.model_dump(mode="json") for s in event.agent_trace]
    return JSONResponse(content=json.dumps(trace, indent=2))


@router.get("/api/crises/{event_id}/simulation")
async def get_simulation(event_id: str) -> list[dict[str, Any]]:
    event = crisis_store.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Crisis not found")
    return [m.model_dump(mode="json") for m in event.simulation_metrics]


@router.post("/api/reports", response_model=ReportResponse)
async def submit_report(
    payload: ReportCreate,
    background_tasks: BackgroundTasks,
) -> ReportResponse:
    event_id = str(uuid.uuid4())
    background_tasks.add_task(_handle_report, payload, event_id, is_new=True)
    return ReportResponse(report_id=event_id, event_id=event_id, status="processing")


@router.post("/api/reports/upload")
async def upload_photo(file: UploadFile) -> dict[str, str]:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename or "photo.jpg").suffix or ".jpg"
    name = f"{uuid.uuid4().hex}{ext}"
    path = UPLOAD_DIR / name
    content = await file.read()
    path.write_bytes(content)
    base = os.getenv("CIRO_PUBLIC_URL", "http://localhost:8000")
    return {"photo_url": f"{base}/uploads/{name}"}


@router.post("/api/commander/approve", response_model=CommanderResponse)
async def commander_approve(body: CommanderAction) -> CommanderResponse:
    event = crisis_store.get(body.eventId)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    updated = event.model_copy(
        update={
            "status": CrisisStatus.ACTIVE,
            "summary": (event.summary or "") + f" | Approved: {body.note or 'OK'}",
        }
    )
    crisis_store.upsert(updated)
    await events.emit_crisis_updated(updated)
    return CommanderResponse(event_id=body.eventId)


@router.post("/api/commander/reject", response_model=CommanderResponse)
async def commander_reject(body: CommanderAction) -> CommanderResponse:
    event = crisis_store.get(body.eventId)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    updated = event.model_copy(
        update={
            "status": CrisisStatus.ARCHIVED,
            "summary": (event.summary or "") + f" | Rejected: {body.reason or body.note or 'N/A'}",
        }
    )
    crisis_store.upsert(updated)
    await events.emit_crisis_resolved(body.eventId)
    return CommanderResponse(event_id=body.eventId)


@router.post("/api/devices/register")
async def register_device(body: DeviceRegister) -> dict[str, str]:
    return {"status": "registered", "device_id": body.device_id}


def create_fastapi_app() -> FastAPI:
    app = FastAPI(
        title="CIRO API",
        description="Crisis Intelligence & Response Orchestrator — mobile backend",
        version="1.0.0",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=os.getenv("CIRO_CORS_ORIGINS", "*").split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router)

    @app.on_event("startup")
    async def on_startup() -> None:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        _seed_demo_if_empty()

    return app
