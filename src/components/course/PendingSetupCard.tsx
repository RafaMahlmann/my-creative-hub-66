import { useTranslation } from 'react-i18next';
import { Check, Copy, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useColumnSupport, useRecheckColumn } from '@/hooks/useColumnSupport';
import { THUMB_MIGRATION_SQL } from '@/lib/thumbs';

type Props = {
  /** por padrão, cobre a migração da miniatura de vídeo (Etapa A) */
  table?: string;
  column?: string;
  sql?: string;
  titleKey?: string;
  bodyKey?: string;
};

/**
 * Aviso que aparece só enquanto uma migração pendente não foi aplicada. Some
 * sozinho depois — ninguém precisa lembrar de removê-lo.
 */
export const PendingSetupCard = ({
  table = 'videos',
  column = 'thumb_url',
  sql = THUMB_MIGRATION_SQL,
  titleKey = 'setup.thumbTitle',
  bodyKey = 'setup.thumbBody',
}: Props) => {
  const { t } = useTranslation();
  const ok = useColumnSupport(table, column);
  const recheck = useRecheckColumn(table, column);

  if (ok) return null;

  return (
    <section className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-amber-300" />
        <h2 className="font-display text-lg font-semibold">{t(titleKey)}</h2>
      </div>
      <p className="mt-1 font-body text-sm text-course-muted-foreground">{t(bodyKey)}</p>

      <ol className="mt-3 list-decimal space-y-1 pl-5 font-body text-sm text-course-foreground">
        <li>{t('setup.step1')}</li>
        <li>{t('setup.step2')}</li>
        <li>{t('setup.step3')}</li>
      </ol>

      <pre className="mt-3 overflow-x-auto rounded-lg border border-course-border bg-course-background p-3 font-mono text-xs text-course-foreground">
        {sql}
      </pre>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
          onClick={() => {
            void navigator.clipboard.writeText(sql);
            toast.success(t('setup.copied'));
          }}
        >
          <Copy className="mr-2 h-3.5 w-3.5" /> {t('setup.copySql')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-course-border bg-course-card text-course-foreground"
          onClick={() => {
            void recheck();
            toast.success(t('setup.rechecking'));
          }}
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> {t('setup.recheck')}
        </Button>
      </div>

      <p className="mt-3 flex items-start gap-1.5 font-body text-xs text-course-muted-foreground">
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
        {t('setup.thumbSafe')}
      </p>
    </section>
  );
};
