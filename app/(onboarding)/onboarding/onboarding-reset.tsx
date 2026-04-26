"use client";

import { useEffect, useRef } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";

/**
 * Resetuje onboarding Zustand store při prvním renderování.
 * Řeší problém kdy starý state z localStorage způsobí skok na krok 9.
 */
export function OnboardingReset() {
  const reset = useOnboarding((s) => s.reset);
  const completed = useOnboarding((s) => s.completed);
  const didReset = useRef(false);

  useEffect(() => {
    // Reset jen pokud onboarding ještě nebyl dokončen a ještě jsme neresetovali
    if (!didReset.current && !completed) {
      // Zkontroluj jestli v localStorage je starý state z jiného účtu
      try {
        const stored = localStorage.getItem("ourgoals-onboarding");
        if (stored) {
          const parsed = JSON.parse(stored);
          const step = parsed?.state?.currentStep ?? 0;
          // Pokud je step > 2, pravděpodobně starý účet — resetovat
          if (step > 2) {
            reset();
          }
        }
      } catch {
        reset();
      }
      didReset.current = true;
    }
  }, [reset, completed]);

  return null;
}
