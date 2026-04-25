"use client";

interface DataPoint {
  date: string;
  maxWeight: number;
}

interface Props {
  exerciseName: string;
  data: DataPoint[];
}

export function ExerciseProgress({ exerciseName, data }: Props) {
  if (data.length === 0) return null;

  const maxWeight = Math.max(...data.map((d) => d.maxWeight));
  const minWeight = Math.min(...data.map((d) => d.maxWeight));

  function getBarColor(weight: number): string {
    if (maxWeight === minWeight) return "bg-primary";
    const ratio = (weight - minWeight) / (maxWeight - minWeight);
    if (ratio >= 0.85) return "bg-primary";
    if (ratio >= 0.6) return "bg-primary/75";
    if (ratio >= 0.35) return "bg-primary/55";
    return "bg-primary/35";
  }

  function getBarWidth(weight: number): string {
    if (maxWeight === 0) return "10%";
    const pct = Math.max(10, (weight / maxWeight) * 100);
    return `${pct}%`;
  }

  // Nejnovější nahoře
  const reversed = [...data].reverse();

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold truncate">{exerciseName}</p>
      {reversed.map((point, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono w-12 shrink-0 text-right">
            {new Date(point.date).toLocaleDateString("cs-CZ", {
              day: "numeric",
              month: "numeric",
            })}
          </span>
          <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
            <div
              className={`h-full rounded ${getBarColor(point.maxWeight)} transition-all`}
              style={{ width: getBarWidth(point.maxWeight) }}
            />
          </div>
          <span className="text-[10px] font-mono font-semibold w-10 text-right">
            {point.maxWeight} kg
          </span>
        </div>
      ))}
    </div>
  );
}
