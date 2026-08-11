import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, BadgeCheck, Loader2, SearchX, ShieldQuestion } from 'lucide-react';
import { CourseShell } from '@/components/course/CourseShell';
import { Input } from '@/components/ui/input';
import { useVerificarHash } from '@/hooks/useStudentDossier';

/**
 * Conferência aberta de um comprovante de aceite, pelo hash.
 *
 * É pública de propósito: o valor de uma assinatura eletrônica simples vem da
 * cadeia de evidências, e evidência que só o emissor consegue conferir vale
 * pouco. Aqui um terceiro — um órgão, por exemplo — confirma sozinho, sem
 * conta e sem depender de nós.
 *
 * Não revela nome, CPF, e-mail nem IP: quem chega com um hash está conferindo
 * integridade, não colhendo dado pessoal.
 */
const VerificarComprovante = () => {
  const { t } = useTranslation();
  const [hash, setHash] = useState('');
  const limpo = hash.trim().toLowerCase();
  const pareceHash = /^[a-f0-9]{64}$/.test(limpo);
  const { data, isFetching, isError } = useVerificarHash(hash);

  return (
    <CourseShell>
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-12">
        <header className="space-y-2">
          <h1 className="flex items-center gap-2 font-display text-3xl font-semibold text-course-foreground">
            <ShieldQuestion className="h-7 w-7 text-course-primary" />
            {t('verificar.titulo')}
          </h1>
          <p className="font-body text-sm leading-relaxed text-course-muted-foreground">
            {t('verificar.intro')}
          </p>
        </header>

        <div className="space-y-2">
          <label
            htmlFor="hash"
            className="font-body text-xs uppercase tracking-widest text-course-muted-foreground"
          >
            {t('verificar.campo')}
          </label>
          <Input
            id="hash"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="a1b2c3…"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="border-course-border bg-course-background font-mono text-sm text-course-foreground"
          />
          {hash.trim() !== '' && !pareceHash && (
            <p className="font-body text-xs text-course-muted-foreground">
              {t('verificar.formatoInvalido')}
            </p>
          )}
        </div>

        {isFetching && (
          <p className="flex items-center gap-2 font-body text-sm text-course-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('verificar.conferindo')}
          </p>
        )}

        {/* Sem isto a tela fica muda quando a consulta falha, e quem confere
            não distingue "não encontrei" de "não consegui conferir" — que são
            conclusões muito diferentes para quem está validando um documento. */}
        {!isFetching && isError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-course-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('verificar.falhou')}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-course-muted-foreground">
              {t('verificar.falhouNota')}
            </p>
          </div>
        )}

        {!isFetching && !isError && data?.encontrado && (
          <div className="rounded-xl border border-course-primary bg-course-primary/10 p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-course-foreground">
              <BadgeCheck className="h-5 w-5 text-course-primary" />
              {t('verificar.confere')}
            </h2>
            <dl className="mt-3 space-y-1.5 font-body text-sm text-course-foreground">
              <div className="flex flex-wrap gap-2">
                <dt className="text-course-muted-foreground">{t('verificar.aceitoEm')}</dt>
                <dd>{new Date(data.accepted_at).toLocaleString('pt-BR')}</dd>
              </div>
              <div className="flex flex-wrap gap-2">
                <dt className="text-course-muted-foreground">{t('verificar.versao')}</dt>
                <dd>v{data.term_version}</dd>
              </div>
            </dl>
            <p className="mt-3 font-body text-xs leading-relaxed text-course-muted-foreground">
              {t('verificar.confereNota')}
            </p>
          </div>
        )}

        {!isFetching && !isError && data && !data.encontrado && (
          <div className="rounded-xl border border-course-border bg-course-card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-course-foreground">
              <SearchX className="h-5 w-5 text-course-muted-foreground" />
              {t('verificar.naoConfere')}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-course-muted-foreground">
              {t('verificar.naoConfereNota')}
            </p>
          </div>
        )}

        <section className="rounded-xl border border-dashed border-course-border p-5">
          <h2 className="font-display text-sm font-semibold text-course-foreground">
            {t('verificar.comoTitulo')}
          </h2>
          <ol className="mt-2 space-y-1.5 font-body text-xs leading-relaxed text-course-muted-foreground">
            {(t('verificar.comoPassos', { returnObjects: true }) as string[]).map((p, i) => (
              <li key={p}>
                {i + 1}. {p}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </CourseShell>
  );
};

export default VerificarComprovante;
