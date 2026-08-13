import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Check, ChevronDown, CloudUpload, FileText, Film, HardDrive, HelpCircle, Link2, Library, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CloudVideoUpload } from '@/components/course/CloudVideoUpload';
import { useHelpMode } from '@/components/course/HelpCard';
import { useAdminCourseTree } from '@/hooks/useAdminCourses';
import { useAdminVideos, type AdminVideo } from '@/hooks/useAdminVideos';
import { useBibliotecaLocal, useServidorLocal, urlLocal, type VideoLocal } from '@/hooks/useServidorLocal';
import { pick } from '@/lib/course';

type Origin = 'server' | 'computer' | 'link' | 'library';

export type VideoPlacementTarget = {
  courseId: string;
  lessonId?: string;
  destination: 'featured' | 'lesson';
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: VideoPlacementTarget | null;
};

const sourceOptions: { id: Origin; icon: typeof HardDrive }[] = [
  { id: 'server', icon: HardDrive },
  { id: 'computer', icon: CloudUpload },
  { id: 'link', icon: Link2 },
  { id: 'library', icon: Library },
];

export const VideoPlacementWizard = ({ open, onOpenChange, target }: Props) => {
  const { t, i18n } = useTranslation();
  const helpOn = useHelpMode();
  const queryClient = useQueryClient();
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [lessonId, setLessonId] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<AdminVideo | null>(null);
  const [selectedLocal, setSelectedLocal] = useState<VideoLocal | null>(null);
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [serverHelp, setServerHelp] = useState(false);
  const manualUrl = i18n.language?.startsWith('en')
    ? '/manuais/manual-do-servidor-en.pdf'
    : '/manuais/manual-do-servidor.pdf';
  const [uploaded, setUploaded] = useState<{ storagePath: string; url: string; fileName: string } | null>(null);
  const { data: tree } = useAdminCourseTree(target?.courseId);
  const { data: videos } = useAdminVideos();
  const server = useServidorLocal();
  const localLibrary = useBibliotecaLocal(server.ligado);

  useEffect(() => {
    if (!open) return;
    setOrigin(null);
    setLessonId(target?.lessonId ?? '');
    setSelectedVideo(null);
    setSelectedLocal(null);
    setLink('');
    setTitle('');
    setUploaded(null);
  }, [open, target?.lessonId]);

  const lessons = useMemo(() => {
    if (!tree) return [];
    return tree.modules.flatMap((module) =>
      tree.lessons
        .filter((lesson) => lesson.module_id === module.id)
        .map((lesson) => ({ ...lesson, moduleTitle: pick(module.title_pt, module.title_en) })),
    );
  }, [tree, i18n.language]);

  const localVideos = (localLibrary.data?.itens ?? []).filter((item) => !item.tipo || item.tipo === 'video');
  const destinationReady = target?.destination === 'featured' || !!lessonId;

  const attach = async (videoId: string) => {
    if (!target) return;
    if (target.destination === 'featured') {
      const { error } = await supabase.from('courses').update({ trailer_video_id: videoId }).eq('id', target.courseId);
      if (error) throw error;
      return;
    }
    if (!lessonId) throw new Error(t('videoWizard.chooseLessonError'));
    const { error } = await supabase.from('lessons').update({ video_id: videoId }).eq('id', lessonId);
    if (error) throw error;
  };

  const createAndAttach = async (payload: {
    title_pt: string;
    provider: 'vimeo' | 'youtube' | 'hls' | 'file';
    ref: string;
    source_path?: string | null;
    storage_path?: string | null;
    duration_seconds?: number | null;
  }) => {
    const { data, error } = await supabase
      .from('videos')
      .insert({ ...payload, status: 'publicado', is_free: false })
      .select('id')
      .single();
    if (error) throw error;
    await attach(data.id);
  };

  const finish = async () => {
    if (!target || !destinationReady || !origin) return;
    setSaving(true);
    try {
      if (origin === 'library' && selectedVideo) {
        await attach(selectedVideo.id);
      } else if (origin === 'server' && selectedLocal) {
        await createAndAttach({
          title_pt: selectedLocal.titulo,
          provider: 'file',
          ref: urlLocal('midia', selectedLocal.arquivo),
          source_path: selectedLocal.arquivo,
          duration_seconds: selectedLocal.duracao,
        });
      } else if (origin === 'link' && link.trim()) {
        const value = link.trim();
        const provider = /youtu\.be|youtube\.com/i.test(value) ? 'youtube' : /vimeo\.com/i.test(value) ? 'vimeo' : 'file';
        await createAndAttach({ title_pt: title.trim() || t('videoWizard.defaultTitle'), provider, ref: value });
      } else if (origin === 'computer' && uploaded) {
        await createAndAttach({
          title_pt: title.trim() || uploaded.fileName.replace(/\.[^.]+$/, ''),
          provider: 'file',
          ref: uploaded.url,
          source_path: uploaded.fileName,
          storage_path: uploaded.storagePath,
        });
      } else {
        return;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
        queryClient.invalidateQueries({ queryKey: ['free-lessons'] }),
      ]);
      toast.success(t('videoWizard.saved'));
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('videoWizard.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const canFinish = destinationReady && (
    (origin === 'library' && !!selectedVideo) ||
    (origin === 'server' && !!selectedLocal) ||
    (origin === 'link' && !!link.trim()) ||
    (origin === 'computer' && !!uploaded)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-course-border bg-course-card text-course-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t('videoWizard.title')}</DialogTitle>
          <DialogDescription className="font-body text-course-muted-foreground">
            {t('videoWizard.intro')}
          </DialogDescription>
        </DialogHeader>

        {target?.destination === 'lesson' && !target.lessonId && (
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <BookOpen className="h-4 w-4 text-course-primary" /> {t('videoWizard.destinationTitle')}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {lessons.map((lesson) => (
                <Button
                  key={lesson.id}
                  type="button"
                  variant="outline"
                  onClick={() => setLessonId(lesson.id)}
                  className={`h-auto justify-start border-course-border px-3 py-2 text-left ${lessonId === lesson.id ? 'border-course-primary bg-course-primary/10' : 'bg-course-background'}`}
                >
                  <span><span className="block text-xs text-course-muted-foreground">{lesson.moduleTitle}</span>{pick(lesson.title_pt, lesson.title_en)}</span>
                  {lessonId === lesson.id && <Check className="ml-auto h-4 w-4 text-course-primary" />}
                </Button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-2">
          <h3 className="font-display text-lg font-semibold">{t('videoWizard.originTitle')}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {sourceOptions.map(({ id, icon: Icon }) => (
              <Button
                key={id}
                type="button"
                variant="outline"
                onClick={() => setOrigin(id)}
                className={`h-auto justify-start gap-3 border-course-border px-4 py-3 text-left ${origin === id ? 'border-course-primary bg-course-primary/10' : 'bg-course-background'}`}
              >
                <Icon className="h-5 w-5 shrink-0 text-course-primary" />
                <span><span className="block font-semibold">{t(`videoWizard.origin_${id}`)}</span><span className="block text-xs font-normal text-course-muted-foreground">{t(`videoWizard.origin_${id}Hint`)}</span></span>
              </Button>
            ))}
          </div>
        </section>

        {helpOn && origin && (
          <section className="rounded-lg border border-course-primary/25 bg-course-primary/5 p-4">
            <p className="font-display font-semibold">{t(`videoWizard.help_${origin}Title`)}</p>
            <p className="mt-1 font-body text-sm leading-relaxed text-course-muted-foreground">{t(`videoWizard.help_${origin}`)}</p>
          </section>
        )}

        {origin === 'server' && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 font-body text-sm">
              <span className={`h-2 w-2 rounded-full ${server.ligado ? 'bg-emerald-400' : 'bg-course-muted-foreground'}`} />
              {server.ligado ? t('servidor.ligado') : t('servidor.desligado')}
              {localLibrary.data?.raiz && <code className="rounded bg-course-background px-2 py-1 text-xs">{localLibrary.data.raiz}</code>}
              {!server.ligado && <Button size="sm" variant="outline" onClick={() => server.reverificar()}>{t('servidor.reverificar')}</Button>}
            </div>

            {!server.ligado && (
              <div className="space-y-3 rounded-lg border border-course-border bg-course-background p-4">
                <p className="font-body text-sm text-course-foreground">{t('videoWizard.srvOffline')}</p>

                <div>
                  <p className="font-display text-sm font-semibold">{t('videoWizard.srvHowTitle')}</p>
                  <ol className="mt-2 space-y-2">
                    {[1, 2, 3].map((n) => (
                      <li key={n} className="flex gap-2.5 font-body text-sm text-course-muted-foreground">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-course-border text-[11px] text-course-foreground">{n}</span>
                        <span className="leading-relaxed">{t(`videoWizard.srvStep${n}`)}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={() => setServerHelp((v) => !v)}
                  className="flex items-center gap-1.5 font-body text-xs text-course-muted-foreground hover:text-course-foreground"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {t('videoWizard.srvWhatTitle')}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${serverHelp ? 'rotate-180' : ''}`} />
                </button>

                {serverHelp && (
                  <div className="space-y-3 rounded-lg border border-course-border/60 bg-course-card p-3 font-body text-sm leading-relaxed text-course-muted-foreground">
                    <p>{t('videoWizard.srvWhat')}</p>
                    <div>
                      <p className="font-semibold text-course-foreground">{t('videoWizard.srvWhereTitle')}</p>
                      <p>{t('videoWizard.srvWhere')}</p>
                    </div>
                    <p className="text-xs">{t('servidor.porqueNaoAutomatico')}</p>
                    <div>
                      <p className="font-semibold text-course-foreground">{t('videoWizard.srvNoServerTitle')}</p>
                      <p>{t('videoWizard.srvNoServer')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-course-border bg-course-background"
                        onClick={() => window.open(manualUrl, '_blank', 'noopener,noreferrer')}
                      >
                        <FileText className="mr-2 h-3.5 w-3.5" /> {t('videoWizard.srvManual')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-course-border bg-course-background"
                        onClick={() => setOrigin('computer')}
                      >
                        <CloudUpload className="mr-2 h-3.5 w-3.5" /> {t('videoWizard.srvUseComputer')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {server.ligado && localLibrary.isLoading && <Loader2 className="h-5 w-5 animate-spin text-course-primary" />}
            {server.ligado && !localLibrary.isLoading && localVideos.length === 0 && (
              <p className="font-body text-sm text-course-muted-foreground">{t('videoWizard.srvEmpty')}</p>
            )}
            <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
              {localVideos.map((video) => (
                <Button key={video.id} type="button" variant="outline" onClick={() => setSelectedLocal(video)} className={`h-auto justify-start border-course-border py-3 text-left ${selectedLocal?.id === video.id ? 'border-course-primary bg-course-primary/10' : 'bg-course-background'}`}>
                  <Film className="mr-2 h-4 w-4 shrink-0" /><span className="truncate">{video.titulo}<span className="block truncate text-xs font-normal text-course-muted-foreground">{video.arquivo}</span></span>
                </Button>
              ))}
            </div>
          </section>
        )}


        {origin === 'computer' && (
          <section className="space-y-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('videoWizard.videoName')} className="border-course-border bg-course-background" />
            <CloudVideoUpload storagePath={uploaded?.storagePath ?? null} isVimeo={false} onUploaded={setUploaded} onRemoved={() => setUploaded(null)} />
          </section>
        )}

        {origin === 'link' && (
          <section className="grid gap-3 sm:grid-cols-2">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('videoWizard.videoName')} className="border-course-border bg-course-background" />
            <Input value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://vimeo.com/..." className="border-course-border bg-course-background" />
          </section>
        )}

        {origin === 'library' && (
          <section className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
            {(videos ?? []).map((video) => (
              <Button key={video.id} type="button" variant="outline" onClick={() => setSelectedVideo(video)} className={`h-auto justify-start border-course-border py-3 text-left ${selectedVideo?.id === video.id ? 'border-course-primary bg-course-primary/10' : 'bg-course-background'}`}>
                <Library className="mr-2 h-4 w-4 shrink-0" /><span className="truncate">{pick(video.title_pt, video.title_en)}<span className="block text-xs font-normal text-course-muted-foreground">{video.provider}</span></span>
              </Button>
            ))}
          </section>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-course-border pt-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t('editor.cancel')}</Button>
          <Button type="button" disabled={!canFinish || saving} onClick={finish} className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('videoWizard.placeVideo')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};