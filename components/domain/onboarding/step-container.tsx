"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

interface StepContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  canProceed?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  nextLabel?: string;
}

export function StepContainer({
  title,
  subtitle,
  children,
  onNext,
  onPrev,
  onSkip,
  canSkip = true,
  canProceed = true,
  isFirst = false,
  isLast = false,
  nextLabel,
}: StepContainerProps) {
  return (
    <div className="flex flex-col min-h-[60vh]">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex-1">{children}</div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
        <div>
          {!isFirst && onPrev && (
            <Button variant="ghost" size="sm" onClick={onPrev}>
              <ChevronLeft size={16} />
              Zpět
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canSkip && onSkip && !isLast && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Přeskočit
              <SkipForward size={14} />
            </Button>
          )}
          <Button onClick={onNext} disabled={!canProceed} size="sm">
            {nextLabel ?? (isLast ? "Dokončit" : "Pokračovat")}
            {!isLast && <ChevronRight size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
