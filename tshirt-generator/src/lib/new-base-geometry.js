import { NEW_BASE_OUTLINE, NEW_BASE_SHADOWS } from './generated/new-base-surface.js';

/** Panel seams measured on the replacement base, in 200 × 200 coordinates. */
export const NEW_BASE_GEOMETRY = Object.freeze({
  outline: NEW_BASE_OUTLINE,
  torso: 'M35 22L77 2Q100 7 123 2L165 22C161 34 158 47 156 60Q155 69 151 77C148 106 148 151 151.5 194Q151 198 100 198Q49 198 48.5 194C52 151 52 106 49 77Q45 69 44 60C42 47 39 34 35 22Z',
  leftSleeve: 'M35 22L0 0V100H48L49 77Q45 69 44 60C42 47 39 34 35 22Z',
  rightSleeve: 'M165 22L200 0V100H152L151 77Q155 69 156 60C158 47 161 34 165 22Z',
  leftCuff: 'M12 74Q31 83 46.5 83L49 76Q48 86 45 86Q28 85 12 78Z',
  rightCuff: 'M188 74Q169 83 153.5 83L151 76Q152 86 155 86Q172 85 188 78Z',
  canvasTransform: 'translate(32 32) scale(2.24)',
});

export const BASE_COLLAR = 'M71 5L77 2C72 18 128 18 123 2L129 5C133 32 67 32 71 5Z';

export function newBaseLighting() {
  return `<g fill="#000000" fill-rule="evenodd" filter="url(#base-shadow-smoothing)">${NEW_BASE_SHADOWS.map(p=>`<path opacity="${p.opacity}" d="${p.d}"/>`).join('')}</g>`;
}
