import type {
  LayerRenderer,
  LayerViewport,
  PhaseTransition,
} from "../layer-renderer";
import type { LayerConfig } from "../layer-config";
import type { GardenPhase } from "../../../lib/types";

export type DrawFunction = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: GardenPhase,
  params: Record<string, unknown>,
  timeMs: number,
) => void;

export class CanvasLayerRenderer implements LayerRenderer {
  private static drawFunctions = new Map<string, DrawFunction>();

  private readonly config: LayerConfig;
  private readonly bundleId: string;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private container: HTMLElement | null = null;

  private drawFn: DrawFunction | null = null;
  private rafId: number | null = null;
  private running = false;

  private currentPhase: GardenPhase = 3 as GardenPhase;
  private currentParams: Record<string, unknown> = {};
  private viewportWidth = 0;
  private viewportHeight = 0;

  constructor(config: LayerConfig, bundleId: string) {
    this.config = config;
    this.bundleId = bundleId;
  }

  static registerDrawFunction(name: string, fn: DrawFunction): void {
    CanvasLayerRenderer.drawFunctions.set(name, fn);
  }

  static getDrawFunction(name: string): DrawFunction | undefined {
    return CanvasLayerRenderer.drawFunctions.get(name);
  }

  async initialize(
    container: HTMLElement,
    viewport: LayerViewport,
  ): Promise<void> {
    this.container = container;
    this.viewportWidth = viewport.width;
    this.viewportHeight = viewport.height;

    const dpr = window.devicePixelRatio || 1;

    // Create canvas element — fill the layer container
    this.canvas = document.createElement("canvas");
    this.canvas.width = viewport.width * dpr;
    this.canvas.height = viewport.height * dpr;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";

    this.ctx = this.canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }

    container.appendChild(this.canvas);

    // Look up draw function
    const drawFnName = this.config.engineConfig?.drawFunction;
    if (typeof drawFnName === "string") {
      this.drawFn = CanvasLayerRenderer.drawFunctions.get(drawFnName) ?? null;
      if (!this.drawFn) {
        console.warn(
          `[CanvasLayerRenderer] Draw function "${drawFnName}" not registered`,
        );
      }
    }

    // Start the render loop
    this.running = true;
    this.tick();
  }

  setPhase(transition: PhaseTransition): void {
    this.currentPhase = transition.phase;

    if (this.config.phaseStrategy.type === "parameters") {
      const params = this.config.phaseStrategy.params[
        transition.phase as 1 | 2 | 3 | 4 | 5
      ];
      if (params) {
        this.currentParams = { ...params };
      }
    }
  }

  setViewport(viewport: LayerViewport): void {
    this.viewportWidth = viewport.width;
    this.viewportHeight = viewport.height;

    if (!this.canvas || !this.ctx) return;

    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = viewport.width * dpr;
    this.canvas.height = viewport.height * dpr;
    this.canvas.style.width = `${viewport.width}px`;
    this.canvas.style.height = `${viewport.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  pause(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume(): void {
    if (this.running) return;
    this.running = true;
    this.tick();
  }

  destroy(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.drawFn = null;
  }

  private tick = (): void => {
    if (!this.running || !this.ctx || !this.drawFn) return;

    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    this.drawFn(
      this.ctx,
      this.viewportWidth,
      this.viewportHeight,
      this.currentPhase,
      this.currentParams,
      performance.now(),
    );

    this.rafId = requestAnimationFrame(this.tick);
  };
}
