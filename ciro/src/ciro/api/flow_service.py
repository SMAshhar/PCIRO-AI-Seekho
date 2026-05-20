"""Optional full CrewAI flow execution (slower; requires LLM)."""

from __future__ import annotations

import os
from concurrent.futures import ThreadPoolExecutor

from ciro.api.pipeline import process_report
from ciro.api.schemas import ReportCreate

_executor = ThreadPoolExecutor(max_workers=int(os.getenv("CIRO_FLOW_WORKERS", "2")))


def _run_crew_flow(payload: ReportCreate, event_id: str) -> None:
    """Run CrewAI flow; falls back to tool pipeline on failure."""
    trigger = {
        "text": payload.text,
        "lat": payload.location.lat,
        "lon": payload.location.lon,
        "sector": payload.location.sector,
        "crisis_type": payload.crisis_type.value,
        "device_id": payload.device_id,
        "event_id": event_id,
    }
    try:
        from ciro.main import CIROFlow
        flow = CIROFlow()
        flow.kickoff({"crewai_trigger_payload": trigger})
    except Exception:
        pass


def use_crew_flow() -> bool:
    return os.getenv("CIRO_USE_CREW", "").lower() in ("1", "true", "yes")


def submit_flow_async(payload: ReportCreate, event_id: str) -> None:
    if use_crew_flow():
        _executor.submit(_run_crew_flow, payload, event_id)
