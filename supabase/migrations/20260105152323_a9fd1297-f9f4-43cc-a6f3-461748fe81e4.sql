-- Add topping availability columns to reviews table
ALTER TABLE public.reviews
ADD COLUMN topping_ceker boolean DEFAULT false,
ADD COLUMN topping_bakso boolean DEFAULT false,
ADD COLUMN topping_ekstra_ayam boolean DEFAULT false,
ADD COLUMN topping_ekstra_sawi boolean DEFAULT false,
ADD COLUMN topping_balungan boolean DEFAULT false,
ADD COLUMN topping_tetelan boolean DEFAULT false,
ADD COLUMN topping_mie_jumbo boolean DEFAULT false,
ADD COLUMN topping_jenis_mie boolean DEFAULT false;