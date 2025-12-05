import { Skeleton } from "./ui/skeleton";

const HallOfFameSkeleton = () => {
  return (
    <>
      {/* Desktop: Tile card skeleton grid */}
      <div className="hidden lg:grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((rank) => (
          <div
            key={rank}
            className="relative overflow-hidden rounded-xl border border-border bg-card"
            style={{ animationDelay: `${(rank - 1) * 100}ms` }}
          >
            {/* Image skeleton with shimmer */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <div className="absolute inset-0 shimmer-effect" />
              {/* Rank badge skeleton */}
              <div className="absolute top-3 left-3 w-10 h-10 rounded-lg bg-muted-foreground/20 shimmer-effect" />
              {/* Product type badge skeleton */}
              <div className="absolute top-3 right-3 w-16 h-6 rounded-full bg-muted-foreground/20 shimmer-effect" />
              {/* Score overlay skeleton */}
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-muted to-transparent">
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <div className="w-16 h-6 rounded bg-muted-foreground/30 shimmer-effect" />
                </div>
                <div className="absolute bottom-3 right-4">
                  <div className="w-20 h-4 rounded bg-muted-foreground/30 shimmer-effect" />
                </div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-full shimmer-effect" />
              <Skeleton className="h-4 w-2/3 shimmer-effect" />
            </div>
          </div>
        ))}
      </div>

      {/* Tablet & Mobile: Stacked list skeleton */}
      <div className="lg:hidden max-w-2xl mx-auto space-y-3">
        {[1, 2, 3, 4, 5].map((rank) => (
          <div
            key={rank}
            className="relative overflow-hidden rounded-xl border border-border bg-card"
            style={{ animationDelay: `${(rank - 1) * 100}ms` }}
          >
            {/* Mobile skeleton */}
            <div className="md:hidden relative min-h-[100px] p-3">
              <div className="flex items-center gap-3">
                {/* Rank badge skeleton */}
                <div className="shrink-0 w-12 h-12 rounded-lg bg-muted shimmer-effect" />
                
                {/* Content skeleton */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-full shimmer-effect" />
                  <Skeleton className="h-3 w-1/2 shimmer-effect" />
                  <Skeleton className="h-3 w-2/3 shimmer-effect" />
                </div>
                
                {/* Score skeleton */}
                <div className="shrink-0 w-14 h-14 rounded-lg bg-muted shimmer-effect" />
              </div>
            </div>

            {/* Tablet skeleton */}
            <div className="hidden md:flex lg:hidden items-center gap-5 p-4">
              {/* Rank badge skeleton */}
              <div className="shrink-0 w-14 h-14 rounded-lg bg-muted shimmer-effect" />
              
              {/* Image skeleton */}
              <div className="shrink-0 w-32 h-20 rounded-lg bg-muted shimmer-effect" />
              
              {/* Content skeleton */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-full shimmer-effect" />
                <Skeleton className="h-3 w-1/3 shimmer-effect" />
                <Skeleton className="h-3 w-1/4 shimmer-effect" />
              </div>
              
              {/* Score skeleton */}
              <div className="shrink-0 w-20 h-12 rounded-lg bg-muted shimmer-effect" />
            </div>
          </div>
        ))}
      </div>

      {/* Custom shimmer animation styles */}
      <style>{`
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default HallOfFameSkeleton;
