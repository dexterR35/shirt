import { validateConfig } from './shirt-renderer.js';
import { PNG_BASE } from './png-shirt.js';

/** Keep a reviewed PNG adaptation tied to its immutable source kit revision. */
export function validatePngLayout(layout, revision) {
  if (layout?.schemaVersion !== 1 || layout.status !== 'reviewed' ||
      layout.team_id !== revision.team_id || layout.variant !== revision.variant ||
      layout.source_revision !== revision.revision || !/^p\d{3}$/.test(layout.layout_revision) ||
      layout.surface_version !== PNG_BASE.version || layout.config?.templateVersion !== 'png-front-1' ||
      !layout.reviewed_at || !layout.review_scope || !layout.references?.length)
    throw Error('The PNG layout does not match this reviewed kit revision.');
  return validateConfig(layout.config);
}

/** Resolve the exact layout advertised by the catalog; never silently downgrade. */
export function kitPreviewConfig(details, item) {
  if (details.team_id !== item.team_id || details.variant !== item.variant || details.revision !== item.revision)
    throw Error('The saved configuration does not match this kit revision.');
  if (!item.png_layout_revision) return validateConfig(details.config);
  if (details.png_layout?.layout_revision !== item.png_layout_revision)
    throw Error('The saved PNG layout is missing or has changed. Reload the catalog.');
  return validatePngLayout(details.png_layout, details);
}
