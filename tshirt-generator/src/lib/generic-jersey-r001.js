import { neutralConfig, validateConfig } from './shirt-renderer.js';

/** Neutral artwork only: never a researched team, season or catalog entry. */
export const GENERIC_SURFACES = Object.freeze({
  'on-dark': Object.freeze({ label: 'For dark backgrounds', body: '#C4C4C4', collar: '#909090', cuff: '#ACACAC' }),
  'on-light': Object.freeze({ label: 'For light backgrounds', body: '#949494', collar: '#6B6B6B', cuff: '#828282' }),
});

/** @param {'on-dark'|'on-light'} surface */
export function genericJerseyConfig(surface = 'on-dark') {
  if (!Object.hasOwn(GENERIC_SURFACES, surface)) throw Error('Unknown generic jersey surface.');
  const palette = GENERIC_SURFACES[surface], config = neutralConfig(palette.body);
  config.colors.collar = palette.collar;
  config.colors.leftCuff = config.colors.rightCuff = palette.cuff;
  return validateConfig(config);
}
