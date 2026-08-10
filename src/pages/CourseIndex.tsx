import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PlayCircle, Sprout, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseShell } from '@/components/course/CourseShell';
import { CourseRow } from '@/components/course/CourseRow';
import { CourseCard } from '@/components/course/CourseCard';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import { EditModeBar } from '@/components/course/EditModeBar';
import { FeaturedEditorDialog } from '@/components/course/FeaturedEditorDialog';
import { ThumbEditorDialog } from '@/components/course/ThumbEditorDialog';
import { useCourses, useFreeLessons } from '@/hooks/useCourses';
import { useCourseEditMode } from '@/hooks/useCourseEditMode';
import { useHomeEditing } from '@/hooks/useHomeEditing';
import { useAdminMutations } from '@/hooks/useAdminCourses';
import { useAdminVideoMutations } from '@/hooks/useAdminVideos';
import { pick, formatDuration } from '@/lib/course';

/** Alvo da troca de miniatura: capa de curso ou miniatura de vídeo. */
type ThumbTarget =
  | { kind: 'course'; id: string; url: string | null }
  | { kind: 'video'; id: string; url: string | null };

const CardSkeletons = () => (
  <>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="w-64 shrink-0 sm:w-72">
        <Skeleton className="aspect-video w-full rounded-xl bg-course-secondary" />
        <Skeleton className="mt-3 h-4 w-3/4 bg-course-secondary" />
        <Skeleton className="mt-2 h-3 w-1/2 bg-course-secondary" />
      </div>
    ))}
  </>
);

