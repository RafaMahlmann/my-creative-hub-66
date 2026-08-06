import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ChatMessageRow = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export function useTutorThread(moduleId?: string | null, enabled = true) {
  return useQuery({
    queryKey: ['tutor-thread', moduleId],
    enabled: !!moduleId && enabled,
    queryFn: async () => {
      const { data: thread, error } = await supabase
        .from('chat_threads')
        .select('id')
        .eq('module_id', moduleId!)
        .maybeSingle();
      if (error) throw error;
      if (!thread) return { threadId: null, messages: [] as ChatMessageRow[] };
      const { data: messages, error: mErr } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });
      if (mErr) throw mErr;
      return { threadId: thread.id, messages: (messages ?? []) as ChatMessageRow[] };
    },
  });
}

export function useAskTutor(moduleId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { message: string; language: 'pt' | 'en' }) => {
      const { data, error } = await supabase.functions.invoke('module-tutor', {
        body: { moduleId, message: input.message, language: input.language },
      });
      if (error) throw error;
      const payload = data as { reply?: string; error?: string };
      if (!payload?.reply) throw new Error(payload?.error || 'tutor failed');
      return payload.reply;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-thread', moduleId] }),
  });
}

export function useTutorContext(moduleId?: string | null) {
  return useQuery({
    queryKey: ['tutor-context', moduleId],
    enabled: !!moduleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_tutor_context')
        .select('context_pt, context_en, is_auto')
        .eq('module_id', moduleId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveTutorContext(moduleId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { context_pt: string; context_en: string }) => {
      const { error } = await supabase.from('module_tutor_context').upsert(
        { module_id: moduleId!, ...input, is_auto: false },
        { onConflict: 'module_id' },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-context', moduleId] }),
  });
}

export function useGenerateTutorContext(moduleId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-tutor-context', {
        body: { moduleId },
      });
      if (error) throw error;
      const payload = data as { context_pt?: string; error?: string };
      if (!payload?.context_pt) throw new Error(payload?.error || 'generation failed');
      return payload as { context_pt: string; context_en: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-context', moduleId] }),
  });
}
