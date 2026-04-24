export interface ThemePreset {
  id: string;
  name: string;
  primary: string;      // oklch value
  primaryFg: string;
  gold: string;
  goldFg: string;
  preview: string;      // hex for preview swatch
  previewGold: string;  // hex for preview swatch
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "green",
    name: "Zelená & zlatá",
    primary: "oklch(0.72 0.19 150)",
    primaryFg: "oklch(0.11 0.01 155)",
    gold: "oklch(0.78 0.14 85)",
    goldFg: "oklch(0.11 0 0)",
    preview: "#22c55e",
    previewGold: "#d4a017",
  },
  {
    id: "orange",
    name: "Oranžová & hořčice",
    primary: "oklch(0.65 0.2 25)",
    primaryFg: "oklch(0.98 0 0)",
    gold: "oklch(0.82 0.12 85)",
    goldFg: "oklch(0.15 0 0)",
    preview: "#ff4a1c",
    previewGold: "#e8c547",
  },
  {
    id: "blue",
    name: "Modrá & fialová",
    primary: "oklch(0.62 0.2 265)",
    primaryFg: "oklch(0.98 0 0)",
    gold: "oklch(0.65 0.18 300)",
    goldFg: "oklch(0.98 0 0)",
    preview: "#6366f1",
    previewGold: "#a855f7",
  },
  {
    id: "cyan",
    name: "Tyrkysová & korál",
    primary: "oklch(0.72 0.15 195)",
    primaryFg: "oklch(0.11 0 0)",
    gold: "oklch(0.7 0.18 25)",
    goldFg: "oklch(0.98 0 0)",
    preview: "#06b6d4",
    previewGold: "#f97316",
  },
  {
    id: "rose",
    name: "Růžová & zlato",
    primary: "oklch(0.65 0.2 350)",
    primaryFg: "oklch(0.98 0 0)",
    gold: "oklch(0.78 0.14 85)",
    goldFg: "oklch(0.11 0 0)",
    preview: "#ec4899",
    previewGold: "#d4a017",
  },
  {
    id: "mono",
    name: "Monochromatická",
    primary: "oklch(0.85 0 0)",
    primaryFg: "oklch(0.15 0 0)",
    gold: "oklch(0.65 0 0)",
    goldFg: "oklch(0.98 0 0)",
    preview: "#d4d4d4",
    previewGold: "#737373",
  },
];

export function getThemeById(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0];
}
