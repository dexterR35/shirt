import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router";
import PngShirtPreview from "../PngShirtPreview.jsx";
import Icon from "../Icon.jsx";
import Modal from "../Modal.jsx";
import PartHighlight from "../PartHighlight.jsx";
import EquipmentCard from "../EquipmentCard.jsx";
import PageHeader from "../PageHeader.jsx";
import { teamReviewSummary } from "../lib/reviews.js";
import { ZOOM_MIN, ZOOM_MAX } from "../lib/use-zoom.js";

/** Team review badge in the list: ✓ both shirts approved, ! a shirt denied, plus average stars. */
function TeamBadge({ summary }) {
  if (!summary) return null;
  return (
    <span className={`team-badge ${summary.status}`} title={summary.label} aria-label={summary.label}>
      {summary.status === "approved" && <span className="team-badge-mark">✓</span>}
      {summary.status === "denied" && <span className="team-badge-mark">!</span>}
      {summary.rating !== null && <span>★ {summary.rating}</span>}
    </span>
  );
}

/**
 * Studio page (/studio, /studio/:teamId/:variant). The URL is the source of truth
 * for the shown kit; the layout (App) owns the state shared with other pages.
 */
export default function StudioPage() {
  const ctx = useOutletContext();
  const { teamId, variant: routeVariant } = useParams();
  useEffect(() => {
    ctx.openRoute(teamId, routeVariant);
  }, [teamId, routeVariant, ctx.catalog]); // eslint-disable-line react-hooks/exhaustive-deps
  const {
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
    deny,
    denyNote,
    denyOpen,
    draft,
    editBase,
    edited,
    editing,
    equipment,
    filtered,
    hoverOver,
    hoverPart,
    missing,
    openDeny,
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
    setCountry,
    setDenyNote,
    setDenyOpen,
    setDraft,
    setHoverPart,
    setQuery,
    setSelectedPart,
    slot,
    startEdit,
    updateReview,
    variant,
    zoom,
  } = ctx;
  const crumbs = [{ label: "Studio", to: "/studio" }];
  if (candidate)
    crumbs.push(
      { label: candidate.country_name },
      { label: candidate.name, to: `/studio/${candidate.id}/home` },
      { label: variant === "home" ? "Home" : "Away" },
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
          <div className="list-label">
            <span>{filtered.length} TEAMS</span>
            {(query || country) && (
              <button
                onClick={() => {
                  setQuery("");
                  setCountry("");
                }}
              >
                Reset filters
              </button>
            )}
          </div>
          <div className="team-list" aria-label="Teams">
            {filtered.map((t) => (
              <button
                key={t.id}
                className={`team-row ${candidateId === t.id ? "selected" : ""}`}
                onClick={() => ctx.select(t, "home")}
                aria-pressed={candidateId === t.id}
              >
                <span className="team-monogram">
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
                {Object.values(t.kits).some((k) => k.status === "ready") ? (
                  <span className="ready-dot" title="A kit is ready" />
                ) : null}
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
              <h3>{candidate?.name || "Choose a team"}</h3>
            </div>
            <div className="variant-switch" aria-label="Kit variant">
              {["home", "away"].map((v) => (
                <button
                  key={v}
                  aria-pressed={variant === v}
                  disabled={!candidate}
                  onClick={() => ctx.select(candidate, v)}
                  className={variant === v ? "active" : ""}
                >
                  {v === "home" ? "Home" : "Away"}
                  {candidate?.kits[v].status === "ready" && (
                    <span className="ready-dot" />
                  )}
                </button>
              ))}
            </div>
            <button
              className="secondary add-button"
              onClick={add}
              disabled={slot?.status !== "ready" || busy}
            >
              <Icon name="plus" size={14} />
              Add to collection
            </button>
          </div>
          <div className={`canvas ${background}`}>
            <div className="canvas-topline">
              <button
                className={`edit-toggle ${editing ? "active" : ""} ${edited && !editing ? "edited" : ""}`}
                aria-pressed={editing}
                title={edited ? "Colors edited · not the saved team kit" : "Edit colors"}
                onClick={editing ? cancelEdit : startEdit}
                disabled={busy}
              >
                <Icon name="edit" size={13} />
                Edit
              </button>
              <div
                className="background-controls"
                aria-label="Preview background"
              >
                {["grid", "light", "dark"].map((b) => (
                  <button
                    key={b}
                    className={`${b} ${background === b ? "active" : ""}`}
                    aria-label={`${b} background`}
                    aria-pressed={background === b}
                    onClick={() => setBackground(b)}
                  />
                ))}
              </div>
            </div>
            <div
              className={`shirt-stage ${editing ? "editing" : ""} ${editing && hoverPart ? "over-part" : ""}`}
              aria-busy={busy}
              {...(editing ? {onClick: pickPart, onPointerMove: hoverOver, onPointerLeave: () => setHoverPart(null)} : zoom.stageProps)}
            >
              <PngShirtPreview
                config={previewConfig}
                cache={!editing}
                style={{transform: `translate(${zoom.view.x}px, ${zoom.view.y}px) scale(${zoom.view.scale})`}}
                label={active ? `${active.team_name} ${active.variant} shirt` : "Original PNG shirt"}
              />
              {editing && <PartHighlight config={editBase} selected={selectedPart} hover={hoverPart} />}
            </div>
            <div className="canvas-caption">
              <span className="caption-kicker">
                {active
                  ? `${active.country_name} / ${active.kit_season}`
                  : missing
                    ? candidate.country_name
                    : "THE ORIGINAL SILHOUETTE"}
              </span>
              <h2>
                {active
                  ? active.team_name
                  : missing
                    ? candidate.name
                    : "A familiar shape. A fresh canvas."}
              </h2>
              <p>
                {active
                  ? active.variant === "home" ? "Home" : "Away"
                  : missing
                    ? `${variant === "home" ? "Home" : "Away"} kit not available yet`
                    : "Original highlights, fabric folds, and transparent edges."}
              </p>
              {!active && !missing && (
                <span className="neutral-note">
                  {edited ? "Custom design · not a verified team kit" : "Original PNG · no team colors applied"}
                </span>
              )}
            </div>
            <span className="dimension-label">8000 × 5000 SOURCE · PNG</span>
            {!editing && <div className="zoom-controls" aria-label="Zoom">
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
            <div className="review-approve">
              <label className={`approve-check ${review?.status === "approved" ? "approved" : ""}`}>
                <input
                  type="checkbox"
                  checked={review?.status === "approved"}
                  disabled={!review || review.status === "approved"}
                  onChange={() => updateReview({status: "approved"})}
                />
                {review?.status === "approved" ? `Approved${review.sample ? " (sample)" : ""}` : "Approve"}
              </label>
              <button
                className={`secondary deny-button ${review?.status === "denied" ? "denied" : ""}`}
                disabled={!review}
                onClick={openDeny}
              >
                {review?.status === "denied" ? "Denied" : "Deny"}
              </button>
            </div>
            <div className="pager">
              <button
                aria-label="Previous kit"
                disabled={selection.length < 2 || busy}
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
                {selectedIndex < 0 ? "—" : selectedIndex + 1}
                <span> / {selection.length || "—"}</span>
              </span>
              <button
                aria-label="Next kit"
                disabled={!selection.length || busy}
                onClick={() =>
                  activate(
                    selection[(selectedIndex + 1) % selection.length],
                  )
                }
              >
                <Icon name="right" size={17} />
              </button>
            </div>
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
          </div>
          {denyOpen && review && (
            <div className="deny-form">
              <label>
                What needs to change on this shirt?
                <textarea
                  value={denyNote}
                  maxLength={2000}
                  rows={3}
                  placeholder="e.g. shoulder stripes too thin, collar should be navy…"
                  onChange={(e) => setDenyNote(e.target.value)}
                  autoFocus
                />
              </label>
              <div className="deny-actions">
                <button className="secondary" onClick={() => setDenyOpen(false)}>Cancel</button>
                <button className="primary" disabled={!denyNote.trim()} onClick={deny}>Save denial</button>
              </div>
            </div>
          )}
          {!denyOpen && review?.status === "denied" && (
            <p className="deny-note">
              <strong>Needs changes{review.sample ? " (sample)" : ""}:</strong> {review.notes}
            </p>
          )}
          <div className="preview-notes">
            <span>
              <Icon name="check" size={14} />
              Original PNG texture
            </span>
            <span>
              <Icon name="check" size={14} />
              No emblems or sponsors
            </span>
            <span>
              <Icon name="check" size={14} />
              Transparent edges
            </span>
          </div>
        </section>
        <aside className="details-panel">
          <EquipmentCard active={active} equipment={equipment} custom={edited}/>
        </aside>
      </div>
    </>
  );
}
