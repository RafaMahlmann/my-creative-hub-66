import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, LockOpen, PlayCircle, Pencil, ArrowLeft, ArrowRight } from 'lucide-react';
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
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className="relative w-64 shrink-0 sm:w-72">
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
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1">
          {onMoveLeft && (
            <button
              type="button"
              onClick={onMoveLeft}
              title={t('editor.moveLeft')}
              aria-label={t('editor.moveLeft')}
              className="rounded-full bg-course-background/90 p-1.5 text-course-foreground shadow hover:bg-course-primary hover:text-course-primary-foreground"
            >
              <ArrowLeft size={13} />
            </button>
          )}
          {onMoveRight && (
            <button
              type="button"
              onClick={onMoveRight}
              title={t('editor.moveRight')}
              aria-label={t('editor.moveRight')}
              className="rounded-full bg-course-background/90 p-1.5 text-course-foreground shadow hover:bg-course-primary hover:text-course-primary-foreground"
            >
              <ArrowRight size={13} />
            </button>
          )}
          {onToggleFree && (
            <button
              type="button"
              onClick={onToggleFree}
              title={isFree ? t('editor.makePaid') : t('editor.makeFree')}
              aria-label={isFree ? t('editor.makePaid') : t('editor.makeFree')}
              className="rounded-full bg-course-background/90 p-1.5 text-course-foreground shadow hover:bg-course-primary hover:text-course-primary-foreground"
            >
              {isFree ? <LockOpen size={13} /> : <Lock size={13} />}
            </button>
          )}
          {editHref && (
            <Link
              to={editHref}
              title={t('editor.edit')}
              aria-label={t('editor.edit')}
              className="rounded-full bg-course-primary p-1.5 text-course-primary-foreground shadow hover:bg-course-primary/90"
            >
              <Pencil size={13} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export const cardTitle = pick;
