/** Renders a single terminal line: array of segments → spans/links. */
import { type Line, type Color } from "../lib/formatter";

const colorClass: Record<Color, string> = {
  fg: "text-[hsl(var(--term-fg))]",
  prompt: "text-[hsl(var(--term-prompt))]",
  user: "text-[hsl(var(--term-user))]",
  path: "text-[hsl(var(--term-path))]",
  link: "text-[hsl(var(--term-link))] underline-offset-2 hover:underline",
  warn: "text-[hsl(var(--term-warn))]",
  error: "text-[hsl(var(--term-error))]",
  dim: "text-[hsl(var(--term-dim))]",
  key: "text-[hsl(var(--term-key))]",
  accent: "text-[hsl(var(--accent))]",
};

interface Props {
  line: Line;
}

export const TerminalLine = ({ line }: Props) => {
  return (
    <div className="whitespace-pre-wrap wrap-break-word leading-relaxed">
      {line.length === 0 || (line.length === 1 && line[0].text === "") ? (
        <>&nbsp;</>
      ) : (
        line.map((seg, i) => {
          const cls = `${colorClass[seg.color ?? "fg"]} ${seg.bold ? "font-bold" : ""} term-glow`;
          if (seg.href) {
            return (
              <a
                key={i}
                href={seg.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
              >
                {seg.text}
              </a>
            );
          }
          return (
            <span key={i} className={cls}>
              {seg.text}
            </span>
          );
        })
      )}
    </div>
  );
};
