# CIRO Mobile — Design System & Color Review

> Reviewed against the CIRO product concept: a real-time crisis intelligence dashboard
> used by citizens to report and by Incident Commanders to triage live emergencies in Islamabad.

---

## 1. Design Language Direction

**Name: "Tactical Dark"** — the visual language of a military operations centre, not a consumer app.

This is the correct direction. CIRO operators are handling floods, fires, and gridlock in real time. The UI must communicate trust, authority, and urgency — not friendliness or delight. The current dark palette already moves in this direction. The job now is to tighten and refine it.

**Inspiration references to keep in mind:**
- FEMA/NDMA dashboards
- Air traffic control interfaces
- NATO ATAK (Android Tactical Assault Kit)
- Palantir Gotham dark mode

---

## 2. Current Color Palette — Audit

### 2.1 Background Stack

| Token     | Hex       | Role                        | Verdict |
|-----------|-----------|-----------------------------|---------|
| `void`    | `#0F1923` | Page / screen background    | ✅ Strong. Near-black with just enough blue warmth to feel digital, not flat. |
| `navy`    | `#1A2B4A` | Header / nav bar            | ⚠️ Too close to `surface` tonally. Can cause the header to visually detach. |
| `surface` | `#1C2B3A` | Cards, sheets               | ✅ Good middle layer. |
| `elevated`| `#243549` | Pressed/hover state         | ✅ Correct use of elevation via lightness. |

**Issue — `navy` vs `surface`:** `#1A2B4A` (navy) is slightly bluer but nearly the same lightness as `surface` `#1C2B3A`. On most device screens these will merge into visual noise. The header needs to be distinctly darker **or** accented with a colored top-border to separate it from card content below.

**Fix:**
```ts
navy: '#0D1E36',   // pull it darker — clear 3-layer hierarchy: void < navy < surface
```

---

### 2.2 Severity Color System

| Severity   | Token         | Hex       | Verdict |
|------------|---------------|-----------|---------|
| `critical` | `danger`      | `#E63946` | ✅ Vivid, reads immediately as "stop". Correct. |
| `high`     | `burntOrange` | `#FF6B35` | ✅ Clear one-step below critical. |
| `medium`   | `amber`       | `#F4A261` | ⚠️ Good hue, but slightly desaturated — may look "warm" rather than "warning". |
| `low`      | `green`       | `#2A9D8F` | ⚠️ This is teal, not green. Works visually but "low severity = safe" should read greener. |

**Issue — `green` is actually teal:** `#2A9D8F` skews aqua. This conflicts with the intuitive green = safe / go signal. On a dark background the distinction between this and the blue accent (`#0077B6`) can blur.

**Issue — `amber` saturation:** `#F4A261` is more peach than amber under dark backgrounds. Medium-severity events can look "warm and friendly" when they should feel like a caution sign.

**Fixes:**
```ts
amber: '#F59E0B',   // true amber — higher saturation, more urgent
green: '#22C55E',   // proper signal green — unambiguous "low risk / resolved"
```

---

### 2.3 Corroboration Score Zones

| Zone label    | Score    | Color          | Hex       | Verdict |
|---------------|----------|----------------|-----------|---------|
| `NOISE`       | 0–30     | `noise`        | `#4A5568` | ⚠️ Very dark gray — barely visible on dark card backgrounds. |
| `WATCHING`    | 31–54    | `amber`        | `#F4A261` | ⚠️ Same amber issue above. |
| `MONITORING`  | 55–74    | `burntOrange`  | `#FF6B35` | ✅ |
| `ALERT`       | 75–89    | `danger`       | `#E63946` | ✅ |
| `CRITICAL`    | 90–100   | `deepCrimson`  | `#CC0000` | ❌ Problem — see below. |

**Issue — `deepCrimson` `#CC0000` is the weakest critical color:** Pure RGB red `#CC0000` is dull on screen. It actually looks *less* alarming than `danger` `#E63946` because it has no luminosity boost. The score track at 90+ should be the most alarming color in the entire app. Right now it steps *backward*.

**Fix:**
```ts
deepCrimson: '#FF1744',   // Material Red A400 — screams emergency, clearly beyond danger
```

**Issue — `noise` `#4A5568` on dark cards:** The score track with a near-zero score will render a dark gray fill on a dark gray track — invisible. At minimum, add slight opacity or use a visible low-confidence color.

**Fix:**
```ts
noise: '#64748B',   // slightly lighter slate — visible but clearly "inactive"
```

---

### 2.4 Accent & Interactive Color

| Token  | Hex       | Role                       | Verdict |
|--------|-----------|----------------------------|---------|
| `blue` | `#0077B6` | Active filters, links, pull-to-refresh | ⚠️ Too dark for a dark background. |

**Issue — `blue` contrast:** `#0077B6` against `#1C2B3A` (surface) gives approximately 3.2:1 contrast ratio — below WCAG AA 4.5:1 for text. Active filter chips and interactive labels using this color may be hard to read.

**Fix:**
```ts
blue: '#38BDF8',   // sky-400 — bright, airy, reads instantly on dark, still feels techy
```

---

### 2.5 Text Colors

| Token  | Hex       | Verdict |
|--------|-----------|---------|
| `text` | `#E8EFF5` | ✅ Excellent. Slightly cool-tinted white — avoids harshness of pure white while staying legible. |
| `muted` | `#6B7A8D` | ✅ Good secondary text. Clear hierarchy without disappearing. |

No changes needed here.

---

## 3. Typography Assessment

```ts
const outfit = 'System';   // currently using system font
const mono  = 'monospace';
```

**Issue — using System font:** The system font (San Francisco on iOS, Roboto on Android) is neutral and legible, but it gives CIRO zero visual identity. A tactical dashboard needs a typeface that communicates precision.

