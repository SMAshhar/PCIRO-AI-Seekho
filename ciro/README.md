# CIRO — Crisis Intelligence & Response Orchestration

A CrewAI-powered agentic system for urban emergency management, designed to handle crisis reports in Roman Urdu from Islamabad citizens and orchestrate an intelligent, multi-stage response.

## Overview

CIRO processes citizen crisis reports through three orchestrated CrewAI crews:

1. **Ingest Crew** — Parses and normalizes unstructured reports (Roman Urdu/English)
2. **Analysis Crew** — Corroborates signals, detects events, assesses impact
3. **Response Crew** — Plans response, generates alerts, dispatches resources

The system flows through a `CIROFlow` that routes events by severity and manages human-in-the-loop approval for critical incidents.

---

## Architecture

```
Citizen Report (Roman Urdu/GPS)
           ↓
    ┌─────────────────┐
    │  Ingest Crew    │  Parse & normalize
    │  2 agents       │  Detect language, crisis type, location
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │ Analysis Crew   │  Verify & assess
    │  3 agents       │  Weather, traffic, sensor cross-reference
    └────────┬────────┘
             ↓
        Severity check
        ├─→ Critical → [Human Approval] → Response
        └─→ Routine  → Response
             ↓
    ┌─────────────────┐
    │ Response Crew   │  Plan & dispatch
    │  2 agents       │  SMS, tickets, resource deploy
    └────────┬────────┘
             ↓
      Alert & Action Plan
```

---

## Crews

### 1. Ingest Crew

**Purpose**: Parse raw citizen reports (often in informal Roman Urdu) and normalize them into a structured, validated signal format.

**Process**:
- Takes raw report text, GPS coordinates, and sector name
- Extracts crisis type, keywords, and location mentions
- Validates and deduplicates with known Islamabad sectors
- Outputs a `NormalizedSignal` ready for analysis

#### Agents

##### a) NLP Parser

| Property | Value |
|----------|-------|
| **Role** | Roman Urdu NLP Crisis Parser |
| **Goal** | Parse citizen crisis reports written in Roman Urdu or English; extract crisis type, location mentions, and key details; classify into known crisis categories |
| **Tools** | `roman_urdu_parser` |
| **Backstory** | Expert in Pakistani languages; understands informal Roman Urdu like "G-10 mein pani bhar gaya" (flooding in G-10) |
| **Reality** | Calls real tool; uses keyword matching + language detection heuristics |

##### b) Data Normalizer

| Property | Value |
|----------|-------|
| **Role** | Crisis Data Normalizer |
| **Goal** | Take parsed output and normalize into standardized signal format with verified GPS, sector ID, crisis type |
| **Tools** | None (uses LLM reasoning only) |
| **Backstory** | Data engineer specializing in emergency systems; ensures clean, deduplicated, consistent formatting |
| **Reality** | Pure LLM reasoning; validates against known Islamabad sectors |

#### Tasks

| Task | Agent | Input | Output |
|------|-------|-------|--------|
| `parse_report_task` | NLP Parser | Report text, lat/lon, sector | JSON: parsed_intent, keywords, detected_sectors, confidence |
| `normalize_signal_task` | Data Normalizer | Parsed data | JSON: signal_id, original_text, parsed_intent, extracted_location, confidence, timestamp |

---

### 2. Analysis Crew

**Purpose**: Verify the crisis report using multiple independent data sources (weather, traffic, citizen counts, sensors, historical patterns) and assign a confidence score. Detect false/manipulated reports. Assess impact.

**Process**:
- Fetches weather data for the location from real Open-Meteo API
- Runs multi-signal corroboration algorithm (max 100 points)
- Classifies severity and flags potential false reports
- Estimates affected population and infrastructure impact

#### Agents

##### a) Signal Corroborator

