"use client";

import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export function showXPToast(amount: number, reason: string) {
  toast.success(`+${amount} XP`, {
    description: reason,
    icon: <Sparkles size={16} className="text-yellow-500" />,
    duration: 2500,
  });
}
