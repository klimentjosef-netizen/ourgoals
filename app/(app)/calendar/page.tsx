import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <CalendarDays size={48} className="text-primary" />
      <h1 className="text-2xl font-bold">Kalendář</h1>
      <p className="text-muted-foreground font-mono text-sm">
        Agenda list, detekce konfliktů, automatické eventy z plánu
      </p>
      <p className="text-xs text-muted-foreground/60 font-mono">
        Coming soon — PROMPT 4
      </p>
    </div>
  );
}
