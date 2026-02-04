# Self-Hosted Supabase Setup Guide

Panduan lengkap untuk deploy Mie Ayam Ranger ke Supabase project kamu sendiri.

## 📋 Prerequisites

1. Akun Supabase (https://supabase.com)
2. Project Supabase baru
3. Supabase CLI terinstall (untuk edge functions)

---

## 🗄️ Database Schema

Jalankan SQL berikut di **SQL Editor** Supabase:

### 1. Create Enum Types

```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

### 2. Create Tables

```sql
-- ================================
-- REVIEWS TABLE (Main table)
-- ================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  visit_date DATE NOT NULL,
  price INTEGER NOT NULL,
  product_type TEXT NOT NULL, -- 'kuah' or 'goreng'
  
  -- Kuah (soup) specific scores
  kuah_kekentalan INTEGER,
  kuah_kaldu INTEGER,
  kuah_keseimbangan INTEGER,
  kuah_aroma INTEGER,
  kuah_kejernihan INTEGER,
  
  -- Goreng (fried) specific scores
  goreng_keseimbangan_minyak INTEGER,
  goreng_bumbu_tumisan INTEGER,
  goreng_aroma_tumisan INTEGER,
  
  -- Common scores
  mie_tekstur INTEGER,
  mie_tipe TEXT,
  ayam_bumbu INTEGER,
  ayam_potongan INTEGER,
  
  -- Facility scores
  fasilitas_kebersihan INTEGER,
  fasilitas_alat_makan INTEGER,
  fasilitas_tempat INTEGER,
  
  -- Service
  service_durasi INTEGER DEFAULT 0,
  
  -- Perceptual mapping (-5 to +5)
  complexity INTEGER,
  sweetness INTEGER,
  
  -- Toppings (boolean flags)
  topping_ceker BOOLEAN DEFAULT false,
  topping_bakso BOOLEAN DEFAULT false,
  topping_ekstra_ayam BOOLEAN DEFAULT false,
  topping_ekstra_sawi BOOLEAN DEFAULT false,
  topping_balungan BOOLEAN DEFAULT false,
  topping_tetelan BOOLEAN DEFAULT false,
  topping_mie_jumbo BOOLEAN DEFAULT false,
  topping_jenis_mie BOOLEAN DEFAULT false,
  topping_pangsit_basah BOOLEAN DEFAULT false,
  topping_pangsit_kering BOOLEAN DEFAULT false,
  topping_dimsum BOOLEAN DEFAULT false,
  topping_variasi_bumbu BOOLEAN DEFAULT false,
  topping_bawang_daun BOOLEAN DEFAULT false,
  topping_jamur BOOLEAN DEFAULT false,
  topping_tauge BOOLEAN DEFAULT false,
  topping_acar BOOLEAN DEFAULT false,
  topping_kerupuk BOOLEAN DEFAULT false,
  
  -- Badges
  editor_choice BOOLEAN DEFAULT false,
  take_it_or_leave_it BOOLEAN DEFAULT false,
  exclude_from_best BOOLEAN DEFAULT false,
  
  -- Media
  image_url TEXT,
  image_urls TEXT[] DEFAULT ARRAY[]::text[],
  menu_image_url TEXT,
  google_map_url TEXT,
  
  -- Metadata
  notes TEXT,
  slug TEXT,
  overall_score NUMERIC,
  view_count INTEGER DEFAULT 0,
  compare_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for slug
CREATE UNIQUE INDEX reviews_slug_idx ON public.reviews(slug) WHERE slug IS NOT NULL;

-- ================================
-- REVIEW VIEWS TABLE (View tracking)
-- ================================
CREATE TABLE public.review_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  viewer_fingerprint TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for rate limiting
CREATE INDEX review_views_fingerprint_time_idx ON public.review_views(viewer_fingerprint, viewed_at);

-- ================================
-- USER ROLES TABLE (Admin management)
-- ================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- ================================
-- WISHLIST ENTRIES TABLE
-- ================================
CREATE TABLE public.wishlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_name TEXT NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================
-- WISHLIST VOTES TABLE
-- ================================
CREATE TABLE public.wishlist_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_entry_id UUID REFERENCES public.wishlist_entries(id) ON DELETE CASCADE,
  voter_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for duplicate prevention
CREATE INDEX wishlist_votes_entry_voter_idx ON public.wishlist_votes(wishlist_entry_id, voter_identifier);
```

### 3. Create Functions

```sql
-- ================================
-- SLUG GENERATOR FUNCTION
-- ================================
CREATE OR REPLACE FUNCTION public.generate_slug(name text)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
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
$$;

-- ================================
-- AUTO-SET SLUG TRIGGER FUNCTION
-- ================================
CREATE OR REPLACE FUNCTION public.set_review_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.outlet_name);
  END IF;
  RETURN NEW;
