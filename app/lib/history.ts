/** Persistent command history (most-recent-last). */
const KEY = "termfolio:history";
const MAX = 200;

export const loadHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

export const saveHistory = (history: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(history.slice(-MAX)));
  } catch {
    /* ignore */
  }
};
