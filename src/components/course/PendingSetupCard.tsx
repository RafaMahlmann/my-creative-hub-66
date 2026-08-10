import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useThumbSupport } from '@/hooks/useThumbSupport';
import { THUMB_MIGRATION_SQL, resetThumbColumnCache } from '@/lib/thumbs';

/**
 * Aviso que aparece só enquanto o SQL da Etapa A não foi aplicado. Some
 * sozinho depois — ninguém precisa lembrar de removê-lo.
 */
export const PendingSetupCard = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const ok = useThumbSupport();

  if (ok) return null;

  return (
    <section className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-amber-300" />
        <h2 className="font-display text-lg font-semibold">{t('setup.thumbTitle')}</h2>
      </div>
      <p className="mt-1 font-body text-sm text-course-muted-foreground">
        {t('setup.thumbBody')}
      </p>

      <ol className="mt-3 list-decimal space-y-1 pl-5 font-body text-sm text-course-foreground">
        <li>{t('setup.step1')}</li>
        <li>{t('setup.step2')}</li>
        <li>{t('setup.step3')}</li>
      </ol>

      <pre className="mt-3 overflow-x-auto rounded-lg border border-course-border bg-course-background p-3 font-mono text-xs text-course-foreground">
        {THUMB_MIGRATION_SQL}
      </pre>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
          onClick={() => {
            void navigator.clipboard.writeText(THUMB_MIGRATION_SQL);
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
            resetThumbColumnCache();
            void qc.invalidateQueries({ queryKey: ['setup', 'thumb-column'] }).then(() =>
              qc.invalidateQueries(),
            );
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