END;
$$;

-- ================================
-- IS ADMIN CHECK FUNCTION
-- ================================
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- ================================
-- UPDATE TIMESTAMP FUNCTION
-- ================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### 4. Create Triggers

```sql
-- Auto-generate slug for new reviews
CREATE TRIGGER set_review_slug_trigger
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_review_slug();

-- Auto-update updated_at for reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at for wishlist_entries
CREATE TRIGGER update_wishlist_entries_updated_at
  BEFORE UPDATE ON public.wishlist_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 🔒 Row Level Security (RLS) Policies

### Enable RLS on all tables

```sql
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_votes ENABLE ROW LEVEL SECURITY;
```

### Reviews Policies

```sql
-- Public can view all reviews
CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Only admins can insert reviews
CREATE POLICY "Admins can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Only admins can update reviews
CREATE POLICY "Admins can update reviews" ON public.reviews
  FOR UPDATE USING (is_admin(auth.uid()));

-- Only admins can delete reviews
CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE USING (is_admin(auth.uid()));
```

### Review Views Policies

```sql
-- Public can read view counts
CREATE POLICY "Public can read views" ON public.review_views
  FOR SELECT USING (true);

-- Rate-limited inserts (max 10 per minute per fingerprint)
CREATE POLICY "Rate limited view inserts" ON public.review_views
  FOR INSERT WITH CHECK (
    (SELECT count(*) FROM review_views 
     WHERE viewer_fingerprint = COALESCE(
       (current_setting('request.headers', true)::json->>'x-forwarded-for'), 
       'anonymous'
     )
     AND viewed_at > (now() - interval '1 minute')
    ) < 10
  );
```

### User Roles Policies

```sql
-- Users can only view their own roles
CREATE POLICY "Authenticated users can view only their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Only admins can assign roles
CREATE POLICY "Only admins can assign roles" ON public.user_roles
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Only admins can modify roles
CREATE POLICY "Only admins can modify roles" ON public.user_roles
  FOR UPDATE USING (is_admin(auth.uid()));

-- Only admins can remove roles
CREATE POLICY "Only admins can remove roles" ON public.user_roles
  FOR DELETE USING (is_admin(auth.uid()));
```

### Wishlist Entries Policies

```sql
-- Public can view approved entries
CREATE POLICY "Public can view approved wishlist entries" ON public.wishlist_entries
  FOR SELECT USING (status = 'approved');

-- Admins can view all entries
CREATE POLICY "Admins can view all wishlist entries" ON public.wishlist_entries
  FOR SELECT USING (is_admin(auth.uid()));

-- Validated submissions (pending status, min length)
CREATE POLICY "Validated wishlist submissions" ON public.wishlist_entries
  FOR INSERT WITH CHECK (
    length(trim(place_name)) > 2 
    AND length(trim(location)) > 2 
    AND status = 'pending'
  );

-- Only admins can update
CREATE POLICY "Admins can update wishlist entries" ON public.wishlist_entries
  FOR UPDATE USING (is_admin(auth.uid()));

-- Only admins can delete
CREATE POLICY "Admins can delete wishlist entries" ON public.wishlist_entries
  FOR DELETE USING (is_admin(auth.uid()));
