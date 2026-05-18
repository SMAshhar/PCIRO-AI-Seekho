# HOW CIRO WORKS
### A guide for the backend and mobile app developers

> Read this before you design the backend or touch the mobile app. Everything the backend does and everything the mobile app sends exists to serve one purpose: **feeding the right data into the AI system and broadcasting what it produces.**

---

## The Big Picture

The three parts of CIRO map to a single pipeline:

```
Mobile App
    │
    │  POST /api/reports  { text, lat, lon, sector }
    ▼
Backend (Node.js)
    │
    │  Queues a job, calls Python AI process
    ▼
AI System (CrewAI Flow)
    │
    │  Runs 3 crews → produces action plan + ticket
    ▼
Backend
    │
    │  Saves result, pushes via WebSocket
    ▼
Mobile App  ←  live update on crisis feed
```

The AI system is **synchronous and blocking**. When it starts, it runs for 30–90 seconds and produces a result. It does not yield partial results mid-run. The backend's job is to start it, wait for it, and then broadcast what it returns. That's the architecture — everything else is detail.

---

## Part 1: The AI System — Exactly What It Does

### 1.1 Entry Point

The AI system lives in `ciro/src/ciro/main.py`. There is one function you call:

```python
# From main.py
class CIROFlow(Flow[CIROState]):
    ...

def kickoff():
    ciro_flow = CIROFlow()
    ciro_flow.kickoff()

def run_with_trigger():
    # Called with a JSON payload from command line
    trigger_payload = json.loads(sys.argv[1])
    result = ciro_flow.kickoff({"crewai_trigger_payload": trigger_payload})
```

The **input it needs** is a dict with exactly 4 fields:

```json
{
    "text":   "G-10 mein pani bhar gaya",
    "lat":    33.6844,
    "lon":    73.0479,
    "sector": "G-10"
}
```

That's it. That's the full interface between the backend and the AI. The mobile app sends this. The backend passes this to the AI. Nothing more is needed to start the pipeline.

---

### 1.2 State Object — What Travels Through the Pipeline

Everything the pipeline knows is stored in `CIROState` (`main.py`, line 16). Think of it as a shared clipboard that each crew reads from and writes to:

```python
class CIROState(BaseModel):
    raw_report:          dict             # The original input from mobile app
    parsed_signal:       NormalizedSignal | None   # Output of Ingest Crew
    corroboration_score: float            # KEY — routes the pipeline at the decision point
    corroborated_event:  CorroboratedEvent | None  # Output of Analysis Crew
    impact_assessment:   ImpactAssessment | None   # Output of Analysis Crew
    action_plan:         ActionPlan | None          # Output of Response Crew
    trace_log:           list[str]        # Human-readable audit trail
```

Each step of the flow reads from this state and writes back to it. No crew calls another crew directly — they all communicate through this state object.

---

### 1.3 Step 1 — Ingest Crew (Parse the report)

**File:** `ciro/src/ciro/crews/ingest_crew/ingest_crew.py`
**Duration:** ~10–15 seconds (LLM inference × 2 agents)

**What it receives** (from `CIROState.raw_report`):
```
report_text: "G-10 mein pani bhar gaya"
latitude:    33.6844
longitude:   73.0479
sector:      "G-10"
```

**Two agents run sequentially:**

**Agent 1 — NLP Parser** (`nlp_parser`)
- Role: Roman Urdu Crisis Parser
- LLM: Gemini 2.0 Flash (from `agents.yaml`) / Ollama Qwen 3:8b (runtime fallback in code)
- Tool used: `roman_urdu_parser` — a pure Python function, no external API

The `roman_urdu_parser` tool (`tools/roman_urdu_parser.py`) does this:
1. Lowercases the text
2. Scans it against a hardcoded keyword dict (`CRISIS_KEYWORDS`) — 40+ Roman Urdu/English keywords mapped to crisis types
3. Scans for Islamabad sector mentions against a list of 30+ known sectors
4. Counts keyword matches → calculates confidence (1 keyword = 0.5, 2 = 0.75, 3+ = 0.9, +0.1 if sector detected)
5. Returns JSON:
```json
{
    "parsed_intent":    "flood",
    "keywords":         ["pani", "bhar"],
    "detected_sectors": ["G-10"],
    "language_detected":"roman_urdu",
    "confidence":       0.85,
    "original_text":    "G-10 mein pani bhar gaya"
}
```

The LLM agent receives this tool output and writes a reasoning summary. The NLP tool does the actual work — the LLM provides reasoning context.

