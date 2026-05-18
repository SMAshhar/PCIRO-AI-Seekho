# Design System: CIRO Mobile App
**Emergency Operations Center — Mobile Design Language**

> A dark, information-dense, operationally authoritative interface. Every pixel serves the mission of detecting, verifying, and responding to urban crises. Design decisions are never decorative — they are tactical.

---

## Configuration Dials

| Dial | Citizen Screens | Command Screens | Why |
|---|---|---|---|
| **Creativity** | `6` | `5` | Functional authority over artistic expression |
| **Density** | `4` | `8` | Citizens need clarity; operators need data |
| **Variance** | `6` | `5` | Asymmetry in layouts, strict structure in data |
| **Motion** | `7` | `8` | Live corroboration feeds demand visible motion |

> Citizen screens (Feed, Report, Settings) run at density 4 — breathable and clear. Command screens (Crisis Detail, Simulation, Agent Trace, Incident Commander) run at density 8 — cockpit mode, every centimeter of data earns its space.

---

## 1. Visual Theme & Atmosphere

CIRO's mobile UI follows the **Tactical Operations Center (EOC)** aesthetic — the visual language of command rooms, not consumer apps. It communicates authority, precision, and urgency without theatrics.

The atmosphere is:
- **Dark by necessity**, not by trend. Darkness is the operating environment; operators in crisis rooms work with low ambient light
- **Information-first but not cluttered** — each screen presents exactly one primary decision or dataset
- **Color as signal, not decoration** — red means danger, amber means caution, green means resolved. These are never used for branding
- **Motion as data communication** — the corroboration gauge fills in real time, crisis cards animate into the feed as events emerge, the severity badge pulses when a critical event needs attention. Every animation carries information

The overall impression should read as: **a tool built for people whose decisions affect lives, not a consumer product built for engagement.**

Inspired by:
- NDMA Pakistan's operational dashboards — authoritative, institutional
- Aviation EFIS (Electronic Flight Instrument Systems) — dense but scannable, color-coded hierarchy
- Military C2 (Command and Control) interfaces — dark, precise, state-driven
- Dark-mode fintech (Robinhood Pro, Bloomberg Terminal) — data density without visual exhaustion

---

## 2. Color System

### 2.1 Palette & Roles

| Name | Hex | Role |
|---|---|---|
| **Deep Void** | `#0F1923` | App background. The canvas. Used on every screen as the base layer |
| **Tactical Surface** | `#1C2B3A` | Card fills, modals, panels. First elevation layer above background |
| **Command Navy** | `#1A2B4A` | Navigation bars, headers, authority elements. Second elevation layer |
| **Elevated Surface** | `#243549` | Hover states, pressed card states, secondary panels |
| **Off-White** | `#E8EFF5` | Primary text. Never pure white — `#FFFFFF` is too harsh on dark backgrounds |
| **Steel Mist** | `#6B7A8D` | Secondary text, timestamps, metadata, disabled labels |
| **Ghost Border** | `rgba(232,239,245,0.08)` | Card borders, structural dividers. Semi-transparent for depth |

### 2.2 Semantic Severity Colors (Single-Accent Logic)

CIRO's primary accent is **Alert Crimson** — all other semantic colors are status indicators, not brand accents. Only one true "action" color exists (Crimson for critical CTAs).

| Name | Hex | Severity | Usage |
|---|---|---|---|
| **Alert Crimson** | `#E63946` | Critical | Critical alerts, Incident Commander CTA, danger zones, primary action buttons |
| **Hazard Amber** | `#F4A261` | Medium/High | Pending approvals, monitoring state, medium severity cards |
| **Intel Blue** | `#0077B6` | Info/Active | Active agents, info cards, secondary actions, active tab indicator |
| **Resolution Green** | `#2A9D8F` | Resolved/Success | Resolved events, approved actions, success states, score confirmation |
| **Noise Gray** | `#4A5568` | Low/Noise | Low-confidence events, archived reports, noise-level score zones |

### 2.3 Corroboration Score Color Mapping

The corroboration gauge transitions through a continuous color range as score increases:

| Score Range | Color | Status Label |
|---|---|---|
| 0 – 30 | `#4A5568` (Noise Gray) | NOISE |
| 31 – 54 | `#F4A261` (Hazard Amber) | WATCHING |
| 55 – 74 | `#FF6B35` (Burnt Orange, interpolated) | MONITORING |
| 75 – 89 | `#E63946` (Alert Crimson) | ALERT |
| 90 – 100 | `#CC0000` (Deep Crimson) | CRITICAL |

Do not use step-based color changes. The gauge color must transition smoothly using linear interpolation across this gradient as the score updates in real time.

### 2.4 Banned Colors

