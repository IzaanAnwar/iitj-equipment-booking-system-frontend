import { Skeleton } from '@/components/ui/skeleton';

export default async function Loading() {
  return (
    <main className="space-y-6 px-2 py-12 md:px-10 lg:px-20">
      <Skeleton className="h-96 w-full" />
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-12 w-44" />
        <Skeleton className="h-12 w-44" />
      </div>
    </main>
  );
}
