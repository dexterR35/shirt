import { neutralConfig, validateConfig } from './shirt-renderer.js';

/** Two green paint colours per surface; fabric supplies the tonal detail. */
export const NETBET_N_PALETTES = Object.freeze({
  'on-dark': Object.freeze({ green: '#13AE8E', darkGreen: '#096254' }),
  'on-light': Object.freeze({ green: '#07977B', darkGreen: '#064B40' }),
});

// Redrawn rounded, tilted N silhouette from the user's reference. No screenshot
// pixels are embedded. The path is mapped into registered 200-unit shirt paint.
const REFERENCE_N = 'M114 1Q121 -2 127 7L198 109Q207 122 196 133L165 153Q158 158 150 153L83 109Q79 106 77.5 109.5Q76 111 78.5 115L118 174Q123 181 116.5 187L87.5 205Q79 210 74 202L3 98Q-3 86 3.5 78.5L44 49Q49 45 55 48L109 84Q115 88 115.5 84Q116 82 113.5 78.5L82 32Q77 24 84 19Z';
let coordinate = 0;
const N_PAINT = REFERENCE_N.replace(/-?\d+(?:\.\d+)?/g, value => {
  const origin = coordinate++ % 2 === 0 ? 54 : 60;
  return String(Number((origin + Number(value) * 0.46).toFixed(3)));
});

/** @param {'on-dark'|'on-light'} surface */
export function netbetNJerseyConfig(surface = 'on-dark') {
  if (!Object.hasOwn(NETBET_N_PALETTES, surface)) throw Error('Unknown jersey surface');
  const p = NETBET_N_PALETTES[surface], config = neutralConfig(p.darkGreen);
  config.colors.leftSleeve = config.colors.rightSleeve = p.green;
  config.colors.leftCuff = config.colors.rightCuff = p.darkGreen;
  config.colors.collar = p.green;
  config.layers = [
    { id:'rounded-n-motif', type:'path', clip:'body', d:N_PAINT, fill:p.green },
    { id:'left-shoulder', type:'path', clip:'all', d:'M0 0H76L65 10L38 24L28 37L0 30Z', fill:p.green },
    { id:'right-shoulder', type:'path', clip:'all', d:'M200 0H124L135 10L162 24L172 37L200 30Z', fill:p.green },
  ];
  return validateConfig(config);
}
