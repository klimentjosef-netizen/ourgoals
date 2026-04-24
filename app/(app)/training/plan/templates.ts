export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  splitType: string;
  days: {
    dayIndex: number;
    label: string;
    focus: string;
    exercises: string[];
  }[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "fullbody3",
    name: "Full Body 3×/týden",
    description: "Pro začátečníky. Celé tělo 3× týdně s odpočinkovými dny.",
    daysPerWeek: 3,
    splitType: "full_body",
    days: [
      { dayIndex: 0, label: "Full Body A", focus: "Základ", exercises: ["Back squat", "Bench press", "Barbell row", "OHP", "Plank"] },
      { dayIndex: 2, label: "Full Body B", focus: "Základ", exercises: ["Deadlift", "Incline bench press", "Pull-ups", "Seated DB shoulder press", "Hanging leg raise"] },
      { dayIndex: 4, label: "Full Body C", focus: "Základ", exercises: ["Front squat", "Dips", "Chin-ups", "Face pull", "Back extension"] },
    ],
  },
  {
    id: "upperlower4",
    name: "Upper / Lower 4×/týden",
    description: "Pro středně pokročilé. Horní a spodní tělo střídavě.",
    daysPerWeek: 4,
    splitType: "upper_lower",
    days: [
      { dayIndex: 0, label: "Upper A", focus: "Horní tělo", exercises: ["Bench press", "Barbell row", "OHP", "Cable lateral raise", "Cable triceps pushdown", "Barbell curl"] },
      { dayIndex: 1, label: "Lower A", focus: "Nohy", exercises: ["Back squat", "Romanian deadlift", "Leg press", "Lying leg curl", "Standing calf raise"] },
      { dayIndex: 3, label: "Upper B", focus: "Horní tělo", exercises: ["Incline bench press", "Pull-ups", "Seated DB shoulder press", "Face pull", "Skull crushers", "Hammer curl"] },
      { dayIndex: 4, label: "Lower B", focus: "Nohy", exercises: ["Front squat", "Hip thrust", "Walking lunge", "Seated leg curl", "Seated calf raise"] },
    ],
  },
  {
    id: "ppl6",
    name: "Push / Pull / Legs 6×/týden",
    description: "Pro pokročilé. Maximální objem a frekvence.",
    daysPerWeek: 6,
    splitType: "push_pull_legs",
    days: [
      { dayIndex: 0, label: "Push", focus: "Tlaky", exercises: ["Bench press", "Incline bench press", "OHP", "Cable lateral raise", "Cable triceps pushdown", "Skull crushers"] },
      { dayIndex: 1, label: "Pull", focus: "Tahy", exercises: ["Pull-ups", "Barbell row", "Lat pulldown", "Face pull", "Barbell curl", "Hammer curl"] },
      { dayIndex: 2, label: "Legs", focus: "Nohy", exercises: ["Back squat", "Romanian deadlift", "Leg press", "Lying leg curl", "Standing calf raise", "Hanging leg raise"] },
      { dayIndex: 3, label: "Push 2", focus: "Tlaky", exercises: ["Incline bench press", "Flat dumbbell press", "Seated DB shoulder press", "Cable lateral raise", "Close-grip bench press"] },
      { dayIndex: 4, label: "Pull 2", focus: "Tahy", exercises: ["Chin-ups", "T-bar row", "Chest-supported row", "Face pull", "EZ bar curl", "Cable rope hammer curl"] },
      { dayIndex: 5, label: "Legs 2", focus: "Nohy", exercises: ["Front squat", "Hip thrust", "Walking lunge", "Seated leg curl", "Seated calf raise", "Cable crunch"] },
    ],
  },
];
