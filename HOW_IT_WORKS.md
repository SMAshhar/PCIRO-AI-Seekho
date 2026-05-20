# How CIRO Works: A Developer Integration Guide
### *High-Performance Hybrid Architecture for Crisis Management*

> [!NOTE]
> Read this guide to understand the exact mechanics of how CIRO processes crisis reports, calculates corroboration scores, runs multi-agent crews, and updates frontends. Everything in our codebase is engineered to deliver **sub-second API responsiveness paired with deep, asynchronous multi-agent reasoning**.

---

## 1. High-Level Architecture Overview

CIRO does not use heavy Node.js Express servers, Kafka streams, or external BullMQ Redis configurations in the Python vertical slice. Instead, it relies on a **Python-native FastAPI + ThreadPoolExecutor + Socket.IO** architecture:

```
Mobile React Native Client
    │
    │  POST /api/reports  { text, crisis_type, location, device_id }
    ▼
FastAPI Server (port 8000)
    │
    ├─► Generates UUID `event_id`
    ├─► Spawns FastAPI `BackgroundTask` for immediate response
    ├─► Returns HTTP 202 Accepted (under 0.1s responsiveness) ──► Mobile Client
    │
    ▼
[ Fast Background Task: `_handle_report` ]
    │
    ├─► Runs `process_report` in `asyncio.to_thread`
    │   ├─► Roman Urdu Parser heuristic scan
    │   ├─► Real weather fetch to Open-Meteo REST API
    │   ├─► Score computation & anti-manipulation filters
    │   ├─► Impact population lookup & action dispatcher metrics
    │   └─► Upserts `CrisisEventOut` to `crisis_store`
    │
    ├─► Emits Socket.IO WebSocket (crisis:new / commander:approval_required)
    │
    ▼
[ Asynchronous Multi-Agent CrewAI Flow ]
    │ (Only triggered if `CIRO_USE_CREW=true`)
    ├─► Submits task to ThreadPoolExecutor worker
    ├─► Kicks off `CIROFlow` (IngestCrew -> AnalysisCrew -> ResponseCrew)
    ├─► Executes heavy LLMs (Gemini Flash or Ollama Fallback)
    ├─► Updates the state and rewrites event in `crisis_store`
    └─► Emits final Socket.IO WebSocket (crisis:updated)
```

---

## 2. Step-by-Step Data Lifecycles

### Step 2.1: Initial Report Ingestion
When a citizen reports a crisis (e.g. via the mobile app), the client issues a `POST /api/reports` call:
```json
{
  "text": "G-10 Markaz mein pani khara ho gaya hai, gaariyan phans gayi hain",
  "crisis_type": "unknown",
  "location": {
    "lat": 33.6844,
    "lon": 73.0479,
    "sector": "G-10"
  },
  "device_id": "mobile-device-550e"
}
```

The FastAPI endpoint receives this payload, creates an `event_id` UUID, and delegates processing to `BackgroundTasks`:
```python
# From src/ciro/api/app.py
@router.post("/api/reports", response_model=ReportResponse)
async def submit_report(
    payload: ReportCreate,
    background_tasks: BackgroundTasks,
) -> ReportResponse:
    event_id = str(uuid.uuid4())
    background_tasks.add_task(_handle_report, payload, event_id, is_new=True)
    return ReportResponse(report_id=event_id, event_id=event_id, status="processing")
```
This ensures the request is resolved in **under 10 milliseconds**, letting mobile apps render smooth animations immediately.

