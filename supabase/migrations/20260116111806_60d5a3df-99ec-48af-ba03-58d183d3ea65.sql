-- Add vote_count to wishlist_entries
ALTER TABLE public.wishlist_entries ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- Create wishlist votes tracking table for anonymous voting
CREATE TABLE IF NOT EXISTS public.wishlist_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_entry_id UUID REFERENCES public.wishlist_entries(id) ON DELETE CASCADE,
  voter_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wishlist_entry_id, voter_identifier)
);

-- Enable RLS on wishlist_votes
ALTER TABLE public.wishlist_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can vote (insert)
CREATE POLICY "Anyone can vote" ON public.wishlist_votes FOR INSERT WITH CHECK (true);

-- Anyone can see votes (for counting)
CREATE POLICY "Anyone can view votes" ON public.wishlist_votes FOR SELECT USING (true);

-- Anyone can remove their own vote
CREATE POLICY "Anyone can remove own vote" ON public.wishlist_votes FOR DELETE USING (true);

-- Add view tracking table
CREATE TABLE IF NOT EXISTS public.review_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  viewer_fingerprint TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on review_views
ALTER TABLE public.review_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views
CREATE POLICY "Anyone can insert views" ON public.review_views FOR INSERT WITH CHECK (true);

-- Anyone can read view counts
CREATE POLICY "Anyone can read views" ON public.review_views FOR SELECT USING (true);

-- Add view_count and compare_count cache columns to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS compare_count INTEGER DEFAULT 0;