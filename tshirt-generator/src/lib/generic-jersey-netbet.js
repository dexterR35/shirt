import { neutralConfig, validateConfig } from './shirt-renderer.js';

/** Brand-inspired paint, not a team kit. Adapted from the user's banner reference. */
export const NETBET_GENERIC_PALETTES = Object.freeze({
  'on-dark': Object.freeze({ body: '#3B526B', sleeve: '#23ACA2', teal: '#13A59B', deepTeal: '#087F81', mint: '#60E4C3', cuff: '#24465A' }),
  'on-light': Object.freeze({ body: '#182F47', sleeve: '#118E89', teal: '#06968D', deepTeal: '#076D74', mint: '#48DDB5', cuff: '#18394A' }),
});

/** Rounded, slanted brand panels in the registered 200-unit paint space.
 * @param {'on-dark'|'on-light'} surface
 */
export function netbetGenericJerseyConfig(surface = 'on-dark') {
  if (!Object.hasOwn(NETBET_GENERIC_PALETTES, surface)) throw Error('Unknown jersey surface');
  const p = NETBET_GENERIC_PALETTES[surface], config = neutralConfig(p.body);
  config.colors.leftSleeve = config.colors.rightSleeve = p.sleeve;
  config.colors.leftCuff = config.colors.rightCuff = p.cuff;
  config.colors.collar = p.mint;
  const path = (id, clip, d, fill) => ({ id, type:'path', clip, d, fill });
  config.layers = [
    path('rear-rounded-panel', 'body', 'M104 52L149 39Q156 37 158 45L195 185L123 209L89 69Q87 57 104 52Z', p.deepTeal),
    path('front-rounded-panel', 'body', 'M47 74L112 55Q121 52 124 62L167 209L78 233L39 88Q37 78 47 74Z', p.teal),
    path('mint-panel-edge', 'body', 'M47 74L112 55Q121 52 124 62L125 66Q122 57 113 60L48 79Q40 82 42 90L39 88Q37 78 47 74Z', p.mint),
    path('left-shoulder-paint', 'all', 'M0 0H76L65 10L38 24L28 37L0 30Z', p.sleeve),
    path('right-shoulder-paint', 'all', 'M200 0H124L135 10L162 24L172 37L200 30Z', p.sleeve),
  ];
  return validateConfig(config);
}