- Pure white `#FFFFFF` for text — always Off-White `#E8EFF5`
- Pure black `#000000` — background is `#0F1923`, never flat black
- Purple, violet, indigo — CIRO's palette carries no brand vanity colors
- Neon glow effects — no `box-shadow` halos or bleed effects
- Gradient backgrounds across large surfaces — reserved exclusively for the corroboration gauge arc

---

## 3. Typography System

### 3.1 Font Stack

`Inter` is **BANNED**. CIRO uses:

| Role | Font | Weight | Use |
|---|---|---|---|
| **Primary** | `Outfit` | 400, 500, 600, 700 | All UI text — headlines, body, labels, buttons |
| **Monospace** | `JetBrains Mono` | 400, 500 | Trace logs, timestamps, hex IDs, score numbers, technical readouts |
| **Urdu/Arabic Script** | `Noto Nastaliq Urdu` | 400 | All Urdu script display — crisis descriptions in Urdu, sector names in Urdu |

**Why Outfit**: Geometric sans, highly legible at small sizes on dark backgrounds, carries quiet authority without feeling military-cold. Letter spacing is naturally balanced for data-dense UIs. Outperforms Inter for vertical rhythm on mobile screens.

**Why JetBrains Mono**: The standard for technical readouts — superior number spacing over Fira Code at the 13–14px range used in trace logs.

### 3.2 Type Scale

| Token | Font | Size | Weight | Line Height | Letter Spacing | Color | Usage |
|---|---|---|---|---|---|---|---|
| `display` | Outfit | 24px | 700 | 1.15 | -0.02em | `#E8EFF5` | Screen titles, major headings |
| `heading` | Outfit | 20px | 600 | 1.2 | -0.01em | `#E8EFF5` | Section headers, card titles |
| `subheading` | Outfit | 16px | 600 | 1.3 | 0 | `#E8EFF5` | Agent names, subsection headers |
| `body` | Outfit | 14px | 400 | 1.55 | 0 | `#E8EFF5` | All body copy, descriptions |
| `label` | Outfit | 12px | 500 | 1.3 | 0.04em | `#6B7A8D` | Timestamps, metadata, field labels, captions |
| `caption` | Outfit | 11px | 400 | 1.3 | 0.06em | `#6B7A8D` | Supporting meta, secondary info only |
| `score` | JetBrains Mono | 28px | 500 | 1.0 | -0.01em | `#E8EFF5` | Corroboration score number in gauge |
| `trace` | JetBrains Mono | 13px | 400 | 1.6 | 0 | `#E8EFF5` | Raw JSON trace log output |
| `trace-key` | JetBrains Mono | 13px | 500 | 1.6 | 0 | `#0077B6` | JSON key names in trace |
| `trace-value` | JetBrains Mono | 13px | 400 | 1.6 | 0 | `#2A9D8F` | JSON string values in trace |
| `badge` | Outfit | 10px | 700 | 1.0 | 0.08em | varies | Severity badges — ALL CAPS always |
| `urdu` | Noto Nastaliq Urdu | 16px | 400 | 1.8 | 0 | `#E8EFF5` | Urdu text, RTL writing direction |

### 3.3 Typography Rules

- Numbers in cockpit-density screens (Crisis Detail, Simulation) always use `JetBrains Mono`, even inline in body copy
- Severity labels in badges are always uppercase (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) — never sentence case
- Urdu text never sits inline with Latin text inside the same `<Text>` node — wrap in a separate block with `writingDirection: 'rtl'`
- No font size below 11px — if content doesn't fit, it must be restructured, not shrunk
- `autoCorrect={false}` and `spellCheck={false}` on all crisis report text inputs — Roman Urdu would be mangled otherwise

---

## 4. Spatial System

### 4.1 Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro gaps — icon-to-label, badge internal |
| `space-2` | 8px | Tight spacing — between related elements |
| `space-3` | 12px | Component internal padding (compact) |
| `space-4` | 16px | Standard component padding — card internals |
| `space-5` | 20px | Screen horizontal padding — left/right gutters |
| `space-6` | 24px | Between card groups |
| `space-8` | 32px | Between major screen sections |
| `space-10` | 40px | Large breathing room between unrelated content |

### 4.2 Density Mode Mapping

**Citizen Mode** (density 4 — breathable):
- Card internal padding: `space-4` (16px)
- Between cards in feed: `space-3` (12px)
- Screen horizontal margin: `space-5` (20px)
- Section gaps: `space-8` (32px)

**Command Mode** (density 8 — cockpit):
- Card internal padding: `space-3` (12px)
- Between data rows: `space-2` (8px)
- Screen horizontal margin: `space-4` (16px)
- Section gaps: `space-5` (20px)

### 4.3 Safe Area Rules

