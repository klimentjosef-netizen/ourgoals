import { UtensilsCrossed } from "lucide-react";

export default function NutritionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <UtensilsCrossed size={48} className="text-primary" />
      <h1 className="text-2xl font-bold">Jídlo & Makra</h1>
      <p className="text-muted-foreground font-mono text-sm">
        Denní logování, šablony, real-time progress P/C/F
      </p>
      <p className="text-xs text-muted-foreground/60 font-mono">
        Coming soon — PROMPT 3
      </p>
    </div>
  );
}
