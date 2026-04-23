import { ClipboardCheck } from "lucide-react";

export default function CheckinPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <ClipboardCheck size={48} className="text-primary" />
      <h1 className="text-2xl font-bold">Check-in</h1>
      <p className="text-muted-foreground font-mono text-sm">
        Ranní & večerní rituál, streak, coach messages
      </p>
      <p className="text-xs text-muted-foreground/60 font-mono">
        Coming soon — PROMPT 5
      </p>
    </div>
  );
}
