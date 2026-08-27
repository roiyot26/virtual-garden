export interface AnimationAdapter {
  initialize(container: HTMLElement): Promise<void>;
  setPhase(phase: 1 | 2 | 3 | 4 | 5): void;
  setExpanded(expanded: boolean): void;
  cleanup(): void;
}

/**
 * Placeholder adapter using simple CSS-based phase visualization.
 * This will be replaced with a real animation engine (Canvas/WebGL)
 * once one is chosen.
 */
export class PlaceholderAdapter implements AnimationAdapter {
  private container: HTMLElement | null = null;
  private phaseOverlay: HTMLElement | null = null;

  private static readonly PHASE_COLORS: Record<number, string> = {
    1: "linear-gradient(135deg, #f6d365, #a8cc60)", // Thriving
    2: "linear-gradient(135deg, #e8d5b7, #8bb88a)", // Serene
    3: "linear-gradient(135deg, #d5cfc0, #aca694)", // Neutral
    4: "linear-gradient(135deg, #b0a8a0, #7a6e6a)", // Unsettled
    5: "linear-gradient(135deg, #6b6278, #3c3448)", // Neglected
  };

  private static readonly PHASE_EMOJIS: Record<number, string> = {
    1: "\u{1F33B}", // sunflower
    2: "\u{1F33F}", // herb
    3: "\u{1F331}", // seedling
    4: "\u{1F342}", // fallen leaf
    5: "\u{1FAA8}", // rock
  };

  async initialize(container: HTMLElement): Promise<void> {
    this.container = container;

    // Create overlay element for phase visualization
    this.phaseOverlay = document.createElement("div");
    this.phaseOverlay.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      border-radius: inherit;
      transition: background 0.8s ease, opacity 0.5s ease;
    `;

    this.container.style.position = "relative";
    this.container.appendChild(this.phaseOverlay);

    // Start at neutral
    this.setPhase(3);
  }

  setPhase(phase: 1 | 2 | 3 | 4 | 5): void {
    if (!this.phaseOverlay) return;

    const bg = PlaceholderAdapter.PHASE_COLORS[phase] ?? PlaceholderAdapter.PHASE_COLORS[3];
    const emoji = PlaceholderAdapter.PHASE_EMOJIS[phase] ?? PlaceholderAdapter.PHASE_EMOJIS[3];

    this.phaseOverlay.style.background = bg;
    this.phaseOverlay.textContent = emoji;
  }

  setExpanded(expanded: boolean): void {
    if (!this.phaseOverlay) return;
    this.phaseOverlay.style.fontSize = expanded ? "56px" : "36px";
  }

  cleanup(): void {
    if (this.phaseOverlay && this.container) {
      this.container.removeChild(this.phaseOverlay);
    }
    this.phaseOverlay = null;
    this.container = null;
  }
}
