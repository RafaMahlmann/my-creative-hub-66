/**
 * Central de chaves de IA — a lógica madura trazida do Vox (Meutranscritor).
 *
 * A ideia que faz tudo isto ser barato: TODOS os provedores aqui falam o mesmo
 * formato (`POST {base}/chat/completions`, no molde da OpenAI). Então trocar de
 * provedor é trocar três campos — endereço, chave e modelo — e nada mais no app
 * precisa saber quem respondeu.
 *
 * As chaves ficam SÓ no navegador de quem administra (localStorage). Nunca vão
 * para o banco, nunca entram no código, nunca aparecem para aluno nenhum.
 */

export type ProviderId =
  | 'groq'
  | 'openai'
  | 'gemini'
  | 'openrouter'
  | 'deepseek'
  | 'cerebras'
  | 'custom';

export type Preset = {
  id: ProviderId;
  nome: string;
  /** endereço base, sem a barra final e sem /chat/completions */
  base: string;
  modelo: string;
  precisaChave: boolean;
  /** onde a pessoa pega a chave */
  console?: string;
  /** este provedor também gera legenda no servidor do HD? */
  legenda?: boolean;
};

/**
 * Endereços conferidos um a um. Modelos com apelido "-latest" quando o provedor
 * oferece: nome de versão fixa envelhece sozinho e um dia devolve 404 sem aviso.
 */
export const PRESETS: Record<ProviderId, Preset> = {
  groq: {
    id: 'groq',
    nome: 'Groq',
    base: 'https://api.groq.com/openai/v1',
    modelo: 'llama-3.3-70b-versatile',
    precisaChave: true,
    console: 'https://console.groq.com/keys',
    legenda: true,
  },
  openai: {
    id: 'openai',
    nome: 'OpenAI',
    base: 'https://api.openai.com/v1',
    modelo: 'gpt-4o-mini',
    precisaChave: true,
    console: 'https://platform.openai.com/api-keys',
    legenda: true,
  },
  gemini: {
    id: 'gemini',
    nome: 'Google Gemini',
    base: 'https://generativelanguage.googleapis.com/v1beta/openai',
    modelo: 'gemini-flash-lite-latest',
    precisaChave: true,
    console: 'https://aistudio.google.com/app/apikey',
  },
  openrouter: {
    id: 'openrouter',
    nome: 'OpenRouter',
    base: 'https://openrouter.ai/api/v1',
    modelo: 'meta-llama/llama-3.3-70b-instruct:free',
    precisaChave: true,
    console: 'https://openrouter.ai/keys',
  },
  deepseek: {
    id: 'deepseek',
    nome: 'DeepSeek',
    base: 'https://api.deepseek.com/v1',
    modelo: 'deepseek-chat',
    precisaChave: true,
    console: 'https://platform.deepseek.com/api_keys',
  },
  cerebras: {
    id: 'cerebras',
    nome: 'Cerebras',
    base: 'https://api.cerebras.ai/v1',
    modelo: 'llama-3.3-70b',
    precisaChave: true,
    console: 'https://cloud.cerebras.ai',
  },
  custom: {
    id: 'custom',
    nome: 'Ollama / endpoint próprio',
    /**
     * Sem endereço padrão de propósito. Com `http://localhost:11434/v1` aqui,
     * este provedor passava a valer sozinho (não pede chave) e o app anunciava
     * "usando IA local" mesmo sem nada configurado — mentira silenciosa, o
     * mesmo defeito que estamos consertando na legenda.
     */
    base: '',
    modelo: 'llama3.2',
    precisaChave: false,
  },
};

export const ORDEM_PADRAO: ProviderId[] = [
  'groq',
  'openai',
  'gemini',
  'openrouter',
  'deepseek',
  'cerebras',
  'custom',
];

export type AiCfg = {
  /** quem tenta primeiro */
  preferido: ProviderId;
  chaves: Partial<Record<ProviderId, string>>;
  modelos: Partial<Record<ProviderId, string>>;
  /** só do provedor "custom" */
  baseCustom?: string;
  /** desliga a reserva automática: usa só o preferido */
  semReserva?: boolean;
};

const STORAGE = 'plasma_ai_cfg';

const VAZIO: AiCfg = { preferido: 'groq', chaves: {}, modelos: {} };

let cache: AiCfg | null = null;
const ouvintes = new Set<() => void>();

