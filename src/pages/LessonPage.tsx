import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, LockOpen, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CourseShell } from '@/components/course/CourseShell';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import { TranscriptPanel } from '@/components/course/TranscriptPanel';
import { TutorPanel } from '@/components/course/TutorPanel';
import { MaterialLink } from '@/components/course/MaterialLink';
import { useLesson } from '@/hooks/useLesson';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useEnrollment, useLessonProgress, useLessonsProgress } from '@/hooks/useEnrollment';
import { pick, formatDuration } from '@/lib/course';

/** Fração assistida a partir da qual a aula conta como concluída sozinha. */
const AUTO_COMPLETE_RATIO = 0.9;
/** Intervalo mínimo, em segundos assistidos, entre gravações do tempo. */
const SAVE_EVERY_SECONDS = 15;

const LessonPage = () => {
  const { courseSlug, lessonSlug } = useParams();
  const { t } = useTranslation();
  const { data, isLoading } = useLesson(courseSlug, lessonSlug);
  const { isAuthenticated } = useStudentAuth();
  const { hasPremiumAccess } = useEnrollment(data?.course?.id);
  const { progress, save } = useLessonProgress(data?.lesson?.id);
  const { data: sidebarProgress } = useLessonsProgress((data?.ordered ?? []).map((l) => l.id));

  const lessonId = data?.lesson?.id;
  const canWatch = !!data?.lesson?.is_free || hasPremiumAccess;
  const lastSavedSecondRef = useRef(0);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (lessonId && isAuthenticated && canWatch) save.mutate({});
    lastSavedSecondRef.current = 0;
    setEnded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, isAuthenticated, canWatch]);

  const handleProgressSeconds = (seconds: number) => {
    if (!lessonId || !isAuthenticated) return;
    const rounded = Math.floor(seconds);
    if (rounded <= lastSavedSecondRef.current) return;
    const duration = data?.lesson?.videos?.duration_seconds ?? 0;
    const crossedAutoComplete = duration > 0 && seconds >= duration * AUTO_COMPLETE_RATIO && !progress?.is_completed;
    if (!crossedAutoComplete && rounded - lastSavedSecondRef.current < SAVE_EVERY_SECONDS) return;
    lastSavedSecondRef.current = rounded;
    save.mutate({ seconds_watched: rounded, ...(crossedAutoComplete ? { is_completed: true } : {}) });
  };


  if (isLoading) {
    return (
      <CourseShell>
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
          <Skeleton className="aspect-video w-full rounded-xl bg-course-secondary" />
          <Skeleton className="h-96 w-full rounded-xl bg-course-secondary" />
        </div>
      </CourseShell>
    );
  }

  if (!data) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-2xl space-y-6 px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">{t('lesson.notFound')}</h1>
          <Link to={courseSlug ? `/curso/${courseSlug}` : '/curso'}>
            <Button
              variant="outline"
              className="border-course-border bg-course-card text-course-foreground hover:bg-course-accent hover:text-course-accent-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('course.backToCatalog')}
            </Button>
          </Link>
        </div>
      </CourseShell>
    );
  }

  const { course, lesson, materials, ordered, prev, next } = data;
  const locked = !canWatch;
  const content = pick(lesson.content_pt, lesson.content_en);

  return (
    <CourseShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Link
            to={`/curso/${course.slug}`}
            className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {pick(course.title_pt, course.title_en)}
          </Link>

          <VideoPlayer
            key={lessonId}
            video={lesson.videos}
            locked={locked}
            onProgressSeconds={handleProgressSeconds}
            startAt={progress?.seconds_watched}
            onEnded={() => setEnded(true)}
          />

          {locked && (
            <div className="rounded-xl border border-course-border bg-course-card p-5">
              <p className="font-body text-sm text-course-muted-foreground">
                {isAuthenticated ? t('access.needEnrollment') : t('access.needSignIn')}
              </p>
              {!isAuthenticated && (
                <Link to={`/curso/entrar?next=/curso/${course.slug}/${lesson.slug}`}>
                  <Button className="mt-4 bg-course-primary text-course-primary-foreground hover:bg-course-primary/90">
                    {t('auth.signIn')}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {!locked && isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => save.mutate({ is_completed: !progress?.is_completed })}
              className="border-course-border bg-course-card text-course-foreground hover:bg-course-secondary"
            >
              <CheckCircle2
                className={`mr-2 h-4 w-4 ${progress?.is_completed ? 'text-course-primary' : ''}`}
              />
              {progress?.is_completed ? t('access.completed') : t('access.markCompleted')}
            </Button>
          )}

          {!locked && ended && next && (
            <Link
              to={`/curso/${course.slug}/${next.slug}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-course-primary bg-course-primary/10 p-5 transition-colors hover:bg-course-primary/15"
            >
              <div className="min-w-0">
                <p className="font-body text-xs uppercase tracking-widest text-course-primary">
                  {t('lesson.upNext')}
                </p>
                <p className="mt-1 truncate font-display text-lg font-semibold">
                  {pick(next.title_pt, next.title_en)}
                </p>
                {formatDuration(next.videos?.duration_seconds) && (
                  <p className="font-body text-xs text-course-muted-foreground">
                    {formatDuration(next.videos?.duration_seconds)}
                  </p>
                )}
              </div>
              <PlayCircle className="h-9 w-9 shrink-0 text-course-primary" />
            </Link>
          )}


          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold">
                {pick(lesson.title_pt, lesson.title_en)}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-body text-[11px] font-semibold ${
                  lesson.is_free
                    ? 'bg-course-primary text-course-primary-foreground'
                    : 'bg-course-accent text-course-accent-foreground'
                }`}
              >
                {lesson.is_free ? <LockOpen size={11} /> : <Lock size={11} />}
                {lesson.is_free ? t('course.free') : t('course.paid')}
              </span>
              {formatDuration(lesson.videos?.duration_seconds) && (
                <span className="font-body text-xs text-course-muted-foreground">
                  {formatDuration(lesson.videos?.duration_seconds)}
                </span>
              )}
            </div>
            {pick(lesson.description_pt, lesson.description_en) && (
              <p className="font-body text-course-muted-foreground">
                {pick(lesson.description_pt, lesson.description_en)}
              </p>
            )}
          </div>

          {content && (
            <section className="rounded-xl border border-course-border bg-course-card p-5">
              <h2 className="mb-2 font-display text-xl font-semibold">{t('lesson.about')}</h2>
              <p className="whitespace-pre-line font-body text-sm leading-relaxed text-course-muted-foreground">
                {content}
              </p>
            </section>
          )}

          {!locked && <TranscriptPanel videoId={lesson.videos?.id} />}

          {!locked && (
            <TutorPanel
              moduleId={lesson.module_id}
              signInHref={`/curso/entrar?next=/curso/${course.slug}/${lesson.slug}`}
            />
          )}

          <section className="rounded-xl border border-course-border bg-course-card p-5">
            <h2 className="mb-3 font-display text-xl font-semibold">{t('lesson.materials')}</h2>
            {materials.length === 0 ? (
              <p className="font-body text-sm text-course-muted-foreground">
                {t('lesson.noMaterials')}
              </p>
            ) : (
              <ul className="space-y-2">
                {materials.map((m) => (
                  <li key={m.id}>
                    <MaterialLink material={m} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <nav className="flex items-center justify-between gap-3">
            {prev ? (
              <Link to={`/curso/${course.slug}/${prev.slug}`} className="min-w-0">
                <Button
                  variant="outline"
                  className="max-w-full border-course-border bg-course-card text-course-foreground hover:bg-course-accent hover:text-course-accent-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{t('lesson.previous')}</span>
                </Button>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/curso/${course.slug}/${next.slug}`} className="min-w-0">
                <Button className="max-w-full bg-course-primary text-course-primary-foreground hover:bg-course-primary/90">
                  <span className="truncate">
                    {t('lesson.next')}
                    {formatDuration(next.videos?.duration_seconds) && ` · ${formatDuration(next.videos?.duration_seconds)}`}
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Button>
              </Link>
            )}
          </nav>
        </div>

        <aside className="h-fit overflow-hidden rounded-xl border border-course-border bg-course-card lg:sticky lg:top-24">
          <header className="border-b border-course-border/70 px-4 py-3">
            <p className="font-body text-xs uppercase tracking-widest text-course-muted-foreground">
              {t('lesson.playlist')}
            </p>
            <p className="font-display text-lg font-semibold">
              {pick(course.title_pt, course.title_en)}
            </p>
          </header>
          <ul className="max-h-[60vh] divide-y divide-course-border/60 overflow-y-auto">
            {ordered.map((l, i) => {
              const active = l.slug === lesson.slug;
              const done = !!sidebarProgress?.[l.id]?.is_completed;
              return (
                <li key={l.id}>
                  <Link
                    to={`/curso/${course.slug}/${l.slug}`}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      active ? 'bg-course-secondary' : 'hover:bg-course-secondary/60'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={14} className="shrink-0 text-course-primary" />
                    ) : (
                      <span className="font-body text-xs tabular-nums text-course-muted-foreground">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate font-body text-sm">
                      {pick(l.title_pt, l.title_en)}
                    </span>
                    {l.is_free ? (
                      <LockOpen size={13} className="shrink-0 text-course-primary" />
                    ) : (
                      <Lock size={13} className="shrink-0 text-course-muted-foreground" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </CourseShell>
  );
};

export default LessonPage;