**Recommendation — two-font pairing:**

| Role | Recommended Font | Why |
|------|-----------------|-----|
| UI / body | **Inter** | Extremely legible at small sizes, designed for screens, open-source, ships in many RN setups |
| Data / scores / traces | **JetBrains Mono** or **Fira Code** | Monospace with personality — agent traces and corroboration scores read like telemetry data |

Both are free, easy to bundle in React Native, and used by professional dev-tooling UIs (Vercel, Linear, GitHub) — exactly the aesthetic reference CIRO should borrow.

---

## 4. Missing Color Tokens

The current palette has no tokens for these states:

| Missing Token | Suggested Hex | Use Case |
|---------------|--------------|----------|
| `success` | `#22C55E` | Resolved incidents, confirmed dispatch, "action completed" |
| `info` | `#38BDF8` | Informational toasts, non-urgent system messages |
| `overlay` | `rgba(0,0,0,0.6)` | Bottom sheet backdrop, modal dimming |
| `primaryGlow` | `rgba(56,189,248,0.15)` | Glow on active interactive elements |
| `dangerGlow` | `rgba(230,57,70,0.20)` | Pulse glow on critical incident banner |

---

## 5. Cultural Identity Opportunity

CIRO is a Pakistan-specific product (Islamabad). The current palette is excellent but generic — it could be any dark dashboard anywhere in the world.

One refinement that adds identity without breaking the tactical aesthetic:

**Pakistan green as a "confirmed/safe" accent:**

```ts
pakGreen: '#01411C',   // Pakistan flag green — use for "resolved" badges, "cleared" status
```

This is subtle but meaningful — security forces and emergency responders in Pakistan are deeply familiar with this green. Seeing it in the UI signals "this situation is under control." It would replace the teal `#2A9D8F` for the `low` severity / resolved state.

---

## 6. Recommended Revised Palette

```ts
export const colors = {
  // Backgrounds — 3-layer elevation system
  void:         '#0F1923',   // screen background (unchanged — excellent)
  navy:         '#0D1E36',   // header / navigation (darkened for clear separation)
  surface:      '#1C2B3A',   // cards, sheets (unchanged)
  elevated:     '#243549',   // pressed / hover states (unchanged)

  // Text
  text:         '#E8EFF5',   // primary text (unchanged)
  muted:        '#6B7A8D',   // secondary / label text (unchanged)

  // Borders
  border:       'rgba(232,239,245,0.08)',    // (unchanged)
  borderStrong: 'rgba(232,239,245,0.12)',    // (unchanged)

  // Severity — traffic-light logic
  danger:       '#E63946',   // critical (unchanged — excellent)
  burntOrange:  '#FF6B35',   // high (unchanged)
  amber:        '#F59E0B',   // medium — boosted saturation
  green:        '#22C55E',   // low — true signal green (was teal)
  pakGreen:     '#01411C',   // resolved / safe — Pakistan identity accent

  // Score zones
  noise:        '#64748B',   // 0-30 — visible low-confidence gray
  deepCrimson:  '#FF1744',   // 90-100 — max-alarm (replaces dull #CC0000)

  // Accent / Interactive
  blue:         '#38BDF8',   // primary interactive (brightened for dark-bg contrast)

  // New utility tokens
  success:      '#22C55E',
  info:         '#38BDF8',
  overlay:      'rgba(0,0,0,0.6)',
  primaryGlow:  'rgba(56,189,248,0.15)',
  dangerGlow:   'rgba(230,57,70,0.20)',
};
```

---

## 7. Component-Specific Notes

### `IncidentBanner`
- Currently uses `colors.danger` (`#E63946`) as a solid fill — good.
- Add `dangerGlow` as a `shadowColor` with `elevation: 8` on Android / `shadowOpacity` on iOS to create a pulsing red glow effect. This makes the banner physically feel like an alarm.
- The pulsing opacity animation (0.85 → 1.0) is great — keep it.

### `CrisisCard` — Score Track
- Background of the track is hardcoded `rgba(15, 25, 35, 0.6)` — fine, but should use a token (`colors.void` at opacity) to stay consistent.
- At scores ≤ 30 with the old `noise` color, the fill was invisible. The new `#64748B` will fix this.

### `SeverityBadge`
- Uses `${color}33` (20% opacity) as badge background — the opacity approach is smart.
- With the new brighter `green` (`#22C55E`), the badge background will be more vivid. Consider dropping to `${color}22` (13%) for `low` to avoid a neon-green glow on a small badge.

### Filter Chips (`CrisisFeedScreen`)
- Active chip uses `rgba(0, 119, 182, 0.15)` — hardcoded, should reference `colors.primaryGlow` once blue is updated to `#38BDF8`.
- Active border `colors.blue` at `#38BDF8` will now have enough contrast to be readable.

---

## 8. Overall Verdict

| Dimension        | Score | Notes |
|-----------------|-------|-------|
| Direction / mood | 9/10  | Tactical dark is exactly right for emergency management |
| Background stack | 7/10  | Navy/surface too similar — fix navy |
| Severity palette | 8/10  | Amber and green need minor calibration |
| Score zones      | 6/10  | deepCrimson and noise both need replacement |
| Interactive / blue | 6/10 | Too dark for dark backgrounds — needs to be brighter |
| Typography       | 5/10  | System font works but misses a big identity opportunity |
| Cultural fit     | 6/10  | Nothing specifically Pakistani — pak green would add soul |

**Summary:** The foundation is solid and the direction is correct. The fixes needed are surgical — mostly bumping a few hex values and adding `Inter` as a bundled typeface. No design direction change required. The app already looks like a real emergency management product; these refinements will make it look like a polished one.
