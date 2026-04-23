"use client";

import type { ModuleDefinition } from "@/types/modules";
import { Check } from "lucide-react";

interface ModuleCardProps {
  module: ModuleDefinition;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ModuleCard({
  module,
  selected,
  onToggle,
  disabled = false,
}: ModuleCardProps) {
  const Icon = module.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative flex flex-col items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check size={12} className="text-primary-foreground" />
        </div>
      )}

      <Icon size={24} className={selected ? "text-primary" : "text-muted-foreground"} />

      <div>
        <h3 className="font-semibold text-sm">{module.label}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {module.description}
        </p>
      </div>
    </button>
  );
}
