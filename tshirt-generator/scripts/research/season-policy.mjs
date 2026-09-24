import fs from 'node:fs/promises';
export const seasonPolicy = JSON.parse(await fs.readFile(new URL('../../data/research/season-policy.json', import.meta.url),'utf8'));
/** Source season stays literal. A fallback is admitted only for an audited slot. */
export function permittedSeason(teamId, variant, season, requested='2026/27') {
  return season===requested || seasonPolicy.fallbacks.some(f=>f.team_id===teamId&&f.variant===variant&&f.season===season);
}
export function fallbackFor(teamId,variant,season){
  return seasonPolicy.fallbacks.find(f=>f.team_id===teamId&&f.variant===variant&&f.season===season)??null;
}
