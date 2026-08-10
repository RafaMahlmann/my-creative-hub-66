import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';

/**
 * Marca visualmente qualquer coisa que venha da Simulação. Pequeno e
 * discreto de propósito: precisa ser notado sem competir com o conteúdo,
 * e precisa estar SEMPRE presente — dado de exemplo sem aviso vira
 * decisão errada mais tarde.
 */
export const SeloSimulacao = ({ className = '' }: { className?: string }) => {
  const { t } = useTranslation();
  return (
    <span
      title={t('simulacao.seloAjuda')}
      className={`inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-body text-[10px] uppercase tracking-wide text-amber-300/90 ${className}`}
    >
      <FlaskConical className="h-2.5 w-2.5" />
      {t('simulacao.selo')}
    </span>
  );
};

/** Envolve um bloco inteiro com a moldura e o selo da Simulação. */
export const MolduraSimulacao = ({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-dashed border-amber-500/30 p-4">
    <header className="mb-3 flex flex-wrap items-center gap-2">
      <h3 className="font-display text-base font-semibold text-course-foreground">{titulo}</h3>
      <SeloSimulacao />
      {descricao && (
        <p className="w-full font-body text-xs text-course-muted-foreground">{descricao}</p>
      )}
    </header>
    {children}
  </section>
);
