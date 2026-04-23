"use client";

import type { CoachTone } from "@/types/gamification";
import { COACH_TONES } from "@/types/gamification";
import { Check } from "lucide-react";

interface CoachToneCardProps {
  tone: (typeof COACH_TONES)[number];
  selected: boolean;
  onSelect: () => void;
}

export function CoachToneCard({ tone, selected, onSelect }: CoachToneCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all text-left ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check size={12} className="text-primary-foreground" />
        </div>
      )}

      <h3 className="font-semibold text-sm">{tone.label}</h3>
      <p className="text-xs text-muted-foreground">{tone.description}</p>
      {tone.id !== "minimal" && (
        <p className="text-xs font-mono text-primary/80 italic mt-1">
          &ldquo;{tone.example}&rdquo;
        </p>
      )}
    </button>
  );
}
