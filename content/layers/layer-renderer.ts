import type { GardenPhase } from "@/lib/types";

export interface PhaseTransition {
  phase: GardenPhase;
  previousPhase: GardenPhase | null;
  durationMs: number;
}

export interface LayerViewport {
  width: number;
  height: number;
}

/**
 * Every layer renderer — regardless of engine — must implement this.
 * The SceneCompositor calls these methods; renderers never call each other.
 */
export interface LayerRenderer {
  /** Create DOM elements and load assets. Called once. */
  initialize(container: HTMLElement, viewport: LayerViewport): Promise<void>;

  /** Transition to a new garden phase. */
  setPhase(transition: PhaseTransition): void;

  /** Adapt content to new viewport size (compact ↔ expanded). */
  setViewport(viewport: LayerViewport): void;

  /** Pause rendering (Canvas rAF loops, Lottie playback, CSS animations). */
  pause(): void;

  /** Resume rendering after a pause. */
  resume(): void;

  /** Tear down: remove DOM elements, cancel animation frames. Must be idempotent. */
  destroy(): void;
}
