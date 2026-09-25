/**
 * Download popularity for a kit: a count, a 1–5 star tier and an up/down trend.
 *
 * Dummy for now (per user direction, 25 September 2026): there is no shared counter
 * yet, so the count is a deterministic placeholder per kit (stable across reloads,
 * same for every visitor) plus this browser's own recorded downloads from
 * localStorage. The shape below is what a real shared counter (e.g. Supabase) would
 * return, so swapping `baseline`/`baselineTrendPct` for a network call later does not
 * change any caller.
 */

import { kitKey } from "./catalog.js";

const STORAGE_KEY = "tshirt-studio:downloads";

/** Small deterministic hash, so the same kit always seeds the same fake numbers. */
function seedFromString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function baseline(key) {
  return Math.round(40 + mulberry32(seedFromString(key))() * 2000);
}

/** Placeholder trend vs. a prior period, as a percentage from -35 to +35. */
function baselineTrendPct(key) {
  return Math.round((mulberry32(seedFromString(`${key}:trend`))() * 70 - 35) * 10) / 10;
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

/** Record one download of this kit in this browser; returns the updated local count. */
export function recordDownload(item) {
  const key = kitKey(item);
  const local = readLocal();
  local[key] = (local[key] || 0) + 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  } catch {
    /* Private mode or blocked storage: this session still counts it, just not saved. */
  }
  return local[key];
}

function tierFor(count) {
  if (count >= 1600) return 5;
  if (count >= 900) return 4;
  if (count >= 400) return 3;
  if (count >= 150) return 2;
  return 1;
}

/**
 * @param {{team_id:string, variant:string, revision:string, png_layout_revision?:string}} item
 * @returns {{count:number, tier:number, trendPct:number, trend:"up"|"down"|"flat"}}
 */
export function downloadStats(item) {
  const key = kitKey(item);
  const count = baseline(key) + (readLocal()[key] || 0);
  const trendPct = baselineTrendPct(key);
  return {
    count,
    tier: tierFor(count),
    trendPct,
    trend: trendPct > 1 ? "up" : trendPct < -1 ? "down" : "flat",
  };
}

/** Compact display for a download count, e.g. 1.2k. */
export function formatDownloads(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}
