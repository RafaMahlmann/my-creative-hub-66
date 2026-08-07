import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Lightbulb, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ---------------------------------------------------------------
   "Modo ajuda": um interruptor global que liga/desliga todos os
   cartões explicativos do painel do criador.
---------------------------------------------------------------- */

const KEY = 'burnstore.helpMode';
const listeners = new Set<() => void>();

const read = () => {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(KEY) !== 'off';
};

let current = read();

const emit = () => listeners.forEach((l) => l());

export const setHelpMode = (on: boolean) => {
  current = on;
  try {
    window.localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  emit();
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const useHelpMode = () => useSyncExternalStore(subscribe, () => current, () => true);

export const HelpModeToggle = ({ className = '' }: { className?: string }) => {
  const { t } = useTranslation();
  const on = useHelpMode();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setHelpMode(!on)}
      className={`border-course-border bg-course-card font-body text-course-foreground ${className}`}
    >
      <HelpCircle className={`mr-2 h-4 w-4 ${on ? 'text-course-primary' : 'text-course-muted-foreground'}`} />
      {on ? t('help.hide') : t('help.show')}
    </Button>
  );
};

/* ---------------------------------------------------------------
   Cartão explicativo
---------------------------------------------------------------- */

type HelpCardProps = {
  /** chave do bloco de textos dentro de `help.cards` no arquivo de idioma */
  id: string;
  /** começa recolhido? */
  collapsed?: boolean;
};

export const HelpCard = ({ id, collapsed = false }: HelpCardProps) => {
  const { t } = useTranslation();
  const on = useHelpMode();
  const [open, setOpen] = useState(!collapsed);

  useEffect(() => setOpen(!collapsed), [collapsed]);

  if (!on) return null;

  const base = `help.cards.${id}`;
  const steps = t(`${base}.steps`, { returnObjects: true, defaultValue: [] }) as unknown;
  const list = Array.isArray(steps) ? (steps as string[]) : [];
  const tip = t(`${base}.tip`, { defaultValue: '' });

  return (
    <section className="rounded-xl border border-course-primary/25 bg-course-primary/5 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-course-primary/15 text-course-primary">
          <Lightbulb size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-2 text-left"
          >
            <h3 className="font-display text-lg font-semibold text-course-foreground">
              {t(`${base}.title`)}
            </h3>
            <ChevronDown
              size={16}
              className={`ml-auto shrink-0 text-course-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div className="mt-2 space-y-3">
              <p className="font-body text-sm leading-relaxed text-course-muted-foreground">
                {t(`${base}.intro`)}
              </p>

              {!!list.length && (
                <ol className="space-y-2">
                  {list.map((step, i) => (
                    <li key={i} className="flex gap-3 font-body text-sm text-course-foreground/90">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-course-primary/20 text-[11px] font-semibold text-course-primary">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              )}

              {!!tip && (
                <p className="rounded-lg border border-course-border/60 bg-course-card px-3 py-2 font-body text-xs leading-relaxed text-course-muted-foreground">
                  💡 {tip}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label={t('help.hide')}
          onClick={() => setHelpMode(false)}
          className="text-course-muted-foreground transition-colors hover:text-course-foreground"
        >
          <X size={16} />
        </button>
      </div>
    </section>
  );
};

/** Dica curta, de uma linha, para colar ao lado de um campo. */
export const HelpNote = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const on = useHelpMode();
  if (!on) return null;
  return (
    <p className="flex items-start gap-2 rounded-lg border border-course-border/60 bg-course-card/60 px-3 py-2 font-body text-xs leading-relaxed text-course-muted-foreground">
      <Lightbulb size={13} className="mt-0.5 shrink-0 text-course-primary" />
      <span>{t(`help.notes.${id}`)}</span>
    </p>
  );
};
