"use client";

import { Button } from "@/components/ui/button";
import { Target, Flame, Sparkles, Trophy, Zap } from "lucide-react";

interface StepWelcomeProps {
  onNext: () => void;
}

const PILLS = [
  { icon: Target, text: "Vyber si co chceš řídit", color: "bg-blue-500" },
  { icon: Flame, text: "Nastav si cíle a návyky", color: "bg-orange-500" },
  { icon: Sparkles, text: "Začni plnit a sbírat XP", color: "bg-emerald-500" },
] as const;

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-[fadeSlideIn_0.5s_ease-out]">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes phonePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>

      {/* Mini phone mockup */}
      <div
        className="w-20 h-36 rounded-2xl border-2 border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1.5 mb-6"
        style={{ animation: "phonePulse 3s ease-in-out infinite" }}
      >
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
          <Trophy size={18} className="text-primary" />
        </div>
        <div className="flex items-center gap-1">
          <Zap size={10} className="text-orange-500" />
          <span className="text-[9px] font-bold text-primary">7 dní</span>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-primary mb-2">OurGoals</h1>
      <p className="text-lg text-muted-foreground mb-2">
        Vítej. Tady začíná tvůj plán.
      </p>
      <p className="text-xs text-muted-foreground/60 mb-10">
        5 kroků &bull; ~3 minuty
      </p>

      <div className="space-y-4 mb-12 w-full max-w-xs">
        {PILLS.map(({ icon: Icon, text, color }) => (
          <div
            key={text}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative">
              <Icon size={18} className="text-primary" />
              <span
                className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${color} ring-2 ring-background`}
              />
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
