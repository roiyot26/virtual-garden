import { browser } from "wxt/browser";
import type { BundleManifest } from "./layer-config";

const MAX_LAYERS = 8;

/**
 * Wrapper around browser.runtime.getURL for dynamic paths.
 * WXT generates strict `PublicPath` types for known output files,
 * but bundle asset paths are runtime-determined so we need a cast.
 */
export function getBundleAssetURL(path: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (browser.runtime.getURL as (p: string) => string)(path);
}

/**
 * Fetches and validates a bundle manifest from the extension's assets.
 * Bundles live at `assets/bundles/<bundleId>/manifest.json`.
 */
export async function loadBundle(bundleId: string): Promise<BundleManifest> {
  const url = getBundleAssetURL(
    `assets/bundles/${bundleId}/manifest.json`,
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `[bundle-loader] Failed to fetch manifest for "${bundleId}": ${response.status}`,
    );
  }

  const manifest: BundleManifest = await response.json();

  // --- Validate ---

  if (manifest.version !== 1) {
    throw new Error(
      `[bundle-loader] Unsupported manifest version: ${manifest.version}`,
    );
  }

  if (!manifest.id || typeof manifest.id !== "string") {
    throw new Error("[bundle-loader] Manifest missing required field: id");
  }

  if (!Array.isArray(manifest.layers)) {
    throw new Error("[bundle-loader] Manifest missing required field: layers");
  }

  if (manifest.layers.length === 0) {
    throw new Error("[bundle-loader] Manifest has no layers");
  }

  if (manifest.layers.length > MAX_LAYERS) {
    throw new Error(
      `[bundle-loader] Too many layers (${manifest.layers.length}). Maximum is ${MAX_LAYERS}.`,
    );
  }

  // Validate each layer has required fields
  for (const layer of manifest.layers) {
    if (!layer.id || !layer.engine || !layer.phaseStrategy) {
      throw new Error(
        `[bundle-loader] Layer "${layer.id ?? "unknown"}" missing required fields (id, engine, phaseStrategy)`,
      );
    }

    const validEngines = ["css", "lottie", "canvas"];
    if (!validEngines.includes(layer.engine)) {
      throw new Error(
        `[bundle-loader] Layer "${layer.id}" has unknown engine: "${layer.engine}"`,
      );
    }

    if (layer.zIndex == null) {
      layer.zIndex = 0;
    }
  }

  return manifest;
}
