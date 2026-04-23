import { BookOpen } from "lucide-react";

export default function FounderLogPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <BookOpen size={48} className="text-primary" />
      <h1 className="text-2xl font-bold">Founder Log</h1>
      <p className="text-muted-foreground font-mono text-sm">
        Poznámky k produktu, UX, rodinnému rozšíření
      </p>
      <p className="text-xs text-muted-foreground/60 font-mono">
        Coming soon — PROMPT 5
      </p>
    </div>
  );
}
