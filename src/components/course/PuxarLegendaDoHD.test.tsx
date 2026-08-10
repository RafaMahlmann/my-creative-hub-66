import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n from '@/i18n';
import { PuxarLegendaDoHD } from './PuxarLegendaDoHD';

/**
 * Estas telas vivem atrás do login de administrador, então não dá para
 * conferi-las no navegador sem uma sessão real. Montá-las aqui, com o
 * servidor do HD simulado, cobre o comportamento sem precisar de senha
 * nem de banco.
 */

const VTT = `WEBVTT

1
00:00:00.000 --> 00:00:04.360
<00:00:00.040>Olá, <00:00:00.960>seja <00:00:01.160>bem-vindo <00:00:03.800>Saúde.
`;

const VIDEO = {
  id: 'v1',
  titulo: 'Aula de teste',
  curso: 'Ateliê',
  modulo: 'Fundamentos',
  arquivo: 'atelie/01-fundamentos/01-boas-vindas.mp4',
  miniatura: null,
  legenda: 'atelie/01-fundamentos/01-boas-vindas.pt.vtt',
  duracao: 25,
  publicado: true,
  gratuito: true,
  destino: 'hd' as const,
  refExterna: '',
};

/** Simula o servidor do HD: ligado ou não, com ou sem legendas. */
function simularServidor(opts: { ligado: boolean; itens?: unknown[]; vtt?: string }) {
  return vi.fn(async (entrada: RequestInfo | URL) => {
    const url = String(entrada);
    if (!opts.ligado) throw new TypeError('Failed to fetch');
    if (url.includes('/api/saude')) {
      return new Response(
        JSON.stringify({ ok: true, servidor: 'plasma', versao: 1, videos: 1, varrendo: false, ffmpeg: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (url.includes('/api/biblioteca')) {
      return new Response(JSON.stringify({ itens: opts.itens ?? [], raiz: 'E:\\' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.includes('/legenda/')) {
      return new Response(opts.vtt ?? VTT, { status: 200 });
    }
    return new Response('não encontrado', { status: 404 });
  });
}

function montar(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

beforeEach(async () => {
  await i18n.changeLanguage('pt');
});
afterEach(() => vi.restoreAllMocks());

describe('PuxarLegendaDoHD', () => {
  it('não aparece quando o servidor do HD está desligado', async () => {
    vi.stubGlobal('fetch', simularServidor({ ligado: false }));
    const { container } = montar(<PuxarLegendaDoHD onChegou={() => {}} />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('avisa quando nenhum vídeo do HD tem legenda', async () => {
    vi.stubGlobal('fetch', simularServidor({ ligado: true, itens: [] }));
    montar(<PuxarLegendaDoHD onChegou={() => {}} />);
    expect(await screen.findByText(/Nenhum vídeo do HD tem legenda/i)).toBeInTheDocument();
  });

  it('reconhece sozinho o vídeo pelo caminho do arquivo, ignorando pasta e extensão', async () => {
    vi.stubGlobal('fetch', simularServidor({ ligado: true, itens: [VIDEO] }));
    montar(
      <PuxarLegendaDoHD
        sourcePath={'D:\\Videos\\Burnstore\\01-BOAS-VINDAS.mp4'}
        onChegou={() => {}}
      />,
    );
    expect(await screen.findByText(/Achei pelo arquivo/i)).toBeInTheDocument();
  });

  it('pede para escolher quando o arquivo não bate com nenhum', async () => {
    vi.stubGlobal('fetch', simularServidor({ ligado: true, itens: [VIDEO] }));
    montar(<PuxarLegendaDoHD sourcePath={'D:\\Videos\\outra-coisa.mp4'} onChegou={() => {}} />);
    expect(await screen.findByText(/Nenhum vídeo do HD tem o mesmo nome/i)).toBeInTheDocument();
    expect(screen.queryByText(/Achei pelo arquivo/i)).not.toBeInTheDocument();
  });

  it('entrega o VTT íntegro ao clicar em puxar', async () => {
    vi.stubGlobal('fetch', simularServidor({ ligado: true, itens: [VIDEO] }));
    const recebido = vi.fn();
    montar(<PuxarLegendaDoHD sourcePath={'D:\\v\\01-boas-vindas.mp4'} onChegou={recebido} />);

    await userEvent.click(await screen.findByRole('button', { name: /Puxar legenda/i }));

    await waitFor(() => expect(recebido).toHaveBeenCalledTimes(1));
    const vtt = recebido.mock.calls[0][0] as string;
    expect(vtt).toMatch(/^WEBVTT/);
    // a marcação por palavra é o que dá o efeito CapCut — não pode se perder
    expect(vtt).toMatch(/<00:00:\d\d\.\d\d\d>/);
    expect(vtt).toContain('Saúde');
  });

  it('recusa arquivo que não seja WebVTT em vez de sujar o editor', async () => {
    vi.stubGlobal('fetch', simularServidor({ ligado: true, itens: [VIDEO], vtt: '<html>erro 500</html>' }));
    const recebido = vi.fn();
    montar(<PuxarLegendaDoHD sourcePath={'D:\\v\\01-boas-vindas.mp4'} onChegou={recebido} />);

    await userEvent.click(await screen.findByRole('button', { name: /Puxar legenda/i }));

    await waitFor(() => expect(screen.getByRole('button', { name: /Puxar legenda/i })).toBeEnabled());
    expect(recebido).not.toHaveBeenCalled();
  });
});
