import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SubtitleRow = {
  id: string;
  video_id: string;
  language: 'pt' | 'en';
  content: string;
  is_auto: boolean;
};

/** Public read: subtitles of a video, keyed by language. */
export function useSubtitles(videoId?: string | null) {
  return useQuery({
    queryKey: ['subtitles', videoId],
    enabled: !!videoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subtitles')
        .select('id, video_id, language, content, is_auto')
        .eq('video_id', videoId!);
      if (error) throw error;
      const rows = (data ?? []) as SubtitleRow[];
      return {
        pt: rows.find((r) => r.language === 'pt') ?? null,
        en: rows.find((r) => r.language === 'en') ?? null,
      };
    },
  });
}

export function useSaveSubtitle(videoId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { language: 'pt' | 'en'; content: string; is_auto?: boolean }) => {
      if (!videoId) throw new Error('missing video');
      const { error } = await supabase.from('subtitles').upsert(
        {
          video_id: videoId,
          language: input.language,
          content: input.content,
          is_auto: input.is_auto ?? false,
        },
        { onConflict: 'video_id,language' },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subtitles', videoId] }),
  });
}

/** Rascunho de texto de leitura a partir da legenda — a IA limpa, a pessoa revisa e salva. */
export function useCleanTranscript() {
  return useMutation({
    mutationFn: async (input: { text: string; lang: 'pt' | 'en' }) => {
      const { data, error } = await supabase.functions.invoke('clean-transcript', {
        body: input,
      });
      if (error) throw error;
      const cleaned = (data as { text?: string; error?: string })?.text;
      if (!cleaned) throw new Error((data as { error?: string })?.error || 'falha ao limpar a transcrição');
      return cleaned;
    },
  });
}

export function useTranslateSubtitle(videoId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vtt: string) => {
      const { data, error } = await supabase.functions.invoke('translate-subtitles', {
        body: { vtt, from: 'pt', to: 'en' },
      });
      if (error) throw error;
      const translated = (data as { vtt?: string; error?: string })?.vtt;
      if (!translated) throw new Error((data as { error?: string })?.error || 'translation failed');
      const { error: sErr } = await supabase.from('subtitles').upsert(
        { video_id: videoId!, language: 'en', content: translated, is_auto: true },
        { onConflict: 'video_id,language' },
      );
      if (sErr) throw sErr;
      return translated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subtitles', videoId] }),
  });
}
