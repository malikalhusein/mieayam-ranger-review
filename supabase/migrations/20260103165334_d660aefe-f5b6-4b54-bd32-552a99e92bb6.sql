-- Add slug column to reviews table
ALTER TABLE public.reviews ADD COLUMN slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_reviews_slug ON public.reviews(slug) WHERE slug IS NOT NULL;

-- Function to generate slug from outlet_name
CREATE OR REPLACE FUNCTION public.generate_slug(name text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  base_slug := lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  -- Remove leading/trailing hyphens and multiple consecutive hyphens
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.reviews WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update existing reviews with slugs
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, outlet_name FROM public.reviews WHERE slug IS NULL LOOP
    UPDATE public.reviews 
    SET slug = public.generate_slug(r.outlet_name)
    WHERE id = r.id;
  END LOOP;
END $$;

-- Trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION public.set_review_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.outlet_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_set_review_slug
BEFORE INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.set_review_slug();