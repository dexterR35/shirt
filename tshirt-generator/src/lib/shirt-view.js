/** Presentation views; both use the original front PNG and saved kit revision. */
export const SHIRT_VIEW_IDS = ['front', 'three-quarter'];
export function validateShirtView(view) {
  if (!SHIRT_VIEW_IDS.includes(view)) throw Error('Choose Front or Angled view.');
  return view;
}
export const shirtViewLabel = view => validateShirtView(view) === 'front' ? 'Front' : 'Angled';
export const viewFilenameSuffix = view => validateShirtView(view) === 'front' ? '' : '-angled';
