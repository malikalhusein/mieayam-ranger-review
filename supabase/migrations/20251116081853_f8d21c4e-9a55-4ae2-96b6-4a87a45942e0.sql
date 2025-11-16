-- Remove check constraints that prevent negative values for perceptual mapping scores
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_complexity_check;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_sweetness_check;