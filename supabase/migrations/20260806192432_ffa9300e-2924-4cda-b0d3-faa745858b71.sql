-- ===== VIDEOS =====
CREATE TYPE public.video_provider AS ENUM ('vimeo','youtube','hls','file');
CREATE TYPE public.video_status AS ENUM ('ideia','gravado','editado','legendado','publicado');

CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  provider public.video_provider NOT NULL DEFAULT 'vimeo',
  ref TEXT,
  duration_seconds INTEGER,
  is_free BOOLEAN NOT NULL DEFAULT false,
  source_path TEXT,
  source_note TEXT,
  status public.video_status NOT NULL DEFAULT 'ideia',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- ===== COURSES =====
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  description_pt TEXT,
  description_en TEXT,
  cover_url TEXT,
  trailer_video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- ===== MODULES =====
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  description_pt TEXT,
  description_en TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);
GRANT SELECT ON public.modules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- ===== LESSONS =====
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  description_pt TEXT,
  description_en TEXT,
  content_pt TEXT,
  content_en TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (module_id, slug)
);
GRANT SELECT ON public.lessons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- ===== LESSON MATERIALS =====
CREATE TABLE public.lesson_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lesson_materials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_materials TO authenticated;
GRANT ALL ON public.lesson_materials TO service_role;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

-- ===== POLICIES =====
CREATE POLICY "Public can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage courses" ON public.courses
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public can view published modules" ON public.modules
  FOR SELECT USING (is_published = true AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.is_published));
CREATE POLICY "Admins manage modules" ON public.modules
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public can view published lessons" ON public.lessons
  FOR SELECT USING (is_published = true AND EXISTS (
    SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_id AND m.is_published AND c.is_published));
CREATE POLICY "Admins manage lessons" ON public.lessons
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public can view videos of published lessons" ON public.videos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
            JOIN public.courses c ON c.id = m.course_id
            WHERE l.video_id = videos.id AND l.is_published AND m.is_published AND c.is_published)
    OR EXISTS (SELECT 1 FROM public.courses c WHERE c.trailer_video_id = videos.id AND c.is_published));
CREATE POLICY "Admins manage videos" ON public.videos
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public can view materials of published lessons" ON public.lesson_materials
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = lesson_id AND l.is_published AND m.is_published AND c.is_published));
CREATE POLICY "Admins manage materials" ON public.lesson_materials
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== TRIGGERS =====
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lesson_materials_updated_at BEFORE UPDATE ON public.lesson_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== INDEXES =====
CREATE INDEX idx_modules_course ON public.modules(course_id, position);
CREATE INDEX idx_lessons_module ON public.lessons(module_id, position);
CREATE INDEX idx_materials_lesson ON public.lesson_materials(lesson_id, position);
