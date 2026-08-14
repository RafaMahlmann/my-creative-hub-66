import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, KeyRound, Unlock, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  destravarLegendaLocal,
  useServidorLocal,
  type SaudeServidor,
} from '@/hooks/useServidorLocal';

type Props = {
  /** estado fixo para a página de Simulação; sem isto, consulta o servidor */
  simular?: SaudeServidor | null;
};

/**
 * O antídoto da falha silenciosa.
 *
 * Antes, quando faltava a chave do motor de legenda, o servidor gritava no
 * terminal ("Falha ao gerar legenda: Falta a chave do groq") e o site não
 * ficava sabendo de nada — a pessoa clicava, nada acontecia, e o único lugar
 * que contava a verdade era uma janela preta atrás do navegador.
 *
 * Aqui a verdade sobe para a tela: falta chave, trabalho travado, último erro.
 * Servidor antigo que não informa nada vira "não sei dizer" — nunca "tudo
 * certo", que era exatamente a mentira anterior.
 */
export const AvisoChaveLegenda = ({ simular }: Props) => {
  const { t } = useTranslation();
  const real = useServidorLocal();
  const simulando = simular !== undefined;
  const saude = simulando ? simular : real.saude;
  const ligado = simulando ? !!simular : real.ligado;
  const [destravando, setDestravando] = useState(false);

  if (!ligado || !saude) return null;

  const motor = saude.motor ?? 'groq';
  const local = motor === 'local';
  const falta = saude.chave === 'faltando';
  const naoSei = saude.chave === undefined && !local;
  const erro = saude.ultimoErro || saude.legendando?.erro;

  if (!falta && !naoSei && !erro) return null;

  const destravar = async () => {
    setDestravando(true);
    const r = await destravarLegendaLocal();
    setDestravando(false);
    if (r.ok) {
      toast.success(t('chaves.destravou'));
      real.reverificar?.();
    } else {
      toast.info(t('chaves.servidorAntigo'));
    }
  };

  const tom = falta || erro ? 'amber' : 'slate';

  return (
    <div
      className={`rounded-xl border p-4 ${
        tom === 'amber'
          ? 'border-amber-500/40 bg-amber-500/10'
          : 'border-course-border bg-course-card'
      }`}
    >
      <div className="flex items-center gap-2">
        {tom === 'amber' ? (
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        ) : (
          <HelpCircle className="h-4 w-4 text-course-muted-foreground" />
        )}
        <h4 className="font-display text-sm font-semibold">
          {falta ? t('chaves.faltaTitulo') : t('chaves.titulo')}
        </h4>
      </div>

      <p className="mt-2 font-body text-sm text-course-muted-foreground">
        {falta ? t('chaves.faltaTexto', { motor }) : naoSei ? t('chaves.naoSeiDizer') : ''}
      </p>

      {erro && (
        <p className="mt-2 break-words font-mono text-xs text-amber-200">
          {t('chaves.ultimoErro', { erro })}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          asChild
          size="sm"
          className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
        >
          <Link to="/curso/admin/chaves">
            <KeyRound className="mr-2 h-3.5 w-3.5" /> {t('chaves.faltaBotao')}
          </Link>
        </Button>
        {saude.legendando && (
          <Button
            size="sm"
            variant="outline"
            disabled={destravando}
            onClick={destravar}
            className="border-course-border bg-course-background text-course-foreground"
          >
            <Unlock className="mr-2 h-3.5 w-3.5" /> {t('chaves.destravar')}
          </Button>
        )}
      </div>
    </div>
  );
};
