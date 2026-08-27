import type { AnimationAdapter } from "@/content/animation-adapter";
import type { BundleManifest, LayerConfig } from "./layer-config";
import type {
  LayerRenderer,
  LayerViewport,
  PhaseTransition,
} from "./layer-renderer";
import { GardenPhase } from "@/lib/types";
import { WIDGET_SIZES } from "@/lib/constants";

type EngineFactory = (config: LayerConfig, bundleId: string) => LayerRenderer;

interface ManagedLayer {
  config: LayerConfig;
  renderer: LayerRenderer;
  container: HTMLElement;
}

/**
 * SceneCompositor manages N animation layers stacked inside a container.
 * Each layer uses its own engine (CSS, Lottie, Canvas).
 * Implements AnimationAdapter so it's a drop-in replacement for PlaceholderAdapter.
 */
export class SceneCompositor implements AnimationAdapter {
  private static engineFactories = new Map<string, EngineFactory>();

  static registerEngine(
    engine: LayerConfig["engine"],
    factory: EngineFactory,
  ): void {
    SceneCompositor.engineFactories.set(engine, factory);
  }

  private rootContainer: HTMLElement | null = null;
  private layers: ManagedLayer[] = [];
  private currentPhase: GardenPhase = GardenPhase.Neutral;
  private previousPhase: GardenPhase | null = null;
  private currentViewport: LayerViewport = WIDGET_SIZES.compact;
  private paused = false;

  constructor(private readonly manifest: BundleManifest) {}

  async initialize(container: HTMLElement): Promise<void> {
    this.rootContainer = container;
    container.style.position = "relative";
    container.style.overflow = "hidden";

    // Sort layers by zIndex (bottom first)
    const sorted = [...this.manifest.layers].sort(
      (a, b) => a.zIndex - b.zIndex,
    );

    const eager = sorted.filter((c) => !c.lazy);
    const lazy = sorted.filter((c) => c.lazy);

    // Initialize eager layers (blocks until ready)
    await Promise.all(eager.map((config) => this.initLayer(config)));

    // Initialize lazy layers in background
    if (lazy.length > 0) {
      queueMicrotask(() => {
        Promise.all(lazy.map((config) => this.initLayer(config))).catch(
          (err) =>
            console.warn("[SceneCompositor] Lazy layer init failed:", err),
        );
      });
    }
  }

  private async initLayer(config: LayerConfig): Promise<void> {
    const factory = SceneCompositor.engineFactories.get(config.engine);
    if (!factory) {
      console.warn(
        `[SceneCompositor] No engine for "${config.engine}", skipping "${config.id}"`,
      );
      return;
    }

    const layerEl = document.createElement("div");
    layerEl.dataset.layerId = config.id;
    layerEl.style.cssText = `
      position: absolute;
      inset: 0;
      z-index: ${config.zIndex};
      opacity: ${config.opacity ?? 1};
      mix-blend-mode: ${config.blendMode ?? "normal"};
      pointer-events: none;
      overflow: hidden;
    `;

    this.rootContainer!.appendChild(layerEl);

    const renderer = factory(config, this.manifest.id);

    try {
      await renderer.initialize(layerEl, this.currentViewport);
    } catch (err) {
      console.warn(
        `[SceneCompositor] Layer "${config.id}" init failed:`,
        err,
      );
      layerEl.remove();
      return;
    }

    const managed: ManagedLayer = { config, renderer, container: layerEl };
    this.layers.push(managed);

    // Apply current phase to newly initialized layer
    const transition: PhaseTransition = {
      phase: this.currentPhase,
      previousPhase: this.previousPhase,
      durationMs: config.transitionDurationMs ?? this.manifest.defaultTransitionMs ?? 800,
    };
    try {
      renderer.setPhase(transition);
    } catch {
      // Ignore phase set errors during init
    }
  }

  setPhase(phase: 1 | 2 | 3 | 4 | 5): void {
    const gardenPhase = phase as GardenPhase;
    this.previousPhase = this.currentPhase;
    this.currentPhase = gardenPhase;

    for (const layer of this.layers) {
      const transition: PhaseTransition = {
        phase: gardenPhase,
        previousPhase: this.previousPhase,
        durationMs:
          layer.config.transitionDurationMs ??
          this.manifest.defaultTransitionMs ??
          800,
      };
      try {
        layer.renderer.setPhase(transition);
      } catch (err) {
        console.warn(
          `[SceneCompositor] Layer "${layer.config.id}" phase error:`,
          err,
        );
      }
    }
  }

  setExpanded(expanded: boolean): void {
    this.currentViewport = expanded
      ? WIDGET_SIZES.expanded
      : WIDGET_SIZES.compact;

    for (const layer of this.layers) {
      try {
        layer.renderer.setViewport(this.currentViewport);
      } catch (err) {
        console.warn(
          `[SceneCompositor] Layer "${layer.config.id}" viewport error:`,
          err,
        );
      }
    }
  }

  cleanup(): void {
    for (const layer of this.layers) {
      try {
        layer.renderer.destroy();
      } catch (err) {
        console.warn(
          `[SceneCompositor] Layer "${layer.config.id}" destroy error:`,
          err,
        );
      }
      layer.container.remove();
    }
    this.layers = [];
    this.rootContainer = null;
  }

  pauseAll(): void {
    if (this.paused) return;
    this.paused = true;
    for (const layer of this.layers) {
      try {
        layer.renderer.pause();
      } catch {
        // Ignore
      }
    }
  }

  resumeAll(): void {
    if (!this.paused) return;
    this.paused = false;
    for (const layer of this.layers) {
      try {
        layer.renderer.resume();
      } catch {
        // Ignore
      }
    }
  }
}