Every screen must respect mobile safe areas:
- **Status bar region**: 44–54px top (device-dependent) — never place interactive elements here
- **Home indicator region**: 34px bottom (iOS) — bottom tab bar must sit above this
- **Notch/Dynamic Island area**: Treated as non-interactive padding
- All screens use `SafeAreaView` or equivalent — content never bleeds into system chrome

### 4.4 Border Radius

| Context | Radius | Examples |
|---|---|---|
| Cards | 12px | `CrisisCard`, agent trace cards, corroboration evidence cards |
| Buttons (primary) | 8px | Submit, Approve, Reject buttons |
| Badges | 6px | Severity badges, score zone labels |
| Score bars | 4px | Corroboration per-source bars |
| Gauge (meter) | circular | `CorroborationMeter` — full arc |
| Bottom sheet | 16px top only | Modals, detail panels that slide up |
| Tab bar | 0px | Flat against bottom safe area |

No `border-radius: 9999px` (pill shape) on large containers or cards. Pills are reserved for small badges only.

---

## 5. Elevation & Shadow System

CIRO uses **depth through opacity layers**, not drop shadows. On dark backgrounds, shadows are nearly invisible — elevation is communicated through background lightness.

### 5.1 Surface Hierarchy

| Layer | Background | Border | Usage |
|---|---|---|---|
| **Layer 0 — Void** | `#0F1923` | none | App background |
| **Layer 1 — Surface** | `#1C2B3A` | `rgba(232,239,245,0.08)` 1px | Cards, panels, list items |
| **Layer 2 — Raised** | `#243549` | `rgba(232,239,245,0.12)` 1px | Pressed states, highlighted cards, active items |
| **Layer 3 — Float** | `#1C2B3A` + `backdrop-blur` | `rgba(232,239,245,0.15)` 1px | Modals, bottom sheets, overlays |
| **Layer 4 — Critical** | `#E63946` | none | Incident banner, critical-state surfaces |

### 5.2 The Double-Bezel Rule (Command Screens Only)

For high-stakes components — the `CorroborationMeter`, the `IncidentBanner`, the Commander approval panel — use nested enclosure architecture:

```
Outer Shell:
  background: rgba(255,255,255,0.04)
  border: 1px solid rgba(255,255,255,0.08)
  padding: 4px
  border-radius: 16px

Inner Core:
  background: #1C2B3A
  border: 1px solid rgba(255,255,255,0.06) inset-top highlight
  border-radius: 12px  ← always 4px less than outer
  padding: 16px
```

This makes critical information feel physically elevated — like a display mounted in a control panel, not a flat card floating on a screen.

### 5.3 Left-Border Severity Rule

`CrisisCard` and related list items use a 4px left border (not drop shadow) to indicate severity. This is the only place where full severity color is applied to a large surface:

- Critical → `border-left: 4px solid #E63946`
- High → `border-left: 4px solid #FF6B35`
- Medium → `border-left: 4px solid #F4A261`
- Low → `border-left: 4px solid #2A9D8F`

---

## 6. Iconography

### 6.1 Icon Library

Use `MaterialCommunityIcons` exclusively. Do not mix icon families. All icons at a consistent `strokeWidth` — MCIcons are filled/outlined per icon, not stroke-based, so select only outline variants for consistency.

### 6.2 Icon Sizes

| Context | Size | Usage |
|---|---|---|
| Tab bar | 24px | Navigation icons |
| Card icons | 20px | Crisis type icons in cards |
| Inline body | 16px | Inline icons in text rows |
| Badge indicators | 12px | Agent status dots, score zone dots |

### 6.3 Crisis Type → Icon Mapping

| Crisis Type | Icon Name | Rationale |
|---|---|---|
| `flood` | `water` | Water level imagery |
| `flash_flood` | `weather-pouring` | Rain intensity |
| `fire` | `fire` | Direct mapping |
| `heatwave` | `thermometer-high` | Temperature extreme |
| `road_blockage` | `road-variant` | Road symbol with variation |
| `power_outage` | `lightning-bolt-off` | Loss of power |
| `air_quality` | `air-filter` | Filtration metaphor |
| `earthquake` | `earth` | Earth movement |
| `traffic_gridlock` | `traffic-cone` | Traffic management |
| `sewage_overflow` | `pipe-leak` | Infrastructure failure |

### 6.4 Agent Status Icons

| Status | Icon | Color |
|---|---|---|
| Done | `check-circle` | `#2A9D8F` (Resolution Green) |
| Active | `loading` (animated spin) | `#0077B6` (Intel Blue) |
| Pending | `circle-outline` | `#6B7A8D` (Steel Mist) |
| Failed | `close-circle` | `#E63946` (Alert Crimson) |

---

## 7. Component Design Language

### 7.1 CrisisCard

The primary repeating unit of the app. Must be instantly scannable.

**Structure (top-to-bottom, left-to-right):**

