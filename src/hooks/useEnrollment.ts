import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStudentAuth } from '@/hooks/useStudentAuth';

export type EnrollmentRow = {
  id: string;
  user_id: string;
  course_id: string;
  source: 'free' | 'admin_grant' | 'courtesy';
  is_active: boolean;
  created_at: string;
};

/** Matrícula do aluno logado no curso informado. */
export function useEnrollment(courseId?: string) {
  const { user } = useStudentAuth();

  const query = useQuery({
    queryKey: ['enrollment', courseId, user?.id],
    enabled: !!courseId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, user_id, course_id, source, is_active, created_at')
        .eq('course_id', courseId!)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as EnrollmentRow | null;
    },
  });

  const enrollment = query.data ?? null;

  return {
    ...query,
    enrollment,
    isEnrolled: !!enrollment?.is_active,
    /** Conteúdo exclusivo só abre com matrícula concedida (freemium). */
    hasPremiumAccess: !!enrollment?.is_active && enrollment.source !== 'free',
  };
}

/** Auto-inscrição gratuita no curso (não libera conteúdo exclusivo). */
export function useSelfEnroll() {
  const { user } = useStudentAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error('not_authenticated');
      const { error } = await supabase
        .from('enrollments')
        .upsert(
          { user_id: user.id, course_id: courseId, source: 'free', is_active: true },
          { onConflict: 'user_id,course_id', ignoreDuplicates: true }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollment'] });
      qc.invalidateQueries({ queryKey: ['my-lessons'] });
    },
  });
}

export type ProgressRow = {
  lesson_id: string;
  seconds_watched: number;
  is_completed: boolean;
  last_seen_at: string;
};

export function useLessonProgress(lessonId?: string) {
  const { user } = useStudentAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['lesson-progress', lessonId, user?.id],
    enabled: !!lessonId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('lesson_id, seconds_watched, is_completed, last_seen_at')
        .eq('lesson_id', lessonId!)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as ProgressRow | null;
    },
  });

  const save = useMutation({
    mutationFn: async (patch: { is_completed?: boolean; seconds_watched?: number }) => {
      if (!user?.id || !lessonId) return;
      const { error } = await supabase.from('lesson_progress').upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          last_seen_at: new Date().toISOString(),
          ...patch,
        },
        { onConflict: 'user_id,lesson_id' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
      qc.invalidateQueries({ queryKey: ['my-lessons'] });
    },
  });

  return { progress: query.data ?? null, isLoading: query.isLoading, save };
}

/** Aulas já vistas pelo aluno, com curso e status, para "Minhas aulas". */
export function useMyLessons() {
  const { user } = useStudentAuth();

  return useQuery({
    queryKey: ['my-lessons', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: progress, error } = await supabase
        .from('lesson_progress')
        .select('lesson_id, seconds_watched, is_completed, last_seen_at')
        .eq('user_id', user!.id)
        .order('last_seen_at', { ascending: false });
      if (error) throw error;
      const rows = (progress ?? []) as ProgressRow[];
      if (!rows.length) return [];

      const { data: lessons, error: lErr } = await supabase
        .from('lessons')
        .select('id, slug, title_pt, title_en, module_id, modules(course_id, courses(slug, title_pt, title_en))')
        .in('id', rows.map((r) => r.lesson_id));
      if (lErr) throw lErr;

      return rows
        .map((r) => {
          const lesson = (lessons ?? []).find((l) => l.id === r.lesson_id) as
            | (typeof lessons)[number]
            | undefined;
          if (!lesson) return null;
          const course = (lesson as any).modules?.courses;
          if (!course) return null;
          return { ...r, lesson, course };
        })
        .filter(Boolean) as Array<
        ProgressRow & {
          lesson: { id: string; slug: string; title_pt: string; title_en: string | null };
          course: { slug: string; title_pt: string; title_en: string | null };
        }
      >;
    },
  });
}
