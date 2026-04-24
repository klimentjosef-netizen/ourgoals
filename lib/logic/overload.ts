import type { SetLog, Exercise } from "@/types/training";

interface OverloadSuggestion {
  suggestedWeight: number | null;
  suggestedReps: number | null;
  reasoning: string;
}

export function calculateTargetLoad(
  lastSessions: SetLog[][],
  exercise: Exercise,
  repsLow: number,
  repsHigh: number,
  rpeTarget: number
): OverloadSuggestion {
  if (lastSessions.length === 0 || lastSessions[0].length === 0) {
    return {
      suggestedWeight: null,
      suggestedReps: repsLow,
      reasoning: "První trénink — zadej váhu sám",
    };
  }

  const isCompound = ["compound", "push", "pull", "legs"].includes(exercise.category);
  const increment = isCompound ? 2.5 : 1.25;

  const lastSession = lastSessions[0];
  const workingSets = lastSession.filter((s) => !s.is_warmup);

  if (workingSets.length === 0) {
    return {
      suggestedWeight: null,
      suggestedReps: repsLow,
      reasoning: "Žádné pracovní série v posledním tréninku",
    };
  }

  const lastWeight = workingSets[0].weight_kg ?? 0;
  const allSetsCompleted = workingSets.every(
    (s) => (s.reps ?? 0) >= repsHigh
  );
  const avgRpe = workingSets.reduce((sum, s) => sum + (s.rpe ?? rpeTarget), 0) / workingSets.length;
  const anyFailed = workingSets.some((s) => (s.reps ?? 0) < repsLow);

  if (allSetsCompleted && avgRpe <= rpeTarget) {
    return {
      suggestedWeight: lastWeight + increment,
      suggestedReps: repsLow,
      reasoning: `Všechny série splněny. Zvyš o ${increment} kg.`,
    };
  }

  if (allSetsCompleted && avgRpe > rpeTarget) {
    return {
      suggestedWeight: lastWeight,
      suggestedReps: Math.min((workingSets[0].reps ?? repsLow) + 1, repsHigh),
      reasoning: "RPE vysoké — drž váhu, přidej rep.",
    };
  }

  if (anyFailed) {
    const reducedWeight = Math.round(lastWeight * 0.95 * 4) / 4;
    return {
      suggestedWeight: reducedWeight < lastWeight ? reducedWeight : lastWeight,
      suggestedReps: repsLow,
      reasoning: "Nesplněné repy — sniž o 5% nebo drž.",
    };
  }

  return {
    suggestedWeight: lastWeight,
    suggestedReps: repsLow,
    reasoning: "Pokračuj se stejnou váhou.",
  };
}
