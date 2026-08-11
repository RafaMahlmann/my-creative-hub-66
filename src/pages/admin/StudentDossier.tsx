import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Eye, EyeOff, Loader2, ShieldCheck, GraduationCap, Info } from 'lucide-react';
import { toast } from 'sonner';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentDossier } from '@/hooks/useStudentDossier';
import { useStudentConsent } from '@/hooks/useStudentConsent';
import { generateConsentPDF } from '@/lib/generateConsentPDF';
import { maskCPF, fillTermText } from '@/lib/consent';
import { pick, formatDuration } from '@/lib/course';

const Linha = ({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) => (
  <div className="flex flex-wrap gap-x-3 gap-y-0.5 py-1.5">
    <dt className="min-w-[10rem] font-body text-xs uppercase tracking-widest text-course-muted-foreground">
      {rotulo}
    </dt>
    <dd className="min-w-0 flex-1 font-body text-sm text-course-foreground">{valor || '—'}</dd>
  </div>
);

const Barra = ({ ratio }: { ratio: number }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-course-secondary">
    <div
      className="h-full rounded-full bg-course-primary transition-[width]"
      style={{ width: `${Math.round(ratio * 100)}%` }}
    />
  </div>
);

const Inner = () => {
  const { userId } = useParams();
  const { t } = useTranslation();
  const { data, isLoading } = useStudentDossier(userId);
  // O termo e os dados do operador vêm do mesmo hook que o aluno usa: o
  // comprovante precisa reproduzir o texto da versão aceita, não o texto novo.
  const { operator, termText } = useStudentConsent();
  const [cpfVisivel, setCpfVisivel] = useState(false);

  const baixarPDF = () => {
    if (!data?.consent || !operator) return toast.error(t('dossie.semDados'));
    try {
      generateConsentPDF({
        consent: data.consent,
        termText: termText || fillTermText('', operator),
        operator,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'erro');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-6 py-12">
        <Skeleton className="h-10 w-1/2 bg-course-secondary" />
        <Skeleton className="h-64 w-full bg-course-secondary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center font-display text-2xl text-course-foreground">
        {t('dossie.naoEncontrado')}
      </div>
    );
  }

  const c = data.consent;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header className="space-y-3">
        <Link
          to="/curso/admin/alunos"
          className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t('dossie.voltar')}
        </Link>
        <h1 className="font-display text-3xl font-semibold text-course-foreground">
          {c?.full_name || data.displayName || t('students.unnamed')}
        </h1>
        {data.contaCriadaEm && (
          <p className="font-body text-sm text-course-muted-foreground">
            {t('dossie.contaDesde', { data: new Date(data.contaCriadaEm).toLocaleDateString('pt-BR') })}
          </p>
        )}
      </header>

      {/* ── Cadastro ─────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-course-border bg-course-card p-5">
        <h2 className="mb-3 font-display text-xl font-semibold text-course-foreground">
          {t('dossie.cadastro')}
        </h2>
        {!c ? (
          <p className="font-body text-sm text-course-muted-foreground">{t('dossie.semAceite')}</p>
        ) : (
          <dl className="divide-y divide-course-border/40">
            <Linha rotulo={t('consent.fullName')} valor={c.full_name} />
            <Linha
              rotulo={t('consent.cpf')}
              valor={
                <span className="flex items-center gap-2">
                  <span className="font-mono">{cpfVisivel ? c.cpf_typed : maskCPF(c.cpf_typed)}</span>
                  <button
                    type="button"
                    onClick={() => setCpfVisivel((v) => !v)}
                    aria-label={cpfVisivel ? t('dossie.ocultarCpf') : t('dossie.revelarCpf')}
                    className="text-course-muted-foreground transition-colors hover:text-course-foreground"
                  >
                    {cpfVisivel ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </span>
              }
            />
            <Linha rotulo={t('consent.email')} valor={c.email} />
            <Linha rotulo={t('consent.phone')} valor={c.phone} />
            <Linha
              rotulo={t('consent.birthDate')}
              valor={c.birth_date ? new Date(c.birth_date).toLocaleDateString('pt-BR') : null}
            />
            <Linha
              rotulo={t('dossie.endereco')}
              valor={
                [c.street, c.number, c.complement].filter(Boolean).join(', ') +
                (c.neighborhood ? ` — ${c.neighborhood}` : '') +
                (c.city ? `, ${c.city}` : '') +
                (c.state ? `/${c.state}` : '') +
                (c.cep ? ` · CEP ${c.cep}` : '')
              }
            />
          </dl>
        )}
      </section>

      {/* ── Aceite ───────────────────────────────────────────────────────── */}
      {c && (
        <section className="rounded-xl border border-course-border bg-course-card p-5">
          <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-semibold text-course-foreground">
            <ShieldCheck className="h-5 w-5 text-course-primary" />
            {t('dossie.aceite')}
          </h2>
          <dl className="divide-y divide-course-border/40">
            <Linha
              rotulo={t('dossie.dataHora')}
              valor={new Date(c.accepted_at).toLocaleString('pt-BR')}
            />
            <Linha rotulo={t('dossie.versao')} valor={`v${c.term_version}`} />
            <Linha rotulo={t('dossie.ip')} valor={c.ip} />
            <Linha
              rotulo={t('dossie.hash')}
              valor={<span className="break-all font-mono text-[11px]">{c.term_text_hash}</span>}
            />
          </dl>

          {/* O card que explica a validade — mesma substância da página nova do
              PDF, para o Rafa entender antes de enviar a alguém. */}
          <div className="mt-4 rounded-lg border border-course-primary/25 bg-course-primary/5 p-4">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-course-foreground">
              <Info className="h-4 w-4 text-course-primary" />
              {t('dossie.porqueValeTitulo')}
            </h3>
            <ul className="mt-2 space-y-1.5 font-body text-xs leading-relaxed text-course-muted-foreground">
              {(t('dossie.porqueValeItens', { returnObjects: true }) as string[]).map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
            <p className="mt-3 rounded border border-course-border/60 bg-course-card px-3 py-2 font-body text-xs leading-relaxed text-course-muted-foreground">
              {t('dossie.porqueValeLimite')}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={baixarPDF}
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
            >
              <Download className="mr-2 h-4 w-4" /> {t('dossie.baixarComprovante')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(c.term_text_hash);
                toast.success(t('dossie.hashCopiado'));
              }}
              className="border-course-border bg-course-card text-course-foreground hover:bg-course-secondary"
            >
              {t('dossie.copiarHash')}
            </Button>
          </div>
          <p className="mt-3 font-body text-xs leading-relaxed text-course-muted-foreground">
            {t('dossie.comoEnviar')}
          </p>
        </section>
      )}

      {/* ── Jornada ──────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-course-border bg-course-card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-course-foreground">
          <GraduationCap className="h-5 w-5 text-course-primary" />
          {t('dossie.jornada')}
        </h2>
        {data.cursos.length === 0 ? (
          <p className="font-body text-sm text-course-muted-foreground">{t('dossie.semCursos')}</p>
        ) : (
          <ul className="space-y-4">
            {data.cursos.map((curso) => {
              const ratio = curso.totalAulas ? curso.concluidas / curso.totalAulas : 0;
              return (
                <li key={curso.courseId} className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-body text-sm text-course-foreground">
                      {pick(curso.titulo_pt, curso.titulo_en)}
                    </span>
                    <span className="font-body text-sm font-semibold text-course-primary">
                      {Math.round(ratio * 100)}%
                    </span>
                  </div>
                  <Barra ratio={ratio} />
                  <p className="font-body text-xs text-course-muted-foreground">
                    {t('dossie.aulasDe', { feitas: curso.concluidas, total: curso.totalAulas })}
                    {curso.segundosEstudados > 0 &&
                      ` · ${t('course.studyTime', { time: formatDuration(curso.segundosEstudados) })}`}
                    {curso.matriculadoEm &&
                      ` · ${t('dossie.entrouEm', { data: new Date(curso.matriculadoEm).toLocaleDateString('pt-BR') })}`}
                    {curso.concluidoEm &&
                      ` · ${t('dossie.concluiuEm', { data: new Date(curso.concluidoEm).toLocaleDateString('pt-BR') })}`}
                  </p>
                  {!curso.temAcesso && (
                    <p className="font-body text-xs text-course-muted-foreground/70">
                      {t('dossie.semAcessoExclusivo')}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

const StudentDossier = () => (
  <AdminGuard>
    <CourseShell>
      <Inner />
    </CourseShell>
  </AdminGuard>
);

export default StudentDossier;
