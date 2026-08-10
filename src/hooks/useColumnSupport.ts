import { useQuery, useQueryClient } from '@tanstack/react-query';
import { columnExists, resetColumnCache } from '@/lib/schemaProbe';

/**
 * True quando a coluna já existe no banco. Usado por telas que dependem de
 * uma migração pendente (miniatura de vídeo, material com upload) — ver
 * `PendingSetupCard`.
 */
export function useColumnSupport(table: string, column: string) {
  const { data } = useQuery({
    queryKey: ['setup', 'column', table, column],
    queryFn: () => columnExists(table, column),
    staleTime: Infinity,
  });
  // Enquanto não sabemos, assumimos que existe: evita piscar o aviso e
  // desabilitar os controles à toa para quem já aplicou o SQL.
  return data !== false;
}

/** Limpa o cache e refaz a checagem — usado pelo botão "Conferir de novo". */
export function useRecheckColumn(table: string, column: string) {
  const qc = useQueryClient();
  return () => {
    resetColumnCache(table, column);
    return qc.invalidateQueries({ queryKey: ['setup', 'column', table, column] });
  };
}
