import { neutralConfig, validateConfig } from './shirt-renderer.js';

/** Original neutral paint, independent of every researched club kit. */
export const PAINTED_GENERIC_PALETTES = Object.freeze({
  'on-dark': { body: '#E0E0E0', sleeve: '#959595', shoulder: '#626262', side: '#797979', facet: '#B5B5B5', edge: '#F0F0F0', collar: '#656565' },
  'on-light': { body: '#B9B9B9', sleeve: '#797979', shoulder: '#515151', side: '#666666', facet: '#929292', edge: '#CECECE', collar: '#545454' },
});

/** Editable paint in the original PNG's registered 200-unit space.
 * @param {'on-dark'|'on-light'} surface
 */
export function paintedGenericJerseyConfig(surface = 'on-dark') {
  if (!Object.hasOwn(PAINTED_GENERIC_PALETTES, surface)) throw Error('Unknown jersey surface');
  const p = PAINTED_GENERIC_PALETTES[surface], config = neutralConfig(p.body);
  config.colors.leftSleeve = config.colors.rightSleeve = p.sleeve;
  config.colors.leftCuff = config.colors.rightCuff = p.shoulder;
  config.colors.collar = p.collar;
  const polygon = (id, clip, points, fill, opacity = 1) => ({ id, type: 'polygon', clip, points, fill, opacity });
  config.layers = [
    polygon('shoulder-yoke', 'all', [[0,0],[200,0],[200,30],[154,30],[138,38],[62,38],[46,30],[0,30]], p.shoulder),
    polygon('left-shoulder-edge', 'all', [[0,29],[46,29],[62,37],[62,39],[46,31],[0,31]], p.edge),
    polygon('right-shoulder-edge', 'all', [[200,29],[154,29],[138,37],[138,39],[154,31],[200,31]], p.edge),
    polygon('chest-facet', 'body', [[45,42],[155,42],[155,108],[45,68]], p.facet, 0.62),
    polygon('lower-facet', 'body', [[45,72],[155,112],[155,147],[45,107]], p.facet, 0.3),
    polygon('left-side-panel', 'body', [[42,65],[53,76],[68,117],[61,200],[40,200]], p.side),
    polygon('right-side-panel', 'body', [[158,65],[147,76],[132,117],[139,200],[160,200]], p.side),
    polygon('left-side-edge', 'body', [[53,76],[56,82],[71,117],[64,200],[61,200],[68,117]], p.edge, 0.8),
    polygon('right-side-edge', 'body', [[147,76],[144,82],[129,117],[136,200],[139,200],[132,117]], p.edge, 0.8),
  ];
  return validateConfig(config);
}
