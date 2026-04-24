"use client";

const CZECH_DAYS = [
  "Neděle",
  "Pondělí",
  "Úterý",
  "Středa",
  "Čtvrtek",
  "Pátek",
  "Sobota",
];

const CZECH_MONTHS = [
  "ledna",
  "února",
  "března",
  "dubna",
  "května",
  "června",
  "července",
  "srpna",
  "září",
  "října",
  "listopadu",
  "prosince",
];

interface DashboardGreetingProps {
  displayName: string;
}

export function DashboardGreeting({ displayName }: DashboardGreetingProps) {
  const now = new Date();
  const hour = now.getHours();

  const timeGreeting =
    hour < 12
      ? "Dobré ráno"
      : hour < 18
        ? "Dobré odpoledne"
        : "Dobrý večer";

  const dayName = CZECH_DAYS[now.getDay()];
  const day = now.getDate();
  const month = CZECH_MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {timeGreeting}, {displayName}!
      </h1>
      <p className="text-sm text-muted-foreground">
        {dayName} {day}. {month} {year}
      </p>
    </div>
  );
}
