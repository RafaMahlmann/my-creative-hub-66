import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAdminVideos,
  useAdminVideoMutations,
  type AdminVideo,
  type VideoProvider,
  type VideoStatus,
} from '@/hooks/useAdminVideos';
import { formatDuration } from '@/lib/course';

const STATUSES: VideoStatus[] = ['ideia', 'gravado', 'editado', 'legendado', 'publicado'];
const PROVIDERS: VideoProvider[] = ['vimeo', 'youtube', 'hls', 'file'];

const statusTone: Record<VideoStatus, string> = {
  ideia: 'bg-course-secondary text-course-muted-foreground',
  gravado: 'bg-amber-500/15 text-amber-300',
  editado: 'bg-sky-500/15 text-sky-300',
  legendado: 'bg-violet-500/15 text-violet-300',
  publicado: 'bg-emerald-500/15 text-emerald-300',
};

const VideoCard = ({ video }: { video: AdminVideo }) => {
  const { t } = useTranslation();
  const { updateVideo, deleteVideo } = useAdminVideoMutations();
  const [path, setPath] = useState(video.source_path ?? '');
  const [note, setNote] = useState(video.source_note ?? '');

  const save = (patch: Partial<AdminVideo>) => updateVideo.mutate({ id: video.id, ...patch });

  return (
    <li className="rounded-xl border border-course-border bg-course-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[14rem] flex-1">
          <Input
            defaultValue={video.title_pt}
            onBlur={(e) => e.target.value !== video.title_pt && save({ title_pt: e.target.value })}
            className="border-transparent bg-transparent px-0 font-display text-lg font-semibold text-course-foreground focus-visible:border-course-border focus-visible:px-3"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge className={`border-none font-body text-xs ${statusTone[video.status]}`}>
              {t(`admin.status_${video.status}`)}
            </Badge>
            <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
              {video.provider}
            </span>
            {formatDuration(video.duration_seconds) && (
              <span className="font-body text-xs text-course-muted-foreground">
                {formatDuration(video.duration_seconds)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-body text-xs text-course-muted-foreground">
            {t('admin.videoFree')}
            <Switch checked={video.is_free} onCheckedChange={(v) => save({ is_free: v })} />
          </label>
          <Select value={video.status} onValueChange={(v) => save({ status: v as VideoStatus })}>
            <SelectTrigger className="w-36 border-course-border bg-course-background text-course-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`admin.status_${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="text-course-muted-foreground hover:text-red-400"
            onClick={() => {
              if (confirm(t('admin.confirmDelete'))) deleteVideo.mutate(video.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="font-body text-xs text-course-muted-foreground">{t('admin.sourcePath')}</label>
          <div className="mt-1 flex gap-2">
            <Input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onBlur={() => path !== (video.source_path ?? '') && save({ source_path: path || null })}
              placeholder="D:\\videos\\aula01.mp4"
              className="border-course-border bg-course-background text-course-foreground"
            />
            <Button
              variant="outline"
              className="border-course-border bg-course-card text-course-foreground"
              onClick={() => {
                navigator.clipboard.writeText(path);
                toast.success(t('admin.copied'));
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <label className="font-body text-xs text-course-muted-foreground">{t('admin.sourceNote')}</label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== (video.source_note ?? '') && save({ source_note: note || null })}
            className="mt-1 border-course-border bg-course-background text-course-foreground"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">
          {t('admin.usedIn')}
        </p>
        {video.usage.length === 0 ? (
          <p className="font-body text-sm text-course-muted-foreground">{t('admin.notUsed')}</p>
        ) : (
          <div className="mt-1 flex flex-wrap gap-2">
            {video.usage.map((u, i) => (
              <Link
                key={i}
                to={u.href}
                className="rounded-full border border-course-border px-3 py-1 font-body text-xs text-course-foreground transition-colors hover:border-course-primary hover:text-course-primary"
              >
                {u.kind === 'trailer' ? `${t('admin.trailer')}: ` : ''}
                {u.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </li>
  );
};

const Inner = () => {
  const { t } = useTranslation();
  const { data: videos, isLoading } = useAdminVideos();
  const { createVideo } = useAdminVideoMutations();
  const [title, setTitle] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [provider, setProvider] = useState<string>('all');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (videos ?? []).filter((v) => {
      if (status !== 'all' && v.status !== status) return false;
      if (provider !== 'all' && v.provider !== provider) return false;
      if (!term) return true;
      return [v.title_pt, v.title_en, v.ref, v.source_path, v.source_note]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(term));
    });
  }, [videos, q, status, provider]);

  return (
    <CourseShell>
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <header className="space-y-2">
          <Link
            to="/curso/admin"
            className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t('admin.backToPanel')}
          </Link>
          <h1 className="font-display text-4xl font-semibold">{t('admin.videoLibrary')}</h1>
          <p className="font-body text-sm text-course-muted-foreground">{t('admin.videoLibraryHint')}</p>
        </header>

        <section className="grid gap-3 rounded-xl border border-course-border bg-course-card p-5 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-course-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('admin.searchVideos')}
              className="border-course-border bg-course-background pl-9 text-course-foreground"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44 border-course-border bg-course-background text-course-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`admin.status_${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-40 border-course-border bg-course-background text-course-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allProviders')}</SelectItem>
              {PROVIDERS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createVideo.mutate(title.trim(), { onSuccess: () => setTitle('') });
          }}
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('admin.newVideoPlaceholder')}
            className="border-course-border bg-course-card text-course-foreground"
          />
          <Button
            type="submit"
            disabled={createVideo.isPending}
            className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" /> {t('admin.create')}
          </Button>
        </form>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full bg-course-secondary" />
            <Skeleton className="h-40 w-full bg-course-secondary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-course-border p-10 text-center font-body text-course-muted-foreground">
            {t('admin.noVideos')}
          </p>
        ) : (
          <ul className="space-y-4">
            {filtered.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </ul>
        )}
      </div>
    </CourseShell>
  );
};

const VideoLibrary = () => (
  <AdminGuard>
    <Inner />
  </AdminGuard>
);

export default VideoLibrary;
