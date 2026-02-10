
## Corrigir foto de perfil no preview lateral (iframe)

### Problema raiz
O preview lateral do editor roda dentro de um iframe que pode ter `localStorage` isolado/particionado. Isso significa que:
1. O cache em `localStorage` salvo na aba separada nao e acessivel no iframe lateral
2. A cada hot-reload (quando o codigo muda), o componente remonta e o estado React reseta
3. Durante o fetch assincrono, o componente mostra o placeholder em vez de esperar

### Solucao

**Arquivo: `src/hooks/useSiteSettings.ts`**
- Adicionar um cache em nivel de modulo (variavel `let moduleCache`) fora do hook
- Esse cache persiste entre re-montagens do componente na mesma sessao do iframe
- Ordem de prioridade: moduleCache > localStorage > fetch do banco
- Apos cada fetch bem-sucedido, atualizar tanto moduleCache quanto localStorage
- Isso garante que mesmo sem localStorage funcional, o cache em memoria funciona

**Arquivo: `src/components/HeroSection.tsx`**
- Garantir que o skeleton (shimmer) aparece enquanto `isLoading` for true, mesmo que demore
- Nunca mostrar o icone de usuario placeholder ate o fetch completar e confirmar que nao ha foto

### Detalhes tecnicos

No `useSiteSettings.ts`:
```
// Cache em nivel de modulo - sobrevive re-montagens
let moduleCache: Record<string, string> | null = null;

function loadCache(): Record<string, string> {
  if (moduleCache) return moduleCache;
  // tenta localStorage como fallback
  try {
    const cached = localStorage.getItem("site_settings");
    if (cached) {
      moduleCache = JSON.parse(cached);
      return moduleCache;
    }
  } catch {}
  return {};
}
```

No `useState` inicial, usar `loadCache()` que prioriza o moduleCache. Apos cada fetch, salvar em `moduleCache = map` antes de tentar o localStorage.

Isso resolve o problema porque:
- O moduleCache vive na memoria do JavaScript do iframe
- Nao depende de localStorage funcionar
- Sobrevive a re-montagens de componentes (hot-reload parcial)
- So reseta quando o iframe recarrega completamente, mas ai o fetch traz os dados de volta
