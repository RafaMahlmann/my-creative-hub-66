import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyRound,
  Check,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  Star,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { HelpCard } from '@/components/course/HelpCard';
import {
  ORDEM_PADRAO,
  PRESETS,
  alvos,
  apagarTudo,
  guardarChave,
  salvarCfg,
  testarChave,
  type ProviderId,
} from '@/lib/aiProviders';
import { useAiCfg } from '@/hooks/useAiKeys';
import { enviarChaveLocal, useServidorLocal } from '@/hooks/useServidorLocal';

type Estado = { testando?: boolean; ok?: boolean; msg?: string; modelos?: string[] };

/**
 * Uma chave resolve tudo — e trocar é um clique.
 *
 * A mesma chave que gera a legenda no servidor do HD serve para limpar o texto
 * da apostila, para o tutor do módulo e para traduzir PT↔EN. Por isso a Central
 * é uma tela só: quem guarda a chave aqui destrava as quatro coisas de uma vez.
 * E como cada provedor é só endereço + chave + modelo, dá para ter várias
 * guardadas e alternar entre elas quando quiser.
 */
export const CentralDeChaves = () => {
  const { t } = useTranslation();
  const cfg = useAiCfg();
  const { ligado } = useServidorLocal();
  const [estado, setEstado] = useState<Record<string, Estado>>({});
  const [visivel, setVisivel] = useState<Record<string, boolean>>({});
  const [rascunho, setRascunho] = useState<Record<string, string>>({});

  const ativos = alvos('auto', cfg);
  const nomeAtivo = ativos[0]?.nome;

  const valorChave = (id: ProviderId) => rascunho[id] ?? cfg.chaves[id] ?? '';

  const testar = async (id: ProviderId) => {
    setEstado((s) => ({ ...s, [id]: { testando: true } }));
    const r = await testarChave(id, valorChave(id).trim(), cfg.baseCustom);
    setEstado((s) => ({ ...s, [id]: { ok: r.ok, msg: r.mensagem, modelos: r.modelos } }));
    if (r.ok) {
      guardarChave(id, valorChave(id));
      toast.success(t('chaves.testeOk', { nome: PRESETS[id].nome }));
    } else {
      toast.error(r.mensagem);
    }
  };

  const mandarProServidor = async (id: ProviderId) => {
    const r = await enviarChaveLocal(id, valorChave(id).trim());
    if (r.ok) toast.success(t('chaves.servidorRecebeu'));
    else if (r.naoSuportado) toast.info(t('chaves.servidorAntigo'));
    else toast.error(r.erro ?? t('chaves.servidorFalhou'));
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <KeyRound className="h-5 w-5 text-course-primary" />
        <h2 className="font-display text-xl font-semibold">{t('chaves.titulo')}</h2>
        {nomeAtivo ? (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-body text-xs text-emerald-300">
            {t('chaves.usando', { nome: nomeAtivo })}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 font-body text-xs text-amber-300">
            <AlertTriangle className="h-3 w-3" /> {t('chaves.nenhuma')}
          </span>
        )}
      </div>

      <HelpCard id="chaves" collapsed />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-course-border bg-course-card p-4">
        <div className="min-w-[16rem] flex-1">
          <p className="font-body text-sm text-course-foreground">{t('chaves.reservaTitulo')}</p>
          <p className="mt-0.5 font-body text-xs text-course-muted-foreground">
            {t('chaves.reservaTexto')}
          </p>
        </div>
        <label className="flex items-center gap-3 font-body text-sm">
          {cfg.semReserva ? t('chaves.reservaOff') : t('chaves.reservaOn')}
          <Switch
            checked={!cfg.semReserva}
            onCheckedChange={(v) => salvarCfg({ semReserva: !v })}
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {ORDEM_PADRAO.map((id) => {
          const p = PRESETS[id];
          const e = estado[id] ?? {};
          const guardada = !!cfg.chaves[id];
          const preferido = cfg.preferido === id;
          return (
            <article
              key={id}
              className={`rounded-xl border p-4 ${
                preferido ? 'border-course-primary/60 bg-course-primary/5' : 'border-course-border bg-course-card'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-semibold">{p.nome}</h3>
                {guardada && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-body text-[11px] text-emerald-300">
                    <Check className="h-3 w-3" /> {t('chaves.guardada')}
                  </span>
                )}
                {p.legenda && (
                  <span className="rounded-full bg-course-secondary px-2 py-0.5 font-body text-[11px] text-course-muted-foreground">
                    {t('chaves.serveLegenda')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => salvarCfg({ preferido: id })}
                  className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-[11px] ${
                    preferido
                      ? 'bg-course-primary text-course-primary-foreground'
                      : 'border border-course-border text-course-muted-foreground hover:text-course-foreground'
                  }`}
                >
                  <Star className="h-3 w-3" /> {preferido ? t('chaves.preferido') : t('chaves.usarEste')}
                </button>
              </div>

              {id === 'custom' && (
                <Input
                  value={cfg.baseCustom ?? ''}
                  onChange={(ev) => salvarCfg({ baseCustom: ev.target.value })}
                  placeholder="http://localhost:11434/v1"
                  className="mt-3 border-course-border bg-course-background font-mono text-xs text-course-foreground"
                />
              )}

              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={visivel[id] ? 'text' : 'password'}
                    value={valorChave(id)}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(ev) => setRascunho((s) => ({ ...s, [id]: ev.target.value }))}
                    onBlur={() => guardarChave(id, valorChave(id))}
                    placeholder={p.precisaChave ? t('chaves.cole') : t('chaves.semChave')}
                    className="border-course-border bg-course-background pr-9 font-mono text-xs text-course-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setVisivel((s) => ({ ...s, [id]: !s[id] }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-course-muted-foreground hover:text-course-foreground"
                    aria-label={t('chaves.ver')}
                  >
                    {visivel[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={e.testando}
                  onClick={() => testar(id)}
                  className="border-course-border bg-course-background text-course-foreground"
                >
                  {e.testando ? <Loader2 className="h-4 w-4 animate-spin" /> : t('chaves.testar')}
                </Button>
              </div>

              {e.msg && (
                <p
                  className={`mt-2 font-body text-xs ${
                    e.ok ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {e.msg}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Input
                  list={`modelos-${id}`}
                  value={cfg.modelos[id] ?? ''}
                  onChange={(ev) =>
                    salvarCfg({ modelos: { ...cfg.modelos, [id]: ev.target.value } })
                  }
                  placeholder={p.modelo}
                  className="h-8 max-w-[16rem] border-course-border bg-course-background font-mono text-xs text-course-foreground"
                />
                <datalist id={`modelos-${id}`}>
                  {(e.modelos ?? []).map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                {p.console && (
                  <a
                    href={p.console}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-body text-xs text-course-muted-foreground hover:text-course-primary"
                  >
                    <ExternalLink className="h-3 w-3" /> {t('chaves.pegarChave')}
                  </a>
                )}
                {p.legenda && ligado && guardada && (
                  <button
                    type="button"
                    onClick={() => mandarProServidor(id)}
                    className="inline-flex items-center gap-1 font-body text-xs text-course-primary hover:underline"
                  >
                    <Upload className="h-3 w-3" /> {t('chaves.mandarServidor')}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          apagarTudo();
          setRascunho({});
          setEstado({});
          toast.success(t('chaves.apagou'));
        }}
        className="inline-flex items-center gap-1.5 font-body text-xs text-course-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" /> {t('chaves.apagar')}
      </button>
    </section>
  );
};
