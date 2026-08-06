import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import { CourseShell } from '@/components/course/CourseShell';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useMyLessons } from '@/hooks/useEnrollment';
import { pick } from '@/lib/course';

const MyLessons = () => {
  const { t } = useTranslation();
  const { isAuthenticated, loading } = useStudentAuth();
  const { data, isLoading } = useMyLessons();

  if (loading) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-4xl space-y-4 px-6 py-16">
          <Skeleton className="h-10 w-1/3 bg-course-secondary" />
          <Skeleton className="h-40 w-full bg-course-secondary" />
        </div>
      </CourseShell>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/curso/entrar?next=/curso/minhas-aulas" replace />;
  }

  const items = data ?? [];
  const last = items[0];

  return (
    <CourseShell>
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
        <header className="space-y-2">
          <h1 className="font-display text-4xl font-semibold">{t('myLessons.title')}</h1>
          <p className="font-body text-course-muted-foreground">{t('myLessons.subtitle')}</p>
        </header>

        {last && (
          <div className="rounded-2xl border border-course-border bg-course-card p-6">
            <p className="font-body text-xs uppercase tracking-widest text-course-muted-foreground">
              {t('myLessons.continue')}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              {pick(last.lesson.title_pt, last.lesson.title_en)}
            </h2>
            <p className="font-body text-sm text-course-muted-foreground">
              {pick(last.course.title_pt, last.course.title_en)}
            </p>
            <Link to={`/curso/${last.course.slug}/${last.lesson.slug}`}>
              <Button className="mt-4 bg-course-primary text-course-primary-foreground hover:bg-course-primary/90">
                <PlayCircle className="mr-2 h-4 w-4" />
                {t('myLessons.resume')}
              </Button>
            </Link>
          </div>
        )}

        {isLoading ? (
          <Skeleton className="h-40 w-full bg-course-secondary" />
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-course-border p-10 text-center">
            <p className="font-body text-course-muted-foreground">{t('myLessons.empty')}</p>
            <Link to="/curso">
              <Button variant="outline" className="mt-4 border-course-border bg-course-card">
                {t('course.backToCatalog')}
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-course-border/60 overflow-hidden rounded-2xl border border-course-border bg-course-card">
            {items.map((item) => (
              <li key={item.lesson_id}>
                <Link
                  to={`/curso/${item.course.slug}/${item.lesson.slug}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-course-secondary/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-body text-sm">
                      {pick(item.lesson.title_pt, item.lesson.title_en)}
                    </span>
                    <span className="block truncate font-body text-xs text-course-muted-foreground">
                      {pick(item.course.title_pt, item.course.title_en)}
                    </span>
                  </span>
                  {item.is_completed ? (
                    <span className="inline-flex shrink-0 items-center gap-1 font-body text-xs text-course-primary">
                      <CheckCircle2 size={14} /> {t('myLessons.completed')}
                    </span>
                  ) : (
                    <span className="shrink-0 font-body text-xs text-course-muted-foreground">
                      {t('myLessons.inProgress')}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CourseShell>
  );
};

export default MyLessons;
