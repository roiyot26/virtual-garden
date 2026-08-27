/* Pages gallery only. Not used by the content-script widget. */

function wilt(phase) {
  return Math.max(0, (phase - 1) / 4);
}

function ellipse(ctx, x, y, rx, ry, fill, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function vigor(phase) {
  return Math.max(0, (6 - phase) / 5);
}

export function zenScene(ctx, w, h, phase, _params, timeMs) {
  const dry = wilt(phase);
  const healthy = 1 - dry;
  const v = vigor(phase);
  const t = timeMs / 1000;

  const skyTop = healthy > 0.5 ? "#e9f2f6" : "#e4d8c4";
  const skyMid = healthy > 0.5 ? "#f0e6d0" : "#d9cbb0";
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, skyTop);
  g.addColorStop(0.55, skyMid);
  g.addColorStop(1, healthy > 0.35 ? "#d4c4a8" : "#c4b090");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = healthy > 0.4
    ? `rgba(90,140,70,${0.25 + v * 0.35})`
    : `rgba(150,120,70,${0.25 + (1 - healthy) * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.55);
  ctx.quadraticCurveTo(w * 0.25, h * (0.42 - healthy * 0.04), w * 0.5, h * 0.52);
  ctx.quadraticCurveTo(w * 0.75, h * 0.6, w, h * 0.48);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

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

  drawPine(ctx, w * 0.22, h * 0.72, 1.15, dry * 0.35, healthy);
  ellipse(ctx, w * 0.78, h * 0.2, 10 + healthy * 4, 10 + healthy * 4,
    healthy > 0.4 ? "#fff4c2" : "#e0d0a8", 0.55 + healthy * 0.35);

  const n = Math.round(8 * healthy);
  for (let i = 0; i < n; i++) {
    const x = ((i * 47 + t * 18) % (w + 20)) - 10;
    const y = (i * 31 + t * (12 + i)) % h;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.4 + i);
    ellipse(ctx, 0, 0, 4, 2.2, "rgba(232,160,170,0.85)", 0.7);
    ctx.restore();
  }
}

function drawPine(ctx, px, py, scale, lean, healthy) {
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
    for (let i = 0; i < 5; i++) ctx.fillRect(-12 + i * 6, 16 + (i % 2) * 3, 3, 1);
  }
  ctx.restore();
}

export function cosmicScene(ctx, w, h, phase, _params, timeMs) {
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

  ellipse(ctx, w * 0.28, h * 0.42, 18 + healthy * 6, 18 + healthy * 6, healthy > 0.4 ? "#d8c4a0" : "#8a7a68", 0.95);
  ellipse(ctx, w * 0.26, h * 0.4, 6, 4, "rgba(40,30,20,0.35)", 0.8);

  const dust = Math.round(12 * healthy);
  for (let i = 0; i < dust; i++) {
    const x = ((i * 51 + t * 22) % (w + 10)) - 5;
    const y = h * 0.55 + Math.sin(t * 0.8 + i) * 30 + i * 3;
    ellipse(ctx, x, y, 2, 2, "rgba(220,180,255,0.7)", 0.5);
  }
}

export function oceanScene(ctx, w, h, phase, _params, timeMs) {
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
    const y = (h - ((t * (18 + i) + i * 40) % h));
    ellipse(ctx, x, y, 2 + (i % 3), 2 + (i % 3), "rgba(200,230,240,0.55)", 0.6);
  }

  ellipse(ctx, w * 0.7, h * 0.22, 14, 14, healthy > 0.4 ? "rgba(255,240,180,0.25)" : "rgba(180,170,140,0.15)", 1);
}

export function pixelScene(ctx, w, h, phase, _params, timeMs) {
  const healthy = 1 - wilt(phase);
  const t = timeMs / 1000;
  const cell = 8;
  ctx.imageSmoothingEnabled = false;

  const sky = healthy > 0.4 ? "#5ec4e8" : "#8a9aa0";
  const ground = healthy > 0.4 ? "#3d8c4a" : "#6a5a38";
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = ground;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  ctx.fillStyle = healthy > 0.4 ? "#ffe566" : "#d0c090";
  const sun = 3 + Math.round(healthy * 2);
  ctx.fillRect(w * 0.75, h * 0.16, sun * cell, sun * cell);

  function tree(tx, scale) {
    const tw = cell * scale;
    ctx.fillStyle = healthy > 0.45 ? "#5a3a22" : "#4a4030";
    ctx.fillRect(tx, h * 0.62 - tw, cell, tw);
    ctx.fillStyle = healthy > 0.4 ? "#2f8f3a" : "#7a6a40";
    ctx.fillRect(tx - tw, h * 0.62 - tw * 2, tw * 2 + cell, tw * 1.4);
  }
  tree(w * 0.18, 3);
  tree(w * 0.42, 4);
  tree(w * 0.62, 2);

  const bits = Math.round(8 * healthy);
  for (let i = 0; i < bits; i++) {
    const x = ((i * 29 + t * 24) % w);
    const y = h * 0.3 + ((i * 17 + t * 10) % (h * 0.3));
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(x, y, 3, 3);
  }
}

export const SCENES = [
  { id: "zen", name: "Zen", draw: zenScene, blurb: "Sand, pine, and a dish that wilts with neglect." },
  { id: "cosmic", name: "Cosmic", draw: cosmicScene, blurb: "A small world under a nebula." },
  { id: "ocean", name: "Ocean", draw: oceanScene, blurb: "Kelp, light, and rising air." },
  { id: "pixel", name: "Pixel", draw: pixelScene, blurb: "An 8-bit copse." },
];
