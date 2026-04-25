/** Boot sequence — typed on first load, then calls onDone. */
import { useEffect, useState } from "react";
import { TerminalLine } from "./TerminalLine";
import {
  type Line,
  blank,
  dim,
  fg,
  green,
  cyan,
  magenta,
} from "../lib/formatter";

const BOOT: Line[] = [
  [dim("[ "), green("OK"), dim(" ] "), fg("Booting termfolio v1.0.0")],
  [dim("[ "), green("OK"), dim(" ] "), fg("Mounting /dev/resume")],
  [
    dim("[ "),
    green("OK"),
    dim(" ] "),
    fg("Loading resume.json … "),
    green("ok"),
  ],
  [dim("[ "), green("OK"), dim(" ] "), fg("Initializing shell")],
  [dim("[ "), green("OK"), dim(" ] "), fg("Spawning interactive session")],
  blank(),
  [cyan("termfolio"), fg(" — type "), magenta("help"), fg(" to begin.")],
];

interface Props {
  onDone: () => void;
}

export const BootSequence = ({ onDone }: Props) => {
  const [shown, setShown] = useState(0);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (skipped) return;
    if (shown >= BOOT.length) {
      const t = setTimeout(onDone, 250);
      return () => clearTimeout(t);
    }
    const delay = shown === 0 ? 200 : 110;
    const t = setTimeout(() => setShown((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [shown, skipped, onDone]);

  useEffect(() => {
    const skip = () => {
      setSkipped(true);
      setShown(BOOT.length);
      setTimeout(onDone, 0);
    };
    window.addEventListener("keydown", skip, { once: true });
    return () => window.removeEventListener("keydown", skip);
  }, [onDone]);

  return (
    <div>
      {BOOT.slice(0, shown).map((line, i) => (
        <TerminalLine key={i} line={line} />
      ))}
    </div>
  );
};
