"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardCheck,
  UtensilsCrossed,
  Dumbbell,
  Target,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface QuickActionsProps {
  activeModules: string[];
}

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  module: string | null; // null = always show
}

const ALL_ACTIONS: QuickAction[] = [
  {
    label: "Check-in",
    href: "/checkin",
    icon: ClipboardCheck,
    module: "sleep_wellbeing",
  },
  {
    label: "Přidat jídlo",
    href: "/nutrition",
    icon: UtensilsCrossed,
    module: "nutrition",
  },
  {
    label: "Začít trénink",
    href: "/training",
    icon: Dumbbell,
    module: "training",
  },
  {
    label: "Nový cíl",
    href: "/goals/new",
    icon: Target,
    module: "goals_habits",
  },
  {
    label: "Nový event",
    href: "/calendar",
    icon: CalendarPlus,
    module: "calendar",
  },
];

export function QuickActions({ activeModules }: QuickActionsProps) {
  const visible = ALL_ACTIONS.filter(
    (a) => a.module === null || activeModules.includes(a.module)
  );

  if (visible.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {visible.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-2 py-3 px-3">
                <Icon size={16} className="text-primary shrink-0" />
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
