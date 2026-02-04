-- Drop ALL existing restrictive SELECT policies and recreate as permissive
-- Reviews table - drop all variations of the policy name
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews " ON public.reviews;

-- Review views table
DROP POLICY IF EXISTS "Anyone can read views" ON public.review_views;
DROP POLICY IF EXISTS "Anyone can read views " ON public.review_views;

-- Wishlist entries
DROP POLICY IF EXISTS "Anyone can view approved wishlist entries" ON public.wishlist_entries;
DROP POLICY IF EXISTS "Anyone can view approved wishlist entries " ON public.wishlist_entries;

-- Wishlist votes
DROP POLICY IF EXISTS "Anyone can view votes" ON public.wishlist_votes;
DROP POLICY IF EXISTS "Anyone can view votes " ON public.wishlist_votes;

-- Now recreate all as PERMISSIVE policies (default is permissive when not specified as RESTRICTIVE)
CREATE POLICY "Public can view reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Public can read views" ON public.review_views
FOR SELECT USING (true);

CREATE POLICY "Public can view approved wishlist entries" ON public.wishlist_entries
FOR SELECT USING (status = 'approved');

CREATE POLICY "Public can view votes" ON public.wishlist_votes
FOR SELECT USING (true);