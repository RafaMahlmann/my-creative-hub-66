import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, GripVertical, Plus, Trash2, Pencil, Eye } from 'lucide-react';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminCourseTree, useAdminMutations, AdminLesson, AdminModule } from '@/hooks/useAdminCourses';
import { toast } from 'sonner';

const Row = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="flex items-center gap-3 border-b border-course-border/60 px-4 py-3 last:border-b-0"
    >
      <button
        type="button"
        className="cursor-grab text-course-muted-foreground"
        aria-label="drag"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      {children}
    </div>
  );
};

const Inner = () => {
  const { courseId } = useParams();
  const { t } = useTranslation();
  const { data, isLoading } = useAdminCourseTree(courseId);
  const m = useAdminMutations(courseId);
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonTitles, setLessonTitles] = useState<Record<string, string>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  if (isLoading) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-4xl space-y-4 px-6 py-12">
          <Skeleton className="h-10 w-1/2 bg-course-secondary" />
          <Skeleton className="h-64 w-full bg-course-secondary" />
        </div>
      </CourseShell>
    );
  }

  if (!data) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-xl px-6 py-24 text-center font-display text-2xl">
          {t('course.notFound')}
        </div>
      </CourseShell>
    );
  }

  const { course, modules, lessons } = data;

  const onModuleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = modules.findIndex((x) => x.id === active.id);
    const newIndex = modules.findIndex((x) => x.id === over.id);
    const next = arrayMove(modules, oldIndex, newIndex);
    m.reorderModules.mutate(next.map((x, i) => ({ id: x.id, position: i + 1 })));
  };

  const onLessonDragEnd = (moduleId: string) => (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const list = lessons.filter((l) => l.module_id === moduleId);
    const oldIndex = list.findIndex((x) => x.id === active.id);
    const newIndex = list.findIndex((x) => x.id === over.id);
    const next = arrayMove(list, oldIndex, newIndex);
    m.reorderLessons.mutate(next.map((x, i) => ({ id: x.id, position: i + 1 })));
  };

  return (
    <CourseShell>
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        <Link
          to="/curso/admin"
          className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t('admin.backToPanel')}
        </Link>

        <section className="space-y-4 rounded-xl border border-course-border bg-course-card p-5">
          <h1 className="font-display text-2xl font-semibold">{t('admin.courseData')}</h1>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldText
              label={t('admin.titlePt')}
              value={course.title_pt}
              onSave={(v) => m.updateCourse.mutate({ id: course.id, title_pt: v })}
            />
            <FieldText
              label={t('admin.titleEn')}
              value={course.title_en ?? ''}
              onSave={(v) => m.updateCourse.mutate({ id: course.id, title_en: v })}
            />
            <FieldArea
              label={t('admin.descPt')}
              value={course.description_pt ?? ''}
              onSave={(v) => m.updateCourse.mutate({ id: course.id, description_pt: v })}
            />
            <FieldArea
              label={t('admin.descEn')}
              value={course.description_en ?? ''}
              onSave={(v) => m.updateCourse.mutate({ id: course.id, description_en: v })}
            />
            <FieldText
              label={t('admin.coverUrl')}
              value={course.cover_url ?? ''}
              onSave={(v) => m.updateCourse.mutate({ id: course.id, cover_url: v || null })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 font-body text-sm">
              <Switch
                checked={course.is_published}
                onCheckedChange={(v) => m.updateCourse.mutate({ id: course.id, is_published: v })}
              />
              {course.is_published ? t('admin.published') : t('admin.draft')}
            </label>
            <label className="flex items-center gap-2 font-body text-sm">
              <Switch
                checked={course.is_featured}
                onCheckedChange={(v) => m.updateCourse.mutate({ id: course.id, is_featured: v })}
              />
              {t('admin.featured')}
            </label>
            <Link to={`/curso/${course.slug}`} className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="border-course-border bg-course-background text-course-foreground hover:bg-course-accent hover:text-course-accent-foreground"
              >
                <Eye className="mr-2 h-3.5 w-3.5" /> {t('admin.preview')}
              </Button>
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder={t('admin.newModulePlaceholder')}
              className="border-course-border bg-course-card text-course-foreground"
            />
            <Button
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
              onClick={() => {
                if (!moduleTitle.trim()) return;
                m.createModule.mutate(
                  { title: moduleTitle.trim(), position: modules.length + 1 },
                  { onSuccess: () => setModuleTitle('') }
                );
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> {t('admin.addModule')}
            </Button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onModuleDragEnd}>
            <SortableContext items={modules.map((x) => x.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {modules.map((mod: AdminModule) => {
                  const modLessons = lessons.filter((l) => l.module_id === mod.id);
                  return (
                    <div key={mod.id} className="overflow-hidden rounded-xl border border-course-border bg-course-card">
                      <SortableContext items={[mod.id]} strategy={verticalListSortingStrategy}>
                        <Row id={mod.id}>
                          <Input
                            defaultValue={mod.title_pt}
                            onBlur={(e) =>
                              e.target.value !== mod.title_pt &&
                              m.updateModule.mutate({ id: mod.id, title_pt: e.target.value })
                            }
                            className="h-9 flex-1 border-course-border bg-course-background font-medium text-course-foreground"
                          />
                          <Input
                            defaultValue={mod.title_en ?? ''}
                            placeholder={t('admin.titleEn')}
                            onBlur={(e) =>
                              e.target.value !== (mod.title_en ?? '') &&
                              m.updateModule.mutate({ id: mod.id, title_en: e.target.value })
                            }
                            className="hidden h-9 flex-1 border-course-border bg-course-background text-course-foreground sm:block"
                          />
                          <Switch
                            checked={mod.is_published}
                            onCheckedChange={(v) => m.updateModule.mutate({ id: mod.id, is_published: v })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-course-muted-foreground hover:text-destructive"
                            onClick={() => confirm(t('admin.confirmDelete')) && m.deleteModule.mutate(mod.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Row>
                      </SortableContext>

                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onLessonDragEnd(mod.id)}>
                        <SortableContext items={modLessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                          <div className="bg-course-background/40">
                            {modLessons.map((l: AdminLesson) => (
                              <Row key={l.id} id={l.id}>
                                <span className="min-w-0 flex-1 truncate font-body text-sm">{l.title_pt}</span>
                                <span className="hidden font-body text-xs text-course-muted-foreground sm:block">
                                  {l.is_free ? t('course.free') : t('course.paid')}
                                </span>
                                <Switch
                                  checked={l.is_published}
                                  onCheckedChange={(v) => m.updateLesson.mutate({ id: l.id, is_published: v })}
                                />
                                <Link to={`/curso/admin/${course.id}/aula/${l.id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-course-border bg-course-card text-course-foreground hover:bg-course-accent hover:text-course-accent-foreground"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-course-muted-foreground hover:text-destructive"
                                  onClick={() => confirm(t('admin.confirmDelete')) && m.deleteLesson.mutate(l.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </Row>
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>

                      <div className="flex gap-2 border-t border-course-border/60 p-3">
                        <Input
                          value={lessonTitles[mod.id] ?? ''}
                          onChange={(e) => setLessonTitles((s) => ({ ...s, [mod.id]: e.target.value }))}
                          placeholder={t('admin.newLessonPlaceholder')}
                          className="h-9 border-course-border bg-course-background text-course-foreground"
                        />
                        <Button
                          size="sm"
                          className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
                          onClick={() => {
                            const v = (lessonTitles[mod.id] ?? '').trim();
                            if (!v) return;
                            m.createLesson.mutate(
                              { moduleId: mod.id, title: v, position: modLessons.length + 1 },
                              { onSuccess: () => setLessonTitles((s) => ({ ...s, [mod.id]: '' })) }
                            );
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      </div>
    </CourseShell>
  );
};

const FieldText = ({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) => (
  <label className="space-y-1">
    <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">{label}</span>
    <Input
      defaultValue={value}
      onBlur={(e) => {
        if (e.target.value !== value) {
          onSave(e.target.value);
          toast.success('OK');
        }
      }}
      className="border-course-border bg-course-background text-course-foreground"
    />
  </label>
);

const FieldArea = ({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) => (
  <label className="space-y-1">
    <span className="font-body text-xs uppercase tracking-wide text-course-muted-foreground">{label}</span>
    <Textarea
      defaultValue={value}
      rows={3}
      onBlur={(e) => e.target.value !== value && onSave(e.target.value)}
      className="border-course-border bg-course-background text-course-foreground"
    />
  </label>
);

const CourseEditor = () => (
  <AdminGuard>
    <Inner />
  </AdminGuard>
);

export default CourseEditor;
