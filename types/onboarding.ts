import { z } from "zod/v4";
import type { ModuleId } from "./modules";
import type { CoachTone } from "./gamification";

export const profileSchema = z.object({
  displayName: z.string().min(1, "Jméno je povinné"),
  dateOfBirth: z.string().optional(),
  timezone: z.string().default("Europe/Prague"),
  locale: z.string().default("cs"),
});

export type ProfileData = z.infer<typeof profileSchema>;

// --- Goals ---

export type GoalType = "measurable" | "habit" | "challenge" | "oneoff";

export const quickGoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["measurable", "habit", "challenge", "oneoff"]),
  // type-specific fields
  targetWeight: z.number().optional(),        // measurable
  frequency: z.number().optional(),           // habit (per week)
  challengeDays: z.number().optional(),       // challenge
  deadline: z.string().optional(),            // oneoff
});

export type QuickGoalData = z.infer<typeof quickGoalSchema>;

export const goalSetupSchema = z.object({
  title: z.string().min(1, "Název cíle je povinný"),
  description: z.string().optional(),
  metric: z.string().optional(),
  targetValue: z.number().optional(),
  startValue: z.number().optional(),
  targetDate: z.string().optional(),
  // New: multiple goals
  goals: z.array(quickGoalSchema).optional(),
});

export type GoalSetupData = z.infer<typeof goalSetupSchema>;

// --- Sleep ---

export const sleepSetupSchema = z.object({
  bedtimeTarget: z.string().optional(),
  wakeTarget: z.string().optional(),
  sleepHours: z.number().min(6).max(10).optional(),
  trackMood: z.boolean().default(true),
  trackEnergy: z.boolean().default(true),
  trackStress: z.boolean().default(true),
  trackMeditation: z.boolean().default(false),
  trackScreenTime: z.boolean().default(false),
  trackCaffeine: z.boolean().default(false),
  trackAlcohol: z.boolean().default(false),
});

export type SleepSetupData = z.infer<typeof sleepSetupSchema>;

// --- Training ---

export const trainingSetupSchema = z.object({
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  daysPerWeek: z.number().min(2).max(7).optional(),
  trainingLocation: z.enum(["gym", "home", "outdoor", "mix"]).optional(),
  weightKg: z.number().optional(),
  heightCm: z.number().optional(),
  bodyFatPct: z.number().optional(),
  trainingGoal: z.enum(["cut", "bulk", "maintain", "recomp"]).optional(),
  templatePlan: z.enum(["fullbody3", "upperlower4", "ppl6", "custom"]).optional(),
});

export type TrainingSetupData = z.infer<typeof trainingSetupSchema>;

// --- Nutrition ---

export const nutritionSetupSchema = z.object({
  trackingLevel: z.enum(["macros", "kcal_only", "none"]).optional(),
  targetKcal: z.number().optional(),
  proteinG: z.number().optional(),
  carbsG: z.number().optional(),
  fatG: z.number().optional(),
  allergies: z.array(z.string()).optional(),
  dietType: z.enum(["none", "vegetarian", "vegan"]).optional(),
  mealsPerDay: z.number().min(3).max(5).optional(),
});

export type NutritionSetupData = z.infer<typeof nutritionSetupSchema>;

// --- Calendar ---

export const weekDaySchema = z.object({
  day: z.number().min(0).max(6),
  isWorkDay: z.boolean(),
  wakeTime: z.string(),
  sleepTime: z.string(),
});

export const commitmentSchema = z.object({
  day: z.number().min(-1).max(6),
  timeFrom: z.string(),
  timeTo: z.string(),
  name: z.string(),
  recurring: z.boolean(),
});

export const calendarSetupSchema = z.object({
  weekDays: z.array(weekDaySchema).optional(),
  commitments: z.array(commitmentSchema).optional(),
  preferTraining: z.enum(["morning", "afternoon", "evening", "any"]).optional(),
  preferDeepWork: z.enum(["morning", "afternoon", "any"]).optional(),
  workDays: z.array(z.number()).optional(),
  fixedCommitments: z.string().optional(),
});

export type WeekDayData = z.infer<typeof weekDaySchema>;
export type CommitmentData = z.infer<typeof commitmentSchema>;
export type CalendarSetupData = z.infer<typeof calendarSetupSchema>;

// --- Work ---

export const meetingSchema = z.object({
  day: z.number().min(0).max(6),
  timeFrom: z.string(),
  timeTo: z.string(),
  name: z.string(),
});

export const workSetupSchema = z.object({
  workLocation: z.enum(["home", "office", "mix"]).optional(),
  workStartTime: z.string().optional(),
  workEndTime: z.string().optional(),
  deepWorkHours: z.number().optional(),
  meetings: z.array(meetingSchema).optional(),
});

export type MeetingData = z.infer<typeof meetingSchema>;
export type WorkSetupData = z.infer<typeof workSetupSchema>;

// --- Family ---

export const familySetupSchema = z.object({
  hasPartner: z.boolean().default(false),
  hasChildren: z.boolean().default(false),
  childrenCount: z.number().min(0).max(10).optional(),
  childrenAges: z.array(z.number()).optional(),
  sharingPreferences: z.array(z.string()).optional(),
});

export type FamilySetupData = z.infer<typeof familySetupSchema>;

// --- Colors ---

export const colorSetupSchema = z.object({
  themeId: z.string().optional(),
});

export type ColorSetupData = z.infer<typeof colorSetupSchema>;

// --- Aggregated ---

export interface OnboardingData {
  profile: ProfileData;
  selectedModules: ModuleId[];
  moduleSetups: {
    goals_habits?: GoalSetupData;
    sleep_wellbeing?: SleepSetupData;
    training?: TrainingSetupData;
    nutrition?: NutritionSetupData;
    calendar?: CalendarSetupData;
    work_focus?: WorkSetupData;
    family?: FamilySetupData;
    colors?: ColorSetupData;
  };
  coachTone: CoachTone;
}