**Agent 2 — Data Normalizer** (`data_normalizer`)
- No tools
- Takes Agent 1's output, verifies sector name matches known Islamabad sectors, ensures crisis type is one of the valid enum values
- Produces the final `NormalizedSignal` JSON

**What gets written back to state:**
```python
self.state.raw_report["parsed_intent"] = "flood"  # from parsed_data
```

The crew's JSON output is extracted from the LLM's raw response with `extract_json()` (a regex helper in `main.py` that looks for ```json blocks or raw JSON strings).

---

### 1.4 Step 2 — Analysis Crew (Corroborate and assess)

**File:** `ciro/src/ciro/crews/analysis_crew/analysis_crew.py`
**Duration:** ~20–30 seconds (3 agents, 2 tool calls including a real HTTP request)

**What it receives** (built from `CIROState.raw_report`):
```
crisis_type:        "flood"      ← from parsed_intent
latitude:           33.6844
longitude:          73.0479
sector:             "G-10"
report_text:        "G-10 mein pani bhar gaya"
num_similar_reports: 3           ← HARDCODED TO 3 in current main.py (line 78)
```

> **Note for backend:** `num_similar_reports` is currently hardcoded to `3` in `main.py:78`. The backend needs to query the database for the actual count of similar reports in the same sector before calling the AI — then pass it in this field. This is one of the most important backend responsibilities.

**Three agents run sequentially:**

**Agent 1 — Signal Corroborator** (`signal_corroborator`)

Two tool calls happen in sequence:

**Tool call 1: `weather_fetcher(latitude, longitude)`**

Located at `tools/weather_fetcher.py`. Makes a real HTTP GET to:
```
https://api.open-meteo.com/v1/forecast?latitude=33.6844&longitude=73.0479
    &current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m
    &timezone=Asia/Karachi
```

No API key required. Returns:
```json
{
    "temperature_celsius": 38.2,
    "precipitation_mm":    12.5,
    "rain_mm":             12.5,
    "humidity_percent":    78,
    "wind_speed_kmh":      15,
    "weather_severity":    "heavy_rain",
    "supports_flood_report": true,
    "supports_heatwave_report": false,
    "data_available": true
}
```

If the API is down: returns `{"data_available": false}` — the scoring engine handles this gracefully with a fallback score of 5 points.

**Tool call 2: `corroboration_engine(crisis_type, lat, lon, citizen_report_text, weather_data, num_similar_reports, sector)`**

Located at `tools/corroboration_engine.py`. Pure Python, no external calls. Runs the multi-signal scoring algorithm:

| Source | Max Points | How Scored |
|---|---|---|
| Weather API | 30 | `supports_flood_report=true` → 30 pts; light rain → 15 pts; no data → 5 pts |
| Traffic Data | 25 | **Simulated** — flood/road crises get 20 pts, fire gets 15 pts (not real API yet) |
| Citizen Reports | 20 | ≥5 reports → 20 pts; ≥3 → 15 pts; 1–2 → 8 pts; 0 → 0 pts |
| IoT Sensors | 15 | **Simulated** — flood with heavy rain → 15 pts; AQ crisis → 12 pts; else 8 pts |
| Historical | 10 | G-10 + flood → 10 pts (hardcoded hotspot map); unknown combo → 3 pts |

**Anti-manipulation check:**
If `corroborating_sources_count <= 1 AND num_similar_reports == 0`:
- Total score is capped at `FALSE_REPORT_THRESHOLD = 20`
- `is_false_report = True`
- Event is not escalated

**Score → Severity mapping:**
- `score >= 85` → `critical`
- `score >= 65` → `high`
- `score >= 50` → `medium`
- `score < 50` → `low`

Returns:
```json
{
    "corroboration_score": 83.0,
    "severity": "high",
    "is_verified": true,
    "is_false_report": false,
    "false_report_reason": null,
    "sources": [
        {"source_name": "Weather API (Open-Meteo)", "score_contribution": 30.0, "is_corroborating": true, ...},
        {"source_name": "Traffic Data",             "score_contribution": 20.0, "is_corroborating": true, ...},
        {"source_name": "Citizen Reports",          "score_contribution": 15.0, "is_corroborating": true, ...},
        {"source_name": "IoT Sensors",              "score_contribution": 15.0, "is_corroborating": true, ...},
        {"source_name": "Historical Patterns",      "score_contribution": 10.0, "is_corroborating": true, ...}
    ],
    "corroborating_sources_count": 5
}
```

**Agent 2 — Event Detector** (`event_detector`)
- No tools
- Reads Agent 1's corroboration output
- Decides: is this a real verified event? (`is_verified && score >= 50`)
- Produces a `CorroboratedEvent` JSON with `event_id`, `crisis_type`, `severity`, `summary`

**Agent 3 — Impact Assessor** (`impact_assessor_agent`)

Tool call: `impact_assessor(crisis_type, sector, severity)`

Located at `tools/impact_assessor.py`. Pure Python lookup against hardcoded `SECTOR_DATA`:
- G-10 population: 45,000
- Multiplier by severity: low=0.1, medium=0.3, high=0.6, critical=0.9
- Returns affected population, hospitals/schools/roads at risk, resource list, ETA

For G-10 + flood + high severity:
```json
{
    "affected_population": 27000,
    "affected_sectors": ["G-10"],
    "infrastructure_at_risk": ["Hospital: PIMS", "Hospital: Shifa", "7 schools", "Road: Kashmir Highway"],
    "recommended_resources": ["Rescue boats", "Water pumps", "Emergency shelters", "Medical teams"],
    "estimated_response_time_min": 20,
    "risk_level": "high"
}
```

**What gets written back to state** (from `main.py` lines 82–86):
```python
self.state.corroboration_score              = 83.0
self.state.raw_report["severity"]           = "high"
self.state.raw_report["affected_population"]= 27000
self.state.raw_report["recommended_resources"] = "Rescue boats, ..."
self.state.raw_report["estimated_response_time_min"] = 20
```

---

### 1.5 The Router — The Decision Point

**`route_by_severity()` in `main.py` (lines 89–94):**

```python
@router(run_analysis_crew)
def route_by_severity(self):
    score = self.state.corroboration_score if self.state.corroboration_score else 85.0
    if score >= 80:
        return "critical"
    return "routine"
```

This is the branching logic of the entire system:

- **Score ≥ 80** → `"critical"` → `critical_response()` runs first → adds `"Critical event approved by HIL"` to trace log → then `run_response_crew()`
- **Score < 80** → `"routine"` → `auto_response()` runs first → adds `"Routine event auto-dispatched"` to trace log → then `run_response_crew()`

**Important:** The current `critical_response()` does NOT actually pause for human input — it just logs a message and continues. The Human-In-Loop (HIL) gate is simulated right now. The backend needs to implement the real HIL gate: when a critical event is detected, pause execution, send a push notification to the Incident Commander's device, wait for their `POST /api/commander/approve`, then resume the response crew.

---

### 1.6 Step 3 — Response Crew (Plan and dispatch)

**File:** `ciro/src/ciro/crews/response_crew/response_crew.py`
**Duration:** ~10–20 seconds (2 agents, 1 tool call)

**What it receives** (from `CIROState.raw_report`):
```
crisis_type:               "flood"
sector:                    "G-10"
severity:                  "high"
affected_population:       27000
recommended_resources:     "Rescue boats, Water pumps, ..."
estimated_response_time_min: 20
```

**Two agents run sequentially:**

**Agent 1 — Response Planner** (`response_planner`)
- No tools
- Produces a structured action plan with prioritized actions
- Writes an alert message in both English and Roman Urdu
- Sets `requires_approval = true` if severity is critical

**Agent 2 — Logistics Agent** (`logistics_agent`)

Tool call: `alert_dispatcher(crisis_type, sector, severity, affected_population, alert_message)`

Located at `tools/alert_dispatcher.py`. Pure Python simulation:

1. Generates a ticket ID: `CIRO-20260518-A3F7B2C1`
2. Selects alert channels based on severity:
   - Always: `EOC Dashboard`
   - High/Critical: `+ SMS to affected area, Push notification, Emergency radio`
   - Critical only: `+ Siren activation, PA system, TV/Radio broadcast`
3. Creates 4 simulated actions: `send_alert`, `create_ticket`, `dispatch_rescue`, `block_road`
4. Generates hardcoded Before/After metrics:
   - Area Congestion: 87% → 34%
   - Rescue ETA: 25 min → 8 min
   - Alert Reach: 0 → 27,000 people
   - Resource Deployment: 0 → 4 units

Returns the full `ActionPlan` JSON.

---

### 1.7 Final Output

After all three crews complete, `CIROState` contains everything. The backend needs to extract:

```python
# What the backend should read from state after Flow completes:
{
    "corroboration_score": 83.0,
    "severity": "high",
    "is_verified": True,
    "affected_population": 27000,
    "ticket_id": "CIRO-20260518-A3F7B2C1",
    "alert_channels": [...],
    "actions": [...],
    "simulation_metrics": [...],
    "trace_log": ["Critical event approved by HIL"],
    "requires_approval": False   # True only if severity == critical
}
```

**The full pipeline duration**: 40–90 seconds on local Ollama Qwen 3:8b. Much faster with Gemini 2.0 Flash (10–20 seconds). This is a long-running synchronous operation — it MUST run in a background worker, never in a request handler.

---

## Part 2: The Backend — What It Needs to Do

### 2.1 Why You Don't Need Kafka

Kafka is designed for millions of events per second across distributed systems. CIRO processes one crisis report at a time. Kafka adds Zookeeper, consumer groups, offset management, and significant operational complexity.

**Use BullMQ + Redis instead.** BullMQ is a Node.js job queue backed by Redis. It handles:
- Queuing reports as jobs
- Running the AI process in background workers
- Retries on failure
- Job status tracking
- No Kafka overhead

If the team is already comfortable with Kafka, it works — but it's overkill for a hackathon prototype.

### 2.2 Backend Architecture

```
Express API Server (always running, handles HTTP + WebSocket)
    │
    ├── POST /api/reports       → validates input → adds job to BullMQ queue
    ├── GET  /api/crises        → reads from PostgreSQL
    ├── GET  /api/crises/:id    → reads from PostgreSQL
    ├── POST /api/commander/approve → unpauses a waiting critical job
    ├── POST /api/commander/reject  → cancels a waiting critical job
    └── WebSocket               → broadcasts events to connected mobile clients

BullMQ Worker (separate process, always running)
    │
    ├── Listens to job queue
    ├── For each job: runs Python AI process
    ├── Saves result to PostgreSQL
    └── Triggers WebSocket broadcast
```

### 2.3 What Happens When a Report Comes In

```
1. Mobile app → POST /api/reports
   Body: { text, lat, lon, sector, device_id }

2. Backend validates the request:
   - text: required, min 10 chars
   - lat/lon: valid coordinates
   - sector: known Islamabad sector OR geocode from lat/lon
   - device_id: rate-limit check (1 report/sector/hour/device)

3. Backend queries PostgreSQL for num_similar_reports:
   SELECT COUNT(*) FROM reports
   WHERE sector = $sector
     AND crisis_type = <from a fast keyword scan>
     AND created_at > NOW() - INTERVAL '2 hours'

4. Backend adds job to BullMQ queue:
   {
     text, lat, lon, sector,
     num_similar_reports: <from step 3>,
     device_id, report_id: uuid
   }

5. Backend responds immediately to mobile app:
   HTTP 202 Accepted
   { report_id: "uuid", message: "Report received. Processing..." }

6. (Meanwhile, BullMQ worker picks up the job)

7. Worker runs the AI system:
   python -m ciro.main '{"text":"...","lat":33.68,"lon":73.04,"sector":"G-10"}'

   OR via Python subprocess / HTTP call to a FastAPI wrapper

8. Worker receives AI output (ActionPlan JSON)

9. Worker saves to PostgreSQL:
   INSERT INTO crises (event_id, crisis_type, sector, severity,
                       corroboration_score, ticket_id, status, ...)

10. Worker broadcasts via WebSocket:
    io.emit('crisis:new', { event_id, crisis_type, severity, ... })

11. All connected mobile clients receive the live update on their feed
```

### 2.4 How to Call the AI System From Node.js

**Option A — Python subprocess (simplest, good for hackathon):**

```javascript
// worker.js
const { execFile } = require('child_process');

async function runCIROFlow(payload) {
    return new Promise((resolve, reject) => {
        const args = ['-m', 'ciro.main', JSON.stringify(payload)];
        execFile('python', args, {
            cwd: path.join(__dirname, '../ciro'),
            env: { ...process.env, PYTHONPATH: 'src' },
            timeout: 120000  // 2 minutes max
        }, (error, stdout, stderr) => {
            if (error) return reject(error);
            // Parse the final JSON output from stdout
            resolve(parseAIOutput(stdout));
        });
    });
}
```

**Option B — FastAPI wrapper (cleaner, better for production):**

Wrap the AI system in a FastAPI endpoint:

```python
# api_wrapper.py
from fastapi import FastAPI
from ciro.main import CIROFlow

app = FastAPI()

@app.post("/run")
async def run_flow(payload: dict):
    flow = CIROFlow()
    flow.kickoff({"crewai_trigger_payload": payload})
    return { "state": flow.state.dict() }
```

Node.js worker calls `POST http://localhost:8000/run` instead of spawning a subprocess.

Option B is recommended — it keeps the Python process alive (no cold start per job), handles errors cleanly, and returns structured JSON.

### 2.5 The Real HIL (Human-In-Loop) Gate

The current AI code simulates the HIL gate — it doesn't actually pause. Here is how the backend implements the real gate:

```
1. Worker calls AI system → Analysis Crew finishes → score = 92 → "critical"
2. AI returns early with status: "awaiting_commander_approval"
   (This requires modifying the AI's critical_response() to NOT continue automatically)

3. Worker saves to DB:
   crises.status = 'awaiting_approval'
   crises.corroboration_score = 92

4. Worker broadcasts via WebSocket:
   io.emit('commander:approval_required', { event_id, crisisId })

5. Backend sends push notification (FCM) to all devices where role='incident_commander'

6. Incident Commander opens app → sees the full evidence → taps "Approve"

7. Mobile app → POST /api/commander/approve { event_id, note }

8. Backend resumes the job:
   - Calls AI system again with the already-computed state
   - OR the backend itself calls ResponseCrew directly with state data
   - Most practical: store state in Redis, resume from ResponseCrew inputs

9. Response Crew runs → action plan produced → broadcast crisis:updated
```

The simplest implementation for a hackathon: when a critical event is detected, the AI stops after Analysis Crew. Backend stores the interim state. On approval, backend calls the Response Crew separately with the stored inputs.

### 2.6 Database Schema (Minimum Required)

```sql
-- Reports: raw inputs from mobile app
CREATE TABLE reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id   TEXT NOT NULL,
    text        TEXT NOT NULL,
    lat         FLOAT NOT NULL,
    lon         FLOAT NOT NULL,
    sector      TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Crises: processed events from AI system
CREATE TABLE crises (
    event_id            UUID PRIMARY KEY,
    crisis_type         TEXT NOT NULL,
    sector              TEXT NOT NULL,
    severity            TEXT NOT NULL,       -- low/medium/high/critical
    corroboration_score FLOAT NOT NULL,
    is_verified         BOOLEAN DEFAULT FALSE,
    is_false_report     BOOLEAN DEFAULT FALSE,
    affected_population INTEGER DEFAULT 0,
    ticket_id           TEXT,
    status              TEXT DEFAULT 'active',  -- active/awaiting_approval/resolved
    sources_json        JSONB,             -- per-source score breakdown
    actions_json        JSONB,             -- action plan items
    metrics_json        JSONB,             -- before/after metrics
    alert_message       TEXT,
    requires_approval   BOOLEAN DEFAULT FALSE,
    approved_by         TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- FCM tokens for push notifications
CREATE TABLE devices (
    device_id   TEXT PRIMARY KEY,
    fcm_token   TEXT NOT NULL,
    role        TEXT DEFAULT 'citizen',    -- citizen/operator/incident_commander
    sectors     TEXT[] DEFAULT '{}',
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

---

## Part 3: The Mobile App — What It Sends and Receives

### 3.1 The Only Thing Mobile App Sends to Start the Pipeline

```http
POST /api/reports
Content-Type: application/json

{
    "text":      "G-10 mein pani bhar gaya, gaariyan phans gayi hain",
    "lat":       33.6844,
    "lon":       73.0479,
    "sector":    "G-10",
    "device_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

That's the trigger. The mobile app does not call the AI system directly. It does not call the backend worker directly. It sends this one HTTP request and immediately gets back:

```json
{ "report_id": "uuid", "message": "Report received" }
```

Then it waits. The update will arrive via WebSocket.

### 3.2 What Mobile App Receives

**On initial load** — HTTP GET:
```http
GET /api/crises
→ [ CrisisEvent, CrisisEvent, ... ]  (sorted by corroboration_score DESC)
```

**Live updates** — WebSocket events from the backend:
```javascript
socket.on('crisis:new',     (crisis) => crisisStore.addOrUpdateCrisis(crisis))
socket.on('crisis:updated', (crisis) => crisisStore.addOrUpdateCrisis(crisis))
socket.on('crisis:resolved',(data)   => crisisStore.removeCrisis(data.crisisId))
socket.on('score:updated',  (data)   => update score on matching crisis)
socket.on('commander:approval_required', (data) => show approval notification)
```

**Incident Commander approval**:
```http
POST /api/commander/approve
{ "event_id": "uuid", "note": "Confirmed by patrol car on-site" }

POST /api/commander/reject
{ "event_id": "uuid", "note": "Patrol found no evidence of flooding" }
```

### 3.3 The Sector Field — Why It Matters

The `sector` field in the report is critical for the AI system because:
1. The `roman_urdu_parser` scans for sector names in the text and boosts confidence
2. The `corroboration_engine` uses sector to look up historical hotspot data (`G-10` → flood history)
3. The `impact_assessor` uses sector to look up population and infrastructure data

**If the user does not type a sector name in their text**, the GPS coordinates must be reverse-geocoded to a sector before the report is submitted. The backend should handle this:

```javascript
// Backend: before queuing the job
if (!sectorMentionedInText(payload.text)) {
    payload.sector = await reverseGeocodeToIslamabadSector(payload.lat, payload.lon);
}
```

The impact assessor covers these sectors with population data: `G-10, G-11, G-6, G-8, F-7, I-8, H-9, Blue Area, Zero Point, Nallah Lai, Margalla, Expressway`. Reports from anywhere else fall back to a default population of 10,000.

---

## Part 4: The Current State of the AI System

This section tells you what is real, what is simulated, and what the backend must provide to make it real.

### What is Real (Production-Ready)

| Component | Status | Notes |
|---|---|---|
| Roman Urdu NLP parser | Real | Pure Python, keyword-based, no external dependency |
| Weather API (Open-Meteo) | Real | Live HTTP call, free, no API key needed |
| Corroboration scoring algorithm | Real | All 5 sources scored, anti-manipulation logic works |
| Historical hotspot data | Real | Hardcoded but accurate for Islamabad |
| Impact assessor population data | Real | Hardcoded sector populations, realistic numbers |
| Alert dispatcher simulation | Simulated | Generates real ticket IDs and channels, no actual SMS/FCM yet |
| Traffic data | Simulated | Returns a fixed score based on crisis type, no real Maps API |
| IoT sensor data | Simulated | Returns hardcoded values |
| HIL gate | Simulated | Logs a message but doesn't actually pause |

### What the Backend Must Provide

| Field | Responsibility | Where it goes |
|---|---|---|
| `num_similar_reports` | Backend queries DB | `main.py` line 78 — currently hardcoded to `3` |
| Real `num_similar_reports` count | Backend | Passed to `corroboration_engine` → affects citizen score (0–20 pts) |
| FCM push notification on critical | Backend | After `route_by_severity()` returns "critical" |
| Actual HIL pause/resume | Backend | Store state, wait for commander response, resume Response Crew |
| Deduplication of reports | Backend | Rate limit by device_id + sector + time window |

### LLM Configuration

The agents in `agents.yaml` declare `llm: gemini/gemini-2.0-flash`. The Python code overrides this with `local_llm = LLM(model="ollama/qwen3:8b", base_url="http://localhost:11434")` at runtime.

This means **Ollama must be running locally** for the AI system to work. Start it with:
```bash
ollama serve
ollama pull qwen3:8b
```

To switch to Gemini 2.0 Flash (faster, better quality):
1. Set `GOOGLE_API_KEY` in `.env`
2. Change `llm_config.py` to use `LLM(model="gemini/gemini-2.0-flash")`

---

## Part 5: Integration Checklist

Before the backend can be called production-ready, confirm each item:

**Backend → AI System:**
- [ ] Backend passes real `num_similar_reports` (not hardcoded 3) — this changes corroboration score
- [ ] Backend runs AI in a background worker, never in a request handler
- [ ] Timeout handling — if AI takes > 2 minutes, mark job as failed
- [ ] Result is saved to PostgreSQL before broadcasting to WebSocket

**Mobile App → Backend:**
- [ ] `device_id` is generated on first launch and persisted forever (AsyncStorage)
- [ ] GPS is fetched before submit — if denied, sector picker is mandatory
- [ ] `sector` field is always present (either from GPS reverse-geocode or user picker)
- [ ] Rate limit displayed to user if they submit too many reports

**Backend → Mobile App:**
- [ ] All connected clients receive `crisis:new` within 5 seconds of AI completing
- [ ] Incident Commander devices receive `commander:approval_required` push notification
- [ ] `crisis:updated` is sent when HIL approves and Response Crew completes
- [ ] `crisis:resolved` is sent when an operator manually closes an event

---

*Written for the CIRO backend and mobile developers. Last updated: May 2026.*
