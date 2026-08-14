import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { CourseShell } from '@/components/course/CourseShell';
import { AdminGuard } from '@/components/course/AdminGuard';
import { CentralDeChaves } from '@/components/course/CentralDeChaves';
import { AvisoChaveLegenda } from '@/components/course/AvisoChaveLegenda';
import { HelpModeToggle } from '@/components/course/HelpCard';

const Inner = () => {
  const { t } = useTranslation();
  return (
    <CourseShell>
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <header className="space-y-3">
          <Link
            to="/curso/admin"
            className="inline-flex items-center gap-1 font-body text-sm text-course-muted-foreground hover:text-course-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t('admin.backToPanel')}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <KeyRound className="h-6 w-6 text-course-primary" />
            <h1 className="font-display text-4xl font-semibold">{t('chaves.titulo')}</h1>
            <HelpModeToggle className="ml-auto" />
          </div>
          <p className="max-w-2xl font-body text-sm text-course-muted-foreground">
            {t('chaves.subtitulo')}
          </p>
        </header>

        <AvisoChaveLegenda />
        <CentralDeChaves />
      </div>
    </CourseShell>
  );
};

const Chaves = () => (
  <AdminGuard>
    <Inner />
  </AdminGuard>
);

export default Chaves;
