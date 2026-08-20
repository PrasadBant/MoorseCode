# Contributing

## Setup

```bash
npm install
npm run dev      # http://localhost:5173, demo mode — no hardware required
```

By default the app runs against a simulated telemetry cycle. To point it at
a real Raspberry Pi gateway instead, copy `.env.example` to `.env.local` and
set `VITE_API_ENDPOINT`.

## Before opening a PR

```bash
npm run lint
npm run build
```

Both also run in CI (`.github/workflows/ci.yml`) on every push/PR to `main`
— a red check means one of these failed.

## Where things live

See the "Project Structure" section of the [README](README.md) for the
full layout. Two conventions worth knowing before you add a file:

- **`src/components/` is organized by feature**, not by type — a new
  terminal-related component goes in `components/terminal/`, not a flat
  `components/` bag. `components/three/` is the exception: it's grouped by
  *technology* (React Three Fiber) because those pieces (radar scene,
  signal waveform, background globe) are reused across features and share
  render-loop/perf concerns, not domain logic.
- **Cross-folder imports use the `@/` alias** (`@/components/terminal/...`,
  `@/utils/...`), configured in `vite.config.js` + `jsconfig.json`. Same-
  folder sibling imports (e.g. `Dashboard.jsx` importing its own
  `DashboardLayout.jsx`) stay relative (`./DashboardLayout`). This keeps
  imports stable if a file moves to a different depth later.

Config values, demo constants, and small pure helpers don't belong inline
in a component — see `src/config/`, `src/constants/`, and `src/utils/` for
where those already live (e.g. `config/env.js` for the API endpoint,
`utils/time.js` for the shared timestamp formatter).

## Code style

- ESLint (flat config, `eslint.config.js`) is the source of truth — run
  `npm run lint` rather than guessing at style.
- No test suite exists yet. Verify UI changes by actually running the app
  (`npm run dev`) rather than reasoning about JSX in the abstract —
  Framer Motion/React Three Fiber bugs in particular tend to only surface
  at runtime (console errors, not lint/build failures).
