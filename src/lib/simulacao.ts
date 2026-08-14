import { useSyncExternalStore } from 'react';
import type { LessonMaterial } from '@/hooks/useLessonMaterials';

/**
 * Modo Simulação: mostra as telas com dados de exemplo, para conferir como
 * ficam sem depender do conteúdo real nem de ter tudo pronto.
 *
 * Regra que não se quebra: TUDO que vier daqui carrega um selo visível. Uma
 * tela de exemplo que não se identifica como exemplo é pior do que não ter
 * tela nenhuma — mais cedo ou mais tarde alguém toma decisão em cima de um
 * número inventado.
 */
const CHAVE = 'curso-simulacao';
const ouvintes = new Set<() => void>();

let ligada = (() => {
  try {
    return localStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
})();

export function setSimulacao(valor: boolean) {
  ligada = valor;
  try {
    localStorage.setItem(CHAVE, valor ? '1' : '0');
  } catch {
    /* localStorage pode estar bloqueado */
  }
  ouvintes.forEach((cb) => cb());
}

export function useSimulacao() {
  const valor = useSyncExternalStore(
    (cb) => {
      ouvintes.add(cb);
      return () => ouvintes.delete(cb);
    },
    () => ligada,
    () => false,
  );
  return { ligada: valor, ligar: () => setSimulacao(true), desligar: () => setSimulacao(false) };
}

// ── Dados de exemplo ───────────────────────────────────────────────────────
// Nomes propositalmente reconhecíveis como fictícios.

export const SIM_SAUDE = {
  ok: true as const,
  servidor: 'plasma' as const,
  versao: 1,
  videos: 12,
  varrendo: false,
  ffmpeg: true,
  motor: 'groq',
  chave: 'ok' as const,
  fila: 0,
  ultimoErro: null,
  legendando: null,
};

/** O caso que ficava escondido no terminal: servidor no ar, motor sem chave. */
export const SIM_SAUDE_SEM_CHAVE = {
  ...SIM_SAUDE,
  chave: 'faltando' as const,
  ultimoErro: 'Falha ao gerar legenda: Falta a chave do groq. Configure no painel.',
};

export const SIM_SAUDE_LEGENDANDO = {
  ...SIM_SAUDE,
  legendando: { id: 'exemplo-3', titulo: 'Aula 03 — Montagem (exemplo)', etapa: 'transcrevendo' },
};

export const SIM_VIDEOS = [
  {
    id: 'exemplo-1',
    titulo: 'Aula 01 — Boas-vindas (exemplo)',
    curso: 'Curso de exemplo',
    modulo: 'Fundamentos',
    arquivo: 'curso-exemplo/01-fundamentos/01-boas-vindas.mp4',
    miniatura: null,
    legenda: 'curso-exemplo/01-fundamentos/01-boas-vindas.pt.vtt',
    duracao: 425,
    publicado: true,
    gratuito: true,
    destino: 'hd' as const,
    refExterna: '',
  },
  {
    id: 'exemplo-2',
    titulo: 'Aula 02 — Componentes (exemplo)',
    curso: 'Curso de exemplo',
    modulo: 'Fundamentos',
    arquivo: 'curso-exemplo/01-fundamentos/02-componentes.mp4',
    miniatura: null,
    legenda: null,
    duracao: 912,
    publicado: false,
    gratuito: false,
    destino: 'vimeo' as const,
    refExterna: '000000002',
  },
];

export const SIM_DOCUMENTOS = [
  {
    id: 'exemplo-doc-1',
    tipo: 'documento' as const,
    titulo: 'Apostila 01 — Fundamentos (exemplo)',
    curso: 'Curso de exemplo',
    modulo: 'Fundamentos',
    arquivo: 'curso-exemplo/01-fundamentos/apostila-01.pdf',
    miniatura: null,
    duracao: null,
    paginaPasta: 'curso-exemplo/01-fundamentos/apostila-01.paginas',
    paginas: 4,
    publicado: true,
    gratuito: true,
    destino: 'hd' as const,
    refExterna: '',
  },
];

export const SIM_VTT = `WEBVTT

1
00:00:00.000 --> 00:00:04.360
<00:00:00.040>Este <00:00:00.500>é <00:00:00.700>um <00:00:00.900>exemplo <00:00:01.500>de <00:00:01.700>legenda.
`;

export const SIM_MATERIAIS: LessonMaterial[] = [
  {
    id: 'exemplo-material-1',
    title_pt: 'Apostila da aula (exemplo)',
    title_en: 'Lesson workbook (sample)',
    file_url: null,
    file_type: 'pdf',
    position: 1,
    storage_path: 'curso-exemplo/01-fundamentos/apostila.pdf',
    size_bytes: 2_400_000,
  },
  {
    id: 'exemplo-material-2',
    title_pt: 'Artigo de referência (exemplo)',
    title_en: 'Reference article (sample)',
    file_url: 'https://exemplo.org/artigo',
    file_type: 'link',
    position: 2,
    storage_path: null,
    size_bytes: null,
  },
];
