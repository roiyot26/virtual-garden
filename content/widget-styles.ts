export function getWidgetStyles(width: number, height: number): string {
  return `
    :host {
      display: block;
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: ${width}px;
      height: ${height}px;
      z-index: 2147483647;
      pointer-events: none;
      background: transparent;
      border-radius: 18px;
    }

    canvas {
      display: block;
      width: ${width}px;
      height: ${height}px;
      background: transparent;
    }
  `;
}
