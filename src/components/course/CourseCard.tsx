import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  LockOpen,
  PlayCircle,
  Pencil,
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  MoreHorizontal,
  Film,
  LayoutDashboard,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { pick } from '@/lib/course';

type Props = {
  to: string;
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
  isFree?: boolean;
  meta?: string | null;
  /** modo edição do administrador */
  editing?: boolean;
  editHref?: string;
  onToggleFree?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onEditThumb?: () => void;
};

export const CourseCard = ({
  to,
  title,
  subtitle,
  coverUrl,
  isFree,
  meta,
  editing,
  editHref,
  onToggleFree,
  onMoveLeft,
  onMoveRight,
  onEditThumb,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="relative w-64 shrink-0 sm:w-72"
      onContextMenu={
        editing
          ? (e) => {
              // botão direito abre o mesmo menu dos três pontinhos
              e.preventDefault();
              setMenuOpen(true);
            }
          : undefined
      }
    >
      <Link
        to={to}
        className={`group relative block overflow-hidden rounded-xl border bg-course-card transition-all duration-300 hover:z-10 hover:scale-[1.04] hover:border-course-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-course-ring ${
          editing ? 'border-dashed border-course-primary/50' : 'border-course-border'
        }`}
      >
        <div className="relative aspect-video overflow-hidden bg-course-secondary">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-course-muted-foreground">
              <PlayCircle size={40} strokeWidth={1.2} />
            </div>
          )}
          {typeof isFree === 'boolean' && (
            <span
              className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 font-body text-[11px] font-semibold ${
                isFree
                  ? 'bg-course-primary text-course-primary-foreground'
                  : 'bg-course-accent text-course-accent-foreground'
              }`}
            >
              {isFree ? <LockOpen size={11} /> : <Lock size={11} />}
              {isFree ? t('course.free') : t('course.paid')}
            </span>
          )}
        </div>
        <div className="space-y-1 p-4">
          <h3 className="font-display text-lg font-semibold leading-snug text-course-foreground">{title}</h3>
          {subtitle && (
            <p className="line-clamp-2 font-body text-sm text-course-muted-foreground">{subtitle}</p>
          )}
          {meta && <p className="font-body text-xs text-course-muted-foreground/80">{meta}</p>}
        </div>
      </Link>

      {editing && (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title={t('editor.menuOpen')}
              aria-label={t('editor.menuOpen')}
              className="absolute right-2 top-2 z-20 rounded-full bg-course-background/90 p-1.5 text-course-foreground shadow transition-colors hover:bg-course-primary hover:text-course-primary-foreground"
            >
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 border-course-border bg-course-card text-course-foreground"
          >
            <DropdownMenuLabel className="font-display">{t('editor.menuTitle')}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-course-border" />

            {editHref && (
              <DropdownMenuItem className="font-body" onSelect={() => navigate(editHref)}>
                <Film className="mr-2 h-4 w-4" /> {t('editor.changeVideo')}
              </DropdownMenuItem>
            )}
            {onEditThumb && (
              <DropdownMenuItem className="font-body" onSelect={() => onEditThumb()}>
                <ImagePlus className="mr-2 h-4 w-4" />
                {coverUrl ? t('editor.thumbChange') : t('editor.thumbAdd')}
              </DropdownMenuItem>
            )}
            {editHref && (
              <DropdownMenuItem className="font-body" onSelect={() => navigate(editHref)}>
                <Pencil className="mr-2 h-4 w-4" /> {t('editor.editTexts')}
              </DropdownMenuItem>
            )}
            {onToggleFree && (
              <DropdownMenuItem className="font-body" onSelect={() => onToggleFree()}>
                {isFree ? <Lock className="mr-2 h-4 w-4" /> : <LockOpen className="mr-2 h-4 w-4" />}
                {isFree ? t('editor.makePaid') : t('editor.makeFree')}
              </DropdownMenuItem>
            )}

            {(onMoveLeft || onMoveRight) && <DropdownMenuSeparator className="bg-course-border" />}
            {onMoveLeft && (
              <DropdownMenuItem className="font-body" onSelect={() => onMoveLeft()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('editor.moveLeft')}
              </DropdownMenuItem>
            )}
            {onMoveRight && (
              <DropdownMenuItem className="font-body" onSelect={() => onMoveRight()}>
                <ArrowRight className="mr-2 h-4 w-4" /> {t('editor.moveRight')}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-course-border" />
            <DropdownMenuItem className="font-body" onSelect={() => navigate(editHref ?? '/curso/admin')}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> {t('editor.openInPanel')}
            </DropdownMenuItem>
            <p className="px-2 py-1.5 font-body text-[11px] text-course-muted-foreground">
              {t('editor.menuHint')}
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export const cardTitle = pick;
