import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HardDrive, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  baixarLegendaLocal,
  mesmoArquivo,
  useBibliotecaLocal,
  useServidorLocal,
  type VideoLocal,
} from '@/hooks/useServidorLocal';

type Props = {
  /** caminho do arquivo original no computador, usado para casar sozinho */
  sourcePath?: string | null;
  onChegou: (vtt: string) => void;
  /** lista fixa para a página de Simulação; sem isto, consulta o servidor */
  simular?: VideoLocal[];
};

/**
 * Traz para o site a legenda que o servidor do HD já gerou (whisper.cpp, Groq
 * ou OpenAI, conforme configurado lá). É de graça e vem com tempo por palavra
 * — bem mais preciso do que transcrever aqui pela IA do site.
 */
export const PuxarLegendaDoHD = ({ sourcePath, onChegou, simular }: Props) => {
  const { t } = useTranslation();
  const simulando = simular !== undefined;
  const real = useServidorLocal();
  const ligado = simulando || real.ligado;
  const { data: biblioteca, isLoading: carregando } = useBibliotecaLocal(!simulando && real.ligado);
  const isLoading = simulando ? false : carregando;
  const [baixando, setBaixando] = useState(false);
  const [escolhido, setEscolhido] = useState<string>('');

  const comLegenda = useMemo(
    () => (simular ?? biblioteca?.itens ?? []).filter((v) => !!v.legenda),
    [simular, biblioteca],
  );

  // Se o caminho do arquivo original bate com algum vídeo do HD, já sugere.
  const sugerido = useMemo(
    () => comLegenda.find((v) => mesmoArquivo(sourcePath, v.arquivo)),
    [comLegenda, sourcePath],
  );

  const alvo = comLegenda.find((v) => v.id === escolhido) ?? sugerido ?? null;

  if (!ligado) return null;

  const puxar = async () => {
    if (!alvo?.legenda) return;
    setBaixando(true);
    try {
      onChegou(await baixarLegendaLocal(alvo.legenda));
      toast.success(t('subtitles.hdChegou'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'erro');
    } finally {
      setBaixando(false);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="flex items-center gap-2">
        <HardDrive className="h-4 w-4 text-emerald-400" />
        <h4 className="font-display text-sm font-semibold">{t('subtitles.hdTitulo')}</h4>
      </div>

      {isLoading ? (
        <p className="mt-2 font-body text-sm text-course-muted-foreground">
          {t('subtitles.hdCarregando')}
        </p>
      ) : comLegenda.length === 0 ? (
        <p className="mt-2 font-body text-sm text-course-muted-foreground">
          {t('subtitles.hdNenhuma')}
        </p>
      ) : (
        <>
          <p className="mt-1 font-body text-xs text-course-muted-foreground">
            {sugerido
              ? t('subtitles.hdCasou', { arquivo: sugerido.arquivo })
              : t('subtitles.hdNaoCasou')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Select value={alvo?.id ?? ''} onValueChange={setEscolhido}>
              <SelectTrigger className="w-full max-w-md border-course-border bg-course-background text-course-foreground">
                <SelectValue placeholder={t('subtitles.hdEscolha')} />
              </SelectTrigger>
              <SelectContent>
                {comLegenda.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.titulo} — {v.arquivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={puxar}
              disabled={!alvo || baixando}
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
            >
              {baixando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {t('subtitles.hdPuxar')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
