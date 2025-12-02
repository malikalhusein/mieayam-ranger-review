-- Add menu_image_url column for storing menu photos
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS menu_image_url text;