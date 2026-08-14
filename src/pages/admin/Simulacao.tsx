import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FlaskConical, HardDrive, Image, Subtitles, Languages, ShieldCheck } from 'lucide-react';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { ServidorLocalCard } from '@/components/course/ServidorLocalCard';
import { AvisoChaveLegenda } from '@/components/course/AvisoChaveLegenda';
import { CentralDeChaves } from '@/components/course/CentralDeChaves';
import { PuxarLegendaDoHD } from '@/components/course/PuxarLegendaDoHD';
import { PuxarPaginasDoHD } from '@/components/course/PuxarPaginasDoHD';
import { ThumbPicker } from '@/components/course/ThumbPicker';
import { CourseCard } from '@/components/course/CourseCard';
import { MaterialsTab } from '@/components/course/MaterialsTab';
import { MolduraSimulacao, SeloSimulacao } from '@/components/course/SeloSimulacao';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSimulacao, SIM_SAUDE, SIM_SAUDE_LEGENDANDO, SIM_SAUDE_SEM_CHAVE, SIM_VIDEOS, SIM_MATERIAIS, SIM_DOCUMENTOS } from '@/lib/simulacao';

/**
 * Vitrine das telas de administração com dados de exemplo.
 *
 * Os componentes montados aqui são os MESMOS de produção — só os dados são
 * fictícios, entregues pela propriedade `simular`. A primeira tentativa foi
 * pré-preencher o cache do React Query, o que parecia mais elegante mas se
 * mostrou frágil: o próprio componente refazia a consulta e caía no estado
 * real. Passar o dado explicitamente é mais chato de escrever e infinitamente
 * mais confiável.
 */
type Tutorial = { icone: React.ReactNode; titulo: string; texto: string; passos: string[] };

