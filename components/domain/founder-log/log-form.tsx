"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createFounderLogEntry,
  updateFounderLogEntry,
} from "@/app/(app)/founder-log/actions";
import type { FounderLogEntry } from "@/types/founder-log";
import {
  FOUNDER_LOG_CATEGORIES,
  type FounderLogCategory,
} from "@/types/founder-log";

interface LogFormProps {
  entry?: FounderLogEntry;
  onSuccess?: () => void;
}

type FormState = {
  error?: string;
  success?: boolean;
} | null;

export function LogForm({ entry, onSuccess }: LogFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isEditing = !!entry;
  const [priority, setPriority] = useState(entry?.priority_1_5 ?? 3);
  const [category, setCategory] = useState<FounderLogCategory>(
    entry?.category ?? "product"
  );

  const today = new Date().toISOString().split("T")[0];

  async function formAction(
    _prevState: FormState,
    formData: FormData
  ): Promise<FormState> {
    try {
      formData.set("priority_1_5", String(priority));
      formData.set("category", category);

      if (isEditing) {
        const result = await updateFounderLogEntry(entry.id, formData);
        if (result.error) {
          return { error: result.error };
        }
        return { success: true };
      } else {
        const result = await createFounderLogEntry(formData);
        if (result.error) {
          return { error: result.error };
        }
        return { success: true };
      }
    } catch {
      return { error: "Neocekavana chyba" };
    }
  }

  const [state, dispatch, isPending] = useActionState(formAction, null);

  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast.error(state.error);
      return;
    }

    if (state.success) {
      toast.success(isEditing ? "Zaznam aktualizovan" : "Zaznam vytvoren!");
      onSuccess?.();
    }
  }, [state, isEditing, onSuccess]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="insight">Co jsi dnes zjistil? *</Label>
        <Textarea
          id="insight"
          name="insight"
          required
          placeholder="Hlavni poznatek, insight, nebo rozhodnuti..."
          rows={3}
          defaultValue={entry?.insight ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kategorie</Label>
          <Select
            value={category}
            onValueChange={(val) => setCategory(val as FounderLogCategory)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOUNDER_LOG_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={entry?.date ?? today}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Priorita</Label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPriority(i + 1)}
              className="p-0.5 focus:outline-none"
            >
              <Star
                size={20}
                className={
                  i < priority
                    ? "fill-amber-400 text-amber-400 transition-colors"
                    : "text-muted-foreground/30 transition-colors"
                }
              />
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {priority}/5
          </span>
        </div>
        <input type="hidden" name="priority_1_5" value={priority} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Poznamky</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Dalsi kontext, detaily..."
          rows={2}
          defaultValue={entry?.notes ?? ""}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending
            ? "Ukladam..."
            : isEditing
            ? "Ulozit zmeny"
            : "Pridat zaznam"}
        </Button>
      </div>
    </form>
  );
}