| Property | Value |
|----------|-------|
| **Role** | Multi-Signal Corroboration Analyst |
| **Goal** | Cross-reference the crisis report against weather data, traffic patterns, citizen reports, sensor readings, and historical patterns; produce corroboration score 0–100; identify false/manipulated reports |
| **Tools** | `weather_fetcher`, `corroboration_engine` |
| **Backstory** | Senior intelligence analyst for Pakistan's NDMA; never trusts a single source; vigilant about false reports |
| **Reality** | Calls real tools with external API (Open-Meteo) + simulated data (traffic, sensor, history) |

##### b) Event Detector

| Property | Value |
|----------|-------|
| **Role** | Crisis Event Detector and Classifier |
| **Goal** | Based on corroboration results, determine if a real crisis event is occurring; classify severity (low/medium/high/critical); produce verified event record |
| **Tools** | None (uses LLM reasoning) |
| **Backstory** | Experienced EOC officer who has managed dozens of real crisis situations; makes classification decisions based on data |
| **Reality** | Pure LLM reasoning; thresholds are: ≥50 score = verified, ≥80 score = critical |

##### c) Impact Assessor Agent

| Property | Value |
|----------|-------|
| **Role** | Impact Assessment Specialist |
| **Goal** | For verified crisis events, estimate impact on the Islamabad sector: affected population, infrastructure at risk, resources needed, response time |
| **Tools** | `impact_assessor` |
| **Backstory** | Urban planning specialist; deep knowledge of Islamabad's sectors, population, hospitals, schools, road networks |
| **Reality** | Calls real tool with hardcoded sector database (realistic data for Islamabad); multiplier adjusts estimates by severity |

#### Tasks

| Task | Agent | Input | Output |
|------|-------|-------|--------|
| `corroboration_task` | Signal Corroborator | Crisis type, lat/lon, sector, report text, num similar reports | JSON: corroboration_score (0–100), severity, is_verified, is_false_report, sources with breakdown |
| `detection_task` | Event Detector | Corroboration results | JSON: event_id, crisis_type, location, severity, corroboration_score, is_verified, summary |
| `impact_assessment_task` | Impact Assessor Agent | Crisis type, sector, severity | JSON: affected_population, affected_sectors, infrastructure_at_risk, recommended_resources, response time |

---

### 3. Response Crew

**Purpose**: Create and execute an actionable response plan for a verified crisis event. Generate alerts, dispatch resources, create tracking tickets.

**Process**:
- Takes the verified event + impact assessment
- Plans response actions (dispatch teams, block roads, send alerts)
- Generates alert message in English and Roman Urdu
- Determines if Incident Commander approval is needed (critical events)
- Simulates expected Before/After metrics
- Dispatches alerts through appropriate channels

#### Agents

##### a) Response Planner

| Property | Value |
|----------|-------|
| **Role** | Emergency Response Planner |
| **Goal** | Create comprehensive action plan: resource deployment, alert message, route optimization, Before/After metrics |
| **Tools** | None (uses LLM reasoning) |
| **Backstory** | Senior NDMA response coordinator; has planned responses for floods, earthquakes, urban emergencies; creates actionable plans with clear priorities |
| **Reality** | Pure LLM reasoning; simulates action plan structure |

##### b) Logistics Agent

| Property | Value |
|----------|-------|
| **Role** | Logistics and Alert Dispatcher |
| **Goal** | Execute the response plan by dispatching alerts, creating tracking tickets, coordinating resource deployment to affected area |
| **Tools** | `alert_dispatcher` |
| **Backstory** | Operations officer at Islamabad's EOC; handles last-mile execution: SMS alerts, sirens, rescue dispatch, tickets |
| **Reality** | Calls real tool that **simulates** alert dispatch (no real SMS/siren sent); returns mock ticket ID and simulated metrics |

#### Tasks

| Task | Agent | Input | Output |
|------|-------|-------|--------|
| `response_planning_task` | Response Planner | Crisis type, sector, severity, affected population, recommended resources | JSON: actions, alert_message, requires_approval, simulation_metrics |
| `dispatch_task` | Logistics Agent | Same as above | JSON: ticket_id, alert_channels, actions_taken, simulation_metrics, summary |

---

## Tools

### Real API / External Calls

#### 1. weather_fetcher

