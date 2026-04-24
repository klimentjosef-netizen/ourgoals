import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function WellbeingLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-7 w-28" />
      </div>
      {/* Sleep stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="pt-4"><Skeleton className="h-16" /></CardContent></Card>
        <Card><CardContent className="pt-4"><Skeleton className="h-16" /></CardContent></Card>
      </div>
      {/* Sleep log list */}
      <Card>
        <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </CardContent>
      </Card>
    </div>
  );
}
