import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chamarIA, temChave } from '@/lib/aiProviders';

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
      // Chave própria primeiro: mesma qualidade, custo zero de crédito do site.
      if (temChave()) {
        return await chamarIA(`Transcript:\n\n${input.text}`, {
          system: LIMPAR_SISTEMA(input.lang),
          maxTokens: 8000,
          temperature: 0.3,
        });
      }
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
      let translated: string | undefined;
      if (temChave()) {
        translated = limparCerca(
          await chamarIA(`Translate this WebVTT from Portuguese (Brazil) to English:\n\n${vtt}`, {
            system: TRADUZIR_SISTEMA,
            maxTokens: 16000,
            temperature: 0.2,
          }),
        );
      } else {
        const { data, error } = await supabase.functions.invoke('translate-subtitles', {
          body: { vtt, from: 'pt', to: 'en' },
        });
        if (error) throw error;
        translated = (data as { vtt?: string; error?: string })?.vtt;
        if (!translated) throw new Error((data as { error?: string })?.error || 'translation failed');
      }
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

/**
 * As mesmas instruções que as funções do servidor usam. Ficam aqui repetidas de
 * propósito: quando a pessoa tem chave própria, a chamada nem sai do navegador,
 * e o resultado precisa ser idêntico ao caminho do servidor.
 */
const LIMPAR_SISTEMA = (lang: 'pt' | 'en') =>
  `You turn a raw spoken-language lesson transcript (from auto-generated subtitles) into clean reading text in ${
    lang === 'pt' ? 'Portuguese (Brazil)' : 'English'
  }. Remove filler words, false starts and repeated sentences typical of speech. Group the content into short paragraphs by topic. Keep every idea and technical term the speaker actually said — never invent content, never summarize away detail. Output plain paragraphs of prose, no headings, no bullet lists, no markdown, no commentary.`;

const TRADUZIR_SISTEMA =
  'You translate WebVTT subtitle files. Keep the WEBVTT header, cue identifiers, timings and blank lines exactly as they are. Translate ONLY the spoken text lines. Return the raw WebVTT content and nothing else, no code fences.';

/** Modelo às vezes embrulha a resposta em ```; o arquivo tem que sair cru. */
function limparCerca(texto: string) {
  const limpo = texto.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
  return /^WEBVTT/i.test(limpo) ? limpo : `WEBVTT\n\n${limpo}`;
}
