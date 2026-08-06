import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/course/AdminGuard';
import { CourseShell } from '@/components/course/CourseShell';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminCourses } from '@/hooks/useAdminCourses';
import {
  useAdminStudents,
  useAdminEnrollments,
  useGrantEnrollment,
} from '@/hooks/useAdminStudents';
import { pick } from '@/lib/course';

const StudentsInner = () => {
  const { t } = useTranslation();
  const { data: courses, isLoading: loadingCourses } = useAdminCourses();
  const [courseId, setCourseId] = useState<string>('');
  const { data: students, isLoading: loadingStudents } = useAdminStudents();
  const { data: enrollments } = useAdminEnrollments(courseId || undefined);
  const grant = useGrantEnrollment();

  useEffect(() => {
    if (!courseId && courses?.length) setCourseId(courses[0].id);
  }, [courses, courseId]);

  const isGranted = (userId: string) =>
    (enrollments ?? []).some(
      (e: any) => e.user_id === userId && e.is_active && e.source !== 'free'
    );

  const toggle = async (userId: string, next: boolean) => {
    try {
      await grant.mutateAsync({ userId, courseId, grant: next });
      toast.success(next ? t('students.granted') : t('students.revoked'));
    } catch {
      toast.error(t('students.error'));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div className="space-y-3">
        <Link
          to="/curso/admin"
          className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t('admin.backToDashboard')}
        </Link>
        <h1 className="flex items-center gap-3 font-display text-4xl font-semibold">
          <Users className="h-8 w-8 text-course-primary" />
          {t('students.title')}
        </h1>
        <p className="font-body text-course-muted-foreground">{t('students.subtitle')}</p>
      </div>

      <div className="max-w-sm">
        {loadingCourses ? (
          <Skeleton className="h-10 w-full bg-course-secondary" />
        ) : (
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="border-course-border bg-course-card">
              <SelectValue placeholder={t('students.selectCourse')} />
            </SelectTrigger>
            <SelectContent>
              {(courses ?? []).map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {pick(c.title_pt, c.title_en)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {loadingStudents ? (
        <Skeleton className="h-48 w-full bg-course-secondary" />
      ) : (students ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-course-border p-10 text-center font-body text-course-muted-foreground">
          {t('students.empty')}
        </div>
      ) : (
        <ul className="divide-y divide-course-border/60 overflow-hidden rounded-2xl border border-course-border bg-course-card">
          {(students ?? []).map((s) => (
            <li key={s.user_id} className="flex items-center gap-4 px-5 py-4">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-body text-sm">
                  {s.display_name || t('students.unnamed')}
                </span>
                <span className="block truncate font-body text-xs text-course-muted-foreground">
                  {s.user_id.slice(0, 8)}
                </span>
              </span>
              <span className="font-body text-xs text-course-muted-foreground">
                {isGranted(s.user_id) ? t('students.hasAccess') : t('students.freeOnly')}
              </span>
              <Switch
                checked={isGranted(s.user_id)}
                disabled={!courseId || grant.isPending}
                onCheckedChange={(v) => toggle(s.user_id, v)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Students = () => (
  <AdminGuard>
    <CourseShell>
      <StudentsInner />
    </CourseShell>
  </AdminGuard>
);

export default Students;
