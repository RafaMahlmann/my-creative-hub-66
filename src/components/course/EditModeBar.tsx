import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Eye, Pencil } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { HelpModeToggle } from '@/components/course/HelpCard';
import { useCourseEditMode } from '@/hooks/useCourseEditMode';


/** Barra flutuante de administração exibida na área de cursos. */
export const EditModeBar = () => {
  const { t } = useTranslation();
  const { isAdmin, loading, enabled, setEnabled } = useCourseEditMode();

  if (loading || !isAdmin) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-full border border-course-border bg-course-card/95 px-5 py-2.5 shadow-2xl backdrop-blur">
        <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-course-foreground">
          <Pencil className="h-4 w-4 text-course-primary" />
          {t('editor.editMode')}
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </label>
        <button
          type="button"
          onClick={() => setEnabled(false)}
          className="flex items-center gap-1.5 font-body text-sm text-course-muted-foreground transition-colors hover:text-course-foreground"
        >
          <Eye className="h-4 w-4" />
          {t('editor.viewAsStudent')}
        </button>
        <Link
          to="/curso/admin"
          className="flex items-center gap-1.5 font-body text-sm text-course-muted-foreground transition-colors hover:text-course-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          {t('editor.openPanel')}
        </Link>
        <HelpModeToggle className="rounded-full" />

      </div>
    </div>
  );
};
