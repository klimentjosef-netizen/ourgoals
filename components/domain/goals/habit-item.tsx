"use client";

import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { updateHabit, deleteHabit } from "@/app/(app)/goals/habits/actions";
import { toast } from "sonner";

interface HabitItemProps {
  id: string;
  title: string;
  xpValue: number;
  completed: boolean;
  onToggle: (habitId: string) => Promise<void>;
}

export function HabitItem({
  id,
  title,
  xpValue,
  completed,
  onToggle,
}: HabitItemProps) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(completed);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editXp, setEditXp] = useState(xpValue);
  const [isSaving, setIsSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  async function handleToggle() {
    setIsLoading(true);
    setOptimisticCompleted(!optimisticCompleted);

    try {
      await onToggle(id);
    } catch {
      // Revert on error
      setOptimisticCompleted(optimisticCompleted);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) {
      toast.error("Název nemůže být prázdný");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.set("title", editTitle.trim());
      formData.set("xp_value", String(editXp));

      const result = await updateHabit(id, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Návyk upraven");
      setIsEditing(false);
    } catch {
      toast.error("Něco se pokazilo");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Opravdu chceš smazat tento návyk?")) return;

    try {
      const result = await deleteHabit(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Návyk smazán");
    } catch {
      toast.error("Něco se pokazilo");
    }
  }

  function handleCancelEdit() {
    setEditTitle(title);
    setEditXp(xpValue);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Input
            ref={titleRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="h-9 text-sm flex-1"
            placeholder="Název návyku"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveEdit();
              }
              if (e.key === "Escape") handleCancelEdit();
            }}
          />
          <Input
            value={editXp}
            onChange={(e) => setEditXp(Number(e.target.value))}
            type="number"
            min={1}
            max={100}
            className="h-9 w-16 text-sm text-center"
            placeholder="XP"
          />
        </div>
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="h-7 px-2 text-xs"
          >
            <X size={12} />
            Zrušit
          </Button>
          <Button
            size="sm"
            onClick={handleSaveEdit}
            disabled={isSaving}
            className="h-7 px-2 text-xs"
          >
            <Check size={12} />
            {isSaving ? "Ukládám..." : "Uložit"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        optimisticCompleted
          ? "border-primary/20 bg-primary/5"
          : "border-border"
      )}
    >
      <Checkbox
        checked={optimisticCompleted}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <span
        className={cn(
          "flex-1 text-sm",
          optimisticCompleted && "line-through text-muted-foreground"
        )}
      >
        {title}
      </span>
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="font-mono text-[10px] shrink-0">
          +{xpValue} XP
        </Badge>
        <div className="hidden group-hover:flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="h-6 w-6"
          >
            <Pencil size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="h-6 w-6 text-destructive hover:text-destructive"
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}