const CourseIndex = () => {
  const { t, i18n } = useTranslation();
  const { data: courses, isLoading } = useCourses();
  const { data: freeLessons, isLoading: loadingFree } = useFreeLessons();
  const { editing } = useCourseEditMode();
  const { swapCoursePositions, toggleLessonFree } = useHomeEditing();
  const { updateCourse } = useAdminMutations();
  const { updateVideo } = useAdminVideoMutations();
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const [thumbTarget, setThumbTarget] = useState<ThumbTarget | null>(null);

  const saveThumb = (url: string | null) => {
    if (!thumbTarget) return;
    if (thumbTarget.kind === 'course') {
      updateCourse.mutate({ id: thumbTarget.id, cover_url: url } as never);
    } else {
      updateVideo.mutate({ id: thumbTarget.id, thumb_url: url });
    }
  };

  const featured = courses?.find((c) => c.is_featured) ?? courses?.[0];
  const lang = i18n.language;

  const move = (index: number, dir: -1 | 1) => {
    if (!courses) return;
    const a = courses[index];
    const b = courses[index + dir];
    if (!a || !b) return;
    swapCoursePositions.mutate({
      a: { id: a.id, position: a.position },
      b: { id: b.id, position: b.position },
    });
  };

  return (
    <CourseShell>
      {/* Hero spotlight */}
      <section
        className={`relative overflow-hidden border-b border-course-border/60 ${
          editing ? 'ring-1 ring-inset ring-dashed ring-course-primary/40' : ''
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--course-primary)/0.18),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-24">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-course-border bg-course-card px-3 py-1 font-body text-xs uppercase tracking-widest text-course-muted-foreground">
              <Sprout size={13} /> {t('course.spotlight')}
            </span>
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-3/4 bg-course-secondary" />
                <Skeleton className="h-4 w-full bg-course-secondary" />
              </>
            ) : featured ? (
              <>
                <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
                  {pick(featured.title_pt, featured.title_en)}
                </h1>
                <p className="max-w-xl font-body text-lg text-course-muted-foreground">
                  {pick(featured.description_pt, featured.description_en) || t('course.description')}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to={`/curso/${featured.slug}`}>
                    <Button className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {t('course.startNow')}
                    </Button>
                  </Link>
                  {editing && (
                    <Button
                      variant="outline"
                      onClick={() => setFeaturedOpen(true)}
                      className="border-course-border bg-course-card text-course-foreground"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      {t('editor.editFeatured')}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
                  {t('course.courseArea')}
                </h1>
                <p className="max-w-xl font-body text-lg text-course-muted-foreground">
                  {t('course.emptyCatalog')}
                </p>
                {editing && (
                  <Button
                    onClick={() => setFeaturedOpen(true)}
                    className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('editor.editFeatured')}
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="relative">
            {featured?.trailer?.ref ? (
              <VideoPlayer video={{ ...featured.trailer, is_free: true }} />
            ) : (
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-course-border bg-course-card shadow-2xl">
                {featured?.cover_url ? (
                  <img
                    src={featured.cover_url}
                    alt={pick(featured.title_pt, featured.title_en)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-course-muted-foreground">
                    <PlayCircle size={56} strokeWidth={1} />
                    {editing && (
                      <span className="font-body text-xs">{t('editor.featuredEmpty')}</span>
                    )}
                  </div>
                )}
              </div>
            )}
            {editing && (
              <button
                type="button"
                onClick={() => setFeaturedOpen(true)}
                title={t('editor.editFeatured')}
                aria-label={t('editor.editFeatured')}
                className="absolute right-3 top-3 z-20 rounded-full bg-course-primary p-2 text-course-primary-foreground shadow-lg hover:bg-course-primary/90"
              >
                <Pencil size={15} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 py-12">
        <CourseRow
          title={t('course.rowStartHere')}
          editing={editing}
          actions={
            <Link to="/curso/admin">
              <Button
                size="sm"
                variant="outline"
                className="border-course-border bg-course-card text-course-foreground"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> {t('editor.addCourse')}
              </Button>
            </Link>
          }
        >
          {isLoading ? (
            <CardSkeletons />
          ) : courses?.length ? (
            courses.map((c, i) => (
              <CourseCard
                key={`${c.id}-${lang}`}
                to={`/curso/${c.slug}`}
                title={pick(c.title_pt, c.title_en)}
                subtitle={pick(c.description_pt, c.description_en)}
                coverUrl={c.cover_url}
                editing={editing}
                editHref={`/curso/admin/${c.id}`}
                onMoveLeft={i > 0 ? () => move(i, -1) : undefined}
                onMoveRight={i < courses.length - 1 ? () => move(i, 1) : undefined}
                onEditThumb={
                  editing
                    ? () => setThumbTarget({ kind: 'course', id: c.id, url: c.cover_url })
                    : undefined
                }
              />
            ))
          ) : (
            <p className="font-body text-course-muted-foreground">{t('course.emptyCatalog')}</p>
          )}
        </CourseRow>

        <CourseRow title={t('course.rowFree')} editing={editing}>
          {loadingFree ? (
            <CardSkeletons />
          ) : freeLessons?.length ? (
            freeLessons.map((l) => {
              const courseId = l.modules?.courses?.id;
              const video = l.videos;
              return (
                <CourseCard
                  key={`${l.id}-${lang}`}
                  to={`/curso/${l.modules?.courses?.slug ?? ''}/${l.slug}`}
                  title={pick(l.title_pt, l.title_en)}
                  subtitle={pick(l.description_pt, l.description_en)}
                  coverUrl={video?.thumb_url}
                  isFree={l.is_free}
                  meta={formatDuration(video?.duration_seconds)}
                  editing={editing}
                  editHref={courseId ? `/curso/admin/${courseId}/aula/${l.id}` : undefined}
                  onToggleFree={() => toggleLessonFree.mutate({ id: l.id, isFree: !l.is_free })}
                  onEditThumb={
                    editing && video?.id
                      ? () =>
                          setThumbTarget({
                            kind: 'video',
                            id: video.id,
                            url: video.thumb_url ?? null,
                          })
                      : undefined
                  }
                />
              );
            })
          ) : (
            <p className="font-body text-course-muted-foreground">{t('course.emptyFree')}</p>
          )}
        </CourseRow>
      </div>

      <EditModeBar />
      <FeaturedEditorDialog open={featuredOpen} onOpenChange={setFeaturedOpen} courseId={featured?.id} />
      <ThumbEditorDialog
        open={!!thumbTarget}
        onOpenChange={(v) => !v && setThumbTarget(null)}
        url={thumbTarget?.url}
        onSave={saveThumb}
        ignoreSetup={thumbTarget?.kind === 'course'}
        title={thumbTarget?.kind === 'course' ? t('editor.coverTitle') : undefined}
      />
    </CourseShell>
  );
};

export default CourseIndex;
