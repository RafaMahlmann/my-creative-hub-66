import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThumbPicker } from '@/components/course/ThumbPicker';
import { HelpCard } from '@/components/course/HelpCard';
import { useThumbSupport } from '@/hooks/useThumbSupport';


type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url: string | null | undefined;
  onSave: (url: string | null) => void;
  /** títulos alternativos (padrão: miniatura do vídeo) */
  title?: string;
  description?: string;
  /** miniatura de curso usa `cover_url`, que independe da migração */
  ignoreSetup?: boolean;
};

/** Troca de miniatura em qualquer lugar — vitrine, painel ou editor. */
export const ThumbEditorDialog = ({
  open,
  onOpenChange,
  url,
  onSave,
  title,
  description,
  ignoreSetup,
}: Props) => {
  const { t } = useTranslation();
  const supported = useThumbSupport();
  const blocked = !ignoreSetup && !supported;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-course-border bg-course-card text-course-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {title ?? t('editor.thumbTitle')}
          </DialogTitle>
          <DialogDescription className="font-body text-course-muted-foreground">
            {description ?? t('editor.thumbHelp')}
          </DialogDescription>
        </DialogHeader>

        <HelpCard id="thumbDialog" collapsed />



        {blocked ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 font-body text-sm text-amber-200">
            {t('setup.thumbBlocked')}
          </p>
        ) : (
          <ThumbPicker
            url={url}
            onChange={(next) => {
              onSave(next);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
