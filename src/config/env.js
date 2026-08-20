/**
 * env.js
 * Runtime configuration read from Vite env vars, with the original demo
 * default preserved as a fallback — so `npm run dev` still works out of
 * the box with zero setup, but pointing this at a real Pi gateway is now
 * a `.env.local` edit instead of a source change. See `.env.example`.
 */

export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://10.56.55.74:5000/data';
