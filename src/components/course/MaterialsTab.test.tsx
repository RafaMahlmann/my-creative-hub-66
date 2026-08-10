import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@/i18n';
import type { LessonMaterial } from '@/hooks/useLessonMaterials';
import { MaterialsTab } from './MaterialsTab';

/**
 * O upload de material é a maior mudança da Etapa 1 — hoje é URL colada à
 * mão, e vira arrastar o arquivo. Estas telas vivem atrás do login de
 * administrador, então testamos aqui montando o componente com os hooks de
 * dados simulados, sem depender de sessão nem de banco.
 */

const mutate = () => vi.fn();
let uploadFile = { mutate: mutate(), isPending: false };
let addLink = { mutate: mutate(), isPending: false };
let rename = { mutate: mutate() };
let remove = { mutate: mutate() };
let materiais: LessonMaterial[] = [];
let carregando = false;
let colunaExiste = true;

vi.mock('@/hooks/useColumnSupport', () => ({
  useColumnSupport: () => colunaExiste,
  useRecheckColumn: () => vi.fn(),
}));

vi.mock('@/hooks/useLessonMaterials', () => ({
  useLessonMaterials: () => ({ data: materiais, isLoading: carregando }),
  useLessonMaterialMutations: () => ({ uploadFile, addLink, rename, remove }),
}));

const EXTERNO: LessonMaterial = {
  id: 'm1',
  title_pt: 'Artigo de referência',
  title_en: null,
  file_url: 'https://exemplo.com/artigo',
  file_type: 'LINK',
  position: 1,
};

const ENVIADO: LessonMaterial = {
  id: 'm2',
  title_pt: 'Apostila do módulo',
  title_en: null,
  file_url: null,
  file_type: 'PDF',
  position: 2,
  storage_path: 'aula-1/apostila.pdf',
  size_bytes: 2_400_000,
};

beforeEach(async () => {
  await i18n.changeLanguage('pt');
  uploadFile = { mutate: mutate(), isPending: false };
  addLink = { mutate: mutate(), isPending: false };
  rename = { mutate: mutate() };
  remove = { mutate: mutate() };
  materiais = [];
  carregando = false;
  colunaExiste = true;
});

describe('MaterialsTab', () => {
  it('mostra o card de configuração pendente e desabilita o upload quando a coluna não existe', () => {
    colunaExiste = false;
    render(<MaterialsTab lessonId="aula-1" />);
    expect(screen.getByText(/Falta um passo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Arraste o arquivo/i })).toHaveAttribute('tabindex', '-1');
  });

  it('mostra o estado vazio quando não há material', () => {
    render(<MaterialsTab lessonId="aula-1" />);
    expect(screen.getByText(/Nenhum material/i)).toBeInTheDocument();
  });

  it('distingue material enviado de link externo', () => {
    materiais = [EXTERNO, ENVIADO];
    render(<MaterialsTab lessonId="aula-1" />);
    expect(screen.getByText('link externo')).toBeInTheDocument();
    // o material enviado por upload não carrega o selo de link externo
    expect(screen.getAllByText('link externo')).toHaveLength(1);
    expect(screen.getByText('2.3 MB')).toBeInTheDocument();
  });

  it('envia o arquivo escolhido para a mutação de upload', async () => {
    render(<MaterialsTab lessonId="aula-1" />);
    const arquivo = new File(['conteudo'], 'apostila.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, arquivo);

    expect(uploadFile.mutate).toHaveBeenCalledWith(arquivo);
  });

  it('pede confirmação antes de remover um material', async () => {
    materiais = [ENVIADO];
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<MaterialsTab lessonId="aula-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Remover material/i }));

    await waitFor(() => expect(remove.mutate).toHaveBeenCalledWith(ENVIADO));
  });

  it('não remove quando a confirmação é cancelada', async () => {
    materiais = [ENVIADO];
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<MaterialsTab lessonId="aula-1" />);

    await userEvent.click(screen.getByRole('button', { name: /Remover material/i }));

    expect(remove.mutate).not.toHaveBeenCalled();
  });
});
