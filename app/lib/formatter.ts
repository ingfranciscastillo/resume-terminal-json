/**
 * Tiny ANSI-like formatter.
 *
 * Each line of terminal output is an array of `Segment`s. A segment carries a
 * color token (mapped to a CSS variable) plus optional bold/dim/link styling.
 * The TerminalLine component renders these into <span>/<a> elements.
 */

export type Color =
  | "fg"
  | "prompt"
  | "user"
  | "path"
  | "link"
  | "warn"
  | "error"
  | "dim"
  | "key"
  | "accent";

export interface Segment {
  text: string;
  color?: Color;
  bold?: boolean;
  href?: string;
}

export type Line = Segment[];

const seg = (color: Color, bold = false) =>
  (text: string, more?: Partial<Segment>): Segment => ({ text, color, bold, ...more });

export const fg = seg("fg");
export const dim = seg("dim");
export const green = seg("prompt");
export const cyan = seg("accent");
export const yellow = seg("warn");
export const red = seg("error");
export const magenta = seg("key");
export const blue = seg("link");
export const bold = (text: string, color: Color = "fg"): Segment => ({ text, color, bold: true });

export const link = (label: string, url: string): Segment => ({
  text: label,
  color: "link",
  href: url,
});

export const space = (n = 1): Segment => ({ text: " ".repeat(n), color: "fg" });

/** Plain-text line shortcut. */
export const t = (text: string, color: Color = "fg"): Line => [{ text, color }];

/** Empty blank line. */
export const blank = (): Line => [{ text: "", color: "fg" }];

/** Pad a string to width using monospace spaces. */
export const pad = (s: string, w: number) => {
  if (s.length >= w) return s;
  return s + " ".repeat(w - s.length);
};
