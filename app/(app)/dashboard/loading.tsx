import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      {/* Coach message */}
      <Skeleton className="h-20 w-full rounded-lg" />
      {/* Level + Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card><CardContent className="pt-4"><Skeleton className="h-16" /></CardContent></Card>
        <Card><CardContent className="pt-4"><Skeleton className="h-16" /></CardContent></Card>
      </div>
      {/* Checklist */}
      <Card>
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </CardContent>
      </Card>
    </div>
  );
}