```
┌── 4px left border (severity color) ──────────────────────────────┐
│                                                                   │
│  [Crisis Type Icon]  Crisis Title (heading)       [Severity Badge]│
│                      Sector · Timestamp (label)                   │
│                                                                   │
│  ──────────────────────────────────────────────────────────────   │
│  Score  [████████████████░░░░]  85/100  ALERT                   │
│         (per-source color: full = scored, empty = not scored)    │
│                                                                   │
│  [✓ NLP][✓ Norm][✓ Corr][⟳ Detect][○ Impact][○ Response]       │
│  (agent pipeline dots — compact visual only)                     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Specs:**
- Background: `#1C2B3A` (Tactical Surface)
- Left border: 4px, severity color (see Section 5.3)
- Card padding: 16px
- Card radius: 12px
- Border: `Ghost Border` (1px, `rgba(232,239,245,0.08)`)
- Between cards: 12px gap in FlatList
- Crisis title: `heading` token (Outfit 20px/600)
- Timestamp/sector: `label` token (Outfit 12px/500, Steel Mist)
- Score number: `JetBrains Mono` 14px/500 — monospace because it's a precise measurement
- Score bar: full width of card, 6px height, 4px radius, Intel Blue fill on Deep Void track
- Agent dots: 8px circles, 4px gap, no labels in compact mode

**Interaction:**
- Tap: navigate to `CrisisDetail` — no delay, no confirmation
- Press-in state: background shifts to `#243549` (Elevated Surface), `scale(0.99)` — subtle press physics
- Spring release on finger-up: `stiffness: 200, damping: 20`

### 7.2 CorroborationMeter (Circular Gauge)

The most visually prominent data component in the app. Used on `CrisisDetailScreen`.

**Structure:**
- Outer container: Double-Bezel (see Section 5.2)
- SVG arc: 220° sweep, 8px stroke width, rounded linecap
- Background arc: `rgba(232,239,245,0.08)` — the empty portion of the gauge
- Filled arc: gradient from score-appropriate color (see Section 2.3)
- Center score: `score` token (JetBrains Mono 28px/500) — animates via count-up on mount
- Status label below score: `badge` token (Outfit 10px/700, uppercase, muted) — e.g., "ALERT"

**Animation:**
- On mount: arc draws from 0° to `score / 100 * 220°` over 1.2 seconds
- Easing: `cubic-bezier(0.32, 0.72, 0, 1)` — fast start, smooth settle (not linear)
- Color transitions with arc: interpolated continuously through the gradient range
- If score updates via WebSocket mid-session: re-animates from current position to new score

**Sizes:**
- Full (CrisisDetailScreen): 160px diameter
- Compact (future dashboard use): 80px diameter

### 7.3 ScoreBar (Per-Source Evidence Bars)

Shows the weight contribution of each signal source to the corroboration score.

**Structure:**
```
Weather API              30 / 30
[████████████████████████████████] ← full width, Intel Blue
```

**Specs:**
- Full row width of its parent container
- Bar height: 6px, radius: 4px
- Fill color: Intel Blue `#0077B6` for scored sources, Noise Gray `#4A5568` for unscored
- Label: `body` token left-aligned, score fraction `label` token right-aligned in JetBrains Mono
- Animation on mount: bars fill from 0 to their value with staggered delay — first bar at 100ms, each subsequent +80ms

### 7.4 AgentTimeline

Horizontal stepper showing pipeline progress.

**Compact mode (CrisisCard):**
- 6 dots, 8px each, 4px gaps
- Colors: done (Resolution Green), active (Intel Blue, pulsing), pending (Steel Mist)
- No labels

**Full mode (CrisisDetailScreen):**
- Horizontal scroll if all 8 agents don't fit
- Each step: 32px icon circle + label below (Outfit 10px/500, Steel Mist)
- Connecting line between steps: 1px, color reflects whether step is complete (Intel Blue if done, Ghost Border if pending)
- Active step: icon circle border pulses with Intel Blue, 2px animated border

### 7.5 SeverityBadge

Pill-shaped status label.

**Specs:**
- Padding: 4px 8px
- Radius: 6px (not full pill — 9999px is banned for non-tiny elements)
- Font: `badge` token — Outfit 10px/700, uppercase, 0.08em letter spacing
- Background: 20% opacity of severity color (e.g., `rgba(230,57,70,0.20)` for critical)
- Text: full severity color (e.g., `#E63946` for critical)
- Sizes: `sm` (10px text, 4px 6px padding) and `md` (11px text, 5px 10px padding)

### 7.6 IncidentBanner

Sticky top component visible across all screens when a critical event is active.

