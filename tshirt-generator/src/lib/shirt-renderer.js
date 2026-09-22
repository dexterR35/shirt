import { GEOMETRY } from "../../starter/shirt-svg/shirt-engine-reference.mjs";
import {
  SOURCE_SUPPORT,
  SOURCE_LIGHTING,
  SOURCE_SHA256,
} from "./generated/base-surface.js";

export const TEMPLATE_VERSION = "reference-front-2";
export const SURFACE_VERSION = "original-png-smooth-2";
const HEX = /^#[\da-f]{6}$/i;
const CLIPS = ["all", "body", "leftSleeve", "rightSleeve"];
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
const finite = (n, min, max, label) => {
  if (typeof n !== "number" || !Number.isFinite(n) || n < min || n > max)
    throw new Error(`Invalid ${label}`);
  return n;
};
const color = (value) => {
  if (typeof value !== "string" || !HEX.test(value))
    throw new Error("Expected a six-digit HEX color");
  return value.toUpperCase();
};
const strict = (value, allowed) => {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !allowed.includes(key))
  )
    throw new Error("Unsupported configuration fields");
};

export function validatePath(path) {
  if (
    typeof path !== "string" ||
    path.length > 20000 ||
    !/^[Mm]/.test(path) ||
    /[^MmLlHhVvCcSsQqTtAaZz\d.,\s+\-eE]/.test(path)
  )
    throw new Error("Invalid vector path");
  const tokens =
    path.match(
      /[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g,
    ) || [];
  const remainder = path
    .replace(
      /[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g,
      "",
    )
    .replace(/[\s,]/g, "");
  if (remainder) throw new Error("Malformed vector path");
  const arity = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
  let i = 0;
  while (i < tokens.length) {
    const command = tokens[i++].toLowerCase();
    if (!(command in arity)) throw new Error("Missing path command");
    const values = [];
    while (i < tokens.length && !/^[a-z]$/i.test(tokens[i]))
      values.push(finite(Number(tokens[i++]), -400, 400, "path coordinate"));
    if (
      arity[command] === 0
        ? values.length !== 0
        : values.length === 0 || values.length % arity[command] !== 0
    )
      throw new Error("Invalid path argument count");
    if (command === "a")
      for (let j = 0; j < values.length; j += 7)
        if (
          values[j] < 0 ||
          values[j + 1] < 0 ||
          ![0, 1].includes(values[j + 3]) ||
          ![0, 1].includes(values[j + 4])
        )
          throw new Error("Invalid arc");
  }
  return path;
}
function validateFill(fill) {
  if (typeof fill === "string") return color(fill);
  strict(fill, ["type", "x1", "y1", "x2", "y2", "stops"]);
  if (
    fill.type !== "linearGradient" ||
    !Array.isArray(fill.stops) ||
    fill.stops.length < 2 ||
    fill.stops.length > 20
  )
    throw new Error("Invalid gradient");
  for (const key of ["x1", "y1", "x2", "y2"]) finite(fill[key], -200, 400, key);
  let previous = -1;
  for (const stop of fill.stops) {
    strict(stop, ["offset", "color"]);
    finite(stop.offset, 0, 1, "gradient offset");
    color(stop.color);
    if (stop.offset < previous) throw new Error("Unsorted gradient");
    previous = stop.offset;
  }
  return fill;
}
function validateLayer(layer) {
  strict(layer, [
    "id",
    "type",
    "clip",
    "fill",
    "opacity",
    "x",
    "y",
    "width",
    "height",
    "rx",
    "points",
    "d",
  ]);
  if (
    !["rect", "polygon", "path"].includes(layer.type) ||
    !CLIPS.includes(layer.clip)
  )
    throw new Error("Invalid layer type or clip");
  if (layer.id !== undefined && !/^[\w-]{1,80}$/.test(layer.id))
    throw new Error("Invalid layer ID");
  validateFill(layer.fill);
  finite(layer.opacity ?? 1, 0, 1, "opacity");
  if (layer.type === "rect") {
    for (const key of ["x", "y"]) finite(layer[key], -200, 400, key);
    for (const key of ["width", "height"]) finite(layer[key], 0, 400, key);
    if (layer.rx !== undefined) finite(layer.rx, 0, 200, "radius");
  }
  if (layer.type === "polygon") {
    if (
      !Array.isArray(layer.points) ||
      layer.points.length < 3 ||
      layer.points.length > 500
    )
      throw new Error("Invalid polygon");
    for (const point of layer.points) {
      if (!Array.isArray(point) || point.length !== 2)
        throw new Error("Invalid point");
      point.forEach((n) => finite(n, -200, 400, "polygon coordinate"));
    }
  }
  if (layer.type === "path") validatePath(layer.d);
  return layer;
}
/** @typedef {{schemaVersion:2, templateVersion:string, coordinateSpace:string, colors:Object, collar:Object, layers:Array}} KitConfiguration */
/** Validate only data. No arbitrary markup, external URL or source text becomes SVG attributes. */
export function validateConfig(config) {
  strict(config, [
    "schemaVersion",
    "templateVersion",
    "coordinateSpace",
    "colors",
    "collar",
    "layers",
    "detailLayers",
  ]);
  if (
    config.schemaVersion !== 2 ||
    config.templateVersion !== TEMPLATE_VERSION ||
    config.coordinateSpace !== "reference-200"
  )
    throw new Error("Unsupported kit schema or coordinate space");
  strict(config.colors, [
    "body",
    "leftSleeve",
    "rightSleeve",
    "collar",
    "leftCuff",
    "rightCuff",
  ]);
  for (const key of [
    "body",
    "leftSleeve",
    "rightSleeve",
    "collar",
    "leftCuff",
    "rightCuff",
  ])
    color(config.colors[key]);
  strict(config.collar, ["shape", "layers"]);
  if (!["original", "round", "v", "custom"].includes(config.collar.shape))
    throw new Error("Invalid collar");
  if (
    config.collar.shape === "custom" &&
    (!config.collar.layers?.length || config.collar.layers.length > 20)
  )
    throw new Error("Custom collar requires layers");
  (config.collar.layers || []).forEach(validateLayer);
  if (!Array.isArray(config.layers) || config.layers.length > 512)
    throw new Error("Invalid layers");
  config.layers.forEach(validateLayer);
  if (config.detailLayers !== undefined) {
    if (!Array.isArray(config.detailLayers) || config.detailLayers.length > 100)
      throw new Error("Invalid detail layers");
    config.detailLayers.forEach(validateLayer);
  }
  return config;
}
export function neutralConfig(body = "#667C91") {
  return {
    schemaVersion: 2,
    templateVersion: TEMPLATE_VERSION,
    coordinateSpace: "reference-200",
    colors: {
      body,
      leftSleeve: body,
      rightSleeve: body,
      collar: body,
      leftCuff: body,
      rightCuff: body,
    },
    collar: { shape: "original" },
    layers: [],
  };
}
/** A single deterministic string is the saved revision, preview and download asset. */
export function renderShirt(config, title = "Original shirt master", surfaceVersion = SURFACE_VERSION) {
  if (!["original-png-vector-1", SURFACE_VERSION].includes(surfaceVersion)) {
    throw new Error("Unsupported surface revision");
  }
  const smooth = surfaceVersion === SURFACE_VERSION;
  const outline = smooth ? GEOMETRY.outline : SOURCE_SUPPORT;
  // Retain the original sampled lighting, but interpolate its pixel transitions.
  // The garment boundary is a continuous Bezier curve, never a pixel staircase.
  const lightFilter = smooth
    ? '<filter id="original-light-interpolation" filterUnits="userSpaceOnUse" x="0" y="0" width="200" height="200" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0.55"/></filter>'
    : "";
  const c = validateConfig(config),
    g = GEOMETRY,
    defs = [];
  const layer = (p, i) => {
    let fill = p.fill;
    if (typeof fill === "object") {
      const id = `paint-${i}`;
      defs.push(
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fill.x1}" y1="${fill.y1}" x2="${fill.x2}" y2="${fill.y2}">${fill.stops.map((s) => `<stop offset="${s.offset}" stop-color="${color(s.color)}"/>`).join("")}</linearGradient>`,
      );
      fill = `url(#${id})`;
    }
    const attrs = `fill="${fill}" opacity="${p.opacity ?? 1}"`;
    const element =
      p.type === "rect"
        ? `<rect x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" rx="${p.rx ?? 0}" ${attrs}/>`
        : p.type === "polygon"
          ? `<polygon points="${p.points.map((v) => v.join(",")).join(" ")}" ${attrs}/>`
          : `<path d="${p.d}" ${attrs}/>`;
    return `<g clip-path="url(#clip-${p.clip})">${element}</g>`;
  };
  const artwork = c.layers.map(layer).join("");
  const details = (c.detailLayers || [])
    .map((p, i) => layer(p, `detail-${i}`))
    .join("");
  const collar =
    c.collar.shape === "original"
      ? ""
      : c.collar.shape === "custom"
        ? c.collar.layers.map((p, i) => layer(p, `collar-${i}`)).join("")
        : c.collar.shape === "v"
          ? `<path d="M81.8 4.1L84.8 2.4Q100 4.2 115.2 2.4L118.2 4.1L115.7 12L100 32L84.3 12Z" fill="${c.colors.collar}"/><path d="M86 4Q100 6 114 4L112 11L100 26L88 11Z" fill="${c.colors.body}"/><path d="M86 4Q100 6 114 4L112 11L100 26L88 11Z" fill="#000000" opacity=".12"/>`
          : `<path d="M82 3Q100 1 118 3C118 28 82 28 82 3Z" fill="${c.colors.collar}"/><path d="M86 4Q100 6 114 4C114 22 86 22 86 4Z" fill="${c.colors.body}"/><path d="M86 4Q100 6 114 4C114 22 86 22 86 4Z" fill="#000000" opacity=".12"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none" role="img" aria-labelledby="title"><title id="title">${escape(title)}</title><metadata>${escape(JSON.stringify({ templateVersion: TEMPLATE_VERSION, surfaceVersion, sourceSHA256: SOURCE_SHA256 }))}</metadata><g transform="${g.canvasTransform}"><defs><mask id="garment-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200" style="mask-type:alpha"><path d="${outline}" fill="#FFFFFF"/></mask><clipPath id="clip-all"><path d="${outline}"/></clipPath>${[
    ["body", g.torso],
    ["leftSleeve", g.leftSleeve],
    ["rightSleeve", g.rightSleeve],
  ]
    .map(([id, d]) => `<clipPath id="clip-${id}"><path d="${d}"/></clipPath>`)
    .join(
      "",
    )}${defs.join("")}${lightFilter}</defs><g mask="url(#garment-mask)"><g><rect width="200" height="200" fill="${c.colors.body}"/><path d="${g.leftSleeve}" fill="${c.colors.leftSleeve}"/><path d="${g.rightSleeve}" fill="${c.colors.rightSleeve}"/>${artwork}<path d="${g.leftCuff}" fill="${c.colors.leftCuff}"/><path d="${g.rightCuff}" fill="${c.colors.rightCuff}"/>${collar}${details}</g><g fill="#FFFFFF" ${smooth ? 'filter="url(#original-light-interpolation)"' : 'shape-rendering="crispEdges"'}>${SOURCE_LIGHTING.map((p) => `<path opacity="${p.alpha / 255}" d="${p.d}"/>`).join("")}</g></g></g></svg>`;
}
