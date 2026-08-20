/**
 * telemetry.js
 * The demo-mode telemetry cycle App.jsx rotates through every 6s
 * whenever the real Pi gateway (`config/env.js`) is unreachable, so the
 * dashboard stays fully populated and interactive with no hardware
 * attached.
 */

export const DEMO_CYCLE = [
  { status: 'ACTIVE', message: 'OK', esp_status: 'CONNECTED' },
  { status: 'ACTIVE', message: 'HELP', esp_status: 'CONNECTED' },
  { status: 'ACTIVE', message: 'SOS', esp_status: 'CONNECTED' },
  { status: 'ACTIVE', message: 'SURVIVOR DETECTED', esp_status: 'CONNECTED' },
];
