import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <Settings size={48} className="text-primary" />
      <h1 className="text-2xl font-bold">Nastavení</h1>
      <p className="text-muted-foreground font-mono text-sm">
        Profil, cíle, coach tone, household, notifikace
      </p>
      <p className="text-xs text-muted-foreground/60 font-mono">
        Coming soon — PROMPT 1
      </p>
    </div>
  );
}
