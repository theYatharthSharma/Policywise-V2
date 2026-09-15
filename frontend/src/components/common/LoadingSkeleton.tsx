import { Skeleton } from "@/components/ui/skeleton";

export function PolicyCardSkeleton() {
  return (
    <div className="rounded-2xl border p-5">
      <Skeleton className="mb-4 h-28 w-full rounded-xl" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <div className="mt-4 flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => <PolicyCardSkeleton key={i} />)}
    </div>
  );
}
