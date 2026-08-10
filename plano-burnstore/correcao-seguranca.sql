-- ═══════════════════════════════════════════════════════════════════════════
-- Correções de segurança — auditoria de 09/08/2026
--
-- Contexto: a chave publishable do Supabase está num repositório PÚBLICO
-- (o .env é versionado). Isso é normal no modelo Supabase — a chave é feita
-- para ficar no navegador — mas significa que TUDO que o papel `anon`
-- consegue ler está, na prática, aberto na internet.
--
-- O que a auditoria testou de verdade, com a chave anônima:
--   ESCRITA anônima .......... bloqueada em todas as tabelas ✔
--   Dados de aluno ........... protegidos (consents, enrollments,
--                              lesson_progress, chat_threads/messages) ✔
--   LEITURA anônima .......... dois vazamentos reais, corrigidos abaixo ✘
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- 1) CRÍTICO — operator_settings expunha o CPF do responsável
--
-- A policy era `FOR SELECT USING (true)`, sem restrição de papel. Qualquer
-- pessoa na internet lia nome completo, CPF e e-mail do responsável pelo site
-- — numa tabela criada justamente para cumprir a LGPD.
--
-- Único consumidor é o fluxo de consentimento (useStudentConsent →
-- fetchOperatorSettings), que sempre roda com o aluno logado. Restringir a
-- `authenticated` fecha o vazamento sem quebrar nada.
-- ───────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "operator readable" ON public.operator_settings;

CREATE POLICY "operator readable by authenticated"
  ON public.operator_settings
  FOR SELECT TO authenticated
  USING (true);

REVOKE SELECT ON public.operator_settings FROM anon;


-- ───────────────────────────────────────────────────────────────────────────
-- 2) IMPORTANTE — videos expunha campos internos do editor
--
-- `source_path` entregava o caminho do arquivo na máquina do editor
-- (ex.: D:\Videos\Burnstore\aula01_boas_vindas.mp4) e `source_note` entregava
-- anotações de produção (ex.: "Regravar a introdução"). O próprio plano diz
-- que são campos "visíveis apenas para admin/editor — nunca ao aluno".
--
-- RLS filtra LINHAS, não COLUNAS. Para restringir coluna é preciso trocar o
-- GRANT de tabela inteira por um GRANT coluna a coluna.
--
-- As colunas concedidas abaixo cobrem todas as consultas públicas existentes
-- (useCourses, useCourseDetail, useFreeLessons, useLesson). O papel
-- `authenticated` mantém o GRANT completo, então o painel de admin segue
-- funcionando sem alteração.
-- ───────────────────────────────────────────────────────────────────────────
REVOKE SELECT ON public.videos FROM anon;

GRANT SELECT (
  id,
  title_pt,
  title_en,
  provider,
  ref,
  duration_seconds,
  is_free,
  thumb_url
) ON public.videos TO anon;


-- ═══════════════════════════════════════════════════════════════════════════
-- NÃO corrigido aqui — precisa de mudança de arquitetura, não de policy
-- ═══════════════════════════════════════════════════════════════════════════
--
-- a) O PAYWALL É COSMÉTICO. O bloqueio da aula paga acontece só no front
--    (`locked` esconde o player). Mas a policy pública de `videos` libera
--    qualquer vídeo de aula publicada, sem olhar `is_free` — então o `ref`
--    (o ID do Vimeo) de uma aula paga chega ao navegador e sai numa consulta
--    direta à API. Hoje é inofensivo: os refs são placeholders e não há
--    conteúdo pago real. Precisa estar resolvido ANTES de entrar aluno
--    pagante. Solução prevista: Etapa E do plano-servidor-local.md — link
--    assinado com expiração, entregue pelo backend só a quem tem matrícula.
--
-- b) Aluno logado ainda enxerga `source_path`/`source_note`. O REVOKE acima
--    cobre `anon`, que é o vetor real (chave pública no GitHub). Fechar
--    também para `authenticated` exige mover esses campos para uma tabela
--    própria com RLS de admin — vale fazer, mas é refatoração, não hotfix.
--
-- c) A auto-matrícula está BEM desenhada e não precisa de correção: a policy
--    só aceita INSERT com `source = 'free'`, e `hasPremiumAccess` exige
--    `source !== 'free'`. Um aluno não consegue se conceder acesso premium.
