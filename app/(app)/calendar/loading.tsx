import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-4">
      <Skeleton className="h-8 w-32" />
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      {/* Day columns */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
