# CIRO Mobile — Test Flow

Use this checklist to verify the app against the live FastAPI backend.

---

## 0. Prerequisites

| Step | Command / action |
|------|------------------|
| Backend | `cd ciro` → `uv run serve` (listen on `0.0.0.0:8000`) |
| Health | Browser: `http://127.0.0.1:8000/health` → `status: ok` |
| Mobile config | `apps/mobile/src/constants/config.ts`: `USE_MOCK_DATA: false` |
| API URL | **Emulator:** `http://10.0.2.2:8000` · **Phone (same Wi‑Fi):** `http://192.168.1.18:8000` |
| App | `cd apps/mobile` → `npm start` + `npm run android` |

---

## 1. App startup (Splash → Feed)
 
```
[Splash]
  → register device (POST /api/devices/register)
  → load crises (GET /api/crises)
  → seed demo may show 1 crisis (G-10 flood) if server just started
  → navigate to Main (tabs) within ~3s
```

**Check:** Feed tab shows at least one crisis card (score, severity, sector).

---

## 2. Citizen — View feed

```
[Feed tab]
  → list sorted by corroboration score
  → filter chips: All | Critical | High | Medium | Low | Resolved
  → pull-to-refresh → GET /api/crises again
  → if critical event exists → red IncidentBanner at top
```

**Check:** Pull refresh updates list; banner tap opens Crisis Detail.

---

## 3. Citizen — Crisis detail

```
[Feed] tap CrisisCard
  → CrisisDetailScreen
  → GET /api/crises/:id
  → corroboration meter + evidence bars
  → map polygon (if zone_geojson present)
  → agent pipeline timeline
```

**Check:** Score bars match server; **View Full Trace** and **View Simulation** open sub-screens.

---

## 4. Citizen — Submit report

```
[Report tab]
  → GPS / sector (default G-10 area)
  → text (min 10 chars), e.g. "G-10 mein pani bhar gaya"
  → pick crisis type (Flood, Fire, …)
  → optional photo
  → Submit
       POST /api/reports  → { event_id, status: processing }
       poll GET /api/crises/:event_id until crisis appears (~5–30s)
       Socket.IO crisis:new (if connected)
  → alert with event id
```

**Check:** Return to **Feed** (or wait on Report) — new card appears with updated score/status.

**Backend:** Pipeline runs tools (parser, weather, corroboration, impact, dispatch). Score ≥ 80 → `awaiting_approval`.

---

## 5. Real-time (Socket.IO)

```
[App open]
  → connect WS to same host as API_URL
  → emit subscribe:sector { sectors from Settings }
```

| Event | Expected UI |
|-------|-------------|
| `crisis:new` | New/updated card in Feed |
| `crisis:updated` | Card refreshes |
| `score:updated` | Score changes on card |
| `commander:approval_required` | Feed tab badge +1 |

**Check:** Settings → WebSocket shows **connected** when server is up.

---

## 6. Incident Commander — Approve critical event

```
[Settings]
  → Role: Incident Commander
[Feed]
  → open crisis with status awaiting_approval (high score / critical)
  → Review & Approve
  → IncidentCommanderScreen
  → APPROVE RESPONSE
       POST /api/commander/approve { eventId, note }
  → back to Feed; status → active
```

**Reject path:** REJECT → confirm → POST `/api/commander/reject` → crisis removed / resolved event.

**Check:** Commander screen blocked if role is Citizen.

---

## 7. Agent trace & simulation

```
[Crisis Detail]
  → View Full Trace → AgentTraceScreen (expand raw JSON per agent)
  → View Simulation → before/after metrics + map snapshots
```

**API:** `GET /api/crises/:id/trace`, `GET /api/crises/:id/simulation`

---

## 8. Settings & health

```
[Settings]
  → change role / language / subscribed sectors
  → About: backend dot green if GET /health succeeds
  → WebSocket connected/disconnected
```

---

## Quick test matrix

| # | Scenario | Pass if |
|---|----------|---------|
| A | Server off at launch | Splash still opens Main; Feed empty or cached; Settings health red |
| B | Server on | Feed has crises; health green |
| C | Submit report | New event in feed after poll |
| D | Commander approve | Critical → active; badge clears |
| E | Pull refresh | List matches `GET /api/crises` |

---

## API map (mobile ↔ server)

| Mobile | HTTP |
|--------|------|
| Splash / Feed refresh | `GET /api/crises` |
| Crisis detail | `GET /api/crises/:id` |
| Submit report | `POST /api/reports` |
| Photo | `POST /api/reports/upload` |
| Approve / Reject | `POST /api/commander/approve` · `reject` |
| Device | `POST /api/devices/register` |
| Health | `GET /health` |

---

## Suggested 5-minute demo script

1. Start `uv run serve` — confirm `/health`.
2. Open app — see G-10 demo on Feed.
3. Open detail → Trace → Simulation.
4. Report tab — submit Roman Urdu flood report — wait for new card.
5. Settings → Incident Commander → approve critical event.
6. Pull refresh — confirm status change.
