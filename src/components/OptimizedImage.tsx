import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  priority?: boolean;
  onLoad?: () => void;
}

/**
 * OptimizedImage component with lazy loading and blur placeholder
 */
const OptimizedImage = ({
  src,
  alt,
  className,
  aspectRatio = "4/3",
  priority = false,
  onLoad,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  // Generate blur placeholder from image
  useEffect(() => {
    if (!src || src === "/placeholder.svg") return;

    // Create a tiny version for blur effect
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Create a very small image for blur effect
      const size = 10;
      const aspectRatioNum = img.width / img.height;
      canvas.width = size;
      canvas.height = size / aspectRatioNum;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        setBlurDataUrl(canvas.toDataURL("image/jpeg", 0.5));
      } catch {
        // CORS error - use gradient fallback
        setBlurDataUrl(null);
      }
    };

    img.onerror = () => {
      setBlurDataUrl(null);
    };

    img.src = src;
  }, [src]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden bg-muted", className)}
      style={{ aspectRatio }}
    >
      {/* Blur placeholder */}
      {blurDataUrl && !isLoaded && (
        <img
          src={blurDataUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl"
        />
      )}

      {/* Gradient placeholder when no blur available */}
      {!blurDataUrl && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 animate-pulse" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
        />
      )}

      {/* Loading shimmer overlay */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 shimmer-overlay">
          <div className="shimmer-bar" />
        </div>
      )}

      <style>{`
        .shimmer-overlay {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .shimmer-bar {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmerMove 1.5s infinite;
        }
        @keyframes shimmerMove {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;
