import { useCallback, useEffect, useState } from "react";
import type { ResolvedTheme, Theme } from "../types/settings";

const THEME_KEY = "bridge:theme";
const REDUCE_MOTION_KEY = "bridge:reduce-motion";

function readTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
  } catch {
    return "system";
  }
}

function readReduceMotion(): boolean {
  try {
    return localStorage.getItem(REDUCE_MOTION_KEY) === "true";
  } catch {
    return false;
  }
}

function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useSettings() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme());
  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => readReduceMotion());
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => resolveSystemTheme());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // localStorage unavailable (e.g. private mode) - choice just won't persist.
    }
  }, []);

  const setReduceMotion = useCallback((next: boolean) => {
    setReduceMotionState(next);
    try {
      localStorage.setItem(REDUCE_MOTION_KEY, String(next));
    } catch {
      // localStorage unavailable - choice just won't persist.
    }
  }, []);

  return { theme, setTheme, resolvedTheme, reduceMotion, setReduceMotion };
}
