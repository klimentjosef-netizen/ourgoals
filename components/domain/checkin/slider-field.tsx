"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SliderFieldProps {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  colorScale?: boolean;
}

function getEmoji(value: number): string {
  if (value <= 2) return "😴";
  if (value <= 4) return "😕";
  if (value <= 6) return "😐";
  if (value <= 8) return "😊";
  return "🔥";
}

function getScaleColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio <= 0.3) return "text-red-500";
  if (ratio <= 0.5) return "text-amber-500";
  if (ratio <= 0.7) return "text-yellow-500";
  if (ratio <= 0.85) return "text-green-500";
  return "text-emerald-500";
}

export function SliderField({
  name,
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  colorScale = true,
}: SliderFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="text-sm">{label}</Label>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getEmoji(value)}</span>
          <span
            className={`text-xl font-bold tabular-nums ${
              colorScale ? getScaleColor(value, max) : ""
            }`}
          >
            {value}
          </span>
          <span className="text-xs text-muted-foreground">/{max}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
        min={min}
        max={max}
        step={1}
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
