function wilt(phase) {
  return Math.max(0, (phase - 1) / 4);
}

function ellipse(ctx, x, y, rx, ry, fill, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
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
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-12 + i * 6, 16 + (i % 2) * 3, 3, 1);
    }
  }
  ctx.restore();
}

function drawCompactObject(ctx, w, h, healthy) {
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
export function zenScene(ctx, w, h, phase, _params, _timeMs) {
  drawCompactObject(ctx, w, h, 1 - wilt(phase));
}
