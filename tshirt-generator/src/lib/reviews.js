/**
 * Kit reviews: 1–5 stars plus a one-time approval, or a denial with notes saying
 * what to fix. One record per exact kit version, so a corrected kit (new revision or
 * layout) needs a new review.
 *
 * Storage today: sample JSON (public/reviews/kit-reviews.json) overlaid with this
 * browser's own changes in localStorage. Later, replace loadReviews/saveReview with
 * Supabase calls; the record shape stays the same.
 */

const SEED_URL = "/reviews/kit-reviews.json";
const STORAGE_KEY = "tshirt-studio:reviews";
export const REVIEW_STATUSES = ["pending", "approved", "denied"];

/** @typedef {{team_id:string, team_name:string, variant:string, revision:string, layout_revision:string,
 *   status:"pending"|"approved"|"denied", rating:number|null, notes:string, reviewed_by:string,
 *   reviewed_at:string|null, sample?:boolean}} KitReview */

/** Key of the exact kit version shown: team, variant, revision and PNG layout. */
export const reviewKey = (item) =>
  `${item.team_id}:${item.variant}:${item.revision}:${item.png_layout_revision || "original"}`;

/** Runtime validation: reject anything that is not a well-formed review. */
export function validateReview(r) {
  if (!r || typeof r !== "object") throw Error("Invalid review.");
  if (!REVIEW_STATUSES.includes(r.status)) throw Error("Invalid review status.");
  if (r.rating !== null && !(Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5))
    throw Error("Rating must be 1–5 stars.");
  if (typeof r.notes !== "string" || r.notes.length > 2000) throw Error("Notes must be text up to 2000 characters.");
  if (r.status === "denied" && !r.notes.trim()) throw Error("Say what needs to change before denying a kit.");
  return r;
}

/** A blank review for a kit that nobody has reviewed yet. */
export function emptyReview(item) {
  return {
    team_id: item.team_id,
    team_name: item.team_name,
    variant: item.variant,
    revision: item.revision,
    layout_revision: item.png_layout_revision || "original",
    status: "pending",
    rating: null,
    notes: "",
    reviewed_by: "local",
    reviewed_at: null,
  };
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

/** All reviews by key: sample seed first, then this browser's saved changes. */
export async function loadReviews() {
  let seed = {};
  try {
    const r = await fetch(SEED_URL);
    if (r.ok) seed = (await r.json()).reviews || {};
  } catch {
    /* The seed is optional; the app works without it. */
  }
  const all = {};
  for (const [key, review] of Object.entries({ ...seed, ...readLocal() })) {
    try {
      all[key] = validateReview(review);
    } catch {
      /* Skip malformed records rather than breaking the studio. */
    }
  }
  return all;
}

/** Validate and save one review; returns the updated map. */
export function saveReview(all, key, review) {
  const saved = validateReview({ ...review, reviewed_at: new Date().toISOString(), sample: false });
  const next = { ...all, [key]: saved };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readLocal(), [key]: saved }));
  } catch {
    /* Private mode or blocked storage: keep the change for this session only. */
  }
  return next;
}

/**
 * A team's badge, derived from its current Home and Away shirt reviews (nothing extra
 * is stored). "approved" needs both shirts ready and approved; any denial wins.
 * @returns {{status:"approved"|"denied"|"reviewing", rating:number|null, label:string}|null}
 */
export function teamReviewSummary(team, reviews) {
  const shirts = ["home", "away"].map((variant) => {
    const slot = team.kits[variant];
    return slot?.status === "ready" ? reviews[reviewKey({ ...slot, team_id: team.id, variant })] || null : null;
  });
  const reviewed = shirts.filter((r) => r && (r.status !== "pending" || r.rating !== null));
  if (!reviewed.length) return null;
  const ratings = reviewed.map((r) => r.rating).filter((n) => n !== null);
  const rating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;
  if (reviewed.some((r) => r.status === "denied"))
    return { status: "denied", rating, label: "A shirt needs changes" };
  if (shirts.every((r) => r?.status === "approved"))
    return { status: "approved", rating, label: "Home and Away approved" };
  const approved = shirts.filter((r) => r?.status === "approved").length;
  return { status: "reviewing", rating, label: `${approved} of 2 shirts approved` };
}
