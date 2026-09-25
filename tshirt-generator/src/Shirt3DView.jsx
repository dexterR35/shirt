import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import { ShirtScene, loadShirtModel } from "./lib/shirt-3d.js";
import { POSE_LIMITS, describePose, nearestAzimuth, positionToPose, samePose, validatePose } from "./lib/shirt-3d-pose.js";

const DEG = Math.PI / 180;
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * The 3D shirt in the Studio canvas. Loaded (with three.js and the mesh) only when the
 * 3D view is switched on; its WebGL context is released when it is switched off.
 * The canvas is square, like downloads, so the shirt is framed exactly as it exports.
 * Drag to orbit and scroll to zoom unless the pose is locked. Poses are app state;
 * the angle buttons, lock and download live in ThreeDControls.
 */
export default function Shirt3DView({ config, lighting, pose, onPose, locked, disabled = false, label }) {
  const canvasRef = useRef(null), wrapRef = useRef(null), view = useRef(null);
  const [modelReady, setModelReady] = useState(false);
  const [painted, setPainted] = useState(undefined);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const latest = useRef({ pose, onPose });
  latest.current = { pose, onPose };
  const state = error ? "error" : modelReady && painted === config ? "ready" : "loading";

  // Scene, orbit controls and an on-demand render loop, for as long as 3D is on.
  useEffect(() => {
    const canvas = canvasRef.current, scene = new ShirtScene(canvas);
    const controls = new OrbitControls(scene.camera, canvas);
    Object.assign(controls, {
      enablePan: false, enableDamping: true, dampingFactor: 0.08, rotateSpeed: 0.7, zoomSpeed: 0.8,
      minDistance: POSE_LIMITS.distance[0], maxDistance: POSE_LIMITS.distance[1],
      minPolarAngle: (90 - POSE_LIMITS.elevation[1]) * DEG, maxPolarAngle: (90 - POSE_LIMITS.elevation[0]) * DEG,
    });
    scene.setPose(latest.current.pose);
    controls.update();
    let dirty = true, frame = 0, alive = true;
    const current = { scene, controls, tween: null, painted: false, invalidate: () => { dirty = true; } };
    view.current = current;
    controls.addEventListener("change", current.invalidate);
    // A finished drag or zoom becomes the app's pose (and so the downloads' pose).
    controls.addEventListener("end", () => {
      const next = positionToPose(scene.camera.position.toArray());
      if (!samePose(next, latest.current.pose)) latest.current.onPose(next);
    });
    const resize = () => {
      const box = wrapRef.current.getBoundingClientRect(), size = Math.max(64, Math.floor(Math.min(box.width, box.height, 640)));
      scene.setSize(size, Math.min(2, window.devicePixelRatio || 1));
      canvas.style.width = canvas.style.height = `${size}px`;
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(wrapRef.current);
    resize();
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!current.tween?.isActive() && controls.update()) dirty = true;
      if (dirty && current.painted) {
        scene.render();
        dirty = false;
      }
    };
    loop();
    setError("");
    loadShirtModel().then((shirt) => {
      if (!alive) return;
      scene.setModel(shirt);
      setModelReady(true);
    }).catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      current.tween?.kill();
      controls.dispose();
      // StrictMode re-runs this effect on the same canvas; keep its context in that case.
      scene.dispose({ loseContext: !canvas.isConnected });
      view.current = null;
      setModelReady(false);
      setPainted(undefined);
    };
  }, [retry]);

  // Kit paint: the same validated configuration as the 2D preview (null: plain shirt).
  useEffect(() => {
    const current = view.current;
    if (!modelReady || !current) return;
    let alive = true;
    current.scene.setPaint(config).then((done) => {
      if (!alive || !done) return;
      const first = !current.painted;
      current.painted = true;
      current.invalidate();
      setPainted(config);
      if (first && !reducedMotion())
        gsap.fromTo(canvasRef.current, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" });
    }).catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [config, modelReady]);

  useEffect(() => {
    view.current?.scene.setLighting(lighting);
    view.current?.invalidate();
  }, [lighting, retry]);

  useEffect(() => {
    if (view.current) view.current.controls.enabled = !locked && !disabled;
  }, [locked, disabled, retry]);

  // A new pose from outside (angle button, reset) glides there with GSAP.
  useEffect(() => {
    const current = view.current;
    if (!current) return;
    const from = positionToPose(current.scene.camera.position.toArray());
    if (samePose(from, pose)) return;
    current.tween?.kill();
    const at = { ...from };
    current.tween = gsap.to(at, {
      azimuth: nearestAzimuth(from.azimuth, pose.azimuth), elevation: pose.elevation, distance: pose.distance,
      duration: reducedMotion() ? 0 : 0.85, ease: "power3.inOut",
      onUpdate: () => {
        current.scene.setPose(validatePose(at));
        current.invalidate();
      },
      onComplete: () => {
        current.scene.setPose(pose);
        current.controls.update();
        current.invalidate();
      },
    });
  }, [pose]);

  return (
    <div className="shirt-3d" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="shirt-3d-canvas"
        role="img"
        aria-label={`${label} · 3D, ${describePose(pose)}`}
        aria-busy={state === "loading"}
        data-render-state={state}
        data-locked={locked}
        data-pose={JSON.stringify(pose)}
      />
      {state === "loading" && <span className="no-preview">Loading 3D shirt…</span>}
      {error && (
        <div className="preview-error" role="alert">
          {error}
          <button className="secondary" onClick={() => setRetry((n) => n + 1)}>Retry 3D</button>
        </div>
      )}
    </div>
  );
}
