import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCardMenu() {
  return (
    <div className="gap-4 grid grid-cols-2 lg:grid-cols-3 w-full">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={`skelton-card-menu-${index}`}
          className="gap-0 p-0 w-full h-fit"
        >
          <Skeleton className="w-full aspect-square" />

          <CardContent className="space-y-1.5 px-4 py-2">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-5" />
            <Skeleton className="w-3/4 h-5" />
          </CardContent>

          <CardFooter className="flex justify-between items-center gap-2 px-4 py-2">
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/4 h-10" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
