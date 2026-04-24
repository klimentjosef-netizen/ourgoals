"use client";

import { useState, useTransition } from "react";
import { COACH_TONES } from "@/types/gamification";
import type { CoachTone } from "@/types/gamification";
import { CoachToneCard } from "@/components/domain/onboarding/coach-tone-card";
import { updateCoachTone } from "@/app/(app)/settings/actions";
import { toast } from "sonner";

interface CoachToneSelectorProps {
  currentTone: string;
}

export function CoachToneSelector({ currentTone }: CoachToneSelectorProps) {
  const [selected, setSelected] = useState<string>(currentTone);
  const [isPending, startTransition] = useTransition();

  function handleSelect(toneId: string) {
    setSelected(toneId);

    startTransition(async () => {
      const result = await updateCoachTone(toneId);
      if (result.error) {
        toast.error(result.error);
        setSelected(currentTone); // revert
      } else {
        toast.success("Tón kouče aktualizován");
      }
    });
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      {COACH_TONES.map((tone) => (
        <CoachToneCard
          key={tone.id}
          tone={tone}
          selected={selected === tone.id}
          onSelect={() => handleSelect(tone.id)}
        />
      ))}
    </div>
  );
}
