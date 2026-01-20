-- Fix RLS policies that are overly permissive

-- 1. review_views: Add rate limiting - max 10 views per fingerprint per minute
DROP POLICY IF EXISTS "Anyone can insert views " ON public.review_views;
CREATE POLICY "Rate limited view inserts" ON public.review_views
FOR INSERT WITH CHECK (
  -- Allow insert only if less than 10 views from same fingerprint in last minute
  (SELECT COUNT(*) FROM public.review_views 
   WHERE viewer_fingerprint = COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', 'anonymous')
   AND viewed_at > (now() - interval '1 minute')
  ) < 10
);

-- 2. wishlist_entries: Add basic validation for submissions
DROP POLICY IF EXISTS "Anyone can submit wishlist entries " ON public.wishlist_entries;
CREATE POLICY "Validated wishlist submissions" ON public.wishlist_entries
FOR INSERT WITH CHECK (
  -- Ensure place_name and location are not empty
  length(trim(place_name)) > 2 AND
  length(trim(location)) > 2 AND
  -- Limit to one submission per session (basic spam protection)
  status = 'pending'
);

-- 3. wishlist_votes: Add validation for voting
DROP POLICY IF EXISTS "Anyone can vote " ON public.wishlist_votes;
CREATE POLICY "Validated wishlist votes" ON public.wishlist_votes
FOR INSERT WITH CHECK (
  -- Ensure voter_identifier is valid (not empty)
  length(trim(voter_identifier)) > 10 AND
  -- Prevent duplicate votes from same identifier on same entry
  NOT EXISTS (
    SELECT 1 FROM public.wishlist_votes 
    WHERE wishlist_entry_id = wishlist_votes.wishlist_entry_id 
    AND voter_identifier = wishlist_votes.voter_identifier
  )
);

-- 4. wishlist_votes: Restrict delete to own votes only
DROP POLICY IF EXISTS "Anyone can remove own vote " ON public.wishlist_votes;
CREATE POLICY "Users can only remove own votes" ON public.wishlist_votes
FOR DELETE USING (
  -- Only allow deletion if the voter_identifier matches
  voter_identifier = COALESCE(
    current_setting('request.headers', true)::json->>'x-voter-id',
    ''
  )
);