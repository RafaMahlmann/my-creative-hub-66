import { useSyncExternalStore } from 'react';
import { assinarCfg, lerCfg, type AiCfg } from '@/lib/aiProviders';

/**
 * A configuração de chaves como estado de React. Fica fora do React de
 * propósito (é um módulo simples), porque quem lê ela também são funções soltas
 * — `chamarIA` não é um componente.
 */
export function useAiCfg(): AiCfg {
  return useSyncExternalStore(
    (f) => {
      const parar = assinarCfg(f);
      return () => {
        parar();
      };
    },
    lerCfg,
    lerCfg,
  );
}
