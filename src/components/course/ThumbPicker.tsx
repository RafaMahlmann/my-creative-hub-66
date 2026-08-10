import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Link2, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { THUMB_ACCEPT, THUMB_MAX_BYTES, uploadThumb } from '@/lib/thumbs';

type Props = {
  url: string | null | undefined;
  onChange: (url: string | null) => void;
  /** desabilita a troca (ex.: enquanto o SQL da Etapa A não foi aplicado) */
  disabled?: boolean;
  className?: string;
};

/** Miniatura clicável: clica na imagem, escolhe o arquivo, pronto. */
export const ThumbPicker = ({ url, onChange, disabled, className = '' }: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState('');

  const send = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast.error(t('editor.thumbInvalid'));
    if (file.size > THUMB_MAX_BYTES) return toast.error(t('editor.thumbTooLarge'));
    setBusy(true);
    try {
      onChange(await uploadThumb(file));
      toast.success(t('editor.thumbSaved'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('editor.thumbFailed'));
    } finally {
      setBusy(false);
    }
  };

  const pick = () => {
    if (!disabled && !busy) inputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        onClick={pick}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void send(f);
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={url ? t('editor.thumbChange') : t('editor.thumbAdd')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pick();
          }
        }}
        className={`group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed bg-course-secondary transition-colors ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${drag ? 'border-course-primary bg-course-primary/10' : 'border-course-border'}`}
      >
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-course-muted-foreground">
            <ImagePlus size={26} strokeWidth={1.3} />
            <span className="font-body text-xs">{t('editor.thumbAdd')}</span>
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {url && !busy && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 font-body text-sm text-white">
              <ImagePlus size={15} /> {t('editor.thumbChange')}
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={THUMB_ACCEPT}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void send(f);
          e.target.value = '';
        }}
      />

      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-auto font-body text-[11px] text-course-muted-foreground">
            {t('editor.thumbHint')}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 font-body text-xs text-course-muted-foreground hover:text-course-foreground"
            onClick={() => setLinkOpen((v) => !v)}
          >
            <Link2 className="mr-1 h-3.5 w-3.5" /> {t('editor.thumbPasteLink')}
          </Button>
          {url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 font-body text-xs text-course-muted-foreground hover:text-red-400"
              onClick={() => onChange(null)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> {t('editor.thumbRemove')}
            </Button>
          )}
        </div>
      )}

      {linkOpen && !disabled && (
        <div className="flex gap-2">
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            className="border-course-border bg-course-background text-course-foreground"
          />
          <Button
            type="button"
            size="sm"
            className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
            onClick={() => {
              const v = link.trim();
              if (!v) return;
              onChange(v);
              setLink('');
              setLinkOpen(false);
              toast.success(t('editor.thumbSaved'));
            }}
          >
            {t('editor.save')}
          </Button>
        </div>
      )}
    </div>
  );
};
