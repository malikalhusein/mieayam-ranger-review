-- Add topping for Bawang Daun (green onion/loncang)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS topping_bawang_daun boolean DEFAULT false;

-- Create wishlist_entries table for community recommendations
CREATE TABLE public.wishlist_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    place_name TEXT NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wishlist_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlist_entries
CREATE POLICY "Anyone can view approved wishlist entries" 
ON public.wishlist_entries 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Anyone can submit wishlist entries" 
ON public.wishlist_entries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all wishlist entries" 
ON public.wishlist_entries 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update wishlist entries" 
ON public.wishlist_entries 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete wishlist entries" 
ON public.wishlist_entries 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wishlist_entries_updated_at
BEFORE UPDATE ON public.wishlist_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();