export function lerCfg(): AiCfg {
  if (cache) return cache;
  try {
    const cru = localStorage.getItem(STORAGE);
    cache = cru ? { ...VAZIO, ...(JSON.parse(cru) as AiCfg) } : { ...VAZIO };
  } catch {
    cache = { ...VAZIO };
  }
  return cache;
}

export function salvarCfg(patch: Partial<AiCfg>) {
  const novo = { ...lerCfg(), ...patch };
  cache = novo;
  try {
    localStorage.setItem(STORAGE, JSON.stringify(novo));
  } catch {
    /* navegador sem espaço: a configuração vale só nesta sessão */
  }
  ouvintes.forEach((f) => f());
  return novo;
}

export function guardarChave(id: ProviderId, chave: string) {
  const cfg = lerCfg();
  const chaves = { ...cfg.chaves };
  if (chave.trim()) chaves[id] = chave.trim();
  else delete chaves[id];
  return salvarCfg({ chaves });
}

export function apagarTudo() {
  cache = { ...VAZIO };
  try {
    localStorage.removeItem(STORAGE);
  } catch {
    /* nada a fazer */
  }
  ouvintes.forEach((f) => f());
}

export function assinarCfg(f: () => void) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

export type Alvo = {
  id: ProviderId;
  nome: string;
  url: string;
  chave: string;
  modelo: string;
};

function montar(id: ProviderId, cfg: AiCfg): Alvo | null {
  const p = PRESETS[id];
  if (!p) return null;
  const chave = (cfg.chaves[id] ?? '').trim();
  const base = (id === 'custom' ? cfg.baseCustom || '' : p.base).replace(/\/+$/, '');
  if (p.precisaChave && !chave) return null;
  if (id === 'custom' && !base) return null;
  return {
    id,
    nome: p.nome,
    url: `${base}/chat/completions`,
    chave: chave || 'sem-chave',
    modelo: cfg.modelos[id] || p.modelo,
  };
}

/**
 * Lista de destinos em ordem de preferência: o escolhido primeiro, depois toda
 * chave já configurada como reserva. Provedor explícito devolve só ele.
 */
export function alvos(provider: ProviderId | 'auto' = 'auto', cfg = lerCfg()): Alvo[] {
  if (provider !== 'auto') {
    const a = montar(provider, cfg);
    return a ? [a] : [];
  }
  const ordem = cfg.semReserva ? [cfg.preferido] : [cfg.preferido, ...ORDEM_PADRAO];
  const vistos = new Set<ProviderId>();
  const lista: Alvo[] = [];
  for (const id of ordem) {
    if (vistos.has(id)) continue;
    vistos.add(id);
    const a = montar(id, cfg);
    if (a) lista.push(a);
  }
  return lista;
}

/** Existe alguma IA utilizável configurada? */
export function temChave(cfg = lerCfg()) {
  return alvos('auto', cfg).length > 0;
}

