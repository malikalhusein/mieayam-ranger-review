-- Add new columns for enhanced scoring system

-- Add new column for Kuah (broth) indicators
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS kuah_kejernihan integer CHECK (kuah_kejernihan >= 0 AND kuah_kejernihan <= 10);

-- Add new columns for Goreng (fried) indicators
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS goreng_keseimbangan_minyak integer CHECK (goreng_keseimbangan_minyak >= 0 AND goreng_keseimbangan_minyak <= 10);

ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS goreng_bumbu_tumisan integer CHECK (goreng_bumbu_tumisan >= 0 AND goreng_bumbu_tumisan <= 10);

ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS goreng_aroma_tumisan integer CHECK (goreng_aroma_tumisan >= 0 AND goreng_aroma_tumisan <= 10);

-- Add comments for documentation
COMMENT ON COLUMN public.reviews.kuah_kejernihan IS 'Kejernihan/Visual Kuah (0-10) - only for kuah type';
COMMENT ON COLUMN public.reviews.goreng_keseimbangan_minyak IS 'Keseimbangan Minyak (0-10) - only for goreng type';
COMMENT ON COLUMN public.reviews.goreng_bumbu_tumisan IS 'Bumbu Tumisan/Coating (0-10) - only for goreng type';
COMMENT ON COLUMN public.reviews.goreng_aroma_tumisan IS 'Aroma Tumisan (0-10) - only for goreng type';