import { supabase } from '@/integrations/supabase/client';

/**
 * Checa se uma coluna já existe no banco, para telas continuarem funcionando
 * antes e depois de uma migração pendente ser aplicada (ver `PendingSetupCard`).
 *
 * Cada resultado é cacheado por "tabela.coluna", e a PROMESSA em voo também é
 * compartilhada — sem isso, várias telas pedindo a mesma checagem ao mesmo
 * tempo no primeiro carregamento disparariam uma consulta cada.
 */
const cache = new Map<string, boolean>();
const emVoo = new Map<string, Promise<boolean>>();

export async function columnExists(table: string, column: string): Promise<boolean> {
  const chave = `${table}.${column}`;
  const conhecido = cache.get(chave);
  if (conhecido !== undefined) return conhecido;

  const existente = emVoo.get(chave);
  if (existente) return existente;

  const promessa = (async () => {
    // @ts-expect-error — a tabela é escolhida em tempo de execução; o tipo
    // exato não importa aqui, só se a consulta falha pela coluna ausente.
    const { error } = await supabase.from(table).select(column).limit(1);
    // Só tratamos como ausente quando o erro fala da própria coluna; qualquer
    // outra falha (rede, RLS) não deve mascarar a migração como pendente.
    const existe = !(error && new RegExp(column, 'i').test(error.message));
    cache.set(chave, existe);
    emVoo.delete(chave);
    return existe;
  })();

  emVoo.set(chave, promessa);
  return promessa;
}

/** Esquece a checagem de uma coluna — usado logo após aplicar o SQL. */
export function resetColumnCache(table: string, column: string) {
  cache.delete(`${table}.${column}`);
  emVoo.delete(`${table}.${column}`);
}
