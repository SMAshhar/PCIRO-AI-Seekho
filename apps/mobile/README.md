# CIRO Mobile App

React Native CLI app for citizens and incident commanders. Implements `MOBILE_APP.md` + `DESIGN.md` (EOC dark theme, corroboration UI, commander approval).

## Run

```bash
cd apps/mobile
npm install
npx react-native start
# separate terminal:
npx react-native run-android
```

## Mock mode

`src/constants/config.ts` sets `USE_MOCK_DATA: true` — feed, detail, trace, and simulation work without a backend.

Set `USE_MOCK_DATA: false` and update `API_URL` / `WS_URL` when the Node API is ready.

## Maps

Add your Google Maps API key in `android/app/src/main/res/values/strings.xml` (`google_maps_key`).

## Commander flow

Settings → Role → **Incident Commander** → open G-10 flood (critical) → Review & Approve.

## Structure

- `src/screens/` — 8 screens
- `src/components/` — CrisisCard, CorroborationMeter, etc.
- `src/store/` — Zustand (crisis, user, socket, notifications)
- `src/api/` — REST + mock fallback
