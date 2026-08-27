import type { GardenPhase } from "../../../lib/types";

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  phase: GardenPhase,
  params: Record<string, unknown>,
  timeMs: number,
) => void;

function wilt(phase: GardenPhase): number {
  return Math.max(0, (phase - 1) / 4);
}

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
  alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawPine(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  scale: number,
  lean: number,
  healthy: number,
): void {
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(lean);
  ctx.scale(scale, scale);

  ctx.fillStyle = healthy > 0.45 ? "#4a3b2a" : "#5a4638";
  ctx.fillRect(-2, 0, 4, 18);

  const layers = healthy > 0.25 ? 3 : 2;
  for (let i = 0; i < layers; i++) {
    const g = 50 + healthy * 70;
    const r = 70 + (1 - healthy) * 70;
    const b = 30 + healthy * 20;
    ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.55 + healthy * 0.4})`;
    const drop = (1 - healthy) * 6;
    ctx.beginPath();
    ctx.moveTo(0, -30 + i * 10 + drop);
    ctx.lineTo(-16 + i * 2, -8 + i * 10 + drop);
    ctx.lineTo(16 - i * 2, -8 + i * 10 + drop);
    ctx.closePath();
    ctx.fill();
  }

  if (healthy < 0.5) {
    ctx.fillStyle = "rgba(120,80,40,0.7)";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-12 + i * 6, 16 + (i % 2) * 3, 3, 1);
    }
  }
  ctx.restore();
}

function drawCompactObject(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  healthy: number,
): void {
  const cx = w / 2;
  const cy = h / 2 + 4;

  ctx.save();
  ctx.shadowColor = "rgba(40,30,20,0.28)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ellipse(ctx, cx, cy + 18, 30, 10, healthy > 0.4 ? "#c4b49a" : "#a89880", 1);
  ctx.restore();
  ellipse(ctx, cx, cy + 16, 26, 8, healthy > 0.4 ? "#d8c8ac" : "#b8a888", 1);
  ellipse(ctx, cx, cy + 15, 22, 6, healthy > 0.4 ? "#e4d4b8" : "#c8b898", 1);

  if (healthy < 0.4) {
    ctx.strokeStyle = "rgba(90,70,50,0.5)";
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 15);
    ctx.lineTo(cx + 4, cy + 18);
    ctx.stroke();
  }

  ellipse(ctx, cx + 10, cy + 14, 6, 3.5, "#6b6358", 0.95);
  ellipse(ctx, cx + 14, cy + 15, 4, 2.5, "#8a8175", 0.9);

  drawPine(ctx, cx - 4, cy + 10, 0.9, (1 - healthy) * 0.4, healthy);
}

/** Compact dish-and-pine. Neglect wilts the pine; it does not become night. */
export const zenScene: DrawFn = (ctx, w, h, phase) => {
  drawCompactObject(ctx, w, h, 1 - wilt(phase));
};

export const cosmicScene: DrawFn = (ctx, w, h, phase, _params, timeMs) => {
  const healthy = 1 - wilt(phase);
  const t = timeMs / 1000;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, healthy > 0.4 ? "#07061a" : "#121018");
  g.addColorStop(0.45, healthy > 0.4 ? "#1a1040" : "#241828");
  g.addColorStop(1, healthy > 0.4 ? "#2a1248" : "#1c1420");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 40; i++) {
    const x = (i * 73 + Math.sin(t * 0.15 + i) * 8) % w;
    const y = (i * 47) % h;
    const a = (0.25 + (i % 5) * 0.12) * (0.35 + healthy * 0.65);
    ellipse(ctx, x, y, 1.1, 1.1, "#f4f0ff", a);
  }

  ctx.save();
  ctx.globalAlpha = 0.18 + healthy * 0.28;
  const neb = ctx.createRadialGradient(w * 0.62, h * 0.38, 8, w * 0.62, h * 0.38, 90);
  neb.addColorStop(0, healthy > 0.4 ? "#c48cff" : "#8a6a90");
  neb.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  ellipse(
    ctx,
    w * 0.28,
    h * 0.42,
    18 + healthy * 6,
    18 + healthy * 6,
    healthy > 0.4 ? "#d8c4a0" : "#8a7a68",
    0.95,
  );
  ellipse(ctx, w * 0.26, h * 0.4, 6, 4, "rgba(40,30,20,0.35)", 0.8);

  const dust = Math.round(12 * healthy);
  for (let i = 0; i < dust; i++) {
    const x = ((i * 51 + t * 22) % (w + 10)) - 5;
    const y = h * 0.55 + Math.sin(t * 0.8 + i) * 30 + i * 3;
    ellipse(ctx, x, y, 2, 2, "rgba(220,180,255,0.7)", 0.5);
  }
};

export const oceanScene: DrawFn = (ctx, w, h, phase, _params, timeMs) => {
  const healthy = 1 - wilt(phase);
  const t = timeMs / 1000;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, healthy > 0.4 ? "#0a3a58" : "#2a3840");
  g.addColorStop(0.5, healthy > 0.4 ? "#0e5c6e" : "#3a4a48");
  g.addColorStop(1, healthy > 0.4 ? "#cbb07a" : "#8a7a60");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = healthy > 0.4 ? "rgba(20,90,70,0.55)" : "rgba(60,70,50,0.45)";
  for (let k = 0; k < 5; k++) {
    const base = w * (0.1 + k * 0.18);
    ctx.beginPath();
    ctx.moveTo(base, h);
    for (let y = h; y > h * 0.35; y -= 6) {
      const x = base + Math.sin(y * 0.08 + t * (0.6 + k * 0.1) + k) * (6 + healthy * 6);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(base + 8, h);
    ctx.closePath();
    ctx.fill();
  }

  const bubbles = Math.round(10 * healthy);
  for (let i = 0; i < bubbles; i++) {
    const x = (i * 37 + 20) % w;
    const y = h - ((t * (18 + i) + i * 40) % h);
    ellipse(ctx, x, y, 2 + (i % 3), 2 + (i % 3), "rgba(200,230,240,0.55)", 0.6);
  }

  ellipse(
    ctx,
    w * 0.7,
    h * 0.22,
    14,
    14,
    healthy > 0.4 ? "rgba(255,240,180,0.25)" : "rgba(180,170,140,0.15)",
    1,
  );
};

export const pixelScene: DrawFn = (ctx, w, h, phase, _params, timeMs) => {
  const healthy = 1 - wilt(phase);
  const t = timeMs / 1000;
  const cell = 8;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = healthy > 0.4 ? "#5ec4e8" : "#8a9aa0";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = healthy > 0.4 ? "#3d8c4a" : "#6a5a38";
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  ctx.fillStyle = healthy > 0.4 ? "#ffe566" : "#d0c090";
  const sun = 3 + Math.round(healthy * 2);
  ctx.fillRect(w * 0.75, h * 0.16, sun * cell, sun * cell);

  const tree = (tx: number, scale: number) => {
    const tw = cell * scale;
    ctx.fillStyle = healthy > 0.45 ? "#5a3a22" : "#4a4030";
    ctx.fillRect(tx, h * 0.62 - tw, cell, tw);
    ctx.fillStyle = healthy > 0.4 ? "#2f8f3a" : "#7a6a40";
    ctx.fillRect(tx - tw, h * 0.62 - tw * 2, tw * 2 + cell, tw * 1.4);
  };
  tree(w * 0.18, 3);
  tree(w * 0.42, 4);
  tree(w * 0.62, 2);

  const bits = Math.round(8 * healthy);
  for (let i = 0; i < bits; i++) {
    const x = (i * 29 + t * 24) % w;
    const y = h * 0.3 + ((i * 17 + t * 10) % (h * 0.3));
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(x, y, 3, 3);
  }
};

export const BUNDLE_SCENES: Record<string, DrawFn> = {
  "zen-garden": zenScene,
  "cosmic-garden": cosmicScene,
  "ocean-depths": oceanScene,
  "pixel-forest": pixelScene,
};
