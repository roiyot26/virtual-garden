import { describe, expect, it } from "vitest";
import { zenScene } from "./garden-scenes";
import { GardenPhase } from "../../../lib/types";

function mockCtx() {
  let fills = 0;
  const ctx: Record<string, unknown> = {
    fill() {
      fills += 1;
    },
    fillRect() {
      fills += 1;
    },
    ellipse() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    scale() {},
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
    shadowColor: "",
    shadowBlur: 0,
    shadowOffsetY: 0,
    lineWidth: 1,
  };
  return {
    ctx: ctx as unknown as CanvasRenderingContext2D,
    fills: () => fills,
  };
}

describe("zenScene", () => {
  it("paints the compact dish (fills, not an empty frame)", () => {
    const { ctx, fills } = mockCtx();
    zenScene(ctx, 80, 80, GardenPhase.Thriving, {}, 0);
    expect(fills()).toBeGreaterThan(4);
  });

  it("still paints when neglected (wilt, not a blank canvas)", () => {
    const { ctx, fills } = mockCtx();
    zenScene(ctx, 80, 80, GardenPhase.Neglected, {}, 0);
    expect(fills()).toBeGreaterThan(3);
  });
});
