-- Add editor choice and take it or leave it flags
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS editor_choice boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS take_it_or_leave_it boolean DEFAULT false;

-- Add new topping options
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS topping_pangsit_basah boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS topping_pangsit_kering boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS topping_dimsum boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS topping_variasi_bumbu boolean DEFAULT false;