**Structure:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  ▲  CRITICAL EVENT ACTIVE  ·  G-10 Urban Flooding  ·  Tap to review │
└─────────────────────────────────────────────────────────────────────┘
```

**Specs:**
- Background: Alert Crimson `#E63946`
- Height: 48px
- Font: Outfit 13px/600, white `#E8EFF5`
- Left icon: `alert-decagram` (MCIcons) 16px, white
- Full-width, no rounded corners — this is an alert strip, not a card
- **Animation**: Opacity pulses from `0.85` to `1.0` on a 2-second sine cycle, continuously
- Tap: navigates to `CrisisDetailScreen` for that crisis
- Dismiss: not allowed — it stays until the critical event status changes

### 7.7 TraceLog

Scrollable monospace log for raw agent output JSON.

**Specs:**
- Container background: `#0F1923` (Deep Void) — same as app background, creating a terminal-window feel
- Border: `Ghost Border` 1px
- Radius: 8px
- Internal padding: 12px
- Font: `trace` token (JetBrains Mono 13px/400)
- Syntax: JSON keys in Intel Blue `#0077B6`, string values in Resolution Green `#2A9D8F`, numbers in Hazard Amber `#F4A261`, punctuation in Steel Mist `#6B7A8D`
- Max initial height: 260px with "Show more" button — scrollable when expanded
- Horizontal scroll enabled

### 7.8 Primary Buttons

**Critical CTA (Approve, Submit Report, Dispatch):**
- Background: Alert Crimson `#E63946`
- Text: Off-White `#E8EFF5`, Outfit 14px/600
- Radius: 8px
- Padding: 14px 24px
- Full width on all screens
- Active state: `translateY(-1px)` with spring physics `stiffness: 300, damping: 20` — tactile push
- Loading state: Replace label with JetBrains Mono "Processing..." and subtle shimmer across button

**Secondary CTA (Cancel, Reject, View Trace):**
- Background: transparent
- Border: 1px `rgba(232,239,245,0.20)`
- Text: Off-White `#E8EFF5`, Outfit 14px/500
- Same sizing as primary
- Active state: background shifts to `rgba(232,239,245,0.08)`

**Danger Destructive (Reject in Commander Screen):**
- Background: `rgba(230,57,70,0.15)` — desaturated crimson fill
- Border: 1px `rgba(230,57,70,0.40)`
- Text: Alert Crimson `#E63946`, Outfit 14px/600
- Conveys seriousness without being the same visual weight as Approve

### 7.9 Tab Bar

**Specs:**
- Background: `#1A2B4A` (Command Navy)
- Height: 60px + safe area inset
- Border-top: 1px `rgba(232,239,245,0.08)`
- Active tab: icon + label in Intel Blue `#0077B6`
- Inactive tab: icon + label in Steel Mist `#6B7A8D`
- Active indicator: 2px Intel Blue line above active icon
- Notification badge on Feed tab: Alert Crimson circle, JetBrains Mono 10px/500 white count

### 7.10 Form Inputs (Report Screen)

**Text Input:**
- Background: `#243549` (Elevated Surface)
- Border: 1px `Ghost Border` at rest; 1px Intel Blue `#0077B6` on focus
- Radius: 8px
- Padding: 14px 16px
- Font: Outfit 14px/400, Off-White
- Placeholder: Outfit 14px/400, Steel Mist
- Label sits above (never floating) in `label` token

**Error state:**
- Border becomes Alert Crimson `#E63946` 1px
- Error text below input: Outfit 12px/400, Alert Crimson

**Crisis Type Chip Selector:**
- Horizontal scroll, no wrapping
- Each chip: `label` token, Outfit 12px/500
- Unselected: background `#243549`, border Ghost Border, text Steel Mist
- Selected: background `rgba(0,119,182,0.20)`, border Intel Blue 1px, text Off-White
- Radius: 20px (pills are acceptable for small selection chips)

### 7.11 Loading States

Never use circular spinners. Use layout-matched skeletal shimmer:
- Shimmer color: from `rgba(36,53,73,1)` to `rgba(36,53,73,0.2)` — gradient sweeps left-to-right
- Animation duration: 1.5 seconds, infinite loop, linear easing (shimmer is the one case where linear is acceptable)
- Shapes: exactly match the loaded content dimensions (card height, score bar width, etc.)

### 7.12 Empty States

For empty crisis feed, no reports, etc.:
- Center of screen: `MaterialCommunityIcons` icon relevant to context (e.g., `shield-check-outline` for empty feed)
- Icon size: 48px, color Steel Mist
- Heading below icon: Outfit 16px/600, Off-White
- Body below heading: Outfit 14px/400, Steel Mist, max-width 240px, centered
- No illustration art — icon + text is sufficient for a crisis management tool

---

## 8. Screen Design Intent

### 8.1 Splash Screen

**Visual Direction:** Pure theater — the only screen in the app with purely expressive motion.

