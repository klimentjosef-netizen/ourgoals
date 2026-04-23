"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  CalendarDays,
  User,
  Target,
  Moon,
  Briefcase,
  BookOpen,
  ClipboardCheck,
  Plus,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { ModuleId } from "@/types/modules";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  moduleId?: ModuleId;
  alwaysVisible?: boolean;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, alwaysVisible: true },
  { href: "/goals", label: "Cíle", icon: Target, moduleId: "goals_habits" },
  { href: "/checkin", label: "Check-in", icon: ClipboardCheck, moduleId: "sleep_wellbeing" },
  { href: "/training", label: "Trénink", icon: Dumbbell, moduleId: "training" },
  { href: "/nutrition", label: "Jídlo", icon: UtensilsCrossed, moduleId: "nutrition" },
  { href: "/calendar", label: "Kalendář", icon: CalendarDays, moduleId: "calendar" },
  { href: "/wellbeing", label: "Wellbeing", icon: Moon, moduleId: "sleep_wellbeing" },
  { href: "/founder-log", label: "Founder Log", icon: BookOpen, moduleId: "work_focus" },
  { href: "/profile", label: "Profil", icon: User, alwaysVisible: true },
];

interface QuickAction {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  moduleId?: ModuleId;
}

const ALL_QUICK_ACTIONS: QuickAction[] = [
  { href: "/checkin", label: "Check-in", icon: ClipboardCheck, moduleId: "sleep_wellbeing" },
  { href: "/goals", label: "Cíle & návyky", icon: Target, moduleId: "goals_habits" },
  { href: "/training?action=start", label: "Začni trénink", icon: Dumbbell, moduleId: "training" },
  { href: "/nutrition?action=log", label: "Zaloguj jídlo", icon: UtensilsCrossed, moduleId: "nutrition" },
  { href: "/calendar?action=new", label: "Nový event", icon: CalendarDays, moduleId: "calendar" },
];

export function AppShell({
  user,
  activeModules,
  children,
}: {
  user: SupabaseUser;
  activeModules: ModuleId[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [fabOpen, setFabOpen] = useState(false);

  const navItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter(
      (item) =>
        item.alwaysVisible || (item.moduleId && activeModules.includes(item.moduleId))
    );
  }, [activeModules]);

  const quickActions = useMemo(() => {
    return ALL_QUICK_ACTIONS.filter(
      (action) =>
        !action.moduleId || activeModules.includes(action.moduleId)
    );
  }, [activeModules]);

  // Mobile: pick first 2 + last 2 for bottom nav (max 4 + FAB)
  const mobileNavLeft = navItems.slice(0, 2);
  const mobileNavRight = navItems.length > 2 ? navItems.slice(-2) : [];

  return (
    <div className="flex h-full min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 border-r border-border bg-sidebar p-4 fixed h-full">
        <Link href="/dashboard" className="mb-8">
          <h1 className="text-lg font-bold text-sidebar-primary">OurGoals</h1>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border pt-4 mt-4">
          <p className="text-xs text-sidebar-foreground/50 font-mono truncate">
            {user.email}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto p-4 md:p-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavLeft.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-mono">{item.label}</span>
              </Link>
            );
          })}

          {/* FAB */}
          {quickActions.length > 0 && (
            <button
              onClick={() => setFabOpen(!fabOpen)}
              className="relative -mt-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              {fabOpen ? <X size={24} /> : <Plus size={24} />}
            </button>
          )}

          {mobileNavRight.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-mono">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FAB overlay */}
      {fabOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setFabOpen(false)}
          />
          <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 items-center">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setFabOpen(false)}
                className="flex items-center gap-3 bg-card text-card-foreground px-5 py-3 rounded-lg shadow-lg border border-border min-w-[200px]"
              >
                <action.icon size={18} className="text-primary" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
