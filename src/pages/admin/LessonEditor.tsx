import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import { SubtitlesTab } from '@/components/course/SubtitlesTab';
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
      const { data: materials, error: mErr } = await supabase
        .from('lesson_materials')
        .select('*')
        .eq('lesson_id', lessonId!)
        .order('position', { ascending: true });
      if (mErr) throw mErr;
      return { lesson, materials: materials ?? [] };
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
        status: Status;
      }
    | null
    | undefined;

  const [form, setForm] = useState<Record<string, string>>({});
  const [vForm, setVForm] = useState<Record<string, string>>({});
  const [material, setMaterial] = useState({ title: '', url: '', type: '' });

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

  const saveVideo = async () => {
    const payload = {
      title_pt: form.title_pt || 'Vídeo',
      provider: vForm.provider as Provider,
      ref: vForm.ref || null,
      duration_seconds: vForm.duration_seconds ? Number(vForm.duration_seconds) : null,
      source_path: vForm.source_path || null,
      source_note: vForm.source_note || null,
      status: vForm.status as Status,
      is_free: !!lesson?.is_free,
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

        <h1 className="font-display text-3xl font-semibold">{lesson.title_pt}</h1>

        <Tabs defaultValue="video">
          <TabsList className="bg-course-card">
            <TabsTrigger value="video">{t('admin.tabVideo')}</TabsTrigger>
            <TabsTrigger value="content">{t('admin.tabContent')}</TabsTrigger>
            <TabsTrigger value="materials">{t('admin.tabMaterials')}</TabsTrigger>
            <TabsTrigger value="subtitles">{t('subtitles.tab')}</TabsTrigger>
            <TabsTrigger value="access">{t('admin.tabAccess')}</TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="space-y-4 pt-4">
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

            <Button onClick={saveVideo} className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90">
              <Save className="mr-2 h-4 w-4" /> {t('admin.save')}
            </Button>

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
            <div className="grid gap-4 sm:grid-cols-2">
              {field('title_pt', t('admin.titlePt'))}
              {field('title_en', t('admin.titleEn'))}
              {field('description_pt', t('admin.descPt'), true)}
              {field('description_en', t('admin.descEn'), true)}
              {field('content_pt', t('admin.contentPt'), true)}
              {field('content_en', t('admin.contentEn'), true)}
            </div>
            <Button
              onClick={() => saveLesson(form)}
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
            >
              <Save className="mr-2 h-4 w-4" /> {t('admin.save')}
            </Button>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4 pt-4">
            <ul className="space-y-2">
              {data?.materials.map((mt) => (
                <li
                  key={mt.id}
                  className="flex items-center gap-3 rounded-lg border border-course-border bg-course-card px-4 py-3"
                >
                  <span className="min-w-0 flex-1 truncate font-body text-sm">{mt.title_pt}</span>
                  <span className="font-body text-xs text-course-muted-foreground">{mt.file_type}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-course-muted-foreground hover:text-destructive"
                    onClick={async () => {
                      await supabase.from('lesson_materials').delete().eq('id', mt.id);
                      refresh();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
              {!data?.materials.length && (
                <li className="font-body text-sm text-course-muted-foreground">{t('lesson.noMaterials')}</li>
              )}
            </ul>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                value={material.title}
                onChange={(e) => setMaterial((s) => ({ ...s, title: e.target.value }))}
                placeholder={t('admin.materialTitle')}
                className="border-course-border bg-course-background text-course-foreground"
              />
              <Input
                value={material.url}
                onChange={(e) => setMaterial((s) => ({ ...s, url: e.target.value }))}
                placeholder="https://..."
                className="border-course-border bg-course-background text-course-foreground"
              />
              <Input
                value={material.type}
                onChange={(e) => setMaterial((s) => ({ ...s, type: e.target.value }))}
                placeholder="PDF"
                className="border-course-border bg-course-background text-course-foreground"
              />
            </div>
            <Button
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
              onClick={async () => {
                if (!material.title.trim() || !material.url.trim()) return;
                const { error } = await supabase.from('lesson_materials').insert({
                  lesson_id: lessonId!,
                  title_pt: material.title.trim(),
                  file_url: material.url.trim(),
                  file_type: material.type || null,
                  position: (data?.materials.length ?? 0) + 1,
                });
                if (error) return toast.error(error.message);
                setMaterial({ title: '', url: '', type: '' });
                refresh();
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> {t('admin.addMaterial')}
            </Button>
          </TabsContent>

          <TabsContent value="subtitles" className="space-y-4 pt-4">
            <SubtitlesTab videoId={video?.id ?? null} />
          </TabsContent>

          <TabsContent value="access" className="space-y-4 pt-4">
            <label className="flex items-center gap-3 rounded-lg border border-course-border bg-course-card px-4 py-3 font-body text-sm">
              <Switch
                checked={!!lesson.is_free}
                onCheckedChange={(v) => saveLesson({ is_free: v })}
              />
              {lesson.is_free ? t('course.free') : t('course.paid')}
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-course-border bg-course-card px-4 py-3 font-body text-sm">
              <Switch
                checked={!!lesson.is_published}
                onCheckedChange={(v) => saveLesson({ is_published: v })}
              />
              {lesson.is_published ? t('admin.published') : t('admin.draft')}
            </label>
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
