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

function getScaleColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio <= 0.3) return "text-red-500";
  if (ratio <= 0.6) return "text-yellow-500";
  return "text-green-500";
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <span
          className={`text-lg font-bold tabular-nums ${
            colorScale ? getScaleColor(value, max) : ""
          }`}
        >
          {value}/{max}
        </span>
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