| Property | Value |
|----------|-------|
| **Purpose** | Fetch current weather data to corroborate flood/heatwave/fire reports |
| **API Used** | **Open-Meteo API** (free, no API key required) |
| **Endpoint** | `https://api.open-meteo.com/v1/forecast?latitude=X&longitude=Y&current=...` |
| **Data Returned** | Temperature, precipitation, humidity, wind speed, weather code |
| **Failure Handling** | Returns graceful degradation JSON with `data_available: false` if API fails |
| **Reality** | **🟢 REAL API CALL** — Uses `urllib.request` to hit open-meteo.com |
| **Cost** | Free; rate limits are generous for single requests |
| **Example** | For a flood report in G-10 (lat 33.6844, lon 73.0479), returns current precipitation, which corroborates or contradicts the report |

**Sample Output**:
```json
{
  "temperature_celsius": 36.5,
  "precipitation_mm": 12.3,
  "rain_mm": 5.1,
  "humidity_percent": 65,
  "wind_speed_kmh": 15,
  "weather_code": 61,
  "weather_severity": "moderate_rain",
  "supports_flood_report": true,
  "data_available": true
}
```

---

### Simulated / Heuristic Tools

#### 2. roman_urdu_parser

| Property | Value |
|----------|-------|
| **Purpose** | Parse Roman Urdu citizen reports and extract crisis type, keywords, sector mentions |
| **Method** | Keyword dictionary + regex matching (not ML) |
| **Crisis Keywords** | ~40 keywords mapped to crisis types (e.g., "pani" → flood, "aag" → fire, "zalzala" → earthquake) |
| **Sector Detection** | ~25 known Islamabad sectors (G-10, I-8, Nallah Lai, etc.) |
| **Language Detection** | Checks for Urdu particles ("mein", "hai", "ho", "ka", "ki", "ke", "se", "pe", "nahi") |
| **Reality** | **🟡 SAMPLE/HEURISTIC** — No external API; uses hardcoded keyword dictionary |
| **Limitations** | Simple keyword matching; does not handle complex or misspelled input well |
| **Example** | Input: "G-10 mein pani bhar gaya" → Output: `parsed_intent: "flood"`, `detected_sectors: ["G-10"]`, `confidence: 0.9` |

**Sample Output**:
```json
{
  "parsed_intent": "flood",
  "keywords": ["pani", "bhar"],
  "detected_sectors": ["G-10"],
  "language_detected": "roman_urdu",
  "confidence": 0.9,
  "original_text": "G-10 mein pani bhar gaya"
}
```

---

#### 3. corroboration_engine

| Property | Value |
|----------|-------|
| **Purpose** | Score a crisis report 0–100 by cross-referencing multiple signals |
| **Method** | Multi-source scoring algorithm with anti-manipulation checks |
| **Scoring Breakdown** | Weather API: 30pts, Traffic: 25pts, Citizen reports: 20pts, Sensors: 15pts, History: 10pts (total: 100) |
| **Threshold** | ≥50 points → verified; ≥80 points → critical |
| **Anti-Manipulation** | Single-source reports with <2 corroborating sources capped at 20 points (flagged as false) |
| **Reality** | **🟡 MIXED** — Uses weather_fetcher (real API) but simulates traffic, sensor, and historical data |
| **Data Sources** | Weather (real), Traffic (simulated), Citizen count (passed as parameter), Sensors (hardcoded values), History (hardcoded sector hotspots) |
| **Example** | Flood report with heavy rainfall + 3 citizen reports + no sensor data + known flood history in sector → Score: 65 (high) |

**Corroboration Sources**:
```
1. Weather API (Open-Meteo)   — Real API call
2. Traffic Data               — Simulated (crisis type heuristic)
3. Citizen Reports            — Input parameter (num_similar_reports)
4. IoT Sensors                — Hardcoded baseline values
5. Historical Patterns        — Hardcoded sector hotspot dictionary
```

