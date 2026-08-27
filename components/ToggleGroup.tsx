import { useState } from "react";
import type React from "react";
import { THEME } from "@/lib/theme";

interface ToggleGroupProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T;
  onChange: (value: T) => void;
}

export function ToggleGroup<T extends string>({
  options,
  selected,
  onChange,
}: ToggleGroupProps<T>) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const containerStyle: React.CSSProperties = {
    display: "inline-flex",
    borderRadius: THEME.radii.button,
    border: `1px solid ${THEME.colors.borderDark}`,
    overflow: "hidden",
    background: THEME.colors.white,
  };

  return (
    <div style={containerStyle}>
      {options.map((opt, i) => {
        const isSelected = opt.value === selected;
        const isHovered = hoveredIdx === i && !isSelected;

        const btnStyle: React.CSSProperties = {
          padding: "8px 16px",
          border: "none",
          borderRight:
            i < options.length - 1
              ? `1px solid ${THEME.colors.borderDark}`
              : "none",
          background: isSelected
            ? THEME.colors.textSecondary
            : isHovered
              ? THEME.colors.bgCard
              : "transparent",
          color: isSelected
            ? THEME.colors.white
            : THEME.colors.textSecondary,
          fontSize: 13,
          fontWeight: isSelected ? 600 : 400,
          cursor: "pointer",
          transition:
            "background 0.15s ease, color 0.15s ease",
          fontFamily: "inherit",
          lineHeight: 1,
        };

        return (
          <button
            key={opt.value}
            style={btnStyle}
            onClick={() => onChange(opt.value)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
