import { create } from "zustand";
import type { ModuleId } from "@/types/modules";
import type { CoachTone } from "@/types/gamification";
import type { ProfileData } from "@/types/onboarding";

interface OnboardingState {
  currentStep: number;
  profile: ProfileData;
  selectedModules: ModuleId[];
  moduleSetups: Record<string, Record<string, unknown>>;
  coachTone: CoachTone;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setProfile: (data: Partial<ProfileData>) => void;
  setModules: (modules: ModuleId[]) => void;
  toggleModule: (moduleId: ModuleId) => void;
  setModuleSetup: (moduleId: string, data: Record<string, unknown>) => void;
  setCoachTone: (tone: CoachTone) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  profile: { displayName: "", dateOfBirth: "", timezone: "Europe/Prague" },
  selectedModules: [] as ModuleId[],
  moduleSetups: {} as Record<string, Record<string, unknown>>,
  coachTone: "friendly_mentor" as CoachTone,
};

export const useOnboarding = create<OnboardingState>((set) => ({
  ...initialState,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () =>
    set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  setProfile: (data) =>
    set((s) => ({ profile: { ...s.profile, ...data } })),
  setModules: (modules) => set({ selectedModules: modules }),
  toggleModule: (moduleId) =>
    set((s) => ({
      selectedModules: s.selectedModules.includes(moduleId)
        ? s.selectedModules.filter((m) => m !== moduleId)
        : [...s.selectedModules, moduleId],
    })),
  setModuleSetup: (moduleId, data) =>
    set((s) => ({
      moduleSetups: { ...s.moduleSetups, [moduleId]: data },
    })),
  setCoachTone: (tone) => set({ coachTone: tone }),
  reset: () => set(initialState),
}));
