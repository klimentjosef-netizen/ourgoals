import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <LayoutDashboard size={48} className="text-primary" />
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground font-mono text-sm">
        Denní přehled — level, XP, streak, coach, checklist, makra
      </p>
      <p className="text-xs text-muted-foreground/60 font-mono">
        Coming soon — PROMPT 1
      </p>
    </div>
  );
}
