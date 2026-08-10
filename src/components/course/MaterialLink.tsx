import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MaterialRow } from '@/hooks/useLesson';
import { signedMaterialUrl } from '@/lib/materials';
import { pick } from '@/lib/course';

/**
 * Um material da aula. Arquivo enviado por upload (`storage_path`) gera um
 * link assinado no clique — nunca guardamos esse link, ele expira sozinho, e
 * pedimos de novo a cada abertura. Link externo (`file_url`) abre direto.
 */
export const MaterialLink = ({ material }: { material: MaterialRow }) => {
  const [carregando, setCarregando] = useState(false);

  const abrir = async () => {
    if (material.file_url) {
      window.open(material.file_url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!material.storage_path) return;
    setCarregando(true);
    try {
      const url = await signedMaterialUrl(material.storage_path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível abrir o material.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void abrir()}
      disabled={carregando}
      className="flex w-full items-center gap-3 rounded-lg border border-course-border/70 px-4 py-3 text-left font-body text-sm transition-colors hover:bg-course-secondary/60 disabled:opacity-60"
    >
      {carregando ? (
        <Loader2 size={16} className="animate-spin text-course-primary" />
      ) : (
        <Download size={16} className="text-course-primary" />
      )}
      <span className="flex-1 truncate">{pick(material.title_pt, material.title_en)}</span>
      {material.file_type && (
        <span className="font-body text-xs uppercase text-course-muted-foreground">
          {material.file_type}
        </span>
      )}
    </button>
  );
};
