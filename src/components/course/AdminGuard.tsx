import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { CourseShell } from '@/components/course/CourseShell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading, devAdmin } = useAdminAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-5xl space-y-4 px-6 py-16">
          <Skeleton className="h-10 w-1/3 bg-course-secondary" />
          <Skeleton className="h-48 w-full bg-course-secondary" />
        </div>
      </CourseShell>
    );
  }

  if (!isAdmin) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-xl space-y-5 px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">{t('admin.restricted')}</h1>
          <p className="font-body text-course-muted-foreground">{t('admin.restrictedHint')}</p>
          <Link to="/">
            <Button className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90">
              {t('course.backToHome')}
            </Button>
          </Link>
        </div>
      </CourseShell>
    );
  }

  return (
    <>
      {devAdmin && (
        <p className="bg-amber-500 px-4 py-1.5 text-center font-body text-xs font-semibold text-black">
          {t('admin.devUiBanner')}
        </p>
      )}
      {children}
    </>
  );
};
