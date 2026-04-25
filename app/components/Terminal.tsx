/**
 * Terminal — main interactive component.
 *
 * - Captures keystrokes via a single hidden <input> (so paste/IME/mobile
 *   keyboards all work correctly).
 * - Maintains output buffer of pre-rendered lines.
 * - History via ↑/↓, autocomplete via Tab, clear via Ctrl+L.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TerminalLine } from "./TerminalLine";
import { BootSequence } from "./BootSequence";
import {
  COMMAND_NAMES,
  type CommandContext,
  complete,
  run,
} from "../lib/commands";
import {
  type Line,
  blank,
  dim,
  green,
  magenta,
  fg,
  cyan,
} from "../lib/formatter";
import { resume } from "../lib/resume";
import { type ThemeName, applyTheme, loadTheme } from "../lib/themes";
import { loadHistory, saveHistory } from "../lib/history";

const PROMPT_USER = "guest";
const PROMPT_HOST = "portfolio";
const PROMPT_PATH = "~";

const promptLine = (input: string, withCursor = false): Line => {
  const segs: Line = [
    { text: PROMPT_USER, color: "user", bold: true },
    { text: "@", color: "dim" },
    { text: PROMPT_HOST, color: "prompt", bold: true },
    { text: ":", color: "dim" },
    { text: PROMPT_PATH, color: "path" },
    { text: "$ ", color: "dim" },
    { text: input, color: "fg" },
  ];
  // cursor is rendered separately
  return segs;
};

interface OutputItem {
  id: number;
  line: Line;
}

let nextId = 0;
const newId = () => ++nextId;

export const Terminal = () => {
  const [output, setOutput] = useState<OutputItem[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [booting, setBooting] = useState(true);
  const [theme, setThemeState] = useState<ThemeName>("dark");

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Apply persisted theme on mount.
  useEffect(() => {
    const t = loadTheme();
    applyTheme(t);
    setThemeState(t);
  }, []);

  // Auto-scroll on new output.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [output, booting]);

  const focusInput = useCallback(() => {
    // Don't steal focus while user is selecting text.
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) return;
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, booting]);

  const print = useCallback((lines: Line[]) => {
    if (!lines.length) return;
    setOutput((prev) => [
      ...prev,
      ...lines.map((line) => ({ id: newId(), line })),
    ]);
  }, []);

  const clear = useCallback(() => setOutput([]), []);

  const setTheme = useCallback((t: ThemeName) => {
    applyTheme(t);
    setThemeState(t);
  }, []);

  const ctx: CommandContext = useMemo(
    () => ({
      print,
      clear,
      setTheme,
      echoCommand: () => undefined,
    }),
    [print, clear, setTheme],
  );

  const submit = useCallback(
    async (raw: string) => {
      // Echo prompt + input as a frozen line.
      print([promptLine(raw)]);
      const trimmed = raw.trim();
      if (trimmed) {
        const next = [...history.filter((h) => h !== trimmed), trimmed];
        setHistory(next);
        saveHistory(next);
      }
      const lines = await run(raw, ctx);
      if (lines.length) print(lines);
    },
    [ctx, history, print],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+L → clear
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      clear();
      return;
    }
    // Ctrl+C → cancel current line
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      print([promptLine(input + "^C")]);
      setInput("");
      setHistIndex(null);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input;
      setInput("");
      setHistIndex(null);
      setDraft("");
      void submit(value);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const { completion, matches } = complete(input);
      if (matches.length > 1 && completion === input) {
        // Show available completions.
        print([promptLine(input)]);
        print([[dim(matches.join("   "))]]);
      } else {
        setInput(completion);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const idx =
        histIndex === null ? history.length - 1 : Math.max(0, histIndex - 1);
      if (histIndex === null) setDraft(input);
      setHistIndex(idx);
      setInput(history[idx]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex === null) return;
      const idx = histIndex + 1;
      if (idx >= history.length) {
        setHistIndex(null);
        setInput(draft);
      } else {
        setHistIndex(idx);
        setInput(history[idx]);
      }
      return;
    }
  };

  const onBootDone = useCallback(() => {
    setBooting(false);
    print([
      blank(),
      [
        green("Welcome, "),
        { text: resume.basics.name, color: "accent", bold: true },
        fg("."),
      ],
      [
        dim("Type "),
        green("help"),
        dim(" to see what's available, or try "),
        green("about"),
        dim(", "),
        green("projects"),
        dim(", "),
        green("theme matrix"),
        dim("."),
      ],
      blank(),
    ]);
  }, [print]);

  return (
    <div className="flex h-dvh w-full items-stretch justify-center bg-background p-0 sm:p-4 md:p-8">
      <div
        className="crt-scanlines relative flex h-full w-full max-w-5xl flex-col overflow-hidden border border-border bg-[hsl(var(--term-bg))] shadow-2xl sm:rounded-lg"
        onClick={focusInput}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-border bg-[hsl(var(--secondary))] px-3 py-2">
          <span className="h-3 w-3 rounded-full bg-[hsl(var(--term-error))]" />
          <span className="h-3 w-3 rounded-full bg-[hsl(var(--term-warn))]" />
          <span className="h-3 w-3 rounded-full bg-[hsl(var(--term-prompt))]" />
          <div className="ml-2 flex-1 truncate text-center text-xs text-[hsl(var(--muted-foreground))]">
            {PROMPT_USER}@{PROMPT_HOST}: {PROMPT_PATH}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            {theme}
          </div>
        </div>

        {/* Output */}
        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto px-3 py-3 text-sm sm:px-5 sm:text-[13.5px]"
        >
          {booting ? (
            <BootSequence onDone={onBootDone} />
          ) : (
            <>
              {output.map((o) => (
                <TerminalLine key={o.id} line={o.line} />
              ))}

              {/* Live input line */}
              <div className="flex items-start whitespace-pre-wrap wrap-break-word leading-relaxed">
                <span className="font-bold text-[hsl(var(--term-user))] term-glow">
                  {PROMPT_USER}
                </span>
                <span className="text-[hsl(var(--term-dim))]">@</span>
                <span className="font-bold text-[hsl(var(--term-prompt))] term-glow">
                  {PROMPT_HOST}
                </span>
                <span className="text-[hsl(var(--term-dim))]">:</span>
                <span className="text-[hsl(var(--term-path))]">
                  {PROMPT_PATH}
                </span>
                <span className="text-[hsl(var(--term-dim))]">$&nbsp;</span>
                <span className="text-[hsl(var(--term-fg))] term-glow">
                  {input}
                </span>
                <span className="blink-cursor" aria-hidden />
              </div>

              <div ref={endRef} />
            </>
          )}
        </div>

        {/* Hidden input — captures all keystrokes incl. paste/IME/mobile */}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(focusInput, 0)}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal input"
          className="absolute left-[-9999px] top-0 h-px w-px opacity-0"
        />
      </div>
    </div>
  );
};
