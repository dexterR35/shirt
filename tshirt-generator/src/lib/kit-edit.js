/** Parts of a kit the editor can recolor, and how saved edits are applied. */

export const PART_LABELS = Object.freeze({
  body: "Body",
  leftSleeve: "Left sleeve",
  rightSleeve: "Right sleeve",
  collar: "Collar",
  leftCuff: "Left cuff",
  rightCuff: "Right cuff",
});
const ROLES = Object.keys(PART_LABELS);
const HEX = /^#[\da-f]{6}$/i;

function paintLayers(config) {
  return [
    ...config.layers,
    ...(config.detailLayers || []),
    ...(config.collar?.shape === "custom" ? config.collar.layers || [] : []),
  ];
}

/**
 * The six named parts plus one part per distinct solid stripe/detail color.
 * Part ids are stable for a kit: `role:<name>` or `fill:<original HEX>`.
 * Gradient fills are not editable.
 * @returns {{id:string,label:string,color:string}[]}
 */
export function editableParts(config) {
  const parts = ROLES.map((role) => ({ id: `role:${role}`, label: PART_LABELS[role], color: config.colors[role].toUpperCase() }));
  const seen = new Set();
  for (const layer of paintLayers(config)) {
    if (layer.colorRole || typeof layer.fill !== "string" || !HEX.test(layer.fill)) continue;
    const color = layer.fill.toUpperCase();
    if (seen.has(color)) continue;
    seen.add(color);
    parts.push({ id: `fill:${color}`, label: `Stripes & details ${seen.size}`, color });
  }
  return parts;
}

/**
 * Recolor a kit. `edits` maps part ids (from the original config) to new HEX colors.
 * @param {object} config
 * @param {Object<string,string>} edits
 */
export function applyEdits(config, edits) {
  if (!edits || !Object.keys(edits).length) return config;
  for (const value of Object.values(edits)) if (!HEX.test(value)) throw Error("Expected a six-digit HEX color");
  const recolor = (layer) => {
    if (layer.colorRole || typeof layer.fill !== "string") return layer;
    const next = edits[`fill:${layer.fill.toUpperCase()}`];
    return next ? { ...layer, fill: next } : layer;
  };
  const colors = { ...config.colors };
  for (const role of ROLES) if (edits[`role:${role}`]) colors[role] = edits[`role:${role}`];
  return {
    ...config,
    colors,
    layers: config.layers.map(recolor),
    ...(config.detailLayers ? { detailLayers: config.detailLayers.map(recolor) } : {}),
    ...(config.collar?.layers ? { collar: { ...config.collar, layers: config.collar.layers.map(recolor) } } : {}),
  };
}

// Widely spaced flat colors, so anti-aliased edges never read as another part.
const idRgb = (i) => [20 + (i % 6) * 40, 20 + (Math.floor(i / 6) % 6) * 40, 20 + Math.floor(i / 36) * 40];
const toHex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

/** The same kit with every editable part painted a unique ID color, for click hit-testing. */
export function partIdConfig(config) {
  const parts = editableParts(config);
  return {
    config: applyEdits(config, Object.fromEntries(parts.map((p, i) => [p.id, toHex(idRgb(i))]))),
    ids: parts.map((p, i) => ({ id: p.id, rgb: idRgb(i) })),
  };
}

/** Match a sampled pixel to a part id, or null (gradients, edges, background). */
export function matchPartId(ids, [r, g, b]) {
  for (const { id, rgb } of ids)
    if (Math.abs(rgb[0] - r) <= 12 && Math.abs(rgb[1] - g) <= 12 && Math.abs(rgb[2] - b) <= 12) return id;
  return null;
}

/** Count pixels per part id in an ID render (RGB or RGBA). */
export function countPartPixels(ids, pixels, channels = 4) {
  const counts = new Map();
  for (let i = 0; i < pixels.length; i += channels) {
    const id = matchPartId(ids, [pixels[i], pixels[i + 1], pixels[i + 2]]);
    if (id) counts.set(id, (counts.get(id) || 0) + 1);
  }
  return counts;
}

/** The kit with only its named parts painted, to measure each part's full area. */
export const namedPartsOnly = (config) => ({ ...config, layers: [], detailLayers: [] });

/**
 * Which parts to offer in the editor. A named part is hidden when less than 5% of it
 * shows (e.g. sleeves fully under a sleeve panel); stripes and details only when
 * nothing of them shows, so thin pinstripes are never hidden.
 */
export function visibleParts(fullCounts, namedCounts) {
  const visible = new Set();
  for (const [id, n] of fullCounts)
    if (id === "role:body" || !id.startsWith("role:") || n >= 0.05 * (namedCounts.get(id) || 0)) visible.add(id);
  visible.add("role:body");
  return visible;
}
