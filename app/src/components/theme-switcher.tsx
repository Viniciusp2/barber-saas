"use client";

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

  return (
    <div
      role="radiogroup"
      aria-label="Tema do aplicativo"
      className={cn("flex items-center gap-1.5", className)}
    >
      {THEMES.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          title={option.label}
          onClick={() => setTheme(option.value)}
          className={cn(
            "size-6 shrink-0 cursor-pointer rounded-full border-2 transition-transform hover:scale-110",
            theme === option.value ? "border-foreground" : "border-transparent"
          )}
          style={{ backgroundImage: SWATCHES[option.value] }}
        >
          <span className="sr-only">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
