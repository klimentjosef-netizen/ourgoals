import { Dumbbell } from "lucide-react";

export default function TrainingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <Dumbbell size={48} className="text-primary" />
      <h1 className="text-2xl font-bold">Trénink</h1>
      <p className="text-muted-foreground font-mono text-sm">
        38denní plán, progressive overload, logování sérií
      </p>
      <p className="text-xs text-muted-foreground/60 font-mono">
        Coming soon — PROMPT 2
      </p>
    </div>
  );
}
