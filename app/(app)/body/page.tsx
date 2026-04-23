import { Activity } from "lucide-react";

export default function BodyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <Activity size={48} className="text-primary" />
      <h1 className="text-2xl font-bold">Tělo & Metriky</h1>
      <p className="text-muted-foreground font-mono text-sm">
        Váha, body fat, měření, trendy, progress fotky
      </p>
      <p className="text-xs text-muted-foreground/60 font-mono">
        Coming soon — PROMPT 1
      </p>
    </div>
  );
}
