/**
 * Command registry.
 *
 * Each command is a `{ name, description, group, hidden?, handler }` entry.
 * The handler receives `(args, ctx)` and returns lines to print (or void if
 * it prints/clears via ctx). Adding a new command = appending to COMMANDS.
 */
import {
  type Line,
  type Segment,
  blank,
  blue,
  cyan,
  dim,
  fg,
  green,
  link,
  magenta,
  pad,
  red,
  yellow,
  bold,
} from "./formatter";
import { resume, slug } from "./resume";
import resumeJson from "../data/resume.json";
import { THEMES, type ThemeName, applyTheme, isTheme } from "./themes";
import { closest } from "./suggest";

export interface CommandContext {
  print: (lines: Line[]) => void;
  clear: () => void;
  setTheme: (theme: ThemeName) => void;
  echoCommand: (cmd: string) => void;
}

export interface Command {
  name: string;
  description: string;
  group: "info" | "data" | "system" | "fun";
  hidden?: boolean;
  /** Returns lines to print, or void when it manages output via ctx. */
  handler: (args: string[], ctx: CommandContext) => Line[] | void | Promise<Line[] | void>;
}

const fmtDate = (d?: string) => (d && d.length ? d : "Present");

const sectionHeader = (title: string): Line => [
  cyan("── "),
  bold(title, "accent"),
  cyan(" " + "─".repeat(Math.max(0, 60 - title.length))),
];

const kv = (key: string, value: string): Line => [dim(pad(key, 10)), fg(value)];

// ---------- Commands ---------- //

const helpCmd: Command = {
  name: "help",
  description: "Show all available commands",
  group: "info",
  handler: () => {
    const groups: Record<string, Command[]> = {};
    for (const c of COMMANDS) {
      if (c.hidden) continue;
      (groups[c.group] ??= []).push(c);
    }
    const lines: Line[] = [
      [green("termfolio"), fg(" — type a command and press "), magenta("Enter"), fg(".")],
      [dim("Use "), magenta("Tab"), dim(" to autocomplete · "), magenta("↑/↓"), dim(" for history · "), magenta("Ctrl+L"), dim(" to clear")],
      blank(),
    ];
    const order: Command["group"][] = ["info", "data", "system", "fun"];
    const titles: Record<Command["group"], string> = {
      info: "Info",
      data: "Portfolio",
      system: "System",
      fun: "Fun",
    };
    for (const g of order) {
      if (!groups[g]) continue;
      lines.push([cyan(titles[g])]);
      for (const c of groups[g]) {
        lines.push([dim("  "), green(pad(c.name, 14)), fg(c.description)]);
      }
      lines.push(blank());
    }
    return lines;
  },
};

const aboutCmd: Command = {
  name: "about",
  description: "Who am I?",
  group: "data",
  handler: () => {
    const b = resume.basics;
    return [
      [bold(b.name, "accent"), dim("  ·  "), fg(b.label ?? "")],
      blank(),
      ...wrap(b.summary ?? "", 78).map((l) => [fg(l)] as Line),
      blank(),
      [dim("Try "), green("contact"), dim(", "), green("skills"), dim(", "), green("work"), dim(", "), green("projects"), dim(".")],
    ];
  },
};

const contactCmd: Command = {
  name: "contact",
  description: "Email, phone, and social profiles",
  group: "data",
  handler: () => {
    const b = resume.basics;
    const lines: Line[] = [];
    if (b.email) lines.push([dim(pad("email", 10)), link(b.email, `mailto:${b.email}`)]);
    if (b.phone) lines.push(kv("phone", b.phone));
    if (b.url) lines.push([dim(pad("web", 10)), link(b.url, b.url)]);
    if (b.location?.city) {
      const loc = [b.location.city, b.location.region, b.location.countryCode]
        .filter(Boolean)
        .join(", ");
      lines.push(kv("location", loc));
    }
    if (b.profiles?.length) {
      lines.push(blank());
      lines.push([cyan("profiles")]);
      for (const p of b.profiles) {
        lines.push([dim("  " + pad(p.network, 12)), link(p.url, p.url)]);
      }
    }
    return lines;
  },
};

