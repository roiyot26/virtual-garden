import type {
  LayerRenderer,
  LayerViewport,
  PhaseTransition,
} from "../layer-renderer";
import type { LayerConfig } from "../layer-config";
import { getBundleAssetURL } from "../bundle-loader";

export class CSSLayerRenderer implements LayerRenderer {
  private readonly config: LayerConfig;
  private readonly bundleId: string;

  private styleEl: HTMLStyleElement | null = null;
  private contentDiv: HTMLDivElement | null = null;
  private container: HTMLElement | null = null;

  constructor(config: LayerConfig, bundleId: string) {
    this.config = config;
    this.bundleId = bundleId;
  }

  async initialize(
    container: HTMLElement,
    viewport: LayerViewport,
  ): Promise<void> {
    this.container = container;

    // Create <style> element
    this.styleEl = document.createElement("style");
    this.styleEl.dataset.layerId = this.config.id;

    if (this.config.asset) {
      const url = getBundleAssetURL(
        `assets/bundles/${this.bundleId}/${this.config.asset}`,
      );
      try {
        const response = await fetch(url);
        this.styleEl.textContent = await response.text();
      } catch {
        console.warn(
          `[CSSLayerRenderer] Failed to load CSS asset: ${url}`,
        );
      }
    } else if (
      this.config.engineConfig?.inlineCSS &&
      typeof this.config.engineConfig.inlineCSS === "string"
    ) {
      this.styleEl.textContent = this.config.engineConfig.inlineCSS;
    }

    container.appendChild(this.styleEl);

    // Create content div — must fill the layer container
    this.contentDiv = document.createElement("div");
    this.contentDiv.className = "css-layer-content";

    const transitionMs = this.config.transitionDurationMs ?? 800;
    this.contentDiv.style.cssText = `
      width: 100%;
      height: 100%;
      transition: all ${transitionMs}ms ease;
    `;

    // Set initial viewport CSS vars
    this.contentDiv.style.setProperty(
      "--viewport-width",
      `${viewport.width}`,
    );
    this.contentDiv.style.setProperty(
      "--viewport-height",
      `${viewport.height}`,
    );

    container.appendChild(this.contentDiv);
  }

  setPhase(transition: PhaseTransition): void {
    if (!this.contentDiv) return;

    this.contentDiv.dataset.phase = String(transition.phase);

    if (this.config.phaseStrategy.type === "parameters") {
      const params = this.config.phaseStrategy.params[
        transition.phase as 1 | 2 | 3 | 4 | 5
      ];
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          this.contentDiv.style.setProperty(`--${key}`, String(value));
        }
      }
    }
  }

  setViewport(viewport: LayerViewport): void {
    if (!this.contentDiv) return;

    this.contentDiv.style.setProperty(
      "--viewport-width",
      `${viewport.width}`,
    );
    this.contentDiv.style.setProperty(
      "--viewport-height",
      `${viewport.height}`,
    );
  }

  pause(): void {
    if (!this.contentDiv) return;
    this.contentDiv.style.animationPlayState = "paused";
  }

  resume(): void {
    if (!this.contentDiv) return;
    this.contentDiv.style.animationPlayState = "running";
  }

  destroy(): void {
    if (this.styleEl && this.container) {
      this.container.removeChild(this.styleEl);
    }
    if (this.contentDiv && this.container) {
      this.container.removeChild(this.contentDiv);
    }
    this.styleEl = null;
    this.contentDiv = null;
    this.container = null;
  }
}
