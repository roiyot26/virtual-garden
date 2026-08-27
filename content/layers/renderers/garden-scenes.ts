import type { GardenPhase } from "../../../lib/types";

function num(params: Record<string, unknown>, key: string, fallback: number): number {
  return typeof params[key] === "number" ? (params[key] as number) : fallback;
}

function str(params: Record<string, unknown>, key: string, fallback: string): string {
  return typeof params[key] === "string" ? (params[key] as string) : fallback;
}

function vigor(phase: GardenPhase): number {
  return Math.max(0, (6 - phase) / 5);
}

function wilt(phase: GardenPhase): number {
  // 0 healthy … 1 fully wilted (neglected)
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

  const trunk = healthy > 0.45 ? "#4a3b2a" : "#5a4638";
  ctx.fillStyle = trunk;
  ctx.fillRect(-2, 0, 4, 18);

  // needles: green when healthy, brown and fewer when wilted
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

  // fallen needles when wilted
  if (healthy < 0.5) {
    ctx.fillStyle = "rgba(120,80,40,0.7)";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-12 + i * 6, 16 + (i % 2) * 3, 3, 1);
    }
  }
  ctx.restore();
}

/** Compact: a dish-and-pine object. Expanded: a garden that wilts with neglect. */
export function zenScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  phase: GardenPhase,
  params: Record<string, unknown>,
  timeMs: number,
): void {
  const v = vigor(phase);
  const dry = wilt(phase);
  const healthy = 1 - dry;
  const t = timeMs / 1000;
  const compact = w < 120;

  if (compact) {
    drawCompactObject(ctx, w, h, t, healthy, v, params);
    return;
  }

  // Expanded: daytime garden. Neglect dries it — it does not become night.
  const skyTop = healthy > 0.5 ? str(params, "skyTop", "#e9f2f6") : "#e4d8c4";
  const skyMid = healthy > 0.5 ? str(params, "skyMid", "#f0e6d0") : "#d9cbb0";
  const skyBot = healthy > 0.35 ? "#d4c4a8" : "#c4b090";
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, skyTop);
  g.addColorStop(0.55, skyMid);
  g.addColorStop(1, skyBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // hills: green when healthy, straw when wilted
  ctx.fillStyle =
    healthy > 0.4
      ? str(params, "hill", `rgba(90,140,70,${0.25 + v * 0.35})`)
      : `rgba(150,120,70,${0.25 + (1 - healthy) * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.55);
  ctx.quadraticCurveTo(w * 0.25, h * (0.42 - healthy * 0.04), w * 0.5, h * 0.52);
  ctx.quadraticCurveTo(w * 0.75, h * 0.6, w, h * 0.48);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  // raked sand — cracks when neglected
  ctx.save();
  ctx.strokeStyle = `rgba(160,140,110,${0.25 + healthy * 0.35})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const cy = h * 0.62 + i * 7;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = cy + Math.sin(x * 0.08 + i) * (2 + healthy * 2);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  if (dry > 0.5) {
    ctx.strokeStyle = "rgba(90,70,50,0.45)";
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.72);
    ctx.lineTo(w * 0.35, h * 0.88);
    ctx.moveTo(w * 0.55, h * 0.7);
    ctx.lineTo(w * 0.7, h * 0.9);
    ctx.stroke();
  }
  ctx.restore();

  ellipse(ctx, w * 0.28, h * 0.78, 14 + healthy * 4, 8, "#6b6358", 0.9);
  ellipse(ctx, w * 0.34, h * 0.8, 9, 6, "#8a8175", 0.85);
  ellipse(ctx, w * 0.72, h * 0.74, 11, 7, "#5c564c", 0.9);

  const lean = dry * 0.35;
  drawPine(ctx, w * 0.18, h * 0.7, 1, lean, healthy);

  // sun stays a sun — dimmer when dry, never a night moon
  const sunY = h * 0.2;
  ellipse(
    ctx,
    w * 0.78,
    sunY,
    10 + healthy * 4,
    10 + healthy * 4,
    healthy > 0.4 ? str(params, "sun", "#f4e3b0") : "#e0d0a8",
    0.55 + healthy * 0.35,
  );

  const petals = Math.round(num(params, "petals", 8) * healthy);
  for (let i = 0; i < petals; i++) {
    const x = ((i * 47 + t * 18) % (w + 20)) - 10;
    const y = (i * 31 + t * (12 + i)) % h;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.4 + i);
    ellipse(ctx, 0, 0, 4, 2.2, "rgba(232,160,170,0.85)", 0.7);
    ctx.restore();
  }
}

function drawCompactObject(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  healthy: number,
  v: number,
  _params: Record<string, unknown>,
): void {
  const cx = w / 2;
  const cy = h / 2 + 6;

  // ceramic dish — the object
  ellipse(ctx, cx, cy + 18, 28, 9, healthy > 0.4 ? "#c4b49a" : "#a89880", 1);
  ellipse(ctx, cx, cy + 16, 24, 7, healthy > 0.4 ? "#d8c8ac" : "#b8a888", 1);
  // sand in the dish
  ellipse(ctx, cx, cy + 15, 20, 5, healthy > 0.4 ? "#e4d4b8" : "#c8b898", 1);

  if (healthy < 0.4) {
    ctx.strokeStyle = "rgba(90,70,50,0.5)";
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 15);
    ctx.lineTo(cx + 4, cy + 18);
    ctx.stroke();
  }

  ellipse(ctx, cx + 10, cy + 14, 6, 3.5, "#6b6358", 0.95);
  ellipse(ctx, cx + 14, cy + 15, 4, 2.5, "#8a8175", 0.9);

  drawPine(ctx, cx - 4, cy + 8, 0.72, (1 - healthy) * 0.4, healthy);

  const n = Math.round(4 * v);
  for (let i = 0; i < n; i++) {
    const a = t * 0.6 + i * 1.7;
    const x = cx + Math.cos(a) * 16;
    const y = cy - 10 + Math.sin(a * 1.3) * 10;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ellipse(ctx, 0, 0, 3, 1.6, "rgba(232,160,170,0.85)", 0.75);
    ctx.restore();
  }
}
