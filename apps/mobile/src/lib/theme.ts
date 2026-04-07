export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceAlt: string;
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textOnSurface: string;
  textOnAccent: string;
  // Brand
  accent: string;
  accentSecondary: string;
  // Borders
  border: string;
  borderLight: string;
  // Semantic
  danger: string;
  dangerBg: string;
  // Status badges
  successBg: string;
  successText: string;
  warningBg: string;
  warningText: string;
  failedBg: string;
  failedText: string;
  // Tip / offline banner
  tipBg: string;
  tipBorder: string;
  tipText: string;
  tipTitle: string;
  // Navigation
  headerBg: string;
  headerText: string;
  tabBg: string;
  tabBorder: string;
  tabActive: string;
  tabInactive: string;
  // Inputs
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  // Misc
  skeleton: string;
  overlay: string;
}

export const lightTheme: ThemeColors = {
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceAlt: "#0f172a",
  text: "#0f172a",
  textSecondary: "#475569",
  textTertiary: "#94a3b8",
  textOnSurface: "#ffffff",
  textOnAccent: "#ffffff",
  accent: "#f97316",
  accentSecondary: "#0f766e",
  border: "#cbd5e1",
  borderLight: "#e2e8f0",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  successBg: "#dcfce7",
  successText: "#0f766e",
  warningBg: "#fef3c7",
  warningText: "#92400e",
  failedBg: "#fee2e2",
  failedText: "#dc2626",
  tipBg: "#fffbeb",
  tipBorder: "#fde68a",
  tipText: "#b45309",
  tipTitle: "#92400e",
  headerBg: "#0f172a",
  headerText: "#ffffff",
  tabBg: "#ffffff",
  tabBorder: "#e2e8f0",
  tabActive: "#f97316",
  tabInactive: "#94a3b8",
  inputBg: "#ffffff",
  inputBorder: "#cbd5e1",
  inputText: "#0f172a",
  placeholder: "#94a3b8",
  skeleton: "#e2e8f0",
  overlay: "rgba(15,23,42,0.68)",
};

export const darkTheme: ThemeColors = {
  background: "#0f172a",
  surface: "#1e293b",
  surfaceAlt: "#334155",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  textTertiary: "#64748b",
  textOnSurface: "#f1f5f9",
  textOnAccent: "#ffffff",
  accent: "#fb923c",
  accentSecondary: "#2dd4bf",
  border: "#334155",
  borderLight: "#1e293b",
  danger: "#f87171",
  dangerBg: "#451a1a",
  successBg: "#14532d",
  successText: "#4ade80",
  warningBg: "#451a03",
  warningText: "#fbbf24",
  failedBg: "#451a1a",
  failedText: "#f87171",
  tipBg: "#1c1917",
  tipBorder: "#44403c",
  tipText: "#d6d3d1",
  tipTitle: "#fbbf24",
  headerBg: "#0f172a",
  headerText: "#f1f5f9",
  tabBg: "#1e293b",
  tabBorder: "#334155",
  tabActive: "#fb923c",
  tabInactive: "#64748b",
  inputBg: "#1e293b",
  inputBorder: "#334155",
  inputText: "#f1f5f9",
  placeholder: "#64748b",
  skeleton: "#334155",
  overlay: "rgba(0,0,0,0.72)",
};

// Legacy export for backward compatibility during migration
export const colors = {
  ink: "#0f172a",
  mist: "#f8fafc",
  ember: "#f97316",
  tide: "#0f766e",
  fog: "#cbd5e1",
  white: "#ffffff",
  danger: "#dc2626",
};
