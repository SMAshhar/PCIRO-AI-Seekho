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

## Backend (CIRO FastAPI)

From `ciro/`: `uv run serve` (default `http://0.0.0.0:8000`).

`src/constants/config.ts` uses `http://10.0.2.2:8000` for the Android emulator (host loopback). **Physical device:** set `API_URL` and `WS_URL` to your PC’s LAN IP (e.g. `http://192.168.1.5:8000`).

`USE_MOCK_DATA: false` uses live REST + Socket.IO. Set `true` for fully offline UI.

## Maps

Add your Google Maps API key in `android/app/src/main/res/values/strings.xml` (`google_maps_key`).

## Commander flow

Settings → Role → **Incident Commander** → open a critical crisis → Review & Approve.

## Structure

- `src/screens/` — 8 screens
- `src/components/` — CrisisCard, CorroborationMeter, etc.
- `src/store/` — Zustand (crisis, user, socket, notifications)
- `src/api/` — REST (`crisisApi`, `reportApi`, `commanderApi`, `devicesApi`) + polling after report submit
