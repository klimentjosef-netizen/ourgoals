import {
  Dumbbell,
  Briefcase,
  Coins,
  BookOpen,
  Heart,
  Brain,
  Home,
  Pin,
  TrendingUp,
  Repeat,
  CheckCircle2,
  Flame,
  Users,
  type LucideIcon,
} from "lucide-react";

// ===== GOAL TYPES =====

export type GoalType = "measurable" | "habit" | "oneoff" | "challenge" | "shared";

export interface GoalTypeConfig {
  id: GoalType;
  label: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
}

export const GOAL_TYPES: GoalTypeConfig[] = [
  {
    id: "measurable",
    label: "Měřitelný",
    description: "Cíl s číslem: od A do B (váha, úspory, výkon)",
    icon: TrendingUp,
    emoji: "📊",
  },
  {
    id: "habit",
    label: "Návykový",
    description: "Opakujíc�� se aktivita: X-krát týdně (cvičení, čtení)",
    icon: Repeat,
    emoji: "🔄",
  },
  {
    id: "oneoff",
    label: "Jednorázový",
    description: "Splnit jednu věc: hotovo nebo ne (maraton, certifikát)",
    icon: CheckCircle2,
    emoji: "✅",
  },
  {
    id: "challenge",
    label: "Challenge",
    description: "X dní po sobě bez přerušení (30 dní bez cukru)",
    icon: Flame,
    emoji: "🔥",
  },
  {
    id: "shared",
    label: "Společný",
    description: "S partnerem: oba přispíváte (ušetřit, společný streak)",
    icon: Users,
    emoji: "👫",
  },
];

export function getGoalTypeConfig(type: GoalType): GoalTypeConfig {
  return GOAL_TYPES.find((t) => t.id === type) ?? GOAL_TYPES[0];
}

// ===== GOAL AREAS =====

export type GoalArea = "health" | "work" | "finance" | "growth" | "relationships" | "mental" | "home" | "other";

export interface GoalAreaConfig {
  id: GoalArea;
  label: string;
  icon: LucideIcon;
  emoji: string;
  color: string;
}

export const GOAL_AREAS: GoalAreaConfig[] = [
  { id: "health", label: "Zdraví & tělo", icon: Dumbbell, emoji: "🏋️", color: "text-green-500" },
  { id: "work", label: "Práce & kariéra", icon: Briefcase, emoji: "💼", color: "text-blue-500" },
  { id: "finance", label: "Finance", icon: Coins, emoji: "💰", color: "text-yellow-500" },
  { id: "growth", label: "Osobní rozvoj", icon: BookOpen, emoji: "📚", color: "text-purple-500" },
  { id: "relationships", label: "Vztahy", icon: Heart, emoji: "❤️", color: "text-pink-500" },
  { id: "mental", label: "Duševn�� zdraví", icon: Brain, emoji: "🧠", color: "text-cyan-500" },
  { id: "home", label: "Domácnost", icon: Home, emoji: "🏠", color: "text-orange-500" },
  { id: "other", label: "Jiné", icon: Pin, emoji: "📌", color: "text-gray-500" },
];

export function getGoalAreaConfig(area: GoalArea): GoalAreaConfig {
  return GOAL_AREAS.find((a) => a.id === area) ?? GOAL_AREAS[7];
}

// ===== FREQUENCIES =====

export type GoalFrequency = "daily" | "3x_week" | "4x_week" | "5x_week" | "weekly";

export const GOAL_FREQUENCIES: { value: GoalFrequency; label: string }[] = [
  { value: "daily", label: "Každý den" },
  { value: "3x_week", label: "3× týdně" },
  { value: "4x_week", label: "4× týdně" },
  { value: "5x_week", label: "5× týdně" },
  { value: "weekly", label: "1�� týdně" },
];

// ===== CHALLENGE PRESETS =====

export const CHALLENGE_PRESETS = [
  { days: 7, label: "7 dní" },
  { days: 14, label: "14 dní" },
  { days: 21, label: "21 dní" },
  { days: 30, label: "30 dní" },
  { days: 60, label: "60 dní" },
  { days: 90, label: "90 dní" },
  { days: 100, label: "100 dní" },
];
