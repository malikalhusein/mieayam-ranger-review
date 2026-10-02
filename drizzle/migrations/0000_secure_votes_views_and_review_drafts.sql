-- ===== Wishlist votes: no header trust, no public voter ids =====
DROP POLICY IF EXISTS "Public can view votes" ON public.wishlist_votes;
DROP POLICY IF EXISTS "Users can only remove own votes" ON public.wishlist_votes;
DROP POLICY IF EXISTS "Validated wishlist votes" ON public.wishlist_votes;
CREATE POLICY "Admins can view votes" ON public.wishlist_votes FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
-- No direct INSERT/DELETE: votes go through the functions below.

CREATE OR REPLACE FUNCTION public.has_voted_wishlist(_entry_id uuid, _voter_secret text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, extensions AS $$
  SELECT length(coalesce(_voter_secret,'')) >= 16 AND EXISTS (
    SELECT 1 FROM public.wishlist_votes
    WHERE wishlist_entry_id = _entry_id
      AND voter_identifier IN (encode(digest(_voter_secret, 'sha256'), 'hex'), _voter_secret)
  )
$$;

CREATE OR REPLACE FUNCTION public.toggle_wishlist_vote(_entry_id uuid, _voter_secret text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  h text;
  removed int;
  cnt int;
BEGIN
  IF length(coalesce(_voter_secret,'')) < 16 THEN
    RAISE EXCEPTION 'invalid voter secret';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.wishlist_entries WHERE id = _entry_id AND status = 'approved') THEN
    RAISE EXCEPTION 'wishlist entry not found';
  END IF;
  h := encode(digest(_voter_secret, 'sha256'), 'hex');
  DELETE FROM public.wishlist_votes
   WHERE wishlist_entry_id = _entry_id AND voter_identifier IN (h, _voter_secret);
  GET DIAGNOSTICS removed = ROW_COUNT;
  IF removed = 0 THEN
    INSERT INTO public.wishlist_votes (wishlist_entry_id, voter_identifier) VALUES (_entry_id, h);
  END IF;
  SELECT count(*) INTO cnt FROM public.wishlist_votes WHERE wishlist_entry_id = _entry_id;
  UPDATE public.wishlist_entries SET vote_count = cnt WHERE id = _entry_id;
  RETURN json_build_object('voted', removed = 0, 'vote_count', cnt);
END $$;

REVOKE ALL ON FUNCTION public.has_voted_wishlist(uuid, text) FROM public;
REVOKE ALL ON FUNCTION public.toggle_wishlist_vote(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.has_voted_wishlist(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_wishlist_vote(uuid, text) TO anon, authenticated;

-- ===== Review views: server-side throttle, no header trust =====
DROP POLICY IF EXISTS "Rate limited view inserts" ON public.review_views;
DROP POLICY IF EXISTS "Public can read views" ON public.review_views;
CREATE POLICY "Admins can read views" ON public.review_views FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.record_review_view(_review_id uuid, _fingerprint text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF length(coalesce(_fingerprint,'')) < 8 OR length(_fingerprint) > 100 THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE id = _review_id) THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.review_views WHERE review_id = _review_id
             AND viewer_fingerprint = _fingerprint AND viewed_at > now() - interval '30 minutes') THEN
    RETURN;
  END IF;
  INSERT INTO public.review_views (review_id, viewer_fingerprint) VALUES (_review_id, _fingerprint);
  UPDATE public.reviews SET view_count = coalesce(view_count,0) + 1 WHERE id = _review_id;
END $$;
REVOKE ALL ON FUNCTION public.record_review_view(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_review_view(uuid, text) TO anon, authenticated;

-- ===== Review drafts + idempotency (existing reviews stay published) =====
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS client_request_id text;
CREATE UNIQUE INDEX IF NOT EXISTS reviews_client_request_id_key ON public.reviews(client_request_id) WHERE client_request_id IS NOT NULL;

DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view published reviews" ON public.reviews FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all reviews" ON public.reviews FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));