### Step 2.2: Fast Local Tool Pipeline Processing
Inside `_handle_report`, the system runs a fast synchronous pipeline using our core python tools:
1.  **Roman Urdu Parsing:** Passes the text to `roman_urdu_parser` tool to tokenise and identify intent (e.g. `flood`), sectors, and confidence metrics.
2.  **Live Weather Fetching:** Calls `weather_fetcher` (which issues a live `urllib.request` call to Open-Meteo's weather REST API) to fetch precipitation and temperature conditions for the exact coordinates.
3.  **Signal Corroboration:** Invokes `corroboration_engine` which combines weather data, citizen counts (defaults to 3), traffic estimations, and historical hotspots to compute a score from 0 to 100.
4.  **Impact Calculation:** Calls `impact_assessor` to query Islamabad population estimates and affected risk profiles for the sector.
5.  **Logistics Planning:** Calls `alert_dispatcher` to draft emergency alerts, target communication channels, and simulate before/after metrics.

This is upserted to our thread-safe `crisis_store` and broadcast to all Socket.IO listeners (`crisis:new`). If the score is $\ge 80$, the event's status is set to `AWAITING_APPROVAL` and `commander:approval_required` is emitted.

### Step 2.3: Asynchronous CrewAI Flow Orchestration
If `CIRO_USE_CREW` is set to `"true"`, `submit_flow_async` fires. A thread-pool worker picks up the job and runs `CIROFlow` in `main.py`:
-   **`IngestCrew`:** Uses LLM reasoning + the `roman_urdu_parser` tool to parse informal speech and normalize it.
-   **`AnalysisCrew`:** Signal corroborator fetches live weather, scores signals, classifier sets severity, and impact specialist calculates affected parameters.
-   **`Router`:** Checks state corroboration score. If $\ge 80$, routes to `critical_response`, otherwise `auto_response`.
-   **`ResponseCrew`:** response planner drafts alerts, and logistics agent dispatches warnings, updating the state data.

When complete, the worker updates the `crisis_store` with the rich agent outputs and triggers a `crisis:updated` WebSocket broadcast.

---

## 3. Custom Core Python Tools Deep-Dive

CIRO's custom tools do the heavy lifting of parsing, calling API endpoints, and evaluating logic.

### 3.1 `roman_urdu_parser` (Keyword-NLP Heuristics)
Located in `src/ciro/tools/roman_urdu_parser.py`.
-   Analyzes the text for ~40 emergency keywords in English and Roman Urdu (e.g. `pani`, `selab`, `barish` for flooding; `aag`, `shoala` for fire; `traffic`, `phas` for gridlock).
-   Detects matching Islamabad sector names (G-10, I-8, F-7, etc.).
-   Extracts Urdu particles (`mein`, `hai`, `ho`, `ka`) to identify Urdu speech.
-   Calculates confidence weights: 1 keyword = 0.5, 2 keywords = 0.75, 3+ keywords = 0.9, plus 0.1 bonus if sector is matched.

### 3.2 `weather_fetcher` (🟢 Real API Integration)
Located in `src/ciro/tools/weather_fetcher.py`.
-   Issues a GET request to Open-Meteo REST API:
    ```
    https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,precipitation,rain,weather_code&timezone=Asia/Karachi
    ```
-   Parses responses and maps weather severity:
    -   Precipitation > 10.0mm/hr $\rightarrow$ `heavy_rain` (corroborates flooding).
    -   Temperature > 40.0°C $\rightarrow$ `extreme_heat` (corroborates heatwaves).
-   If network fails, degrades gracefully by returning a safe default structure (`data_available: false`).

### 3.3 `corroboration_engine` (Scoring & Anti-Manipulation)
Located in `src/ciro/tools/corroboration_engine.py`.
-   Calculates scores across 5 data sources (Max 100 points):
    1.  **Weather API (30 pts):** Heavy rain corroborates flood (30 pts), light rain (15 pts), no rain (0 pts).
    2.  **Traffic Data (25 pts):** Traffic spikes in flood/road blocks (20 pts), fire (15 pts), default (5 pts).
    3.  **Citizen Reports (20 pts):** $\ge 5$ reports (20 pts), $\ge 3$ reports (15 pts), 1-2 reports (8 pts).
    4.  **IoT Sensors (15 pts):** Corroborating rain/humidity (15 pts), AQI spikes (12 pts), baseline (8 pts).
    5.  **Historical Hotspots (10 pts):** Checked against sector mapping (e.g. `G-10` is a flood hotspot $\rightarrow$ 10 pts).
-   > [!WARNING]
    > **Anti-Manipulation Capping:** If the engine finds zero similar citizen reports, no matching historical hotspots, and weather/traffic inputs are negative, the score is capped at **20 points** and `is_false_report` is set to `True`.

### 3.4 `impact_assessor` (Spatial Lookup Engine)
Located in `src/ciro/tools/impact_assessor.py`.
-   Stores baseline sector population details for Islamabad (e.g. `G-10`: 45,000, `I-8`: 38,000, `F-7`: 25,000, `Blue Area`: 12,000).
-   Calculates affected population size based on severity multipliers:
    *   `critical` $\rightarrow$ 90%
    *   `high` $\rightarrow$ 60%
    *   `medium` $\rightarrow$ 30%
    *   `low` $\rightarrow$ 10%
-   Appends nearby critical infrastructure at risk (e.g. Shifa Hospital, PIMS, Kashmir Highway).

### 3.5 `alert_dispatcher` (Response Simulator)
Located in `src/ciro/tools/alert_dispatcher.py`.
-   Constructs emergency tracking ticket IDs using format: `CIRO-YYYYMMDD-{RANDOM_HEX}`.
-   Selects channels and generates Before/After metrics for the EOC simulation dashboard:
    *   `Area Congestion:` 87% $\rightarrow$ 34%
    *   `Rescue ETA:` 25 min $\rightarrow$ 8 min
    *   `Alert Reach:` 0 $\rightarrow$ Population count
    *   `Resource Units deployed:` 0 $\rightarrow$ 4 units

---

## 4. The Human-in-the-Loop (HIL) Commander Gate

For safety and validation in high-stakes operations, CIRO gates automated logistics dispatch for all events with a corroboration score $\ge 80$ (which maps to `Severity.CRITICAL` / `CrisisStatus.AWAITING_APPROVAL`). 

The pipeline halts at the Response stage, and the FastAPI server handles HIL commander approval:

```
               Event set to `AWAITING_APPROVAL` (status)
                                │
                 WebSocket emit: `commander:approval_required`
                                │
                     Incident Commander Action
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
   POST /api/commander/approve        POST /api/commander/reject
   - status -> `ACTIVE`               - status -> `ARCHIVED`
   - appends notes & severity         - appends rejection reason
   - updates crisis store             - resolves tracking ticket
   - emits websocket: `crisis_updated` - emits websocket: `crisis_resolved`
```

### Endpoints Payload Schemas

#### Approve: `POST /api/commander/approve`
```json
{
  "eventId": "c162e27f-2718-493f-88a5-2246b59dddbd",
  "note": "On-ground patrol has confirmed flooding in G-10/2."
}
```
*Response (200 OK):*
```json
{
  "event_id": "c162e27f-2718-493f-88a5-2246b59dddbd"
}
```

#### Reject: `POST /api/commander/reject`
```json
{
  "eventId": "c162e27f-2718-493f-88a5-2246b59dddbd",
  "note": "Rejection note",
  "reason": "Patrol reported G-10 Markaz is fully clear; citizen report is a false alarm."
}
```

---

## 5. Pre-scripted Islamabad Crisis Scenarios

CIRO is packaged with **10 pre-scripted crisis scenarios** tailored to Islamabad's geography to serve as perfect educational and demonstration templates:

| # | Crisis Type | Location | Target Sector | Roman Urdu Report | Base Score | Escalation Status |
|---|---|---|---|---|---|---|
| 1 | `flood` | G-10 Markaz | `G-10` | *"G-10 mein pani bhar gaya hai, road band hai"* | 85 | `AWAITING_APPROVAL` |
| 2 | `traffic_gridlock` | I-8 Markaz | `I-8` | *"I-8 mein traffic gridlock ho gaya hai"* | 72 | `ACTIVE` |
| 3 | `heatwave` | F-7 Markaz | `F-7` | *"F-7 mein sakht garmi hai, log behosh ho rahe hain"* | 78 | `ACTIVE` |
| 4 | `flash_flood` | Nallah Lai | `Nallah Lai` | *"Nallah Lai mein paani ka bahao tez hai"* | 92 | `AWAITING_APPROVAL` |
| 5 | `power_outage` | G-6 Sector | `G-6` | *"G-6 sector mein bijli gayee hui hai"* | 65 | `ACTIVE` |
| 6 | `air_quality` | Expressway | `Expressway` | *"Expressway par dhool mitti aur pollution hai"* | 70 | `ACTIVE` |
| 7 | `road_collapse` | Margalla Road | `Margalla` | *"Margalla Road par zameen dhas gayi hai"* | 80 | `AWAITING_APPROVAL` |
| 8 | `fire` | Blue Area | `Blue Area` | *"Blue Area plaza mein aag lagi hai"* | 88 | `AWAITING_APPROVAL` |
| 9 | `traffic_gridlock` | Zero Point | `Zero Point` | *"Zero Point flyover par traffic band hai"* | 68 | `ACTIVE` |
| 10 | `sewage_overflow` | H-9 Markaz | `H-9` | *"H-9 streets mein sewage ka ganda pani hai"* | 75 | `ACTIVE` |

---

## 6. In-Memory Thread-Safe State Storage

To support high concurrent requests during hackathons without database overhead, CIRO uses a **thread-safe, in-memory repository** (`src/ciro/api/store.py`):

```python
import threading
from typing import Dict
from ciro.api.schemas import CrisisEventOut

class CrisisStore:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._data: Dict[str, CrisisEventOut] = {}

    def upsert(self, event: CrisisEventOut) -> None:
        with self._lock:
            self._data[event.event_id] = event

    def get(self, event_id: str) -> CrisisEventOut | None:
        with self._lock:
            return self._data.get(event_id)

    def list_active(self) -> list[CrisisEventOut]:
        with self._lock:
            # Filters out archived events, sorting active by corroboration score
            return sorted(
                [e for e in self._data.values() if e.status != CrisisStatus.ARCHIVED],
                key=lambda x: x.corroboration_score,
                reverse=True
            )
```

This guarantees thread-safety when async ThreadPool executors run background CrewAI flows and write to the same event simultaneously with REST API endpoint reads.
