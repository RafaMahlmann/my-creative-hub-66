import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Type, Sun, Moon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type FontSize = 'sm' | 'md' | 'lg';
type ReaderTheme = 'dark' | 'light';

const SIZE_KEY = 'course-reader-size';
const THEME_KEY = 'course-reader-theme';

const SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-sm leading-relaxed',
  md: 'text-base leading-relaxed',
  lg: 'text-lg leading-relaxed',
};

function readPref<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = window.localStorage.getItem(key);
    return (allowed as readonly string[]).includes(v ?? '') ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

function writePref(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* localStorage pode estar bloqueado */
  }
}

type Props = { title: string; content: string };

/** Leitor da apostila da aula — letra ajustável e tema próprio, independente do resto do site. */
export const LessonReader = ({ title, content }: Props) => {
  const { t } = useTranslation();
  const [size, setSize] = useState<FontSize>(() => readPref(SIZE_KEY, ['sm', 'md', 'lg'], 'md'));
  const [theme, setTheme] = useState<ReaderTheme>(() => readPref(THEME_KEY, ['dark', 'light'], 'dark'));

  const light = theme === 'light';

  return (
    <section
      className={`rounded-xl border p-5 transition-colors ${
        light ? 'border-course-border bg-[#f7f3ea] text-[#2a2620]' : 'border-course-border bg-course-card text-course-foreground'
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className={`font-display text-xl font-semibold ${light ? '' : 'text-course-foreground'}`}>{title}</h2>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={size}
            onValueChange={(v) => {
              if (!v) return;
              setSize(v as FontSize);
              writePref(SIZE_KEY, v);
            }}
            aria-label={t('reader.fontSize')}
          >
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <ToggleGroupItem
                key={s}
                value={s}
                size="sm"
                className={light ? 'data-[state=on]:bg-[#2a2620]/10 border-[#2a2620]/20' : 'border-course-border'}
                aria-label={t(`reader.size_${s}`)}
              >
                <Type className={s === 'sm' ? 'h-3 w-3' : s === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(v) => {
              if (!v) return;
              setTheme(v as ReaderTheme);
              writePref(THEME_KEY, v);
            }}
            aria-label={t('reader.theme')}
          >
            <ToggleGroupItem value="dark" size="sm" className="border-course-border" aria-label={t('reader.themeDark')}>
              <Moon className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="light"
              size="sm"
              className={light ? 'data-[state=on]:bg-[#2a2620]/10 border-[#2a2620]/20' : 'border-course-border'}
              aria-label={t('reader.themeLight')}
            >
              <Sun className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <div className={`whitespace-pre-line font-body ${SIZE_CLASSES[size]} ${light ? 'text-[#2a2620]' : 'text-course-muted-foreground'}`}>
        {content}
      </div>
    </section>
  );
};