/** Erro cru da API vira frase que a pessoa entende — e sabe o que fazer. */
export function erroAmigavel(err: unknown, nome = 'a IA'): Error {
  const m = (err instanceof Error ? err.message : String(err ?? '')).toLowerCase();
  if (m.includes('failed to fetch') || m.includes('sem resposta') || m.includes('networkerror'))
    return new Error(`🌐 Não consegui falar com ${nome} agora — confira se o serviço está no ar e sua conexão.`);
  if (m.includes('api key') || m.includes('unauthorized') || m.includes('authentication') || m.includes('401') || m.includes('invalid_api_key'))
    return new Error(`🔑 A chave de ${nome} não foi aceita — confira na Central de chaves e toque em "Testar conexão".`);
  if (m.includes('credit') || m.includes('quota') || m.includes('insufficient') || m.includes('billing') || m.includes('402'))
    return new Error(`💳 Os créditos de ${nome} parecem ter acabado — confira sua conta ou troque de provedor.`);
  if (m.includes('404') || m.includes('model_not_found') || m.includes('does not exist'))
    return new Error(`📦 O modelo escolhido não existe mais em ${nome} — abra a Central de chaves e escolha outro.`);
  if (m.includes('429') || m.includes('rate limit'))
    return new Error(`⏳ ${nome} está no limite de uso por minuto — tente daqui a pouco ou configure uma chave reserva.`);
  return new Error(`❌ ${nome} não respondeu direito agora. Toque em "Testar conexão" na Central de chaves.`);
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type ChamarOpts = {
  system?: string;
  provider?: ProviderId | 'auto';
  maxTokens?: number;
  temperature?: number;
  /** para a interface avisar "tentando a reserva…" */
  aoTrocar?: (nome: string) => void;
  sinal?: AbortSignal;
};

/**
 * Uma pergunta, vários provedores. Tenta o preferido; se ele cair, passa para a
 * reserva. Dentro de cada um: 429 espera o tempo que o próprio provedor indica,
 * e 400 por parâmetro recusado tira o parâmetro e refaz — em vez de manter uma
 * lista de qual modelo é chato com o quê.
 */
export async function chamarIA(prompt: string, opts: ChamarOpts = {}): Promise<string> {
  const lista = alvos(opts.provider ?? 'auto');
  if (!lista.length) throw new Error('🔑 Nenhuma chave de IA configurada — abra a Central de chaves.');

  let ultimo: unknown = null;
  for (let i = 0; i < lista.length; i++) {
    const alvo = lista[i];
    if (i > 0) opts.aoTrocar?.(alvo.nome);
    const corpo: Record<string, unknown> = {
      model: alvo.modelo,
      max_tokens: opts.maxTokens ?? 800,
      temperature: opts.temperature ?? 0.6,
      messages: [
        ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
        { role: 'user', content: prompt },
      ],
    };

    try {
      for (let tentativa = 0; tentativa < 4; tentativa++) {
        const res = await fetch(alvo.url, {
          method: 'POST',
          signal: opts.sinal,
          headers: { Authorization: `Bearer ${alvo.chave}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo),
        }).catch(() => {
          throw new Error(`${alvo.nome}: sem resposta — failed to fetch`);
        });

        if (res.status === 429 && tentativa < 2) {
          const e = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
          const m = /try again in (?:(\d+)m)?([\d.]+)s/i.exec(e.error?.message ?? '');
          const s = Math.min(90, m ? (Number(m[1] || 0) * 60 + parseFloat(m[2]) + 1) : 15);
          await espera(s * 1000);
          continue;
        }

        if (!res.ok) {
          const e = (await res.json().catch(() => ({}))) as { error?: { message?: string }; message?: string };
          const msg = e.error?.message || e.message || `${alvo.nome}: ${res.status}`;
          if (res.status === 400 && tentativa < 3) {
            if (/temperature/i.test(msg) && 'temperature' in corpo) {
              delete corpo.temperature;
              continue;
            }
            if (/max_tokens/i.test(msg) && 'max_tokens' in corpo) {
              corpo.max_completion_tokens = corpo.max_tokens;
              delete corpo.max_tokens;
              continue;
            }
          }
          throw new Error(`${msg} (${res.status})`);
        }

        const d = (await res.json()) as {
          choices?: { message?: { content?: string | null; reasoning?: string | null } }[];
        };
        const bruto = d.choices?.[0]?.message?.content ?? '';
        // Alguns modelos embutem o rascunho do raciocínio no texto. Sem tirar,
        // a pessoa lê o modelo pensando em voz alta em vez da resposta.
        const texto = bruto.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        if (!texto) throw new Error(`${alvo.nome}: resposta vazia`);
        return texto;
      }
      throw new Error(`${alvo.nome}: limite de tentativas`);
    } catch (e) {
      ultimo = e;
      if (opts.sinal?.aborted) throw e;
      // provedor caiu: segue para a reserva
    }
  }
  throw erroAmigavel(ultimo, lista[0]?.nome);
}

export type ResultadoTeste = { ok: boolean; mensagem: string; modelos?: string[] };

/** Testa a chave de verdade: pergunta a lista de modelos do provedor. */
export async function testarChave(
  id: ProviderId,
  chave: string,
  baseCustom?: string,
): Promise<ResultadoTeste> {
  const p = PRESETS[id];
  const base = (id === 'custom' ? baseCustom || p.base : p.base).replace(/\/+$/, '');
  try {
    const res = await fetch(`${base}/models`, {
      headers: chave ? { Authorization: `Bearer ${chave}` } : {},
    }).catch(() => {
      throw new Error('failed to fetch');
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const d = (await res.json()) as { data?: { id?: string }[] };
    const modelos = (d.data ?? []).map((m) => m.id).filter(Boolean) as string[];
    return {
      ok: true,
      mensagem: modelos.length
        ? `Chave aceita — ${modelos.length} modelos disponíveis.`
        : 'Chave aceita.',
      modelos: modelos.sort(),
    };
  } catch (e) {
    return { ok: false, mensagem: erroAmigavel(e, p.nome).message };
  }
}
