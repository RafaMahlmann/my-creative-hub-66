import { useQuery } from '@tanstack/react-query';
import { thumbColumnExists } from '@/lib/thumbs';

/** True quando o banco já tem a coluna `videos.thumb_url` (ver Etapa A). */
export function useThumbSupport() {
  const { data } = useQuery({
    queryKey: ['setup', 'thumb-column'],
    queryFn: thumbColumnExists,
    staleTime: Infinity,
  });
  // Enquanto não sabemos, assumimos que existe: evita piscar o aviso e
  // desabilitar os controles à toa para quem já aplicou o SQL.
  return data !== false;
}
