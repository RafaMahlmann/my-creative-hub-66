import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSubtitles, useSaveSubtitle, useTranslateSubtitle } from '@/hooks/useSubtitles';
import { PuxarLegendaDoHD } from '@/components/course/PuxarLegendaDoHD';
import { AvisoChaveLegenda } from '@/components/course/AvisoChaveLegenda';
import { parseVtt } from '@/lib/vtt';

type Props = { videoId: string | null; sourcePath?: string | null };

export const SubtitlesTab = ({ videoId, sourcePath }: Props) => {
  const { t } = useTranslation();
  const { data } = useSubtitles(videoId);
  const save = useSaveSubtitle(videoId);
  const translate = useTranslateSubtitle(videoId);
  const [text, setText] = useState({ pt: '', en: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<'pt' | 'en'>('pt');

  useEffect(() => {
    setText({ pt: data?.pt?.content ?? '', en: data?.en?.content ?? '' });
  }, [data?.pt?.content, data?.en?.content]);

  if (!videoId) {
    return (
      <p className="font-body text-sm text-course-muted-foreground">{t('subtitles.needVideo')}</p>
    );
  }

  const block = (lang: 'pt' | 'en') => (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
          {t(`subtitles.${lang}`)}
        </span>
        <span className="font-body text-xs text-course-muted-foreground">
          {parseVtt(text[lang]).length} {t('subtitles.cues')}
        </span>
        {lang === 'en' && data?.en?.is_auto && (
          <span className="rounded-full bg-course-accent px-2 py-0.5 font-body text-[11px] text-course-accent-foreground">
            {t('subtitles.auto')}
          </span>
        )}
      </div>
      <Textarea
        rows={10}
        value={text[lang]}
        onChange={(e) => setText((s) => ({ ...s, [lang]: e.target.value }))}
        placeholder={'WEBVTT\n\n00:00:00.000 --> 00:00:04.000\n...'}
        className="border-course-border bg-course-background font-mono text-xs text-course-foreground"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            try {
              await save.mutateAsync({ language: lang, content: text[lang] });
              toast.success(t('subtitles.saved'));
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'error');
            }
          }}
          className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
        >
          <Save className="mr-2 h-4 w-4" /> {t('admin.save')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-course-border bg-course-card text-course-foreground hover:bg-course-secondary"
          onClick={() => {
            setTarget(lang);
            fileRef.current?.click();
          }}
        >
          <Upload className="mr-2 h-4 w-4" /> {t('subtitles.import')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <input
        ref={fileRef}
        type="file"
        accept=".vtt,.srt,text/vtt"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const content = await file.text();
          setText((s) => ({ ...s, [target]: content }));
          e.target.value = '';
        }}
      />

      <AvisoChaveLegenda />

      <PuxarLegendaDoHD
        sourcePath={sourcePath}
        onChegou={(vtt) => setText((s) => ({ ...s, pt: vtt }))}
      />

      {block('pt')}

      <Button
        type="button"
        variant="outline"
        disabled={translate.isPending}
        className="border-course-border bg-course-card text-course-foreground hover:bg-course-secondary"
        onClick={async () => {
          if (!text.pt.trim()) return toast.error(t('subtitles.needPt'));
          try {
            await save.mutateAsync({ language: 'pt', content: text.pt });
            const vtt = await translate.mutateAsync(text.pt);
            setText((s) => ({ ...s, en: vtt }));
            toast.success(t('subtitles.translated'));
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'error');
          }
        }}
      >
        <Languages className="mr-2 h-4 w-4" />
        {translate.isPending ? t('subtitles.translating') : t('subtitles.translate')}
      </Button>

      {block('en')}
    </div>
  );
};
