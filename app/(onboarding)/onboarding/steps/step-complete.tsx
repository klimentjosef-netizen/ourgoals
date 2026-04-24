"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";

interface StepCompleteProps {
  moduleCount: number;
  coachToneLabel: string;
}

export function StepComplete({ moduleCount, coachToneLabel }: StepCompleteProps) {
  const router = useRouter();
  const reset = useOnboarding((s) => s.reset);

  function handleGo() {
    reset();
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
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
      </div>

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

      <p className="text-muted-foreground mb-4">
        Vybral jsi <span className="font-semibold text-foreground">{moduleCount} modulů</span>.
        <br />
        Tvůj kouč: <span className="font-semibold text-foreground">{coachToneLabel}</span>.
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
