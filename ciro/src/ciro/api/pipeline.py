"""Process citizen reports into mobile-shaped crisis events using CIRO tools."""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime
from typing import Any

from ciro.api.schemas import (
    AgentStatus,
    AgentStep,
    CorroborationSourceOut,
    CrisisEventOut,
    CrisisLocation,
    CrisisStatus,
    CrisisType,
    ImpactAssessmentOut,
    ReportCreate,
    Severity,
    SimulationMetricOut,
)
from ciro.tools.alert_dispatcher import alert_dispatcher
from ciro.tools.corroboration_engine import corroboration_engine
from ciro.tools.impact_assessor import impact_assessor
from ciro.tools.roman_urdu_parser import roman_urdu_parser
from ciro.tools.weather_fetcher import weather_fetcher

SOURCE_MAX_SCORES = {
    "Weather API (Open-Meteo)": 30,
    "Traffic Data": 25,
    "Citizen Reports": 20,
    "IoT Sensors": 15,
    "Historical Patterns": 10,
}


def _run_tool(tool_fn: Any, **kwargs: Any) -> dict[str, Any]:
    raw = tool_fn.run(**kwargs) if hasattr(tool_fn, "run") else tool_fn(**kwargs)
    if isinstance(raw, str):
        return json.loads(raw)
    return raw


def _sector_polygon(lat: float, lon: float, delta: float = 0.015) -> dict[str, Any]:
    return {
        "type": "Polygon",
        "coordinates": [
            [
                [lon - delta, lat + delta],
                [lon + delta, lat + delta],
                [lon + delta, lat - delta],
                [lon - delta, lat - delta],
                [lon - delta, lat + delta],
            ]
        ],
    }


def _map_severity(score: float, corr_severity: str) -> Severity:
    if score >= 85:
        return Severity.CRITICAL
    mapping = {
        "critical": Severity.CRITICAL,
        "high": Severity.HIGH,
        "medium": Severity.MEDIUM,
        "low": Severity.LOW,
    }
    return mapping.get(corr_severity, Severity.MEDIUM)


def _build_agent_trace(
    parsed: dict[str, Any],
    corr: dict[str, Any],
    impact: dict[str, Any],
    dispatch: dict[str, Any],
    awaiting_approval: bool,
) -> list[AgentStep]:
    steps = [
        AgentStep(
            agent_name="Roman Urdu NLP",
            status=AgentStatus.DONE,
            timestamp_offset_ms=8000,
            summary=f"Parsed intent: {parsed.get('parsed_intent')} · confidence {parsed.get('confidence')}",
            raw_output=json.dumps(parsed, ensure_ascii=False, indent=2),
        ),
        AgentStep(
            agent_name="Data Normalizer",
            status=AgentStatus.DONE,
            timestamp_offset_ms=14000,
            summary="Signal normalized and geocoded",
        ),
        AgentStep(
            agent_name="Signal Corroborator",
            status=AgentStatus.DONE,
            timestamp_offset_ms=22000,
            summary=f"Corroboration score: {corr.get('corroboration_score')}/100",
            raw_output=json.dumps(corr, indent=2),
        ),
        AgentStep(
            agent_name="Event Detector",
            status=AgentStatus.DONE,
            timestamp_offset_ms=28000,
            summary=f"Severity: {corr.get('severity')} · verified={corr.get('is_verified')}",
        ),
        AgentStep(
            agent_name="Impact Assessor",
            status=AgentStatus.DONE,
            timestamp_offset_ms=35000,
            summary=impact.get("summary", "Impact assessed"),
            raw_output=json.dumps(impact, indent=2),
        ),
        AgentStep(
            agent_name="Response Planner",
            status=AgentStatus.PENDING if awaiting_approval else AgentStatus.DONE,
            timestamp_offset_ms=42000,
            summary="Awaiting commander approval" if awaiting_approval else "Response plan ready",
        ),
        AgentStep(
            agent_name="Logistics Dispatcher",
            status=AgentStatus.PENDING if awaiting_approval else AgentStatus.DONE,
            summary=dispatch.get("summary", "Dispatch pending"),
        ),
    ]
    return steps