**Sample Output**:
```json
{
  "corroboration_score": 72.5,
  "severity": "high",
  "is_verified": true,
  "is_false_report": false,
  "sources": [
    {"source_name": "Weather API", "score_contribution": 30, "is_corroborating": true},
    {"source_name": "Traffic Data", "score_contribution": 20, "is_corroborating": true},
    {"source_name": "Citizen Reports", "score_contribution": 15, "is_corroborating": true},
    {"source_name": "IoT Sensors", "score_contribution": 8, "is_corroborating": false},
    {"source_name": "Historical Patterns", "score_contribution": 10, "is_corroborating": true}
  ]
}
```

---

#### 4. impact_assessor

| Property | Value |
|----------|-------|
| **Purpose** | Estimate impact (population, infrastructure, resources) for a verified crisis in a specific Islamabad sector |
| **Method** | Sector database lookup + severity multiplier |
| **Sector Database** | Hardcoded data for 12 Islamabad sectors (G-10, G-11, G-6, G-8, F-7, I-8, H-9, Blue Area, Zero Point, Nallah Lai, Margalla, Expressway) |
| **Data per Sector** | Population, hospitals, schools, key roads |
| **Multiplier by Severity** | Low: 10%, Medium: 30%, High: 60%, Critical: 90% of sector population affected |
| **Resource Map** | Crisis type → hardcoded list of recommended resources (e.g., flood → rescue boats, water pumps, shelters) |
| **Reality** | **🟡 SAMPLE/HARDCODED** — Uses realistic sector data for Islamabad but all data is static |
| **Example** | Flood in G-10 (population 45K), severity "high" → 27K affected, requires boats & shelters |

**Sample Sector Data** (G-10):
```json
{
  "population": 45000,
  "hospitals": ["PIMS", "Shifa"],
  "schools": 12,
  "key_roads": ["Kashmir Highway"]
}
```

**Sample Output**:
```json
{
  "crisis_type": "flood",
  "sector": "G-10",
  "severity": "high",
  "affected_population": 27000,
  "infrastructure_at_risk": ["Hospital: PIMS", "Hospital: Shifa", "7 schools", "Road: Kashmir Highway"],
  "recommended_resources": ["Rescue boats", "Water pumps", "Emergency shelters", "Medical teams"],
  "estimated_response_time_min": 20,
  "risk_level": "high"
}
```

---

#### 5. alert_dispatcher

| Property | Value |
|----------|-------|
| **Purpose** | Simulate emergency alert dispatch and create tracking tickets |
| **Method** | Generates mock ticket ID + simulates alert channels based on severity |
| **Alert Channels** | Low/Medium: Dashboard only; High/Critical: Dashboard + SMS + Push + Radio; Critical: + Siren + PA + TV/Radio |
| **Ticket Format** | `CIRO-YYYYMMDD-XXXXXXXX` (unique per execution) |
| **Simulation Metrics** | Returns Before/After metrics (congestion %, rescue ETA, alert reach, resource deployment) |
| **Reality** | **🔴 SIMULATED** — Does NOT send real SMS, push notifications, or activate actual sirens; purely demonstrates data flow |
| **Example** | Critical flood in G-10 → Ticket CIRO-20260518-A7F3B21K → Alerts via 7 channels → Expected rescue ETA: 8 min |

**Sample Output**:
```json
{
  "ticket_id": "CIRO-20260518-A7F3B21K",
  "alert_channels": ["EOC Dashboard", "SMS to affected area", "Push notification", "Emergency radio", "Siren activation", "PA system", "TV/Radio broadcast"],
  "actions_taken": [
    {"action_type": "send_alert", "status": "completed"},
    {"action_type": "create_ticket", "status": "completed"},
    {"action_type": "dispatch_rescue", "status": "in_progress"},
    {"action_type": "block_road", "status": "pending"}
  ],
  "simulation_metrics": [
    {"metric_name": "Area Congestion", "before_value": "87%", "after_value": "34%", "improvement_percent": 60.9},
    {"metric_name": "Rescue ETA", "before_value": "25 min", "after_value": "8 min"}
  ]
}
```

---

## Data Models

