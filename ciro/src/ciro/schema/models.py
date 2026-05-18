"""
CIRO Pydantic Models — Canonical schemas for typed agent handoffs.

These models define the data contracts between agents. Every agent
reads from and writes to these schemas, ensuring type safety and
making the pipeline fully traceable.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ─── Enums ───────────────────────────────────────────────────────────

class CrisisType(str, Enum):
    FLOOD = "flood"
    ROAD_BLOCKAGE = "road_blockage"
    HEATWAVE = "heatwave"
    FLASH_FLOOD = "flash_flood"
    POWER_OUTAGE = "power_outage"
    AIR_QUALITY = "air_quality"
    ROAD_COLLAPSE = "road_collapse"
    FIRE = "fire"
    TRAFFIC_GRIDLOCK = "traffic_gridlock"
    SEWAGE_OVERFLOW = "sewage_overflow"
    EARTHQUAKE = "earthquake"
    UNKNOWN = "unknown"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SignalSource(str, Enum):
    CITIZEN_APP = "citizen_app"
    WEATHER_API = "weather_api"
    TRAFFIC_API = "traffic_api"
    SENSOR = "sensor"
    SOCIAL_MEDIA = "social_media"
    OFFICIAL_REPORT = "official_report"


# ─── Core Models ─────────────────────────────────────────────────────

class Location(BaseModel):
    """GPS coordinates with optional sector/zone identifier."""
    lat: float = Field(..., description="Latitude")
    lon: float = Field(..., description="Longitude")
    sector: Optional[str] = Field(None, description="Islamabad sector e.g. G-10/2")
    address: Optional[str] = Field(None, description="Human-readable address")


class CrisisReport(BaseModel):
    """Raw input from mobile app / API — the starting point of the pipeline."""
    report_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str = Field(..., description="Citizen report text, may be Roman Urdu")
    location: Location
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    source: SignalSource = SignalSource.CITIZEN_APP
    reporter_id: Optional[str] = Field(None, description="Anonymous reporter hash")


class Signal(BaseModel):
    """A single data signal from any source — weather, traffic, citizen, sensor."""
    signal_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: SignalSource
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    location: Location
    raw_data: str = Field(..., description="Raw text or JSON string from source")
    signal_type: Optional[str] = Field(None, description="Type hint from source")


class NormalizedSignal(BaseModel):
    """Output of the Ingest Crew — parsed, geocoded, intent-classified."""
    signal_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    original_text: str = Field(..., description="Original text from report")
    parsed_intent: CrisisType = Field(..., description="Classified crisis type")
    extracted_location: Location
    language_detected: str = Field("roman_urdu", description="Detected language")
    keywords: list[str] = Field(default_factory=list, description="Extracted keywords")
    confidence: float = Field(0.0, ge=0.0, le=1.0, description="NLP confidence score")
    source: SignalSource = SignalSource.CITIZEN_APP
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class CorroborationSource(BaseModel):
    """Individual source contribution to corroboration score."""
    source_name: str
    data_summary: str
    score_contribution: float = Field(0.0, description="Points contributed (0-30)")
    is_corroborating: bool = False


class CorroboratedEvent(BaseModel):
    """Output of the Analysis Crew — verified, scored, classified event."""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    crisis_type: CrisisType
    location: Location
    severity: Severity = Severity.LOW
    corroboration_score: float = Field(0.0, ge=0.0, le=100.0,
                                        description="Multi-signal confidence 0-100")
    sources: list[CorroborationSource] = Field(default_factory=list)
    is_verified: bool = Field(False, description="True if score >= threshold")
    is_false_report: bool = Field(False, description="True if flagged as manipulation")
    false_report_reason: Optional[str] = None
    affected_population: int = Field(0, description="Estimated affected people")
    affected_zone_radius_km: float = Field(0.0, description="Impact radius in km")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    summary: str = Field("", description="Human-readable event summary")


class ImpactAssessment(BaseModel):
    """Detailed impact analysis for a corroborated event."""
    event_id: str
    crisis_type: CrisisType
    severity: Severity
    affected_sectors: list[str] = Field(default_factory=list,
                                         description="List of affected Islamabad sectors")
    affected_population: int = 0
    infrastructure_at_risk: list[str] = Field(default_factory=list,
                                               description="Roads, hospitals, schools etc.")
    recommended_resources: list[str] = Field(default_factory=list)
    estimated_response_time_min: int = 0
    risk_level: str = Field("low", description="overall risk: low/medium/high/critical")


class ActionItem(BaseModel):
    """A single action in the response plan."""
    action_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action_type: str = Field(..., description="e.g. dispatch_rescue, send_alert, block_road")
    description: str
    assigned_to: str = Field("", description="Agency or team responsible")
    priority: int = Field(1, ge=1, le=5, description="1=highest, 5=lowest")
    estimated_time_min: int = 0
    status: str = Field("pending", description="pending/in_progress/completed")


class SimulationMetrics(BaseModel):
    """Before/After metrics for action simulation."""
    metric_name: str
    before_value: str
    after_value: str
    improvement_percent: float = 0.0


class ActionPlan(BaseModel):
    """Output of the Response Crew — full response plan with simulated actions."""
    plan_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    crisis_type: CrisisType
    severity: Severity
    actions: list[ActionItem] = Field(default_factory=list)
    simulation_metrics: list[SimulationMetrics] = Field(default_factory=list)
    requires_approval: bool = Field(False,
                                     description="True for critical events needing HIL")
    approved: bool = False
    approved_by: Optional[str] = None
    total_estimated_time_min: int = 0
    alert_message: str = Field("", description="Message to broadcast to affected area")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
