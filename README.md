# Smart Urban Community Resilience System

[![Python](https://img.shields.io/badge/python-3.10%2B-blue)]()
[![License: MIT](https://img.shields.io/badge/license-MIT-green)]()
[![CI](https://img.shields.io/badge/ci-pending-yellow)]()

A sophisticated AI-powered system for urban emergency management and community resilience using CrewAI. This project implements an intelligent system that monitors, analyzes, and responds to urban emergencies through a network of specialized AI agents.

# Vision >>> [link](https://github.com/SMAshhar/CrewAiChallenge-Smart-Urban-Community-Resilience/blob/main/Smart%20Urban%20Community%20Resilience.pdf) <<<

#### ⚠️ NOTE:-
- This repo contains the **Agentic / GenAI** portion only. Event-driven infra is planned but not fully implemented.
- Some tools (for example the Communicator) are partially implemented — agent calls may be iterative until tool pipelines are completed. We are optimizing for fewer calls.
- Performance: experimental runs show **high token usage** with the current agent traces. See `PERFORMANCE.md` for measured values and mitigations.

## 🌟 Features

- Real-time data collection from multiple sources (weather, IoT sensors, citizen reports)
- Automated event detection and classification
- Spatial impact assessment and resource optimization
- Intelligent routing and logistics planning
- Multi-channel communication system
- Privacy-aware data handling
- Human-in-the-loop validation
- Continuous learning and improvement

## 🏗 Architecture

The system is built on a modern event-driven architecture with these key components:

1. **Data Ingestion Layer**: Collects data from various sources
2. **Processing Pipeline**: Normalizes and validates data
3. **Event Detection System**: Identifies and classifies urban incidents
4. **Response Planning**: Assesses impact and allocates resources
5. **Execution Layer**: Handles logistics and communications
6. **Learning System**: Provides continuous improvement
7. **Privacy Layer**: Ensures data protection and compliance

### High-level Architecture

```
Data Sources -> Ingest Layer -> Event Bus -> Agent Runtimes (Crews) -> Action & Execution Systems -> Human-in-the-loop UI / Dashboard -> Storage & ML Pipeline -> Observability / Security / Admin
```

#### Key Components:

- **Data Sources:** weather APIs, air-quality feeds, sensor networks (MQTT), citizen reports, emergency feeds (USGS, NWS), municipal systems, social listening
- **Ingest Layer:** collectors + normalizer + enrichment (geocoding, reverse geocoding)
- **Event Bus:** durable stream (Kafka / managed streaming) or pub/sub for inter-agent comms and replay
- **Agent Runtimes:** CrewAI agents (stateless where possible, state in DB / caches) grouped across Monitor → Analyze → Respond phases
- **Action & Execution:** dispatchers that call SMS/email, municipal dispatch systems, volunteer platforms, or 3rd-party tools
- **Human-in-the-loop UI:** role-based dashboard (map + timeline + approval pane)
- **Storage & ML:** time-series DB for sensor stream, PostGIS for spatial, object storage for logs, ML training pipeline & model registry
- **Observability / Security / Admin:** Prometheus/Grafana, tracing/Sentry, CrewAI Maxim/agent-evals for per-execution traces and evaluation

## 🤖 Agent System

**11 specialized agents** — short form. See `config/agents.md` for configs and detailed I/O.

1. **Feed Collector** — gathers weather, OpenAQ, USGS, MQTT, citizen webhooks → `raw.feeds`.
2. **Data Normalizer & Enricher** — schema validation, geocoding, dedupe → `events.normalized`.
3. **Data Validator** — integrity checks and schema enforcement.
4. **Event Detector & Classifier** — rules + lightweight ML → `events.detected` (type, confidence).
5. **Impact Assessor** — maps affected polygons, population, infra impact → `events.assessed`.
6. **Resource Recommender & Prioritizer** — resource assignments & ETA → `plans.recommended`.
7. **Logistics & Routing Agent** — dispatch routing + commands → `plans.executed`.
8. **Communicator** — formats messages for dashboard, SMS, email, social drafts.
9. **Human-in-the-loop Validator (Incident Commander)** — approval/modification UI.
10. **Learning & Feedback Agent** — creates training datasets, queues retraining.
11. **Privacy & Consent Manager** — PII handling, anonymization, consent audits.

## 🚀 Getting Started

### Prerequisites

- Python 3.10+ (as specified in pyproject.toml)
- PostgreSQL with PostGIS extension
- Redis (for caching)
- Docker (optional)

---

## 🚀 Installation and Running

Follow these simple steps to get the Smart Urban Resilience System up and running.

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
 git clone https://github.com/SMAshhar/CrewAiChallenge-Smart-Urban-Community-Resilience.git
cd smart-urban-resilience
```

### 2. Install `uv`

Ensure you have `uv`, the fast Python package installer, installed on your system. If you don't have it, you can install it with the following command:

```bash
wget -qO- https://astral.sh/uv/install.sh | sh
```
OR
```
curl -LsSf https://astral.sh/uv/install.sh | sh
```
OR
```
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 3. Install CrewAI

Make sure the CrewAI command-line tool is installed. If it's not already installed globally, you can add it with pip:

```bash
uv tool install crewai
```

### 4. Set Up Environment Variables

Configure your environment variables by creating a `.env` file from the provided example.

```bash
cp .env.example .env
```

Edit the newly created `.env` file with your specific API keys and configuration values.

### 5. Run the System

Go to the "main.py" file and set the location coordinates as you like . (KHI and LA are ready to test)
You are now ready to run the system. Set the coordinates in the main.py (currently set for LA and Karachi) file and execute the following command from the root folder of the project:

```bash
crewai run
```

This command will automatically handle the project dependencies (using `uv` and the `pyproject.toml` file) and start the Smart Urban Resilience System.

### Replaying Crew Execution

To replay a previous crew execution from a specific task ID:

```bash
python smart_urban_resilience/src/smart_urban_resilience/main.py replay <task_id>
```

Or using the project script:
```bash
replay <task_id>
```

### Testing the Crew

To test the crew execution:

```bash
python smart_urban_resilience/src/smart_urban_resilience/main.py test <n_iterations> <eval_llm>
```

Or using the project script:
```bash
test <n_iterations> <eval_llm>
```

### Accessing the Dashboard

After starting the system, you can access the dashboard at:
```
http://localhost:8000/dashboard
```

## 📁 Project Structure

```
CrewAiChallenge-Smart-Urban-Community-Resilience/
├── .gitignore
├── architecture.md
├── README.md                 <- This file
└── smart_urban_resilience/
    ├── .env                  <- Environment variables (create this file)
    ├── .gitignore
    ├── pyproject.toml        <- Project configuration and dependencies
    ├── README.md             <- Additional README
    ├── requirements.txt      <- Project dependencies
    ├── test.py
    ├── uv.lock
    ├── data/                 <- Stores output data from tasks
    │   ├── 1-normalized_data.json
    │   ├── ...
    │   └── Urban Sensor Data Collector/
    │       └── karachi_data.json
    ├── knowledge/            <- Stores knowledge base files
    │   └── user_preference.txt
    └── src/
        └── smart_urban_resilience/
            ├── __init__.py
            ├── crew.py       <- Defines agents, tasks, and the CrewAI workflow
            ├── main.py       <- Entry point for running the system
            ├── config/
            │   ├── agents.yaml   <- Agent configurations
            │   └── tasks.yaml    <- Task configurations
            ├── schema/
            │   └── DataNormalizationSchema.py <- Pydantic schemas for data validation
            └── tools/            <- Custom tools used by agents
                ├── __init__.py
                ├── CommunicationTool.py
                ├── custom_tool.py
                ├── DataFetchTool.py
                ├── DataNormalizationTool.py
                ├── EventDetectionTool.py
                ├── FileStorageTool.py
                ├── ImpactAcessorTool.py
                ├── LearningTool.py
                ├── Logistics_RoutingTool.py
                ├── MessageNormalizationTool.py
                ├── PrivacyTool.py
                ├── QDrantToo.py
                ├── ResourcePlannerTool.py
                └── ValidationTool.py
```


## 📊 Data Model

The system uses a canonical JSON schema for events:

```json
{
  "event_id": "uuid-v4",
  "ingest_timestamp": "2025-10-03T12:34:56Z",
  "source": "openweather|openaq|sensor|citizen_report|usgs",
  "raw_source_id": "<original id/uri>",
  "type": "flood|air_quality|earthquake|power_outage|road_block",
  "location": {
    "lat": 24.8607,
    "lon": 67.0011,
    "zone_id": "city:ward:12",
    "address": "optional string"
  },
  "severity": "low|medium|high|critical",
  "confidence": 0.92,
  "evidence": [
    {"type":"sensor","id":"sensor-42","value": "0.85m", "ts":"..."},
    {"type":"tweet","id":"...","text":"..."}
  ],
  "recommended_action": "shelter_open|dispatch_crew|advisory_sms",
  "idempotency_token": "sha256-of-event-payload",
  "trace_id": "crewai-trace-xxx"
}
```

## 🛠 Tech Stack

- **Orchestration / Agent Engine:** CrewAI flows + Maxim observability
- **Event Bus / Streaming:** Apache Kafka (or managed equivalent)
- **IoT Ingress:** MQTT broker (Eclipse Mosquitto) for sensor telemetry
- **Time-series storage:** TimescaleDB (Postgres + PostGIS) for sensor & event time-series and spatial queries
- **Geospatial:** PostGIS for spatial queries; Mapbox (commercial) or Nominatim (OSM) for geocoding; OSRM for routing/ETA
- **Air / Weather / Hazard feeds:** OpenWeather (global weather), OpenAQ (air quality), NWS/NOAA (official alerts), USGS for earthquakes
- **Messaging / Notifications:** Twilio for SMS / WhatsApp; SMTP for email
- **Dashboard / Human-in-loop UI:** React + Map (Mapbox GL or Leaflet) + role-based auth
- **ML infra:** Airflow for orchestration, MLflow for model registry
- **Observability:** CrewAI Maxim for agent traces; Prometheus + Grafana for infra metrics; Sentry for exceptions
- **Security:** Vault/KMS for secrets, TLS for all transport, OAuth2 for external APIs, RBAC
- **DevOps:** Docker + Kubernetes (or managed k8s); CI/CD pipelines, blue/green for agent changes

## 🧪 Testing

Run the test suite:
```bash
pytest tests/
```

Run with coverage:
```bash
pytest --cov=smart_urban_resilience tests/
```

### Testing Strategy

1. **Synthetic event generator:** script that simulates heavy rain → sensor spike → social reports → roadway flooding
2. **Tabletop scenarios:** run 3 scenarios (fast flood, medium earthquake, air-quality spike)
3. **Replay & A/B:** store all runs; replay to test rule changes
4. **Chaos / failure tests:** simulate Mapbox outage, Twilio latency to show graceful fallback

## 🔐 Security

- All sensitive data is encrypted at rest
- PII is handled according to GDPR guidelines
- Role-based access control for all operations
- Audit logging for all critical actions
- Secrets & keys stored in KMS/Vault; rotate keys
- Access control, RBAC for dashboard & approval flows
- Audit logs for every action (who approved, what changed)
- Data retention policy & PII minimization
- Local law checks: municipal data sharing agreements before integrating live systems

## 🔄 Reliability & Safety Patterns

1. **Event-driven & Replayable:** stream everything to Kafka so you can replay when rules change or during post-event analysis
2. **Idempotency for actions:** every external command (dispatch, SMS) uses idempotency token
3. **Circuit Breakers & Rate Limits:** protect downstream APIs (Twilio, Mapbox) with circuit breakers & retry windows
4. **DLQ & Poison Message Handling:** malformed inputs or repeated failures go to DLQ and a human queue
5. **Graceful degradation:** if geocoding API fails, fall back to bounding-box heuristics
6. **Human approval gating:** for `critical` events or low-confidence outputs, block auto-actions until Incident Commander agent approves
7. **Versioned rules & canary rollouts:** push new rule sets/models behind feature flags
8. **Privacy-first:** implement a Consent Manager; minimize PII in public channels

## 📈 Observability & Evaluation

- **Per-agent traces & Evals:** use CrewAI Maxim to capture agent tool calls, decisions and outputs for every run
- **Metrics to track:**
  - Ingest rate, processing latency (ms) for each agent
  - Time from detection → notification (goal: under X minutes for `critical`)
  - False positive / negative rate (from human feedback)
  - Number of DLQ items and root causes
  - Uptime SLAs for critical external connectors (Twilio, Mapbox)
- **Dashboards:** Grafana for infra + CrewAI trace viewer for per-run breadcrumbs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- My Wife and Family
- My Abbi and Ammi
- CrewAI framework
- OpenWeatherMap API
- Mapbox
- OSRM
- All contributors and maintainers

## 📞 Contact

Syed M. Ashhar - [GitHub](https://github.com/SMAshhar)
Email - [mailto] syed.muhammad.ashhar@gmail.com
Contact No. - [tel] 0092-344-3156626
Project Link: [https://github.com/SMAshhar/CrewAiChallenge-Smart-Urban-Community-Resilience.git](https://github.com/SMAshhar/CrewAiChallenge-Smart-Urban-Community-Resilience.git)


# Extra recommended files to add (quick list)
- `docs/agents.md` (detailed I/O, sample messages, failure modes)
- `PERFORMANCE.md` (measurements + mitigation checklist)
- `SECURITY.md` (threat model + PII flows)
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `ISSUE_TEMPLATE.md`, `PULL_REQUEST_TEMPLATE.md`
- `docker-compose.yml` and `scripts/bootstrap.sh`
- `.env.example` with keys/format
- `examples/` containing one runnable synthetic scenario + expected artifacts

## 📚 References

- [CrewAI Documentation](https://docs.crewai.com/)
- [OpenWeather API](https://openweathermap.org/api)
- [OpenAQ Docs](https://docs.openaq.org/about/about)
- [National Weather Service API](https://www.weather.gov/documentation/services-web-api)
- [USGS Earthquake Hazards API](https://earthquake.usgs.gov/fdsnws/event/1/)
- [Twilio Messaging API](https://www.twilio.com/docs/messaging/api)
- [Eclipse Mosquitto Documentation](https://mosquitto.org/documentation/)
- [TimescaleDB GitHub](https://github.com/timescale/timescaledb)
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [OSRM API Documentation](https://project-osrm.org/docs/v5.10.0/api/)
- [FEMA National Incident Management System](https://www.fema.gov/emergency-managers/nims)


