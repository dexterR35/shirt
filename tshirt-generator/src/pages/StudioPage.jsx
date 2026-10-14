import { lazy, Suspense } from "react";
import { useOutletContext } from "react-router";
import ThreeDControls from "../ThreeDControls.jsx";
import PngShirtPreview from "../PngShirtPreview.jsx";
import LightingControl from "../LightingControl.jsx";
import Icon from "../Icon.jsx";
import Modal from "../Modal.jsx";
import PartHighlight from "../PartHighlight.jsx";
import EquipmentCard from "../EquipmentCard.jsx";
import PageHeader from "../PageHeader.jsx";
import DownloadStats from "../DownloadStats.jsx";
import { teamReviewSummary, reviewStatus } from "../lib/reviews.js";
import { hasReadyKit, kitItem, variantLabel } from "../lib/catalog.js";
import { ZOOM_MIN, ZOOM_MAX } from "../lib/use-zoom.js";

// three.js, GSAP and the 3D mesh load only when the 3D view is switched on.
const Shirt3DView = lazy(() => import("../Shirt3DView.jsx"));

/** Relative luminance (0–1) of a #rrggbb color, to keep caption text readable. */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Team review badge in the list: the average stars of its rated Home and Away shirts; the status is in the tooltip. */
function TeamBadge({ summary }) {
  if (!summary) return null;
  return (
    <span className={`team-badge ${summary.status}`} title={summary.label} aria-label={summary.label}>
      <span className="team-badge-star">★</span>
      {summary.rating}
    </span>
  );
}

