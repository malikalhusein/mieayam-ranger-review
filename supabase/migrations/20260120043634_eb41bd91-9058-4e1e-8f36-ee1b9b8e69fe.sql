-- Remove old permissive policies that were not dropped correctly

-- Remove old review_views policy with trailing space
DROP POLICY IF EXISTS "Anyone can insert views" ON public.review_views;

-- Remove old wishlist_entries policy with trailing space
DROP POLICY IF EXISTS "Anyone can submit wishlist entries" ON public.wishlist_entries;

-- Remove old wishlist_votes policies with trailing spaces
DROP POLICY IF EXISTS "Anyone can vote" ON public.wishlist_votes;
DROP POLICY IF EXISTS "Anyone can remove own vote" ON public.wishlist_votes;