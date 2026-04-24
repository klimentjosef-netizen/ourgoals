import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function GoalsLoading() {
  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
      {/* Habit checklist */}
      <Card>
        <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </CardContent>
      </Card>
      {/* Goal cards */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-full rounded-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-full rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}
