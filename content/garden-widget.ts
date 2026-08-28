import { GardenPhase } from "@/lib/types";
import { getWidgetStyles } from "@/content/widget-styles";
import { BUNDLE_SCENES, zenScene } from "@/content/layers/renderers/garden-scenes";

const FRAME_W = 96;
const FRAME_H = 88;

export interface GardenWidgetAPI {
  setPhase(phase: GardenPhase): void;
  setBundle(bundleId: string): void;
  setExpanded(expanded: boolean): void;
  destroy(): void;
}

export function createGardenWidget(): GardenWidgetAPI {
  const existing = document.getElementById("virtual-garden-widget-host");
  if (existing) existing.remove();

  const host = document.createElement("div");
  host.id = "virtual-garden-widget-host";
  (document.body ?? document.documentElement).appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const styleEl = document.createElement("style");
  styleEl.textContent = getWidgetStyles(FRAME_W, FRAME_H);
  shadow.appendChild(styleEl);

  const canvas = document.createElement("canvas");
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(FRAME_W * dpr);
  canvas.height = Math.round(FRAME_H * dpr);
  canvas.style.width = `${FRAME_W}px`;
  canvas.style.height = `${FRAME_H}px`;
  canvas.style.display = "block";
  shadow.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let currentPhase: GardenPhase = GardenPhase.Neutral;
  let currentBundle = "zen-garden";
  let rafId = 0;
  let running = true;

  function paint(timeMs: number): void {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, FRAME_W, FRAME_H);
    const draw = BUNDLE_SCENES[currentBundle] ?? zenScene;
    draw(ctx, FRAME_W, FRAME_H, currentPhase, {}, timeMs);
  }

  paint(0);

  const tick = (timeMs: number): void => {
    if (!running) return;
    paint(timeMs);
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  const onVisibilityChange = (): void => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(rafId);
    } else {
      running = true;
      paint(performance.now());
      rafId = requestAnimationFrame(tick);
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  return {
    setPhase(phase: GardenPhase) {
      currentPhase = phase;
      paint(performance.now());
    },
    setBundle(bundleId: string) {
      currentBundle = bundleId;
      paint(performance.now());
    },
    setExpanded(_expanded: boolean) {
      // Compact only. No HUD.
    },
    destroy() {
      running = false;
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      host.remove();
    },
  };
}
