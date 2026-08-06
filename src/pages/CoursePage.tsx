import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, LockOpen, PlayCircle, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CourseShell } from '@/components/course/CourseShell';
import { useCourseDetail } from '@/hooks/useCourses';
import { pick, formatDuration } from '@/lib/course';

const CoursePage = () => {
  const { courseSlug } = useParams();
  const { t } = useTranslation();
  const { data, isLoading } = useCourseDetail(courseSlug);

  if (isLoading) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-5xl space-y-6 px-6 py-16">
          <Skeleton className="h-10 w-2/3 bg-course-secondary" />
          <Skeleton className="h-4 w-full bg-course-secondary" />
          <Skeleton className="h-64 w-full bg-course-secondary" />
        </div>
      </CourseShell>
    );
  }

  if (!data) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-2xl space-y-6 px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">{t('course.notFound')}</h1>
          <Link to="/curso">
            <Button variant="outline" className="border-course-border bg-course-card text-course-foreground hover:bg-course-accent hover:text-course-accent-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('course.backToCatalog')}
            </Button>
          </Link>
        </div>
      </CourseShell>
    );
  }

  const { course, modules } = data;
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <CourseShell>
      <section className="relative border-b border-course-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--course-primary)/0.15),transparent_65%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="space-y-4">
            <Link
              to="/curso"
              className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {t('course.backToCatalog')}
            </Link>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">
              {pick(course.title_pt, course.title_en)}
            </h1>
            <p className="max-w-xl font-body text-lg text-course-muted-foreground">
              {pick(course.description_pt, course.description_en)}
            </p>
            <p className="font-body text-sm text-course-muted-foreground/80">
              {t('course.moduleCount', { count: modules.length })} · {t('course.lessonCount', { count: totalLessons })}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-course-border bg-course-card">
            {course.cover_url ? (
              <img src={course.cover_url} alt={pick(course.title_pt, course.title_en)} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-course-muted-foreground">
                <PlayCircle size={48} strokeWidth={1} />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
        {modules.length === 0 && (
          <p className="font-body text-course-muted-foreground">{t('course.emptyModules')}</p>
        )}
        {modules.map((m, idx) => (
          <section key={m.id} className="overflow-hidden rounded-xl border border-course-border bg-course-card">
            <header className="border-b border-course-border/70 px-5 py-4">
              <p className="font-body text-xs uppercase tracking-widest text-course-muted-foreground">
                {t('course.moduleLabel', { number: idx + 1 })}
              </p>
              <h2 className="font-display text-2xl font-semibold">{pick(m.title_pt, m.title_en)}</h2>
              {pick(m.description_pt, m.description_en) && (
                <p className="mt-1 font-body text-sm text-course-muted-foreground">
                  {pick(m.description_pt, m.description_en)}
                </p>
              )}
            </header>
            <ul className="divide-y divide-course-border/60">
              {m.lessons.length === 0 && (
                <li className="px-5 py-4 font-body text-sm text-course-muted-foreground">
                  {t('course.emptyLessons')}
                </li>
              )}
              {m.lessons.map((l, li) => (
                <li key={l.id}>
                  <Link
                    to={`/curso/${course.slug}/${l.slug}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-course-secondary/60"
                  >
                  <span className="font-body text-sm tabular-nums text-course-muted-foreground">
                    {String(li + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body font-medium text-course-foreground">
                      {pick(l.title_pt, l.title_en)}
                    </p>
                    {pick(l.description_pt, l.description_en) && (
                      <p className="truncate font-body text-sm text-course-muted-foreground">
                        {pick(l.description_pt, l.description_en)}
                      </p>
                    )}
                  </div>
                  {formatDuration(l.videos?.duration_seconds) && (
                    <span className="hidden font-body text-xs text-course-muted-foreground sm:block">
                      {formatDuration(l.videos?.duration_seconds)}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-body text-[11px] font-semibold ${
                      l.is_free
                        ? 'bg-course-primary text-course-primary-foreground'
                        : 'bg-course-accent text-course-accent-foreground'
                    }`}
                  >
                    {l.is_free ? <LockOpen size={11} /> : <Lock size={11} />}
                    {l.is_free ? t('course.free') : t('course.paid')}
                  </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </CourseShell>
  );
};

export default CoursePage;
