"use client";

import { useTransition } from "react";
import { updateProfile } from "@/app/(app)/settings/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  displayName: string;
  dateOfBirth: string | null;
}

export function ProfileForm({ displayName, dateOfBirth }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profil uložen");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Jméno</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          placeholder="Tvoje jméno"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Datum narození</Label>
        <Input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          defaultValue={dateOfBirth ?? ""}
          className="h-11"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Ukládám..." : "Uložit profil"}
      </Button>
    </form>
  );
}
