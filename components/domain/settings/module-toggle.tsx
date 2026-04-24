"use client";

import { useState, useTransition } from "react";
import { MODULE_REGISTRY } from "@/types/modules";
import type { ModuleId } from "@/types/modules";
import { updateModules } from "@/app/(app)/settings/actions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface ModuleToggleProps {
  activeModules: ModuleId[];
}

export function ModuleToggle({ activeModules }: ModuleToggleProps) {
  const [modules, setModules] = useState<ModuleId[]>(activeModules);
  const [isPending, startTransition] = useTransition();

  const visibleModules = MODULE_REGISTRY.filter((mod) => !mod.featureFlag);

  function handleToggle(moduleId: ModuleId) {
    const newModules = modules.includes(moduleId)
      ? modules.filter((m) => m !== moduleId)
      : [...modules, moduleId];

    setModules(newModules);

    startTransition(async () => {
      const result = await updateModules(newModules);
      if (result.error) {
        toast.error(result.error);
        setModules(modules); // revert
      } else {
        toast.success("Moduly aktualizovány");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {visibleModules.map((mod) => {
        const isActive = modules.includes(mod.id);
        const Icon = mod.icon;

        return (
          <button
            key={mod.id}
            type="button"
            disabled={isPending}
            onClick={() => handleToggle(mod.id)}
            className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
              isActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            } ${isPending ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{mod.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {mod.description}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 pt-1">
              <Checkbox
                checked={isActive}
                onCheckedChange={() => {}}
                className="pointer-events-none"
              />
            </div>
          </button>
        );
      })}
      {isPending && (
        <div className="col-span-full flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 size={14} className="animate-spin" />
          Ukládám...
        </div>
      )}
    </div>
  );
}
