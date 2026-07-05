"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "classic" | "modern" | "neon" | "pastel";

export const THEMES: { value: Theme; label: string }[] = [
  { value: "classic", label: "Clássico" },
  { value: "modern", label: "Moderno" },
  { value: "neon", label: "Neon" },
  { value: "pastel", label: "Pastel" },
];

const STORAGE_KEY = "barber-saas-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return THEMES.some((t) => t.value === value);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("classic");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) {
      setThemeState(stored);
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}
