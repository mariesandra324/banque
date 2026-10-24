import React, { createContext, useContext, useMemo, useState } from "react";

export type ThemeMode = "auto" | "clair" | "sombre";
export type ResolvedScheme = "light" | "dark";

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function resolveThemeMode(
  mode: ThemeMode,
  systemScheme: string | null | undefined
): ResolvedScheme {
  if (mode === "clair") return "light";
  if (mode === "sombre") return "dark";
  return systemScheme === "dark" ? "dark" : "light";
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("auto");

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode doit être utilisé dans un ThemeModeProvider");
  return ctx;
}