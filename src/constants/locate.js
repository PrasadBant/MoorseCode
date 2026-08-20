/**
 * locate.js
 * Parameters for the terminal's `locate` command — the sectors it cycles
 * through and the base point/jitter range it fabricates a triangulated
 * fix around. Consumed by App.jsx's command handler and plotted on the
 * Tactical Map (components/terminal/TacticalMap.jsx).
 */

export const LOCATE_SECTORS = ['ALPHA-01', 'ALPHA-02', 'ALPHA-03', 'BRAVO-01', 'BRAVO-02', 'CHARLIE-01', 'CHARLIE-02'];
export const LOCATE_BASE_LAT = 34.0522;
export const LOCATE_BASE_LNG = -118.2437;
export const LOCATE_JITTER_DEG = 0.3; // max +/- degrees of drift from the base point per fix
