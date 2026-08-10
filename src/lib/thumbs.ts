import { supabase } from '@/integrations/supabase/client';
import { columnExists, resetColumnCache } from '@/lib/schemaProbe';

/**
 * Miniaturas moram no bucket público que já existe no projeto (o mesmo das
 * imagens do topo), sob o prefixo `thumbs/`. Reaproveitar evita criar bucket
 * novo e herda as policies de admin que já estão no lugar.
 */
export const THUMB_BUCKET = 'hero-assets';
const THUMB_PREFIX = 'thumbs';

export const THUMB_MAX_BYTES = 5 * 1024 * 1024;
export const THUMB_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

/** O SQL da Etapa A — exibido no card de configuração pendente. */
export const THUMB_MIGRATION_SQL =
  'ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS thumb_url TEXT;';

export async function uploadThumb(file: File): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${THUMB_PREFIX}/${crypto.randomUUID()}-${safe}`;
  const { error } = await supabase.storage.from(THUMB_BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(THUMB_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * A coluna `videos.thumb_url` só existe depois que o SQL da Etapa A roda no
 * banco. Enquanto isso, pedir a coluna faz a consulta inteira falhar — então
 * checamos uma vez e montamos a lista de colunas de acordo. Assim as telas
 * continuam funcionando antes e depois da migração.
 */
export const thumbColumnExists = () => columnExists('videos', 'thumb_url');

/** Esquece a checagem — usado logo após o usuário aplicar o SQL. */
export const resetThumbColumnCache = () => resetColumnCache('videos', 'thumb_url');

/**
 * Acrescenta `thumb_url` à lista de colunas apenas se o banco já a tiver.
 * Continuamos listando coluna por coluna (nunca `*`) porque `videos` guarda
 * `source_path`/`source_note`, que são internos e não podem vazar ao aluno.
 */
export async function videoCols(base: string): Promise<string> {
  return (await thumbColumnExists()) ? `${base}, thumb_url` : base;
}
