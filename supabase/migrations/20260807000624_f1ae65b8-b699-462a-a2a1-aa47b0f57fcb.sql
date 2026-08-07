ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS storage_path text;

CREATE POLICY "Admins manage course videos" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'));