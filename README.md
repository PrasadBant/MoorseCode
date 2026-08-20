# GHOSTLINK X

**Tactical Offline Disaster Communication Protocol** — a rescue-ops command dashboard for a Morse-over-RF mesh network, built with React, Vite, Tailwind CSS, and Three.js.

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js&logoColor=white)

---

## Overview

GHOSTLINK X is the operator-facing dashboard for a hypothetical offline disaster-communication system: an Arduino-based Morse decoder feeds an ESP8266 mesh (ESP-NOW), a Raspberry Pi gateway classifies incoming signals, and this dashboard visualizes the result in real time — live diagnostics, a 3D radar sweep, an alert protocol readout, and a command-line terminal for issuing rescue-ops commands.

The dashboard runs standalone in **demo mode** by default (no hardware required) — it simulates incoming signals on a cycle so every panel is fully interactive and populated out of the box. Point `API_ENDPOINT` in `src/App.jsx` at a live Raspberry Pi gateway and it switches to live mode automatically.

## Features

| | |
|---|---|
| 🛰️ **Live System Diagnostics** | Real-time status for the core system, ESP8266 node, Raspberry Pi link, and mesh network, with a live RF signal waveform |
| 📡 **3D Radar** | An animated holographic radar sweep (React Three Fiber) that plots simulated survivor/signal blips |
| 🚨 **Alert Protocol** | A dynamic alert readout (OK / HELP / SURVIVOR DETECTED / SOS) with manual state injection buttons |
| 💻 **Rescue Terminal** | An interactive command shell (`help`, `status`, `ping`, `scan`, `locate`, `nodes`, `sos`, `ok`, `version`, `clear`) that drives the alert state directly |
| 🗺️ **Data Pipeline Diagram** | An animated visualization of the hardware chain — Arduino → ESP8266 TX/RX → Raspberry Pi → Dashboard |
| 📋 **Event Audit Log** | A searchable, severity-filterable, exportable timeline of every system event, persisted to `localStorage` |
| 🔐 **Operator Authentication** | A themed login gate with a boot-sequence animation (demo-only — see [Security Notes](#security-notes)) |
| 🧭 **Routed Navigation** | Four dedicated pages (Dashboard / Terminal / Pipeline / Audit Log) instead of one long scroll, with active-route highlighting |
| ⚡ **Performance-conscious 3D** | All three WebGL canvases pause their render loop when scrolled off-screen or the browser tab is backgrounded |

## Tech Stack

- **[React 19](https://react.dev/)** — UI, with the entire post-login dashboard code-split via `React.lazy`
- **[Vite 8](https://vite.dev/)** — dev server & build tooling
- **[Tailwind CSS v4](https://tailwindcss.com/)** — styling, via the `@tailwindcss/vite` plugin
- **[React Router v7](https://reactrouter.com/)** — client-side routing (`HashRouter`, for zero-config static hosting)
- **[Framer Motion](https://motion.dev/)** — animation and page/section transitions
- **[Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)** — the radar scene, signal waveform, and background network globe
- **[ESLint 10](https://eslint.org/)** (flat config) — linting, including the React Compiler / hooks rule set

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm

### Installation

```bash
git clone https://github.com/PrasadBant/MoorseCode.git
cd MoorseCode
npm install
```

### Development

```bash
npm run dev
```

Opens the dev server at `http://localhost:5173`.

### Production build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

### Linting

```bash
npm run lint
```

## Demo Credentials

The login screen validates against a hardcoded credential list for demo purposes:

| Operator ID | Access Code |
|---|---|
| `admin` | `ghost2024` |
| `operator` | `rescue915` |
| `vishu` | `moorscode` |

> ⚠️ See [Security Notes](#security-notes) below before using any of this beyond a local demo.

## Project Structure

```
src/
├── App.jsx                      # Auth gate + top-level state (polling, demo cycle, logs)
├── main.jsx                     # React root + ErrorBoundary
├── index.css                    # Design tokens, base styles, Tailwind utilities
├── hooks/
│   └── useInViewport.js         # IntersectionObserver + Page Visibility hook (pauses off-screen 3D)
├── components/
│   ├── AdminLogin.jsx           # Operator authentication screen
│   ├── Dashboard.jsx            # Router definition (HashRouter + routes)
│   ├── DashboardLayout.jsx      # Shared header / nav / footer shell
│   ├── ErrorBoundary.jsx        # Render-crash fallback UI
│   ├── Hero.jsx                 # Landing hero section
│   ├── LiveStatusPanel.jsx      # System diagnostics panel
│   ├── LiveAlertPanel.jsx       # Alert protocol readout
│   ├── Radar3D.jsx              # 3D radar scene
│   ├── RescueTerminal.jsx       # Interactive command shell
│   ├── PipelineDiagram.jsx      # Hardware data-flow diagram
│   ├── EventAuditLog.jsx        # Filterable/exportable event log
│   ├── SystemOverview.jsx       # Capability cards
│   ├── SignalWaveform.jsx       # 3D RF signal waveform (used in LiveStatusPanel)
│   └── GlobalBackground3D.jsx   # Ambient 3D network globe background
└── pages/
    ├── OverviewPage.jsx         # "/"          — Hero + Status + Radar
    ├── TerminalPage.jsx         # "/terminal"  — Alert Protocol + Terminal
    ├── PipelinePage.jsx         # "/pipeline"  — Pipeline diagram + Capabilities
    └── AuditLogPage.jsx         # "/audit"     — Event Audit Log
```

## How It Works

```
ARDUINO UNO  →  ESP8266 TX  →  915 MHz Mesh  →  ESP8266 RX  →  RASPBERRY PI  →  REACT DASHBOARD
(Morse decoder)  (RF transmit)   (ESP-NOW)      (RF receive)    (API gateway)     (this app)
```

The dashboard polls `API_ENDPOINT` (`src/App.jsx`) every 2 seconds for live telemetry. If the endpoint is unreachable — which it will be unless you have the actual hardware chain running — it falls back to a demo cycle that rotates through `OK → HELP → SOS → SURVIVOR DETECTED` every 6 seconds, so the full UI stays populated and interactive without any hardware attached.

## Security Notes

This is a frontend demo, not a production security boundary:

- **Client-side-only auth** — the credential list in `AdminLogin.jsx` ships in the JS bundle and is trivially visible via devtools. There's no backend, so this cannot be a real access-control layer as-is.
- **The Pi gateway endpoint is plaintext HTTP** and hardcoded — fine for a local demo, but not something to expose beyond a trusted local network without putting a real backend and TLS in front of it.

Both are intentional trade-offs for a self-contained frontend demo, not oversights — treat this as a UI/UX reference implementation, not an access-controlled deployment.

## License

No license has been specified for this project. All rights reserved by the author unless a license is added.
