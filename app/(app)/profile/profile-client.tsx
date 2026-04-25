"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateDisplayName } from "@/app/(app)/profile/actions";
import { AchievementDetailDialog } from "@/components/domain/gamification/achievement-detail-dialog";
import type { Achievement } from "@/types/gamification";

/* ---- Editable Display Name ---- */
interface EditableNameProps {
  initialName: string;
}

export function EditableName({ initialName }: EditableNameProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await updateDisplayName(name);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Jméno uloženo");
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-lg font-bold w-auto max-w-[200px]"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setName(initialName);
              setEditing(false);
            }
          }}
          disabled={isPending}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleSave}
          disabled={isPending}
        >
          <Check size={14} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => {
            setName(initialName);
            setEditing(false);
          }}
          disabled={isPending}
        >
          <X size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <h2 className="text-lg font-bold">{name}</h2>
      <button
        onClick={() => setEditing(true)}
        className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
        aria-label="Upravit jméno"
      >
        <Pencil size={14} />
      </button>
    </div>
  );
}

/* ---- Achievement Grid with Dialog ---- */

interface AchievementGridProps {
  allAchievements: Achievement[];
  unlockedMap: Record<string, string>; // achievement_id → unlocked_at
}

export function AchievementGrid({
  allAchievements,
  unlockedMap,
}: AchievementGridProps) {
  const [selected, setSelected] = useState<Achievement | null>(null);

  if (allAchievements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Zatím nejsou definovány žádné achievementy.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {allAchievements.map((achievement) => {
          const isUnlocked = achievement.id in unlockedMap;
          return (
            <button
              key={achievement.id}
              type="button"
              onClick={() => setSelected(achievement)}
              className={`flex flex-col items-center text-center p-2 rounded-lg transition-colors cursor-pointer hover:ring-1 hover:ring-primary/30 ${
                isUnlocked
                  ? "bg-primary/5"
                  : "bg-muted/30 opacity-40"
              }`}
            >
              <div className="text-2xl mb-1">
                {isUnlocked ? (
                  achievement.icon || "🏆"
                ) : (
                  <Lock size={20} className="text-muted-foreground" />
                )}
              </div>
              <p className="text-[10px] font-medium leading-tight">
                {achievement.name}
              </p>
              {isUnlocked && achievement.xp_reward > 0 && (
                <p className="text-[9px] text-primary mt-0.5">
                  +{achievement.xp_reward} XP
                </p>
              )}
            </button>
          );
        })}
      </div>

      <AchievementDetailDialog
        achievement={selected}
        isUnlocked={selected ? selected.id in unlockedMap : false}
        unlockedAt={selected ? unlockedMap[selected.id] ?? null : null}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}