def process_report(payload: ReportCreate, event_id: str | None = None) -> CrisisEventOut:
    """Run the CIRO tool pipeline and return a mobile-compatible crisis event."""
    event_id = event_id or str(uuid.uuid4())
    trace_id = f"ag-trace-{datetime.utcnow().strftime('%Y-%m-%d')}-{event_id[:8]}"
    loc = payload.location
    sector = loc.sector or "Unknown"

    parsed = _run_tool(roman_urdu_parser, report_text=payload.text)
    crisis_type_str = payload.crisis_type.value if payload.crisis_type != CrisisType.UNKNOWN else parsed.get(
        "parsed_intent", "unknown"
    )
    try:
        crisis_type = CrisisType(crisis_type_str)
    except ValueError:
        crisis_type = CrisisType.UNKNOWN

    weather = _run_tool(weather_fetcher, latitude=loc.lat, longitude=loc.lon)
    num_similar = int(os.getenv("CIRO_SIMILAR_REPORTS", "3"))

    corr = _run_tool(
        corroboration_engine,
        crisis_type=crisis_type.value,
        location_lat=loc.lat,
        location_lon=loc.lon,
        citizen_report_text=payload.text,
        weather_data=json.dumps(weather),
        num_similar_reports=num_similar,
        sector=sector,
    )

    score = float(corr.get("corroboration_score", 0))
    severity = _map_severity(score, corr.get("severity", "medium"))
    awaiting = score >= 80 and not corr.get("is_false_report", False)

    impact = _run_tool(
        impact_assessor,
        crisis_type=crisis_type.value,
        sector=sector,
        severity=severity.value,
    )

    dispatch = _run_tool(
        alert_dispatcher,
        crisis_type=crisis_type.value,
        sector=sector,
        severity=severity.value,
        affected_population=int(impact.get("affected_population", 0)),
        alert_message=f"Emergency: {crisis_type.value.replace('_', ' ')} reported in {sector}",
    )

    sources = []
    for s in corr.get("sources", []):
        name = s.get("source_name", "Unknown")
        sources.append(
            CorroborationSourceOut(
                source_name=name,
                data_summary=s.get("data_summary"),
                score_contribution=float(s.get("score_contribution", 0)),
                max_score=float(SOURCE_MAX_SCORES.get(name, 10)),
                is_corroborating=bool(s.get("is_corroborating", False)),
            )
        )

    simulation_metrics = [
        SimulationMetricOut(
            label=m.get("metric_name", ""),
            before=m.get("before_value", ""),
            after=m.get("after_value", ""),
            improved=float(m.get("improvement_percent", 0)) > 0,
        )
        for m in dispatch.get("simulation_metrics", [])
    ]

    proposed_actions = [
        a.get("description", "") for a in dispatch.get("actions_taken", []) if a.get("description")
    ]

    if corr.get("is_false_report"):
        status = CrisisStatus.ARCHIVED
    elif awaiting:
        status = CrisisStatus.AWAITING_APPROVAL
    else:
        status = CrisisStatus.ACTIVE

    report_description = payload.text.strip()
    title = report_description

    return CrisisEventOut(
        event_id=event_id,
        crisis_type=crisis_type,
        title=title,
        report_description=report_description,
        sector=sector,
        location=CrisisLocation(lat=loc.lat, lon=loc.lon, sector=sector),
        severity=severity,
        corroboration_score=score,
        status=status,
        ingest_timestamp=datetime.utcnow().isoformat() + "Z",
        summary=corr.get("summary", payload.text[:120]),
        sources=sources,
        impact_assessment=ImpactAssessmentOut(
            affected_population=int(impact.get("affected_population", 0)),
            affected_sectors=impact.get("affected_sectors", [sector]),
            zone_geojson=_sector_polygon(loc.lat, loc.lon),
            infrastructure_at_risk=impact.get("infrastructure_at_risk", []),
            recommended_resources=impact.get("recommended_resources", []),
            estimated_response_time_min=int(impact.get("estimated_response_time_min", 30)),
        ),
        agent_trace=_build_agent_trace(parsed, corr, impact, dispatch, awaiting),
        simulation_metrics=simulation_metrics,
        proposed_actions=proposed_actions,
        confidence=float(parsed.get("confidence", 0.5)),
        trace_id=trace_id,
        alert_message=dispatch.get("alert_message"),
    )
