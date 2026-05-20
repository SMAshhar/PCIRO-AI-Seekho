"""API schemas aligned with the React Native mobile app (`apps/mobile/src/types/models.ts`)."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class CrisisType(str, Enum):
    FLOOD = "flood"
    FIRE = "fire"
    HEATWAVE = "heatwave"
    ROAD_BLOCKAGE = "road_blockage"
    POWER_OUTAGE = "power_outage"
    AIR_QUALITY = "air_quality"
    FLASH_FLOOD = "flash_flood"
    EARTHQUAKE = "earthquake"
    TRAFFIC_GRIDLOCK = "traffic_gridlock"
    SEWAGE_OVERFLOW = "sewage_overflow"
    UNKNOWN = "unknown"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CrisisStatus(str, Enum):
    ACTIVE = "active"
    AWAITING_APPROVAL = "awaiting_approval"
    RESOLVED = "resolved"
    ARCHIVED = "archived"


class AgentStatus(str, Enum):
    DONE = "done"
    ACTIVE = "active"
    PENDING = "pending"
    FAILED = "failed"


class CrisisLocation(BaseModel):
    lat: float
    lon: float
    sector: str
    address: Optional[str] = None


class AgentStep(BaseModel):
    agent_name: str
    status: AgentStatus
    icon: Optional[str] = None
    timestamp_offset_ms: Optional[int] = None
    summary: Optional[str] = None
    raw_output: Optional[str] = None


class CorroborationSourceOut(BaseModel):
    source_name: str
    data_summary: Optional[str] = None
    score_contribution: float
    max_score: float
    is_corroborating: bool


class ImpactAssessmentOut(BaseModel):
    affected_population: int = 0
    affected_sectors: list[str] = Field(default_factory=list)
    zone_geojson: Optional[dict[str, Any]] = None
    infrastructure_at_risk: list[str] = Field(default_factory=list)
    recommended_resources: list[str] = Field(default_factory=list)
    estimated_response_time_min: int = 0


class SimulationMetricOut(BaseModel):
    label: str
    before: str
    after: str
    improved: bool


class CrisisEventOut(BaseModel):
    event_id: str
    crisis_type: CrisisType
    title: str
    sector: str
    location: CrisisLocation
    severity: Severity
    corroboration_score: float
    status: CrisisStatus
    ingest_timestamp: str
    summary: Optional[str] = None
    sources: list[CorroborationSourceOut] = Field(default_factory=list)
    impact_assessment: Optional[ImpactAssessmentOut] = None
    agent_trace: list[AgentStep] = Field(default_factory=list)
    simulation_metrics: list[SimulationMetricOut] = Field(default_factory=list)
    proposed_actions: list[str] = Field(default_factory=list)
    confidence: Optional[float] = None
    trace_id: Optional[str] = None
    alert_message: Optional[str] = None


class ReportCreate(BaseModel):
    text: str
    crisis_type: CrisisType
    location: CrisisLocation
    photo_url: Optional[str] = None
    device_id: str


class ReportResponse(BaseModel):
    report_id: str
    event_id: str
    status: str = "processing"


class CommanderAction(BaseModel):
    eventId: str
    note: Optional[str] = None
    reason: Optional[str] = None


class CommanderResponse(BaseModel):
    ok: bool = True
    event_id: str


class DeviceRegister(BaseModel):
    device_id: str
    fcm_token: Optional[str] = None
    sectors: list[str] = Field(default_factory=list)
    role: str = "citizen"


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    crises_count: int = 0
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
