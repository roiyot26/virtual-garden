import type { GardenPhase } from "../../../lib/types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  /** Whether the particle is fading out (scheduled for removal). */
  fadingOut: boolean;
}

interface ParticleState {
  particles: Particle[];
  lastTime: number;
  prevCount: number;
}

/**
 * Per-context state so multiple canvas renderers can each use floatingParticles
 * without sharing mutable state.
 */
const stateByCtx = new WeakMap<CanvasRenderingContext2D, ParticleState>();

function getState(ctx: CanvasRenderingContext2D): ParticleState {
  let state = stateByCtx.get(ctx);
  if (!state) {
    state = { particles: [], lastTime: 0, prevCount: 0 };
    stateByCtx.set(ctx, state);
  }
  return state;
}

/**
 * Floating / falling particles draw function for the canvas renderer.
 *
 * Reads the following params:
 *  - count  (number)   - target particle count
 *  - speed  (number)   - vertical speed multiplier
 *  - color  (string)   - CSS color for particles
 *  - size   (number)   - radius in px (default 3)
 */
export function floatingParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _phase: GardenPhase,
  params: Record<string, unknown>,
  timeMs: number,
): void {
  const state = getState(ctx);

  const count = typeof params.count === "number" ? params.count : 30;
  const speed = typeof params.speed === "number" ? params.speed : 1;
  const color = typeof params.color === "string" ? params.color : "#ffffff";
  const size = typeof params.size === "number" ? params.size : 3;

  // Calculate delta time in seconds
  const dt =
    state.lastTime === 0
      ? 0.016
      : Math.min((timeMs - state.lastTime) / 1000, 0.1);
  state.lastTime = timeMs;

  // --- Lazily initialise / reconcile particle count ---

  // Add particles if count increased
  while (state.particles.length < count) {
    state.particles.push(createParticle(width, height, true));
  }

  // If the target count decreased, mark excess particles for fade-out
  if (count < state.prevCount) {
    let excessToFade =
      state.particles.filter((p) => !p.fadingOut).length - count;
    for (
      let i = state.particles.length - 1;
      i >= 0 && excessToFade > 0;
      i--
    ) {
      if (!state.particles[i].fadingOut) {
        state.particles[i].fadingOut = true;
        excessToFade--;
      }
    }
  }
  state.prevCount = count;

  // --- Update and draw ---

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];

    // Move
    p.x += p.vx * speed * dt * 30;
    p.y += p.vy * speed * dt * 30;

    // Fade in / out
    if (p.fadingOut) {
      p.opacity = Math.max(0, p.opacity - dt * 2);
      if (p.opacity <= 0) {
        state.particles.splice(i, 1);
        continue;
      }
    } else if (p.opacity < 1) {
      p.opacity = Math.min(1, p.opacity + dt * 2);
    }

    // Wrap around screen edges
    if (p.y > height + size) {
      p.y = -size;
      p.x = Math.random() * width;
    }
    if (p.y < -size) {
      p.y = height + size;
      p.x = Math.random() * width;
    }
    if (p.x > width + size) {
      p.x = -size;
    }
    if (p.x < -size) {
      p.x = width + size;
    }

    // Draw
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = p.opacity;
    ctx.fill();
  }

  // Reset global alpha for subsequent draws
  ctx.globalAlpha = 1;
}

function createParticle(
  width: number,
  height: number,
  randomizeY: boolean,
): Particle {
  return {
    x: Math.random() * width,
    y: randomizeY ? Math.random() * height : -10,
    vx: (Math.random() - 0.5) * 0.5,
    vy: 0.5 + Math.random() * 1.5,
    opacity: 0,
    fadingOut: false,
  };
}

// ---------------------------------------------------------------------------
// twinklingStars — pulsing opacity stars with slight drift
// ---------------------------------------------------------------------------

interface StarParticle {
  x: number;
  y: number;
  baseOpacity: number;
  opacity: number;
  phase: number; // twinkle phase offset
  size: number;
  fadingOut: boolean;
}

interface StarState {
  stars: StarParticle[];
  lastTime: number;
  prevCount: number;
}

const starStateByCtx = new WeakMap<CanvasRenderingContext2D, StarState>();

