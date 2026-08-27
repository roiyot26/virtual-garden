import { useState, useEffect, useMemo } from "react";
import { browser } from "wxt/browser";
import { GardenPhase } from "@/lib/types";
import type { StatsResponse, DailyHistoryResponse } from "@/lib/types";
import { useMessage } from "@/hooks/useMessage";
import { THEME, PHASE_GRADIENTS, PHASE_TEXT_COLORS } from "@/lib/theme";
import { HistoryBarChart } from "@/components/HistoryBarChart";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PHASE_NAMES: Record<GardenPhase, string> = {
  [GardenPhase.Thriving]: "Thriving",
  [GardenPhase.Serene]: "Serene",
  [GardenPhase.Neutral]: "Neutral",
  [GardenPhase.Unsettled]: "Unsettled",
  [GardenPhase.Neglected]: "Neglected",
};

const PHASE_EMOJIS: Record<GardenPhase, string> = {
  [GardenPhase.Thriving]: "\u{1F33B}",
  [GardenPhase.Serene]: "\u{1F33F}",
  [GardenPhase.Neutral]: "\u{1F331}",
  [GardenPhase.Unsettled]: "\u{1F342}",
  [GardenPhase.Neglected]: "\u{1FAA8}",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number): string {
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function App() {
  const { data: stats, loading: statsLoading } =
    useMessage<StatsResponse>("GET_STATS");
  const { data: historyData, loading: historyLoading } =
    useMessage<DailyHistoryResponse>("GET_DAILY_HISTORY");

  // Fade-in on mount
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Defer to next frame so the initial opacity:0 paints first
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const loading = statsLoading || historyLoading;

  const phase = stats?.today.phase ?? GardenPhase.Neutral;
  const phaseName = PHASE_NAMES[phase];
  const phaseEmoji = PHASE_EMOJIS[phase];
  const score = stats?.today.score ?? 0;
  const productiveSeconds = stats?.today.productiveSeconds ?? 0;
  const nonProductiveSeconds = stats?.today.nonProductiveSeconds ?? 0;
  const streakDays = stats?.streak?.currentDays ?? 0;

  // Build last-6-days history for the weekly chart (excluding today)
  const last6Entries = useMemo(() => {
    if (!historyData?.history) return [];
    const today = getTodayDateStr();
    const past = historyData.history.filter((e) => e.date !== today);
    return past.slice(-6);
  }, [historyData]);

  return (
    <div
      style={{
        ...s.container,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {loading ? (
        <div style={s.loading}>Loading...</div>
      ) : (
        <>
          {/* ── Garden visualization ── */}
          <div
            style={{
              ...s.gardenViz,
              background: PHASE_GRADIENTS[phase],
              transition: "background 0.8s ease",
            }}
          >
            <span style={s.gardenEmoji}>{phaseEmoji}</span>
            <p style={{ ...s.gardenText, color: PHASE_TEXT_COLORS[phase] }}>
              Your garden is <strong>{phaseName}</strong>
            </p>
          </div>

          {/* ── Stats card ── */}
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Today</h2>

            {/* Time rows */}
            <div style={s.statRow}>
              <span style={s.statLabel}>Productive</span>
              <span style={{ ...s.statValue, color: THEME.colors.productive }}>
                {formatTime(productiveSeconds)}
              </span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Non-productive</span>
              <span
                style={{ ...s.statValue, color: THEME.colors.nonProductive }}
              >
                {formatTime(nonProductiveSeconds)}
              </span>
            </div>

            {/* Score bar */}
            <div style={{ ...s.statRow, marginTop: 6 }}>
              <span style={s.statLabel}>Score</span>
              <span style={s.statValue}>{Math.round(score)}%</span>
            </div>
            <div style={s.scoreBarTrack}>
              <div
                style={{
                  ...s.scoreBarFill,
                  width: `${Math.min(Math.max(score, 0), 100)}%`,
                }}
              />
            </div>

            {/* Streak */}
            {streakDays > 0 && (
              <div style={{ ...s.statRow, marginTop: 6 }}>
                <span style={s.statLabel}>
                  Streak{" "}
                  <span role="img" aria-label="fire">
                    {"\uD83D\uDD25"}
                  </span>
                </span>
                <span style={s.statValue}>
                  {streakDays} day{streakDays !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* ── Weekly chart ── */}
          <div style={s.card}>
            <h2 style={s.sectionTitle}>This Week</h2>
            <HistoryBarChart
              entries={last6Entries}
              todayProductive={productiveSeconds}
              todayNonProductive={nonProductiveSeconds}
              compact
            />
          </div>

          {/* ── Settings button ── */}
          <button
            style={s.settingsBtn}
            onClick={() => browser.runtime.openOptionsPage()}
            onMouseEnter={(e) => {
              (e.currentTarget.style.background = THEME.colors.bgCard);
              e.currentTarget.style.color = THEME.colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = THEME.colors.textSecondary;
            }}
          >
            Settings
          </button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s: Record<string, React.CSSProperties> = {
  container: {
    width: 320,
    fontFamily: THEME.fonts.family,
    background: THEME.colors.bg,
    color: THEME.colors.textPrimary,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  loading: {
    textAlign: "center",
    padding: "48px 0",
    color: THEME.colors.textTertiary,
    fontSize: 14,
  },

  // Garden visualization
  gardenViz: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 160,
    padding: "0 20px",
  },
  gardenEmoji: {
    fontSize: 48,
    lineHeight: 1,
    display: "block",
    marginBottom: 10,
  },
  gardenText: {
    margin: 0,
    fontSize: 15,
    fontWeight: 400,
    letterSpacing: "0.2px",
  },

  // Shared card
  card: {
    background: THEME.colors.bgCard,
    borderRadius: 0,
    padding: "14px 20px",
    borderTop: `1px solid ${THEME.colors.border}`,
  },
  sectionTitle: {
    margin: "0 0 10px 0",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: THEME.colors.textTertiary,
  },

  // Stat rows
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "3px 0",
  },
  statLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 600,
    color: THEME.colors.textPrimary,
  },

  // Score bar
  scoreBarTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    background: THEME.colors.border,
    marginTop: 4,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 2,
    background: THEME.colors.accent,
    transition: "width 0.5s ease",
  },

  // Settings button
  settingsBtn: {
    width: "100%",
    padding: "12px 20px",
    border: "none",
    borderTop: `1px solid ${THEME.colors.border}`,
    background: "transparent",
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s ease, color 0.15s ease",
    fontFamily: "inherit",
  },
};
