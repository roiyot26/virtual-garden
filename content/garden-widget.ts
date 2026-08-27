import { GardenPhase } from "@/lib/types";
import { settingsStorage } from "@/lib/storage";
import { getWidgetStyles } from "@/content/widget-styles";
import { loadBundle } from "@/content/layers/bundle-loader";
import { SceneCompositor } from "@/content/layers/scene-compositor";
import { registerAllEngines } from "@/content/layers/register-engines";
import type { AnimationAdapter } from "@/content/animation-adapter";
import { PlaceholderAdapter } from "@/content/animation-adapter";

const PHASE_NAMES: Record<GardenPhase, string> = {
  [GardenPhase.Thriving]: "Thriving",
  [GardenPhase.Serene]: "Serene",
  [GardenPhase.Neutral]: "Neutral",
  [GardenPhase.Unsettled]: "Unsettled",
  [GardenPhase.Neglected]: "Neglected",
};

export interface GardenWidgetAPI {
  setPhase(phase: GardenPhase): void;
  setExpanded(expanded: boolean): void;
  destroy(): void;
}

export function createGardenWidget(): GardenWidgetAPI {
  // Register animation engines once
  registerAllEngines();

  // Create host element
  const host = document.createElement("div");
  host.id = "virtual-garden-widget-host";
  document.body.appendChild(host);

  // Attach closed Shadow DOM
  const shadow = host.attachShadow({ mode: "closed" });

  // Inject styles
  const styleEl = document.createElement("style");
  styleEl.textContent = getWidgetStyles();
  shadow.appendChild(styleEl);

  // Container
  const container = document.createElement("div");
  container.className = "garden-container compact";
  shadow.appendChild(container);

  // Scene container — where the compositor renders layers
  const sceneContainer = document.createElement("div");
  sceneContainer.className = "scene-container";
  sceneContainer.style.cssText =
    "position: absolute; inset: 0; border-radius: inherit; overflow: hidden;";
  container.appendChild(sceneContainer);

  // Phase label (overlays the scene)
  const phaseLabel = document.createElement("div");
  phaseLabel.className = "phase-label";
  phaseLabel.textContent = "Neutral";
  phaseLabel.style.display = "none";
  container.appendChild(phaseLabel);

  // Expand/collapse button
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "toggle-btn";
  toggleBtn.textContent = "\u25B2";
  toggleBtn.setAttribute("aria-label", "Expand garden");
  container.appendChild(toggleBtn);

  let expanded = false;
  let currentPhase: GardenPhase = GardenPhase.Neutral;
  let adapter: AnimationAdapter | null = null;

  // --- Load animation bundle ---
  settingsStorage.getValue().then((settings) => {
    const bundleId = settings?.animationBundle ?? "zen-garden";
    return loadBundle(bundleId);
  })
    .then(async (manifest) => {
      const compositor = new SceneCompositor(manifest);
      await compositor.initialize(sceneContainer);
      adapter = compositor;

      // Apply current phase to compositor
      adapter.setPhase(currentPhase as 1 | 2 | 3 | 4 | 5);
      adapter.setExpanded(expanded);
    })
    .catch((err) => {
      console.warn("[virtual-garden] Bundle load failed, using placeholder:", err);
      const placeholder = new PlaceholderAdapter();
      placeholder.initialize(sceneContainer).then(() => {
        adapter = placeholder;
        adapter.setPhase(currentPhase as 1 | 2 | 3 | 4 | 5);
        adapter.setExpanded(expanded);
      });
    });

  // --- Visibility-based pause/resume ---
  const onVisibilityChange = () => {
    if (adapter && "pauseAll" in adapter) {
      const compositor = adapter as SceneCompositor;
      if (document.hidden) {
        compositor.pauseAll();
      } else {
        compositor.resumeAll();
      }
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  // --- Expand/collapse ---
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    expanded = !expanded;
    updateExpandedState();
  });

  function updateExpandedState() {
    if (expanded) {
      container.classList.add("expanded");
      container.classList.remove("compact");
      toggleBtn.textContent = "\u25BC";
      toggleBtn.setAttribute("aria-label", "Collapse garden");
      phaseLabel.style.display = "block";
    } else {
      container.classList.remove("expanded");
      container.classList.add("compact");
      toggleBtn.textContent = "\u25B2";
      toggleBtn.setAttribute("aria-label", "Expand garden");
      phaseLabel.style.display = "none";
    }

    adapter?.setExpanded(expanded);
  }

  // --- API ---
  return {
    setPhase(phase: GardenPhase) {
      currentPhase = phase;
      phaseLabel.textContent = PHASE_NAMES[currentPhase] ?? "Unknown";
      adapter?.setPhase(phase as 1 | 2 | 3 | 4 | 5);
    },

    setExpanded(value: boolean) {
      expanded = value;
      updateExpandedState();
    },

    destroy() {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      adapter?.cleanup();
      host.remove();
    },
  };
}
