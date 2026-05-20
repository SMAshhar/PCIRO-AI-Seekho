# CIRO Backend Orchestration Module
### *FastAPI Server & CrewAI Multi-Agent Execution Engine*

This directory houses the complete Python-native backend implementation of **CIRO (Crisis Intelligence & Response Orchestrator)**. It contains the FastAPI REST/Socket.IO server, the fast synchronous local tool pipeline (`pipeline.py`), and the CrewAI agentic flows (`main.py`).

For high-level details, diagrams, and architecture descriptions, please see the **[Root README.md](../README.md)**.

---

## 🚀 Quick Start Guide

### 1. Synchronize Virtual Environment
Ensure you have the `uv` package manager installed, then run sync to lock down exact dependencies:
```bash
# In the `ciro/` directory
uv sync
```

### 2. Configure Environment Variables
Copy the env template file:
```bash
cp .env.example .env
```
Open `.env` and set the following parameters:
-   `GEMINI_API_KEY`: Set your Google Gemini API key.
-   `CIRO_USE_CREW`: Set to `true` if you want to execute full, heavy, asynchronous CrewAI multi-agent crews in the background. Set to `false` to rely purely on our high-performance synchronous local tool pipeline (<0.1s responsiveness).
-   `CIRO_FLOW_WORKERS`: Number of background ThreadPool worker threads (default `2`).

### 3. Run Local Ollama LLM (Fallback)
If a Gemini API key is not provided or fails verification, the resilient cascade LLM loader automatically falls back to local Ollama. Ensure Ollama is running and has the target model pulled:
```bash
ollama serve
# In another terminal:
ollama pull batiai/gemma4-e4b:q6
```

### 4. Launch the FastAPI Server
Launch the live REST and Socket.IO server on port `8000`:
```bash
uv run serve
```

---

## 🧪 Verification & Testing

CIRO includes a rigorous suite of automated unit tests covering local LLM configs, fallback cascade loaders, and mock server routing.

Run all tests synchronously:
```bash
# Run LLM Configuration and verification tests
uv run python -m unittest tests/test_llm_config.py

# Run API Integration, commander action, and endpoint tests
uv run python -m unittest tests/test_api.py
```

---

## 📁 Source Code Layout

```
ciro/
├── src/ciro/
│   ├── api/                      # REST & Socket.IO WebSockets Server
│   │   ├── app.py                # Route controllers & server config
│   │   ├── events.py             # Socket.IO WebSocket manager
│   │   ├── pipeline.py           # Sync local tool pipeline (<0.1s execution)
│   │   ├── flow_service.py       # ThreadPoolExecutor background worker scheduler
│   │   └── store.py              # Thread-safe in-memory crisis repository
│   ├── crews/                    # CrewAI Orchestration
│   │   ├── ingest_crew/          # Roman Urdu Parser & Data Normalizer
│   │   ├── analysis_crew/        # Weather fetcher, Corroborator, Event Classifier & Assessor
│   │   └── response_crew/        # Alert Dispatcher & Logistics Planner
│   ├── tools/                    # Core custom Python tool logic
│   │   ├── roman_urdu_parser.py  # Fast geodata & intent tokenization
│   │   ├── weather_fetcher.py    # Live GET requests to Open-Meteo REST API
│   │   ├── corroboration_engine.py# Adversarial-resistant scoring math
│   │   ├── impact_assessor.py    # Spatial population lookup database
│   │   └── alert_dispatcher.py   # Simulation metrics & ticket dispatch
│   ├── schema/                   # Shared Pydantic data schemas
│   │   └── models.py             # System models (NormalizedSignal, Event, etc.)
│   ├── main.py                   # CIROFlow class and CLI run commands
│   └── llm_config.py             # Resilient Gemini & Ollama cascade loader
├── tests/                        # Configuration & Integration tests
├── pyproject.toml                # UV package configurations
└── uv.lock                       # UV locked requirement file
```