All agent handoffs use Pydantic models defined in [src/ciro/schema/models.py](src/ciro/schema/models.py):

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| `CrisisType` | Enum of 12 crisis types | FLOOD, FIRE, EARTHQUAKE, HEATWAVE, AIR_QUALITY, etc. |
| `Severity` | Enum | LOW, MEDIUM, HIGH, CRITICAL |
| `Location` | GPS + sector | lat, lon, sector, address |
| `Signal` | Raw input signal | signal_id, source, timestamp, location, raw_data |
| `NormalizedSignal` | Ingest Crew output | signal_id, original_text, parsed_intent, extracted_location, confidence |
| `CorroboratedEvent` | Analysis Crew output | event_id, crisis_type, location, severity, corroboration_score, is_verified, affected_population |
| `ImpactAssessment` | Impact analysis | affected_sectors, affected_population, infrastructure_at_risk, recommended_resources |
| `ActionPlan` | Response Crew output | plan_id, event_id, actions, simulation_metrics, requires_approval, alert_message |

---

## Getting Started

### Prerequisites

- Python 3.10+ (see `pyproject.toml`)
- `uv` package manager installed
- A local Ollama server running (or update `llm_config.py` to use a different LLM)
- Internet connection (for Open-Meteo weather API)

### Installation

```bash
cd ciro
uv sync  # Install dependencies from pyproject.toml + uv.lock
```

### Configuration

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` to set any required API keys (currently only Open-Meteo is used, which has no auth).

### Running the Flow

```bash
cd ciro
crewai run
```

This will:
1. Start with the default test report: "G-10 mein pani bhar gaya" (flooding in G-10)
2. Run through all three crews
3. Output trace logs and final results

### Running with a Custom Report

```bash
python src/ciro/main.py run_with_trigger '{"text": "I-8 mein accident ho gaya", "lat": 33.7, "lon": 73.15, "sector": "I-8"}'
```

### Visualizing the Flow

```bash
crewai flow plot
```

Generates an HTML diagram of the flow DAG.

### Replaying a Previous Execution

```bash
crewai replay -t <task_id>
```

---

## Flow Logic

### State Management

The `CIROFlow` maintains a `CIROState` Pydantic model:

```python
class CIROState(BaseModel):
    raw_report: dict                          # Citizen input
    parsed_signal: NormalizedSignal | None    # Ingest output
    corroboration_score: float                # Analysis score
    corroborated_event: CorroboratedEvent     # Analysis output
    impact_assessment: ImpactAssessment       # Impact analysis
    action_plan: ActionPlan                   # Response output
    trace_log: list[str]                      # Audit trail
