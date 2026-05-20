# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CIRO (Crisis Intelligence & Response Orchestrator)** — a multi-agent AI system for citizen-reported crisis detection and response in Islamabad, Pakistan. Built for the #AISeekho 2026 Google Antigravity Hackathon (Challenge 3). The working backend implementation lives in the `ciro/` subdirectory.

## Commands

All commands run from the `ciro/` directory:

```bash
# Install dependencies
pip install uv
uv sync

# Run the CIRO Flow (default scenario: G-10 flooding report)
crewai run

# Run with a custom trigger payload
python -m ciro.main  # calls run_with_trigger() if JSON provided

# Test crew execution
crewai test
crewai test -n 5 -m gpt-4o  # custom iterations + model

# Visualize the flow as an HTML diagram
crewai flow plot

# Replay from a specific task ID
crewai replay -t <task_id>

# Start FastAPI + Socket.IO server (port 8000)
uv run serve
```

## Architecture

### Flow Orchestration (`src/ciro/main.py`)

CrewAI Flow pattern with three sequentially chained crews:

```
Ingest Crew → Analysis Crew → router() → Response Crew
```

- `@start()` → `ingest_report()` — entry point, populates `CIROState.raw_report`
- `@listen()` chains bind crews together
- `@router()` → `route_by_severity()` — branches on `corroboration_score ≥ 80` (critical) vs < 80 (routine)
- `CIROState` carries all inter-crew state; crews read from and write back to this model.

### Three Crews

| Crew | Location | Key Agents | Output |
|---|---|---|---|
| **IngestCrew** | `crews/ingest_crew/` | NLP Parser, Data Normalizer | `NormalizedSignal` |
| **AnalysisCrew** | `crews/analysis_crew/` | Signal Corroborator, Event Detector, Impact Assessor | `CorroboratedEvent` + score |
| **ResponseCrew** | `crews/response_crew/` | Response Planner, Logistics & Alert Dispatcher | `ActionPlan` |

Each crew has `config/agents.yaml` and `config/tasks.yaml` — the YAML files declare agents and tasks; Python files wire them into `Crew` objects.

### Custom Tools (`src/ciro/tools/`)

- **`roman_urdu_parser.py`** — keyword-based NLP; extracts crisis type, sectors, and confidence from Roman Urdu/English text.
- **`weather_fetcher.py`** — **🟢 Real API Integration** — Executes HTTP GET calls to the free Open-Meteo REST API endpoint to gather live weather telemetry for the coordinates.
- **`corroboration_engine.py`** — core innovation; scores 0–100 across five sources (weather 30 + traffic 25 + citizens 20 + sensors 15 + history 10); single-source reports are capped at 20 and flagged as potential false reports.
- **`impact_assessor.py`** — affected zone and population estimation using Islamabad population databases.
- **`alert_dispatcher.py`** — simulates emergency ticket creation and alert distribution; produces Before/After metric deltas.

### Data Models (`src/ciro/schema/models.py`)

All inter-agent data contracts are Pydantic models. Key types:
- `CrisisType` enum: flood, fire, heatwave, road_blockage, power_outage, air_quality, flash_flood, earthquake, traffic_gridlock, sewage_overflow
- `Severity` enum: low / medium / high / critical
- `NormalizedSignal` → `CorroboratedEvent` → `ImpactAssessment` → `ActionPlan` — the linear pipeline

### LLM Configuration (`src/ciro/llm_config.py`)

Primary LLM is **Google Gemini 2.0 Flash** (declared in YAML configs). The resilient cascade loader `get_llm()` verifies keys with a lightweight validation `"ping"` call, and automatically cascades to the local Ollama LLM (`ollama/batiai/gemma4-e4b:q6` on `http://localhost:11434`) if Gemini fails.

## Mobile App (`apps/mobile/`)

React Native CLI (not Expo) app serving two user roles: citizens reporting crises and operators/Incident Commanders managing response. Full spec is in `MOBILE_APP.md`.

```bash
# From apps/mobile/
npm install                    # Install dependencies
npx react-native run-android   # Run on Android device/emulator
npx react-native run-ios       # Run on iOS simulator (macOS only)
npx react-native start         # Start Metro bundler separately
```

## Key Design Decisions

- **Multi-signal corroboration is adversarial-resistant by design**: a single citizen report cannot trigger an emergency response without corroborating signals. This is the core differentiator.
- **State flows via `CIROState`**: crews do not call each other directly; all data passes through the Flow state object.
- **Dual-Mode Execution**: The system implements an instant synchronous local tool pipeline (`pipeline.py`) running in under 0.1s to return responsive schemas to clients, and runs the heavy asynchronous multi-agent CrewAI flow in the background if `CIRO_USE_CREW=true` is set.
- **AGENTS.md** at the ciro subdirectory is a CrewAI API reference guide; consult it when working with CrewAI patterns.
