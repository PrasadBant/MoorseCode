/**
 * normalizeMessage(raw)
 * Maps whatever the Pi gateway (or a Morse decode) sends as a raw signal
 * string — including raw Morse itself — onto the app's fixed alert
 * vocabulary (OK / HELP / SOS / SURVIVOR DETECTED). Unrecognized strings
 * pass through uppercased rather than being dropped.
 */
export const normalizeMessage = (raw) => {
  if (!raw) return 'OK';
  const upper = String(raw).trim().toUpperCase();

  if (upper === 'SOS' || upper.includes('SOS') || upper === '... --- ...') return 'SOS';
  if (upper === 'HELP' || upper.includes('HELP') || upper === '.... . .-.. .--.') return 'HELP';
  if (upper.includes('SURVIVOR')) return 'SURVIVOR DETECTED';
  if (upper.includes('OK') || upper.includes('NOMINAL') || upper.includes('CLEAR')) return 'OK';

  return upper; // Pass raw string through for unknown signals
};
