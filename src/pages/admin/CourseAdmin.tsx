import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Eye, Trash2, BookOpen, PlayCircle, FileText, Film } from 'lucide-react';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminCourses, useAdminMutations } from '@/hooks/useAdminCourses';
import { pick } from '@/lib/course';

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="rounded-xl border border-course-border bg-course-card p-5">
    <div className="mb-2 flex items-center gap-2 text-course-primary">{icon}</div>
    <p className="font-display text-3xl font-semibold">{value}</p>
    <p className="font-body text-sm text-course-muted-foreground">{label}</p>
  </div>
);

const Inner = () => {
  const { t } = useTranslation();
  const { data: courses, isLoading } = useAdminCourses();
  const { createCourse, updateCourse, deleteCourse } = useAdminMutations();
  const [title, setTitle] = useState('');

  const published = courses?.filter((c) => c.is_published).length ?? 0;
  const drafts = (courses?.length ?? 0) - published;

  return (
    <CourseShell>
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="font-body text-xs uppercase tracking-widest text-course-muted-foreground">
              {t('admin.panel')}
            </p>
            <h1 className="font-display text-4xl font-semibold">{t('admin.title')}</h1>
          </div>
          <Link to="/curso/admin/videos">
            <Button variant="outline" className="border-course-border bg-course-card text-course-foreground">
              <Film className="mr-2 h-4 w-4" /> {t('admin.openLibrary')}
            </Button>
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat icon={<BookOpen size={18} />} label={t('admin.statCourses')} value={courses?.length ?? 0} />
          <Stat icon={<PlayCircle size={18} />} label={t('admin.statPublished')} value={published} />
          <Stat icon={<FileText size={18} />} label={t('admin.statDrafts')} value={drafts} />
        </div>

        <section className="rounded-xl border border-course-border bg-course-card p-5">
          <h2 className="mb-3 font-display text-xl font-semibold">{t('admin.newCourse')}</h2>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              createCourse.mutate(title.trim(), { onSuccess: () => setTitle('') });
            }}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('admin.courseTitlePlaceholder')}
              className="border-course-border bg-course-background text-course-foreground"
            />
            <Button
              type="submit"
              disabled={createCourse.isPending}
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> {t('admin.create')}
            </Button>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">{t('admin.courseList')}</h2>
          {isLoading && <Skeleton className="h-32 w-full bg-course-secondary" />}
          {!isLoading && !courses?.length && (
            <p className="font-body text-course-muted-foreground">{t('admin.noCourses')}</p>
          )}
          <ul className="space-y-3">
            {courses?.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-course-border bg-course-card px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body font-medium">{pick(c.title_pt, c.title_en)}</p>
                  <p className="truncate font-body text-xs text-course-muted-foreground">/{c.slug}</p>
                </div>
                <label className="flex items-center gap-2 font-body text-sm text-course-muted-foreground">
                  <Switch
                    checked={c.is_published}
                    onCheckedChange={(v) => updateCourse.mutate({ id: c.id, is_published: v })}
                  />
                  {c.is_published ? t('admin.published') : t('admin.draft')}
                </label>
                <Link to={`/curso/admin/${c.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-course-border bg-course-background text-course-foreground hover:bg-course-accent hover:text-course-accent-foreground"
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" /> {t('admin.edit')}
                  </Button>
                </Link>
                <Link to={`/curso/${c.slug}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-course-border bg-course-background text-course-foreground hover:bg-course-accent hover:text-course-accent-foreground"
                  >
                    <Eye className="mr-2 h-3.5 w-3.5" /> {t('admin.preview')}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-course-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm(t('admin.confirmDelete'))) deleteCourse.mutate(c.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </CourseShell>
  );
};

const CourseAdmin = () => (
  <AdminGuard>
    <Inner />
  </AdminGuard>
);

export default CourseAdmin;
