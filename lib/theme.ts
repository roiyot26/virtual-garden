import type React from "react";
import { GardenPhase } from "./types";

export const THEME = {
  colors: {
    bg: "#faf8f4",
    bgCard: "#f0ece4",
    border: "#e8e0d4",
    borderDark: "#d5cfc0",
    textPrimary: "#3c3732",
    textHeading: "#2c2820",
    textSecondary: "#5a5549",
    textTertiary: "#8a8278",
    textMuted: "#a89e90",
    textBody: "#6a6358",
    productive: "#6b9a5b",
    nonProductive: "#c45c4a",
    accent: "#7a8f5c",
    danger: "#b34040",
    dangerBg: "#fdf2f2",
    dangerBorder: "#e0b0b0",
    white: "#ffffff",
  },
  fonts: {
    family:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  radii: {
    card: 12,
    button: 8,
    small: 6,
  },
} as const;

export const PHASE_GRADIENTS: Record<GardenPhase, string> = {
  [GardenPhase.Thriving]:
    "linear-gradient(135deg, #f6d365, #b8d86b, #a8cc60)",
  [GardenPhase.Serene]:
    "linear-gradient(135deg, #e8d5b7, #a8c69f, #8bb88a)",
  [GardenPhase.Neutral]:
    "linear-gradient(135deg, #d5cfc0, #c0b9aa, #aca694)",
  [GardenPhase.Unsettled]:
    "linear-gradient(135deg, #b0a8a0, #968a82, #7a6e6a)",
  [GardenPhase.Neglected]:
    "linear-gradient(135deg, #6b6278, #524960, #3c3448)",
};

export const PHASE_TEXT_COLORS: Record<GardenPhase, string> = {
  [GardenPhase.Thriving]: "#3d5a00",
  [GardenPhase.Serene]: "#3b5e3a",
  [GardenPhase.Neutral]: "#5a5549",
  [GardenPhase.Unsettled]: "#e8d5cc",
  [GardenPhase.Neglected]: "#b8b0c4",
};

// --- Shared style fragments ---

export const sectionCardStyle: React.CSSProperties = {
  background: THEME.colors.bgCard,
  borderRadius: THEME.radii.card,
  padding: "20px",
  border: `1px solid ${THEME.colors.border}`,
};

export const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 12px 0",
  fontSize: 13,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  color: THEME.colors.textTertiary,
};

export const buttonBaseStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: `1px solid ${THEME.colors.borderDark}`,
  borderRadius: THEME.radii.button,
  background: "transparent",
  color: THEME.colors.textSecondary,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
  fontFamily: "inherit",
};

export const inputBaseStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: `1px solid ${THEME.colors.borderDark}`,
  borderRadius: THEME.radii.small,
  background: THEME.colors.white,
  color: THEME.colors.textPrimary,
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s ease",
};
