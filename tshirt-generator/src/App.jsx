import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import Icon from "./Icon.jsx";
import {loadReviews, saveReview, reviewKey, emptyReview} from "./lib/reviews.js";
import {editableParts, applyEdits} from "./lib/kit-edit.js";
import {partAt, visiblePartIds} from "./lib/png-preview.js";
import {paintArea, LIGHTING_DEFAULT, validateLighting} from "./lib/composite.js";
import {LightingContext} from "./LightingControl.jsx";
import {useZoom} from "./lib/use-zoom.js";
import {neutralConfig} from "./lib/shirt-renderer.js";
import {loadKit, loadJson} from "./lib/kit-config.js";
import {recordDownload} from "./lib/download-stats.js";
import {
  filterTeams,
  addToSelection,
  revisionKey,
  kitKey,
  kitItem,
  hasReadyKit,
  variantLabel,
  COLLECTION_LIMIT,
} from "./lib/catalog.js";
import {EXPORT_SIZES, EXPORT_FORMATS, EXPORT_RATIOS, exportDimensions, renderImage, exportFilename, zipFilename, zipFiles, downloadBlob} from "./lib/export.js";
import ConfirmDialog from "./ConfirmDialog.jsx";
import {tier1Items, renderTier1Zip} from "./lib/tier1-export.js";
import {tierItems} from "./lib/tier-export.js";

