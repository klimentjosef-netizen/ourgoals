"use client";

import { useState } from "react";
import { NoteForm, type NoteKind } from "@/components/domain/partner/note-form";
import { cn } from "@/lib/utils";

interface SendNoteCardsProps {
  onSuccess?: () => void;
}

const CARDS: Array<{
  kind: NoteKind;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  hoverGradient: string;
  muted?: boolean;
}> = [
  {
    kind: "gratitude",
    emoji: "💚",
    title: "Vděčnost",
    description: "Řekni, za co jsi vděčný/á",
    gradient:
      "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20",
    hoverGradient:
      "hover:from-emerald-100 hover:to-emerald-200/50 dark:hover:from-emerald-950/60 dark:hover:to-emerald-900/40",
  },
  {
    kind: "celebrate",
    emoji: "🎉",
    title: "Oslava",
    description: "Pochval se navzájem",
    gradient:
      "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20",
    hoverGradient:
      "hover:from-purple-100 hover:to-purple-200/50 dark:hover:from-purple-950/60 dark:hover:to-purple-900/40",
  },
  {
    kind: "request",
    emoji: "🔵",
    title: "Přání",
    description: "Požádej o něco laskavě",
    gradient:
      "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20",
    hoverGradient:
      "hover:from-blue-100 hover:to-blue-200/50 dark:hover:from-blue-950/60 dark:hover:to-blue-900/40",
  },
  {
    kind: "bother",
    emoji: "🟡",
    title: "Co mě mrzelo",
    description: "Sdílej upřímně, max 1\u00d7 denně",
    gradient:
      "bg-gradient-to-br from-amber-50/70 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10",
    hoverGradient:
      "hover:from-amber-100/70 hover:to-amber-200/30 dark:hover:from-amber-950/40 dark:hover:to-amber-900/20",
    muted: true,
  },
];

export function SendNoteCards({ onSuccess }: SendNoteCardsProps) {
  const [openKind, setOpenKind] = useState<NoteKind | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((card) => (
          <button
            key={card.kind}
            onClick={() => setOpenKind(card.kind)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border p-5 transition-all duration-200",
              "ring-1 ring-foreground/5 hover:ring-foreground/10",
              "hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
              card.gradient,
              card.hoverGradient,
              card.muted && "opacity-80 hover:opacity-100",
              card.muted ? "p-4" : "p-5",
            )}
          >
            <span className={cn("text-3xl", card.muted && "text-2xl")}>
              {card.emoji}
            </span>
            <span
              className={cn(
                "font-semibold",
                card.muted ? "text-xs" : "text-sm",
              )}
            >
              {card.title}
            </span>
            <span
              className={cn(
                "text-muted-foreground text-center leading-snug",
                card.muted ? "text-[10px]" : "text-xs",
              )}
            >
              {card.description}
            </span>
          </button>
        ))}
      </div>

      {openKind && (
        <NoteForm
          kind={openKind}
          open={true}
          onOpenChange={(open) => {
            if (!open) setOpenKind(null);
          }}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
