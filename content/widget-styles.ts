export function getWidgetStyles(): string {
  return `
    :host {
      display: block;
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: 80px;
      height: 80px;
      z-index: 2147483647;
      pointer-events: none;
      background: transparent;
    }

    canvas {
      display: block;
      width: 80px;
      height: 80px;
      background: transparent;
    }
  `;
}