const Inner = () => {
  const { t } = useTranslation();
  const { ligada, ligar, desligar } = useSimulacao();
  const [capa, setCapa] = useState<string | null>(null);

  const tutoriais: Tutorial[] = [
    {
      icone: <HardDrive className="h-5 w-5" />,
      titulo: t('simulacao.t1Titulo'),
      texto: t('simulacao.t1Texto'),
      passos: [t('simulacao.t1p1'), t('simulacao.t1p2'), t('simulacao.t1p3')],
    },
    {
      icone: <Image className="h-5 w-5" />,
      titulo: t('simulacao.t2Titulo'),
      texto: t('simulacao.t2Texto'),
      passos: [t('simulacao.t2p1'), t('simulacao.t2p2'), t('simulacao.t2p3')],
    },
    {
      icone: <Subtitles className="h-5 w-5" />,
      titulo: t('simulacao.t3Titulo'),
      texto: t('simulacao.t3Texto'),
      passos: [t('simulacao.t3p1'), t('simulacao.t3p2'), t('simulacao.t3p3')],
    },
    {
      icone: <Languages className="h-5 w-5" />,
      titulo: t('simulacao.t4Titulo'),
      texto: t('simulacao.t4Texto'),
      passos: [t('simulacao.t4p1'), t('simulacao.t4p2')],
    },
  ];

  return (
    <CourseShell>
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <header className="space-y-3">
          <Link
            to="/curso/admin"
            className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t('admin.backToPanel')}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <FlaskConical className="h-6 w-6 text-amber-400" />
            <h1 className="font-display text-4xl font-semibold">{t('simulacao.titulo')}</h1>
          </div>
          <p className="max-w-2xl font-body text-sm text-course-muted-foreground">
            {t('simulacao.intro')}
          </p>
        </header>

        {/* Interruptor */}
        <section className="flex flex-wrap items-center gap-4 rounded-xl border border-course-border bg-course-card p-5">
          <div className="min-w-[16rem] flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold">{t('simulacao.interruptor')}</h2>
              {ligada && <SeloSimulacao />}
            </div>
            <p className="mt-1 font-body text-sm text-course-muted-foreground">
              {ligada ? t('simulacao.ligadaTexto') : t('simulacao.desligadaTexto')}
            </p>
          </div>
          <label className="flex items-center gap-3 font-body text-sm">
            {ligada ? t('simulacao.ligada') : t('simulacao.desligada')}
            <Switch checked={ligada} onCheckedChange={(v) => (v ? ligar() : desligar())} />
          </label>
        </section>

        {/* Tutoriais */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">{t('simulacao.oQueDaPraFazer')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tutoriais.map((tut) => (
              <article
                key={tut.titulo}
                className="rounded-xl border border-course-border bg-course-card p-5 transition-colors hover:border-course-primary/50"
              >
                <div className="flex items-center gap-2 text-course-primary">{tut.icone}</div>
                <h3 className="mt-2 font-display text-lg font-semibold">{tut.titulo}</h3>
                <p className="mt-1 font-body text-sm text-course-muted-foreground">{tut.texto}</p>
                <ol className="mt-3 space-y-1.5">
                  {tut.passos.map((p, i) => (
                    <li key={i} className="flex gap-2.5 font-body text-sm text-course-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-course-border bg-course-background text-[11px]">
                        {i + 1}
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        {/* Telas de exemplo */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold">{t('simulacao.comoFica')}</h2>
            <SeloSimulacao />
          </div>

          {!ligada ? (
            <div className="rounded-xl border border-dashed border-course-border p-10 text-center">
              <p className="font-body text-course-muted-foreground">{t('simulacao.ligarParaVer')}</p>
              <Button
                onClick={ligar}
                className="mt-4 bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
              >
                {t('simulacao.ligarAgora')}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <MolduraSimulacao titulo={t('simulacao.exServidorOn')} descricao={t('simulacao.exServidorOnDesc')}>
                <ServidorLocalCard simular={SIM_SAUDE} />
              </MolduraSimulacao>

              <MolduraSimulacao titulo={t('simulacao.exLegendando')} descricao={t('simulacao.exLegendandoDesc')}>
                <ServidorLocalCard simular={SIM_SAUDE_LEGENDANDO} />
              </MolduraSimulacao>

              <MolduraSimulacao titulo={t('chaves.faltaTitulo')} descricao={t('chaves.faltaTexto', { motor: 'groq' })}>
                <AvisoChaveLegenda simular={SIM_SAUDE_SEM_CHAVE} />
              </MolduraSimulacao>

              <MolduraSimulacao titulo={t('chaves.titulo')} descricao={t('chaves.subtitulo')}>
                <CentralDeChaves />
              </MolduraSimulacao>

              <MolduraSimulacao titulo={t('simulacao.exServidorOff')} descricao={t('simulacao.exServidorOffDesc')}>
                <ServidorLocalCard simular={null} />
              </MolduraSimulacao>

              <MolduraSimulacao titulo={t('simulacao.exLegenda')} descricao={t('simulacao.exLegendaDesc')}>
                <PuxarLegendaDoHD
                  sourcePath={'D:\\Videos\\01-boas-vindas.mp4'}
                  onChegou={() => {}}
                  simular={SIM_VIDEOS}
                />
              </MolduraSimulacao>

              <MolduraSimulacao titulo={t('simulacao.exMateriais')} descricao={t('simulacao.exMateriaisDesc')}>
                <MaterialsTab lessonId="exemplo" simular={SIM_MATERIAIS} />
              </MolduraSimulacao>

              <MolduraSimulacao titulo={t('simulacao.exPaginas')} descricao={t('simulacao.exPaginasDesc')}>
                <PuxarPaginasDoHD lessonId="exemplo" sourcePath={null} simular={SIM_DOCUMENTOS} />
              </MolduraSimulacao>

              <MolduraSimulacao titulo={t('simulacao.exMiniatura')} descricao={t('simulacao.exMiniaturaDesc')}>
                <div className="max-w-sm">
                  <ThumbPicker url={capa} onChange={setCapa} />
                </div>
              </MolduraSimulacao>

              <MolduraSimulacao titulo={t('simulacao.exVitrine')} descricao={t('simulacao.exVitrineDesc')}>
                <div className="flex flex-wrap gap-4">
                  <CourseCard
                    to="#"
                    title={t('simulacao.cardComCapa')}
                    subtitle={t('simulacao.cardSub')}
                    isFree
                    meta="7 min"
                    editing
                    onEditThumb={() => {}}
                    onToggleFree={() => {}}
                  />
                  <CourseCard
                    to="#"
                    title={t('simulacao.cardSemCapa')}
                    subtitle={t('simulacao.cardSub')}
                    isFree={false}
                    meta="15 min"
                  />
                </div>
              </MolduraSimulacao>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-course-border bg-course-card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="font-display text-lg font-semibold">{t('simulacao.seguroTitulo')}</h2>
          </div>
          <ul className="mt-2 space-y-1.5 font-body text-sm text-course-muted-foreground">
            <li>• {t('simulacao.seguro1')}</li>
            <li>• {t('simulacao.seguro2')}</li>
            <li>• {t('simulacao.seguro3')}</li>
          </ul>
        </section>
      </div>
    </CourseShell>
  );
};

/**
 * Em desenvolvimento a página abre direto, para conferir as telas sem uma
 * sessão real. Publicada, continua atrás do login de administrador.
 */
const Simulacao = () =>
  import.meta.env.DEV ? (
    <Inner />
  ) : (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );

export default Simulacao;
