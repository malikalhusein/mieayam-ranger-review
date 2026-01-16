import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const VIEWER_ID_KEY = "mieayam-viewer-id";

// Generate a unique viewer fingerprint
const getViewerFingerprint = () => {
  let id = localStorage.getItem(VIEWER_ID_KEY);
  if (!id) {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    id = `${timestamp}-${randomPart}`;
    localStorage.setItem(VIEWER_ID_KEY, id);
  }
  return id;
};

export const useViewTracking = (reviewId: string | undefined) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (!reviewId || tracked.current) return;

    const trackView = async () => {
      try {
        const fingerprint = getViewerFingerprint();
        
        // Insert view record (duplicates are fine, we just count total)
        await supabase
          .from("review_views")
          .insert({
            review_id: reviewId,
            viewer_fingerprint: fingerprint
          });

        // Update the cached view_count on the review
        // This is a simple increment - in production you might use a database function
        const { data: currentReview } = await supabase
          .from("reviews")
          .select("view_count")
          .eq("id", reviewId)
          .single();

        if (currentReview) {
          await supabase
            .from("reviews")
            .update({ view_count: (currentReview.view_count || 0) + 1 })
            .eq("id", reviewId);
        }

        tracked.current = true;
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    };

    // Delay tracking to ensure it's a real view
    const timer = setTimeout(trackView, 2000);
    return () => clearTimeout(timer);
  }, [reviewId]);
};

export default useViewTracking;