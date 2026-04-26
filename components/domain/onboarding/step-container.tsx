"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StepContainerProps {
  title: string;
  subtitle?: string;
  helperText?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  onNext: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  canProceed?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  nextLabel?: string;
  isPending?: boolean;
}

export function StepContainer({
  title,
  subtitle,
  helperText,
  icon: Icon,
  children,
  onNext,
  onPrev,
  onSkip,
  canSkip = true,
  canProceed = true,
  isFirst = false,
  isLast = false,
  nextLabel,
  isPending = false,
}: StepContainerProps) {
  // Scroll to top when step mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col min-h-[60vh]" style={{ animation: "fadeSlideIn 0.3s ease-out" }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="mb-6">
        {Icon && (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon size={24} className="text-primary" />
          </div>
        )}
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        )}
        {helperText && (
          <p className="text-xs text-muted-foreground/70 mt-2">{helperText}</p>
        )}
      </div>

      <div className="flex-1">{children}</div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
        <div>
          {!isFirst && onPrev && (
            <Button variant="ghost" className="h-11" onClick={onPrev}>
              <ChevronLeft size={16} />
              Zpět
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canSkip && onSkip && !isLast && (
            <Button variant="ghost" className="h-11" onClick={onSkip}>
              Přeskočit
              <SkipForward size={14} />
            </Button>
          )}
          <Button
            onClick={onNext}
            disabled={!canProceed || isPending}
            className="h-11 min-w-[140px]"
          >
            {isPending
              ? "Ukládám..."
              : nextLabel ?? (isLast ? "Dokončit" : "Pokračovat")}
            {!isLast && !isPending && <ChevronRight size={16} />}
          </Button>
        </div>
      </div>

      {!isFirst && !isLast && (
        <p className="text-[10px] text-muted-foreground/50 text-center mt-4">
          Vše můžeš později změnit v nastavení.
        </p>
      )}
    </div>
  );
}
