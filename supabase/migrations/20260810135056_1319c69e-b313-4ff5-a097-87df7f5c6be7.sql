ALTER TABLE public.lesson_materials
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS size_bytes  bigint;

-- Só o admin coloca, troca e remove arquivo.
CREATE POLICY "Admins manage course materials"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read materials of free published lessons"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'course-materials' AND EXISTS (
      SELECT 1 FROM public.lesson_materials lm
      JOIN public.lessons l ON l.id = lm.lesson_id
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE lm.storage_path = storage.objects.name
        AND l.is_free AND l.is_published AND m.is_published AND c.is_published
    )
  );

CREATE POLICY "Signed in students read course materials"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'course-materials');

ALTER TABLE public.lesson_materials ALTER COLUMN file_url DROP NOT NULL;

ALTER TABLE public.lesson_materials
  DROP CONSTRAINT IF EXISTS lesson_materials_origem_check;
ALTER TABLE public.lesson_materials
  ADD CONSTRAINT lesson_materials_origem_check
  CHECK (file_url IS NOT NULL OR storage_path IS NOT NULL);