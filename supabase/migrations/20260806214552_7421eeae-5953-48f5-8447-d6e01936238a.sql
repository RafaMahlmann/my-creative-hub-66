CREATE TABLE public.subtitles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('pt','en')),
  content text NOT NULL DEFAULT '',
  is_auto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (video_id, language)
);

GRANT SELECT ON public.subtitles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtitles TO authenticated;
GRANT ALL ON public.subtitles TO service_role;

ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage subtitles"
ON public.subtitles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view subtitles of published lessons"
ON public.subtitles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN courses c ON c.id = m.course_id
    WHERE l.video_id = subtitles.video_id AND l.is_published AND m.is_published AND c.is_published
  )
  OR EXISTS (
    SELECT 1 FROM courses c WHERE c.trailer_video_id = subtitles.video_id AND c.is_published
  )
);

CREATE TRIGGER update_subtitles_updated_at
BEFORE UPDATE ON public.subtitles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();