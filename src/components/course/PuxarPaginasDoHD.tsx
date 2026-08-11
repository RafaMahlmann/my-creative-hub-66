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
  baixarPaginaLocal,
  mesmoArquivo,
  useBibliotecaLocal,
  useServidorLocal,
  type VideoLocal,
} from '@/hooks/useServidorLocal';
import { useLessonMaterialMutations } from '@/hooks/useLessonMaterials';

type Props = {
  lessonId: string;
  /** caminho do arquivo original no computador, usado para casar sozinho */
  sourcePath?: string | null;
  /** lista fixa para a página de Simulação; sem isto, consulta o servidor */
  simular?: VideoLocal[];
};

/**
 * Traz para os materiais da aula as páginas de um PDF que o servidor do HD já
 * rasterizou (Poppler) — uma imagem por página, na ordem, cada uma virando um
 * material separado (mesmo caminho de upload da Etapa 1, só que a origem do
 * arquivo é o HD em vez do computador de quem está editando).
 */
export const PuxarPaginasDoHD = ({ lessonId, sourcePath, simular }: Props) => {
  const { t } = useTranslation();
  const simulando = simular !== undefined;
  const real = useServidorLocal();
  const ligado = simulando || real.ligado;
  const { data: biblioteca, isLoading: carregando } = useBibliotecaLocal(!simulando && real.ligado);
  const isLoading = simulando ? false : carregando;
  const realMut = useLessonMaterialMutations(simulando ? undefined : lessonId);
  const [puxando, setPuxando] = useState(false);
  const [progresso, setProgresso] = useState<{ feito: number; total: number } | null>(null);
  const [escolhido, setEscolhido] = useState<string>('');

  const documentos = useMemo(
    () => (simular ?? biblioteca?.itens ?? []).filter((v) => v.tipo === 'documento' && (v.paginas ?? 0) > 0),
    [simular, biblioteca],
  );

  const sugerido = useMemo(
    () => documentos.find((v) => mesmoArquivo(sourcePath, v.arquivo)),
    [documentos, sourcePath],
  );

  const alvo = documentos.find((v) => v.id === escolhido) ?? sugerido ?? null;

  if (!ligado) return null;

  const puxar = async () => {
    if (!alvo?.paginaPasta || !alvo.paginas) return;
    if (simulando) return toast.info(t('simulacao.selo'));
    setPuxando(true);
    setProgresso({ feito: 0, total: alvo.paginas });
    try {
      for (let i = 1; i <= alvo.paginas; i++) {
        const blob = await baixarPaginaLocal(`${alvo.paginaPasta}/pagina-${i}.png`);
        const arquivo = new File([blob], `${alvo.titulo} — página ${i}.png`, { type: 'image/png' });
        await realMut.uploadFile.mutateAsync(arquivo);
        setProgresso({ feito: i, total: alvo.paginas });
      }
      toast.success(t('materials.hdChegou'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'erro');
    } finally {
      setPuxando(false);
      setProgresso(null);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="flex items-center gap-2">
        <HardDrive className="h-4 w-4 text-emerald-400" />
        <h4 className="font-display text-sm font-semibold">{t('materials.hdTitulo')}</h4>
      </div>

      {isLoading ? (
        <p className="mt-2 font-body text-sm text-course-muted-foreground">
          {t('subtitles.hdCarregando')}
        </p>
      ) : documentos.length === 0 ? (
        <p className="mt-2 font-body text-sm text-course-muted-foreground">
          {t('materials.hdNenhum')}
        </p>
      ) : (
        <>
          <p className="mt-1 font-body text-xs text-course-muted-foreground">
            {sugerido
              ? t('subtitles.hdCasou', { arquivo: sugerido.arquivo })
              : t('materials.hdNaoCasou')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Select value={alvo?.id ?? ''} onValueChange={setEscolhido}>
              <SelectTrigger className="w-full max-w-md border-course-border bg-course-background text-course-foreground">
                <SelectValue placeholder={t('materials.hdEscolha')} />
              </SelectTrigger>
              <SelectContent>
                {documentos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.titulo} — {v.paginas} {t('materials.hdPaginas')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={puxar}
              disabled={!alvo || puxando}
              className="bg-course-primary text-course-primary-foreground hover:bg-course-primary/90"
            >
              {puxando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {puxando && progresso ? `${progresso.feito}/${progresso.total}` : t('materials.hdPuxar')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
