import type {
  LayerRenderer,
  LayerViewport,
  PhaseTransition,
} from "../layer-renderer";
import type { LayerConfig } from "../layer-config";
import { getBundleAssetURL } from "../bundle-loader";

export class LottieLayerRenderer implements LayerRenderer {
  private readonly config: LayerConfig;
  private readonly bundleId: string;

  private canvas: HTMLCanvasElement | null = null;
  private container: HTMLElement | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private player: any = null;

  private viewportWidth = 0;
  private viewportHeight = 0;

  constructor(config: LayerConfig, bundleId: string) {
    this.config = config;
    this.bundleId = bundleId;
  }

  async initialize(
    container: HTMLElement,
    viewport: LayerViewport,
  ): Promise<void> {
    this.container = container;
    this.viewportWidth = viewport.width;
    this.viewportHeight = viewport.height;

    const dpr = window.devicePixelRatio || 1;

    // Create canvas element
    this.canvas = document.createElement("canvas");
    this.canvas.width = viewport.width * dpr;
    this.canvas.height = viewport.height * dpr;
    this.canvas.style.width = `${viewport.width}px`;
    this.canvas.style.height = `${viewport.height}px`;
    container.appendChild(this.canvas);

    // Dynamic import of dotlottie-web
    try {
      const { DotLottie } = await import("@lottiefiles/dotlottie-web");

      const assetUrl = this.config.asset
        ? getBundleAssetURL(
            `assets/bundles/${this.bundleId}/${this.config.asset}`,
          )
        : undefined;

      this.player = new DotLottie({
        canvas: this.canvas,
        src: assetUrl,
        autoplay: true,
        loop: true,
      });
    } catch (err) {
      console.warn(
        "[LottieLayerRenderer] Failed to load @lottiefiles/dotlottie-web. " +
          "Install the package to enable Lottie animations.",
        err,
      );
    }
  }

  setPhase(transition: PhaseTransition): void {
    if (!this.player) return;

    const phaseKey = transition.phase as 1 | 2 | 3 | 4 | 5;

    if (this.config.phaseStrategy.type === "segments") {
      const segment = this.config.phaseStrategy.markers[phaseKey];
      if (segment) {
        this.player.setSegment(segment.start, segment.end);
        this.player.play();
      }
    } else if (this.config.phaseStrategy.type === "files") {
      const assetPath = this.config.phaseStrategy.assets[phaseKey];
      if (assetPath) {
        const url = getBundleAssetURL(
          `assets/bundles/${this.bundleId}/${assetPath}`,
        );
        this.player.load({
          src: url,
          autoplay: true,
          loop: true,
        });
      }
    }
  }

  setViewport(viewport: LayerViewport): void {
    this.viewportWidth = viewport.width;
    this.viewportHeight = viewport.height;

    if (!this.canvas) return;

    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = viewport.width * dpr;
    this.canvas.height = viewport.height * dpr;
    this.canvas.style.width = `${viewport.width}px`;
    this.canvas.style.height = `${viewport.height}px`;

    if (this.player) {
      this.player.resize();
    }
  }

  pause(): void {
    if (this.player) {
      this.player.pause();
    }
  }

  resume(): void {
    if (this.player) {
      this.player.play();
    }
  }

  destroy(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = null;
    this.container = null;
  }
}
