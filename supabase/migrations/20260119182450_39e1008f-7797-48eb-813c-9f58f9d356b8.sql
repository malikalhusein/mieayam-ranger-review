-- Add new topping columns
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS topping_jamur boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS topping_tauge boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS topping_acar boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS topping_kerupuk boolean DEFAULT false;