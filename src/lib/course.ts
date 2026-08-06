import i18n from '@/i18n';

/** Returns the field for the active language, falling back to Portuguese. */
export function pick(pt: string | null | undefined, en: string | null | undefined) {
  const lang = i18n.language?.startsWith('en') ? 'en' : 'pt';
  if (lang === 'en') return (en && en.trim()) || pt || '';
  return pt || '';
}

export function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  if (m > 0) return `${m} min`;
  return `${s}s`;
}
