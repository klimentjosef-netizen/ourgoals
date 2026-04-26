"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles } from "lucide-react";
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
  const [showButton, setShowButton] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // Show confetti for 5 seconds
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);
    // Delay showing button for 2 seconds so user enjoys the celebration
    const buttonTimer = setTimeout(() => setShowButton(true), 2000);
    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  function handleGo() {
    setNavigating(true);
    // Navigate FIRST, then reset store after a delay
    // This prevents the flash caused by store reset triggering re-render
    router.push("/dashboard");
    setTimeout(() => {
      reset();
    }, 1000);
  }

  // Resolve selected modules to their definitions
  const selectedModuleDefs = selectedModules
    .map((id) => MODULE_REGISTRY.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                backgroundColor: [
                  "var(--primary)",
                  "var(--gold)",
                  "#6366f1",
                  "#ec4899",
                  "#f97316",
                  "#22c55e",
                  "#eab308",
                  "#06b6d4",
                ][i % 8],
                animation: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Success icon */}
      <div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-950/20 flex items-center justify-center mb-6 shadow-lg shadow-green-200/50 dark:shadow-green-900/20"
        style={{ animation: "scaleIn 0.6s ease-out" }}
      >
        <CheckCircle2 size={52} className="text-green-500" />
      </div>

      <h1
        className="text-3xl font-bold mb-2"
        style={{ animation: "slideUp 0.4s ease-out 0.3s both" }}
      >
        Vše je nastaveno!
      </h1>

      <p
        className="text-muted-foreground mb-6"
        style={{ animation: "slideUp 0.4s ease-out 0.5s both" }}
      >
        Tvůj osobní plán je připravený
      </p>

      {/* Summary */}
      <div
        className="w-full max-w-xs text-left space-y-3 mb-6"
        style={{ animation: "slideUp 0.4s ease-out 0.7s both" }}
      >
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

      <div style={{ animation: "slideUp 0.4s ease-out 0.9s both" }}>
        <Badge variant="default" className="text-sm px-4 py-1.5 mb-8">
          <Sparkles size={14} className="mr-1" />
          +50 XP za dokončení
        </Badge>
      </div>

      {/* Button with delay */}
      {showButton && (
        <div style={{ animation: "slideUp 0.4s ease-out" }}>
          <Button
            onClick={handleGo}
            size="lg"
            className="h-13 px-10 text-base shadow-lg"
            disabled={navigating}
          >
            {navigating ? "Přecházím..." : "Začít používat OurGoals →"}
          </Button>
        </div>
      )}

      {!showButton && (
        <p className="text-xs text-muted-foreground/50 animate-pulse">
          Připravujeme tvůj dashboard...
        </p>
      )}
    </div>
  );
}
