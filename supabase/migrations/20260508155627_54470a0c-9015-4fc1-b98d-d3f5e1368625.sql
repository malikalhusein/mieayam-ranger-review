ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_price_min_check CHECK (price >= 1000);