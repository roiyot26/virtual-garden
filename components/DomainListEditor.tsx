import { useState } from "react";
import type React from "react";
import { THEME, inputBaseStyle, buttonBaseStyle } from "@/lib/theme";

interface DomainListEditorProps {
  title: string;
  domains: string[];
  accentColor: string;
  onAdd: (domain: string) => void;
  onRemove: (domain: string) => void;
}

/**
 * Strips a pasted URL or domain down to the bare hostname.
 * e.g. "https://www.github.com/foo" → "github.com"
 */
function normalizeDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();

  // Strip protocol
  cleaned = cleaned.replace(/^https?:\/\//, "");
  // Strip www.
  cleaned = cleaned.replace(/^www\./, "");
  // Strip path and query
  cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0];

  return cleaned;
}

export function DomainListEditor({
  title,
  domains,
  accentColor,
  onAdd,
  onRemove,
}: DomainListEditorProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const domain = normalizeDomain(input);
    if (!domain) {
      setError("Enter a domain");
      return;
    }
    if (!domain.includes(".")) {
      setError("Invalid domain");
      return;
    }
    if (domains.includes(domain)) {
      setError("Already in list");
      return;
    }
    setError("");
    setInput("");
    onAdd(domain);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const containerStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const headerStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: accentColor,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const inputRowStyle: React.CSSProperties = {
    display: "flex",
    gap: 6,
    marginBottom: 8,
  };

  const listStyle: React.CSSProperties = {
    maxHeight: 200,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };

  const itemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 10px",
    background: THEME.colors.white,
    borderRadius: THEME.radii.small,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    border: `1px solid ${THEME.colors.border}`,
  };

  const removeBtnStyle: React.CSSProperties = {
    border: "none",
    background: "transparent",
    color: THEME.colors.textMuted,
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    padding: "0 2px",
    transition: "color 0.15s ease",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accentColor,
            display: "inline-block",
          }}
        />
        {title}
        <span
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: THEME.colors.textTertiary,
            marginLeft: "auto",
          }}
        >
          {domains.length}
        </span>
      </div>

      <div style={inputRowStyle}>
        <input
          style={{ ...inputBaseStyle, flex: 1, minWidth: 0 }}
          placeholder="example.com"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          style={{
            ...buttonBaseStyle,
            padding: "8px 12px",
            fontSize: 13,
            background: accentColor,
            color: THEME.colors.white,
            borderColor: accentColor,
          }}
          onClick={handleAdd}
        >
          Add
        </button>
      </div>

      {error && (
        <p
          style={{
            fontSize: 12,
            color: THEME.colors.nonProductive,
            margin: "0 0 6px 0",
          }}
        >
          {error}
        </p>
      )}

      <div style={listStyle}>
        {domains.length === 0 && (
          <p
            style={{
              fontSize: 13,
              color: THEME.colors.textMuted,
              fontStyle: "italic",
              padding: "8px 0",
              textAlign: "center",
            }}
          >
            No domains yet
          </p>
        )}
        {domains.map((domain) => (
          <div key={domain} style={itemStyle}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {domain}
            </span>
            <button
              style={removeBtnStyle}
              onClick={() => onRemove(domain)}
              title={`Remove ${domain}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
