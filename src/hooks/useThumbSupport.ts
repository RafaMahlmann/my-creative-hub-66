import { useColumnSupport } from '@/hooks/useColumnSupport';

/** True quando o banco já tem a coluna `videos.thumb_url` (ver Etapa A). */
export const useThumbSupport = () => useColumnSupport('videos', 'thumb_url');
