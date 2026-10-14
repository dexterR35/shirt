import design from '../../data/generic-jersey.json' with { type: 'json' };
import { validateConfig } from './shirt-renderer.js';

// The generic is its own document, never a fictional researched team/season.
if (design.schemaVersion !== 1 || design.id !== 'generic-netbet' || !/^r\d{3}$/.test(design.revision)
  || !Object.hasOwn(design.surfaces, design.defaultSurface)) throw Error('Invalid generic jersey document');
for (const surface of ['on-dark', 'on-light']) validateConfig(design.surfaces[surface].config);
export const GENERIC_REVISION = design.revision;
export const GENERIC_DEFAULT_SURFACE = design.defaultSurface;
export const GENERIC_SURFACES = Object.freeze(Object.fromEntries(Object.entries(design.surfaces)
  .map(([surface, value]) => [surface, Object.freeze({ label: value.label })])));

/** Return an independent, editable configuration without mutating the default.
 * @param {'on-dark'|'on-light'} [surface]
 */
export function genericJerseyConfig(surface = GENERIC_DEFAULT_SURFACE) {
  if (!Object.hasOwn(GENERIC_SURFACES, surface)) throw Error('Unknown generic jersey surface.');
  return validateConfig(structuredClone(design.surfaces[surface].config));
}

/** Snapshot for publishing the same editable default to the local catalog. */
export function genericJerseyDocument() {
  return structuredClone(design);
}

/** Export a saved customisation with explicit identity and revision. */
export function genericJerseyExport(surface, config, custom = false) {
  if (!Object.hasOwn(GENERIC_SURFACES, surface)) throw Error('Unknown generic jersey surface.');
  return { id: design.id, name: design.name, revision: GENERIC_REVISION, surface,
    custom, config: validateConfig(structuredClone(config)) };
}