const skillsCmd: Command = {
  name: "skills",
  description: "Skills grouped by category",
  group: "data",
  handler: () => {
    const lines: Line[] = [];
    for (const s of resume.skills ?? []) {
      lines.push([
        green(pad(s.name, 12)),
        dim(s.level ? `[${s.level}] ` : ""),
        fg(""),
      ]);
      const kws = s.keywords ?? [];
      const segs: Segment[] = [dim("  ")];
      kws.forEach((k, i) => {
        segs.push(magenta(k));
        if (i < kws.length - 1) segs.push(dim(" · "));
      });
      lines.push(segs);
      lines.push(blank());
    }
    return lines;
  },
};

const workCmd: Command = {
  name: "work",
  description: "Work experience timeline",
  group: "data",
  handler: () => {
    const lines: Line[] = [];
    for (const w of resume.work ?? []) {
      lines.push([
        bold(w.position, "accent"),
        fg(" @ "),
        green(w.name),
        dim(`  ${fmtDate(w.startDate)} → ${fmtDate(w.endDate)}`),
      ]);
      if (w.summary) {
        for (const l of wrap(w.summary, 76)) lines.push([fg("  " + l)]);
      }
      for (const h of w.highlights ?? []) {
        lines.push([cyan("  • "), fg(h)]);
      }
      if (w.url) lines.push([dim("  ↳ "), link(w.url, w.url)]);
      lines.push(blank());
    }
    return lines;
  },
};

const projectsCmd: Command = {
  name: "projects",
  description: "Side projects and open source",
  group: "data",
  handler: () => {
    const lines: Line[] = [];
    for (const p of resume.projects ?? []) {
      lines.push([green(p.name), dim("  (" + slug(p.name) + ")")]);
      if (p.description) {
        for (const l of wrap(p.description, 76)) lines.push([fg("  " + l)]);
      }
      if (p.keywords?.length) {
        const segs: Segment[] = [dim("  tags: ")];
        p.keywords.forEach((k, i) => {
          segs.push(magenta(k));
          if (i < p.keywords!.length - 1) segs.push(dim(", "));
        });
        lines.push(segs);
      }
      if (p.url) lines.push([dim("  ↳ "), link(p.url, p.url)]);
      lines.push(blank());
    }
    lines.push([dim("Tip: "), green("open <project>"), dim(" to launch a project URL.")]);
    return lines;
  },
};

const educationCmd: Command = {
  name: "education",
  description: "Education history",
  group: "data",
  handler: () => {
    const lines: Line[] = [];
    for (const e of resume.education ?? []) {
      lines.push([
        bold(`${e.studyType ?? ""} ${e.area ?? ""}`.trim(), "accent"),
        fg(" — "),
        green(e.institution),
      ]);
      lines.push([dim(`  ${fmtDate(e.startDate)} → ${fmtDate(e.endDate)}`), e.score ? dim(`  · GPA ${e.score}`) : fg("")]);
      if (e.courses?.length) {
        lines.push([dim("  courses: "), fg(e.courses.join(", "))]);
      }
      if (e.url) lines.push([dim("  ↳ "), link(e.url, e.url)]);
      lines.push(blank());
    }
    return lines;
  },
};

const certificatesCmd: Command = {
  name: "certificates",
  description: "Professional certifications",
  group: "data",
  handler: () => {
    const lines: Line[] = [];
    for (const c of resume.certificates ?? []) {
      lines.push([green(c.name)]);
      lines.push([dim("  " + (c.issuer ?? "")), c.date ? dim("  · " + c.date) : fg("")]);
      if (c.url) lines.push([dim("  ↳ "), link(c.url, c.url)]);
      lines.push(blank());
    }
    return lines;
  },
};

