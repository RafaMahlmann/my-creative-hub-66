
-- Storage bucket for profile/hero images
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-assets', 'hero-assets', true);

-- Anyone can view
CREATE POLICY "Public read hero assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-assets');

-- Only admins can upload/update/delete
CREATE POLICY "Admins can upload hero assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hero assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hero assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-assets' AND public.has_role(auth.uid(), 'admin'));

-- Table to store site settings (profile photo URL, background URL, etc.)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Public read site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert site settings"
ON public.site_settings FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site settings"
ON public.site_settings FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
