import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck, ShieldAlert, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/course/AdminGuard';
import { HelpCard, HelpModeToggle } from '@/components/course/HelpCard';
import { CourseShell } from '@/components/course/CourseShell';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminCourses } from '@/hooks/useAdminCourses';
import { useGrantEnrollment } from '@/hooks/useAdminStudents';
import { useAdminStudentsOverview, type AlunoResumo } from '@/hooks/useStudentDossier';
import { pick, formatDuration } from '@/lib/course';
import { normalizeName } from '@/lib/consent';

/** Barra fina de progresso — o mesmo desenho da página do curso. */
const Barra = ({ ratio }: { ratio: number }) => (
  <div className="h-1 w-full overflow-hidden rounded-full bg-course-secondary">
    <div
      className="h-full rounded-full bg-course-primary transition-[width]"
      style={{ width: `${Math.round(ratio * 100)}%` }}
    />
  </div>
);

const LinhaAluno = ({
  aluno,
  courseId,
  ocupado,
  aoAlternar,
}: {
  aluno: AlunoResumo;
  courseId: string;
  ocupado: boolean;
  aoAlternar: (userId: string, próximo: boolean) => void;
}) => {
  const { t } = useTranslation();
  const ratio = aluno.totalAulas ? aluno.concluidas / aluno.totalAulas : 0;

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          to={`/curso/admin/alunos/${aluno.userId}`}
          className="min-w-[12rem] flex-1 transition-colors hover:text-course-primary"
        >
          <span className="block truncate font-body text-sm text-course-foreground">
            {aluno.nome || t('students.unnamed')}
          </span>
          <span className="block truncate font-body text-xs text-course-muted-foreground">
            {aluno.email ?? t('students.abrirFicha')}
          </span>
        </Link>

        {/* O estado do aceite é o que decide se existe documento a apresentar —
            por isso vem antes do progresso, e não escondido numa segunda lista. */}
        {aluno.aceiteEm ? (
          <span
            className="inline-flex shrink-0 items-center gap-1.5 font-body text-xs text-course-primary"
            title={`${new Date(aluno.aceiteEm).toLocaleString('pt-BR')} · v${aluno.versaoAceita}`}
          >
            <ShieldCheck size={13} />
            {t('students.aceiteEm', { data: new Date(aluno.aceiteEm).toLocaleDateString('pt-BR') })}
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 font-body text-xs text-course-muted-foreground">
            <ShieldAlert size={13} /> {t('students.semAceite')}
          </span>
        )}

        <span className="w-28 shrink-0 text-right font-body text-xs text-course-muted-foreground">
          {aluno.totalAulas > 0
            ? `${Math.round(ratio * 100)}% · ${aluno.concluidas}/${aluno.totalAulas}`
            : '—'}
        </span>

        <Switch
          checked={aluno.temAcesso}
          disabled={!courseId || ocupado}
          onCheckedChange={(v) => aoAlternar(aluno.userId, v)}
          aria-label={t('students.hasAccess')}
        />
      </div>

      {aluno.totalAulas > 0 && (
        <div className="mt-2 flex items-center gap-3">
          <div className="max-w-md flex-1">
            <Barra ratio={ratio} />
          </div>
          {aluno.segundosEstudados > 0 && (
            <span className="font-body text-[11px] text-course-muted-foreground">
              {formatDuration(aluno.segundosEstudados)}
            </span>
          )}
          {aluno.matriculadoEm && (
            <span className="font-body text-[11px] text-course-muted-foreground">
              {t('students.entrouEm', {
                data: new Date(aluno.matriculadoEm).toLocaleDateString('pt-BR'),
              })}
            </span>
          )}
        </div>
      )}
    </li>
  );
};

const StudentsInner = () => {
  const { t } = useTranslation();
  const { data: courses, isLoading: loadingCourses } = useAdminCourses();
  const [courseId, setCourseId] = useState<string>('');
  const [busca, setBusca] = useState('');
  const { data: alunos, isLoading } = useAdminStudentsOverview(courseId || undefined);
  const grant = useGrantEnrollment();

  useEffect(() => {
    if (!courseId && courses?.length) setCourseId(courses[0].id);
  }, [courses, courseId]);

  // Busca sem acento e sem caixa: quem procura "Joao" tem que achar "João".
  const filtrados = useMemo(() => {
    const q = normalizeName(busca);
    if (!q) return alunos ?? [];
    return (alunos ?? []).filter((a) =>
      [a.nome, a.email ?? ''].some((campo) => normalizeName(campo).includes(q)),
    );
  }, [alunos, busca]);

  const alternar = async (userId: string, próximo: boolean) => {
    try {
      await grant.mutateAsync({ userId, courseId, grant: próximo });
      toast.success(próximo ? t('students.granted') : t('students.revoked'));
    } catch {
      toast.error(t('students.error'));
    }
  };

  const comAceite = (alunos ?? []).filter((a) => a.aceiteEm).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-12">
      <div className="space-y-3">
        <Link
          to="/curso/admin"
          className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t('admin.backToDashboard')}
        </Link>
        <h1 className="flex items-center gap-3 font-display text-4xl font-semibold text-course-foreground">
          <Users className="h-8 w-8 text-course-primary" />
          {t('students.title')}
        </h1>
        <p className="font-body text-course-muted-foreground">{t('students.subtitle')}</p>
        <HelpModeToggle />
      </div>

      <HelpCard id="students" />

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[14rem] flex-1">
          {loadingCourses ? (
            <Skeleton className="h-10 w-full bg-course-secondary" />
          ) : (
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="border-course-border bg-course-card text-course-foreground">
                <SelectValue placeholder={t('students.selectCourse')} />
              </SelectTrigger>
              <SelectContent>
                {(courses ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {pick(c.title_pt, c.title_en)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="relative min-w-[14rem] flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-course-muted-foreground"
          />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={t('students.buscar')}
            autoComplete="off"
            className="border-course-border bg-course-background pl-8 text-course-foreground"
          />
        </div>
      </div>

      {!isLoading && (alunos ?? []).length > 0 && (
        <p className="font-body text-sm text-course-muted-foreground">
          {t('students.resumo', { count: (alunos ?? []).length, comAceite })}
        </p>
      )}

      {isLoading ? (
        <Skeleton className="h-48 w-full bg-course-secondary" />
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-course-border p-10 text-center font-body text-course-muted-foreground">
          {busca ? t('students.semResultado') : t('students.empty')}
        </div>
      ) : (
        <ul className="divide-y divide-course-border/60 overflow-hidden rounded-2xl border border-course-border bg-course-card">
          {filtrados.map((a) => (
            <LinhaAluno
              key={a.userId}
              aluno={a}
              courseId={courseId}
              ocupado={grant.isPending}
              aoAlternar={alternar}
            />
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
