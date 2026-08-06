import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type VideoInfo = {
  id: string;
  provider: 'vimeo' | 'youtube' | 'hls' | 'file';
  ref: string | null;
  duration_seconds: number | null;
  is_free: boolean;
};

export type MaterialRow = {
  id: string;
  title_pt: string;
  title_en: string | null;
  file_url: string;
  file_type: string | null;
  position: number;
};

export type LessonNavItem = {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  is_free: boolean;
  position: number;
  module_id: string;
};

export function useLesson(courseSlug?: string, lessonSlug?: string) {
  return useQuery({
    queryKey: ['lesson', courseSlug, lessonSlug],
    enabled: !!courseSlug && !!lessonSlug,
    queryFn: async () => {
      const { data: course, error: cErr } = await supabase
        .from('courses')
        .select('id, slug, title_pt, title_en')
        .eq('slug', courseSlug!)
        .eq('is_published', true)
        .maybeSingle();
      if (cErr) throw cErr;
      if (!course) return null;

      const { data: modules, error: mErr } = await supabase
        .from('modules')
        .select('id, slug, title_pt, title_en, position')
        .eq('course_id', course.id)
        .eq('is_published', true)
        .order('position', { ascending: true });
      if (mErr) throw mErr;

      const moduleIds = (modules ?? []).map((m) => m.id);
      if (!moduleIds.length) return null;

      const { data: lessons, error: lErr } = await supabase
        .from('lessons')
        .select('id, slug, title_pt, title_en, is_free, position, module_id')
        .in('module_id', moduleIds)
        .eq('is_published', true)
        .order('position', { ascending: true });
      if (lErr) throw lErr;

      const ordered: LessonNavItem[] = (modules ?? []).flatMap((m) =>
        (lessons ?? []).filter((l) => l.module_id === m.id)
      );

      const current = ordered.find((l) => l.slug === lessonSlug);
      if (!current) return null;

      const { data: lesson, error: dErr } = await supabase
        .from('lessons')
        .select(
          'id, slug, title_pt, title_en, description_pt, description_en, content_pt, content_en, is_free, module_id, videos(id, provider, ref, duration_seconds, is_free)'
        )
        .eq('id', current.id)
        .maybeSingle();
      if (dErr) throw dErr;
      if (!lesson) return null;

      const { data: materials, error: matErr } = await supabase
        .from('lesson_materials')
        .select('id, title_pt, title_en, file_url, file_type, position')
        .eq('lesson_id', current.id)
        .order('position', { ascending: true });
      if (matErr) throw matErr;

      const idx = ordered.findIndex((l) => l.id === current.id);

      return {
        course,
        modules: modules ?? [],
        ordered,
        lesson: lesson as typeof lesson & { videos: VideoInfo | null },
        materials: (materials ?? []) as MaterialRow[],
        prev: idx > 0 ? ordered[idx - 1] : null,
        next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
      };
    },
  });
}
