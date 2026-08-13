import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudUpload, ExternalLink, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HelpNote } from '@/components/course/HelpCard';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const BUCKET = 'course-videos';
export const MAX_BYTES = 500 * 1024 * 1024;
const SIGNED_TTL = 60 * 60 * 24 * 365;
const ACCEPT = 'video/mp4,video/quicktime,video/webm';

export async function signCloudVideo(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  if (error) {
    toast.error(error.message);
    return null;
  }
  return data?.signedUrl ?? null;
}

type Props = {
  storagePath: string | null;
  isVimeo: boolean;
  /** called after a successful upload with the storage path, signed url and original file name */
  onUploaded: (info: { storagePath: string; url: string; fileName: string }) => void;
  /** called when the cloud draft file is removed */
  onRemoved: () => void;
};

export const CloudVideoUpload = ({ storagePath, isVimeo, onUploaded, onRemoved }: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const [guide, setGuide] = useState(false);

  const upload = async (file: File) => {
    if (file.size > MAX_BYTES) return toast.error(t('upload.tooLarge'));
    setBusy(true);
    setProgress(8);
    const timer = setInterval(() => setProgress((p) => (p < 90 ? p + 4 : p)), 400);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${crypto.randomUUID()}-${safe}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || 'video/mp4',
      upsert: false,
    });
    clearInterval(timer);
    if (error) {
      setBusy(false);
      setProgress(0);
      return toast.error(error.message);
    }
    const url = await signCloudVideo(path);
    setProgress(100);
    setBusy(false);
    if (!url) return;
    onUploaded({ storagePath: path, url, fileName: file.name });
    toast.success(t('upload.done'));
  };

  const removeDraft = async () => {
    if (!storagePath) return;
    if (!confirm(t('upload.confirmRemove'))) return;
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (error) return toast.error(error.message);
    onRemoved();
    toast.success(t('upload.removed'));
  };

  const download = async () => {
    if (!storagePath) return;
    const url = await signCloudVideo(storagePath);
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 rounded-xl border border-course-border bg-course-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
          <CloudUpload className="h-5 w-5" /> {t('upload.title')}
        </h3>
        {isVimeo ? (
          <Badge className="border-none bg-emerald-500/15 font-body text-xs text-emerald-300">
            {t('upload.badgeVimeo')}
          </Badge>
        ) : storagePath ? (
          <Badge className="border-none bg-amber-500/15 font-body text-xs text-amber-300">
            {t('upload.badgeCloud')}
          </Badge>
        ) : null}
      </div>

      <HelpNote id="cloudUpload" />



      {storagePath && !isVimeo && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 font-body text-sm text-amber-200">
          {t('upload.cloudWarning')}
        </p>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center transition-colors ${
          drag ? 'border-course-primary bg-course-primary/5' : 'border-course-border'
        }`}
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-course-primary" />
        ) : (
          <Upload className="h-6 w-6 text-course-muted-foreground" />
        )}
        <p className="font-body text-sm text-course-foreground">{t('upload.dropzone')}</p>
        <p className="font-body text-xs text-course-muted-foreground">{t('upload.limits')}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = '';
          }}
        />
      </div>

      {busy && <Progress value={progress} className="h-2" />}

      {storagePath && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-course-border bg-course-background text-course-foreground"
            onClick={download}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> {t('upload.openFile')}
          </Button>
          <Button
            className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
            onClick={() => setGuide(true)}
          >
            {t('upload.migrateCta')}
          </Button>
          <Button
            variant="ghost"
            className="text-course-muted-foreground hover:text-red-400"
            onClick={removeDraft}
          >
            <Trash2 className="mr-2 h-4 w-4" /> {t('upload.removeDraft')}
          </Button>
        </div>
      )}

      <Dialog open={guide} onOpenChange={setGuide}>
        <DialogContent className="border-course-border bg-course-card text-course-foreground">
          <DialogHeader>
            <DialogTitle className="font-display">{t('upload.guideTitle')}</DialogTitle>
            <DialogDescription className="font-body text-course-muted-foreground">
              {t('upload.guideIntro')}
            </DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 font-body text-sm">
            <li>{t('upload.step1')}</li>
            <li>{t('upload.step2')}</li>
            <li>{t('upload.step3')}</li>
            <li>{t('upload.step4')}</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-course-border bg-course-background text-course-foreground"
              onClick={download}
            >
              {t('upload.openFile')}
            </Button>
            <Button
              variant="outline"
              className="border-course-border bg-course-background text-course-foreground"
              onClick={() => window.open('https://vimeo.com/upload', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Vimeo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
