import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';

export const CourseShell = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useStudentAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();


  return (
    <div className="course-area min-h-screen bg-course-background text-course-foreground">
      <header className="sticky top-0 z-30 border-b border-course-border/60 bg-course-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/curso" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-course-primary/15 text-course-primary">
              <GraduationCap size={18} />
            </span>
            <span className="font-display text-xl font-semibold tracking-wide">
              {t('course.courseArea')}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden items-center gap-1 font-body text-sm text-course-muted-foreground transition-colors hover:text-course-foreground sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('course.backToHome')}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/curso/minhas-aulas"
                  className="font-body text-sm text-course-muted-foreground transition-colors hover:text-course-foreground"
                >
                  {t('myLessons.title')}
                </Link>
                <button
                  type="button"
                  onClick={() => supabase.auth.signOut()}
                  aria-label={t('auth.signOut')}
                  className="flex items-center gap-1 font-body text-sm text-course-muted-foreground transition-colors hover:text-course-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                to="/curso/entrar"
                className="font-body text-sm text-course-muted-foreground transition-colors hover:text-course-foreground"
              >
                {t('auth.signIn')}
              </Link>
            )}
            <LanguageSwitcher />

          </div>
        </div>
      </header>
      <main className="pb-24">{children}</main>
    </div>
  );
};
