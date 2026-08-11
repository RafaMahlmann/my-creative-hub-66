/**
 * Demandas futuras — o que ficou consciente mas não cabia agora.
 *
 * Existe porque ressalva dita em conversa se perde. Aqui cada item guarda
 * o PORQUÊ junto, que é a parte que some primeiro: daqui a três meses o
 * "revisar termo com advogado" sozinho não diz nada, mas "porque o termo
 * cita a Portaria 971 e se contradiz três linhas depois" reconstrói a
 * decisão inteira.
 *
 * É um arquivo, não uma tabela, de propósito: aplicar migração aqui exige
 * colar SQL no painel do Supabase à mão (ver CLAUDE.md). Para uma lista
 * que é lida e revisada de vez em quando, arquivo versionado no git dá
 * menos atrito e ainda deixa histórico de quando cada item entrou.
 */

export type CustoDemanda =
  /** precisa de dinheiro (contratar alguém, pagar taxa) */
  | 'pago'
  /** só precisa de tempo e decisão */
  | 'tempo';

export type CategoriaDemanda = 'juridico' | 'marca' | 'produto' | 'tecnico';

export type Demanda = {
  id: string;
  titulo: string;
  categoria: CategoriaDemanda;
  custo: CustoDemanda;
  /** por que isto importa — o que se perde se ficar para nunca */
  porque: string;
  /** o próximo passo concreto, não o objetivo abstrato */
  proximoPasso: string;
  /** de onde veio, para reconstruir o contexto depois */
  origem: string;
};

export const DEMANDAS: Demanda[] = [
  {
    id: 'termo-revisao-advogado',
    titulo: 'Revisão do termo de aceite por advogado (direito sanitário)',
    categoria: 'juridico',
    custo: 'pago',
    porque:
      'O termo v2.0 foi reescrito com base em norma real (PNPIC, RDC 751/2022, arts. 283 e 284 do Código Penal), mas quem pesquisa norma não é quem assina parecer. É o documento que protege o Rafa em caso de questionamento — merece olho de quem responde por isso.',
    proximoPasso:
      'Levar plano-burnstore/termo-aceite-v2.md para um advogado com prática em direito sanitário e consumerista. Pedir revisão das seções 2 (limites da prática) e 4 (dispositivos), que são as reescritas.',
    origem:
      '11/08/2026 — revisão do termo depois que o Rafa notou que o texto o descredibilizava ("estou quase dizendo que não vou fazer nada").',
  },
  {
    id: 'inpi-flor-de-plasma',
    titulo: 'Registro da marca "Flor de Plasma" no INPI',
    categoria: 'marca',
    custo: 'pago',
    porque:
      'O Rafa é fundador e curador do ecossistema, mas cláusula de termo não protege marca — proteção de marca é registro no INPI. Sem isso, terceiro pode registrar antes e o nome vira problema em vez de patrimônio.',
    proximoPasso:
      'Busca de anterioridade no INPI (gratuita, no site) para ver se o nome está livre nas classes de ensino e de produtos. Depois, decidir se faz o depósito direto ou via agente de propriedade industrial.',
    origem: '11/08/2026 — levantado durante a revisão do termo de aceite.',
  },
  {
    id: 'termo-compra-alegacao-energetica',
    titulo: 'Revisar o termo de COMPRA para venda de dispositivos',
    categoria: 'juridico',
    custo: 'pago',
    porque:
      'O termo de compra atual cobre bem produto natural/suplemento ("não são medicamentos", "ausência de promessa de resultado"), mas foi escrito antes de existir a venda de dispositivos de frequência. Quem vende objeto com fundamentação energética tem exposição diferente de quem vende suplemento.',
    proximoPasso:
      'Incluir na mesma consulta jurídica do termo de aceite. Ponto central: alinhar o termo de compra ao enquadramento de "objeto de bem-estar e cultura, sem finalidade médica", que é o que sustenta a seção 4 do termo do aluno.',
    origem:
      '11/08/2026 — surgiu ao mapear que aluno confecciona e o Rafa também pode vender o dispositivo.',
  },
];

export const CATEGORIA_ORDEM: CategoriaDemanda[] = ['juridico', 'marca', 'produto', 'tecnico'];
