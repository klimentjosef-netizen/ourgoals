"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { MODULE_REGISTRY, type ModuleId } from "@/types/modules";

interface StepCompleteProps {
  moduleCount: number;
  coachToneLabel: string;
  selectedModules: ModuleId[];
  goalTitle?: string;
}

export function StepComplete({
  moduleCount,
  coachToneLabel,
  selectedModules,
  goalTitle,
}: StepCompleteProps) {
  const router = useRouter();
  const reset = useOnboarding((s) => s.reset);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  function handleGo() {
    reset();
    router.push("/dashboard");
  }

  // Resolve selected modules to their definitions
  const selectedModuleDefs = selectedModules
    .map((id) => MODULE_REGISTRY.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-sm opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              backgroundColor: [
                "var(--primary)",
                "var(--gold)",
                "#6366f1",
                "#ec4899",
                "#f97316",
                "#22c55e",
              ][i % 6],
              animation: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
            }}
          />
        ))}
      </div>}

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <CheckCircle2 size={48} className="text-primary" />
      </div>

      <h1 className="text-3xl font-bold mb-3">Vše je nastaveno!</h1>

      {/* Detailed summary */}
      <div className="w-full max-w-xs text-left space-y-3 mb-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Vybrané moduly</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedModuleDefs.map((mod) => {
              const Icon = mod!.icon;
              return (
                <span
                  key={mod!.id}
                  className="inline-flex items-center gap-1 text-xs bg-muted/60 rounded-full px-2.5 py-1"
                >
                  <Icon size={12} className="text-primary" />
                  {mod!.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Kouč:</span>
          <span className="font-semibold">{coachToneLabel}</span>
        </div>

        {goalTitle && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">První cíl:</span>
            <span className="font-semibold">{goalTitle}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/60 mb-4">
        Toto vše můžeš kdykoli změnit v nastavení.
      </p>

      <Badge variant="default" className="text-sm px-4 py-1 mb-10">
        +50 XP za dokončení
      </Badge>

      <Button onClick={handleGo} size="lg" className="h-12 px-8 text-base">
        Jít na Dashboard →
      </Button>
    </div>
  );
}
