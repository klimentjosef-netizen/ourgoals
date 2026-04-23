import { z } from "zod/v4";
import type { ModuleId } from "./modules";
import type { CoachTone } from "./gamification";

export const profileSchema = z.object({
  displayName: z.string().min(1, "Jméno je povinné"),
  dateOfBirth: z.string().optional(),
  timezone: z.string().default("Europe/Prague"),
});

export type ProfileData = z.infer<typeof profileSchema>;

export const goalSetupSchema = z.object({
  title: z.string().min(1, "Název cíle je povinný"),
  description: z.string().optional(),
  metric: z.string().optional(),
  targetValue: z.number().optional(),
  startValue: z.number().optional(),
  targetDate: z.string().optional(),
});

export type GoalSetupData = z.infer<typeof goalSetupSchema>;

export const sleepSetupSchema = z.object({
  bedtimeTarget: z.string().optional(),
  wakeTarget: z.string().optional(),
  trackMood: z.boolean().default(true),
  trackEnergy: z.boolean().default(true),
  trackStress: z.boolean().default(true),
});

export type SleepSetupData = z.infer<typeof sleepSetupSchema>;

export const trainingSetupSchema = z.object({
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  daysPerWeek: z.number().min(1).max(7).optional(),
  weightKg: z.number().optional(),
  heightCm: z.number().optional(),
  bodyFatPct: z.number().optional(),
});

export type TrainingSetupData = z.infer<typeof trainingSetupSchema>;

export const nutritionSetupSchema = z.object({
  targetKcal: z.number().optional(),
  proteinG: z.number().optional(),
  carbsG: z.number().optional(),
  fatG: z.number().optional(),
});

export type NutritionSetupData = z.infer<typeof nutritionSetupSchema>;

export const calendarSetupSchema = z.object({
  workDays: z.array(z.number().min(0).max(6)).optional(),
  fixedCommitments: z.string().optional(),
});

export type CalendarSetupData = z.infer<typeof calendarSetupSchema>;

export const workSetupSchema = z.object({
  workStartTime: z.string().optional(),
  workEndTime: z.string().optional(),
  deepWorkHours: z.number().optional(),
});

export type WorkSetupData = z.infer<typeof workSetupSchema>;

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
  };
  coachTone: CoachTone;
}
