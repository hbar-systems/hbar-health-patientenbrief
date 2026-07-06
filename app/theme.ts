/**
 * Light/Dark theme. Purple accent on the "hbar.health" brand only; everything
 * else neutral, with status colours for the recall due-list (overdue / soon /
 * later). Persisted in localStorage. Mirrors the Arztbrief app's palette so the
 * whole practice-cockpit reads as one product.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "hbar-health-theme";

export function getStoredTheme(): Theme {
  try {
    if (localStorage.getItem(STORAGE_KEY) === "dark") return "dark";
  } catch {
    // fallback below
  }
  return "light";
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

export interface ThemeColors {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  brand: string;
  accent: string;
  btnBg: string;
  btnText: string;
  inputBg: string;
  navBorder: string;
  // status
  overdueBg: string;
  overdueText: string;
  soonBg: string;
  soonText: string;
  okBg: string;
  okText: string;
}

const light: ThemeColors = {
  bg: "#f8f9fa",
  card: "#ffffff",
  border: "#dee2e6",
  text: "#212529",
  muted: "#6c757d",
  brand: "#7c5cbf",
  accent: "#343a40",
  btnBg: "#343a40",
  btnText: "#ffffff",
  inputBg: "#ffffff",
  navBorder: "#dee2e6",
  overdueBg: "#fff5f5",
  overdueText: "#c92a2a",
  soonBg: "#fff9db",
  soonText: "#a67a00",
  okBg: "#ebfbee",
  okText: "#2b8a3e",
};

const dark: ThemeColors = {
  bg: "#1a1a2e",
  card: "#22223b",
  border: "#3a3a5c",
  text: "#e0e0e8",
  muted: "#9090a8",
  brand: "#a78bdb",
  accent: "#d0d0e0",
  btnBg: "#d0d0e0",
  btnText: "#1a1a2e",
  inputBg: "#2a2a45",
  navBorder: "#3a3a5c",
  overdueBg: "#3a1a1a",
  overdueText: "#ff8080",
  soonBg: "#33300f",
  soonText: "#f2d675",
  okBg: "#16301c",
  okText: "#8ce0a0",
};

export function colors(theme: Theme): ThemeColors {
  return theme === "dark" ? dark : light;
}
