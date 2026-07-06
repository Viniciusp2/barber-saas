"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { THEMES, useTheme } from "./theme-provider";

const SWATCHES: Record<string, string> = {
  classic: "linear-gradient(135deg, #a3540f, #c96f1f)",
  modern: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
  neon: "linear-gradient(135deg, #22d3ee, #d946ef, #f43f5e)",
  pastel: "linear-gradient(135deg, #f9a8d4, #c4b5fd)",
};

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = THEMES.find((t) => t.value === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50"
      >
        <span
          className="size-4 shrink-0 rounded-full"
          style={{ backgroundImage: SWATCHES[current.value] }}
        />
        {current.label}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Escolher tema"
          className="animate-scale-in absolute right-0 top-[calc(100%+0.5rem)] z-20 flex w-40 flex-col gap-1 rounded-lg border border-border bg-card p-1.5 shadow-lg"
        >
          {THEMES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.value}
              onClick={() => {
                setTheme(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                theme === option.value ? "bg-muted font-medium" : "text-foreground"
              )}
            >
              <span
                className="size-4 shrink-0 rounded-full"
                style={{ backgroundImage: SWATCHES[option.value] }}
              />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
