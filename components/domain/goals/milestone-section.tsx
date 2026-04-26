"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, Plus, Trash2, Loader2, Flag } from "lucide-react";
import { addMilestone, completeMilestone, deleteMilestone } from "@/app/(app)/goals/actions";
import type { GoalMilestone } from "@/app/(app)/goals/actions";
import { toast } from "sonner";

interface MilestoneSectionProps {
  goalId: string;
  milestones: GoalMilestone[];
  isActive: boolean;
}

export function MilestoneSection({ goalId, milestones, isActive }: MilestoneSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  function handleAdd() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      const result = await addMilestone(goalId, newTitle.trim());
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNewTitle("");
      setShowAdd(false);
    });
  }

  function handleComplete(milestoneId: string) {
    startTransition(async () => {
      const result = await completeMilestone(milestoneId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.xpAwarded) {
        toast.success(`+${result.xpAwarded} XP za milestone!`);
      }
    });
  }

  function handleDelete(milestoneId: string) {
    startTransition(async () => {
      const result = await deleteMilestone(milestoneId);
      if (result.error) toast.error(result.error);
    });
  }

  const completed = milestones.filter((m) => m.completed).length;
  const total = milestones.length;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Flag size={14} />
          Milestones
        </h2>
        {total > 0 && (
          <span className="text-xs font-mono text-muted-foreground">
            {completed}/{total}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Milestone list */}
      {milestones.length > 0 && (
        <div className="space-y-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                m.completed
                  ? "bg-muted/20 border-border/50 opacity-70"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <button
                type="button"
                onClick={() => !m.completed && isActive && handleComplete(m.id)}
                disabled={m.completed || !isActive || isPending}
                className="shrink-0"
              >
                {m.completed ? (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check size={14} className="text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm ${m.completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                  {m.title}
                </p>
                {m.completed_at && (
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(m.completed_at).toLocaleDateString("cs-CZ")}
                  </p>
                )}
              </div>

              {!m.completed && isActive && (
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  disabled={isPending}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {isActive && (
        <>
          {showAdd ? (
            <div className="flex gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Název milestonu..."
                className="h-10 flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
              <Button size="sm" className="h-10" onClick={handleAdd} disabled={isPending || !newTitle.trim()}>
                {isPending ? <Loader2 size={14} className="animate-spin" /> : "Přidat"}
              </Button>
              <Button size="sm" variant="ghost" className="h-10" onClick={() => { setShowAdd(false); setNewTitle(""); }}>
                Zrušit
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-10"
              onClick={() => setShowAdd(true)}
            >
              <Plus size={14} className="mr-1.5" />
              Přidat milestone
            </Button>
          )}
        </>
      )}

      {/* Empty state */}
      {milestones.length === 0 && !showAdd && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Rozděl svůj cíl na menší kroky pro lepší přehled.
        </p>
      )}
    </Card>
  );
}
