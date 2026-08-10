import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  extensionOf,
  materialCols,
  removeMaterialFile,
  uploadMaterial,
} from '@/lib/materials';

export type LessonMaterial = {
  id: string;
  title_pt: string;
  title_en: string | null;
  file_url: string | null;
  file_type: string | null;
  position: number;
  /** ausentes enquanto o SQL da Etapa 1 não roda — ver lib/materials.ts */
  storage_path?: string | null;
  size_bytes?: number | null;
};

const KEY = (lessonId?: string) => ['admin', 'lesson-materials', lessonId] as const;

export function useLessonMaterials(lessonId?: string) {
  return useQuery({
    queryKey: KEY(lessonId),
    enabled: !!lessonId,
    queryFn: async (): Promise<LessonMaterial[]> => {
      const cols = await materialCols('id, title_pt, title_en, file_url, file_type, position');
      const { data, error } = await supabase
        .from('lesson_materials')
        .select(cols)
        .eq('lesson_id', lessonId!)
        .order('position', { ascending: true });
      if (error) throw error;
      // o select é montado em tempo de execução; o formato é garantido pelas
      // colunas acima, a inferência do supabase-js não alcança aqui
      return (data ?? []) as unknown as LessonMaterial[];
    },
  });
}

export function useLessonMaterialMutations(lessonId?: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: KEY(lessonId) });
    qc.invalidateQueries({ queryKey: ['lesson'] });
  };

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      if (!lessonId) throw new Error('missing lesson');
      const { count } = await supabase
        .from('lesson_materials')
        .select('id', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);
      const { storagePath, sizeBytes } = await uploadMaterial(lessonId, file);
      const { error } = await supabase.from('lesson_materials').insert({
        lesson_id: lessonId,
        title_pt: file.name.replace(/\.[^.]+$/, ''),
        file_type: extensionOf(file.name),
        storage_path: storagePath,
        size_bytes: sizeBytes,
        position: (count ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const addLink = useMutation({
    mutationFn: async (input: { title: string; url: string; type?: string }) => {
      if (!lessonId) throw new Error('missing lesson');
      const { count } = await supabase
        .from('lesson_materials')
        .select('id', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);
      const { error } = await supabase.from('lesson_materials').insert({
        lesson_id: lessonId,
        title_pt: input.title,
        file_url: input.url,
        file_type: input.type || null,
        position: (count ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const rename = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase.from('lesson_materials').update({ title_pt: title }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (material: LessonMaterial) => {
      if (material.storage_path) await removeMaterialFile(material.storage_path);
      const { error } = await supabase.from('lesson_materials').delete().eq('id', material.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  return { uploadFile, addLink, rename, remove };
}
