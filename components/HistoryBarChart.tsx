import type React from "react";
import type { DailyHistoryEntry } from "@/lib/types";
import { THEME } from "@/lib/theme";

interface HistoryBarChartProps {
  /** Historical entries (oldest first). Pass up to 30. */
  entries: DailyHistoryEntry[];
  /** Today's live productive seconds (not yet in history). */
  todayProductive?: number;
  /** Today's live non-productive seconds (not yet in history). */
  todayNonProductive?: number;
  /** Shorter bars for popup mode. */
  compact?: boolean;
  /** Maximum bar pixel height. Defaults to 40 (compact) or 120 (full). */
  maxBarHeight?: number;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00"); // noon to avoid TZ issues
  return DAY_LABELS[d.getDay()];
}

function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getTodayDateStr(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function HistoryBarChart({
  entries,
  todayProductive = 0,
  todayNonProductive = 0,
  compact = false,
  maxBarHeight: maxBarHeightProp,
}: HistoryBarChartProps) {
  const maxBarHeight = maxBarHeightProp ?? (compact ? 40 : 120);
  const todayStr = getTodayDateStr();

  // Build display data: history entries + today
  type BarData = {
    date: string;
    productive: number;
    nonProductive: number;
    isToday: boolean;
    label: string;
  };

  const bars: BarData[] = entries.map((e) => ({
    date: e.date,
    productive: e.productiveSeconds,
    nonProductive: e.nonProductiveSeconds,
    isToday: false,
    label: getDayLabel(e.date),
  }));

  // Append today if not already in the entries
  const todayInHistory = bars.some((b) => b.date === todayStr);
  if (!todayInHistory) {
    bars.push({
      date: todayStr,
      productive: todayProductive,
      nonProductive: todayNonProductive,
      isToday: true,
      label: getDayLabel(todayStr),
    });
  } else {
    // Mark today
    const todayBar = bars.find((b) => b.date === todayStr);
    if (todayBar) todayBar.isToday = true;
  }

  // Find max total for normalization
  const maxTotal = Math.max(
    ...bars.map((b) => b.productive + b.nonProductive),
    1, // avoid division by zero
  );

  const barWidth = compact ? 20 : 28;
  const gap = compact ? 6 : 8;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    gap,
    height: maxBarHeight + 24, // bar + label
  };

  return (
    <div style={containerStyle}>
      {bars.map((bar) => {
        const total = bar.productive + bar.nonProductive;
        const barHeight = total > 0 ? (total / maxTotal) * maxBarHeight : 2;
        const prodRatio = total > 0 ? bar.productive / total : 0;
        const prodHeight = barHeight * prodRatio;
        const nonProdHeight = barHeight - prodHeight;

        return (
          <div
            key={bar.date}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: barWidth,
            }}
            title={
              compact
                ? undefined
                : `${bar.date}\nProductive: ${formatHours(bar.productive)}\nNon-productive: ${formatHours(bar.nonProductive)}`
            }
          >
            {/* Stacked bar */}
            <div
              style={{
                width: barWidth,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: maxBarHeight,
              }}
            >
              {/* Non-productive (top) */}
              <div
                style={{
                  width: "100%",
                  height: Math.max(nonProdHeight, 0),
                  background: THEME.colors.nonProductive,
                  borderRadius:
                    prodHeight > 0
                      ? `${THEME.radii.small}px ${THEME.radii.small}px 0 0`
                      : `${THEME.radii.small}px`,
                  opacity: total === 0 ? 0.2 : 0.85,
                  transition: "height 0.3s ease",
                }}
              />
              {/* Productive (bottom) */}
              <div
                style={{
                  width: "100%",
                  height: Math.max(prodHeight, 0),
                  background: THEME.colors.productive,
                  borderRadius:
                    nonProdHeight > 0
                      ? `0 0 ${THEME.radii.small}px ${THEME.radii.small}px`
                      : `${THEME.radii.small}px`,
                  opacity: total === 0 ? 0.2 : 1,
                  transition: "height 0.3s ease",
                }}
              />
            </div>

            {/* Day label */}
            <span
              style={{
                fontSize: compact ? 10 : 11,
                color: bar.isToday
                  ? THEME.colors.textPrimary
                  : THEME.colors.textTertiary,
                fontWeight: bar.isToday ? 700 : 400,
                marginTop: 4,
                lineHeight: 1,
              }}
            >
              {bar.label}
            </span>

            {/* Today dot indicator */}
            {bar.isToday && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: THEME.colors.accent,
                  marginTop: 2,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
