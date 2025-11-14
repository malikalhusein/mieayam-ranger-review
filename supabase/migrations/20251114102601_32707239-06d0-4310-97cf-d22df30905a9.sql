-- Make service_durasi nullable since it's optional in the form
ALTER TABLE public.reviews
ALTER COLUMN service_durasi DROP NOT NULL,
ALTER COLUMN service_durasi SET DEFAULT 0;