- Background: Deep Void `#0F1923`, full-screen
- Center composition: "CIRO" wordmark in Outfit 36px/700, Off-White `#E8EFF5` — tracking `-0.03em`
- Below wordmark: tagline in Outfit 13px/400, Steel Mist — "Street complaint to coordinated response in 60 seconds"
- Radar animation: Three concentric circles expanding outward from center
  - Circle 1: starts at 0px, expands to 80px, fades from Intel Blue `#0077B6` opacity 0.6 → 0
  - Circle 2: same, 400ms delay
  - Circle 3: same, 800ms delay
  - Loop: 2.4 second cycle, infinite
- The radar is the only animated element — everything else is static
- No logo mark, no illustration, no photography — typographic identity only

### 8.2 Crisis Feed Screen

**Visual Direction:** The editorial newspaper front page of a crisis system — scannable, hierarchical, live.

**Header:**
- Background: Command Navy `#1A2B4A`
- Left: "CIRO" wordmark, Outfit 20px/700, Off-White
- Right: notification bell icon, Intel Blue, with Alert Crimson count badge if pending approvals exist
- No search bar — crisis management is not browse-first

**Filter Strip:**
- Horizontal scrollable chips below header, no full-width
- Chips: "All", "Critical", "High", "Medium", "Low", "Resolved"
- Background: same as header — visually attached to it, not floating
- Active chip: Intel Blue fill

**Crisis Feed (FlatList):**
- Background: Deep Void `#0F1923`
- 20px horizontal padding, 12px between cards
- New events entering from WebSocket: slide-in from top with spring physics `stiffness: 200, damping: 25`
- Pull-to-refresh indicator: Intel Blue tint, not default platform spinner

**Empty state:** Shield icon + "Islamabad is quiet right now" — plain language, never generic

### 8.3 Report Crisis Screen

**Visual Direction:** Calm and focused. A form that doesn't feel like a form.

- Background: Deep Void `#0F1923`
- Header: "Report a Crisis" in `display` token, back/close button as X icon (not text)
- Large text input dominates the screen — minimum 6 visible lines of text area
- Language hint (EN / UR / Roman UR): three small chip buttons, informational only, Steel Mist colored
- Crisis Type chips: horizontal scroll below the text input
- Location row: single row, GPS icon (Intel Blue) + location text + "Change" link (Intel Blue, small)
- Photo upload: appears only after location is set — not upfront noise
- Submit button: full-width Alert Crimson, pinned to bottom above safe area
- Form never scrolls — all elements fit in one viewport. If content doesn't fit, restructure, don't scroll

### 8.4 Crisis Detail Screen

**Visual Direction:** Cockpit mode. Every piece of data earns its position. No decorative content.

**Header:**
- Crisis type icon (20px) + crisis title in `heading` token
- Severity badge right-aligned

**Corroboration Section (top priority):**
- `CorroborationMeter` (full, 160px) centered in a Double-Bezel container
- Below gauge: score zone status in `badge` token
- Below status: five `ScoreBar` components stacked, each with source label and score fraction

**Impact Section:**
- Two stat blocks side-by-side: "Residents Affected" and "Zones"
- Numbers in JetBrains Mono 22px/500 — these are precise measurements
- Zone names listed below in `body` token

**Map (180px height):**
- Not interactive — `scrollEnabled={false}`, `zoomEnabled={false}`
- Shows crisis zone polygon with severity color at 25% opacity fill
- Dark custom map style — road lines in `#243549`, labels in Steel Mist, water in `#1C2B3A`

**Agent Pipeline:**
- `AgentTimeline` (full mode), horizontally scrollable
- "View Full Trace →" and "View Simulation →" as secondary action rows (Intel Blue text, right arrow icon)

**Commander Gate (conditional):**
- Only visible when `role === 'incident_commander'` AND `crisis.status === 'awaiting_approval'`
- Visually separated from above content by a full-width Alert Crimson 1px horizontal rule
- Two full-width buttons: "Approve Response" (crimson primary), "Reject" (danger destructive secondary)

### 8.5 Agent Trace Screen

**Visual Direction:** Terminal aesthetic — this is where the AI's reasoning is inspected. Dark, monospace-heavy, information-dense.

**Header:**
- "Agent Trace" in `display` token
- Trace ID in JetBrains Mono `label` token below headline, Steel Mist
- Right: Copy button (copies full trace JSON to clipboard, brief "Copied" toast on press)

**Agent Cards (ScrollView, vertical):**
- Each agent has its own card (Tactical Surface background, 12px radius)
- Card header: agent icon + agent name (`subheading` token) + status icon (right-aligned)
- Card body: timestamp offset (JetBrains Mono `label`) + one-line summary (`body` token)
- Expandable section: `TraceLog` component showing raw JSON — collapsed by default, animated height expansion with spring physics on tap

