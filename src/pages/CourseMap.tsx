import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReactFlow, Background, Controls, type Node, type Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, CheckCircle2, Circle, Lock as LockIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseShell } from '@/components/course/CourseShell';
import { useCourseDetail } from '@/hooks/useCourses';
import { useLessonsProgress } from '@/hooks/useEnrollment';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { pick } from '@/lib/course';

const COL_WIDTH = 220;
const ROW_HEIGHT = 130;
const NODE_WIDTH = 180;

type LessonStatus = 'done' | 'current' | 'upcoming';

/** Nó do mapa — não usa NodeTypes customizado do xyflow; estiliza via `data` e classe própria. */
const statusStyle: Record<LessonStatus, string> = {
  done: 'border-course-primary bg-course-primary/15 text-course-foreground',
  current: 'border-course-primary bg-course-card text-course-foreground shadow-[0_0_0_3px_hsl(var(--course-primary)/0.25)]',
  upcoming: 'border-course-border bg-course-card text-course-muted-foreground',
};

const CourseMap = () => {
  const { courseSlug } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useStudentAuth();
  const { data, isLoading } = useCourseDetail(courseSlug);

  const ordered = useMemo(() => (data?.modules ?? []).flatMap((m) => m.lessons), [data]);
  const lessonIds = useMemo(() => ordered.map((l) => l.id), [ordered]);
  const { data: progressMap } = useLessonsProgress(lessonIds);

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [] as Node[], edges: [] as Edge[] };

    // "nasce da estrutura do curso": a trilha segue a ordem real de módulos e
    // aulas — não é um desenho arrumado à mão que desatualiza na próxima aula
    // que o Rafa mover.
    let firstUndone: string | null = null;
    for (const l of ordered) {
      if (!progressMap?.[l.id]?.is_completed) {
        firstUndone = l.id;
        break;
      }
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let prevId: string | null = null;

    data.modules.forEach((m, mIdx) => {
      m.lessons.forEach((l, lIdx) => {
        const done = !!progressMap?.[l.id]?.is_completed;
        const status: LessonStatus = done ? 'done' : l.id === firstUndone ? 'current' : 'upcoming';

        nodes.push({
          id: l.id,
          position: { x: lIdx * COL_WIDTH, y: mIdx * ROW_HEIGHT },
          data: { label: pick(l.title_pt, l.title_en), status },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          style: { width: NODE_WIDTH },
          className: `rounded-xl border-2 px-3 py-2 font-body text-sm cursor-pointer ${statusStyle[status]}`,
        });

        if (prevId) {
          edges.push({
            id: `${prevId}->${l.id}`,
            source: prevId,
            target: l.id,
            animated: true,
            style: { stroke: 'hsl(var(--course-primary) / 0.6)' },
          });
        }
        prevId = l.id;
      });
    });

    return { nodes, edges };
  }, [data, ordered, progressMap]);

  if (isLoading) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-5xl space-y-6 px-6 py-16">
          <Skeleton className="h-10 w-2/3 bg-course-secondary" />
          <Skeleton className="h-[60vh] w-full bg-course-secondary" />
        </div>
      </CourseShell>
    );
  }

  if (!data) {
    return (
      <CourseShell>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">{t('course.notFound')}</h1>
        </div>
      </CourseShell>
    );
  }

  return (
    <CourseShell>
      <div className="mx-auto max-w-6xl space-y-4 px-6 py-8">
        <Link
          to={`/curso/${courseSlug}`}
          className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {pick(data.course.title_pt, data.course.title_en)}
        </Link>
        <h1 className="font-display text-3xl font-semibold">{t('map.title')}</h1>

        {!isAuthenticated && (
          <p className="font-body text-sm text-course-muted-foreground">{t('map.signInHint')}</p>
        )}

        <div className="flex flex-wrap gap-4 font-body text-xs text-course-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-course-primary" /> {t('map.legendDone')}
          </span>
          <span className="flex items-center gap-1.5">
            <Circle size={13} className="text-course-primary" /> {t('map.legendCurrent')}
          </span>
          <span className="flex items-center gap-1.5">
            <LockIcon size={13} /> {t('map.legendUpcoming')}
          </span>
        </div>

        <div className="h-[65vh] w-full overflow-hidden rounded-xl border border-course-border bg-course-card">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
            onNodeClick={(_, node) => {
              const lesson = ordered.find((l) => l.id === node.id);
              if (lesson) navigate(`/curso/${courseSlug}/${lesson.slug}`);
            }}
          >
            <Background gap={24} color="hsl(var(--course-border))" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>
    </CourseShell>
  );
};

export default CourseMap;
