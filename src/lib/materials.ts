import { supabase } from '@/integrations/supabase/client';
import { columnExists } from '@/lib/schemaProbe';

/**
 * Material de apoio (apostila, PDF, planilha) da aula. Bucket PRIVADO de
 * propósito — ver etapa1-materiais.sql para o porquê: material de aula paga
 * não pode ter link fixo que qualquer um descubra e repasse.
 */
export const MATERIALS_BUCKET = 'course-materials';

export const MATERIALS_MAX_BYTES = 50 * 1024 * 1024;
export const MATERIALS_ACCEPT =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,application/pdf';

/** O SQL da Etapa 1 — exibido no card de configuração pendente. */
export const MATERIALS_MIGRATION_SQL = `-- ver plano-burnstore/etapa1-materiais.sql para o arquivo completo
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins manage course materials"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read materials of free published lessons"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'course-materials' AND EXISTS (
      SELECT 1 FROM public.lesson_materials lm
      JOIN public.lessons l ON l.id = lm.lesson_id
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE lm.storage_path = storage.objects.name
        AND l.is_free AND l.is_published AND m.is_published AND c.is_published
    )
  );

CREATE POLICY "Signed in students read course materials"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'course-materials');

ALTER TABLE public.lesson_materials
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS size_bytes  bigint;
ALTER TABLE public.lesson_materials ALTER COLUMN file_url DROP NOT NULL;`;

/** True quando o SQL da Etapa 1 já rodou no banco. */
export const materialsColumnExists = () => columnExists('lesson_materials', 'storage_path');

/**
 * Acrescenta `storage_path, size_bytes` à lista de colunas só se o banco já
 * as tiver — mesmo padrão de `videoCols` em `lib/thumbs.ts`, para a tela
 * funcionar antes e depois da migração da Etapa 1.
 */
export async function materialCols(base: string): Promise<string> {
  return (await materialsColumnExists()) ? `${base}, storage_path, size_bytes` : base;
}

const SIGNED_TTL = 60 * 60; // 1h — link vale a visita, não fica pendurado

export function extensionOf(fileName: string) {
  const m = /\.([a-z0-9]+)$/i.exec(fileName);
  return m ? m[1].toUpperCase() : null;
}

export async function uploadMaterial(
  lessonId: string,
  file: File,
): Promise<{ storagePath: string; sizeBytes: number }> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${lessonId}/${crypto.randomUUID()}-${safe}`;
  const { error } = await supabase.storage.from(MATERIALS_BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;
  return { storagePath: path, sizeBytes: file.size };
}

export async function signedMaterialUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_TTL);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error('não foi possível gerar o link');
  return data.signedUrl;
}

export async function removeMaterialFile(storagePath: string) {
  const { error } = await supabase.storage.from(MATERIALS_BUCKET).remove([storagePath]);
  if (error) throw error;
}

export function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
