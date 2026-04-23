import { MODULE_REGISTRY, type ModuleId } from "@/types/modules";
import * as flags from "@/lib/flags";

export function getAvailableModules() {
  return MODULE_REGISTRY.filter((m) => {
    if (m.featureFlag) {
      const flagValue = (flags as Record<string, boolean>)[m.featureFlag];
      return flagValue === true;
    }
    return true;
  });
}

export function isModuleActive(
  activeModules: ModuleId[],
  moduleId: ModuleId
): boolean {
  return activeModules.includes(moduleId);
}

export function getNavItemsForModules(activeModules: ModuleId[]) {
  const alwaysVisible = ["/dashboard", "/profile"];
  const moduleRoutes = MODULE_REGISTRY.filter((m) =>
    activeModules.includes(m.id)
  ).flatMap((m) => m.routes);
  return [...alwaysVisible, ...moduleRoutes];
}
