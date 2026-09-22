# DemoTrnsVchi — AV/Robotics Operations Center (Public Preview)

> **Now a real static MPA.** 19 separate HTML pages, one per route, sharing CSS and JS via `assets/`. Browser back/forward works. Pages are bookmarkable. Theme toggle persists across pages via `localStorage`.

## Live preview

**👉 https://testdemoqwenai2025-creator.github.io/DemoTrnsVchi/**

## Routes (19 + 404)

| Route | Page | Description |
|-------|------|-------------|
| `/` | `index.html` | Landing with hero, compartment map, all module cards |
| `/fleet.html` | Fleet Overview (M1) | 20 assets, KPIs, registry table, status breakdown |
| `/telemetry.html` | Live Telemetry (M2) | Asset picker, 7 sensor cards |
| `/missions.html` | Mission Control (M3) | Kanban board across 4 statuses |
| `/robotics.html` | Robotics Console (M4) | Joint table per robot, end-effector |
| `/diagnostics.html` | Diagnostics Hub (M5) | Alerts, fleet health, maintenance |
| `/knowledge.html` | Knowledge Vault (M6) | Searchable encyclopedia |
| `/perception.html` | Perception & Sensor Fusion (M7) | 4 sensors + 8 detected objects |
| `/localization.html` | Localization & SLAM (M8) | Pose divergence, RTK, visual odometer |
| `/prediction.html` | Prediction & Intent (M9) | Agents, intentions, hypotheses |
| `/planning.html` | Behavioural Planning (M10) | State machine, decision log, arbitration |
| `/trajectory.html` | Trajectory & Motion Control (M11) | MPC, controller comparison, Smith predictor |
| `/v2x.html` | V2X & Multi-Agent (M12) | V2V mesh, V2I, consensus, crypto log |
| `/safety.html` | Fault Tolerance & Fail-Safe (M13) | FSM, redundancy, watchdogs, ASIL |
| `/simulation.html` | Simulation / CI-CD / HIL (M14) | Runs, pipeline, HIL bench, scenarios |
| `/login.html` | Login | Auto-fill demo form, mock session |
| `/search.html` | Search | Cross-module search across fleet/missions/knowledge |
| `/chat.html` | AI Chat | Theme-scoped responder + 8 free platform links |
| `/privacy.html` | Privacy | Full 5-section GDPR notice |
| `/404.html` | 404 | Friendly not-found page |

## Structure

```
DemoTrnsVchi/
├── index.html           ← landing
├── fleet.html
├── telemetry.html
├── missions.html
├── robotics.html
├── diagnostics.html
├── knowledge.html
├── perception.html
├── localization.html
├── prediction.html
├── planning.html
├── trajectory.html
├── v2x.html
├── safety.html
├── simulation.html
├── login.html
├── search.html
├── chat.html
├── privacy.html
├── 404.html
├── assets/
│   ├── styles.css       ← shared styles (dark/light themes)
│   ├── app.js           ← header/footer injection, theme, search, login, chat, mobile nav
│   └── data.js          ← shared mock data (same seeded RNG as the private repo)
├── screenshots/         ← 19 module PNGs embedded in pages
├── README.md            ← this file
└── .gitignore
```

## Interactivity

Every page is interactive — not just screenshots:
- **Fleet** — clickable rows that deep-link to `/telemetry.html?asset=…`
- **Telemetry** — asset picker that updates the URL and sensor readouts
- **Robotics** — joint table updates per selected robot
- **Knowledge** — live search filter
- **Search** — cross-module search across fleet/missions/knowledge
- **Login** — auto-fill demo credentials, persists session via localStorage
- **Chat** — rule-based responder scoped to AV/Robotics topics + links to 8 free AI platforms
- **Theme toggle** — dark/light, persists across pages via localStorage
- **Mobile nav** — full navigation in a slide-out sheet

## Demo credentials

| Field | Value |
|-------|-------|
| Email | `operator@av-robotics.demo` |
| Password | `demo-avops-2026` |

## Privacy

Essential cookies only. No analytics, no advertising. Full GDPR notice at `/privacy.html`.

## License

Preview only. Full source in the private repo [`RoboTrnsVchi`](https://github.com/testdemoqwenai2025-creator/RoboTrnsVchi).
