export type LayerEngine = "lottie" | "css" | "canvas";

export type PhaseStrategy =
  | {
      type: "segments";
      markers: Record<1 | 2 | 3 | 4 | 5, { start: number; end: number }>;
    }
  | {
      type: "files";
      assets: Record<1 | 2 | 3 | 4 | 5, string>;
    }
  | {
      type: "parameters";
      params: Record<1 | 2 | 3 | 4 | 5, Record<string, unknown>>;
    };

export interface LayerConfig {
  id: string;
  name: string;
  engine: LayerEngine;
  zIndex: number;
  opacity?: number;
  blendMode?: string;
  lazy?: boolean;
  transitionDurationMs?: number;
  asset?: string;
  phaseStrategy: PhaseStrategy;
  engineConfig?: Record<string, unknown>;
}

export interface BundleManifest {
  version: 1;
  id: string;
  name: string;
  description: string;
  layers: LayerConfig[];
  defaultTransitionMs?: number;
}
