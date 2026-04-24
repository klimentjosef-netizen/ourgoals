"use client";

import { Button } from "@/components/ui/button";
import { Target, Flame, Sparkles } from "lucide-react";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-4xl font-bold text-primary mb-2">OurGoals</h1>
      <p className="text-lg text-muted-foreground mb-10">
        Vítej. Tady začíná tvůj plán.
      </p>

      <div className="space-y-4 mb-12 w-full max-w-xs">
        {[
          { icon: Target, text: "Vyber si co chceš řídit" },
          { icon: Flame, text: "Nastav si cíle a návyky" },
          { icon: Sparkles, text: "Začni plnit a sbírat XP" },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium">{text}</p>
          </div>
        ))}
      </div>

      <Button onClick={onNext} size="lg" className="h-12 px-8 text-base">
        Začít →
      </Button>
    </div>
  );
}
