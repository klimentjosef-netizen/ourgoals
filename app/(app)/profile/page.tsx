import { User, Trophy, Flame } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="flex gap-2">
        <User size={32} className="text-primary" />
        <Trophy size={32} className="text-gold" />
        <Flame size={32} className="text-chart-4" />
      </div>
      <h1 className="text-2xl font-bold">Profil & Achievementy</h1>
      <p className="text-muted-foreground font-mono text-sm">
        Level, XP, achievementy, statistiky, nastavení
      </p>
      <p className="text-xs text-muted-foreground/60 font-mono">
        Coming soon — PROMPT 1
      </p>
    </div>
  );
}