function getStarState(ctx: CanvasRenderingContext2D): StarState {
  let state = starStateByCtx.get(ctx);
  if (!state) {
    state = { stars: [], lastTime: 0, prevCount: 0 };
    starStateByCtx.set(ctx, state);
  }
  return state;
}

export function twinklingStars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _phase: GardenPhase,
  params: Record<string, unknown>,
  timeMs: number,
): void {
  const state = getStarState(ctx);

  const count = typeof params.count === "number" ? params.count : 20;
  const speed = typeof params.speed === "number" ? params.speed : 0.1;
  const color = typeof params.color === "string" ? params.color : "#ffffff";
  const size = typeof params.size === "number" ? params.size : 2;
  const twinkleSpeed =
    typeof params.twinkleSpeed === "number" ? params.twinkleSpeed : 2;

  const dt =
    state.lastTime === 0
      ? 0.016
      : Math.min((timeMs - state.lastTime) / 1000, 0.1);
  state.lastTime = timeMs;

  // Reconcile count
  while (state.stars.length < count) {
    state.stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      baseOpacity: 0.4 + Math.random() * 0.6,
      opacity: 0,
      phase: Math.random() * Math.PI * 2,
      size: size * (0.5 + Math.random()),
      fadingOut: false,
    });
  }
  if (count < state.prevCount) {
    let excess = state.stars.filter((s) => !s.fadingOut).length - count;
    for (let i = state.stars.length - 1; i >= 0 && excess > 0; i--) {
      if (!state.stars[i].fadingOut) {
        state.stars[i].fadingOut = true;
        excess--;
      }
    }
  }
  state.prevCount = count;

  const timeSec = timeMs / 1000;

  for (let i = state.stars.length - 1; i >= 0; i--) {
    const s = state.stars[i];

    // Slight drift
    s.x += (Math.random() - 0.5) * speed * dt * 10;
    s.y += (Math.random() - 0.5) * speed * dt * 10;

    // Wrap
    if (s.x < 0) s.x = width;
    if (s.x > width) s.x = 0;
    if (s.y < 0) s.y = height;
    if (s.y > height) s.y = 0;

    // Twinkle
    const twinkle =
      0.5 + 0.5 * Math.sin(timeSec * twinkleSpeed + s.phase);

    if (s.fadingOut) {
      s.opacity = Math.max(0, s.opacity - dt * 2);
      if (s.opacity <= 0) {
        state.stars.splice(i, 1);
        continue;
      }
    } else {
      s.opacity = s.baseOpacity * twinkle;
    }

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = s.opacity;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// risingBubbles — upward-floating circles with sine wobble
// ---------------------------------------------------------------------------

interface BubbleParticle {
  x: number;
  y: number;
  baseX: number;
  wobblePhase: number;
  vy: number;
  opacity: number;
  size: number;
  fadingOut: boolean;
}

interface BubbleState {
  bubbles: BubbleParticle[];
  lastTime: number;
  prevCount: number;
}

const bubbleStateByCtx = new WeakMap<CanvasRenderingContext2D, BubbleState>();

function getBubbleState(ctx: CanvasRenderingContext2D): BubbleState {
  let state = bubbleStateByCtx.get(ctx);
  if (!state) {
    state = { bubbles: [], lastTime: 0, prevCount: 0 };
    bubbleStateByCtx.set(ctx, state);
  }
  return state;
}

function createBubble(width: number, height: number, randomizeY: boolean): BubbleParticle {
  const x = Math.random() * width;
  return {
    x,
    y: randomizeY ? Math.random() * height : height + 10,
    baseX: x,
    wobblePhase: Math.random() * Math.PI * 2,
    vy: -(0.5 + Math.random() * 1.5),
    opacity: 0,
    size: 0.5 + Math.random(),
    fadingOut: false,
  };
}

export function risingBubbles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _phase: GardenPhase,
  params: Record<string, unknown>,
  timeMs: number,
): void {
  const state = getBubbleState(ctx);

  const count = typeof params.count === "number" ? params.count : 12;
  const speed = typeof params.speed === "number" ? params.speed : 1;
  const color = typeof params.color === "string" ? params.color : "rgba(180,220,255,0.5)";
  const size = typeof params.size === "number" ? params.size : 3;

  const dt =
    state.lastTime === 0
      ? 0.016
      : Math.min((timeMs - state.lastTime) / 1000, 0.1);
  state.lastTime = timeMs;

  while (state.bubbles.length < count) {
    state.bubbles.push(createBubble(width, height, true));
  }
  if (count < state.prevCount) {
    let excess = state.bubbles.filter((b) => !b.fadingOut).length - count;
    for (let i = state.bubbles.length - 1; i >= 0 && excess > 0; i--) {
      if (!state.bubbles[i].fadingOut) {
        state.bubbles[i].fadingOut = true;
        excess--;
      }
    }
  }
  state.prevCount = count;

  const timeSec = timeMs / 1000;

  for (let i = state.bubbles.length - 1; i >= 0; i--) {
    const b = state.bubbles[i];

    // Rise upward
    b.y += b.vy * speed * dt * 30;

    // Horizontal sine wobble
    b.x = b.baseX + Math.sin(timeSec * 1.5 + b.wobblePhase) * 8;

    // Fade
    if (b.fadingOut) {
      b.opacity = Math.max(0, b.opacity - dt * 2);
      if (b.opacity <= 0) {
        state.bubbles.splice(i, 1);
        continue;
      }
    } else if (b.opacity < 1) {
      b.opacity = Math.min(1, b.opacity + dt * 2);
    }

    // Wrap — reset when reaching top
    if (b.y < -size * b.size) {
      b.y = height + size * b.size;
      b.baseX = Math.random() * width;
      b.x = b.baseX;
    }

    const r = size * b.size;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = b.opacity * 0.6;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(b.x - r * 0.25, b.y - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.globalAlpha = b.opacity * 0.4;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// pixelDust — square particles falling like blocky leaves
// ---------------------------------------------------------------------------

const pixelStateByCtx = new WeakMap<CanvasRenderingContext2D, ParticleState>();

function getPixelState(ctx: CanvasRenderingContext2D): ParticleState {
  let state = pixelStateByCtx.get(ctx);
  if (!state) {
    state = { particles: [], lastTime: 0, prevCount: 0 };
    pixelStateByCtx.set(ctx, state);
  }
  return state;
}

export function pixelDust(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _phase: GardenPhase,
  params: Record<string, unknown>,
  timeMs: number,
): void {
  const state = getPixelState(ctx);

  const count = typeof params.count === "number" ? params.count : 15;
  const speed = typeof params.speed === "number" ? params.speed : 0.8;
  const color = typeof params.color === "string" ? params.color : "#5a8c3a";
  const size = typeof params.size === "number" ? params.size : 4;

  const dt =
    state.lastTime === 0
      ? 0.016
      : Math.min((timeMs - state.lastTime) / 1000, 0.1);
  state.lastTime = timeMs;

  while (state.particles.length < count) {
    state.particles.push(createParticle(width, height, true));
  }
  if (count < state.prevCount) {
    let excess = state.particles.filter((p) => !p.fadingOut).length - count;
    for (let i = state.particles.length - 1; i >= 0 && excess > 0; i--) {
      if (!state.particles[i].fadingOut) {
        state.particles[i].fadingOut = true;
        excess--;
      }
    }
  }
  state.prevCount = count;

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];

    p.x += p.vx * speed * dt * 30;
    p.y += p.vy * speed * dt * 30;

    if (p.fadingOut) {
      p.opacity = Math.max(0, p.opacity - dt * 2);
      if (p.opacity <= 0) {
        state.particles.splice(i, 1);
        continue;
      }
    } else if (p.opacity < 1) {
      p.opacity = Math.min(1, p.opacity + dt * 2);
    }

    // Wrap
    if (p.y > height + size) {
      p.y = -size;
      p.x = Math.random() * width;
    }
    if (p.x > width + size) p.x = -size;
    if (p.x < -size) p.x = width + size;

    // Draw square (pixelated)
    const s = size;
    ctx.fillStyle = color;
    ctx.globalAlpha = p.opacity;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
  }

  ctx.globalAlpha = 1;
}
