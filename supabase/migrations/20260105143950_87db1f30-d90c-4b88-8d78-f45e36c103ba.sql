-- Add column to exclude reviews from Best of the Best nomination
ALTER TABLE public.reviews 
ADD COLUMN exclude_from_best boolean DEFAULT false;