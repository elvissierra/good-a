# GoodToday (Ionic + Vue + Capacitor)

Mobile-first well-being tracker with quick daily check-ins, micro-activities, offline-first SQLite, and gentle notifications.

## Stack
- **Frontend:** Ionic + Vue 3 + Vite + Capacitor
- **Local DB:** @capacitor-community/sqlite
- **Notifications:** @capacitor/local-notifications
- **Backend (planned):** FastAPI + PostgreSQL (endpoints: /checkins, /activities, /sync, /insights)

## Prerequisites
- Node LTS (use `nvm use --lts`)
- Xcode (iOS) / Android Studio (Android)
- Capacitor CLI via `npx` (no global install required)

## First-time Setup

```bash
# install deps
npm i

# add plugins (already in package.json if you followed scaffold)
npm i @capacitor-community/sqlite @capacitor/local-notifications @capacitor/app @capacitor/device

# build web assets & sync to native
npm run build
npx cap sync

# open native projects
npx cap open ios
npx cap open android
# GoodToday (Ionic + Vue 3 + Capacitor) — MVP

Mobile‑first habit & well‑being tracker with quick daily check‑ins, micro‑activities, **offline‑first** storage, and gentle feedback. This README reflects the current MVP and the recent UI/UX passes we shipped.

---

## Overview

GoodToday helps you:
- Record a **daily check‑in** (mood & energy) in seconds.
- Log **micro‑activities** (+10 min quick actions).
- **Work offline** (local SQLite) and **sync** when back online.
- Review your history and simple **insights**.

**Non‑goals:** gamification, noisy visuals. The design is calm, readable, and focused on habit formation.

---

## Tech Stack

- **Frontend:** Ionic + Vue 3 (Vite)
- **Native shell:** Capacitor (iOS/Android)
- **Local DB:** `@capacitor-community/sqlite`
- **Notifications (optional):** `@capacitor/local-notifications`
- **Backend (planned / pluggable):** FastAPI + PostgreSQL  
  Endpoints (subject to change): `/checkins`, `/activities`, `/sync`, `/insights`

---

## Features (MVP)

- ✅ Daily check‑in (mood 1–5, energy 1–5)
- ✅ Quick activity logging (**Run, Workout, Brain Game, Creative**, +10 min)
- ✅ Offline‑first queue + **Sync now** CTA
- ✅ Connectivity awareness (Online/Offline badge + subtle global toasts)
- ✅ History table with sorting (date/mood/energy)
- ✅ “Calm” theme (off‑white background, high‑contrast text)
- ✅ Mobile‑ready layouts (Ionic components)

Roadmap (near‑term):
- ⏩ Insights: weekly rollups (streaks, totals, averages)
- ⏩ PWA manifest + service worker tuning
- ⏩ Profile & settings (timezone, reminders)

---

## Getting Started

## Spinning up the project (dev)

> These steps run the **frontend** locally against either a mocked/local backend or your real API.

1) **Clone & enter the frontend**
   ```bash
   git clone <your-fork-or-repo>
   cd good-a/frontend/goodtoday
   ```

2) **Install Node LTS & deps**
   ```bash
   # ensure you’re on Node LTS
   nvm use --lts  # optional but recommended
   npm i
   ```

3) **Configure environment** (optional for MVP)
   - If you have a live API, create `.env` in `goodtoday/`:
     ```dotenv
     VITE_API_BASE_URL=http://127.0.0.1:8000
     ```
   - If you don’t set this, the app will still run and use local storage/queue logic where applicable.

4) **Run the dev server**
   ```bash
   npm run dev
   ```
   - Open the printed local URL (typically `http://localhost:5173`).
   - Use your browser’s device toolbar to test mobile breakpoints.

5) **(Optional) Run/point a backend**
   - If you’re using the Good’a FastAPI backend, start it separately (e.g., `uvicorn app.main:app --reload`).
   - Confirm CORS allows `http://localhost:5173`.

6) **Quick smoke test**
   - Sign in from `/login` (your current dev credentials), then visit `/home` to create a check‑in and `/checkins` to verify history.

### Spinning up on mobile (Capacitor)
1) Build web assets & sync to native:
   ```bash
   npm run build
   npx cap sync
   ```
2) Open in native IDE:
   ```bash
   npx cap open ios
   npx cap open android
   ```
