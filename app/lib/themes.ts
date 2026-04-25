/** Theme registry. Switching writes data-theme on <html> and persists. */

export const THEMES = ["dark", "light", "matrix", "hacker", "dracula"] as const;
export type ThemeName = (typeof THEMES)[number];

const STORAGE_KEY = "termfolio:theme";

export const isTheme = (s: string): s is ThemeName =>
  (THEMES as readonly string[]).includes(s);

export const applyTheme = (theme: ThemeName) => {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
};

export const loadTheme = (): ThemeName => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isTheme(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "dark";
};
