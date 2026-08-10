-- ═══════════════════════════════════════════════════════════════════════════
-- Legendas em mais idiomas além de PT e EN
--
-- Hoje a tabela recusa qualquer outro idioma por causa de uma restrição no
-- banco. Sem rodar isto, adicionar espanhol falha na hora de salvar, mesmo
-- que a tela ofereça a opção.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.subtitles DROP CONSTRAINT IF EXISTS subtitles_language_check;

ALTER TABLE public.subtitles
  ADD CONSTRAINT subtitles_language_check
  CHECK (language IN ('pt', 'en', 'es', 'fr', 'de', 'it'));

-- Depois disto, ainda faltam DUAS mudanças no código (só o SQL não basta):
--
--   1. supabase/functions/translate-subtitles/index.ts
--      O schema de validação aceita apenas pt/en:
--          from: z.enum(["pt","en"])  →  precisa incluir os novos
--          to:   z.enum(["pt","en"])
--      E `langName()` precisa saber o nome de cada idioma novo.
--
--   2. src/hooks/useSubtitles.ts
--      `useTranslateSubtitle` manda `{ from: 'pt', to: 'en' }` fixo no código,
--      e `useSubtitles` devolve só { pt, en }. Ambos precisam virar lista.
--
-- Sem os dois passos acima, a restrição fica mais larga mas a tela continua
-- só traduzindo para inglês.
