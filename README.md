# DemoTrnsVchi — AV/Robotics Operations Center (Public Preview)

> **Public repository.** This repo exists only to host a GitHub Pages preview of the AV/Robotics Operations Center so that investors, partners, and startup groups can observe the application **without signing an NDA** and without any legal limitation on previewing the platform.

> 🔒 Source code, type contracts, internal documentation, worklogs, and architecture files live in the **private** companion repo [`RoboTrnsVchi`](https://github.com/testdemoqwenai2025-creator/RoboTrnsVchi). They are intentionally **not** mirrored here.

## Live preview

Once GitHub Pages finishes building, the preview will be available at:

**👉 https://testdemoqwenai2025-creator.github.io/DemoTrnsVchi/**

## What you'll see

A compartmentalized operations console for an autonomous-vehicles-and-robotics fleet. The live application is hosted in a separate sandbox environment; this Pages site serves as a public-facing summary with embedded screenshots of every module.

| Module | What it shows |
|--------|---------------|
| **Fleet Overview** | Aggregate status of every AV and robot — KPIs, registry table, status donut |
| **Live Telemetry** | 5 Hz sensor streams (LiDAR, camera, IMU, GPS, battery, temperature, torque) with threshold-based warn/fault coloring |
| **Mission Control** | Kanban board of queued / active / completed / cancelled missions with waypoint detail |
| **Robotics Console** | Joint-level state, end-effector pose, gripper control, animated 7-DoF SVG schematic |
| **Diagnostics Hub** | Severity-sorted alerts with acknowledgement, fleet-health radar, maintenance schedule |
| **Knowledge Vault** | Searchable AV/Robotics encyclopedia with cross-link navigation |

## Screenshots

The `screenshots/` directory contains one PNG per module. They are also embedded in the Pages landing page (`index.html`).

## License & access

This public repo is provided for **preview purposes only**. All intellectual property — including source code, architecture, and design — remains with the project owner. The full source is available under NDA via the private repo.

For access to the private repo, the live sandbox deployment, or a guided demo, contact the project owner.
