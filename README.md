# DemoTrnsVchi — AV/Robotics Operations Center (Public Preview)

> **Public repository.** This repo exists only to host a GitHub Pages preview of the AV/Robotics Operations Center so that investors, partners, and startup groups can observe the application **without signing an NDA** and without any legal limitation on previewing the platform.

> 🔒 Source code, type contracts, internal documentation, worklogs, and architecture files live in the **private** companion repo [`RoboTrnsVchi`](https://github.com/testdemoqwenai2025-creator/RoboTrnsVchi). They are intentionally **not** mirrored here.

## Live preview

Once GitHub Pages finishes building, the preview will be available at:

**👉 https://testdemoqwenai2025-creator.github.io/DemoTrnsVchi/**

## What you'll see

A compartmentalized **Multi-Page Application** (Next.js App Router) for an autonomous-vehicles-and-robotics fleet. Every module is its own URL — bookmarkable and refresh-safe — with shared chrome (header, GDPR footer, theme toggle) on every page. **19 routes total: 6 operational modules + 8 deep AV subsystems + 5 cross-cutting pages.**

### Operational modules (M1–M6, Phase 1)

| Page | What it shows |
|------|---------------|
| **Fleet Overview** | Aggregate status of every AV and robot — KPIs, registry table, status donut |
| **Live Telemetry** | 5 Hz sensor streams (LiDAR, camera, IMU, GPS, battery, temperature, torque) with threshold-based warn/fault coloring |
| **Mission Control** | Kanban board of queued / active / completed / cancelled missions with waypoint detail |
| **Robotics Console** | Joint-level state, end-effector pose, gripper control, animated 7-DoF SVG schematic |
| **Diagnostics Hub** | Severity-sorted alerts with acknowledgement, fleet-health radar, maintenance schedule |
| **Knowledge Vault** | Searchable AV/Robotics encyclopedia with cross-link navigation |

### Deep AV subsystems (M7–M14, Phase 3)

| Page | What it shows |
|------|---------------|
| `/perception` | Multi-modal sensor fusion: LiDAR/RADAR/RGB-D/Ultrasonic sync, 3D object detection with EKF/UKF, semantic segmentation canvas, adverse-weather filter |
| `/localization` | HD map SVG with ego pose, SLAM-vs-GNSS divergence, RTK precision, visual-odometer backup, pose-confidence timeline |
| `/prediction` | Tracked agents with intention labels, multi-hypothesis trajectory cones, occlusion map, scene graph |
| `/planning` | Behaviour state machine SVG, decision log, arbitration tree (safety/legality/comfort/progress), scene context |
| `/trajectory` | 4D quintic trajectory, MPC solver status, controller-comparison chart (MPC vs PID vs Pure Pursuit), Smith predictor |
| `/v2x` | V2V mesh SVG with peers, V2I traffic-light card, decentralized fleet consensus, HSM crypto verification log |
| `/safety` | Fail-safe FSM (NOMINAL/SOFT_STOP/HARD_STOP/SAFE_MODE/SHUTDOWN), redundancy, watchdog timers, ASIL A/B/C/D |
| `/simulation` | Active sim runs, CI/CD pipeline stages, HIL bench status, scenario library with pass-rate bars |

### Cross-cutting pages (Phase 2)

| Page | What it shows |
|------|---------------|
| `/` | Landing with hero, compartment map, CTA buttons |
| `/login` | Demo login form with auto-fill button (`operator@av-robotics.demo` / `demo-avops-2026`) |
| `/search` | Cross-module search across fleet, missions, and knowledge entries |
| `/chat` | Theme-scoped assistant (AV/Robotics only) + links to 8 free AI platforms |
| `/privacy` | Full 5-section GDPR privacy notice |

## Screenshots

The `screenshots/` directory contains one PNG per module and per cross-cutting page. They are also embedded in the Pages landing page (`index.html`).

## License & access

This public repo is provided for **preview purposes only**. All intellectual property — including source code, architecture, and design — remains with the project owner. The full source is available under NDA via the private repo.

For access to the private repo, the live sandbox deployment, or a guided demo, contact the project owner.
