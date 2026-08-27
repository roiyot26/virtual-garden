import { useState, useCallback } from "react";

type HoverHandlers = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

/**
 * Tracks hover state for an element.
 * Returns [isHovered, eventHandlers] to spread onto the element.
 */
export function useHover(): [boolean, HoverHandlers] {
  const [hovered, setHovered] = useState(false);

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);

  return [hovered, { onMouseEnter, onMouseLeave }];
}