/** Studio page (/studio). The layout (App) owns the selected kit and all shared state. */
export default function StudioPage() {
  const ctx = useOutletContext();
  const {
    genericSurface, showGeneric,
    lighting,
    setLighting,
    exporting,
    activate,
    active,
    add,
    background,
    busy,
    cancelEdit,
    candidate,
    candidateId,
    catalog,
    country,
    draft,
    feedback,
    setFeedback,
    saveFeedback,
    editBase,
    edited,
    editing,
    equipment,
    filtered,
    hoverOver,
    hoverPart,
    missing,
    part,
    parts,
    pickPart,
    previewConfig,
    query,
    review,
    reviews,
    saveEdit,
    selectedIndex,
    selectedPart,
    selection,
    setBackground,
    customBg,
    setCustomBg,
    setCountry,
    setDraft,
    setHoverPart,
    setQuery,
    setSelectedPart,
    slot,
    startEdit,
    updateReview,
    variant,
    zoom,
    view3d,
    setView3d,
    pose3d,
    setPose3d,
    poseLocked,
    setPoseLocked,
  } = ctx;
  // Paging moves between collection kits; it does nothing when the only kit is already shown.
  const canPage = selection.length > 1 || (selection.length === 1 && selectedIndex < 0);
  const status = reviewStatus(review);
  const crumbs = [{ label: "Studio", to: "/studio" }];
  if (candidate)
    crumbs.push(
      { label: candidate.country_name },
      { label: candidate.name },
      { label: variantLabel(variant) },
    );
  return (
    <>
      <PageHeader crumbs={crumbs} title="Your team. Its true colors." counts={catalog.counts} />
      <div className="workspace">
        <aside className="sidebar">
          <div className="section-title">
            <h2>Find your team</h2>
          </div>
          <label className="field-label" htmlFor="country">
            Country / association
          </label>
          <div className="select-wrap">
            <Icon name="globe" size={17} />
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">All countries</option>
              {catalog.countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.team_count})
                </option>
              ))}
            </select>
          </div>
          <label className="field-label" htmlFor="search">
            Team
          </label>
          <div className="search-wrap">
            <Icon name="search" size={18} />
            <input
              id="search"
              type="search"
              placeholder="Search for a team…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="team-list" aria-label="Teams">
            <button className={`team-row ${genericSurface ? "selected" : ""}`} onClick={() => showGeneric()} aria-pressed={!!genericSurface}>
              <span className="ready-dot" aria-hidden="true" />
              <span className="team-monogram"><Icon name="shirt" size={18} /></span>
              <span className="team-info"><strong>Default shirt</strong><small>Your design</small></span>
              <Icon name={genericSurface ? "check" : "right"} size={16} />
            </button>
            {filtered.map((t) => (
              <button
                key={t.id}
                className={`team-row ${candidateId === t.id ? "selected" : ""}`}
                onClick={() => ctx.select(t, "home")}
                aria-pressed={candidateId === t.id}
              >
                {hasReadyKit(t) ? (
                  <span className="ready-dot" title="A kit is ready" />
                ) : (
                  <span className="ready-dot off" aria-hidden="true" />
                )}
                <span
                  className={`team-monogram ${t.avatar ? "kit-colors" : ""}`}
                  style={t.avatar && {
                    background: t.avatar.body,
                    color: luminance(t.avatar.body) > 0.55 ? "var(--on-light)" : "var(--text)",
                  }}
                  title={t.avatar && `${variantLabel(t.avatar.variant)} kit colors`}
                >
                  {t.name
                    .replace(/^FC |^AS |^AC /, "")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span className="team-info">
                  <strong>{t.name}</strong>
                  <small>
                    {t.country_name}
                    {t.reserve ? " · Reserves" : ""}
                  </small>
                </span>
                <TeamBadge summary={teamReviewSummary(t, reviews)} />
                {candidateId === t.id ? (
                  <Icon name="check" size={16} />
                ) : (
                  <Icon name="right" size={14} />
                )}
              </button>
            ))}
            {!filtered.length && (
              <div className="empty-results">
                <Icon name="search" size={24} />
                <p>No teams found</p>
                <small>Try another name or country.</small>
              </div>
            )}
          </div>
        </aside>
        <section className="preview-panel" aria-label="Shirt preview">
          <div className="preview-toolbar">
            <div className="candidate-heading">
              <small className="eyebrow">SELECTED TEAM</small>
              <h3>{candidate?.name || "Default shirt"}</h3>
            </div>
            <div className="preview-selection-actions">
            {candidate && <button className="secondary" onClick={() => showGeneric()} aria-label="Clear team" title="Return to the default shirt"><Icon name="close" size={14} /></button>}
            <div className="variant-switch" aria-label="Kit variant">
              {["home", "away"].map((v) => (
                <button
                  key={v}
                  aria-pressed={variant === v}
                  disabled={!candidate}
                  onClick={() => ctx.select(candidate, v)}
                  className={variant === v ? "active" : ""}
                >
                  {variantLabel(v)}
                </button>
              ))}
            </div>
            <button
              className="secondary add-button"
              onClick={add}
              disabled={busy || editing || (!genericSurface && slot?.status !== "ready")}
            >
              <Icon name="plus" size={14} />
              Add to collection
            </button>
            </div>
          </div>
          <div
            className={`canvas ${background} ${background === "white" || (background === "custom" && luminance(customBg) > 0.55) ? "on-light" : ""}`}
            style={background === "custom" ? { backgroundColor: customBg } : undefined}
          >
            <div className="canvas-topline">
              <div className="canvas-tools">
                <button
                  className={`edit-toggle ${editing ? "active" : ""} ${edited && !editing ? "edited" : ""}`}
                  aria-pressed={editing}
                  title={edited ? "Colors edited · not the saved team kit" : "Edit colors"}
                  onClick={editing ? cancelEdit : startEdit}
                >
                  <Icon name="edit" size={13} />
                  Edit
                </button>
                <button
                  className={`edit-toggle view3d-toggle ${view3d ? "active" : ""}`}
                  aria-pressed={view3d}
                  disabled={!!exporting}
                  title={view3d ? "Back to the flat PNG view" : "3D view: orbit the shirt, lock an angle and download it"}
                  onClick={() => setView3d(!view3d)}
                >
                  <Icon name="cube" size={13} />
                  3D
                </button>

              </div>
              <div className="background-controls" role="group" aria-label="Preview background">
                <button
                  className={`transparent ${background === "transparent" ? "active" : ""}`}
                  aria-label="Transparent background"
                  title="Transparent"
                  aria-pressed={background === "transparent"}
                  onClick={() => setBackground("transparent")}
                />
                <button
                  className={`white ${background === "white" ? "active" : ""}`}
                  aria-label="White background"
                  title="White"
                  aria-pressed={background === "white"}
                  onClick={() => setBackground("white")}
                />
                <label
                  className={`custom ${background === "custom" ? "active" : ""}`}
                  title="Custom color"
                  style={{ background: customBg }}
                >
                  <input
                    type="color"
                    aria-label="Custom background color"
                    value={customBg}
                    onClick={() => setBackground("custom")}
                    onChange={(e) => {
                      setCustomBg(e.target.value);
                      setBackground("custom");
                    }}
                  />
                </label>
              </div>
            </div>
            {view3d ? (
              <div className="shirt-stage three-d" aria-busy={busy}>
                <Suspense fallback={<span className="no-preview">Loading 3D…</span>}>
                  <Shirt3DView
                    config={previewConfig}
                    lighting={lighting}
                    pose={pose3d}
                    onPose={setPose3d}
                    locked={poseLocked}
                    disabled={!!exporting}
                    label={genericSurface ? `Generic jersey ${genericSurface}` : active ? `${active.team_name} ${active.variant} shirt` : "Plain shirt"}
                  />
                </Suspense>
                {missing && <span className="no-preview">No preview</span>}
              </div>
            ) : (
              <div
                className={`shirt-stage ${editing ? "editing" : ""} ${editing && hoverPart ? "over-part" : ""}`}
                aria-busy={busy}
                {...(editing ? {onClick: pickPart, onPointerMove: hoverOver, onPointerLeave: () => setHoverPart(null)} : zoom.stageProps)}
              >
                <PngShirtPreview
                  config={previewConfig}
                  cache={!editing}
                  style={{transform: `translate(${zoom.view.x}px, ${zoom.view.y}px) scale(${zoom.view.scale})`}}
                  label={genericSurface ? `Generic jersey ${genericSurface}` : active ? `${active.team_name} ${active.variant} shirt` : "Original PNG shirt"}
                />
                {editing && <PartHighlight config={editBase} selected={selectedPart} hover={hoverPart} />}
                {missing && <span className="no-preview">No preview</span>}
              </div>
            )}
            <div className="canvas-caption">
              <span className="caption-kicker">
                {active
                  ? `${active.country_name} / ${active.kit_season}`
                  : missing
                    ? candidate.country_name
                    : genericSurface ? "GENERIC / NEUTRAL" : "THE ORIGINAL SILHOUETTE"}
              </span>
              <h2>
                {active
                  ? active.team_name
                  : missing
                    ? candidate.name
                    : genericSurface ? "Ready for every team." : "A familiar shape. A fresh canvas."}
              </h2>
              <p>
                {active
                  ? variantLabel(active.variant)
                  : missing
                    ? `${variantLabel(variant)} kit not available yet`
                    : genericSurface ? "Shoulder-to-hem N, green and dark green, original fabric detail." : "Original highlights, fabric folds, and transparent edges."}
              </p>
              {!active && !missing && (
                <span className="neutral-note">
                  {edited ? "Custom design · not a verified team kit" : genericSurface ? "Generic fallback design · no team affiliation" : view3d ? "3D shirt · no team colors applied" : "Original PNG · no team colors applied"}
                </span>
              )}
              {view3d && active && (
                <span className="neutral-note">3D preview · back and sides continue the front design</span>
              )}
            </div>
            <LightingControl value={lighting} onChange={setLighting} disabled={!!exporting} />
            {view3d && (
              <ThreeDControls
                pose={pose3d}
                onPose={setPose3d}
                locked={poseLocked}
                onLock={setPoseLocked}
                disabled={!!exporting}
              />
            )}
            <span className="dimension-label">
              {view3d ? `3D · ${Math.round(pose3d.azimuth)}° · ${Math.round(pose3d.elevation)}°${poseLocked ? " · LOCKED" : ""}` : "8000 × 5000 SOURCE · PNG"}
            </span>
            {!editing && !view3d && <div className="zoom-controls" aria-label="Zoom">
              <button aria-label="Zoom out" onClick={zoom.zoomOut} disabled={zoom.view.scale <= ZOOM_MIN}>
                <Icon name="minus" size={14} />
              </button>
              <span aria-live="polite">{Math.round(zoom.view.scale * 100)}%</span>
              <button aria-label="Zoom in" onClick={zoom.zoomIn} disabled={zoom.view.scale >= ZOOM_MAX}>
                <Icon name="plus" size={14} />
              </button>
              <button aria-label="Center shirt" onClick={zoom.center} disabled={zoom.view.scale === 1 && !zoom.view.x && !zoom.view.y}>
                <Icon name="fit" size={14} />
              </button>
            </div>}
          </div>
          {editing && (
            <Modal
              title="Edit colors"
              className="edit-modal"
              onClose={cancelEdit}
              footer={<>
                <button className="secondary" onClick={() => setDraft({})} disabled={!Object.keys(draft).length}>Reset all</button>
                <button className="secondary" onClick={cancelEdit}>Cancel</button>
                <button className="primary" onClick={saveEdit}>Save</button>
              </>}
            >
              <p className="edit-hint">Click a part on the shirt, or choose it below.</p>
              <div className="part-list">
                {parts.map((p) => (
                  <button
                    key={p.id}
                    className={`part-option ${selectedPart === p.id ? "selected" : ""}`}
                    aria-pressed={selectedPart === p.id}
                    onClick={() => setSelectedPart(p.id)}
                    onMouseEnter={() => setHoverPart(p.id)}
                    onMouseLeave={() => setHoverPart(null)}
                  >
                    <span className="swatch" style={{background: draft[p.id] || p.color}} />
                    {p.label}
                    {draft[p.id] && <span className="changed-dot" aria-label="changed" />}
                  </button>
                ))}
              </div>
              {part && (
                <div className="part-color">
                  <label>
                    {part.label} color
                    <input
                      type="color"
                      aria-label={`${part.label} color`}
                      value={(draft[part.id] || part.color).toLowerCase()}
                      onChange={(e) => setDraft({...draft, [part.id]: e.target.value.toUpperCase()})}
                    />
                  </label>
                  <span className="hex">{draft[part.id] || part.color}</span>
                  <button
                    className="secondary"
                    disabled={!draft[part.id]}
                    onClick={() => { const next = {...draft}; delete next[part.id]; setDraft(next); }}
                  >
                    Reset part
                  </button>
                </div>
              )}
            </Modal>
          )}
          <div className="preview-actions">
            <div className="review-rating">
              <div className="stars" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    role="radio"
                    aria-checked={review?.rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    className={n <= (review?.rating || 0) ? "on" : ""}
                    disabled={!review}
                    onClick={() => updateReview({rating: n})}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className={`review-status ${status}`} aria-live="polite">
                {!review
                  ? ""
                  : status === "perfect"
                    ? `✓ Perfect${review.sample ? " (sample)" : ""}`
                    : status === "needs-changes"
                      ? `Needs changes${review.sample ? " (sample)" : ""}`
                      : "Not rated yet"}
              </div>
            </div>
            <div className="pager">
              <button
                aria-label="Previous kit"
                disabled={!canPage}
                onClick={() =>
                  activate(
                    selection[
                      selectedIndex < 0
                        ? selection.length - 1
                        : (selectedIndex - 1 + selection.length) %
                          selection.length
                    ],
                  )
                }
              >
                <Icon name="left" size={17} />
              </button>
              <span>
                {selectedIndex < 0 ? "-" : selectedIndex + 1}
                <span> / {selection.length || "-"}</span>
              </span>
              <button
                aria-label="Next kit"
                disabled={!canPage}
                onClick={() =>
                  activate(
                    selection[(selectedIndex + 1) % selection.length],
                  )
                }
              >
                <Icon name="right" size={17} />
              </button>
            </div>
            <div className="preview-stats">
              {slot?.status === "ready" && <DownloadStats item={kitItem(candidate, variant)} />}
            </div>
          </div>
          {status === "needs-changes" && (
            <div className="feedback-form">
              <label>
                What needs to change on this shirt?
                <textarea
                  value={feedback}
                  maxLength={2000}
                  rows={3}
                  placeholder="e.g. shoulder stripes too thin, collar should be navy…"
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </label>
              <div className="feedback-actions">
                <span>{feedback.trim() === (review.notes || "") ? (review.notes ? "Feedback saved" : "") : "Not saved yet"}</span>
                <button className="primary" disabled={feedback.trim() === (review.notes || "")} onClick={saveFeedback}>
                  Save feedback
                </button>
              </div>
            </div>
          )}
        </section>
        <aside className="details-panel">
          {genericSurface ? <section className="source-card equipment-card" aria-label="Generic jersey details">
            <small className="eyebrow">GENERIC DESIGN</small>
            <h3>NetBet default jersey</h3>
            <p>An oversized N from shoulder to hem in green and dark green, made for teams without a mapped shirt.</p>
            <p>Use Edit to change the body, N, sleeves, collar and cuffs. Download design JSON to save your configuration.</p>
            <p>No club emblem, sponsor or national flag.</p>
            <p>Downloads have transparent backgrounds.</p>
          </section> : <EquipmentCard active={active} equipment={equipment} custom={edited}/>}
        </aside>
      </div>
    </>
  );
}
