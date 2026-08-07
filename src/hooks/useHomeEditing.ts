import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/** Ações rápidas de edição direto na vitrine (/curso). */
export function useHomeEditing() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['courses'] });
    qc.invalidateQueries({ queryKey: ['free-lessons'] });
    qc.invalidateQueries({ queryKey: ['admin'] });
  };

  const swapCoursePositions = useMutation({
    mutationFn: async (pair: { a: { id: string; position: number }; b: { id: string; position: number } }) => {
      const { a, b } = pair;
      const { error: e1 } = await supabase.from('courses').update({ position: b.position }).eq('id', a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('courses').update({ position: a.position }).eq('id', b.id);
      if (e2) throw e2;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleLessonFree = useMutation({
    mutationFn: async ({ id, isFree }: { id: string; isFree: boolean }) => {
      const { error } = await supabase.from('lessons').update({ is_free: isFree }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const setFeaturedCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { error: clear } = await supabase
        .from('courses')
        .update({ is_featured: false })
        .neq('id', courseId);
      if (clear) throw clear;
      const { error } = await supabase.from('courses').update({ is_featured: true }).eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  return { swapCoursePositions, toggleLessonFree, setFeaturedCourse };
}
