import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CourseRow = {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  cover_url: string | null;
  is_featured: boolean;
  position: number;
};

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async (): Promise<CourseRow[]> => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, slug, title_pt, title_en, description_pt, description_en, cover_url, is_featured, position')
        .eq('is_published', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type LessonRow = {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  position: number;
  is_free: boolean;
  module_id: string;
  videos: { duration_seconds: number | null } | null;
};

export type ModuleWithLessons = {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  position: number;
  lessons: LessonRow[];
};

export function useCourseDetail(courseSlug?: string) {
  return useQuery({
    queryKey: ['course', courseSlug],
    enabled: !!courseSlug,
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from('courses')
        .select('id, slug, title_pt, title_en, description_pt, description_en, cover_url, is_featured, position')
        .eq('slug', courseSlug!)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      if (!course) return null;

      const { data: modules, error: mErr } = await supabase
        .from('modules')
        .select('id, slug, title_pt, title_en, description_pt, description_en, position')
        .eq('course_id', course.id)
        .eq('is_published', true)
        .order('position', { ascending: true });
      if (mErr) throw mErr;

      const moduleIds = (modules ?? []).map((m) => m.id);
      let lessons: LessonRow[] = [];
      if (moduleIds.length) {
        const { data: lessonData, error: lErr } = await supabase
          .from('lessons')
          .select(
            'id, slug, title_pt, title_en, description_pt, description_en, position, is_free, module_id, videos(duration_seconds)'
          )
          .in('module_id', moduleIds)
          .eq('is_published', true)
          .order('position', { ascending: true });
        if (lErr) throw lErr;
        lessons = (lessonData ?? []) as unknown as LessonRow[];
      }

      const withLessons: ModuleWithLessons[] = (modules ?? []).map((m) => ({
        ...m,
        lessons: lessons.filter((l) => l.module_id === m.id),
      }));

      return { course, modules: withLessons };
    },
  });
}

export type FreeLesson = {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  modules: { slug: string; courses: { slug: string; title_pt: string; title_en: string | null } | null } | null;
  videos: { duration_seconds: number | null } | null;
};

export function useFreeLessons() {
  return useQuery({
    queryKey: ['free-lessons'],
    queryFn: async (): Promise<FreeLesson[]> => {
      const { data, error } = await supabase
        .from('lessons')
        .select(
          'id, slug, title_pt, title_en, description_pt, description_en, modules(slug, courses(slug, title_pt, title_en)), videos(duration_seconds)'
        )
        .eq('is_free', true)
        .eq('is_published', true)
        .order('position', { ascending: true })
        .limit(12);
      if (error) throw error;
      return (data ?? []) as unknown as FreeLesson[];
    },
  });
}
