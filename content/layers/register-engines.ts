import { SceneCompositor } from "./scene-compositor";
import { CSSLayerRenderer } from "./renderers/css-renderer";
import { CanvasLayerRenderer } from "./renderers/canvas-renderer";
import { LottieLayerRenderer } from "./renderers/lottie-renderer";
import {
  floatingParticles,
} from "./renderers/builtin-draws";
import { cosmicScene, oceanScene, pixelScene, zenScene } from "./renderers/garden-scenes";

export function registerAllEngines(): void {
  SceneCompositor.registerEngine(
    "css",
    (config, bundleId) => new CSSLayerRenderer(config, bundleId),
  );
  SceneCompositor.registerEngine(
    "canvas",
    (config, bundleId) => new CanvasLayerRenderer(config, bundleId),
  );
  SceneCompositor.registerEngine(
    "lottie",
    (config, bundleId) => new LottieLayerRenderer(config, bundleId),
  );

  CanvasLayerRenderer.registerDrawFunction("floatingParticles", floatingParticles);
  CanvasLayerRenderer.registerDrawFunction("zenScene", zenScene);
  CanvasLayerRenderer.registerDrawFunction("cosmicScene", cosmicScene);
  CanvasLayerRenderer.registerDrawFunction("oceanScene", oceanScene);
  CanvasLayerRenderer.registerDrawFunction("pixelScene", pixelScene);
}

