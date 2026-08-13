import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ClipboardList, Wallet, Clock, Scale, Tag, Package, Wrench } from 'lucide-react';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { HelpCard, HelpModeToggle } from '@/components/course/HelpCard';

import { DEMANDAS, CATEGORIA_ORDEM, type CategoriaDemanda } from '@/lib/demandas';

const ICONE_CATEGORIA: Record<CategoriaDemanda, React.ReactNode> = {
  juridico: <Scale className="h-4 w-4" />,
  marca: <Tag className="h-4 w-4" />,
  produto: <Package className="h-4 w-4" />,
  tecnico: <Wrench className="h-4 w-4" />,
};

const Inner = () => {
  const { t } = useTranslation();

  const pagas = DEMANDAS.filter((d) => d.custo === 'pago').length;

  return (
    <CourseShell>
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        <header className="space-y-3">
          <Link
            to="/curso/admin"
            className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t('admin.backToPanel')}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <ClipboardList className="h-6 w-6 text-course-primary" />
            <h1 className="font-display text-4xl font-semibold text-course-foreground">
              {t('demandas.titulo')}
            </h1>
          </div>
          <p className="max-w-2xl font-body text-sm text-course-muted-foreground">
            {t('demandas.intro')}
          </p>
          {pagas > 0 && (
            <p className="font-body text-sm text-course-muted-foreground">
              {t('demandas.resumo', { total: DEMANDAS.length, pagas })}
            </p>
          )}
          <HelpModeToggle />
        </header>

        <HelpCard id="demandas" collapsed />


        {CATEGORIA_ORDEM.map((categoria) => {
          const itens = DEMANDAS.filter((d) => d.categoria === categoria);
          if (!itens.length) return null;

          return (
            <section key={categoria} className="space-y-4">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-course-foreground">
                <span className="text-course-primary">{ICONE_CATEGORIA[categoria]}</span>
                {t(`demandas.cat_${categoria}`)}
              </h2>

              {itens.map((d) => (
                <article
                  key={d.id}
                  className="rounded-xl border border-course-border bg-course-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-course-foreground">
                      {d.titulo}
                    </h3>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-[11px] font-semibold ${
                        d.custo === 'pago'
                          ? 'bg-course-accent text-course-accent-foreground'
                          : 'bg-course-secondary text-course-secondary-foreground'
                      }`}
                    >
                      {d.custo === 'pago' ? <Wallet size={11} /> : <Clock size={11} />}
                      {t(`demandas.custo_${d.custo}`)}
                    </span>
                  </div>

                  <dl className="mt-3 space-y-3">
                    <div>
                      <dt className="font-body text-xs uppercase tracking-widest text-course-muted-foreground">
                        {t('demandas.porque')}
                      </dt>
                      <dd className="mt-1 font-body text-sm leading-relaxed text-course-foreground">
                        {d.porque}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-body text-xs uppercase tracking-widest text-course-muted-foreground">
                        {t('demandas.proximoPasso')}
                      </dt>
                      <dd className="mt-1 font-body text-sm leading-relaxed text-course-foreground">
                        {d.proximoPasso}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-4 border-t border-course-border/60 pt-3 font-body text-xs text-course-muted-foreground">
                    {d.origem}
                  </p>
                </article>
              ))}
            </section>
          );
        })}

        <p className="rounded-xl border border-dashed border-course-border p-4 font-body text-xs leading-relaxed text-course-muted-foreground">
          {t('demandas.comoAdicionar')}
        </p>
      </div>
    </CourseShell>
  );
};

/**
 * Em desenvolvimento abre direto, para conferir a lista sem uma sessão de
 * administrador. Publicada, continua atrás do login — mesmo padrão da
 * página de Simulação.
 */
const Demandas = () =>
  import.meta.env.DEV ? (
    <Inner />
  ) : (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );

export default Demandas;
