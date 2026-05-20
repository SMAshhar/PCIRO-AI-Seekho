# PCIRO — Pakistan Crisis Intelligence & Response Orchestrator
### *Street Complaint to Coordinated Response in 60 Seconds*

[![Python](https://img.shields.io/badge/python-3.10%2B-blue)]()
[![License: MIT](https://img.shields.io/badge/license-MIT-green)]()
[![API: FastAPI](https://img.shields.io/badge/API-FastAPI-teal)]()
[![Orchestration: CrewAI_Flows](https://img.shields.io/badge/Orchestration-CrewAI%20Flows-orange)]()
[![LLM: Gemini_2.0_&_Ollama](https://img.shields.io/badge/LLM-Gemini%202.0%20%2F%20Ollama-purple)]()

PCIRO (Pakistan Crisis Intelligence & Response Orchestrator) is a state-of-the-art, adversarial-resistant, agentic AI platform designed for urban Pakistan, tailored to handle street reports in Roman Urdu, English, and Urdu, and orchestrate emergency logistics. 

Developed for the **#AISeekho 2026 Google Antigravity Hackathon (Challenge 3)**, CIRO introduces a highly performant **Hybrid Dual-Mode Architecture** combining instant microsecond local tool pipelines with full multi-agent CrewAI reasoning.

---

## 🏗️ System Architecture

PCIRO solves the fundamental challenge of modern LLM pipelines: **balancing deep multi-agent reasoning with sub-second API responsiveness**. To achieve this, it implements a hybrid execution flow:

```
                  Citizen Report (Roman Urdu/GPS)
                                 │
                                 ▼
                     POST /api/reports (FastAPI)
                                 │
            ┌────────────────────┴────────────────────┐
            │ (Synchronous Path - under 0.1s)         │ (Asynchronous Path - background worker)
            ▼                                         ▼
   ┌────────────────────────────────┐        ┌────────────────────────────────┐
   │ Local Tool Pipeline            │        │ Asynchronous CrewAI Flow       │
   │ (`pipeline.py` execution)      │        │ (Only if `CIRO_USE_CREW=true`) │
   ├────────────────────────────────┤        ├────────────────────────────────┤
   │ 1. `roman_urdu_parser`         │        │ 1. Ingest Crew (2 agents)      │
   │ 2. `weather_fetcher` (Live API)│        │    - Roman Urdu parsing        │
   │ 3. `corroboration_engine`      │        │    - Value normalization       │
   │ 4. `impact_assessor`           │        │ 2. Analysis Crew (3 agents)    │
   │ 5. `alert_dispatcher`          │        │    - Weather & signal scoring  │
   ├────────────────────────────────┤        │    - Threat detection & safety │
   │ Instantly generates a structured│        │    - Impact calculations      │
   │ `CrisisEventOut` event with    │        │ 3. Severity Router             │
   │ simulated traces & metrics for │        │    - score >= 80 -> HIL Gate   │
   │ real-time client responsiveness│        │ 4. Response Crew (2 agents)    │
   └────────────────┬───────────────┘        │    - Action lists & Roman Urdu │
                    │                        │    - Logistical dispatch tool  │
                    ▼                        └────────────────┬───────────────┘
            crisis_store.upsert()                             │
                    │                                         │
                    ├─────────────────────────────────────────┘
                    ▼
          Socket.IO Live Broadcast (crisis:new / crisis:updated)
```

1. **Synchronous Local Tool Pipeline (`pipeline.py`):** Runs the exact same core algorithms (parsing, weather fetching, corroboration scoring, spatial assessment, and logistics planning) using high-performance Python functions. Executes in **< 0.1 seconds**, ensuring the mobile client receives immediate visual feedback, fully mapped states, and simulated trace previews.
2. **Asynchronous Multi-Agent Flow (`flow_service.py`):** If `CIRO_USE_CREW=true` is enabled, the backend spawns a background worker via a `ThreadPoolExecutor` to run the true heavy LLM-based `CIROFlow` (orchestrated by CrewAI), updating the event in the background and emitting real-time updates via WebSockets when complete.

---

## 🤖 The CrewAI Flow & Specialized Agents

The CrewAI Flow (`CIROFlow` in `main.py`) manages the state of the crisis across 3 specialized crews utilizing **7 collaborative AI agents**:

```
[ Ingest Crew ] ───► [ Analysis Crew ] ───► [ Router ] ───► [ Response Crew ]
  - nlp_parser         - signal_corroborator                 - response_planner
  - data_normalizer    - event_detector                      - logistics_agent
                       - impact_assessor_agent
```

### 1. The Ingest Crew
*   **NLP Parser (`nlp_parser`):**
    *   *Role:* Roman Urdu NLP Crisis Parser.
    *   *Goal:* Parse citizen crisis reports written in Roman Urdu or English, extracting the crisis type, keywords, and geolocated sectors.
    *   *Backstory:* An expert in Pakistani languages, trained in informal Roman Urdu dialects like *"G-10 mein pani bhar gaya"* (flooding in G-10).
    *   *Tools:* `roman_urdu_parser` (local tokenization tool).
*   **Data Normalizer (`data_normalizer`):**
    *   *Role:* Crisis Data Normalizer.
    *   *Goal:* Structure and clean raw inputs into validated schemas matching strict system enums and verified Islamabad coordinates.
    *   *Backstory:* A data engineer specializing in emergency management telemetry; ensures records are sanitized and deduplicated.

### 2. The Analysis Crew
*   **Signal Corroborator (`signal_corroborator`):**
    *   *Role:* Multi-Signal Corroboration Analyst.
    *   *Goal:* Cross-reference reports against weather telemetry, traffic indices, sensor networks, and historical hotspots to calculate a credibility score.
    *   *Backstory:* A senior NDMA intelligence analyst who cross-checks all inputs, remaining vigilant against malicious or manipulated reports.
    *   *Tools:* `weather_fetcher`, `corroboration_engine`.
*   **Event Detector (`event_detector`):**
    *   *Role:* Crisis Event Detector and Classifier.
    *   *Goal:* Evaluate corroborated scores to officially detect a verified event and assign a status-dependent severity level.
    *   *Backstory:* An experienced EOC manager in Islamabad who categorizes crises based on objective data rather than alarmist reports.
*   **Impact Assessor (`impact_assessor_agent`):**
    *   *Role:* Impact Assessment Specialist.
    *   *Goal:* Calculate spatial impact, including population affected, hospitals/schools at risk, and estimated emergency arrival windows.
    *   *Backstory:* An urban planning specialist with deep geodata maps of Islamabad's sectors.
    *   *Tools:* `impact_assessor`.

### 3. The Response Crew
*   **Response Planner (`response_planner`):**
    *   *Role:* Emergency Response Planner.
    *   *Goal:* Generate prioritized action steps and dual-language (English and Roman Urdu) emergency alert broadcasts.
    *   *Backstory:* A logistics coordinator who plans deployments with clear priorities and measurable simulations.
*   **Logistics Agent (`logistics_agent`):**
    *   *Role:* Logistics and Alert Dispatcher.
    *   *Goal:* Execute response operations, assign emergency tracking tickets, and map alert channel matrices.
    *   *Backstory:* An EOC dispatch officer coordinating communications (SMS, Sirens, Radio).
    *   *Tools:* `alert_dispatcher`.

---

## 🛠️ Custom System Tools

CIRO implements 5 customized core tools inside `src/ciro/tools/`:

1.  **`roman_urdu_parser` (Heuristic NLP Parser):**
    *   Performs fast tokenization and keyword mapping (~40 Roman Urdu/English emergency keywords).
    *   Identifies Islamabad sector mentions (e.g., `G-10`, `I-8`, `F-7`, `Nallah Lai`) and calculates confidence weights.
2.  **`weather_fetcher` (🟢 Real API Integration):**
    *   Executes real HTTP requests to the **Open-Meteo REST API** to gather real-time precipitation, temperature, humidity, and wind telemetry.
    *   Provides graceful degradation (falls back to safe baselines if the network is unavailable).
3.  **`corroboration_engine` (Adversarial-Resistant Scorer):**
    *   Uses a strict multi-weighted scoring algorithm (Max 100 points):
        *   *Weather API (Rain/Storm verification):* 30 pts
        *   *Maps Traffic Congestion:* 25 pts
        *   *Citizen Report Counts:* 20 pts
        *   *IoT Sensor Feeds:* 15 pts
        *   *Historical Sector Hotspots:* 10 pts
    *   > [!WARNING]
        > **Anti-Manipulation Defense:** If a report is isolated (no historical hotspots, no corroborating weather/traffic spikes, and zero similar reports), the score is capped at a maximum of **20 points** and flagged as a `false_report` to prevent resource waste.
4.  **`impact_assessor` (Spatial Lookup Engine):**
    *   References an Islamabad sector database storing population figures, nearby hospitals (e.g., PIMS, Shifa), schools, and major roads.
    *   Scales impact dynamically using severity multipliers (Low: 10%, Medium: 30%, High: 60%, Critical: 90% population affected).
5.  **`alert_dispatcher` (Response Simulator):**
    *   Generates unique emergency tracking IDs (`CIRO-YYYYMMDD-XXXX`).
    *   Maps alert channels (Low/Medium → EOC Console only; High/Critical → SMS + Push Alerts; Critical → PA Sirens + Radio broadcast).
    *   Simulates Before/After metrics (e.g., Congestion 87% → 34%, Rescue ETA 25 min → 8 min).

---

## 🔄 Resilient Cascade LLM Loader

To ensure uninterrupted uptime during hackathon demos, CIRO utilizes a **Resilient Cascade LLM Loader** (`src/ciro/llm_config.py`):

```
                   Verify Gemini Flash API Key
                                │
                  ┌─────────────┴─────────────┐
        [Key Found & Valid]             [Verification Fails or Missing]
                  │                                   │
                  ▼                                   ▼
        Use Google Gemini (Cloud)           Fallback to Ollama (Local)
        - `gemini-1.5-flash`                - `ollama/batiai/gemma4-e4b:q6`
        - `gemini-2.0-flash`                - Base URL: `http://localhost:11434`
```

*   **Pinging Verification:** When started, `get_llm()` verifies the presence of `GEMINI_API_KEY`. If present, it executes a quick lightweight validation `"ping"` against `gemini-1.5-flash` or `gemini-2.0-flash`.
*   **Local Ollama Fallback:** If the key is absent, rate-limited, or fails verification, the engine catches the exception and falls back to the local Ollama LLM configured to `"ollama/batiai/gemma4-e4b:q6"`.

---

## 🌐 FastAPI Server & Real-time WebSockets

The backend runs a fully-featured FastAPI server that provides REST endpoints and WebSocket channels (Socket.IO) to link to mobile app frontends:

### 1. REST Endpoints
*   `GET /health` — Check server status, active thread queues, and total reports.
*   `GET /api/crises` — Retrieve all active, unarchived crisis events sorted by score.
*   `GET /api/crises/{id}` — Fetch detailed parameters of a specific event.
*   `GET /api/crises/{id}/trace` — Retrieve full JSON agent execution logs.
*   `GET /api/crises/{id}/simulation` — Get before/after metrics showing rescue impact.
*   `POST /api/reports` — Endpoint for mobile clients to submit citizen reports.
*   `POST /api/reports/upload` — Handle image uploads (e.g., disaster photos), returning unique URLs.
*   `POST /api/devices/register` — Register device IDs for push notifications.

### 2. Live Incident Commander Gates (HIL Validation)
When a critical report is verified (corroboration score $\ge 80$), its status changes to `AWAITING_APPROVAL`. It halts automated logistics until an Incident Commander reviews and hits the approval gates:
*   `POST /api/commander/approve` — Sets status to `ACTIVE`, appends commander notes, plans response actions, and broadcasts update.
*   `POST /api/commander/reject` — Sets status to `ARCHIVED` (resolved), files a rejection reason, and resolves the dashboard ticket.

### 3. WebSocket Event Emissions
*   `crisis:new` — Fired immediately when a new report is processed.
*   `crisis:updated` — Broadcasts when background crews complete or when commanders approve/reject a crisis.
*   `crisis:resolved` — Emits when an incident is closed or rejected.
*   `commander:approval_required` — Alerts operators that a critical crisis requires human validation.

---

## 📁 Repository Structure

```
test_antigravity/
├── ciro/                           # Python Backend Module
│   ├── src/ciro/
│   │   ├── api/                    # FastAPI Server & API Layer
│   │   │   ├── app.py              # Server configurations & routing
│   │   │   ├── events.py           # Socket.IO WebSocket manager
│   │   │   ├── pipeline.py         # Sync local tool pipeline (<0.1s execution)
│   │   │   ├── flow_service.py     # Background CrewAI async flow scheduler
│   │   │   └── store.py            # In-memory thread-safe state storage
│   │   ├── crews/                  # CrewAI Crews
│   │   │   ├── ingest_crew/        # parsing & normalizer crew
│   │   │   ├── analysis_crew/      # weather, corroboration & impact crew
│   │   │   └── response_crew/      # emergency planner & logistics crew
│   │   ├── tools/                  # Customized core python tools
│   │   ├── schema/                 # Pydantic typing schemas
│   │   ├── main.py                 # CIROFlow orchestration class
│   │   └── llm_config.py           # Resilient Gemini & Ollama cascade loader
│   ├── tests/                      # Automated unittest suite
│   ├── pyproject.toml              # UV dependencies & build configs
│   └── uv.lock                     # UV locked requirements
├── DESIGN.md                       # Mobile EOC Design System specifications
├── HOW_IT_WORKS.md                 # Deep Developer Integration specifications
├── MOBILE_APP.md                   # React Native mobile app details
├── CLAUDE.md                       # LLM agent developer guidelines
└── README.md                       # This File
```

---

## 🚀 Installation & Running Guide

### 1. Install `uv`
Ensure you have `uv`, the extremely fast Python package manager:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Sync Dependencies
Enter the `ciro` directory and synchronize all virtual environment packages:
```bash
cd ciro
uv sync
```

### 3. Setup Configuration
Create a `.env` file under `ciro/` directory:
```bash
cp .env.example .env
```
Ensure you have set:
*   `GEMINI_API_KEY` (if you want Gemini support).
*   `CIRO_USE_CREW=true` (to trigger full CrewAI background multi-agent runs).

### 4. Setup Local LLM (If using Ollama Fallback)
If you do not have a Gemini key, ensure Ollama is installed and running locally:
```bash
ollama serve
ollama pull batiai/gemma4-e4b:q6
```

### 5. Launch the Server
Start the FastAPI server live on port `8000`:
```bash
uv run serve
```

### 6. Submit a Test Report
Submit an emergency report (e.g., Roman Urdu flooding in G-10) using `curl`:
```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "text": "G-10 mein pani bhar gaya hai, road block hai",
    "crisis_type": "unknown",
    "location": {"lat": 33.6844, "lon": 73.0479, "sector": "G-10"},
    "device_id": "cli-test-device"
  }'
```

### 7. Run Verification Tests
Verify all configuration, LLM cascading, and REST routing components work correctly:
```bash
uv run python -m unittest tests/test_llm_config.py
uv run python -m unittest tests/test_api.py
```
