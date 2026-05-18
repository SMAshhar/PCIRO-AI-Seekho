# CIRO Mobile App — Complete Specification

React Native CLI application for the CIRO Crisis Intelligence & Response Orchestrator. Targets two user roles: **Citizens** (report crises, receive alerts) and **Operators / Incident Commanders** (manage response, approve critical actions).

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Setup](#2-project-setup)
3. [Folder Structure](#3-folder-structure)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Design System](#5-design-system)
6. [Screens](#6-screens)
7. [Reusable Components](#7-reusable-components)
8. [State Management](#8-state-management)
9. [API Layer](#9-api-layer)
10. [Push Notifications](#10-push-notifications)
11. [Maps Integration](#11-maps-integration)
12. [Offline Architecture](#12-offline-architecture)
13. [Roman Urdu & Localization](#13-roman-urdu--localization)
14. [Environment Configuration](#14-environment-configuration)

---

## 1. Tech Stack

| Layer | Library | Version | Purpose |
|---|---|---|---|
| Core | React Native CLI | 0.75+ | No Expo — full native control |
| Language | TypeScript | 5.x | Strict mode enabled |
| Navigation | `@react-navigation/native` + `@react-navigation/stack` + `@react-navigation/bottom-tabs` | v6 | Screen routing |
| Styling | NativeWind | v4 | Tailwind CSS for React Native |
| State | Zustand | v4 | Lightweight global state |
| Maps | `react-native-maps` + Google Maps SDK | Latest | Crisis location visualization |
| Push Notifications | `@react-native-firebase/messaging` | v20 | FCM push alerts |
| Real-time | `socket.io-client` | v4 | WebSocket live crisis feed |
| Storage | `@react-native-async-storage/async-storage` | v1 | Offline cache |
| HTTP | `axios` | v1 | REST API calls |
| Icons | `react-native-vector-icons` (MaterialCommunityIcons) | Latest | UI icons |
| Fonts | Custom font loading via `react-native-typography` | — | Inter, Fira Code, Noto Nastaliq |
| Animations | `react-native-reanimated` v3 | Latest | Smooth transitions, gauges |
| Gestures | `react-native-gesture-handler` | Latest | Swipe actions on cards |
| Camera / Photo | `react-native-image-picker` | Latest | Optional photo on crisis report |
| Location | `@react-native-community/geolocation` | Latest | GPS auto-fill on report screen |
| Date/Time | `date-fns` | v3 | Relative timestamps (e.g., "3 min ago") |
| Form | `react-hook-form` | v7 | Report form validation |
| Env | `react-native-config` | Latest | `.env` variables in native code |
| Splash | `react-native-splash-screen` | Latest | Controlled splash dismissal |

---

## 2. Project Setup

### 2.1 Initialization

```bash
# Initialize with React Native CLI (not Expo)
npx @react-native-community/cli init CiroMobile --template react-native-template-typescript
cd CiroMobile

# Install all dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install nativewind tailwindcss
npm install zustand
npm install react-native-maps
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install socket.io-client
npm install @react-native-async-storage/async-storage
npm install axios
npm install react-native-vector-icons
npm install react-native-reanimated
npm install react-native-gesture-handler
npm install react-native-image-picker
npm install @react-native-community/geolocation
npm install date-fns
npm install react-hook-form
npm install react-native-config
npm install react-native-splash-screen

# Pod install (iOS only)
cd ios && pod install && cd ..
```

### 2.2 Android Setup Requirements

- `android/app/google-services.json` — Firebase config (from Firebase Console)
- `android/local.properties` — `sdk.dir` pointing to Android SDK
- `android/app/build.gradle` — add `apply plugin: 'com.google.gms.google-services'`
- Google Maps API key in `android/app/src/main/AndroidManifest.xml` under `<meta-data android:name="com.google.android.geo.API_KEY" android:value="@string/google_maps_key" />`
- `android/app/src/main/res/values/strings.xml` — `<string name="google_maps_key">MAPS_API_KEY</string>`

### 2.3 iOS Setup Requirements

- `ios/GoogleService-Info.plist` — Firebase config
- `ios/CiroMobile/Info.plist` — `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysUsageDescription`, `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`
- Google Maps API key added in `AppDelegate.mm`: `[GMSServices provideAPIKey:@"MAPS_API_KEY"]`

---

## 3. Folder Structure

```
apps/mobile/
├── android/                        # Android native project
├── ios/                            # iOS native project
├── src/
│   ├── screens/                    # One file per screen
│   │   ├── SplashScreen.tsx
│   │   ├── CrisisFeedScreen.tsx
│   │   ├── ReportCrisisScreen.tsx
│   │   ├── CrisisDetailScreen.tsx
│   │   ├── SimulationScreen.tsx
│   │   ├── AgentTraceScreen.tsx
│   │   ├── IncidentCommanderScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── CrisisCard.tsx
│   │   ├── CorroborationMeter.tsx
│   │   ├── AgentTimeline.tsx
│   │   ├── SimulationDiff.tsx
│   │   ├── TraceLog.tsx
│   │   ├── IncidentBanner.tsx
│   │   ├── ScoreBar.tsx
│   │   ├── SeverityBadge.tsx
│   │   ├── CrisisTypeIcon.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx        # Root navigator — handles auth state
│   │   ├── MainTabNavigator.tsx    # Bottom tabs (Feed, Report, Settings)
│   │   └── types.ts                # RootStackParamList + TabParamList
│   │
│   ├── store/                      # Zustand stores
│   │   ├── crisisStore.ts          # Active crisis list + selected crisis
│   │   ├── socketStore.ts          # WebSocket connection state
│   │   ├── userStore.ts            # Role, preferences, notification prefs
│   │   └── notificationStore.ts    # Pending approval notifications
│   │
│   ├── api/
│   │   ├── client.ts               # Axios instance with base URL + auth headers
│   │   ├── crisisApi.ts            # Crisis CRUD endpoints
│   │   ├── reportApi.ts            # Submit citizen report
│   │   └── commanderApi.ts         # Incident Commander approve/reject
│   │
│   ├── hooks/
│   │   ├── useSocket.ts            # WebSocket lifecycle + event subscriptions
│   │   ├── useLocation.ts          # GPS permission + current coords
│   │   ├── usePushNotifications.ts # FCM token registration + foreground handler
│   │   └── useCrisisDetail.ts      # Fetch + cache single crisis by ID
│   │
│   ├── utils/
│   │   ├── severityColors.ts       # Maps Severity enum → hex color
│   │   ├── formatTime.ts           # date-fns relative time helpers
│   │   ├── crisisTypeLabels.ts     # Maps CrisisType enum → display label (EN/UR)
│   │   └── scoreZone.ts            # Maps corroboration score → status label + color
│   │
│   ├── constants/
│   │   ├── theme.ts                # Color tokens, font sizes, spacing
│   │   ├── config.ts               # API base URL, WebSocket URL (from react-native-config)
│   │   └── islamabadZones.ts       # Hardcoded sector list for picker
│   │
│   └── types/
│       └── models.ts               # TypeScript interfaces mirroring backend Pydantic models
│
├── .env                            # API_URL, WS_URL, MAPS_KEY, FCM_SENDER_ID
├── tailwind.config.js
├── babel.config.js
├── tsconfig.json
├── metro.config.js
└── package.json
```

---

## 4. Navigation Architecture

### 4.1 Navigator Hierarchy

```
AppNavigator (Stack)
├── SplashScreen                    # Shown on cold launch; auto-advances after init
├── MainTabNavigator (Bottom Tabs)
│   ├── Tab: Feed
│   │   └── CrisisFeedScreen
│   ├── Tab: Report
│   │   └── ReportCrisisScreen
│   └── Tab: Settings
│       └── SettingsScreen
└── Modal Stack (no tabs, full-screen)
    ├── CrisisDetailScreen          # Pushed from CrisisCard tap
    ├── AgentTraceScreen            # Pushed from CrisisDetailScreen
    ├── SimulationScreen            # Pushed from CrisisDetailScreen
    └── IncidentCommanderScreen     # Pushed from push notification or Feed
```

### 4.2 Route Parameters

```typescript
// src/navigation/types.ts

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  CrisisDetail: { crisisId: string };
  AgentTrace: { crisisId: string; traceId: string };
  Simulation: { crisisId: string };
  IncidentCommander: { crisisId: string; eventId: string };
};

export type MainTabParamList = {
  Feed: undefined;
  Report: undefined;
  Settings: undefined;
};
```

### 4.3 Tab Bar Design

- Background: `#1C2B3A` (surface dark)
- Active icon + label: `#0077B6` (command blue)
- Inactive: `#6B7A8D` (steel gray)
- Tab icons: `MaterialCommunityIcons` — `alert-circle-outline` (Feed), `plus-circle-outline` (Report), `cog-outline` (Settings)
- Show badge on Feed tab when `notificationStore.pendingApprovals > 0`

---

## 5. Design System

### 5.1 Color Tokens (`src/constants/theme.ts`)

```typescript
export const colors = {
  navy:    '#1A2B4A',   // headers, nav, authority elements
  danger:  '#E63946',   // critical alerts, danger zones, primary CTA
  blue:    '#0077B6',   // active agents, info cards, secondary actions
  amber:   '#F4A261',   // medium severity, pending approvals, monitoring
  green:   '#2A9D8F',   // resolved events, approved actions, success
  dark:    '#0F1923',   // app background (dark mode only)
  surface: '#1C2B3A',   // card backgrounds, modals, panels
  text:    '#E8EFF5',   // primary text on dark
  muted:   '#6B7A8D',   // timestamps, secondary labels
};

export const severity = {
  critical: colors.danger,
  high:     '#FF6B35',
  medium:   colors.amber,
  low:      colors.green,
};

export const scoreZone = {
  noise:      { color: '#6B7A8D', label: 'Noise' },
  watching:   { color: colors.amber, label: 'Watching' },
  monitoring: { color: '#FF6B35', label: 'Monitoring' },
  alert:      { color: colors.danger, label: 'Alert' },
  critical:   { color: '#FF0000', label: 'Critical' },
};
```

### 5.2 Typography

All text components use the `style` prop with values from `theme.ts`. Do not hardcode font sizes inline.

```typescript
export const fonts = {
  heading:  { fontFamily: 'Inter-Bold',       fontSize: 22, color: colors.text },
  subhead:  { fontFamily: 'Inter-SemiBold',   fontSize: 18, color: colors.text },
  body:     { fontFamily: 'Inter-Regular',    fontSize: 14, color: colors.text },
  label:    { fontFamily: 'Inter-Medium',     fontSize: 12, color: colors.muted },
  trace:    { fontFamily: 'FiraCode-Regular', fontSize: 13, color: colors.text },
  urdu:     { fontFamily: 'NotoNastaliqUrdu', fontSize: 16, color: colors.text, writingDirection: 'rtl' },
};
```

### 5.3 NativeWind Configuration (`tailwind.config.js`)

```javascript
module.exports = {
  content: ['./src/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        navy:    '#1A2B4A',
        danger:  '#E63946',
        'cmd-blue': '#0077B6',
        amber:   '#F4A261',
        green:   '#2A9D8F',
        dark:    '#0F1923',
        surface: '#1C2B3A',
        'off-white': '#E8EFF5',
        muted:   '#6B7A8D',
      },
      fontFamily: {
        sans: ['Inter-Regular'],
        bold: ['Inter-Bold'],
        mono: ['FiraCode-Regular'],
        urdu: ['NotoNastaliqUrdu'],
      },
    },
  },
  plugins: [],
};
```

### 5.4 Spacing & Radius

| Token | Value | Usage |
|---|---|---|
| `spacing.card` | 16px | Card internal padding |
| `spacing.screen` | 20px | Screen horizontal padding |
| `radius.card` | 12px | Card border radius |
| `radius.badge` | 6px | Badge border radius |
| `radius.button` | 8px | Button border radius |

---

## 6. Screens

### 6.1 SplashScreen

**File:** `src/screens/SplashScreen.tsx`

**Purpose:** App initialization — loads fonts, registers FCM token, hydrates Zustand stores from AsyncStorage, then navigates to `Main`.

**Layout:**
- Full-screen `#0F1923` background
- Center: CIRO logo (text-based, Inter-Bold, 36px, `#E8EFF5`) + tagline "From street complaint to coordinated response in under 60 seconds" (14px, muted)
- Below logo: animated radar pulse using `react-native-reanimated` — three concentric circles expanding outward with fading opacity, color `#0077B6`
- Progress: none — purely time/async-driven

**Behavior:**
1. On mount: load fonts → check AsyncStorage for user role + notification prefs → connect WebSocket → register FCM token
2. After all init completes (or max 3s timeout): `navigation.replace('Main')`
3. Do not show a skip button

---

### 6.2 CrisisFeedScreen

**File:** `src/screens/CrisisFeedScreen.tsx`

**Purpose:** Primary screen — live list of all active crisis events, sorted by `corroboration_score` descending then by `ingest_timestamp` descending.

**Layout:**
```
┌─────────────────────────────────────┐
│ [IncidentBanner] ← shows if any     │  ← sticky, only visible when critical event exists
│  critical event is active           │
├─────────────────────────────────────┤
│ CIRO                    [🔔 badge]  │  ← header bar, navy bg
├─────────────────────────────────────┤
│ [Filter chips: All | Critical | High│  ← horizontal scroll, no full-width
│  | Medium | Low | Resolved]         │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │
│ │ [CrisisCard]                  │   │  ← FlatList
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ [CrisisCard]                  │   │
│ └───────────────────────────────┘   │
│  ...                                │
└─────────────────────────────────────┘
```

**State:**
- Pull `crisisStore.activeCrises` (live-updated via WebSocket)
- Local state: `selectedFilter: 'all' | 'critical' | 'high' | 'medium' | 'low' | 'resolved'`

**Behavior:**
- Tapping a `CrisisCard` navigates to `CrisisDetail` with `crisisId`
- Pull-to-refresh calls `crisisApi.getActiveCrises()` and updates store
- Filter chips filter the list client-side (no new API call)
- New crises added via WebSocket animate in from the top (Reanimated `FadeInUp`)
- Empty state: centered illustration + "No active crises in your area" text

---

### 6.3 ReportCrisisScreen

**File:** `src/screens/ReportCrisisScreen.tsx`

**Purpose:** Citizen crisis reporting form. Submits a report to the backend ingest endpoint.

**Layout:**
```
┌─────────────────────────────────────┐
│ Report a Crisis            [✕ close]│  ← header
├─────────────────────────────────────┤
│ Describe what's happening           │  ← label
│ ┌─────────────────────────────────┐ │
│ │ Large TextInput                 │ │  ← multiline, 6 lines min height
│ │ (Roman Urdu / Urdu / English)   │ │  ← keyboardType default, textContentType none
│ └─────────────────────────────────┘ │
│ [EN] [UR] [Roman UR]  ← lang hint  │  ← informational only, no hard switch
│                                     │
│ Crisis Type                         │
│ [Flood] [Fire] [Heatwave] [Road]   │  ← horizontal chip scroll
│ [Power] [Air] [Earthquake] [Other] │
│                                     │
│ Location                            │
│ [📍 Using GPS: G-10/2, Islamabad]  │  ← auto-detected, tappable to change
│ [Or select sector ▼]               │  ← Picker fallback
│                                     │
│ Photo (optional)                    │
│ [📷 Add Photo]                      │  ← react-native-image-picker, single image
│                                     │
│ [Submit Report]                     │  ← full-width danger button
└─────────────────────────────────────┘
```

**Validation (react-hook-form):**
- `text`: required, min 10 chars
- `crisisType`: required (one selected)
- `location`: required (GPS auto-fills, user can override with sector picker)
- `photo`: optional, max 5MB

**Behavior:**
- GPS loads on screen mount via `useLocation` hook; shows spinner until resolved
- On submit: POST to `/api/reports` → show success toast with report ID → reset form
- On error: show inline error under the field that failed
- The Submit button shows a loading spinner while the request is in flight
- Disable form while submitting

**API Payload:**
```typescript
{
  text: string;
  crisis_type: CrisisType;
  location: { lat: number; lon: number; sector: string };
  photo_url?: string;   // uploaded separately, URL returned from upload endpoint
  device_id: string;    // AsyncStorage UUID generated on first launch
}
```

---

### 6.4 CrisisDetailScreen

**File:** `src/screens/CrisisDetailScreen.tsx`

**Purpose:** Full breakdown of a single crisis event — corroboration evidence, impact, agent chain, and actions.

**Layout:**
```
┌─────────────────────────────────────┐
│ [← Back]  G-10 Urban Flooding      │  ← header with crisis type + location
├─────────────────────────────────────┤
│ [SeverityBadge: CRITICAL]           │
│ Corroboration Score                 │
│ [CorroborationMeter: 85/100]        │  ← circular gauge, full width
│                                     │
│ Evidence Breakdown                  │
│ [ScoreBar: Weather API    30/30]    │
│ [ScoreBar: Maps Traffic   25/25]    │
│ [ScoreBar: Citizen Reports 20/20]   │
│ [ScoreBar: IoT Sensors     8/15]    │
│ [ScoreBar: Historical      2/10]    │
│                                     │
│ Impact                              │
│ 3,200 residents  |  4 zones         │
│ G-10/1, G-10/2, G-10/3, G-10/4    │
│                                     │
│ [Map: crisis zone highlighted]      │  ← react-native-maps, 200px tall
│                                     │
│ Agent Pipeline                      │
│ [AgentTimeline]                     │  ← horizontal stepper
│                                     │
│ [View Full Trace →]                 │  ← navigates to AgentTraceScreen
│ [View Simulation →]                 │  ← navigates to SimulationScreen
│                                     │
│ [Approve / Reject]  ← only visible │  ← only if user role = incident_commander
│  if severity = critical             │     AND event.status = awaiting_approval
└─────────────────────────────────────┘
```

**Data:** Fetched via `useCrisisDetail(crisisId)` hook — calls `crisisApi.getCrisisById(crisisId)`, cached in store.

**Behavior:**
- Map shows a colored polygon for the impact zone (GeoJSON from the crisis response)
- "Approve / Reject" section is conditionally rendered based on `userStore.role === 'incident_commander'` AND `crisis.status === 'awaiting_approval'`
- Tapping Approve/Reject navigates to `IncidentCommanderScreen`

---

### 6.5 AgentTraceScreen

**File:** `src/screens/AgentTraceScreen.tsx`

**Purpose:** Full agent reasoning trace — timeline of all 8 agents with their inputs, decisions, and outputs.

**Layout:**
```
┌─────────────────────────────────────┐
│ [← Back]  Agent Trace              │
│ Trace ID: ag-trace-2026-05-18-001  │  ← muted, monospace
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🧠 Roman Urdu NLP Agent  ✓     │ │  ← agent card
│ │ 00:08 — Parsed intent: flood    │ │
│ │ Sectors: G-10  Confidence: 0.91 │ │
│ │ [▼ Show raw output]             │ │  ← expandable TraceLog
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 📡 Data Normalizer       ✓     │ │
│ │ 00:14 — Enriched with weather   │ │
│ │ Rain: 45mm/hr, Temp: 38°C      │ │
│ └─────────────────────────────────┘ │
│  ... (8 agent cards total)          │
└─────────────────────────────────────┘
```

**Data:** Each agent card maps to a step in `crisis.agent_trace` array. Each step has: `agent_name`, `timestamp_offset_ms`, `status: 'done' | 'active' | 'pending'`, `summary`, `raw_output`.

**Behavior:**
- Scroll is vertical (ScrollView)
- Each card is expandable to show `TraceLog` with raw JSON output
- Status icons: `✓` = done (green), `⟳` = active (spinning, blue), `○` = pending (muted)
- Export button (top-right header): copies full trace JSON to clipboard

---

### 6.6 SimulationScreen

**File:** `src/screens/SimulationScreen.tsx`

**Purpose:** Before/After split-view showing the impact of the response actions.

**Layout:**
```
┌─────────────────────────────────────┐
│ [← Back]  Response Simulation      │
├─────────────────────────────────────┤
│ BEFORE                  AFTER       │  ← two-column header
├──────────────┬──────────────────────┤
│ [Map: dense  │ [Map: rerouted       │
│  red traffic]│  traffic, blue paths]│  ← react-native-maps side-by-side
│              │                      │   or vertical tabs on small screens
├──────────────┴──────────────────────┤
│ Metric              Before   After  │
│ Road Congestion     100%     40%    │  ← green arrow down for improvements
│ Rescue ETA          —        8 min  │
│ Residents Alerted   0        3,200  │
│ Resources Deployed  0        6       │
├─────────────────────────────────────┤
│ Actions Executed                    │
│ ✓ Emergency ticket #CIR-2026-0118  │
│ ✓ Traffic rerouted via I-8 bypass  │
│ ✓ 3,200 push alerts sent (G-10)    │
│ ✓ 2 rescue units dispatched        │
└─────────────────────────────────────┘
```

**Behavior:**
- If screen width < 380px, show Before/After as two vertical tabs (toggle) instead of side-by-side
- Metrics animate in using `react-native-reanimated` count-up animation on mount
- Map state is static snapshots (polylines for routes, markers for resources)

---

### 6.7 IncidentCommanderScreen

**File:** `src/screens/IncidentCommanderScreen.tsx`

**Purpose:** High-stakes approval screen — Incident Commanders review critical events and approve or reject the response plan before dispatch.

**Layout:**
```
┌─────────────────────────────────────┐
│ ⚠ INCIDENT COMMANDER REVIEW        │  ← danger-red header bar
├─────────────────────────────────────┤
│ [SeverityBadge: CRITICAL]           │
│ G-10 Urban Flooding                 │
│ Corroboration: 85/100              │
│ Confidence: 94%                     │
│                                     │
│ Evidence Summary                    │
│ • Weather: 45mm/hr rainfall ✓      │
│ • Traffic: +340% congestion ✓      │
│ • Citizens: 4 reports from G-10 ✓  │
│ • Historical: G-10 flooded 2024 ✓  │
│                                     │
│ Proposed Actions                    │
│ • Reroute traffic via I-8 bypass   │
│ • Create emergency ticket #XXXX    │
│ • Send push alert to 3,200 users   │
│ • Dispatch 2 rescue units          │
│                                     │
│ Impact: 3,200 residents, 4 zones   │
│                                     │
│ [APPROVE RESPONSE]  [REJECT]        │  ← full-width buttons, danger + muted
│                                     │
│ Add note (optional):                │
│ [TextInput for audit log note]     │
└─────────────────────────────────────┘
```

**Behavior:**
- Screen can be reached from: (1) `CrisisDetailScreen` Approve/Reject button, (2) tap on a push notification with `type: 'commander_approval_required'`
- Approve → POST to `/api/commander/approve` with `{ eventId, note }` → show success + navigate back to Feed
- Reject → POST to `/api/commander/reject` with `{ eventId, note, reason }` → show confirmation dialog first
- Both actions are irreversible — confirmation dialog required before API call
- Screen is restricted: if `userStore.role !== 'incident_commander'`, show "Access Denied" state instead

---

### 6.8 SettingsScreen

**File:** `src/screens/SettingsScreen.tsx`

**Purpose:** User preferences — role selection, language, notification subscriptions, area filter.

**Sections:**

**Profile**
- Role selector: `Citizen` / `Operator` / `Incident Commander` (radio group)
- Note: Role changes affect what is shown in Feed and whether IncidentCommanderScreen is accessible

**Notifications**
- Toggle: Push alerts for crisis in my area (default ON)
- Toggle: Critical events only (default OFF — means all severities)
- Toggle: Commander approval requests (only visible if role = incident_commander)
- Area subscription: multi-select Islamabad sectors (e.g., G-10, I-8, F-7)

**Language**
- Display language: English / اردو (Urdu)
- Report language hint: English / Urdu / Roman Urdu (affects placeholder text in ReportCrisisScreen)

**About**
- App version
- Backend status indicator (green/red dot pinging `/health`)

---

## 7. Reusable Components

### 7.1 CrisisCard

**File:** `src/components/CrisisCard.tsx`

Displays one crisis event in the feed list.

**Props:**
```typescript
interface CrisisCardProps {
  crisis: CrisisEvent;
  onPress: () => void;
}
```

**Layout:**
```
┌──────────────────────────────────────┐
│ [CrisisTypeIcon]  G-10 Flooding     │  ← icon + title row
│                   3 min ago · G-10  │  ← muted timestamp + sector
│                   [SeverityBadge]   │
├──────────────────────────────────────┤
│ Corroboration Score                  │
│ [████████████░░░] 85/100            │  ← horizontal score bar
├──────────────────────────────────────┤
│ [🧠✓][📡✓][🔀✓][📋✓]  ← agent icons │  ← 4 visible, shows pipeline progress
└──────────────────────────────────────┘
```

- Card background: `#1C2B3A`; border-left 4px solid `severityColor`
- Tap → `onPress()` (parent handles navigation)
- Long-press → haptic feedback; no action

### 7.2 CorroborationMeter

**File:** `src/components/CorroborationMeter.tsx`

Circular gauge showing the corroboration score.

**Props:**
```typescript
interface CorroborationMeterProps {
  score: number;       // 0–100
  size?: number;       // default 120
  animated?: boolean;  // animates from 0 to score on mount (default true)
}
```

- SVG-based arc drawn with `react-native-reanimated` animated stroke
- Color: `#6B7A8D` (0–30) → `#F4A261` (31–74) → `#E63946` (75–100)
- Score number rendered in center, Inter-Bold 24px
- Status label below score (Noise / Watching / Monitoring / Alert / Critical)

### 7.3 AgentTimeline

**File:** `src/components/AgentTimeline.tsx`

Horizontal stepper showing pipeline progress across the 8 agents.

**Props:**
```typescript
interface AgentTimelineProps {
  agents: AgentStep[];  // array of { name, status, icon }
  compact?: boolean;    // shows only icons, no labels (for CrisisCard)
}
```

- Status icons: checkmark circle (done, green), animated spinner (active, blue), empty circle (pending, muted)
- Connecting line between steps, colored based on whether step is done
- In full mode: label below each icon

### 7.4 SimulationDiff

**File:** `src/components/SimulationDiff.tsx`

Before/After metric comparison table.

**Props:**
```typescript
interface SimulationDiffProps {
  metrics: Array<{
    label: string;
    before: string;
    after: string;
    improved: boolean;
  }>;
}
```

- `improved: true` → After cell shows green text + down-arrow icon
- `improved: false` → After cell shows normal text

### 7.5 TraceLog

**File:** `src/components/TraceLog.tsx`

Scrollable monospace log display for raw agent JSON output.

**Props:**
```typescript
interface TraceLogProps {
  content: string;   // raw JSON string
  maxLines?: number; // default 20, shows "Show more" button
}
```

- Background: `#0F1923`; font: Fira Code 13px; color: `#E8EFF5`
- Keys highlighted in `#0077B6`, values in `#2A9D8F`, strings in `#F4A261`
- Horizontal scroll enabled

### 7.6 IncidentBanner

**File:** `src/components/IncidentBanner.tsx`

Sticky top banner shown when any critical crisis is active.

**Props:**
```typescript
interface IncidentBannerProps {
  crisis: CrisisEvent;
  onPress: () => void;
}
```

- Background: `#E63946`; full width; 48px height
- Text: "⚠ CRITICAL: G-10 Flooding — Tap to review" — Inter-SemiBold 14px white
- Pulses with subtle opacity animation (0.8 → 1.0) every 2 seconds
- Tapping navigates to CrisisDetailScreen

### 7.7 SeverityBadge

**File:** `src/components/SeverityBadge.tsx`

Pill-shaped badge with severity label.

**Props:**
```typescript
interface SeverityBadgeProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md';
}
```

- Background maps to severity color; text always white; border-radius 6px

### 7.8 ScoreBar

**File:** `src/components/ScoreBar.tsx`

Horizontal progress bar showing per-source contribution to corroboration score.

**Props:**
```typescript
interface ScoreBarProps {
  label: string;       // e.g., "Weather API"
  score: number;       // points earned, e.g., 30
  maxScore: number;    // max possible, e.g., 30
}
```

- Label on left, `score/maxScore` on right
- Filled portion in `#0077B6`; unfilled in `#1C2B3A`
- Animates fill width on mount

### 7.9 CrisisTypeIcon

**File:** `src/components/CrisisTypeIcon.tsx`

Maps a `CrisisType` enum value to a `MaterialCommunityIcons` icon.

```typescript
const iconMap: Record<CrisisType, string> = {
  flood:            'water',
  fire:             'fire',
  heatwave:         'thermometer-high',
  road_blockage:    'road-variant',
  power_outage:     'lightning-bolt-off',
  air_quality:      'air-filter',
  flash_flood:      'weather-pouring',
  earthquake:       'earth',
  traffic_gridlock: 'traffic-cone',
  sewage_overflow:  'pipe-leak',
};
```

---

## 8. State Management

All global state managed with Zustand. No Redux. No Context API for data (only for theme).

### 8.1 crisisStore (`src/store/crisisStore.ts`)

```typescript
interface CrisisStore {
  activeCrises: CrisisEvent[];
  selectedCrisisId: string | null;

  setCrises: (crises: CrisisEvent[]) => void;
  addOrUpdateCrisis: (crisis: CrisisEvent) => void;  // called by WebSocket
  removeCrisis: (crisisId: string) => void;
  selectCrisis: (id: string | null) => void;
  getCrisisById: (id: string) => CrisisEvent | undefined;
}
```

- Persisted to AsyncStorage via Zustand `persist` middleware — key: `crisis_store`
- `addOrUpdateCrisis` upserts by `event_id`; re-sorts the list by score descending

### 8.2 socketStore (`src/store/socketStore.ts`)

```typescript
interface SocketStore {
  connected: boolean;
  lastPing: number | null;
  setConnected: (v: boolean) => void;
  setLastPing: (ts: number) => void;
}
```

- WebSocket events are handled in `useSocket` hook, not directly in this store
- Store just tracks connection state for UI indicators

### 8.3 userStore (`src/store/userStore.ts`)

```typescript
interface UserStore {
  role: 'citizen' | 'operator' | 'incident_commander';
  language: 'en' | 'ur';
  reportLanguageHint: 'en' | 'ur' | 'roman_ur';
  subscribedSectors: string[];
  notifyAllSeverities: boolean;
  notifyCommanderApprovals: boolean;
  deviceId: string;           // UUID generated on first launch, never changes

  setRole: (role: UserStore['role']) => void;
  setLanguage: (lang: UserStore['language']) => void;
  setSubscribedSectors: (sectors: string[]) => void;
  toggleNotifyAllSeverities: () => void;
}
```

- Persisted to AsyncStorage — key: `user_store`

### 8.4 notificationStore (`src/store/notificationStore.ts`)

```typescript
interface NotificationStore {
  pendingApprovals: number;        // drives Feed tab badge
  lastNotificationCrisisId: string | null;

  incrementPending: () => void;
  decrementPending: () => void;
  setLastNotificationCrisisId: (id: string) => void;
}
```

---

## 9. API Layer

### 9.1 Axios Client (`src/api/client.ts`)

```typescript
const client = axios.create({
  baseURL: Config.API_URL,          // from react-native-config
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach device_id header
client.interceptors.request.use(config => {
  config.headers['X-Device-ID'] = userStore.getState().deviceId;
  return config;
});
```

### 9.2 Crisis API (`src/api/crisisApi.ts`)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/crises` | Fetch all active crises |
| GET | `/api/crises/:id` | Fetch single crisis with full trace + simulation data |
| GET | `/api/crises/:id/trace` | Fetch Antigravity trace for a crisis |
| GET | `/api/crises/:id/simulation` | Fetch simulation before/after data |

### 9.3 Report API (`src/api/reportApi.ts`)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/reports` | Submit citizen crisis report |
| POST | `/api/reports/upload` | Upload photo, returns `photo_url` |

### 9.4 Commander API (`src/api/commanderApi.ts`)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/commander/approve` | Approve a critical event response plan |
| POST | `/api/commander/reject` | Reject a critical event response plan |

### 9.5 WebSocket Events (`src/hooks/useSocket.ts`)

The socket connects to `Config.WS_URL` on app start (in `SplashScreen`).

**Incoming events (server → client):**

| Event | Payload | Action |
|---|---|---|
| `crisis:new` | `CrisisEvent` | `crisisStore.addOrUpdateCrisis()` |
| `crisis:updated` | `CrisisEvent` | `crisisStore.addOrUpdateCrisis()` |
| `crisis:resolved` | `{ crisisId: string }` | `crisisStore.removeCrisis()` |
| `score:updated` | `{ crisisId: string; score: number }` | Update score on matching crisis in store |
| `commander:approval_required` | `{ crisisId: string; eventId: string }` | `notificationStore.incrementPending()` |

**Outgoing events (client → server):**

| Event | Payload | When |
|---|---|---|
| `subscribe:sector` | `{ sectors: string[] }` | On connect, after loading userStore |

---

## 10. Push Notifications

### 10.1 FCM Setup

- Firebase project configured in `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- `@react-native-firebase/messaging` handles token registration and foreground/background handlers
- FCM token sent to backend on first launch and on token refresh: POST `/api/devices/register` with `{ device_id, fcm_token, sectors, role }`

### 10.2 Notification Types

| `type` field | Title | Body | Tap Action |
|---|---|---|---|
| `crisis_alert` | "🚨 Crisis Alert in [sector]" | Crisis type + severity | Navigate to CrisisDetailScreen |
| `commander_approval_required` | "⚠ Action Required" | "Critical event needs your approval" | Navigate to IncidentCommanderScreen |
| `crisis_resolved` | "✓ Crisis Resolved" | "G-10 flooding has been resolved" | Navigate to CrisisDetailScreen |
| `score_update` | "📊 Corroboration Update" | "Score reached 85/100 — Alert level" | Navigate to CrisisDetailScreen |

### 10.3 Foreground Handling

When app is in foreground, FCM messages are intercepted before showing a system notification. Instead:
- `crisis_alert` → `crisisStore.addOrUpdateCrisis()` + show in-app toast (bottom banner, 3s auto-dismiss)
- `commander_approval_required` → `notificationStore.incrementPending()` + show `IncidentBanner`
- System notification is **not** shown when app is in foreground

### 10.4 Background / Quit State

When app is in background or quit, FCM delivers system notifications. On tap, app cold-starts and the `AppNavigator` reads the notification data from `messaging().getInitialNotification()` to navigate directly to the correct screen.

---

## 11. Maps Integration

### 11.1 Library

`react-native-maps` with Google Maps provider on both Android and iOS (not Apple Maps).

```typescript
import MapView, { PROVIDER_GOOGLE, Polygon, Marker, Polyline } from 'react-native-maps';
```

### 11.2 Map Styles

Custom dark map style JSON applied to `MapView` via `customMapStyle` prop — matches the EOC dark aesthetic (`#0F1923` background, `#1C2B3A` roads, minimal labels).

### 11.3 Crisis Zone Polygon

In `CrisisDetailScreen` and `SimulationScreen`, the affected zone is rendered as a filled polygon:
- Fill color: severity color at 30% opacity
- Stroke: severity color at 80% opacity, 2px width
- Coordinates come from `crisis.impact_assessment.zone_geojson`

### 11.4 SimulationScreen Maps

Before map: red polylines on major affected roads (high congestion state).
After map: blue polylines on rerouted paths, green markers for resource deployment points.

Both maps are non-interactive (`scrollEnabled={false}`, `zoomEnabled={false}`) — they are visual snapshots, not interactive maps.

### 11.5 ReportCrisisScreen Map

Not shown inline — location is displayed as text (`"📍 G-10/2, Islamabad"`). No map view on the report screen to keep the form fast and lightweight.

---

## 12. Offline Architecture

### 12.1 Strategy

CIRO mobile follows an **offline-read, online-write** model:
- Citizens can **view** the last-synced crisis feed without internet
- Citizens **cannot** submit reports offline (requires server acknowledgment for deduplication)
- Operators can **view** crisis details and agent traces offline (cached)
- Approval actions require internet (POST to backend, no offline queue)

### 12.2 Cache Keys (AsyncStorage)

| Key | Content | TTL |
|---|---|---|
| `crisis_store` | Zustand crisis store state | Persisted until next sync |
| `user_store` | Zustand user store state | Persisted forever |
| `crisis_detail:{id}` | Full CrisisEvent with trace + simulation | 1 hour |
| `device_id` | UUID string | Persisted forever |

### 12.3 Stale UI

When offline:
- Feed shows last-synced data with a banner: "Offline — showing cached data from [timestamp]"
- Submit Report button is disabled with tooltip: "Internet required to submit report"
- WebSocket shows disconnected dot in Settings screen

### 12.4 Background Sync

On app foreground: `useSocket` reconnects WebSocket → server pushes diff of missed `crisis:new` and `crisis:updated` events → store updated automatically.

---

## 13. Roman Urdu & Localization

### 13.1 Font Loading

Three custom fonts must be loaded before splash screen dismisses:
- `Inter-Regular.ttf`, `Inter-Medium.ttf`, `Inter-SemiBold.ttf`, `Inter-Bold.ttf`
- `FiraCode-Regular.ttf`
- `NotoNastaliqUrdu-Regular.ttf`

Fonts placed in `android/app/src/main/assets/fonts/` and `ios/CiroMobile/Fonts/` (linked via `react-native.config.js`).

### 13.2 Roman Urdu Input

The report text input does not require any special keyboard — standard device keyboard is used. Roman Urdu is Latin script typed on a standard keyboard. No special input method is needed.

- `textContentType="none"` — prevents iOS from auto-correcting Roman Urdu words
- `autoCorrect={false}` — same reason
- `spellCheck={false}` — same reason

### 13.3 Urdu (Arabic Script) Display

For displaying Urdu text (crisis descriptions, sector names in Urdu) use:
```typescript
<Text style={fonts.urdu}>گرمی بہت زیادہ ہے</Text>
```

`writingDirection: 'rtl'` is set in `fonts.urdu`. Do not mix Urdu and Latin text in the same `<Text>` node — use separate `<Text>` components and wrap in a `<View style={{ flexDirection: 'row-reverse' }}>`.

### 13.4 Language Toggle

When `userStore.language === 'ur'`, all static UI strings switch to Urdu equivalents. This is managed via a simple `t()` utility:

```typescript
// src/utils/i18n.ts
const strings = {
  en: { feedTitle: 'Crisis Feed', reportBtn: 'Report a Crisis', ... },
  ur: { feedTitle: 'بحران فیڈ',   reportBtn: 'بحران رپورٹ کریں', ... },
};

export const t = (key: keyof typeof strings['en']) =>
  strings[userStore.getState().language][key];
```

No external i18n library needed for this scope.

---

## 14. Environment Configuration

### 14.1 `.env` File

```
API_URL=http://192.168.1.x:3000          # Backend Node.js API
WS_URL=ws://192.168.1.x:3000             # WebSocket endpoint
GOOGLE_MAPS_API_KEY=your_key_here
FCM_SENDER_ID=your_sender_id
```

`react-native-config` exposes these as `Config.API_URL` etc. in TypeScript.

For production, replace with actual deployed URLs.

### 14.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@screens/*": ["src/screens/*"],
      "@components/*": ["src/components/*"],
      "@store/*": ["src/store/*"],
      "@api/*": ["src/api/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@constants/*": ["src/constants/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

Path aliases require `babel-plugin-module-resolver` in `babel.config.js`.

### 14.3 `metro.config.js`

No special configuration beyond NativeWind's Metro transformer for Tailwind class processing.

---

*Spec Version: 1.0 | Date: May 2026 | Stack: React Native CLI + TypeScript*