**Card entry animation:** Staggered cascade — first card visible immediately, each subsequent card appears with `80ms * index` delay, sliding from `translateY(12px)` + `opacity: 0` to `translateY(0)` + `opacity: 1` over 400ms

### 8.6 Simulation Screen

**Visual Direction:** Before/After military briefing. Two states of reality, side by side.

**Header:**
- "Response Simulation" in `display` token
- No back-navigation ambiguity — full header back button

**Before / After Maps:**
- Two maps, equal width, side by side (if screen width ≥ 380px)
- On small screens (< 380px): vertical tab toggle with "BEFORE" / "AFTER" chips
- Before map: red polylines on affected roads, no route markers
- After map: blue polylines (rerouted), green markers (resource positions)
- "BEFORE" / "AFTER" labels float above each map in `badge` token — Steel Mist on wider screens, Intel Blue / Resolution Green on the active tab in narrow mode

**Metrics Table:**
- Full-width below maps
- Each row: metric name (`body`) + Before value + After value, right-aligned
- Improved values (after < before for negative metrics): After cell text in Resolution Green + down-arrow icon
- Numbers animate in with count-up (0 → final value) over 800ms using Reanimated, triggered once on screen mount

**Actions Executed:**
- Checklist below metrics, `body` token
- Each item prefixed with `check` icon in Resolution Green

### 8.7 Incident Commander Screen

**Visual Direction:** The most serious screen in the app. Weight and consequence must be felt.

**Header bar:**
- Background: Alert Crimson `#E63946` (only screen with a full-color header)
- "INCIDENT COMMANDER REVIEW" in Outfit 14px/700, white, uppercase, tracking 0.05em
- No back button in the header — Commander must make a decision or use OS navigation to exit

**Content (ScrollView):**
- Crisis title in `display` token
- Corroboration score + confidence, side by side, in JetBrains Mono
- Evidence summary: bulleted list with `check` icons (Resolution Green) for each corroborated signal
- Proposed actions: bulleted list with `chevron-right` icons (Intel Blue)
- Impact: "3,200 residents · 4 zones" in `heading` token, center-aligned, prominent

**Decision Section (pinned-bottom feel via sticky positioning):**
- Optional note input (labeled "Add note for audit log", placeholder "Optional context or reason")
- "APPROVE RESPONSE" button: full-width, Alert Crimson primary — Outfit 14px/700 uppercase
- "REJECT" button: full-width, danger destructive secondary — below Approve
- Both buttons trigger a confirmation `Alert` dialog before making the API call — irreversibility must be explicit

### 8.8 Settings Screen

**Visual Direction:** Clean and calm — the one screen where the user slows down.

- Background: Deep Void `#0F1923`
- Section headers: `label` token, uppercase, Steel Mist, with 1px Ghost Border bottom line — same pattern as iOS grouped settings
- Setting rows: full-width, 52px height, Tactical Surface background
- Toggles: Intel Blue when on, Noise Gray when off
- Role picker: three rows (Citizen / Operator / Incident Commander) with radio indicator
- Backend status: small dot (Intel Blue = connected, Alert Crimson = offline) + "Connected" or "Offline" text in `label` token

---

## 9. Motion & Animation Philosophy

### 9.1 Physics Engine

All interactive motion uses spring physics. No `ease-in-out`, no `linear`, no fixed `duration` for interactive responses. Use platform-appropriate spring config:

```typescript
// Standard UI interactions (card press, button tap)
{ stiffness: 300, damping: 30 }

// Content reveals (cascade, slide-in)
{ stiffness: 200, damping: 25 }

// Gauge and metric animations (weight of data)
{ stiffness: 120, damping: 20 }

// Approval/critical action feedback (heavy, consequential feel)
{ stiffness: 80, damping: 18 }
```

For non-interactive animations (shimmer, radar pulse, gauge draw), use explicit duration with `cubic-bezier(0.32, 0.72, 0, 1)` — fast start, smooth settle.

### 9.2 Motion Taxonomy

| Animation Type | Trigger | Duration / Spring | Purpose |
|---|---|---|---|
| **Radar pulse** (Splash) | Mount, infinite | 2.4s sine cycle | Brand moment — establishes signal metaphor |
| **Feed card slide-in** | WebSocket event | Spring 200/25 | New crisis entering = urgency communicates itself |
| **Cascade stagger** | Screen mount | 80ms × index, Spring 200/25 | Gives feed a living, updating feeling |
| **Gauge arc draw** | Screen mount | 1.2s, cubic-bezier | Score feels computed in front of you |
| **Score count-up** | Screen mount | 800ms, linear | Numbers feel calculated, not loaded |
| **ScoreBar fill** | Screen mount, staggered | 600ms + 80ms stagger | Evidence builds source-by-source |
| **Incident banner pulse** | Active critical event | 2s opacity 0.85→1.0 sine | Urgency without panic — just persistent |
| **Card press** | Touch | Spring 300/30 | scale(0.99) — physical press |
| **Gauge update** | WebSocket score change | Spring 120/20 | From current position, not from 0 |
| **Trace card expand** | User tap | Spring 200/25, height | Terminal output reveals with weight |
| **Commander button press** | Tap | Spring 80/18, translateY(-1px) | Consequence — the heaviest tap in the app |
| **Simulation count-up** | Screen mount | 800ms | Metrics land, not appear |

