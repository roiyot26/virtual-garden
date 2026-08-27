/**
 * Pulse notification: animate a brief glow/pulse on the widget border.
 * Non-intrusive, zen aesthetic.
 */
export function showPulseNotification(container: HTMLElement): void {
  const originalBoxShadow = container.style.boxShadow;
  const originalTransition = container.style.transition;

  container.style.transition = "box-shadow 0.3s ease-in-out";
  container.style.boxShadow = `
    0 0 0 3px rgba(168, 204, 96, 0.6),
    0 0 20px rgba(168, 204, 96, 0.3),
    0 4px 20px rgba(0, 0, 0, 0.15)
  `;

  // Pulse out
  setTimeout(() => {
    container.style.boxShadow = `
      0 0 0 6px rgba(168, 204, 96, 0.3),
      0 0 30px rgba(168, 204, 96, 0.15),
      0 4px 20px rgba(0, 0, 0, 0.15)
    `;
  }, 300);

  // Restore
  setTimeout(() => {
    container.style.boxShadow = originalBoxShadow;
    // Clean up transition after animation completes
    setTimeout(() => {
      container.style.transition = originalTransition;
    }, 400);
  }, 800);
}

/**
 * Toast notification: create a small toast that appears above the widget,
 * auto-dismisses after 3 seconds. Zen-styled.
 */
export function showToastNotification(
  shadowRoot: ShadowRoot,
  message: string,
): void {
  const toast = document.createElement("div");
  toast.textContent = message;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "104px", // Just above the compact widget (80px + 16px gap + 8px spacing)
    right: "16px",
    background: "rgba(60, 55, 48, 0.92)",
    color: "#e8e0d4",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: "500",
    letterSpacing: "0.2px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
    zIndex: "2147483647",
    opacity: "0",
    transform: "translateY(8px)",
    transition: "opacity 0.3s ease, transform 0.3s ease",
    pointerEvents: "none",
    maxWidth: "260px",
    lineHeight: "1.4",
  } as Partial<CSSStyleDeclaration>);

  shadowRoot.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
  });

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";

    // Remove from DOM after fade-out
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 3000);
}
