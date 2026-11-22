import { useEffect, useState } from "react";
import type { ResolvedTheme, Theme } from "../types/settings";
import { useStoredState } from "./useStoredState";

// Appearance settings are per device (not per account) - a dark-mode choice
// belongs to the screen, not the person. Kept on their v1 keys so existing
// choices survive the v2 storage migration.
const THEME_KEY = "bridge:theme";
const REDUCE_MOTION_KEY = "bridge:reduce-motion";

function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export function useSettings() {
  const [storedTheme, setTheme] = useStoredState<Theme>(THEME_KEY, "system");
  const [reduceMotion, setReduceMotion] = useStoredState<boolean>(REDUCE_MOTION_KEY, false);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => resolveSystemTheme());

  const theme: Theme = isTheme(storedTheme) ? storedTheme : "system";

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

  return { theme, setTheme, resolvedTheme, reduceMotion: reduceMotion === true, setReduceMotion };
}
