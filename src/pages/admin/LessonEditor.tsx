import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, Save, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { HelpCard, HelpModeToggle, HelpNote } from '@/components/course/HelpCard';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import { SubtitlesTab } from '@/components/course/SubtitlesTab';
import { CloudVideoUpload } from '@/components/course/CloudVideoUpload';
import { ThumbPicker } from '@/components/course/ThumbPicker';
import { PendingSetupCard } from '@/components/course/PendingSetupCard';
import { MaterialsTab } from '@/components/course/MaterialsTab';
import { useThumbSupport } from '@/hooks/useThumbSupport';
import { useSubtitles, useCleanTranscript } from '@/hooks/useSubtitles';
import { vttToPlainText } from '@/lib/vtt';

import { TutorContextTab } from '@/components/course/TutorContextTab';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type Provider = 'vimeo' | 'youtube' | 'hls' | 'file';
type Status = 'ideia' | 'gravado' | 'editado' | 'legendado' | 'publicado';

const Inner = () => {
  const { courseId, lessonId } = useParams();
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'lesson', lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('*, videos(*)')
        .eq('id', lessonId!)
        .maybeSingle();
      if (error) throw error;
      return { lesson };
    },
  });

  const lesson = data?.lesson;
  const video = (lesson as { videos?: Record<string, unknown> } | undefined)?.videos as
    | {
        id: string;
        provider: Provider;
        ref: string | null;
        duration_seconds: number | null;
        source_path: string | null;
        source_note: string | null;
        storage_path: string | null;
        thumb_url: string | null;
        status: Status;
      }
    | null
    | undefined;

  const thumbOk = useThumbSupport();
  const [form, setForm] = useState<Record<string, string>>({});
  const [vForm, setVForm] = useState<Record<string, string>>({});
  const { data: subtitles } = useSubtitles(video?.id);
  const cleanTranscript = useCleanTranscript();

  const generateDraft = (lang: 'pt' | 'en') => {
    const raw = vttToPlainText(subtitles?.[lang]?.content);
    if (!raw.trim()) return toast.error(t('editor.noTranscriptYet'));
    cleanTranscript.mutate(
      { text: raw, lang },
      {
        onSuccess: (text) => setForm((s) => ({ ...s, [`content_${lang}`]: text })),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'erro'),
      },
    );
  };

  useEffect(() => {
    if (!lesson) return;
    setForm({
      title_pt: lesson.title_pt ?? '',
      title_en: lesson.title_en ?? '',
      description_pt: lesson.description_pt ?? '',
      description_en: lesson.description_en ?? '',
      content_pt: lesson.content_pt ?? '',
      content_en: lesson.content_en ?? '',
    });
    setVForm({
      provider: video?.provider ?? 'vimeo',
      ref: video?.ref ?? '',
      duration_seconds: video?.duration_seconds ? String(video.duration_seconds) : '',
      source_path: video?.source_path ?? '',
      source_note: video?.source_note ?? '',
      status: video?.status ?? 'ideia',
      storage_path: video?.storage_path ?? '',
      thumb_url: video?.thumb_url ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, video?.id]);


  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin'] });
    qc.invalidateQueries({ queryKey: ['course'] });
    qc.invalidateQueries({ queryKey: ['lesson'] });
    qc.invalidateQueries({ queryKey: ['free-lessons'] });
  };

  const saveLesson = async (patch: Partial<{
    title_pt: string; title_en: string; description_pt: string; description_en: string;
    content_pt: string; content_en: string; is_free: boolean; is_published: boolean;
  }>) => {
    const { error } = await supabase.from('lessons').update(patch).eq('id', lessonId!);
    if (error) return toast.error(error.message);
    refresh();
    toast.success(t('admin.saved'));
  };

  const saveVideo = async (overrides?: Record<string, string>) => {
    const v = { ...vForm, ...(overrides ?? {}) };
    const payload = {
      title_pt: form.title_pt || 'Vídeo',
      provider: v.provider as Provider,
      ref: v.ref || null,
      duration_seconds: v.duration_seconds ? Number(v.duration_seconds) : null,
      source_path: v.source_path || null,
      source_note: v.source_note || null,
      storage_path: v.storage_path || null,
      status: v.status as Status,
      is_free: !!lesson?.is_free,
      // só enviamos a miniatura depois que o SQL da Etapa A rodou
      ...(thumbOk ? { thumb_url: v.thumb_url || null } : {}),
    };
    if (video?.id) {
      const { error } = await supabase.from('videos').update(payload).eq('id', video.id);
      if (error) return toast.error(error.message);
    } else {
      const { data: created, error } = await supabase.from('videos').insert(payload).select('id').single();
      if (error) return toast.error(error.message);
      const { error: lErr } = await supabase.from('lessons').update({ video_id: created.id }).eq('id', lessonId!);
      if (lErr) return toast.error(lErr.message);
    }
    refresh();
    toast.success(t('admin.saved'));
  };


  if (isLoading) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-4xl space-y-4 px-6 py-12">
          <Skeleton className="h-10 w-1/2 bg-course-secondary" />
          <Skeleton className="h-72 w-full bg-course-secondary" />
        </div>
      </CourseShell>
    );
  }

  if (!lesson) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-xl px-6 py-24 text-center font-display text-2xl">
          {t('lesson.notFound')}
        </div>
      </CourseShell>
    );
  }

  const field = (key: string, label: string, area = false) => (
    <label className="space-y-1">
      <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">{label}</span>
      {area ? (
        <Textarea
          rows={6}
          value={form[key] ?? ''}
          onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
          className="border-course-border bg-course-background text-course-foreground"
        />
      ) : (
        <Input
          value={form[key] ?? ''}
          onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
          className="border-course-border bg-course-background text-course-foreground"
        />
      )}
    </label>
  );

  return (
    <CourseShell>
      <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <Link
          to={`/curso/admin/${courseId}`}
          className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t('admin.backToCourse')}
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold">{lesson.title_pt}</h1>
          <HelpModeToggle />
        </div>

        <HelpCard id="lessonEditor" collapsed />

        <Tabs defaultValue="video">
          <TabsList className="bg-course-card">
            <TabsTrigger value="video">{t('admin.tabVideo')}</TabsTrigger>
            <TabsTrigger value="content">{t('admin.tabContent')}</TabsTrigger>
            <TabsTrigger value="materials">{t('admin.tabMaterials')}</TabsTrigger>
            <TabsTrigger value="subtitles">{t('subtitles.tab')}</TabsTrigger>
            <TabsTrigger value="tutor">{t('tutor.tab')}</TabsTrigger>
            <TabsTrigger value="access">{t('admin.tabAccess')}</TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="space-y-4 pt-4">
            <HelpCard id="lessonVideo" />

            <PendingSetupCard />

            <div className="max-w-sm space-y-1">
              <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
                {t('editor.thumbTitle')}
              </span>
              <ThumbPicker
                url={vForm.thumb_url || null}
                disabled={!thumbOk}
                onChange={(u) => {
                  setVForm((s) => ({ ...s, thumb_url: u ?? '' }));
                  void saveVideo({ thumb_url: u ?? '' });
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
                  {t('admin.provider')}
                </span>
                <Select value={vForm.provider} onValueChange={(v) => setVForm((s) => ({ ...s, provider: v }))}>
                  <SelectTrigger className="border-course-border bg-course-background text-course-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="hls">HLS</SelectItem>
                    <SelectItem value="file">{t('admin.fileUrl')}</SelectItem>
                  </SelectContent>
                </Select>
                <HelpNote id="provider" />
              </label>
              <label className="space-y-1">
                <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
                  {t('admin.videoRef')}
                </span>
                <Input
                  value={vForm.ref ?? ''}
                  onChange={(e) => setVForm((s) => ({ ...s, ref: e.target.value }))}
                  className="border-course-border bg-course-background text-course-foreground"
                />
              </label>
              <label className="space-y-1">
                <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
                  {t('admin.duration')}
                </span>
                <Input
                  type="number"
                  value={vForm.duration_seconds ?? ''}
                  onChange={(e) => setVForm((s) => ({ ...s, duration_seconds: e.target.value }))}
                  className="border-course-border bg-course-background text-course-foreground"
                />
              </label>
              <label className="space-y-1">
                <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
                  {t('admin.status')}
                </span>
                <Select value={vForm.status} onValueChange={(v) => setVForm((s) => ({ ...s, status: v }))}>
                  <SelectTrigger className="border-course-border bg-course-background text-course-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['ideia', 'gravado', 'editado', 'legendado', 'publicado'].map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`admin.status_${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
                  {t('admin.sourcePath')}
                </span>
                <div className="flex gap-2">
                  <Input
                    value={vForm.source_path ?? ''}
                    onChange={(e) => setVForm((s) => ({ ...s, source_path: e.target.value }))}
                    placeholder="D:\\videos\\aula01.mp4"
                    className="border-course-border bg-course-background text-course-foreground"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-course-border bg-course-card text-course-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(vForm.source_path ?? '');
                      toast.success(t('admin.copied'));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <HelpNote id="sourcePath" />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
                  {t('admin.sourceNote')}
                </span>
                <Textarea
                  rows={2}
                  value={vForm.source_note ?? ''}
                  onChange={(e) => setVForm((s) => ({ ...s, source_note: e.target.value }))}
                  className="border-course-border bg-course-background text-course-foreground"
                />
              </label>
            </div>

            <Button onClick={() => saveVideo()} className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90">
              <Save className="mr-2 h-4 w-4" /> {t('admin.save')}
            </Button>

            <CloudVideoUpload
              storagePath={vForm.storage_path || null}
              isVimeo={vForm.provider === 'vimeo' && !!vForm.ref}
              onUploaded={({ storagePath, url, fileName }) => {
                const patch = {
                  provider: 'file',
                  ref: url,
                  storage_path: storagePath,
                  source_path: vForm.source_path || fileName,
                  status: vForm.status === 'ideia' ? 'gravado' : vForm.status,
                };
                setVForm((s) => ({ ...s, ...patch }));
                saveVideo(patch);
              }}
              onRemoved={() => {
                const patch = { storage_path: '', ref: vForm.provider === 'file' ? '' : vForm.ref };
                setVForm((s) => ({ ...s, ...patch }));
                saveVideo(patch);
              }}
            />


            <div className="pt-2">
              <p className="mb-2 font-body text-xs uppercase tracking-wide text-course-muted-foreground">
                {t('admin.livePreview')}
              </p>
              <VideoPlayer
                video={{
                  id: 'preview',
                  provider: (vForm.provider as Provider) ?? 'vimeo',
                  ref: vForm.ref ?? null,
                  duration_seconds: null,
                  is_free: true,
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 pt-4">
            <HelpCard id="lessonContent" />
            <div className="grid gap-4 sm:grid-cols-2">
              {field('title_pt', t('admin.titlePt'))}
              {field('title_en', t('admin.titleEn'))}
              {field('description_pt', t('admin.descPt'), true)}
              {field('description_en', t('admin.descEn'), true)}
              <div className="space-y-1">
                {field('content_pt', t('admin.contentPt'), true)}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={cleanTranscript.isPending || !subtitles?.pt?.content}
                  onClick={() => generateDraft('pt')}
                  className="border-course-border bg-course-card text-course-foreground hover:bg-course-secondary"
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  {t('editor.draftFromTranscript')}
                </Button>
              </div>
              <div className="space-y-1">
                {field('content_en', t('admin.contentEn'), true)}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={cleanTranscript.isPending || !subtitles?.en?.content}
                  onClick={() => generateDraft('en')}
                  className="border-course-border bg-course-card text-course-foreground hover:bg-course-secondary"
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  {t('editor.draftFromTranscript')}
                </Button>
              </div>
            </div>
            <HelpNote id="draftFromTranscript" />
            <Button
              onClick={() => saveLesson(form)}
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
            >
              <Save className="mr-2 h-4 w-4" /> {t('admin.save')}
            </Button>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4 pt-4">
            <HelpCard id="lessonMaterials" />
            <MaterialsTab lessonId={lessonId!} />
          </TabsContent>

          <TabsContent value="subtitles" className="space-y-4 pt-4">
            <HelpCard id="lessonSubtitles" />
            <SubtitlesTab
              videoId={video?.id ?? null}
              sourcePath={vForm.source_path || video?.source_path}
            />
          </TabsContent>

          <TabsContent value="tutor" className="space-y-4 pt-4">
            <HelpCard id="lessonTutor" />
            <TutorContextTab moduleId={(lesson as { module_id?: string })?.module_id ?? null} />
          </TabsContent>



          <TabsContent value="access" className="space-y-4 pt-4">
            <HelpCard id="lessonAccess" />
            <label className="flex items-center gap-3 rounded-lg border border-course-border bg-course-card px-4 py-3 font-body text-sm">
              <Switch
                checked={!!lesson.is_free}
                onCheckedChange={(v) => saveLesson({ is_free: v })}
              />
              {lesson.is_free ? t('course.free') : t('course.paid')}
            </label>
            <HelpNote id="freeToggle" />
            <label className="flex items-center gap-3 rounded-lg border border-course-border bg-course-card px-4 py-3 font-body text-sm">
              <Switch
                checked={!!lesson.is_published}
                onCheckedChange={(v) => saveLesson({ is_published: v })}
              />
              {lesson.is_published ? t('admin.published') : t('admin.draft')}
            </label>
            <HelpNote id="publishToggle" />
          </TabsContent>
        </Tabs>
      </div>
    </CourseShell>
  );
};

const LessonEditor = () => (
  <AdminGuard>
    <Inner />
  </AdminGuard>
);

export default LessonEditor;
