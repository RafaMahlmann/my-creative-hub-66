import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Save, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  useTutorContext,
  useSaveTutorContext,
  useGenerateTutorContext,
} from '@/hooks/useTutor';

type Props = { moduleId?: string | null };

export const TutorContextTab = ({ moduleId }: Props) => {
  const { t } = useTranslation();
  const { data } = useTutorContext(moduleId);
  const save = useSaveTutorContext(moduleId);
  const generate = useGenerateTutorContext(moduleId);
  const [text, setText] = useState({ pt: '', en: '' });

  useEffect(() => {
    setText({ pt: data?.context_pt ?? '', en: data?.context_en ?? '' });
  }, [data?.context_pt, data?.context_en]);

  if (!moduleId) {
    return <p className="font-body text-sm text-course-muted-foreground">{t('tutor.needModule')}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Bot size={16} className="text-course-primary" />
        <p className="font-body text-sm text-course-muted-foreground">{t('tutor.contextHelp')}</p>
      </div>

      <Button
        variant="outline"
        disabled={generate.isPending}
        onClick={() =>
          generate.mutate(undefined, {
            onSuccess: (r) => {
              setText({ pt: r.context_pt, en: r.context_en });
              toast.success(t('tutor.generated'));
            },
            onError: (e) => toast.error(e instanceof Error ? e.message : 'error'),
          })
        }
        className="border-course-border bg-course-card text-course-foreground hover:bg-course-secondary"
      >
        {generate.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        {generate.isPending ? t('tutor.generating') : t('tutor.generate')}
      </Button>

      {(['pt', 'en'] as const).map((lang) => (
        <div key={lang} className="space-y-2">
          <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
            {t(`tutor.context_${lang}`)}
          </span>
          <Textarea
            value={text[lang]}
            onChange={(e) => setText((s) => ({ ...s, [lang]: e.target.value }))}
            rows={10}
            className="border-course-border bg-course-background font-mono text-xs text-course-foreground"
          />
        </div>
      ))}

      <Button
        onClick={() =>
          save.mutate(
            { context_pt: text.pt, context_en: text.en },
            {
              onSuccess: () => toast.success(t('tutor.saved')),
              onError: (e) => toast.error(e instanceof Error ? e.message : 'error'),
            },
          )
        }
        disabled={save.isPending}
        className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
      >
        <Save className="mr-2 h-4 w-4" />
        {t('tutor.save')}
      </Button>
    </div>
  );
};
