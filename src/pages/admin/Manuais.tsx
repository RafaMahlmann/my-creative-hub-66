import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookMarked, Download, LayoutDashboard, Server } from 'lucide-react';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { Button } from '@/components/ui/button';
import { HelpCard, HelpModeToggle } from '@/components/course/HelpCard';


type Manual = {
  id: string;
  arquivo: { pt: string; en: string };
  icone: React.ReactNode;
  paginas: { pt: number; en: number };
  /** existe só em português — a página avisa em vez de dar link quebrado */
  somentePt?: boolean;
};

const MANUAIS: Manual[] = [
  {
    id: 'servidor',
    arquivo: {
      pt: '/manuais/manual-do-servidor.pdf',
      en: '/manuais/manual-do-servidor-en.pdf',
    },
    icone: <Server className="h-5 w-5" />,
    paginas: { pt: 17, en: 16 },
  },
  {
    id: 'painel',
    arquivo: {
      pt: '/manuais/manual-do-painel-do-criador.pdf',
      en: '/manuais/manual-do-painel-do-criador.pdf',
    },
    icone: <LayoutDashboard className="h-5 w-5" />,
    paginas: { pt: 16, en: 16 },
    somentePt: true,
  },
];


const Inner = () => {
  const { t, i18n } = useTranslation();
  const idioma: 'pt' | 'en' = i18n.language?.startsWith('en') ? 'en' : 'pt';

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
            <BookMarked className="h-6 w-6 text-course-primary" />
            <h1 className="font-display text-4xl font-semibold text-course-foreground">
              {t('manuais.titulo')}
            </h1>
          </div>
          <p className="max-w-2xl font-body text-sm text-course-muted-foreground">
            {t('manuais.intro')}
          </p>
          <HelpModeToggle />
        </header>

        <HelpCard id="manuais" />



        <div className="space-y-4">
          {MANUAIS.map((m) => (
            <article
              key={m.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-course-border bg-course-card p-5"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-course-primary">{m.icone}</div>
                <h2 className="font-display text-xl font-semibold text-course-foreground">
                  {t(`manuais.${m.id}_titulo`)}
                </h2>
                <p className="max-w-xl font-body text-sm text-course-muted-foreground">
                  {t(`manuais.${m.id}_descricao`)}
                </p>
                <p className="font-body text-xs text-course-muted-foreground">
                  {t('manuais.paginas', { count: m.paginas[idioma] })} · PDF
                  {m.somentePt && ` · ${t('manuais.somentePt')}`}
                </p>
              </div>
              <div className="flex gap-2">
                <a href={m.arquivo[idioma]} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="border-course-border bg-course-card text-course-foreground">
                    {t('manuais.abrir')}
                  </Button>
                </a>
                <a href={m.arquivo[idioma]} download>
                  <Button className="bg-course-primary text-course-primary-foreground">
                    <Download className="mr-2 h-4 w-4" /> {t('manuais.baixar')}
                  </Button>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </CourseShell>
  );
};

const Manuais = () => (
  <AdminGuard>
    <Inner />
  </AdminGuard>
);

export default Manuais;