const languagesCmd: Command = {
  name: "languages",
  description: "Spoken languages",
  group: "data",
  handler: () => {
    return (resume.languages ?? []).map((l) => [
      green(pad(l.language, 14)),
      dim(l.fluency ?? ""),
    ]);
  },
};

const resumeCmd: Command = {
  name: "resume",
  description: "Download resume.json",
  group: "data",
  handler: () => {
    const blob = new Blob([JSON.stringify(resumeJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return [
      [green("✓ "), fg("Downloaded "), magenta("resume.json")],
      [dim("Schema: "), link("jsonresume.org/schema", "https://jsonresume.org/schema/")],
    ];
  },
};

const themeCmd: Command = {
  name: "theme",
  description: "Switch theme: dark · light · matrix · hacker · dracula",
  group: "system",
  handler: (args, ctx) => {
    if (!args[0]) {
      return [
        [fg("Available themes:")],
        ...THEMES.map(
          (t) => [dim("  · "), green(t)] as Line,
        ),
        blank(),
        [dim("Usage: "), green("theme "), magenta("<name>")],
      ];
    }
    const requested = args[0].toLowerCase();
    if (!isTheme(requested)) {
      const sug = closest(requested, [...THEMES]);
      return [
        [red(`unknown theme: ${requested}`)],
        ...(sug ? [[dim("Did you mean "), green(sug), dim("?")] as Line] : []),
      ];
    }
    ctx.setTheme(requested);
    return [[green("✓ "), fg("Theme set to "), magenta(requested)]];
  },
};

const clearCmd: Command = {
  name: "clear",
  description: "Clear the terminal",
  group: "system",
  handler: (_args, ctx) => {
    ctx.clear();
  },
};

const whoamiCmd: Command = {
  name: "whoami",
  description: "Print current user",
  group: "system",
  handler: () => [[green(resume.basics.name.toLowerCase().replace(/\s+/g, ""))]],
};

const dateCmd: Command = {
  name: "date",
  description: "Show current date and time",
  group: "system",
  handler: () => [[fg(new Date().toString())]],
};

const echoCmd: Command = {
  name: "echo",
  description: "Echo arguments",
  group: "system",
  handler: (args) => [[fg(args.join(" "))]],
};

const openCmd: Command = {
  name: "open",
  description: "Open a project URL — open <project>",
  group: "data",
  handler: (args) => {
    if (!args[0]) {
      return [[red("usage: "), fg("open <project>")]];
    }
    const target = args.join(" ").toLowerCase();
    const projects = resume.projects ?? [];
    const match =
      projects.find((p) => slug(p.name) === target) ??
      projects.find((p) => p.name.toLowerCase() === target);
    if (!match) {
      const sug = closest(
        target,
        projects.map((p) => slug(p.name)),
      );
      return [
        [red(`no project: ${target}`)],
        ...(sug ? [[dim("Did you mean "), green(sug), dim("?")] as Line] : []),
      ];
    }
    if (!match.url) return [[yellow("project has no URL")]];
    window.open(match.url, "_blank", "noopener,noreferrer");
    return [[green("✓ "), fg("Opening "), link(match.url, match.url)]];
  },
};

// ---------- Easter eggs ---------- //

const sudoCmd: Command = {
  name: "sudo",
  description: "Try with elevated privileges",
  group: "fun",
  handler: () => [
    [red("[sudo] password for guest: "), dim("********")],
    [red("Sorry, user guest is not in the sudoers file. This incident will be reported.")],
  ],
};

const rmCmd: Command = {
  name: "rm",
  description: "Remove files",
  group: "fun",
  hidden: true,
  handler: (args) => {
    if (args.join(" ").includes("-rf /")) {
      return [
        [red("nice try.")],
        [dim("(also: this is a static site, there's nothing to delete)")],
      ];
    }
    return [[fg("rm: missing operand")]];
  },
};

const matrixCmd: Command = {
  name: "matrix",
  description: "Enter the matrix",
  group: "fun",
  handler: (_args, ctx) => {
    ctx.setTheme("matrix");
    return [[green("Wake up, Neo...")], [green("The Matrix has you.")]];
  },
};

const coffeeCmd: Command = {
  name: "coffee",
  description: "Brew coffee",
  group: "fun",
  handler: () => [
    [yellow("HTTP 418: I'm a teapot.")],
    [dim("(but here's a coffee anyway ☕)")],
  ],
};

const banner = `
 ████████╗███████╗██████╗ ███╗   ███╗
 ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
    ██║   █████╗  ██████╔╝██╔████╔██║
    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
`;

const bannerCmd: Command = {
  name: "banner",
  description: "Print the ASCII banner",
  group: "fun",
  handler: () => banner.split("\n").map((l) => [green(l)] as Line),
};

export const COMMANDS: Command[] = [
  helpCmd,
  aboutCmd,
  contactCmd,
  skillsCmd,
  workCmd,
  projectsCmd,
  educationCmd,
  certificatesCmd,
  languagesCmd,
  resumeCmd,
  themeCmd,
  clearCmd,
  whoamiCmd,
  dateCmd,
  echoCmd,
  openCmd,
  bannerCmd,
  matrixCmd,
  sudoCmd,
  coffeeCmd,
  rmCmd,
];

export const COMMAND_NAMES = COMMANDS.filter((c) => !c.hidden).map((c) => c.name);

const byName = new Map(COMMANDS.map((c) => [c.name, c]));

/** Parse a raw input string into [name, ...args]. */
export const parse = (raw: string): [string, string[]] => {
  const trimmed = raw.trim();
  if (!trimmed) return ["", []];
  const parts = trimmed.split(/\s+/);
  return [parts[0].toLowerCase(), parts.slice(1)];
};

/** Run a command line. Always prints the prompt + input echo. */
export const run = async (raw: string, ctx: CommandContext): Promise<Line[]> => {
  const [name, args] = parse(raw);
  if (!name) return [];
  const cmd = byName.get(name);
  if (!cmd) {
    const sug = closest(name, COMMAND_NAMES);
    const out: Line[] = [[red(`command not found: ${name}`)]];
    if (sug) out.push([dim("Did you mean "), green(sug), dim("?")]);
    out.push([dim("Type "), green("help"), dim(" for available commands.")]);
    return out;
  }
  const result = await cmd.handler(args, ctx);
  return (result as Line[] | undefined) ?? [];
};

/** Tab autocomplete: returns possible completions for the current input. */
export const complete = (raw: string): { completion: string; matches: string[] } => {
  const trimmed = raw.replace(/^\s+/, "");
  if (!trimmed) return { completion: raw, matches: [] };
  const parts = trimmed.split(/\s+/);
  // Completing an argument to `open`
  if (parts[0] === "open" && parts.length >= 2) {
    const partial = parts.slice(1).join(" ").toLowerCase();
    const slugs = (resume.projects ?? []).map((p) => slug(p.name));
    const matches = slugs.filter((s) => s.startsWith(partial));
    if (matches.length === 1) {
      return { completion: `open ${matches[0]}`, matches };
    }
    return { completion: raw, matches };
  }
  // Completing a command name
  if (parts.length === 1) {
    const matches = COMMAND_NAMES.filter((n) => n.startsWith(parts[0].toLowerCase()));
    if (matches.length === 1) return { completion: matches[0] + " ", matches };
    if (matches.length > 1) {
      const prefix = commonPrefix(matches);
      return { completion: prefix.length > parts[0].length ? prefix : raw, matches };
    }
  }
  return { completion: raw, matches: [] };
};

const commonPrefix = (arr: string[]): string => {
  if (!arr.length) return "";
  let p = arr[0];
  for (const s of arr.slice(1)) {
    while (!s.startsWith(p)) p = p.slice(0, -1);
    if (!p) return "";
  }
  return p;
};

// ---------- Helpers ---------- //

/** Naïve word-wrap for long descriptions. */
export function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > width) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}
