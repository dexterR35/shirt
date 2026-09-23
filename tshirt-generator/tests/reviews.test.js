import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { validateReview, reviewKey, emptyReview } from "../src/lib/reviews.js";

const kit = { team_id: "team_x", team_name: "X", variant: "away", revision: "r002", png_layout_revision: "p001" };

test("a review belongs to one exact kit version", () => {
  assert.equal(reviewKey(kit), "team_x:away:r002:p001");
  assert.equal(reviewKey({ ...kit, png_layout_revision: undefined }), "team_x:away:r002:original");
  assert.equal(emptyReview(kit).status, "pending");
  assert.equal(emptyReview(kit).rating, null);
});

test("reviews are validated: 1-5 stars, known status, denial needs a note", () => {
  const base = emptyReview(kit);
  validateReview({ ...base, rating: 5, status: "approved" });
  assert.throws(() => validateReview({ ...base, rating: 6 }), /1–5/);
  assert.throws(() => validateReview({ ...base, rating: 2.5 }), /1–5/);
  assert.throws(() => validateReview({ ...base, status: "maybe" }), /status/);
  assert.throws(() => validateReview({ ...base, status: "denied", notes: "  " }), /needs to change/);
  validateReview({ ...base, status: "denied", notes: "Collar should be navy" });
});

test("the sample review JSON is valid, keyed correctly and marked as sample data", async () => {
  const { reviews } = JSON.parse(await fs.readFile("public/reviews/kit-reviews.json", "utf8"));
  const manifest = JSON.parse(await fs.readFile("public/catalog/manifest.json", "utf8"));
  for (const [key, review] of Object.entries(reviews)) {
    validateReview(review);
    assert.equal(key, `${review.team_id}:${review.variant}:${review.revision}:${review.layout_revision}`);
    assert.equal(review.sample, true);
    const slot = manifest.teams.find((t) => t.id === review.team_id).kits[review.variant];
    assert.equal(slot.revision, review.revision);
    assert.equal(slot.png_layout_revision, review.layout_revision);
  }
});

test("the team badge is derived from its two shirt reviews", async () => {
  const { teamReviewSummary } = await import("../src/lib/reviews.js");
  const team = {
    id: "team_t",
    kits: {
      home: { status: "ready", revision: "r001", png_layout_revision: "p001" },
      away: { status: "ready", revision: "r002" },
    },
  };
  const home = "team_t:home:r001:p001", away = "team_t:away:r002:original";
  const review = (status, rating, notes = "") => ({ ...emptyReview({ team_id: "team_t", variant: "home", revision: "r001" }), status, rating, notes });
  assert.equal(teamReviewSummary(team, {}), null);
  assert.equal(teamReviewSummary(team, { [home]: review("pending", null) }), null);
  assert.deepEqual(teamReviewSummary(team, { [home]: review("approved", 5) }), { status: "reviewing", rating: 5, label: "1 of 2 shirts approved" });
  assert.deepEqual(teamReviewSummary(team, { [home]: review("approved", 5), [away]: review("approved", 4) }), { status: "approved", rating: 4.5, label: "Home and Away approved" });
  assert.equal(teamReviewSummary(team, { [home]: review("approved", 5), [away]: review("denied", 2, "fix") }).status, "denied");
  // A review of an older version of the kit does not count.
  assert.equal(teamReviewSummary(team, { "team_t:home:r001:original": review("approved", 5) }), null);
  // Only one kit ready: the team cannot be fully approved yet.
  const half = { ...team, kits: { ...team.kits, away: { status: "researching" } } };
  assert.equal(teamReviewSummary(half, { [home]: review("approved", 5) }).status, "reviewing");
});
