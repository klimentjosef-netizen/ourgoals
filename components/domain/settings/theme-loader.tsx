"use client";

import { useEffect } from "react";
import { THEME_PRESETS } from "@/types/theme";

export function ThemeLoader() {
  useEffect(() => {
    const saved = localStorage.getItem("ourgoals-theme");
    if (saved) {
      const theme = THEME_PRESETS.find((t) => t.id === saved);
      if (theme) {
        const root = document.documentElement;
        root.style.setProperty("--primary", theme.primary);
        root.style.setProperty("--primary-foreground", theme.primaryFg);
        root.style.setProperty("--accent", theme.primary);
        root.style.setProperty("--accent-foreground", theme.primaryFg);
        root.style.setProperty("--ring", theme.primary);
        root.style.setProperty("--gold", theme.gold);
        root.style.setProperty("--gold-foreground", theme.goldFg);
        root.style.setProperty("--sidebar-primary", theme.primary);
        root.style.setProperty("--sidebar-primary-foreground", theme.primaryFg);
        root.style.setProperty("--sidebar-ring", theme.primary);
        root.style.setProperty("--chart-1", theme.primary);
        root.style.setProperty("--chart-2", theme.gold);
      }
    }
  }, []);

  return null;
}
