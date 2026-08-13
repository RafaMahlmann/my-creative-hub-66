import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HardDrive, RefreshCw, ExternalLink, Film, Copy, ChevronDown, Subtitles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SERVIDOR_LOCAL, useServidorLocal, type SaudeServidor } from '@/hooks/useServidorLocal';

const ARQUIVO_INICIAR = 'INICIAR-SERVIDOR.bat';

type Props = {
  /**
   * Dados fixos para a página de Simulação: `null` mostra o estado desligado.
   * Quando ausente (o caso normal), o cartão consulta o servidor de verdade.
   */
  simular?: SaudeServidor | null;
};

/**
 * Estado do servidor que roda no HD externo — e, quando ele está desligado,
 * o passo a passo de como ligar. Desligado é situação normal (o HD pode estar
 * na gaveta), então o cartão ensina em vez de alarmar.
 */
export const ServidorLocalCard = ({ simular }: Props = {}) => {
  const { t } = useTranslation();
  const real = useServidorLocal();
  const [abertoAjuda, setAbertoAjuda] = useState(false);

  const simulando = simular !== undefined;
  const ligado = simulando ? !!simular : real.ligado;
  const saude = simulando ? simular : real.saude;
  const verificando = simulando ? false : real.verificando;
  const reverificar = simulando ? () => {} : real.reverificar;

  const legendando = saude?.legendando;

  return (
    <section
      className={`rounded-xl border p-5 ${
        ligado ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-course-border bg-course-card'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <HardDrive className={`h-5 w-5 ${ligado ? 'text-emerald-400' : 'text-course-muted-foreground'}`} />
        <h2 className="font-display text-lg font-semibold">{t('servidor.titulo')}</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-body text-xs ${
            ligado ? 'bg-emerald-500/15 text-emerald-300' : 'bg-course-secondary text-course-muted-foreground'
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              ligado ? 'bg-emerald-400' : 'bg-course-muted-foreground'
            }`}
          />
          {verificando ? t('servidor.verificando') : ligado ? t('servidor.ligado') : t('servidor.desligado')}
        </span>

        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-course-border bg-course-background text-course-foreground"
            onClick={() => reverificar()}
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${verificando ? 'animate-spin' : ''}`} />
            {t('servidor.reverificar')}
          </Button>
          {ligado && (
            <Button
              size="sm"
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
              onClick={() => window.open(SERVIDOR_LOCAL, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> {t('servidor.abrir')}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <HelpCard id="servidorLocal" collapsed />
      </div>



      {ligado ? (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm text-course-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Film className="h-4 w-4" /> {t('servidor.videos', { count: saude?.videos ?? 0 })}
            </span>
            <span>{saude?.ffmpeg ? t('servidor.comFFmpeg') : t('servidor.semFFmpeg')}</span>
            {saude?.motor && (
              <span className="flex items-center gap-1.5">
                <Subtitles className="h-4 w-4" /> {t('servidor.motor', { motor: saude.motor })}
              </span>
            )}
            {saude?.varrendo && <span className="text-course-primary">{t('servidor.varrendo')}</span>}
          </div>

          {legendando && (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 font-body text-sm text-amber-200">
              {legendando.erro
                ? t('servidor.legendaFalhou', { titulo: legendando.titulo, erro: legendando.erro })
                : t('servidor.legendando', { titulo: legendando.titulo, etapa: legendando.etapa })}
            </p>
          )}
        </>
      ) : (
        <div className="mt-4">
          <p className="font-body text-sm text-course-muted-foreground">{t('servidor.comoLigar')}</p>

          <ol className="mt-3 space-y-2.5">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex gap-3 font-body text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-course-border bg-course-background text-xs text-course-foreground">
                  {n}
                </span>
                <span className="pt-0.5 text-course-foreground">
                  {t(`servidor.passo${n}`)}
                  {n === 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(ARQUIVO_INICIAR);
                        toast.success(t('servidor.copiado'));
                      }}
                      className="ml-2 inline-flex items-center gap-1 rounded border border-course-border bg-course-background px-1.5 py-0.5 font-mono text-xs text-course-foreground hover:border-course-primary hover:text-course-primary"
                    >
                      {ARQUIVO_INICIAR} <Copy className="h-3 w-3" />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => setAbertoAjuda((v) => !v)}
            className="mt-4 flex items-center gap-1 font-body text-xs text-course-muted-foreground hover:text-course-foreground"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${abertoAjuda ? 'rotate-180' : ''}`} />
            {t('servidor.maisAjuda')}
          </button>

          {abertoAjuda && (
            <div className="mt-3 space-y-2 rounded-lg border border-course-border bg-course-background p-4 font-body text-sm text-course-muted-foreground">
              <p>
                <strong className="text-course-foreground">{t('servidor.ajudaNadaTitulo')}</strong>{' '}
                {t('servidor.ajudaNada')}
              </p>
              <p>
                <strong className="text-course-foreground">{t('servidor.ajudaNodeTitulo')}</strong>{' '}
                {t('servidor.ajudaNode')}
              </p>
              <p>
                <strong className="text-course-foreground">{t('servidor.ajudaOutroPcTitulo')}</strong>{' '}
                {t('servidor.ajudaOutroPc')}
              </p>
              <p className="border-t border-course-border pt-2 text-xs">
                {t('servidor.porqueNaoAutomatico')}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
