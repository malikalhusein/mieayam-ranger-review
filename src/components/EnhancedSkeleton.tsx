import { Skeleton } from "./ui/skeleton";

interface EnhancedSkeletonProps {
  variant?: "card" | "list" | "hero" | "detail";
  count?: number;
}

const EnhancedSkeleton = ({ variant = "card", count = 1 }: EnhancedSkeletonProps) => {
  const renderCardSkeleton = (index: number) => (
    <div
      key={index}
      className="relative overflow-hidden rounded-xl border border-border bg-card animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <div className="absolute inset-0 skeleton-shimmer" />
        <div className="absolute top-3 right-3 w-16 h-6 rounded-full bg-muted-foreground/10 skeleton-shimmer" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-4/5 skeleton-shimmer" />
        <Skeleton className="h-4 w-2/3 skeleton-shimmer" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-16 skeleton-shimmer" />
          <Skeleton className="h-4 w-20 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );

  const renderListSkeleton = (index: number) => (
    <div
      key={index}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Skeleton className="w-12 h-12 rounded-lg skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-full skeleton-shimmer" />
        <Skeleton className="h-4 w-1/2 skeleton-shimmer" />
      </div>
      <Skeleton className="w-14 h-10 rounded-lg skeleton-shimmer shrink-0" />
    </div>
  );

  const renderHeroSkeleton = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-12 w-3/4 md:w-1/2 skeleton-shimmer" />
        <Skeleton className="h-6 w-2/3 md:w-1/3 skeleton-shimmer" />
        <Skeleton className="h-12 w-48 rounded-full skeleton-shimmer mt-4" />
      </div>
    </div>
  );

  const renderDetailSkeleton = () => (
    <div className="space-y-6 animate-fade-in-up">
      <Skeleton className="aspect-video w-full rounded-xl skeleton-shimmer" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 skeleton-shimmer" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full skeleton-shimmer" />
          <Skeleton className="h-6 w-24 rounded-full skeleton-shimmer" />
        </div>
        <Skeleton className="h-4 w-full skeleton-shimmer" />
        <Skeleton className="h-4 w-2/3 skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 rounded-xl skeleton-shimmer" />
        <Skeleton className="h-24 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );

  return (
    <>
      {variant === "hero" && renderHeroSkeleton()}
      {variant === "detail" && renderDetailSkeleton()}
      {variant === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => renderCardSkeleton(i))}
        </div>
      )}
      {variant === "list" && (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => renderListSkeleton(i))}
        </div>
      )}

      <style>{`
        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
        }
        .skeleton-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 20%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.08) 80%,
            transparent 100%
          );
          animation: skeleton-wave 2s ease-in-out infinite;
        }
        @keyframes skeleton-wave {
          0% {
            left: -150%;
          }
          100% {
            left: 150%;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
};

export default EnhancedSkeleton;
