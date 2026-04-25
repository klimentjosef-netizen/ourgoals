"use client";

import { useEffect, useState } from "react";
import { useOnboarding } from "@/lib/hooks/use-onboarding";
import { StepContainer } from "@/components/domain/onboarding/step-container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";

const LOCALE_OPTIONS = [
  { value: "cs", label: "🇨🇿 Čeština" },
  { value: "en", label: "🇬🇧 English" },
  { value: "sk", label: "🇸🇰 Slovenština" },
];

const TIMEZONE_OPTIONS = [
  { value: "Europe/Prague", label: "Evropa/Praha (CET)" },
  { value: "Europe/Bratislava", label: "Evropa/Bratislava (CET)" },
  { value: "Europe/Berlin", label: "Evropa/Berlín (CET)" },
  { value: "Europe/London", label: "Evropa/Londýn (GMT)" },
  { value: "Europe/Paris", label: "Evropa/Paříž (CET)" },
  { value: "Europe/Rome", label: "Evropa/Řím (CET)" },
  { value: "Europe/Warsaw", label: "Evropa/Varšava (CET)" },
  { value: "Europe/Vienna", label: "Evropa/Vídeň (CET)" },
  { value: "America/New_York", label: "Amerika/New York (EST)" },
  { value: "America/Chicago", label: "Amerika/Chicago (CST)" },
  { value: "America/Los_Angeles", label: "Amerika/Los Angeles (PST)" },
  { value: "Asia/Tokyo", label: "Asie/Tokio (JST)" },
  { value: "Australia/Sydney", label: "Austrálie/Sydney (AEST)" },
];

export function StepProfile() {
  const { profile, setProfile, nextStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== profile.timezone) {
      setProfile({ timezone: tz });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (profile.displayName.trim().length < 2) {
      e.displayName = "Jméno musí mít alespoň 2 znaky";
    }
    if (profile.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);
      if (dob > new Date()) e.dateOfBirth = "Datum narození nemůže být v budoucnosti";
      if (dob < new Date("1920-01-01")) e.dateOfBirth = "Neplatné datum narození";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) nextStep();
  }

  // Make sure detected timezone shows in dropdown even if not in our list
  const timezoneInList = TIMEZONE_OPTIONS.some((tz) => tz.value === profile.timezone);
  const displayedTimezones = timezoneInList
    ? TIMEZONE_OPTIONS
    : [{ value: profile.timezone, label: profile.timezone }, ...TIMEZONE_OPTIONS];

  return (
    <StepContainer
      title="O tobě"
      subtitle="Základní informace pro personalizaci."
      helperText="Řekni nám o sobě základní informace."
      icon={User}
      onNext={handleNext}
      canSkip={false}
      canProceed={profile.displayName.trim().length >= 2}
      isFirst
    >
      <div className="space-y-6">
        {/* Jméno */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Jméno *</Label>
          <Input
            id="displayName"
            className="h-11"
            placeholder="Jak ti máme říkat?"
            value={profile.displayName}
            onChange={(e) => {
              setProfile({ displayName: e.target.value });
              if (errors.displayName) setErrors((p) => ({ ...p, displayName: "" }));
            }}
          />
          {errors.displayName && (
            <p className="text-xs text-red-500 mt-1">{errors.displayName}</p>
          )}
        </div>

        {/* Datum narození */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Datum narození</Label>
          <Input
            id="dateOfBirth"
            type="date"
            className="h-11"
            max={new Date().toISOString().split("T")[0]}
            value={profile.dateOfBirth ?? ""}
            onChange={(e) => {
              setProfile({ dateOfBirth: e.target.value });
              if (errors.dateOfBirth) setErrors((p) => ({ ...p, dateOfBirth: "" }));
            }}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Jazyk */}
        <div className="space-y-2">
          <Label>Jazyk</Label>
          <Select
            value={profile.locale ?? "cs"}
            onValueChange={(val) => { if (val) setProfile({ locale: val }); }}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Vyber jazyk" />
            </SelectTrigger>
            <SelectContent>
              {LOCALE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Časové pásmo */}
        <div className="space-y-2">
          <Label>Časové pásmo</Label>
          <Select
            value={profile.timezone}
            onValueChange={(val) => { if (val) setProfile({ timezone: val }); }}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Vyber časové pásmo" />
            </SelectTrigger>
            <SelectContent>
              {displayedTimezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground/70">
            Automaticky detekováno z tvého prohlížeče.
          </p>
        </div>
      </div>
    </StepContainer>
  );
}