const VIEW_KEY = "tshirt-studio:view";
const LIGHTING_KEY = "tshirt-studio:lighting";
function readLighting() {
  try { return validateLighting(Number(localStorage.getItem(LIGHTING_KEY) ?? LIGHTING_DEFAULT)); }
  catch { return LIGHTING_DEFAULT; }
}
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
    [exportFormat, setExportFormat] = useState("png"),
    [exportRatio, setExportRatio] = useState("1:1"),
    [lighting, setLighting] = useState(readLighting),
    // The download waiting for a yes/no answer: {items, asZip, tier1?}, or null.
    [pendingDownload, setPendingDownload] = useState(null),
    [exporting, setExporting] = useState(""),
    // Saved color edits per kit version (kitKey): kept in memory until the page is refreshed.
    [savedEdits, setSavedEdits] = useState({}),
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
    tier1Controller = useRef(null),
    // Tier 2 and Tier 3 downloads never run together (exporting gates both), so one ref suffices.
    tierController = useRef(null);
  const zoom = useZoom();
  useEffect(() => {
    try { localStorage.setItem(LIGHTING_KEY, String(lighting)); } catch { /* optional */ }
  }, [lighting]);
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
    loadJson("/catalog/manifest.json")
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
      tier1Controller.current?.abort();
      tierController.current?.abort();
    };
  }, []);
  const filtered = useMemo(
    () =>
      filterTeams(catalog?.teams || [], country, query).sort(
        (a, b) =>
          Number(!!b.mandatory) - Number(!!a.mandatory) ||
          Number(hasReadyKit(b)) - Number(hasReadyKit(a)) ||
          (a.priority_order ?? 9999) - (b.priority_order ?? 9999),
      ),
    [catalog, country, query],
  );
  const candidate = catalog?.teams.find((t) => t.id === candidateId),
    slot = candidate?.kits[variant];
  const editKey = active ? kitKey(active) : "base",
    editBase = useMemo(() => appliedConfig || neutralConfig(), [appliedConfig]),
    allParts = useMemo(() => editableParts(editBase), [editBase]),
    // Hide parts that are fully covered by other paint, e.g. sleeves under a sleeve panel.
    parts = visibleIds ? allParts.filter((p) => visibleIds.has(p.id) || p.id === selectedPart) : allParts,
    edits = editing ? draft : savedEdits[editKey] || {},
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
    else showBase();
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
      setNotice(`${candidate.name} ${variantLabel(variant)} added to your collection.`);
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
    const edits = savedEdits[kitKey(item)];
    return {config: edits ? applyEdits(saved.config, edits) : saved.config, custom: !!edits};
  }
  /** Render kits at the chosen size and format; download them one by one or as one ZIP. */
  async function downloadKits(items, asZip) {
    if (!items.length || exporting) return;
    const files = [], size = exportSize, format = exportFormat, ratio = exportRatio, label = EXPORT_FORMATS[format].label;
    const {width, height} = exportDimensions(size, ratio);
    try {
      for (const [i, item] of items.entries()) {
        setExporting(`Preparing ${i + 1} / ${items.length}…`);
        const {config, custom} = await exportConfig(item);
        files.push({name: exportFilename(item, size, format, custom, ratio), blob: await renderImage(config, size, format, ratio, lighting)});
        recordDownload(item);
      }
      if (asZip) {
        setExporting("Zipping…");
        downloadBlob(await zipFiles(files), zipFilename(files.length, size, format, ratio));
      } else {
        // Space the downloads out so the browser accepts each file.
        for (const f of files) {
          downloadBlob(f.blob, f.name);
          await new Promise((r) => setTimeout(r, 250));
        }
      }
      setNotice(`${files.length} kit${files.length > 1 ? "s" : ""} downloaded as ${label} at ${width} × ${height} px${asZip ? " in one ZIP" : ""}.`);
    } catch (e) {
      setNotice(e.message || "The download could not be prepared.");
    } finally {
      setExporting("");
    }
  }
  /** Every download asks first; the answer runs or drops it. */
  function askDownload(items, asZip) {
    if (items.length && !exporting) setPendingDownload({items, asZip});
  }
  function askTier1Download() {
    if (exporting || !catalog) return;
    try {
      setPendingDownload({items: tier1Items(catalog.teams), asZip: true, tier1: true});
    } catch (error) {
      setNotice(error.message);
    }
  }
  async function downloadTier1(items) {
    if (exporting || tier1Controller.current) return;
    const abort = new AbortController();
    tier1Controller.current = abort;
    const size = exportSize, ratio = exportRatio;
    const {width, height} = exportDimensions(size, ratio);
    try {
      const blob = await renderTier1Zip(items, {
        size, ratio, lighting, signal: abort.signal,
        onProgress: (done, total, item) => setExporting(`Tier 1: ${done + 1} / ${total} · ${item.team_name} ${variantLabel(item.variant)}…`),
      });
      abort.signal.throwIfAborted();
      downloadBlob(blob, `tier-1-${items.length}-${width}x${height}-png.zip`);
      setNotice(`${items.length} Tier 1 PNGs downloaded at ${width} × ${height} px in one ZIP.`);
    } catch (error) {
      setNotice(abort.signal.aborted ? "Tier 1 export cancelled. No files were downloaded." : error.message);
    } finally {
      tier1Controller.current = null;
      setExporting("");
    }
  }
  /** tierKey/tierLabel: "tier2"/"Tier 2" or "tier3"/"Tier 3". Only the ready slots download. */
  function askTierDownload(tierKey, tierLabel) {
    if (exporting || !catalog) return;
    try {
      setPendingDownload({items: tierItems(catalog.teams, tierKey), asZip: true, tierLabel});
    } catch (error) {
      setNotice(error.message);
    }
  }
  async function downloadTier(items, tierLabel) {
    if (exporting || tierController.current) return;
    const abort = new AbortController();
    tierController.current = abort;
    const size = exportSize, ratio = exportRatio;
    const {width, height} = exportDimensions(size, ratio);
    try {
      const blob = await renderTier1Zip(items, {
        size, ratio, lighting, signal: abort.signal,
        onProgress: (done, total, item) => setExporting(`${tierLabel}: ${done + 1} / ${total} · ${item.team_name} ${variantLabel(item.variant)}…`),
      });
      abort.signal.throwIfAborted();
      downloadBlob(blob, `${tierLabel.toLowerCase().replace(" ", "-")}-${items.length}-${width}x${height}-png.zip`);
      setNotice(`${items.length} ${tierLabel} PNGs downloaded at ${width} × ${height} px in one ZIP.`);
    } catch (error) {
      setNotice(abort.signal.aborted ? `${tierLabel} export cancelled. No files were downloaded.` : error.message);
    } finally {
      tierController.current = null;
      setExporting("");
    }
  }
  function downloadQuestion({items, asZip, tier1, tierLabel}) {
    const {width, height} = exportDimensions(exportSize, exportRatio);
    if (tier1) return {
      title: "Download all Tier 1 shirts?",
      message: `All ${items.length / 2} teams, Home and Away: ${items.length} PNG images at ${width} × ${height} px each, in one ZIP.`,
      note: `Uses saved team colors. Filenames: team_home.png and team_away.png. Large sizes take longer; you can cancel while preparing.`,
    };
    if (tierLabel) {
      const teamCount = new Set(items.map((i) => i.team_id)).size;
      return {
        title: `Download ready ${tierLabel} shirts?`,
        message: `${items.length} ready PNG image${items.length > 1 ? "s" : ""} across ${teamCount} team${teamCount > 1 ? "s" : ""} at ${width} × ${height} px each, in one ZIP.`,
        note: `${tierLabel} research is still in progress, so slots not yet ready are skipped — this is a partial export. Filenames: team_home.png and team_away.png. Large sizes take longer; you can cancel while preparing.`,
      };
    }
    const label = EXPORT_FORMATS[exportFormat].label, px = `${width} × ${height} px`, n = items.length;
    const one = n === 1 ? `${items[0].team_name} ${variantLabel(items[0].variant)}` : null;
    return {
      title: asZip ? `Download ${n} kit${n > 1 ? "s" : ""} as one ZIP?` : one ? `Download ${one}?` : `Download ${n} kits?`,
      message: asZip
        ? `One ZIP file with ${n} ${label} image${n > 1 ? "s" : ""}, ${px} each.`
        : one
          ? `One ${label} image, ${px}.`
          : `${n} separate ${label} images, ${px} each. Your browser may ask to allow multiple downloads.`,
      note: exportFormat === "avif" ? "AVIF files are about a tenth of the PNG size and take a few seconds each to prepare." : "",
    };
  }
  function remove(index) {
    const next = selection.filter((_, i) => i !== index);
    setSelection(next);
    if (index === selectedIndex && next.length)
      void activate(next[Math.min(index, next.length - 1)]);
  }
  function toggleRail() {
    setRailCollapsed((c) => {
      try { localStorage.setItem(RAIL_KEY, c ? "0" : "1"); } catch { /* optional */ }
      return !c;
    });
  }
  /** No kit: the plain base (a variant that is not ready never shows another kit). */
  function showBase() {
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
    setDraft({...(savedEdits[editKey] || {})});
    setSelectedPart(allParts[0]?.id || "");
    setVisibleIds(null);
    setHoverPart(null);
    setEditing(true);
    visiblePartIds(editBase).then(setVisibleIds, () => setVisibleIds(null));
  }
  const cancelEdit = useCallback(() => setEditing(false), []);
  function saveEdit() {
    setSavedEdits(({[editKey]: _previous, ...rest}) => (Object.keys(draft).length ? {...rest, [editKey]: draft} : rest));
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
    const {margin, span} = paintArea(el.width);
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
    lighting, setLighting, exporting,
    catalog, select: show, addMany, activate, active, add, background, customBg, setCustomBg, busy, cancelEdit, candidate, candidateId,
    country, feedback, setFeedback, saveFeedback, draft, editBase, edited, editing, equipment, filtered, hoverOver,
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
        <button className="primary" onClick={() => window.location.reload()}>
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
    <LightingContext.Provider value={lighting}>
    <div className={`app ${section === "studio" ? "fit" : ""} ${railCollapsed ? "rail-collapsed" : ""}`}>
      <header className="header rail">
        <div className="rail-top">
          <Link to="/studio" className="brand" title="T-shirt Generator">
            <span className="brand-mark">DT</span>
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
            <span className="count-pill">{selection.length}/{COLLECTION_LIMIT}</span>
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
                            {variantLabel(item.variant)} · {item.kit_season}
                          </small>
                        </span>
                      </button>
                      <button
                        className="item-action"
                        aria-label={`Download ${item.team_name} ${item.variant}`}
                        title="Download this kit"
                        disabled={!!exporting}
                        onClick={() => askDownload([item], false)}
                      >
                        <Icon name="download" size={14} />
                      </button>
                      <button
                        className="item-action remove"
                        aria-label={`Remove ${item.team_name} ${item.variant}`}
                        title="Remove from the collection"
                        onClick={() => remove(i)}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="queue-empty">Use “Add to collection” to queue up to {COLLECTION_LIMIT} kits for download.</p>
              )}
              <div className="queue-actions">
                <select
                  aria-label="Download size"
                  value={exportSize}
                  onChange={(e) => setExportSize(Number(e.target.value))}
                  disabled={!!exporting}
                >
                  {EXPORT_SIZES.map((size) => (
                    <option key={size} value={size}>{size} px</option>
                  ))}
                </select>
                <select
                  aria-label="Image shape"
                  title={`${EXPORT_RATIOS[exportRatio].name} · the shirt stays whole and centered`}
                  value={exportRatio}
                  onChange={(e) => setExportRatio(e.target.value)}
                  disabled={!!exporting}
                >
                  {Object.entries(EXPORT_RATIOS).map(([id, r]) => (
                    <option key={id} value={id} title={r.name}>{r.label}</option>
                  ))}
                </select>
                <select
                  aria-label="Download format"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  disabled={!!exporting}
                >
                  {Object.entries(EXPORT_FORMATS).map(([id, f]) => (
                    <option key={id} value={id}>{f.label}</option>
                  ))}
                </select>
                <button className="secondary" disabled={!selection.length || !!exporting} onClick={() => askDownload(selection, false)}>
                  <Icon name="download" size={15} />
                  Download all
                </button>
                <button className="primary" disabled={!selection.length || !!exporting} onClick={() => askDownload(selection, true)}>
                  ZIP all
                </button>
              </div>
              {import.meta.env.DEV && (
                <>
                  <button className="secondary tier1-download" disabled={!catalog || !!exporting} onClick={askTier1Download}>
                    <Icon name="download" size={15} />
                    Download all Tier 1 · PNG ZIP
                  </button>
                  <button className="secondary tier-download" disabled={!catalog || !!exporting} onClick={() => askTierDownload("tier2", "Tier 2")}>
                    <Icon name="download" size={15} />
                    Download ready Tier 2 · PNG ZIP
                  </button>
                  <button className="secondary tier-download" disabled={!catalog || !!exporting} onClick={() => askTierDownload("tier3", "Tier 3")}>
                    <Icon name="download" size={15} />
                    Download ready Tier 3 · PNG ZIP
                  </button>
                </>
              )}
              {exporting && <p className="queue-progress" aria-live="polite">{exporting}</p>}
              {exporting && tier1Controller.current && (
                <button className="secondary tier1-cancel" onClick={() => {
                  tier1Controller.current?.abort();
                  setExporting("Cancelling Tier 1 export…");
                }}>Cancel export</button>
              )}
              {exporting && tierController.current && (
                <button className="secondary tier-cancel" onClick={() => {
                  tierController.current?.abort();
                  setExporting("Cancelling export…");
                }}>Cancel export</button>
              )}
            </div>
          )}
        </section>
        {pendingDownload && (
          <ConfirmDialog
            {...downloadQuestion(pendingDownload)}
            confirmLabel="Yes, download"
            onCancel={() => setPendingDownload(null)}
            onConfirm={() => {
              const {items, asZip, tier1, tierLabel} = pendingDownload;
              setPendingDownload(null);
              if (tier1) void downloadTier1(items);
              else if (tierLabel) void downloadTier(items, tierLabel);
              else void downloadKits(items, asZip);
            }}
          />
        )}
      </main>
    </div>
    </LightingContext.Provider>
  );
}
