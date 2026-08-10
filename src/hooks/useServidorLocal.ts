import { useQuery } from '@tanstack/react-query';

/**
 * Servidor da biblioteca que roda no HD externo (projeto `plasma-servidor`).
 * Um site não consegue — e não deve conseguir — ligar um programa no
 * computador de ninguém. O que dá para fazer é PERCEBER que ele está no ar.
 */
export const SERVIDOR_LOCAL = 'http://localhost:8787';

export type SaudeServidor = {
  ok: true;
  servidor: 'plasma';
  versao: number;
  videos: number;
  varrendo: boolean;
  ffmpeg: boolean;
  /** motor de legenda em uso: local | groq | openai */
  motor?: string;
  /** presente enquanto uma legenda está sendo gerada */
  legendando?: { id: string; titulo: string; etapa: string; erro?: string } | null;
};

export type VideoLocal = {
  id: string;
  titulo: string;
  curso: string | null;
  modulo: string | null;
  arquivo: string;
  miniatura: string | null;
  /** caminho do .vtt já gerado pelo servidor, quando existe */
  legenda?: string | null;
  duracao: number | null;
  publicado: boolean;
  gratuito: boolean;
  destino: 'hd' | 'casa' | 'vimeo' | 'youtube';
  refExterna: string;
};

/** Busca com prazo curto: servidor desligado não pode travar a tela. */
async function buscar<T>(caminho: string, ms = 2500): Promise<T> {
  const corta = new AbortController();
  const alarme = setTimeout(() => corta.abort(), ms);
  try {
    const r = await fetch(SERVIDOR_LOCAL + caminho, {
      signal: corta.signal,
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()) as T;
  } finally {
    clearTimeout(alarme);
  }
}

/**
 * Fica de olho no servidor do HD. Servidor desligado é situação NORMAL,
 * não erro — por isso nada de retry nem de mensagem vermelha.
 */
export function useServidorLocal() {
  const q = useQuery({
    queryKey: ['servidor-local', 'saude'],
    queryFn: () => buscar<SaudeServidor>('/api/saude'),
    retry: false,
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
    gcTime: 60000,
  });

  return {
    ligado: q.isSuccess && q.data?.servidor === 'plasma',
    saude: q.data ?? null,
    verificando: q.isLoading,
    reverificar: q.refetch,
  };
}

/** A biblioteca do HD — só busca quando o servidor está mesmo no ar. */
export function useBibliotecaLocal(ligado: boolean) {
  return useQuery({
    queryKey: ['servidor-local', 'biblioteca'],
    enabled: ligado,
    retry: false,
    staleTime: 15000,
    queryFn: async () => {
      const d = await buscar<{ itens: VideoLocal[]; raiz: string }>('/api/biblioteca', 8000);
      return d;
    },
  });
}

/** URL para tocar/exibir um arquivo servido pelo HD. */
export const urlLocal = (tipo: 'midia' | 'capa' | 'legenda', caminho: string) =>
  `${SERVIDOR_LOCAL}/${tipo}/${caminho.split('/').map(encodeURIComponent).join('/')}`;

/** Baixa o conteúdo de um .vtt que o servidor do HD já gerou. */
export async function baixarLegendaLocal(caminho: string): Promise<string> {
  const r = await fetch(urlLocal('legenda', caminho));
  if (!r.ok) throw new Error(`servidor respondeu ${r.status}`);
  const texto = await r.text();
  if (!/^WEBVTT/i.test(texto.trim())) throw new Error('o arquivo não parece uma legenda WebVTT');
  return texto;
}

/** Compara ignorando pasta, maiúsculas e a extensão — só o nome do arquivo. */
export function mesmoArquivo(caminhoA?: string | null, caminhoB?: string | null) {
  const nome = (c?: string | null) =>
    (c || '').replace(/\\/g, '/').split('/').pop()?.replace(/\.[^.]+$/, '').toLowerCase() ?? '';
  const a = nome(caminhoA);
  return !!a && a === nome(caminhoB);
}
