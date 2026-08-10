import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { videoCols } from '@/lib/thumbs';

export type VideoProvider = Database['public']['Enums']['video_provider'];
export type VideoStatus = Database['public']['Enums']['video_status'];

export type VideoUsage = {
  kind: 'lesson' | 'trailer';
  label: string;
  href: string;
};

export type AdminVideo = {
  id: string;
  title_pt: string;
  title_en: string | null;
  provider: VideoProvider;
  ref: string | null;
  duration_seconds: number | null;
  is_free: boolean;
  source_path: string | null;
  source_note: string | null;
  storage_path: string | null;
  status: VideoStatus;
  /** ausente enquanto o SQL da Etapa A não roda — ver lib/thumbs.ts */
  thumb_url?: string | null;
  usage: VideoUsage[];
};

export function useAdminVideos() {
  return useQuery({
    queryKey: ['admin', 'videos'],
    queryFn: async (): Promise<AdminVideo[]> => {
      const cols = await videoCols(
        'id, title_pt, title_en, provider, ref, duration_seconds, is_free, source_path, source_note, storage_path, status',
      );
      const { data: videos, error } = await supabase
        .from('videos')
        .select(cols)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const { data: lessons, error: lErr } = await supabase
        .from('lessons')
        .select('id, title_pt, title_en, video_id, module_id, modules(course_id, courses(title_pt, title_en))')
        .not('video_id', 'is', null);
      if (lErr) throw lErr;

      const { data: courses, error: cErr } = await supabase
        .from('courses')
        .select('id, title_pt, title_en, trailer_video_id')
        .not('trailer_video_id', 'is', null);
      if (cErr) throw cErr;

      const usageByVideo = new Map<string, VideoUsage[]>();
      const push = (id: string, u: VideoUsage) => {
        usageByVideo.set(id, [...(usageByVideo.get(id) ?? []), u]);
      };

      for (const l of lessons ?? []) {
        const courseId = (l as { modules?: { course_id?: string } }).modules?.course_id;
        const courseTitle = (l as { modules?: { courses?: { title_pt?: string } } }).modules?.courses?.title_pt;
        push(l.video_id as string, {
          kind: 'lesson',
          label: `${courseTitle ? `${courseTitle} · ` : ''}${l.title_pt}`,
          href: courseId ? `/curso/admin/${courseId}/aula/${l.id}` : '/curso/admin',
        });
      }
      for (const c of courses ?? []) {
        push(c.trailer_video_id as string, {
          kind: 'trailer',
          label: c.title_pt,
          href: `/curso/admin/${c.id}`,
        });
      }

      // o select é montado em tempo de execução, então a inferência do
      // supabase-js não alcança — o formato é garantido pelas colunas acima
      const rows = (videos ?? []) as unknown as Omit<AdminVideo, 'usage'>[];
      return rows.map((v) => ({ ...v, usage: usageByVideo.get(v.id) ?? [] }));
    },
  });
}

export function useAdminVideoMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin'] });
    qc.invalidateQueries({ queryKey: ['lesson'] });
    qc.invalidateQueries({ queryKey: ['courses'] });
  };

  const updateVideo = useMutation({
    mutationFn: async (patch: Partial<AdminVideo> & { id: string }) => {
      const { id, usage: _usage, ...rest } = patch;
      const { error } = await supabase.from('videos').update(rest).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const createVideo = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from('videos').insert({ title_pt: title });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  return { updateVideo, createVideo, deleteVideo };
}
