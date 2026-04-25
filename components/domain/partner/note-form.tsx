"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Send } from "lucide-react";
import { createPartnerNote } from "@/app/(app)/partner/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type NoteKind = "gratitude" | "bother" | "request" | "celebrate";

interface NoteFormProps {
  kind: NoteKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const KIND_CONFIG = {
  gratitude: {
    emoji: "💚",
    title: "Vděčnost",
    placeholder: "Za co jsi dnes vděčný/á?",
    color: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700",
    description: "Sdílej, za co jsi dnes vděčný/á svému partnerovi.",
  },
  bother: {
    emoji: "🟡",
    title: "Co mě mrzelo",
    placeholder: "Co tě dnes mrzelo?",
    color: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700",
    description: "Vyjádři, co tě dnes trápilo. Buď upřímný/á, ale laskavý/á.",
  },
  request: {
    emoji: "🔵",
    title: "Přání",
    placeholder: "O co bys chtěl/a požádat?",
    color: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
    description: "Formuluj prosbu nebo přání pro svého partnera.",
  },
  celebrate: {
    emoji: "🎉",
    title: "Oslava",
    placeholder: "Co chceš oslavit?",
    color: "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700",
    description: "Pochval se navzájem! Co se dnes povedlo?",
  },
} as const;

export function NoteForm({ kind, open, onOpenChange, onSuccess }: NoteFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const config = KIND_CONFIG[kind];

  function handleSubmit() {
    if (!content.trim()) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("kind", kind);
      formData.set("content", content);

      const result = await createPartnerNote(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Vzkaz odeslán!");
      setContent("");
      onOpenChange(false);
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={config.placeholder}
            className="h-32 resize-none"
            autoFocus
          />

          {kind === "bother" && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-amber-700 dark:text-amber-400">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed">
                Tento typ vzkazu lze odeslat max 1&times; denně.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            className={cn(
              "text-white w-full sm:w-auto",
              config.color,
            )}
          >
            <Send size={14} />
            {isPending ? "Odesílám..." : "Odeslat vzkaz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
