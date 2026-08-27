import type React from "react";
import { THEME, buttonBaseStyle } from "@/lib/theme";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.35)",
    backdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    animation: "fadeIn 0.15s ease",
  };

  const dialogStyle: React.CSSProperties = {
    background: THEME.colors.bg,
    borderRadius: THEME.radii.card,
    padding: "24px",
    maxWidth: 380,
    width: "90%",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
    border: `1px solid ${THEME.colors.border}`,
  };

  const titleStyle: React.CSSProperties = {
    margin: "0 0 8px 0",
    fontSize: 16,
    fontWeight: 600,
    color: danger ? THEME.colors.danger : THEME.colors.textHeading,
  };

  const messageStyle: React.CSSProperties = {
    margin: "0 0 20px 0",
    fontSize: 14,
    lineHeight: 1.5,
    color: THEME.colors.textBody,
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  };

  const confirmBtnStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: danger ? THEME.colors.danger : THEME.colors.textSecondary,
    color: THEME.colors.white,
    borderColor: danger ? THEME.colors.danger : THEME.colors.textSecondary,
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={messageStyle}>{message}</p>
        <div style={actionsStyle}>
          <button style={buttonBaseStyle} onClick={onCancel}>
            Cancel
          </button>
          <button style={confirmBtnStyle} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