3) Run on a simulator/device. If you’re using a local backend, ensure your **device** can reach your machine (use your LAN IP, adjust `VITE_API_BASE_URL`).

### Spinning up as a PWA (optional)
```bash
npm run build
npm run preview   # or serve ./dist with your HTTP server of choice
```

### Common pitfalls
- **Port in use**: change Vite port: `npm run dev -- --port 5174`.
- **CORS errors**: ensure backend allows the Vite origin and correct scheme/port.
- **HTTP vs HTTPS on iOS**: iOS may block `http://` in WKWebView. Use HTTPS or configure ATS exceptions for dev.
- **Android cleartext traffic**: allow cleartext during dev or use HTTPS.

```bash
# 1) Install deps
npm i

# 2) Run in web (hot reload)
npm run dev

# 3) Build web assets
npm run build
```

### Native (iOS/Android) via Capacitor

```bash
# Sync web → native platforms
npx cap sync

# Open native projects
npx cap open ios
npx cap open android
```

Run from Xcode / Android Studio on simulator or device.

---

## Project Structure (frontend)

```
frontend/
  goodtoday/
    src/
      components/
        Home.vue          # Today screen: check‑in + quick activities
        Insights.vue      # Insights (MVP placeholder)
        ExploreContainer.vue (scaffold)
      views/
        LoginView.vue     # Auth view (centered card, show/hide password)
        CheckinsView.vue  # History list w/ sorting, empty‑state CTA
      router/
        index.ts          # Routes: /home, /checkins, /insights, /login
      App.vue             # Global toasts, warm theme, text contrast
      ...                 # stores/, services/, api/
```

---

## Theming & Accessibility

- **App background:** soft warm off‑white `#FFF8E6` (see `App.vue`).
- **Text color:** high‑contrast slate `#1F2937` (applied globally).
- **Brand colors:** define full Ionic palettes in `src/theme/variables.css`:
  ```css
  :root {
    --ion-color-goodgreen: #3fa34d;
    --ion-color-goodgreen-rgb: 63,163,77;
    --ion-color-goodgreen-contrast: #ffffff;
    --ion-color-goodgreen-contrast-rgb: 255,255,255;
    --ion-color-goodgreen-shade: #368f43;
    --ion-color-goodgreen-tint: #52ac5f;

    --ion-color-goodorange: #ff8c42;
    --ion-color-goodorange-rgb: 255,140,66;
    --ion-color-goodorange-contrast: #000000;
    --ion-color-goodorange-contrast-rgb: 0,0,0;
    --ion-color-goodorange-shade: #e07b3a;
    --ion-color-goodorange-tint: #ffa055;
  }
  ```
- **A11y:**  
  - Interactive cards have `role="button"`, keyboard handlers, and visible focus.  
  - Toasts use concise, non‑alarmist language.  
  - Headers/segments respect contrast; links are underlined.

---

## Data Flow (MVP)

- **Check‑in save:** `Home.vue` → `services/repo.upsertCheckin()` → local queue → optional `/sync`.
- **Quick activity:** `Home.vue` → `services/repo.createActivity()` (+ `enqueueOp`) → local queue.
- **Sync:** manual “Sync now” or automatic when coming back online.

> Local date handling avoids UTC off‑by‑one via a custom `todayISO()` (local time).

---

## Scripts

- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview built assets
- `npx cap sync` – sync web to native
- `npx cap open ios|android` – open native IDEs

---

## Configuration

Environment variables are minimal for the MVP. If you introduce a live API:
- `VITE_API_BASE_URL` – base URL for REST
- Auth tokens are stored via your chosen strategy (cookie/JWT). Ensure secure storage for native shells.

---

## Troubleshooting

**Text looks low‑contrast**  
We apply `--ion-text-color` globally in `App.vue`. If you spot exceptions, check component‑level styles or Ionic slot colors.

**“Invalid token” on API calls**  
Backend JWT mismatch or expiry—clear session and retry login. Confirm backend clock skew and token alg.

**Capacitor SQLite issues**  
Ensure `@capacitor-community/sqlite` is properly installed and platforms are synced (`npx cap sync`).

---

## Roadmap / Next Steps

- Insights UI (streaks, weekly summaries, top activities)
- Reminders / gentle nudges (Capacitor notifications)
- Profile (time zone, units)
- PWA install experience (manifest, icons, splash)
- CI/CD for web + native pipelines

---

## License

TBD (private during development)

---