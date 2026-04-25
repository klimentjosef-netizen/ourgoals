"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  GOAL_TYPES,
  GOAL_AREAS,
  type GoalType,
  type GoalArea,
} from "@/types/goals";
import { GoalForm } from "@/components/domain/goals/goal-form";

type Step = "type" | "area" | "form";

export default function NewGoalPage() {
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [selectedArea, setSelectedArea] = useState<GoalArea | null>(null);

  function handleSelectType(type: GoalType) {
    setSelectedType(type);
    setStep("area");
  }

  function handleSelectArea(area: GoalArea) {
    setSelectedArea(area);
    setStep("form");
  }

  function handleBack() {
    if (step === "form") {
      setStep("area");
    } else if (step === "area") {
      setStep("type");
    }
  }

  const stepNumber = step === "type" ? 1 : step === "area" ? 2 : 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step === "type" ? (
          <Link
            href="/goals"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
        ) : (
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold">Nový cíl</h1>
          <p className="text-xs text-muted-foreground font-mono">
            Krok {stepNumber} / 3
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              s <= stepNumber ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step 1: Select Type */}
      {step === "type" && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold">Jaký typ cíle?</h2>
            <p className="text-sm text-muted-foreground">
              Vyber si herní mód pro svůj cíl
            </p>
          </div>

          <div className="grid gap-3">
            {GOAL_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type.id)}
                  className="w-full text-left"
                >
                  <Card
                    className={cn(
                      "p-4 border-2 transition-all hover:border-primary/50 hover:shadow-md",
                      "active:scale-[0.98] cursor-pointer",
                      selectedType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                        {type.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-primary shrink-0" />
                          <span className="font-semibold text-sm">
                            {type.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Select Area */}
      {step === "area" && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold">Oblast života</h2>
            <p className="text-sm text-muted-foreground">
              Kam tento cíl patří?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {GOAL_AREAS.map((area) => {
              return (
                <button
                  key={area.id}
                  onClick={() => handleSelectArea(area.id)}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      "p-4 border-2 transition-all hover:shadow-md",
                      "active:scale-[0.97] cursor-pointer h-full",
                      selectedArea === area.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-3xl">{area.emoji}</div>
                      <div>
                        <span className={cn("text-sm font-semibold", area.color)}>
                          {area.label}
                        </span>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Type-specific form */}
      {step === "form" && selectedType && selectedArea && (
        <GoalForm goalType={selectedType} goalArea={selectedArea} />
      )}
    </div>
  );
}
