import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  initialItemsCount?: number;
  itemsPerLoad?: number;
}

export function useInfiniteScroll<T>(
  items: T[],
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 200, initialItemsCount = 9, itemsPerLoad = 6 } = options;
  
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset when items change
  useEffect(() => {
    setDisplayedItems(items.slice(0, initialItemsCount));
    setHasMore(items.length > initialItemsCount);
  }, [items, initialItemsCount]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simulate slight delay for smooth UX
    setTimeout(() => {
      const currentLength = displayedItems.length;
      const nextItems = items.slice(currentLength, currentLength + itemsPerLoad);
      
      setDisplayedItems(prev => [...prev, ...nextItems]);
      setHasMore(currentLength + nextItems.length < items.length);
      setIsLoading(false);
    }, 300);
  }, [displayedItems.length, items, itemsPerLoad, hasMore, isLoading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading, threshold]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    loaderRef,
    totalCount: items.length,
    loadedCount: displayedItems.length,
  };
}