### 9.3 Performance Rules

- Animate **only** `transform` and `opacity` — never `top`, `left`, `width`, `height`
- `CorroborationMeter` SVG arc animation runs on the UI thread via Reanimated worklet — not JS thread
- All perpetual animations (`IncidentBanner` pulse, Splash radar) isolated in their own component — no parent re-render triggered
- `FlatList` uses `getItemLayout` for fixed-height cards — prevents layout recalculation during scroll
- `useCallback` on all `renderItem` functions — new crisis WebSocket events must not cause full list re-render

### 9.4 Transitions Between Screens

- Push (navigate forward): standard slide-left transition, no custom override needed
- `IncidentCommanderScreen` entry: slide-up from bottom (sheet metaphor), not push — this is a decision, not a drill-down
- `AgentTraceScreen`: push, but with slight cross-fade overlay (Reanimated shared element transition on the crisis title text if possible)

---

## 10. Anti-Patterns (Banned)

### Typography
- `Inter` — BANNED everywhere. Use `Outfit` for UI, `JetBrains Mono` for technical data
- Font size below 11px — if it doesn't fit, restructure the layout
- Sentence case for severity labels — always UPPERCASE
- Urdu script inline with Latin text in a single `<Text>` node

### Color
- Pure white `#FFFFFF` for text — always `#E8EFF5`
- Pure black `#000000` — background is `#0F1923`
- Purple, violet, indigo, or any color not in the defined palette
- Neon outer glow shadows on any component
- Gradient backgrounds on large card surfaces

### Layout
- `height: 100vh` / `height: screen` — always use `SafeAreaView` and percentage heights
- `ScrollView` on the Report screen — it must fit in one viewport
- Horizontal overflow on any screen — content must be contained
- Overlapping elements — no `position: absolute` stacking of content layers
- Three equal-width card layouts — use asymmetric or full-width patterns

### Motion
- Linear easing for interactive elements — spring physics only
- Animating `top`, `left`, `width`, or `height` — `transform` and `opacity` only
- Circular spinners — skeletal shimmer only
- Running heavy perpetual animations on the JS thread

### Content
- Filler copy: "Elevate", "Seamless", "Next-Gen", "Unleash", "Revolutionize"
- Generic placeholder names: "John Doe", "Crisis 123", "Test Event"
- Round fake numbers in metrics: always use organic data (e.g., 3,217 residents, not 3,000)
- Empty states with only "No data" text — always icon + heading + guidance

### Mobile-Specific
- Website-in-a-phone layouts — every screen must feel natively mobile
- Content bleeding into safe areas (notch, home indicator)
- Touch targets below 44px for any interactive element
- Hamburger menu — tab bar navigation only
- Modals blocking the full screen without a clear dismiss pattern

---

## 11. Responsive & Accessibility Rules

### Touch Targets
- All tappable elements: minimum 44 × 44px touch area
- Card rows: minimum 52px height
- Tab bar items: minimum 48px height
- Buttons: minimum 48px height

### Color Contrast
- All text on dark surfaces: minimum 4.5:1 contrast ratio (WCAG AA)
- Off-White `#E8EFF5` on Deep Void `#0F1923`: 12.8:1 — passes AAA
- Steel Mist `#6B7A8D` on Deep Void: 4.6:1 — passes AA
- White text on Alert Crimson `#E63946`: 4.2:1 — acceptable for large text (heading scale)

### Urdu / RTL Rules
- All Urdu text wrapped in `writingDirection: 'rtl'`
- RTL text blocks never mixed inline with LTR text in the same `<Text>` node
- In Urdu mode, the entire report form placeholder and label text switches to Urdu — not just the input

### Reduced Motion
- If system `reduceMotion` accessibility flag is enabled:
  - Radar pulse (Splash): fades in statically, no expanding circles
  - Score gauge: instant to final value, no arc animation
  - Feed cascade: all cards appear simultaneously at opacity 1
  - Card press: no spring, instant color state change only
  - Incident banner: static, no opacity pulse

---

*Design System Version: 1.0 | Platform: React Native CLI | Base: EOC Dark Theme | Date: May 2026*
