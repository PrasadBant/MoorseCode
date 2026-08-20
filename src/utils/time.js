/**
 * getPreciseTime()
 * Local wall-clock time formatted HH:MM:SS.mmm (24h), used for every
 * telemetry/log timestamp in the app.
 */
export const getPreciseTime = () => {
  const now = new Date();
  return `${now.toLocaleTimeString('en-US', { hour12: false })}.${now.getMilliseconds().toString().padStart(3, '0')}`;
};
