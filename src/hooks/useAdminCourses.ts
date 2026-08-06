import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AdminCourse = {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  cover_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  position: number;
};

export type AdminModule = {
  id: string;
  course_id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  position: number;
  is_published: boolean;
};

export type AdminLesson = {
  id: string;
  module_id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  content_pt: string | null;
  content_en: string | null;
  position: number;
  is_free: boolean;
  is_published: boolean;
  video_id: string | null;
};

export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || `item-${Date.now()}`;
}

export function useAdminCourses() {
  return useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: async (): Promise<AdminCourse[]> => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, slug, title_pt, title_en, description_pt, description_en, cover_url, is_published, is_featured, position')
        .order('position', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminCourseTree(courseId?: string) {
  return useQuery({
    queryKey: ['admin', 'course-tree', courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from('courses')
        .select('id, slug, title_pt, title_en, description_pt, description_en, cover_url, is_published, is_featured, position')
        .eq('id', courseId!)
        .maybeSingle();
      if (error) throw error;
      if (!course) return null;

      const { data: modules, error: mErr } = await supabase
        .from('modules')
        .select('id, course_id, slug, title_pt, title_en, position, is_published')
        .eq('course_id', course.id)
        .order('position', { ascending: true });
      if (mErr) throw mErr;

      const ids = (modules ?? []).map((m) => m.id);
      let lessons: AdminLesson[] = [];
      if (ids.length) {
        const { data: ls, error: lErr } = await supabase
          .from('lessons')
          .select('id, module_id, slug, title_pt, title_en, description_pt, description_en, content_pt, content_en, position, is_free, is_published, video_id')
          .in('module_id', ids)
          .order('position', { ascending: true });
        if (lErr) throw lErr;
        lessons = ls ?? [];
      }

      return { course: course as AdminCourse, modules: (modules ?? []) as AdminModule[], lessons };
    },
  });
}

export function useAdminMutations(courseId?: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin'] });
    qc.invalidateQueries({ queryKey: ['courses'] });
    qc.invalidateQueries({ queryKey: ['course'] });
    qc.invalidateQueries({ queryKey: ['free-lessons'] });
    qc.invalidateQueries({ queryKey: ['lesson'] });
  };

  const run = <T,>(fn: (v: T) => Promise<unknown>) =>
    useMutation({
      mutationFn: fn,
      onSuccess: () => invalidate(),
      onError: (e: Error) => toast.error(e.message),
    });

  const createCourse = run(async (title: string) => {
    const { error } = await supabase.from('courses').insert({ title_pt: title, slug: slugify(title) });
    if (error) throw error;
  });

  const updateCourse = run(async (patch: Partial<AdminCourse> & { id: string }) => {
    const { id, ...rest } = patch;
    const { error } = await supabase.from('courses').update(rest).eq('id', id);
    if (error) throw error;
  });

  const deleteCourse = run(async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  });

  const createModule = run(async ({ title, position }: { title: string; position: number }) => {
    const { error } = await supabase
      .from('modules')
      .insert({ course_id: courseId!, title_pt: title, slug: slugify(title), position });
    if (error) throw error;
  });

  const updateModule = run(async (patch: Partial<AdminModule> & { id: string }) => {
    const { id, ...rest } = patch;
    const { error } = await supabase.from('modules').update(rest).eq('id', id);
    if (error) throw error;
  });

  const deleteModule = run(async (id: string) => {
    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) throw error;
  });

  const createLesson = run(async ({ moduleId, title, position }: { moduleId: string; title: string; position: number }) => {
    const { error } = await supabase
      .from('lessons')
      .insert({ module_id: moduleId, title_pt: title, slug: slugify(title), position });
    if (error) throw error;
  });

  const updateLesson = run(async (patch: Partial<AdminLesson> & { id: string }) => {
    const { id, ...rest } = patch;
    const { error } = await supabase.from('lessons').update(rest).eq('id', id);
    if (error) throw error;
  });

  const deleteLesson = run(async (id: string) => {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
  });

  const reorderModules = run(async (items: { id: string; position: number }[]) => {
    for (const it of items) {
      const { error } = await supabase.from('modules').update({ position: it.position }).eq('id', it.id);
      if (error) throw error;
    }
  });

  const reorderLessons = run(async (items: { id: string; position: number }[]) => {
    for (const it of items) {
      const { error } = await supabase.from('lessons').update({ position: it.position }).eq('id', it.id);
      if (error) throw error;
    }
  });

  return {
    createCourse,
    updateCourse,
    deleteCourse,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderModules,
    reorderLessons,
  };
}
