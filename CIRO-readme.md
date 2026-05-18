# CIRO — Crisis Intelligence & Response Orchestrator

> **"From street complaint to coordinated response in under 60 seconds"**

---

| Field | Detail |
|---|---|
| **Hackathon** | #AISeekho 2026 Google Antigravity Hackathon |
| **Challenge** | Challenge 3 — Crisis Intelligence & Response Orchestrator |
| **Team Size** | 3 Members |
| **Deadline** | May 20, 2026 |
| **Stack** | Google Antigravity · React Native · Node.js · QDrant · PostGIS |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Agent Architecture](#4-agent-architecture)
5. [Multi-Signal Corroboration Engine](#5-multi-signal-corroboration-engine)
6. [Full Technology Stack](#6-full-technology-stack)
7. [Features](#7-features)
8. [UI Design & Theme](#8-ui-design--theme)
9. [Islamabad Mock Crisis Dataset](#9-islamabad-mock-crisis-dataset)
10. [Evaluation Score Mapping](#10-evaluation-score-mapping)
11. [7-Day Build Plan](#11-7-day-build-plan)
12. [Project Folder Structure](#12-project-folder-structure)
13. [Deliverables Checklist](#13-deliverables-checklist)
14. [Why CIRO Wins](#14-why-ciro-wins)

---

## 1. Executive Summary

Pakistan faces recurring urban crises — flash floods, road blockages, heatwaves, infrastructure failures — that cost lives and billions of rupees annually. Existing response systems are fragmented, reactive, and slow. **CIRO changes that.**

CIRO is an Agentic AI System that ingests signals from multiple independent sources, detects emerging crisis situations with verifiable confidence scores, generates coordinated response actions, simulates their execution, and shows measurable impact — all within 60 seconds of a crisis emerging.

Unlike naive systems that blindly trust citizen reports, CIRO uses a **Multi-Signal Corroboration Engine**: no single source triggers a response. Events only escalate when independent signals collectively cross a credibility threshold. This prevents false alarms while ensuring real crises are caught early.

> **KEY INNOVATION:** Multi-Signal Corroboration Engine — one person cannot trigger a false alert. Weather APIs, Maps traffic data, IoT sensors, and multiple citizen reports must corroborate before any action is taken.

Built on Google Antigravity for core orchestration, CIRO deploys 8 specialized agents through a structured reasoning pipeline — fully traceable, auditable, and locally relevant to Pakistan's urban geography.

| Metric | Value |
|---|---|
| Detection to Alert Time | < 60 seconds |
| Number of AI Agents | 8 specialized agents |
| Orchestration Platform | Google Antigravity |
| Mobile App | React Native (iOS + Android) |
| Web Dashboard | Next.js operator console |
| Crisis Scenarios | 10 Islamabad mock scenarios |
| Languages Supported | English, Urdu, Roman Urdu |
| Previous Foundation | CrewAI Smart Urban Resilience (AEROHACK / TECKNOFEST winner) |

---

## 2. Problem Statement

### 2.1 The Urban Crisis Reality in Pakistan

Islamabad and Rawalpindi — like most Pakistani metropolitans — face the following recurring crises:

- Flash floods during monsoon season (G-10, I-8, F-7 are high-risk zones)
- Road blockages from accidents, protests, or waterlogging
- Heatwaves causing medical emergencies (May–July peak)
- Infrastructure failures: power grid, water supply, sewage overflow
- Air quality spikes from traffic congestion and industrial activity

### 2.2 The Systemic Failure

Current response systems fail because they are:

- **Fragmented** — NDMA, local government, police, hospitals operate in silos with no shared data layer
- **Reactive** — response begins only after crisis is fully formed, not while it is emerging
- **Slow to coordinate** — manual phone calls and WhatsApp groups cause 30–90 minute response delays
- **Signal-blind** — critical data (weather APIs, traffic maps, social media) exists but is never fused

> **THE GAP:** Critical signals exist everywhere — weather APIs, Google Maps traffic, citizen reports on social media — but no system connects them into actionable decisions in real time.

### 2.3 The False News Problem

Any system relying on citizen input faces a fundamental adversarial threat: one person can report a false crisis and trigger emergency response protocols. CIRO solves this through **Multi-Signal Corroboration** — detailed in Section 5.

---

## 3. Solution Overview

### 3.1 What CIRO Does

CIRO is a full-stack Agentic AI System that:

1. Ingests signals from multiple independent sources simultaneously (social media, weather APIs, traffic data, IoT sensors, citizen app reports)
2. Runs signals through a Multi-Signal Corroboration Engine that assigns credibility scores — no single source triggers action
3. Detects emerging crisis situations using 8 specialized AI agents orchestrated via Google Antigravity
4. Generates coordinated response plans: traffic rerouting, emergency dispatch, public alerts
5. Simulates execution of response actions with visible before/after system state
6. Shows full agent reasoning trace, decision flow, and outcome logs (required Antigravity deliverable)

### 3.2 The 60-Second Demo Flow

| Time | Event | Agent Active |
|---|---|---|
| 00:00 | Citizen types: *"G-10 mein pani bhar gaya hai, gaariyan phans gayi hain"* | Roman Urdu NLP Agent |
| 00:08 | NLP parses: Location=G-10, Event=Flooding, Language=Roman Urdu | Data Normalizer Agent |
| 00:14 | Weather API confirms: 45mm/hr rainfall — heavy rainfall alert active | Data Normalizer Agent |
| 00:18 | Maps confirms: Traffic spike 340% above baseline on G-10 road | Event Detector Agent |
| 00:22 | Corroboration score: 85/100 — threshold crossed | Corroboration Engine |
| 00:26 | Crisis detected: Urban Flooding — Confidence 94% — Severity: Critical | Event Detector Agent |
| 00:30 | Impact: 3,200 residents affected across G-10/1 through G-10/4 | Impact Assessor Agent |
| 00:34 | Incident Commander notified — approves response plan (human-in-loop) | Incident Commander |
| 00:40 | 3 simulations run: route update + emergency ticket + push alert | Response + Logistics + Comms |
| 00:50 | Before/After dashboard shown — congestion -60%, rescue ETA 8 mins | Dashboard |
| 00:55 | Antigravity trace log exported — full reasoning chain visible | Antigravity Console |

---

## 4. Agent Architecture

### 4.1 Google Antigravity as Orchestration Core

All 8 agents run through Google Antigravity. Every agent handoff, tool call, reasoning step, and decision is logged in the Antigravity workplan and task plan — directly satisfying the 25% evaluation criterion.

> **ANTIGRAVITY ROLE:** Antigravity manages: agent workflow orchestration, multi-step reasoning pipeline, tool routing (Maps, Weather, Notifications), action execution, and exportable trace logs with timestamps and decision flow.

### 4.2 The 8 Specialized Agents

| # | Agent Name | Input | Output | Source |
|---|---|---|---|---|
| 1 | Roman Urdu NLP Agent | Raw text (any language) | Structured JSON event | **NEW for CIRO** |
| 2 | Data Normalizer & Enricher | Raw multi-source signals | Canonical event schema | Ported from prev. project |
| 3 | Corroboration Engine | Multiple normalized signals | Credibility score 0–100 | **NEW for CIRO** |
| 4 | Event Detector & Classifier | Corroborated signals | Crisis type + confidence % | Ported from prev. project |
| 5 | Impact Assessor | Detected event + location | Affected zones + population | Ported from prev. project |
| 6 | Response Planner | Impact assessment | Coordinated action plan | Ported from prev. project |
| 7 | Logistics & Comms Agent | Action plan | Route updates + alerts + tickets | Ported from prev. project |
| 8 | Incident Commander (HIL) | Critical event plans | Human approval / rejection | Ported from prev. project |

### 4.3 Agent Pipeline Flow

```
Signal Ingestion
      ↓
Roman Urdu NLP Normalization
      ↓
Data Normalizer & Enricher (Weather API + Maps + IoT)
      ↓
Corroboration Scoring Engine
      ↓
Event Detection & Classification
      ↓
Impact Assessment (PostGIS zone queries)
      ↓
[Human Gate — Incident Commander] ← Critical events only
      ↓
Response Planning
      ↓
Action Simulation (3 parallel: Route + Ticket + Alert)
      ↓
Outcome Logging + Antigravity Trace Export
```

### 4.4 Tools Used Per Agent

| Agent | Tools / APIs |
|---|---|
| Roman Urdu NLP Agent | Custom Urdu tokenizer, Google Translate API (fallback), LangDetect |
| Data Normalizer | Open-Meteo Weather API, Google Maps Places API, Geocoding API, Nominatim |
| Corroboration Engine | QDrant vector DB (historical pattern matching), custom scoring algorithm |
| Event Detector | QDrant similarity search, rule-based classifier, ML confidence scorer |
| Impact Assessor | PostGIS spatial queries, Islamabad zone dataset, population density data |
| Response Planner | OSRM routing engine (mock), resource allocation rules engine |
| Logistics & Comms | Mock SMS gateway, push notification service, emergency ticket system |
| Incident Commander | React Native approval UI, WebSocket real-time notification |

### 4.5 Canonical Event JSON Schema

```json
{
  "event_id": "uuid-v4",
  "ingest_timestamp": "2026-05-18T14:30:00Z",
  "source": "citizen_report | weather_api | maps_api | iot_sensor",
  "raw_text": "G-10 mein pani bhar gaya hai",
  "parsed_language": "roman_urdu",
  "type": "flood | road_block | heatwave | power_outage | fire | air_quality",
  "location": {
    "lat": 33.6844,
    "lon": 73.0479,
    "zone_id": "islamabad:G-10:2",
    "address": "G-10/2, Islamabad"
  },
  "severity": "low | medium | high | critical",
  "confidence": 0.94,
  "corroboration_score": 85,
  "evidence": [
    { "type": "weather_api", "source": "open-meteo", "value": "45mm/hr rainfall", "weight": 30 },
    { "type": "maps_traffic", "source": "google_maps", "value": "340% above baseline", "weight": 25 },
    { "type": "citizen_report", "source": "ciro_app", "count": 4, "weight": 20 }
  ],
  "recommended_actions": ["traffic_reroute", "emergency_dispatch", "push_alert"],
  "antigravity_trace_id": "ag-trace-2026-05-18-001",
  "idempotency_token": "sha256-hash"
}
```

---

## 5. Multi-Signal Corroboration Engine

The Corroboration Engine is CIRO's most critical innovation — the system's defense against false alarms and fake reports. **No single signal source can trigger a crisis response.**

### 5.1 Signal Weight Table

| Signal Source | Weight | Rationale |
|---|---|---|
| Weather API (rain > threshold) | 30 pts | Objective, machine-generated, cannot be faked |
| Google Maps traffic spike (> 200% baseline) | 25 pts | Real traffic sensor data, hard to manipulate |
| 3+ citizen reports from different GPS locations | 20 pts | Corroborated, geographically diverse |
| Open-Meteo flood risk index (> 0.7) | 15 pts | Scientific model, historical accuracy |
| IoT sensor data (water level, air quality) | 15 pts | Hardware sensor, objective measurement |
| Single citizen report | 10 pts | Low trust alone, requires corroboration |
| QDrant historical pattern match (same location) | +10 pts bonus | This location has flooded before in similar conditions |

### 5.2 Escalation Thresholds

| Score Range | Status | Action Taken |
|---|---|---|
| 0 – 30 | 🔵 NOISE | Archived for pattern analysis, no escalation |
| 31 – 54 | 🟡 WATCHING | Monitoring mode — collecting more signals |
| 55 – 74 | 🟠 MONITORING | Analysis agents triggered, no action yet |
| 75 – 89 | 🔴 ALERT | Impact assessment runs, Incident Commander notified |
| 90 – 100 | 🚨 CRITICAL | Human approval required before any simulation runs |

### 5.3 Anti-Manipulation Filters

- **Rate limiting per device** — one report per location per hour per device ID
- **GPS verification** — citizen report coordinates must match claimed area within 500m
- **Semantic clustering** — 3 reports from same device = still 1 report in the system
- **Velocity check** — 10+ reports in 60 seconds from unknown devices = bot flag
- **Human-in-loop gate** — Critical events require Incident Commander approval before dispatch

### 5.4 Real Examples

**False Report Scenario:**
```
Person in F-7 reports: "G-10 mein flooding hai"
→ Score: 10 pts (single report)
→ GPS mismatch flagged (reporter is in F-7, not G-10)
→ Score adjusted to 0 — archived
→ Nothing happens
→ Report stored for pattern review
```

**Real Crisis Scenario:**
```
Weather API: heavy rain 45mm/hr         → +30 pts
Google Maps: traffic spike 340%         → +25 pts
4 citizen reports from G-10 residents   → +20 pts
Historical QDrant match (G-10 flooded in 2024 monsoon) → +10 pts bonus
─────────────────────────────────────────
Total Score: 85/100 → ALERT 🔴
Impact Assessor triggered → Incident Commander notified → Approved → Dispatch
```

---

## 6. Full Technology Stack

### 6.1 Core AI Platform

| Layer | Technology | Purpose |
|---|---|---|
| AI Orchestration | Google Antigravity | Central agent workflow, reasoning, tool routing, trace logs |
| LLM | Gemini 1.5 Pro (via Antigravity) | NLP, reasoning, decision generation |
| Vector DB | QDrant | Historical crisis pattern storage and similarity matching |
| Spatial DB | PostgreSQL + PostGIS | Geographic zone queries, impact radius calculation |

### 6.2 Frontend Stack

| Platform | Technology | Purpose |
|---|---|---|
| Mobile App (MUST) | React Native + Expo | iOS/Android citizen reporting + operator dashboard |
| Web Dashboard (Optional) | Next.js 14 App Router | Operator console, real-time crisis map, agent trace viewer |
| Maps | React Native Maps + Google Maps SDK | Crisis location visualization, route display |
| Real-time | WebSocket (Socket.io) | Live agent updates, corroboration score feed |
| State Management | Zustand | Lightweight, fast state for crisis feed |
| UI Components | NativeWind (Tailwind for RN) | Consistent design system across screens |

### 6.3 Backend Stack

| Layer | Technology | Purpose |
|---|---|---|
| API Server | Node.js + Express | REST API, WebSocket hub, agent orchestration bridge |
| Task Queue | BullMQ + Redis | Async signal processing, corroboration score computation |
| Database | PostgreSQL + PostGIS | Event storage, zone data, audit logs |
| Cache | Redis | Rate limiting, session store, score caching |
| Routing Engine | OSRM (mock instance) | Emergency vehicle routing simulation |
| Notifications | FCM (Firebase) | Push alerts to citizen app |

### 6.4 External Data & APIs

| Data Source | API | Used For |
|---|---|---|
| Weather | Open-Meteo (free) | Rainfall, temperature, flood risk index |
| Traffic / Maps | Google Maps Platform | Traffic layer, routing, geocoding |
| Air Quality | OpenAQ (free) | AQI data for heatwave/pollution events |
| Citizen Reports | Custom CIRO App | Roman Urdu text, GPS coordinates, photo (optional) |
| Historical Patterns | QDrant + custom dataset | Past crisis locations and severity patterns |

### 6.5 DevOps & Observability

| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Local development environment |
| GitHub Actions | CI/CD pipeline |
| Antigravity Console | Agent trace viewer, workplan export, task log |
| Sentry | Error tracking and alerting |

---

## 7. Features

### 7.1 Core System Features

- Multi-Signal Corroboration Engine with credibility scoring (0–100)
- Roman Urdu + Urdu + English NLP parsing for citizen reports
- 8-agent AI pipeline fully orchestrated via Google Antigravity
- Real-time crisis detection with confidence percentage and severity level
- Geographic impact assessment using Islamabad zone data (PostGIS)
- Human-in-the-loop Incident Commander approval gate for critical events
- 3 action simulations: traffic reroute, emergency ticket, push alert
- Before/After system state visualization on crisis resolution
- Full Antigravity reasoning trace export (Workplan + Task Plan + Decision Flow)
- QDrant vector memory — system learns from past crises to improve future detection

### 7.2 Mobile App Features (React Native — MUST)

- Citizen crisis reporting screen with GPS auto-fill and Roman Urdu keyboard support
- Live crisis feed with severity badges (Critical / High / Medium / Low)
- Map view showing active crisis zones with color-coded overlay
- Incident Commander approval screen (push notification + one-tap approve/reject)
- Agent reasoning panel — shows what each agent decided and why
- Before/After simulation screen with congestion metrics
- Push notification system for area-specific alerts
- Offline-first architecture with background sync

### 7.3 Web Dashboard Features (Next.js — Optional)

- Real-time operator console with multi-crisis overview map
- Corroboration score live feed per active event
- Agent trace log viewer with step-by-step reasoning timeline
- Historical crisis heatmap for Islamabad (mock data)
- Emergency ticket management panel
- Alert dispatch simulator with recipient count and channel breakdown
- Role-based access: Operator / Incident Commander / Admin

### 7.4 Innovation Features

- Pakistan's first crisis system with Roman Urdu NLP processing
- QDrant vector memory — system learns from past crises
- Adversarial-resistant design — fake reports cannot trigger responses alone
- Islamabad-specific dataset with 10 real crisis scenarios and local area names
- Human-in-the-loop gate prevents fully automated dispatch for critical events
- Replay mode — re-run any past crisis with different parameters for training

---

## 8. UI Design & Theme

### 8.1 Design Philosophy

CIRO's UI follows the **Emergency Operations Center (EOC) aesthetic** — professional, high-contrast, information-dense but scannable. Inspired by:

- NDMA Pakistan's operational dashboards — authoritative and trustworthy
- Modern fintech dark dashboards — clean data density
- Emergency alert systems — color-coded severity at a glance

### 8.2 Color System

| Role | Color Name | Hex | Used For |
|---|---|---|---|
| Primary | Deep Navy | `#1A2B4A` | Headers, navigation, authority elements |
| Danger / Critical | Emergency Red | `#E63946` | Critical alerts, danger zones, CTA buttons |
| Info / Active | Command Blue | `#0077B6` | Active agents, info cards, secondary actions |
| Warning | Alert Amber | `#F4A261` | Medium severity, pending approvals, monitoring state |
| Success | Resolution Green | `#2A9D8F` | Resolved events, approved actions, success states |
| Background | Dark Slate | `#0F1923` | App background (dark mode primary) |
| Surface | Card Dark | `#1C2B3A` | Card backgrounds, modals, panels |
| Text Primary | Off-White | `#E8EFF5` | Primary text on dark background |
| Text Muted | Steel Gray | `#6B7A8D` | Timestamps, secondary labels |

### 8.3 Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| App Name / Logo | Inter | 28px | 700 Bold |
| Screen Titles | Inter | 22px | 600 SemiBold |
| Section Headers | Inter | 18px | 600 SemiBold |
| Body / Descriptions | Inter | 14px | 400 Regular |
| Labels / Badges | Inter Mono | 12px | 500 Medium |
| Agent Trace Logs | Fira Code (monospace) | 13px | 400 Regular |
| Urdu / Roman Urdu text | Noto Nastaliq Urdu | 16px | 400 Regular |

### 8.4 Mobile App Screens

1. **Splash Screen** — CIRO logo with animated radar pulse on dark navy background
2. **Home / Crisis Feed** — live scrollable list of active events, sorted by severity. Each card: type icon + location + corroboration score bar + time elapsed
3. **Report Crisis Screen** — large text input (Roman Urdu keyboard enabled), GPS auto-detect, crisis type selector, optional photo upload, animated submit button
4. **Crisis Detail Screen** — full breakdown: corroboration evidence, agent reasoning chain, impact zone map, recommended actions
5. **Simulation Screen** — before/after split view: traffic map state, emergency ticket status, alert recipient count
6. **Agent Trace Screen** — timeline view of all 8 agents with icons, timestamps, decision text, and Antigravity trace ID
7. **Incident Commander Screen** — critical event approval panel with full context, one-tap Approve / Reject, audit log
8. **Settings / Profile** — language toggle (EN/UR), notification preferences, area subscription

### 8.5 Key UI Components

| Component | Description |
|---|---|
| `CrisisCard` | Severity badge + corroboration score progress bar + agent status icons |
| `CorroborationMeter` | Circular gauge 0–100 with color zones (gray → amber → red) |
| `AgentTimeline` | Horizontal stepper showing which agents are done / active / pending |
| `SimulationDiff` | Split-screen before/after map with metric overlays |
| `TraceLog` | Scrollable monospace log with syntax highlighting for agent decisions |
| `IncidentBanner` | Top-of-screen persistent banner for critical active events |
| `ScoreBar` | Horizontal progress bar per signal source showing weight contribution |

### 8.6 NativeWind (Tailwind) Design Tokens

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        navy:   '#1A2B4A',
        danger: '#E63946',
        blue:   '#0077B6',
        amber:  '#F4A261',
        green:  '#2A9D8F',
        dark:   '#0F1923',
        surface:'#1C2B3A',
        text:   '#E8EFF5',
        muted:  '#6B7A8D',
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        mono:  ['FiraCode', 'monospace'],
        urdu:  ['NotoNastaliqUrdu', 'serif'],
      }
    }
  }
}
```

---

## 9. Islamabad Mock Crisis Dataset

10 pre-built Islamabad-specific crisis scenarios with realistic signal data, Urdu/Roman Urdu citizen reports, and expected system outputs.

| # | Crisis Type | Location | Roman Urdu Report | Corroboration Score |
|---|---|---|---|---|
| 1 | Urban Flooding | G-10/2 | *"G-10 mein pani bhar gaya, gaariyan phans gayi"* | 85/100 |
| 2 | Road Blockage | I-8 Markaz | *"I-8 mein accident ho gaya, traffic jam hai"* | 72/100 |
| 3 | Heatwave Emergency | F-7/3 | *"Garmi bohat zyada hai, log behosh ho rahe hain"* | 78/100 |
| 4 | Flash Flood | Nallah Lai | *"Nallah Lai ka paani bahar aa raha hai"* | 92/100 |
| 5 | Power Outage | G-6 Sector | *"G-6 mein bijli 6 ghante se nahi hai"* | 65/100 |
| 6 | Air Quality Spike | Islamabad Expressway | *"Expressway pe dhuaan bahut zyada hai"* | 70/100 |
| 7 | Road Collapse | Margalla Road | *"Margalla road ka hissa toot gaya hai"* | 80/100 |
| 8 | Fire Incident | Blue Area | *"Blue Area mein aag lagi hui hai"* | 88/100 |
| 9 | Traffic Gridlock | Zero Point | *"Zero Point pe traffic bilkul nahi chal raha"* | 68/100 |
| 10 | Sewage Overflow | H-9 | *"H-9 ki galiyon mein ganda pani aa gaya"* | 75/100 |

Each scenario JSON includes:
- Raw citizen text in Roman Urdu
- Mock weather API response (Open-Meteo format)
- Mock traffic API response (Maps format)
- Expected corroboration score breakdown
- Expected agent decisions at each pipeline step
- Expected action simulation outputs

---

## 10. Evaluation Score Mapping

How CIRO directly satisfies each judging criterion:

### ████████████████████████████████ Use of Google Antigravity — 25%

All 8 agents orchestrated through Antigravity. Workplan + Tasks Plan exported from Antigravity console. Tool calls, reasoning steps, decision flow all logged. Antigravity handles actual agent handoffs — not used superficially.

**Evidence:** Agent trace log shows Antigravity routing each signal through NLP → Normalizer → Corroboration → Detection → Assessment → Planning → Simulation pipeline.

---

### ████████████████████████ Agentic Reasoning & Coordination — 20%

8 agents with explicit typed JSON handoffs. Multi-signal corroboration pipeline demonstrates structured multi-step reasoning. Each agent decision is visible in trace log. Autonomy demonstrated through automatic escalation without human intervention below Critical threshold.

**Evidence:** AgentTimeline UI shows each agent's input, reasoning, and output at every step.

---

### ████████████████████████ Situation Detection & Analysis — 20%

Corroboration Engine gives explicit confidence percentages. QDrant historical matching improves accuracy over time. 10 Islamabad-specific scenarios make detection feel locally accurate. Roman Urdu NLP handles real-world noisy input.

**Evidence:** Crisis detected with "Confidence: 94% — Severity: Critical" and corroboration evidence breakdown shown in UI.

---

### ██████████████████ Action Planning & Simulation — 15%

3 realistic simulations run simultaneously: mock map route update (OSRM), emergency ticket creation with tracking ID, push alert to geofenced recipients. Before/After state shown with measurable metrics (congestion %, rescue ETA, alert reach count).

**Evidence:** SimulationDiff screen shows before/after map + "Congestion reduced 60%, Rescue ETA: 8 mins, 3,200 alerts sent."

---

### ████████████ Technical Implementation — 10%

Battle-tested architecture ported from AEROHACK/TECKNOFEST winning project. Clean Node.js + React Native stack. PostGIS spatial queries. QDrant vector DB. Full Docker setup. GitHub CI/CD.

**Evidence:** Public GitHub repo with clean folder structure, Docker Compose, CI pipeline, and README.

---

### ████████████ Innovation & UX — 10%

First Pakistani crisis system with Roman Urdu NLP. Adversarial-resistant corroboration engine. Islamabad-specific local dataset. EOC-inspired professional dark UI. Demo scripted to complete end-to-end in under 60 seconds.

**Evidence:** Demo video shows Roman Urdu input → full response in 60 seconds.

---

## 11. 7-Day Build Plan

| Day | Member 1 — Backend + Antigravity | Member 2 — React Native | Member 3 — Data + Demo |
|---|---|---|---|
| **Day 1** May 14 | Set up Antigravity project, define 8-agent workflow, configure tool routing | Scaffold React Native + Expo, navigation setup, design system tokens | Build 10-scenario Islamabad mock dataset, write Roman Urdu report strings |
| **Day 2** May 15 | Build Roman Urdu NLP agent + Data Normalizer with multi-source signal parsing | Build CrisisCard component + Crisis Feed screen with mock data | Set up QDrant instance, load historical patterns, test similarity search |
| **Day 3** May 16 | Build Corroboration Engine with scoring algorithm + anti-manipulation filters | Build Report Crisis screen with GPS + Roman Urdu keyboard support | Connect Open-Meteo + Google Maps APIs, test signal ingestion pipeline |
| **Day 4** May 17 | Build Event Detector + Impact Assessor with PostGIS zone queries | Build Crisis Detail + Agent Trace timeline screen | Build Next.js web dashboard skeleton + real-time WebSocket feed |
| **Day 5** May 18 | Build Response Planner + Logistics Agent + 3 action simulations | Build Simulation Before/After screen + Incident Commander approval screen | Build operator map view, integrate corroboration score live feed |
| **Day 6** May 19 | Full pipeline integration test, Antigravity trace export, bug fixes | Full app integration, push notifications, final UI polish | Record demo video (scripted 3-min run), write README, architecture diagram |
| **Day 7** May 20 | Final Antigravity workplan export, submission package prep | App build + APK generation, final testing on device | Submit by deadline — challenge selection form + all deliverables |

> ⚠️ **CRITICAL:** Challenge Selection Form must be submitted by **May 15, 2026**. Once submitted, challenge cannot be changed. Submit Challenge 3 (CIRO) immediately.

---

## 12. Project Folder Structure

```
ciro/
├── apps/
│   ├── mobile/                          # React Native + Expo app
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── SplashScreen.tsx
│   │   │   │   ├── CrisisFeedScreen.tsx
│   │   │   │   ├── ReportCrisisScreen.tsx
│   │   │   │   ├── CrisisDetailScreen.tsx
│   │   │   │   ├── SimulationScreen.tsx
│   │   │   │   ├── AgentTraceScreen.tsx
│   │   │   │   ├── IncidentCommanderScreen.tsx
│   │   │   │   └── SettingsScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── CrisisCard.tsx
│   │   │   │   ├── CorroborationMeter.tsx
│   │   │   │   ├── AgentTimeline.tsx
│   │   │   │   ├── SimulationDiff.tsx
│   │   │   │   ├── TraceLog.tsx
│   │   │   │   └── IncidentBanner.tsx
│   │   │   ├── store/                   # Zustand state
│   │   │   ├── hooks/                   # Custom hooks + WebSocket
│   │   │   └── utils/
│   │   ├── app.json
│   │   └── tailwind.config.js
│   │
│   └── web/                             # Next.js 14 web dashboard
│       ├── app/
│       │   ├── dashboard/
│       │   │   ├── page.tsx             # Operator console
│       │   │   ├── crisis/[id]/page.tsx # Crisis detail
│       │   │   └── trace/[id]/page.tsx  # Agent trace viewer
│       │   └── layout.tsx
│       └── components/
│
├── backend/
│   ├── src/
│   │   ├── agents/                      # 8 agent definitions (Antigravity)
│   │   │   ├── nlp-agent.ts
│   │   │   ├── normalizer-agent.ts
│   │   │   ├── corroboration-agent.ts
│   │   │   ├── detector-agent.ts
│   │   │   ├── impact-agent.ts
│   │   │   ├── response-agent.ts
│   │   │   ├── logistics-agent.ts
│   │   │   └── commander-agent.ts
│   │   ├── tools/                       # Custom tools per agent
│   │   │   ├── WeatherTool.ts
│   │   │   ├── MapsTool.ts
│   │   │   ├── QDrantTool.ts
│   │   │   ├── PostGISTool.ts
│   │   │   ├── OSRMTool.ts
│   │   │   ├── NotificationTool.ts
│   │   │   └── TicketTool.ts
│   │   ├── corroboration/               # Scoring engine + anti-manipulation
│   │   │   ├── ScoreEngine.ts
│   │   │   ├── AntiManipulation.ts
│   │   │   └── ThresholdManager.ts
│   │   ├── nlp/                         # Roman Urdu parser
│   │   │   ├── UrduParser.ts
│   │   │   ├── LanguageDetector.ts
│   │   │   └── EntityExtractor.ts
│   │   ├── simulation/                  # 3 action simulators
│   │   │   ├── RouteSimulator.ts
│   │   │   ├── TicketSimulator.ts
│   │   │   └── AlertSimulator.ts
│   │   ├── schema/                      # Canonical event JSON schema (Zod)
│   │   │   └── EventSchema.ts
│   │   ├── db/                          # PostgreSQL + PostGIS queries
│   │   │   ├── EventRepository.ts
│   │   │   └── ZoneRepository.ts
│   │   ├── queue/                       # BullMQ workers
│   │   │   └── SignalProcessor.ts
│   │   └── api/                         # Express routes + WebSocket
│   │       ├── routes/
│   │       └── ws/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── data/
│   ├── islamabad_scenarios/             # 10 mock crisis scenario JSONs
│   │   ├── scenario_01_g10_flooding.json
│   │   ├── scenario_02_i8_blockage.json
│   │   ├── scenario_03_f7_heatwave.json
│   │   ├── scenario_04_nallah_flood.json
│   │   ├── scenario_05_g6_outage.json
│   │   ├── scenario_06_expressway_aqi.json
│   │   ├── scenario_07_margalla_collapse.json
│   │   ├── scenario_08_bluearea_fire.json
│   │   ├── scenario_09_zeropoint_gridlock.json
│   │   └── scenario_10_h9_sewage.json
│   └── zone_data/
│       └── islamabad_sectors.geojson    # Islamabad sector coordinates
│
├── docs/
│   ├── architecture.md
│   ├── agents.md
│   ├── antigravity-usage.md
│   └── PERFORMANCE.md
│
├── .github/
│   └── workflows/
│       └── ci.yml                       # GitHub Actions CI/CD
│
├── README.md
└── .env.example
```

---

## 13. Deliverables Checklist

| Deliverable | Status | Owner | Due |
|---|---|---|---|
| Working Prototype — React Native Mobile App | 🔄 In Progress | Member 2 | May 19 |
| Working Prototype — Next.js Web Dashboard (Optional) | 🔄 In Progress | Member 3 | May 19 |
| Demo Video — 3–5 minutes, scripted 60-sec crisis flow | 📋 Planned | Member 3 | May 19 |
| Antigravity Agent Trace / Workplan Export | 📋 Planned | Member 1 | May 19 |
| Antigravity Tasks Plan Export | 📋 Planned | Member 1 | May 19 |
| README — Architecture + Antigravity usage + APIs + assumptions | 📋 Planned | Member 3 | May 20 |
| Challenge Selection Form Submitted | ⚠️ URGENT | All | **May 15** |
| GitHub Repo — Clean, documented, public | 🔄 In Progress | All | May 20 |

> 🚨 **CRITICAL DEADLINE:** Challenge Selection Form must be submitted by **May 15, 2026**. Once submitted, challenge cannot be changed.

---

## 14. Why CIRO Wins

### 14.1 Unfair Advantages

- **70% of the architecture already exists** — ported from AEROHACK/TECKNOFEST winning project (Smart Urban Community Resilience). Your team is not starting from scratch.
- **You thought about adversarial conditions.** The Multi-Signal Corroboration Engine shows judges you built a real system, not a hackathon toy. Most teams will not consider fake reports.
- **Local relevance is unbeatable.** Roman Urdu NLP, G-10 flooding scenarios, Islamabad sector data. Judges from Ministry of IT and Telenor will feel it instantly.
- **The demo story is perfect.** 60 seconds. One Roman Urdu text message → full crisis response. Crisp, local, memorable.
- **Human-in-the-loop gate.** Most teams build fully automated systems. Your Incident Commander approval shows production-readiness awareness.

### 14.2 Competitive Differentiation

| Feature | CIRO | Typical Team |
|---|---|---|
| False report protection | Multi-Signal Corroboration Engine | None — any input triggers |
| Language support | English + Urdu + Roman Urdu NLP | English only |
| Local relevance | Islamabad-specific 10-scenario dataset | Generic demo data |
| Architecture depth | 8 agents, battle-tested from prior hackathon | 2–3 basic agents |
| Human safety gate | Incident Commander approval for critical events | Fully automated |
| Historical learning | QDrant vector memory of past crises | Stateless system |
| Demo quality | Scripted 60-second end-to-end story | Ad-hoc walkthrough |
| Adversarial resistance | Anti-manipulation filters + GPS verification | None |

### 14.3 The Winning Narrative

> *"We didn't just build a crisis detection system. We built one that can't be fooled. One that speaks Urdu. One that knows Islamabad's flood-prone sectors from G-10 to Nallah Lai. And one that already has battle-tested architecture from a previous hackathon win. CIRO is not a prototype — it's the foundation of Pakistan's first AI-powered urban crisis intelligence platform."*

---

## References & Prior Art

- [Smart Urban Community Resilience — AEROHACK/TECKNOFEST](https://github.com/SMAshhar/CrewAiChallenge-Smart-Urban-Community-Resilience)
- [Google Antigravity Documentation](https://cloud.google.com)
- [Open-Meteo Free Weather API](https://open-meteo.com)
- [QDrant Vector DB Documentation](https://qdrant.tech/documentation/)
- [OSRM Routing Engine](https://project-osrm.org)
- [OpenAQ Air Quality API](https://docs.openaq.org)
- [NDMA Pakistan](https://ndma.gov.pk)
- [React Native + Expo](https://expo.dev)
- [NativeWind (Tailwind for RN)](https://www.nativewind.dev)

---

*Document Version: 1.0 | Date: May 2026 | Team: CIRO — #AISeekho 2026*