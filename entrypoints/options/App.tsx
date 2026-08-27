import { useState, useRef, useEffect } from "react";
import type React from "react";
import { useMessage } from "@/hooks/useMessage";
import { useMutateMessage } from "@/hooks/useMutateMessage";
import type {
  StatsResponse,
  DailyHistoryResponse,
  DomainLists,
  Settings,
  ExportData,
} from "@/lib/types";
import {
  THEME,
  sectionCardStyle,
  sectionTitleStyle,
  buttonBaseStyle,
  inputBaseStyle,
} from "@/lib/theme";
import { HistoryBarChart } from "@/components/HistoryBarChart";
import { DomainListEditor } from "@/components/DomainListEditor";
import { ToggleGroup } from "@/components/ToggleGroup";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { browser } from "wxt/browser";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripToDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "");
  cleaned = cleaned.replace(/^www\./, "");
  cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0];
  return cleaned;
}

function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------------------------------------------------------------------------
// Section wrapper with staggered fade-in
// ---------------------------------------------------------------------------

function Section({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      style={{
        ...sectionCardStyle,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  // --- refresh key to re-fetch after mutations ---
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

  // --- data fetching ---
  const { data: domainLists } = useMessage<DomainLists>(
    "GET_DOMAIN_LISTS",
    undefined,
    [refreshKey],
  );

  const { data: settings } = useMessage<Settings>(
    "GET_SETTINGS",
    undefined,
    [refreshKey],
  );

  const [historyDays, setHistoryDays] = useState<7 | 30>(7);

  const { data: historyData } = useMessage<DailyHistoryResponse>(
    "GET_DAILY_HISTORY",
    { days: historyDays },
    [refreshKey, historyDays],
  );

  const { data: stats } = useMessage<StatsResponse>(
    "GET_STATS",
    undefined,
    [refreshKey],
  );

  // --- mutations ---
  const { mutate: mutateDomains } = useMutateMessage<DomainLists, void>(
    "UPDATE_DOMAIN_LISTS",
  );
  const { mutate: mutateSettings } = useMutateMessage<Partial<Settings>, void>(
    "UPDATE_SETTINGS",
  );

  // --- import / export / reset state ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<ExportData | null>(
    null,
  );
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [importError, setImportError] = useState("");

  // --- current lists from server (with local fallback) ---
  const productive = domainLists?.productive ?? [];
  const nonProductive = domainLists?.nonProductive ?? [];

  // --- domain handlers ---
  const handleAddProductive = (domain: string) => {
    const stripped = stripToDomain(domain);
    if (!stripped) return;
    const updated: DomainLists = {
      productive: [...productive, stripped],
      nonProductive: nonProductive.filter((d) => d !== stripped),
    };
    mutateDomains(updated).then(bump);
  };

  const handleRemoveProductive = (domain: string) => {
    const updated: DomainLists = {
      productive: productive.filter((d) => d !== domain),
      nonProductive,
    };
    mutateDomains(updated).then(bump);
  };

  const handleAddNonProductive = (domain: string) => {
    const stripped = stripToDomain(domain);
    if (!stripped) return;
    const updated: DomainLists = {
      productive: productive.filter((d) => d !== stripped),
      nonProductive: [...nonProductive, stripped],
    };
    mutateDomains(updated).then(bump);
  };

  const handleRemoveNonProductive = (domain: string) => {
    const updated: DomainLists = {
      productive,
      nonProductive: nonProductive.filter((d) => d !== domain),
    };
    mutateDomains(updated).then(bump);
  };

  // --- settings handlers ---
  const handleNotificationChange = (value: string) => {
    mutateSettings({ notificationLevel: value as Settings["notificationLevel"] }).then(bump);
  };

  const handlePositionChange = (value: string) => {
    mutateSettings({ widgetPosition: value as Settings["widgetPosition"] }).then(bump);
  };

  const handleWidgetEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    mutateSettings({ widgetEnabled: e.target.checked }).then(bump);
  };

  const handleAnimationBundleChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    mutateSettings({ animationBundle: e.target.value }).then(bump);
  };

  // --- export handler ---
  const handleExport = async () => {
    try {
      const data = await browser.runtime.sendMessage({
        type: "EXPORT_ALL_DATA",
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `virtual-garden-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — user sees no file downloaded
    }
  };

  // --- import handler ---
  const handleImportClick = () => {
    setImportError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as ExportData;
        if (parsed.version !== 1) {
          setImportError("Unsupported backup version.");
          return;
        }
        setPendingImportData(parsed);
        setImportConfirmOpen(true);
      } catch {
        setImportError("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
    if (!pendingImportData) return;
    try {
      await browser.runtime.sendMessage({
        type: "IMPORT_ALL_DATA",
        payload: pendingImportData,
      });
      bump();
    } catch {
      setImportError("Import failed.");
    } finally {
      setImportConfirmOpen(false);
      setPendingImportData(null);
    }
  };

  const handleImportCancel = () => {
    setImportConfirmOpen(false);
    setPendingImportData(null);
  };

  // --- reset handler ---
  const handleResetConfirm = async () => {
    try {
      await browser.runtime.sendMessage({ type: "RESET_GARDEN" });
      bump();
    } catch {
      // silently fail
    } finally {
      setResetConfirmOpen(false);
    }
  };

  // --- stats summary ---
  const historyEntries = historyData?.history ?? [];

  const summaryLine = (() => {
    if (historyEntries.length === 0) return null;

    let totalProd = 0;
    let totalNonProd = 0;
    let bestScore = -1;
    let bestDayIndex = 0;

    for (let i = 0; i < historyEntries.length; i++) {
      const entry = historyEntries[i];
      const prod = entry.productiveSeconds;
      const nonProd = entry.nonProductiveSeconds;
      totalProd += prod;
      totalNonProd += nonProd;

      const total = prod + nonProd;
      const score = total > 0 ? (prod / total) * 100 : 0;
      if (score > bestScore) {
        bestScore = score;
        bestDayIndex = i;
      }
    }

    const totalTime = totalProd + totalNonProd;
    const avgScore = totalTime > 0 ? Math.round((totalProd / totalTime) * 100) : 0;

    const bestEntry = historyEntries[bestDayIndex];
    const bestDate = new Date(bestEntry.date + "T12:00:00");
    const bestDayName = DAY_NAMES[bestDate.getDay()];

    return `Avg score: ${avgScore}% | Best day: ${bestDayName} | Total productive: ${formatSeconds(totalProd)}`;
  })();

  // --- render ---
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: THEME.colors.bg,
    fontFamily: THEME.fonts.family,
    color: THEME.colors.textPrimary,
    padding: "40px 20px",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 640,
    margin: "0 auto",
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: 32,
    borderBottom: `1px solid ${THEME.colors.border}`,
    paddingBottom: 20,
  };

  const titleStyle: React.CSSProperties = {
    margin: "0 0 8px 0",
    fontSize: 24,
    fontWeight: 600,
    color: THEME.colors.textHeading,
    letterSpacing: "0.3px",
  };

  const subtitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 15,
    color: THEME.colors.textTertiary,
    lineHeight: 1.5,
  };

  const sectionsStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: THEME.colors.textBody,
    marginBottom: 8,
    display: "block",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <h1 style={titleStyle}>Virtual Garden Settings</h1>
          <p style={subtitleStyle}>
            Configure how your garden grows and responds to your browsing
            habits.
          </p>
        </header>

        <div style={sectionsStyle}>
          {/* ----------------------------------------------------------- */}
          {/* 1. Domain Management */}
          {/* ----------------------------------------------------------- */}
          <Section index={0}>
            <h2 style={sectionTitleStyle}>Domain Management</h2>
            <div style={{ display: "flex", gap: 16 }}>
              <DomainListEditor
                title="Productive"
                domains={productive}
                accentColor={THEME.colors.productive}
                onAdd={handleAddProductive}
                onRemove={handleRemoveProductive}
              />
              <DomainListEditor
                title="Non-Productive"
                domains={nonProductive}
                accentColor={THEME.colors.nonProductive}
                onAdd={handleAddNonProductive}
                onRemove={handleRemoveNonProductive}
              />
            </div>
          </Section>

          {/* ----------------------------------------------------------- */}
          {/* 2. Notification Preference */}
          {/* ----------------------------------------------------------- */}
          <Section index={1}>
            <h2 style={sectionTitleStyle}>Notification Preference</h2>
            <span style={labelStyle}>
              Choose how the garden notifies you of phase changes.
            </span>
            <ToggleGroup
              options={[
                { value: "none", label: "None" },
                { value: "pulse", label: "Pulse" },
                { value: "toast", label: "Toast" },
              ]}
              selected={settings?.notificationLevel ?? "pulse"}
              onChange={handleNotificationChange}
            />
          </Section>

          {/* ----------------------------------------------------------- */}
          {/* 3. Widget Position */}
          {/* ----------------------------------------------------------- */}
          <Section index={2}>
            <h2 style={sectionTitleStyle}>Widget Position</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <ToggleGroup
                options={[
                  { value: "bottom-right", label: "Bottom-Right" },
                  { value: "bottom-left", label: "Bottom-Left" },
                ]}
                selected={settings?.widgetPosition ?? "bottom-right"}
                onChange={handlePositionChange}
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  color: THEME.colors.textSecondary,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={settings?.widgetEnabled ?? true}
                  onChange={handleWidgetEnabledChange}
                  style={{ accentColor: THEME.colors.accent, cursor: "pointer" }}
                />
                Widget enabled
              </label>
            </div>
          </Section>

          {/* ----------------------------------------------------------- */}
          {/* 4. Animation Bundle */}
          {/* ----------------------------------------------------------- */}
          <Section index={3}>
            <h2 style={sectionTitleStyle}>Animation Bundle</h2>
            <span style={labelStyle}>
              Select the visual theme for garden animations.
            </span>
            <select
              value={settings?.animationBundle ?? "zen-garden"}
              onChange={handleAnimationBundleChange}
              style={{
                ...inputBaseStyle,
                cursor: "pointer",
                minWidth: 180,
              }}
            >
              <option value="zen-garden">Zen Garden</option>
              <option value="pixel-forest">Pixel Forest</option>
              <option value="ocean-depths">Ocean Depths</option>
              <option value="cosmic-garden">Cosmic Garden</option>
            </select>
          </Section>

          {/* ----------------------------------------------------------- */}
          {/* 5. Stats History */}
          {/* ----------------------------------------------------------- */}
          <Section index={4}>
            <h2 style={sectionTitleStyle}>Stats History</h2>
            <div style={{ marginBottom: 12 }}>
              <ToggleGroup
                options={[
                  { value: "7", label: "Weekly" },
                  { value: "30", label: "Monthly" },
                ]}
                selected={String(historyDays)}
                onChange={(v) => setHistoryDays(Number(v) as 7 | 30)}
              />
            </div>

            <HistoryBarChart
              entries={historyEntries}
              todayProductive={stats?.today.productiveSeconds ?? 0}
              todayNonProductive={stats?.today.nonProductiveSeconds ?? 0}
            />

            {summaryLine && (
              <p
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  fontSize: 13,
                  color: THEME.colors.textBody,
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                {summaryLine}
              </p>
            )}
          </Section>

          {/* ----------------------------------------------------------- */}
          {/* 6. Import / Export */}
          {/* ----------------------------------------------------------- */}
          <Section index={5}>
            <h2 style={sectionTitleStyle}>Import / Export</h2>
            <span style={labelStyle}>
              Back up your garden data or restore from a previous backup.
            </span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                style={{
                  ...buttonBaseStyle,
                  background: THEME.colors.textSecondary,
                  color: THEME.colors.white,
                  borderColor: THEME.colors.textSecondary,
                }}
                onClick={handleExport}
              >
                Export Data
              </button>
              <button style={buttonBaseStyle} onClick={handleImportClick}>
                Import Data
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            {importError && (
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  fontSize: 13,
                  color: THEME.colors.nonProductive,
                }}
              >
                {importError}
              </p>
            )}
          </Section>

          {/* ----------------------------------------------------------- */}
          {/* 7. Reset Garden */}
          {/* ----------------------------------------------------------- */}
          <Section index={6}>
            <h2
              style={{
                ...sectionTitleStyle,
                color: THEME.colors.danger,
              }}
            >
              Reset Garden
            </h2>
            <span style={labelStyle}>
              Permanently erase all garden data and start from scratch. This
              cannot be undone.
            </span>
            <button
              style={{
                ...buttonBaseStyle,
                background: THEME.colors.dangerBg,
                color: THEME.colors.danger,
                borderColor: THEME.colors.dangerBorder,
              }}
              onClick={() => setResetConfirmOpen(true)}
            >
              Reset Garden
            </button>
          </Section>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Dialogs */}
      {/* ----------------------------------------------------------------- */}
      <ConfirmDialog
        open={importConfirmOpen}
        title="Import Backup"
        message="This will overwrite all current garden data with the imported backup. Are you sure?"
        confirmLabel="Import"
        onConfirm={handleImportConfirm}
        onCancel={handleImportCancel}
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset Garden"
        message="This will permanently erase all your garden data, history, and settings. This action cannot be undone."
        confirmLabel="Reset Everything"
        danger
        onConfirm={handleResetConfirm}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
