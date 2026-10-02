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
        
        await supabase.rpc("record_review_view", {
          _review_id: reviewId,
          _fingerprint: fingerprint,
        });

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