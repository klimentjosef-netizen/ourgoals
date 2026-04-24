"use client";

import { useState, useEffect } from "react";
import { THEME_PRESETS, type ThemePreset } from "@/types/theme";
import { Check, Palette } from "lucide-react";

function applyTheme(theme: ThemePreset) {
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

export function ThemePicker() {
  const [selected, setSelected] = useState("green");

  useEffect(() => {
    const saved = localStorage.getItem("ourgoals-theme");
    if (saved) {
      setSelected(saved);
      const theme = THEME_PRESETS.find((t) => t.id === saved);
      if (theme) applyTheme(theme);
    }
  }, []);

  function handleSelect(theme: ThemePreset) {
    setSelected(theme.id);
    applyTheme(theme);
    localStorage.setItem("ourgoals-theme", theme.id);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Palette size={16} />
        Barevné schéma
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {THEME_PRESETS.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme)}
            className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
              selected === theme.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            {selected === theme.id && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check size={10} className="text-primary-foreground" />
              </div>
            )}
            <div className="flex gap-1">
              <div
                className="w-5 h-5 rounded-full border border-border"
                style={{ backgroundColor: theme.preview }}
              />
              <div
                className="w-5 h-5 rounded-full border border-border"
                style={{ backgroundColor: theme.previewGold }}
              />
            </div>
            <span className="text-xs font-medium">{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