```

### Flow Steps

1. **ingest_report()** — Starts the flow; captures raw report
2. **run_ingest_crew()** — Parses & normalizes
3. **run_analysis_crew()** — Corroborates & assesses
4. **route_by_severity()** — Router: `score >= 80` → critical; else → routine
5. **critical_response() or auto_response()** — HIL placeholder or auto-dispatch
6. **run_response_crew()** — Plans & executes response

### Severity Routing

```
Corroboration Score
├─ >= 80  →  Critical  →  [Awaiting Human Approval]  →  Response
└─ < 80   →  Routine   →  Auto-Dispatch  →  Response
```

Currently, the "Human Approval" step logs a message but does not block. In production, this would integrate with an HR dashboard.

---

## Testing & Validation

### Test Data

The system ships with a default test report:
```
Text: "G-10 mein pani bhar gaya" (flooding in G-10)
Location: lat=33.6844, lon=73.0479
Sector: G-10
```

Expected flow:
1. NLP Parser detects "flood" with confidence 0.9
2. Weather API returns precipitation data (corroborates)
3. Corroboration score: ~72 (high, verified)
4. Impact: ~27K affected (assuming 60% of 45K population)
5. Response: Dispatch rescue teams, send SMS alerts

### Known Limitations

- **No real alert dispatch**: `alert_dispatcher` simulates only; no SMS or siren activation
- **No persistent storage**: All data lives in memory; flow state is ephemeral
- **No citizen feedback loop**: Impact and action outcomes are not logged back to the citizen
- **Ollama dependency**: The LLM backend is hardcoded to local Ollama; requires manual setup

---

## Future Enhancements

- Replace Ollama with cloud LLM (e.g., GPT-4, Claude) + cost tracking
- Add real alert dispatch integration (SMS provider, siren systems, social media)
- Implement human-in-the-loop (HIL) validator with web dashboard
- Store events and actions in PostgreSQL + PostGIS for spatial queries
- Add citizen feedback loop (impact validation, lessons learned)
- Improve Roman Urdu parser with fine-tuned NLP model
- Add multi-language support (Urdu, Punjabi, Pashto)
- Integrate with municipal systems (fire, police, EMS)
- Implement cost tracking and ROI metrics
- Add stress-testing and chaos engineering

---

## File Structure

```
ciro/
├── src/ciro/
│   ├── __init__.py
│   ├── main.py                           # Flow orchestration entry point
│   ├── llm_config.py                     # LLM configuration (Ollama)
│   ├── schema/
│   │   ├── __init__.py
│   │   └── models.py                     # Pydantic models (Signal, Event, ActionPlan, etc.)
│   ├── crews/
│   │   ├── ingest_crew/
│   │   │   ├── __init__.py
│   │   │   ├── ingest_crew.py            # Ingest Crew class
│   │   │   └── config/
│   │   │       ├── agents.yaml           # NLP Parser, Data Normalizer
│   │   │       └── tasks.yaml            # Parse & normalize tasks
│   │   ├── analysis_crew/
│   │   │   ├── __init__.py
│   │   │   ├── analysis_crew.py          # Analysis Crew class
│   │   │   └── config/
│   │   │       ├── agents.yaml           # Signal Corroborator, Event Detector, Impact Assessor
│   │   │       └── tasks.yaml            # Corroboration, detection, impact tasks
│   │   └── response_crew/
│   │       ├── __init__.py
│   │       ├── response_crew.py          # Response Crew class
│   │       └── config/
│   │           ├── agents.yaml           # Response Planner, Logistics Agent
│   │           └── tasks.yaml            # Planning & dispatch tasks
│   └── tools/
│       ├── __init__.py
│       ├── roman_urdu_parser.py          # Keyword-based Roman Urdu parsing
│       ├── weather_fetcher.py            # Open-Meteo API (real)
│       ├── corroboration_engine.py       # Multi-signal scoring (mixed: real weather + simulated other)
│       ├── impact_assessor.py            # Hardcoded sector data + severity multiplier
│       ├── alert_dispatcher.py           # Simulated alert dispatch
│       └── custom_tool.py                # Template (unused)
├── .env                                  # API keys / configuration
├── .env.example                          # Template
├── pyproject.toml                        # Dependencies & scripts
├── uv.lock                               # Locked dependency versions
├── AGENTS.md                             # CrewAI reference for AI assistants
├── README.md                             # This file
└── tests/                                # (Currently empty)
```

---

## Troubleshooting

### Import Errors (pydantic, crewai.flow, dotenv)

**Issue**: Pylance shows "could not be resolved" for pydantic, crewai.flow, or dotenv.

**Fix**: Ensure dependencies are installed:
```bash
uv sync
```

### Ollama Connection Refused

**Issue**: `Connection refused` when running the flow.

**Fix**: Start Ollama server:
```bash
ollama serve
```

In another terminal, pull the model:
```bash
ollama pull qwen3:8b
```

### Weather API Timeout

**Issue**: `weather_fetcher` times out or returns 0 results.

**Fix**: Ensure internet connection is available. Open-Meteo API has no rate limiting for non-commercial use.

### JSON Parsing Errors in Extract Output

**Issue**: `extract_json()` returns empty dict when parsing agent output.

**Fix**: Check agent verbosity logs. The LLM may not be returning valid JSON in code blocks. Consider using CrewAI's native `response_format` parameter (if supported by LLM model).

---

## License

MIT

---

## Contact / Support

For questions or bug reports, please open an issue in the repository or contact the maintainers.
