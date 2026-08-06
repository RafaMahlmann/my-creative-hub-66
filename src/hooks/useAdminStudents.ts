import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type StudentRow = {
  user_id: string;
  display_name: string | null;
  created_at: string;
};

export function useAdminStudents() {
  return useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as StudentRow[];
    },
  });
}

export function useAdminEnrollments(courseId?: string) {
  return useQuery({
    queryKey: ['admin-enrollments', courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, user_id, course_id, source, is_active, created_at')
        .eq('course_id', courseId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGrantEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      courseId,
      grant,
    }: {
      userId: string;
      courseId: string;
      grant: boolean;
    }) => {
      const { error } = await supabase.from('enrollments').upsert(
        {
          user_id: userId,
          course_id: courseId,
          source: grant ? 'admin_grant' : 'free',
          is_active: grant,
        },
        { onConflict: 'user_id,course_id' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-enrollments'] });
      qc.invalidateQueries({ queryKey: ['enrollment'] });
    },
  });
}
