import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PlayCircle, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseShell } from '@/components/course/CourseShell';
import { CourseRow } from '@/components/course/CourseRow';
import { CourseCard } from '@/components/course/CourseCard';
import { useCourses, useFreeLessons } from '@/hooks/useCourses';
import { pick, formatDuration } from '@/lib/course';

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

  const featured = courses?.find((c) => c.is_featured) ?? courses?.[0];
  const lang = i18n.language;

  return (
    <CourseShell>
      {/* Hero spotlight */}
      <section className="relative overflow-hidden border-b border-course-border/60">
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
              </>
            )}
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-course-border bg-course-card shadow-2xl">
            {featured?.cover_url ? (
              <img
                src={featured.cover_url}
                alt={pick(featured.title_pt, featured.title_en)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-course-muted-foreground">
                <PlayCircle size={56} strokeWidth={1} />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 py-12">
        <CourseRow title={t('course.rowStartHere')}>
          {isLoading ? (
            <CardSkeletons />
          ) : courses?.length ? (
            courses.map((c) => (
              <CourseCard
                key={`${c.id}-${lang}`}
                to={`/curso/${c.slug}`}
                title={pick(c.title_pt, c.title_en)}
                subtitle={pick(c.description_pt, c.description_en)}
                coverUrl={c.cover_url}
              />
            ))
          ) : (
            <p className="font-body text-course-muted-foreground">{t('course.emptyCatalog')}</p>
          )}
        </CourseRow>

        <CourseRow title={t('course.rowFree')}>
          {loadingFree ? (
            <CardSkeletons />
          ) : freeLessons?.length ? (
            freeLessons.map((l) => (
              <CourseCard
                key={`${l.id}-${lang}`}
                to={`/curso/${l.modules?.courses?.slug ?? ''}/${l.slug}`}
                title={pick(l.title_pt, l.title_en)}
                subtitle={pick(l.description_pt, l.description_en)}
                isFree
                meta={formatDuration(l.videos?.duration_seconds)}
              />
            ))
          ) : (
            <p className="font-body text-course-muted-foreground">{t('course.emptyFree')}</p>
          )}
        </CourseRow>
      </div>
    </CourseShell>
  );
};

export default CourseIndex;
