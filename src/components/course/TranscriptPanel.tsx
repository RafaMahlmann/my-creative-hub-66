import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Captions, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSubtitles } from '@/hooks/useSubtitles';
import { parseVtt, formatCueTime } from '@/lib/vtt';

type Props = { videoId?: string | null };

export const TranscriptPanel = ({ videoId }: Props) => {
  const { t, i18n } = useTranslation();
  const { data } = useSubtitles(videoId);
  const [lang, setLang] = useState<'pt' | 'en'>(i18n.language?.startsWith('en') ? 'en' : 'pt');
  const [q, setQ] = useState('');

  const available = { pt: !!data?.pt?.content?.trim(), en: !!data?.en?.content?.trim() };
  const active = available[lang] ? lang : available.pt ? 'pt' : available.en ? 'en' : null;

  const cues = useMemo(
    () => parseVtt(active ? data?.[active]?.content : null),
    [data, active],
  );
  const filtered = q.trim()
    ? cues.filter((c) => c.text.toLowerCase().includes(q.trim().toLowerCase()))
    : cues;

  if (!videoId || !cues.length) return null;

  return (
    <section className="rounded-xl border border-course-border bg-course-card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Captions size={18} className="text-course-primary" />
          {t('subtitles.transcript')}
        </h2>
        <div className="flex gap-1">
          {(['pt', 'en'] as const).map((code) =>
            available[code] ? (
              <Button
                key={code}
                size="sm"
                variant={active === code ? 'default' : 'outline'}
                onClick={() => setLang(code)}
                className={
                  active === code
                    ? 'h-7 bg-course-primary px-3 text-xs text-course-primary-foreground hover:bg-course-primary/90'
                    : 'h-7 border-course-border bg-course-card px-3 text-xs text-course-foreground hover:bg-course-secondary'
                }
              >
                {code.toUpperCase()}
              </Button>
            ) : null,
          )}
        </div>
        <div className="relative ml-auto w-full max-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-course-muted-foreground"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('subtitles.search')}
            className="h-8 border-course-border bg-course-background pl-8 font-body text-xs text-course-foreground"
          />
        </div>
      </div>

      <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
        {filtered.map((c, i) => (
          <li key={i} className="flex gap-3 rounded-md px-2 py-1.5 hover:bg-course-secondary/60">
            <span className="shrink-0 font-body text-xs tabular-nums text-course-primary">
              {formatCueTime(c.start)}
            </span>
            <span className="font-body text-sm leading-relaxed text-course-muted-foreground">
              {c.text}
            </span>
          </li>
        ))}
        {!filtered.length && (
          <li className="font-body text-sm text-course-muted-foreground">
            {t('subtitles.noResults')}
          </li>
        )}
      </ul>
    </section>
  );
};
