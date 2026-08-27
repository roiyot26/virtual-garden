export function getWidgetStyles(): string {
  return `
    /* === CSS Reset on host === */
    :host {
      all: initial;
      display: block;
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.4;
      pointer-events: none;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* === Container === */
    .garden-container {
      pointer-events: auto;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1);
      cursor: default;
      user-select: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition:
        width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        background-color 0.8s ease,
        box-shadow 0.8s ease;
      position: relative;
    }

    /* === Compact mode === */
    .garden-container.compact {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: transparent;
      box-shadow: 0 8px 18px rgba(40, 30, 20, 0.22);
    }

    /* === Expanded mode === */
    .garden-container.expanded {
      width: 300px;
      height: 200px;
    }

    /* === Garden display (emoji placeholder) === */
    .garden-display {
      font-size: 32px;
      line-height: 1;
      transition: font-size 0.35s ease;
    }

    .garden-container.expanded .garden-display {
      font-size: 56px;
    }

    /* === Phase label === */
    .phase-label {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-top: 8px;
      opacity: 0.85;
      transition: opacity 0.3s ease;
    }

    /* === Toggle button === */
    .toggle-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 22px;
      height: 22px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      color: rgba(0, 0, 0, 0.5);
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        background 0.2s ease,
        opacity 0.2s ease;
      opacity: 0;
      pointer-events: auto;
      line-height: 1;
      padding: 0;
    }

    .garden-container:hover .toggle-btn {
      opacity: 1;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.45);
    }

    /* ==============================
       Phase-specific color schemes
       ============================== */

    /* --- Thriving: warm golden --- */
    .garden-container.phase-thriving {
      background: linear-gradient(135deg, #f6d365 0%, #b8d86b 50%, #a8cc60 100%);
      box-shadow:
        0 4px 20px rgba(182, 196, 80, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.2),
        0 0 30px rgba(246, 211, 101, 0.15);
      animation: thriving-glow 3s ease-in-out infinite alternate;
    }

    .phase-thriving .phase-label {
      color: #3d5a00;
    }

    @keyframes thriving-glow {
      0% {
        box-shadow:
          0 4px 20px rgba(182, 196, 80, 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.2),
          0 0 30px rgba(246, 211, 101, 0.15);
      }
      100% {
        box-shadow:
          0 4px 24px rgba(182, 196, 80, 0.45),
          0 0 0 1px rgba(255, 255, 255, 0.3),
          0 0 40px rgba(246, 211, 101, 0.25);
      }
    }

    /* --- Serene: calm green/sand --- */
    .garden-container.phase-serene {
      background: linear-gradient(135deg, #e8d5b7 0%, #a8c69f 50%, #8bb88a 100%);
      box-shadow:
        0 4px 20px rgba(139, 184, 138, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.15);
    }

    .phase-serene .phase-label {
      color: #3b5e3a;
    }

    /* --- Neutral: muted grey-beige --- */
    .garden-container.phase-neutral {
      background: linear-gradient(135deg, #d5cfc0 0%, #bfb9a8 50%, #aca694 100%);
      box-shadow:
        0 4px 20px rgba(172, 166, 148, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    .phase-neutral .phase-label {
      color: #5a5549;
    }

    /* --- Unsettled: darker grey with red tint --- */
    .garden-container.phase-unsettled {
      background: linear-gradient(135deg, #b0a8a0 0%, #8c8078 50%, #7a6e6a 100%);
      box-shadow:
        0 4px 20px rgba(140, 100, 90, 0.25),
        0 0 0 1px rgba(180, 120, 110, 0.15);
    }

    .phase-unsettled .phase-label {
      color: #e8d5cc;
    }

    .phase-unsettled .garden-display {
      opacity: 0.8;
    }

    /* --- Neglected: dark stormy grey-purple --- */
    .garden-container.phase-neglected {
      background: linear-gradient(135deg, #6b6278 0%, #4e4558 50%, #3c3448 100%);
      box-shadow:
        0 4px 20px rgba(60, 52, 72, 0.35),
        0 0 0 1px rgba(100, 80, 120, 0.15);
    }

    .phase-neglected .phase-label {
      color: #b8b0c4;
    }

    .phase-neglected .garden-display {
      opacity: 0.6;
    }

    .garden-container.compact.phase-thriving,
    .garden-container.compact.phase-serene,
    .garden-container.compact.phase-neutral,
    .garden-container.compact.phase-unsettled,
    .garden-container.compact.phase-neglected {
      background: transparent;
      animation: none;
      box-shadow: 0 8px 18px rgba(40, 30, 20, 0.22);
    }
  `;
}
