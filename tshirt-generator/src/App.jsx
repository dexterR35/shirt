import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import Icon from "./Icon.jsx";
import {loadReviews, saveReview, reviewKey, emptyReview, reviewStatus} from "./lib/reviews.js";
import {editableParts, applyEdits} from "./lib/kit-edit.js";
import {partAt, visiblePartIds} from "./lib/png-preview.js";
import {useZoom} from "./lib/use-zoom.js";
import {neutralConfig} from "./lib/shirt-renderer.js";
import {loadKit} from "./lib/kit-config.js";
import {
  filterTeams,
  addToSelection,
  revisionKey,
  downloadBlob,
} from "./lib/catalog.js";
import {EXPORT_SIZES, renderPng, exportFilename, zipFiles} from "./lib/export.js";

const VIEW_KEY = "tshirt-studio:view";
/** Remember the shown team/variant for this browser tab, so a refresh reopens it. */
function readView() {
  try { return JSON.parse(sessionStorage.getItem(VIEW_KEY)); } catch { return null; }
}
function saveView(view) {
  try { sessionStorage.setItem(VIEW_KEY, JSON.stringify(view)); } catch { /* optional */ }
}
const RAIL_KEY = "tshirt-studio:rail-collapsed";
function readRailCollapsed() {
  try { return localStorage.getItem(RAIL_KEY) === "1"; } catch { return false; }
}
function kitItem(team, variant) {
  return {
    ...team.kits[variant],
    team_id: team.id,
    team_name: team.name,
    country_name: team.country_name,
    variant,
  };
}
const json = async (url, signal) => {
  const r = await fetch(url, {signal});
  if (!r.ok) throw Error(`Could not load the local catalog (${r.status}).`);
  return r.json();
};
export default function App() {
  const [catalog, setCatalog] = useState(null),
    [loadError, setLoadError] = useState(""),
    [country, setCountry] = useState(""),
    [query, setQuery] = useState(""),
    [candidateId, setCandidateId] = useState(""),
    [variant, setVariant] = useState("home"),
    [active, setActive] = useState(null),
    [appliedConfig, setAppliedConfig] = useState(null),
    [equipment, setEquipment] = useState(null),
    [editing, setEditing] = useState(false),
    [draft, setDraft] = useState({}),
    [selectedPart, setSelectedPart] = useState(""),
    [visibleIds, setVisibleIds] = useState(null),
    [hoverPart, setHoverPart] = useState(null),
    [reviews, setReviews] = useState({}),
    [feedback, setFeedback] = useState(""),
    [queueOpen, setQueueOpen] = useState(false),
    [exportSize, setExportSize] = useState(2048),
    [exporting, setExporting] = useState(""),
    [, setSavedVersion] = useState(0),
    [selection, setSelection] = useState([]),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [background, setBackground] = useState("transparent"),
    [customBg, setCustomBg] = useState("#1f3b57"),
    [railCollapsed, setRailCollapsed] = useState(readRailCollapsed);
  const location = useLocation(),
    navigate = useNavigate(),
    section = location.pathname.startsWith("/catalog") ? "catalog" : "studio";
  const request = useRef(0),
    controller = useRef(null),
    // Saved color edits per kit: kept in memory until the page is refreshed.
    savedEdits = useRef(new Map());
  const zoom = useZoom();
  // Messages close by themselves after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    loadReviews().then(setReviews, () => {});
  }, []);
  useEffect(() => {
    let alive = true;
    json("/catalog/manifest.json")
      .then((data) => {
        if (alive) {
          setCatalog(data);
          // Reopen the kit this tab was showing before a refresh.
          const view = readView(),
            team = data.teams.find((t) => t.id === view?.team_id);
          if (team && ["home", "away"].includes(view.variant)) show(team, view.variant);
        }
      })
      .catch((e) => alive && setLoadError(e.message));
    return () => {
      alive = false;
      controller.current?.abort();
    };
  }, []);
  const filtered = useMemo(
    () =>
      filterTeams(catalog?.teams || [], country, query).sort(
        (a, b) =>
          Number(!!b.mandatory) - Number(!!a.mandatory) ||
          Number(Object.values(b.kits).some((k) => k.status === "ready")) -
          Number(Object.values(a.kits).some((k) => k.status === "ready")) ||
          (a.priority_order ?? 9999) - (b.priority_order ?? 9999),
      ),
    [catalog, country, query],
  );
  const candidate = catalog?.teams.find((t) => t.id === candidateId),
    slot = candidate?.kits[variant];
  const editKey = active ? `${revisionKey(active)}:${active.png_layout_revision || "original"}` : "base",
    editBase = useMemo(() => appliedConfig || neutralConfig(), [appliedConfig]),
    allParts = useMemo(() => editableParts(editBase), [editBase]),
    // Hide parts that are fully covered by other paint, e.g. sleeves under a sleeve panel.
    parts = visibleIds ? allParts.filter((p) => visibleIds.has(p.id) || p.id === selectedPart) : allParts,
    edits = editing ? draft : savedEdits.current.get(editKey) || {},
    edited = Object.keys(edits).length > 0;
  const previewConfig = useMemo(() => edited ? applyEdits(editBase, edits) : appliedConfig,
    [appliedConfig, editBase, edited, JSON.stringify(edits)]);
  const part = parts.find((p) => p.id === selectedPart);
  const review = active ? reviews[reviewKey(active)] || emptyReview(active) : null;
  function updateReview(change) {
    try {
      setReviews((all) => saveReview(all, reviewKey(active), {...review, ...change}));
      return true;
    } catch (e) {
      setNotice(e.message);
      return false;
    }
  }
  // The feedback box always starts from the saved notes of the shirt on screen.
  const savedNotes = review?.notes ?? "";
  useEffect(() => {
    setFeedback(savedNotes);
  }, [active && reviewKey(active), savedNotes]); // eslint-disable-line react-hooks/exhaustive-deps
  function saveFeedback() {
    updateReview({notes: feedback.trim()});
  }
  const missing = !active && candidate && slot?.status !== "ready";
  const selectedIndex = active
    ? selection.findIndex((s) => revisionKey(s) === revisionKey(active))
    : -1;
  /** Selecting a team or variant shows it at once; a missing kit shows the plain base. */
  function show(team, v) {
    setCandidateId(team.id);
    setVariant(v);
    setNotice("");
    saveView({team_id: team.id, variant: v});
    if (team.kits[v].status === "ready") void activate(kitItem(team, v), {syncUrl: false});
    else master();
  }
  async function activate(item, {syncUrl = true} = {}) {
    const sequence = ++request.current;
    setCandidateId(item.team_id);
    setVariant(item.variant);
    // A kit opened from the collection while on another page switches to the Studio.
    if (syncUrl && !window.location.pathname.startsWith("/studio")) navigate("/studio");
    saveView({team_id: item.team_id, variant: item.variant});
    controller.current?.abort();
    controller.current = new AbortController();
    setBusy(true);
    setNotice("");
    try {
      const saved = await loadKit(item, controller.current.signal);
      if (request.current === sequence) {
        setActive(item);
        setAppliedConfig(saved.config);
        setEquipment(saved.equipment);
        setEditing(false);
      }
    } catch (e) {
      if (e.name !== "AbortError" && request.current === sequence)
        setNotice(e.message);
    } finally {
      if (request.current === sequence) setBusy(false);
    }
  }
  function add() {
    if (!candidate || slot?.status !== "ready") return;
    const item = kitItem(candidate, variant);
    try {
      setSelection(addToSelection(selection, item));
      setQueueOpen(true);
      setNotice(candidate.name + " " + variant + " added to your collection.");
    } catch (e) {
      setNotice(e.message);
    }
  }
  /** Add several catalog shirts at once; never silently drops any past the limit. */
  function addMany(items) {
    const fresh = items.filter((item) => !selection.some((s) => revisionKey(s) === revisionKey(item)));
    try {
      let next = selection;
      for (const item of fresh) next = addToSelection(next, item);
      setSelection(next);
      if (fresh.length) setQueueOpen(true);
      const skipped = items.length - fresh.length;
      setNotice(`${fresh.length} shirt${fresh.length === 1 ? "" : "s"} added to your collection${skipped ? ` · ${skipped} already there` : ""}.`);
    } catch (e) {
      setNotice(e.message);
    }
  }
  /** The config a queued kit downloads with: its saved layout plus any saved color edits. */
  async function exportConfig(item) {
    const saved = await loadKit(item);
    const edits = savedEdits.current.get(`${revisionKey(item)}:${item.png_layout_revision || "original"}`);
    return {config: edits ? applyEdits(saved.config, edits) : saved.config, custom: !!edits};
  }
  /** Render every queued kit at the chosen size; download them one by one or as one ZIP. */
  async function downloadQueue(asZip) {
    if (!selection.length || exporting) return;
    const files = [];
    try {
      for (const [i, item] of selection.entries()) {
        setExporting(`Preparing ${i + 1} / ${selection.length}…`);
        const {config, custom} = await exportConfig(item);
        files.push({name: exportFilename(item, exportSize, custom), blob: await renderPng(config, exportSize)});
      }
      if (asZip) {
        setExporting("Zipping…");
        downloadBlob(await zipFiles(files), `tshirt-kits-${files.length}-${exportSize}px.zip`);
      } else {
        // Space the downloads out so the browser accepts each file.
        for (const f of files) {
          downloadBlob(f.blob, f.name);
          await new Promise((r) => setTimeout(r, 250));
        }
      }
      setNotice(`${files.length} kit${files.length > 1 ? "s" : ""} downloaded at ${exportSize} px.`);
    } catch (e) {
      setNotice(e.message || "The download could not be prepared.");
    } finally {
      setExporting("");
    }
  }
  function remove(index) {
    const next = selection.filter((_, i) => i !== index);
    setSelection(next);
    if (index === selectedIndex && next.length)
      void activate(next[Math.min(index, next.length - 1)]);
  }
  /** A click in the Studio (team row or Home/Away). */
  function select(team, v) {
    show(team, v);
  }
  function toggleRail() {
    setRailCollapsed((c) => {
      try { localStorage.setItem(RAIL_KEY, c ? "0" : "1"); } catch { /* optional */ }
      return !c;
    });
  }
  function master() {
    request.current++;
    controller.current?.abort();
    setActive(null);
    setAppliedConfig(null);
    setEquipment(null);
    setEditing(false);
    setBusy(false);
  }
  function startEdit() {
    if (busy) return;
    zoom.center();
    setDraft({...(savedEdits.current.get(editKey) || {})});
    setSelectedPart(allParts[0]?.id || "");
    setVisibleIds(null);
    setHoverPart(null);
    setEditing(true);
    visiblePartIds(editBase).then(setVisibleIds, () => setVisibleIds(null));
  }
  const cancelEdit = useCallback(() => setEditing(false), []);
  function saveEdit() {
    if (Object.keys(draft).length) savedEdits.current.set(editKey, draft);
    else savedEdits.current.delete(editKey);
    setSavedVersion((n) => n + 1);
    setEditing(false);
  }
  /** The editable part painted under the pointer, or null (outside the shirt). */
  async function partUnderPointer(e) {
    const el = e.currentTarget.querySelector(".shirt-image");
    if (!el?.width) return null;
    const r = el.getBoundingClientRect(), fit = Math.min(r.width, r.height) / el.width,
      px = (e.clientX - r.left - (r.width - el.width * fit) / 2) / fit,
      py = (e.clientY - r.top - (r.height - el.height * fit) / 2) / fit;
    if (px < 0 || py < 0 || px >= el.width || py >= el.height) return null;
    // Transparent pixels are outside the shirt.
    if (el.getContext("2d").getImageData(Math.floor(px), Math.floor(py), 1, 1).data[3] === 0) return null;
    const margin = el.width / 16, span = (el.width * 7) / 8;
    return partAt(editBase, ((px - margin) / span) * 200, ((py - margin) / span) * 200);
  }
  /** In edit mode, clicking the shirt selects the part painted under the pointer. */
  async function pickPart(e) {
    const id = await partUnderPointer(e);
    if (id) setSelectedPart(id);
  }
  async function hoverOver(e) {
    const id = await partUnderPointer(e);
    setHoverPart((current) => (current === id ? current : id));
  }
  // Everything the child pages read or call; the layout owns the shared state.
  const ctx = {
    catalog, select, addMany, activate, active, add, background, customBg, setCustomBg, busy, cancelEdit, candidate, candidateId,
    country, feedback, setFeedback, saveFeedback, reviewStatus, draft, editBase, edited, editing, equipment, filtered, hoverOver,
    hoverPart, missing, part, parts, pickPart, previewConfig, query, review, reviews, saveEdit,
    selectedIndex, selectedPart, selection, setBackground, setCountry, setDraft,
    setHoverPart, setQuery, setSelectedPart, slot, startEdit, updateReview, variant, zoom,
  };
  if (loadError)
    return (
      <main className="load-state">
        <Icon name="info" size={36} />
        <h1>The studio could not open</h1>
        <p>{loadError}</p>
        <button className="primary" onClick={() => location.reload()}>
          Try again
        </button>
      </main>
    );
  if (!catalog)
    return (
      <main className="load-state">
        <Icon name="shirt" size={40} />
        <p>Opening your kit studio…</p>
      </main>
    );
  return (
    <div className={`app ${section === "studio" ? "fit" : ""} ${railCollapsed ? "rail-collapsed" : ""}`}>
      <header className="header rail">
        <div className="rail-top">
          <Link to="/studio" className="brand" title="T-shirt Generator">
            <span className="brand-mark">
              <Icon name="shirt" size={25} />
            </span>
            <span className="rail-text">
              T-shirt Generator<small>FOOTBALL KIT STUDIO</small>
            </span>
          </Link>
        </div>
        <nav aria-label="Workspace">
          <Link
            to="/studio"
            className={section === "studio" ? "nav-active" : ""}
            aria-current={section === "studio" ? "page" : undefined}
            title="Studio"
          >
            <Icon name="shirt" size={17} />
            <span className="rail-text">Studio</span>
          </Link>
          <Link
            to="/catalog"
            className={section === "catalog" ? "nav-active" : ""}
            aria-current={section === "catalog" ? "page" : undefined}
            title="Catalog"
          >
            <Icon name="layers" size={17} />
            <span className="rail-text">Catalog</span>
            <span className="nav-count rail-text">{catalog.counts.teams}</span>
          </Link>
        </nav>
        <div className="season-label rail-text">
          <span className="live-dot" />
          2026 / 27 COLLECTION
        </div>
        <button
          className="rail-toggle"
          aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!railCollapsed}
          onClick={toggleRail}
        >
          <Icon name={railCollapsed ? "right" : "left"} size={15} />
          <span className="rail-text">Collapse</span>
        </button>
        <button className="account" title="Design team · local session (sign-in comes later)" aria-label="Account: Design team">
          <span className="account-avatar">DT</span>
          <span className="account-text rail-text">
            <strong>Design team</strong>
            <small>Local session · not logged in</small>
          </span>
        </button>
      </header>
      <main>
        <Outlet context={ctx} />
        <div
          className={`notice ${notice ? "visible" : ""}`}
          role="status"
          aria-live="polite"
        >
          {notice && (
            <>
              <Icon name="info" size={17} />
              {notice}
              <button
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <Icon name="close" size={16} />
              </button>
            </>
          )}
        </div>
        <section className={`queue ${queueOpen ? "open" : ""}`} aria-label="Collection">
          <button className="queue-head" aria-expanded={queueOpen} onClick={() => setQueueOpen((o) => !o)}>
            <Icon name="layers" size={16} />
            <span>Collection</span>
            <span className="count-pill">{selection.length}/10</span>
            <Icon name={queueOpen ? "down" : "up"} size={15} />
          </button>
          {queueOpen && (
            <div className="queue-body">
              {selection.length ? (
                <div className="collection-list">
                  {selection.map((item, i) => (
                    <div
                      className={`collection-item ${selectedIndex === i ? "current" : ""}`}
                      key={revisionKey(item)}
                    >
                      <button onClick={() => activate(item)}>
                        <Icon name="shirt" size={22} />
                        <span>
                          <strong>{item.team_name}</strong>
                          <small>
                            {item.variant} · {item.kit_season}
                          </small>
                        </span>
                      </button>
                      <button
                        className="remove"
                        aria-label={`Remove ${item.team_name} ${item.variant}`}
                        onClick={() => remove(i)}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="queue-empty">Use “Add to collection” to queue up to 10 kits for download.</p>
              )}
              <div className="queue-actions">
                <select
                  aria-label="Download size"
                  value={exportSize}
                  onChange={(e) => setExportSize(Number(e.target.value))}
                  disabled={!!exporting}
                >
                  {EXPORT_SIZES.map((size) => (
                    <option key={size} value={size}>{size} px · PNG</option>
                  ))}
                </select>
                <button className="secondary" disabled={!selection.length || !!exporting} onClick={() => downloadQueue(false)}>
                  <Icon name="download" size={15} />
                  Download
                </button>
                <button className="primary" disabled={!selection.length || !!exporting} onClick={() => downloadQueue(true)}>
                  ZIP
                </button>
              </div>
              {exporting && <p className="queue-progress" aria-live="polite">{exporting}</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