```

### Wishlist Votes Policies

```sql
-- Public can view votes
CREATE POLICY "Public can view votes" ON public.wishlist_votes
  FOR SELECT USING (true);

-- Validated votes (prevent duplicates)
CREATE POLICY "Validated wishlist votes" ON public.wishlist_votes
  FOR INSERT WITH CHECK (
    length(trim(voter_identifier)) > 10 
    AND NOT EXISTS (
      SELECT 1 FROM wishlist_votes 
      WHERE wishlist_entry_id = wishlist_votes.wishlist_entry_id 
      AND voter_identifier = wishlist_votes.voter_identifier
    )
  );

-- Users can only remove own votes
CREATE POLICY "Users can only remove own votes" ON public.wishlist_votes
  FOR DELETE USING (
    voter_identifier = COALESCE(
      (current_setting('request.headers', true)::json->>'x-voter-id'), 
      ''
    )
  );
```

---

## 📦 Storage Bucket

Create a storage bucket for review images:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true);

-- Allow public read access
CREATE POLICY "Public can view review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

-- Allow admins to upload
CREATE POLICY "Admins can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images' 
    AND (SELECT is_admin(auth.uid()))
  );

-- Allow admins to update
CREATE POLICY "Admins can update review images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'review-images' 
    AND (SELECT is_admin(auth.uid()))
  );

-- Allow admins to delete
CREATE POLICY "Admins can delete review images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-images' 
    AND (SELECT is_admin(auth.uid()))
  );
```

---

## 👤 Create Admin User

Setelah setup database, buat user admin pertama:

1. Register user baru melalui Supabase Auth (Dashboard > Authentication > Users > Add User)
2. Jalankan SQL berikut untuk assign admin role:

```sql
-- Replace 'YOUR_USER_ID' dengan UUID user yang baru dibuat
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

---

## ⚡ Edge Functions

### Environment Variables (Secrets)

Set secrets berikut di Supabase Dashboard > Edge Functions > Secrets:

| Secret Name | Description |
|-------------|-------------|
| `SUPABASE_URL` | URL project Supabase kamu |
| `SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (untuk admin operations) |
| `LOVABLE_API_KEY` | (Opsional) Untuk AI chatbot & scorecard generator |
| `RESEND_API_KEY` | (Opsional) Untuk email notifications |

### Deploy Edge Functions

Gunakan Supabase CLI:

```bash
# Login ke Supabase
supabase login

# Link ke project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy semua functions
supabase functions deploy mieayam-chat
supabase functions deploy sitemap
supabase functions deploy generate-scorecard
supabase functions deploy send-wishlist-notification
supabase functions deploy create-admin
```

### Edge Function Configurations

Tambahkan ke `supabase/config.toml`:

```toml
[functions.sitemap]
verify_jwt = false

[functions.mieayam-chat]
verify_jwt = false

[functions.send-wishlist-notification]
verify_jwt = false
```

---

## 🔧 Frontend Configuration

Update `.env` di frontend:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_REF
```

Update `src/integrations/supabase/client.ts` jika perlu dengan URL dan key baru.

---

## 📝 Notes

1. **AI Features**: `mieayam-chat` dan `generate-scorecard` menggunakan Lovable AI Gateway. Jika tidak punya access, kamu perlu modifikasi untuk pakai OpenAI API langsung.

2. **Email Notifications**: `send-wishlist-notification` menggunakan Resend. Ganti dengan provider email lain jika perlu.

3. **Sitemap**: Edge function `sitemap` di-hardcode ke `mieayamranger.web.id`. Update `baseUrl` sesuai domain kamu.

---

## 🚀 Quick Start Checklist

- [ ] Create Supabase project
- [ ] Run all schema SQL
- [ ] Run all RLS policies SQL
- [ ] Create storage bucket
- [ ] Create admin user
- [ ] Set edge function secrets
- [ ] Deploy edge functions
- [ ] Update frontend .env
- [ ] Test login & CRUD operations
