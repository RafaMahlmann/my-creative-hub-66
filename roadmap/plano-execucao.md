# Plano de Execução por Etapas — Burnstore (Área de Cursos)

> Documento operacional. O documento de visão é o `plano-burnstore/plano-burnstore.md`.
> Versão em inglês: `roadmap/execution-plan.en.md` (mantida em paralelo).

## Princípios de execução (valem para todas as etapas)

1. **Bilíngue desde o primeiro dia.** Nenhum texto fixo no código. Todo texto novo entra em `src/locales/pt.json` e `src/locales/en.json` na mesma etapa em que a tela é criada. Português é o idioma padrão; inglês é gerado junto (fallback para PT quando vazio).
2. **Não reinventar a roda.** Antes de escrever qualquer peça, usar biblioteca madura com licença permissiva (MIT/Apache). Lista aprovada: `react-player`, `i18next` + `react-i18next`, `@dnd-kit`, `Tiptap`, `subtitle`/`webvtt-parser`, `shadcn/ui`, `TanStack Query`, `zod`.
3. **Visual "Jellyflix".** Catálogo escuro em fileiras horizontais roláveis, capas 16:9 com hover que amplia e revela título/duração, herói com vídeo de destaque no topo, navegação por teclado, transições curtas. Dentro da aula, layout de app (sidebar + player central). A paleta sálvia/cream do site é mantida, mas com uma variante escura própria da área de curso.
4. **Cada etapa termina operacional.** Nada de etapa que só faz sentido depois da seguinte. Ao final de cada uma existe algo utilizável e testável no preview.
5. **Segurança por padrão.** Toda tabela nova nasce com RLS + GRANTs + policies na mesma migração.

---

## Etapa 0 — Fundação (meio dia)
**Objetivo:** deixar o terreno pronto para tudo que vem depois.

- Instalar dependências: `react-player`, `i18next`, `react-i18next`, `@dnd-kit/core`, `@dnd-kit/sortable`.
- Criar estrutura de idiomas (`src/i18n.ts`, `pt.json`, `en.json`) e o seletor PT/EN no cabeçalho, com preferência salva no navegador.
- Criar os tokens de design da área de curso no `index.css` (variante escura Jellyflix) sem alterar o restante do site.
- Criar a aba **Curso** no menu, apontando para `/curso` (por enquanto uma página "em breve" traduzida).

**Pronto quando:** o menu tem a aba Curso, a página abre, e o seletor de idioma troca PT/EN de verdade.

---

## Etapa 1 — Modelo de dados e conteúdo (1 dia)
**Objetivo:** existir curso, módulo, aula e vídeo no banco.

- Migração criando `courses`, `modules`, `lessons`, `videos`, `lesson_materials` com RLS, GRANTs e policies (leitura pública só para publicado; escrita só para `admin`).
- Campos bilíngues nos textos (`title_pt`/`title_en`, `description_pt`/`description_en`).
- Tabela `videos` com `provider` (vimeo/youtube/hls/file), `ref`, `duration`, `is_free`, `source_path`, `source_note`, `status` (ideia/gravado/editado/legendado/publicado).
- Inserir um curso de exemplo com dois módulos e três aulas para validar.

**Pronto quando:** os dados de exemplo aparecem numa consulta e a segurança está fechada.

---

## Etapa 2 — Catálogo Jellyflix (1–2 dias)
**Objetivo:** a vitrine pública funcionando.

- `/curso` — herói com curso destaque + fileiras horizontais roláveis ("Comece por aqui", "Gratuitos", "Todos os módulos").
- Card de curso com capa 16:9, hover ampliando, selo 🔓 Gratuito / 🔒 Pago.
- `/curso/:courseSlug` — página do curso com descrição, lista de módulos e aulas.
- Estados de carregamento com skeleton e página vazia tratada.

**Pronto quando:** um visitante navega do catálogo até a lista de aulas, em PT e EN.

---

## Etapa 3 — Player e página de aula (1–2 dias)
**Objetivo:** assistir aula gratuita de ponta a ponta.

- `/curso/:courseSlug/:moduleSlug/:lessonSlug` com layout de três colunas (playlist / player / abas laterais) e versão mobile em abas.
- Player multi-fonte com `react-player`, detectando Vimeo, YouTube, HLS ou arquivo.
- Abas laterais: **Apostila** (materiais) e espaços reservados para Tutor e Voz.
- Botão "Marcar como concluída" (guardado localmente nesta etapa).
- Bloqueio de aula paga com tela de "conteúdo exclusivo".

**Pronto quando:** dá para assistir uma aula gratuita completa e a paga mostra o bloqueio.

---

## Etapa 4 — Painel do Criador (2–3 dias) — *marco operacional*
**Objetivo:** você para de depender do desenvolvedor para publicar conteúdo.

- `/curso/admin`, restrito ao papel `admin` (reaproveita o acesso oculto pela foto de perfil).
- Dashboard com cards (cursos, aulas publicadas, rascunhos) e botão "Novo curso".
- Editor de curso: árvore Curso → Módulos → Aulas com arrastar e soltar (`@dnd-kit`).
- Editor de aula em abas: **Vídeo** (cola o link e o preview aparece; campos "Arquivo original" e observação com botão copiar), **Conteúdo** (Tiptap, abas PT | EN), **Materiais** (upload para Storage), **Acesso** (interruptor Gratuita/Paga com salvamento imediato).
- Alternador **Editar | Pré-visualizar** e seletor "Ver como" (Visitante / Aluno gratuito / Aluno pago).
- Salvamento automático com indicador e botão "Publicar" separado do rascunho.

**Pronto quando:** você cria um curso inteiro, do zero, sem tocar em código.

---

## Etapa 5 — Painel A: Biblioteca de vídeos (meio dia)
**Objetivo:** nunca mais perder um vídeo.

- Tabela única de vídeos: origem, duração, status, gratuito/pago (interruptor de um clique), "usado em" e caminho do arquivo original com botão copiar.
- Busca cobrindo título, caminho e observação; filtros por status e por origem.

**Pronto quando:** você acha qualquer vídeo em menos de dez segundos.

---

## Etapa 6 — Legendas e conteúdo em inglês (1–2 dias)
**Objetivo:** acessibilidade e alcance internacional.

- Tabela `subtitles` (vídeo, idioma, WebVTT).
- Edge Function de transcrição automática (Lovable AI Gateway) gerando WebVTT em PT.
- Tradução automática PT → EN da faixa, com revisão manual.
- Editor de legendas simples no painel (trecho, tempo, texto).
- Botão CC no player, com troca de faixa PT/EN.

**Pronto quando:** uma aula tem legenda PT e EN funcionando no player.

---

## Etapa 7 — Contas e matrículas (modelo freemium, sem gateway de pagamento) (2 dias)
**Objetivo:** aluno com conta, progresso salvo e conteúdo destravado por matrícula — sem cobrança nesta fase.

- **Decisão:** nesta etapa NÃO entra Stripe nem Paddle. O modelo é **freemium**: conteúdo gratuito aberto e conteúdo "premium" liberado por matrícula concedida (manual pelo admin ou automática ao se inscrever no curso gratuito).
- Tabelas `enrollments` e `lesson_progress` com RLS por usuário.
- Login de aluno (e-mail/senha + Google), separado do acesso oculto de admin.
- Acesso a aula premium verificado no backend; o `video_ref` restrito só é devolvido para quem tem matrícula ativa.
- Painel do criador: conceder/revogar matrícula de um aluno com um clique.
- Página "Minhas aulas" com progresso e "continuar de onde parou".

**Pronto quando:** o aluno cria conta, o admin concede matrícula e o conteúdo premium destrava, com progresso salvo.

> Cobrança (Stripe/Paddle) fica registrada como etapa futura opcional, a ser ativada só quando o catálogo justificar. A estrutura de matrícula já é compatível: basta que o pagamento crie a linha em `enrollments`.

---

## Etapa 8 — Tutor de IA por módulo (1–2 dias)
**Objetivo:** a diferença do produto.

- Tabelas `module_tutor_context`, `chat_threads`, `chat_messages`.
- Edge Function do tutor via Lovable AI Gateway, respondendo apenas sobre o módulo, no idioma escolhido pelo aluno.
- Chat na aba lateral da aula, com histórico por aluno.
- Botão no painel: "Gerar contexto a partir da transcrição" (reaproveita a Etapa 6).

**Pronto quando:** o tutor responde corretamente sobre o módulo e recusa assunto de fora.

---

## Etapa 9 — Pergunta por voz (1 dia)
**Objetivo:** interação natural, aproveitando o Meutranscritor.

- Hook `useAudioRecorder` (getUserMedia + MediaRecorder + medidor VU) adaptado do seu projeto.
- Componente `VoiceRecorder` com botão, timer e ondinha.
- Edge Function `transcribe-audio` (chave no backend, nunca no navegador).
- O texto transcrito cai no campo do tutor; o aluno confere e envia.

**Pronto quando:** dá para perguntar falando e receber resposta do tutor.

---

## Etapa 10 — Painel B (Produção) e Painel C (Números) (1–2 dias)
**Objetivo:** operação sem se perder.

- **Painel B:** kanban Ideia → Gravado → Editado → Legendado → Publicado, arrastável, alimentado pela tabela `videos`.
- **Painel C:** visitas por página/aula (Umami ou Plausible), aulas mais assistidas, matrículas do mês. Somente leitura.

**Pronto quando:** você enxerga produção e números em uma tela só.

---

## Etapa 11 — Acabamento e lançamento (1 dia)
- Revisão completa PT/EN (nenhum texto fora dos arquivos de idioma).
- SEO da área de curso: títulos, descrições, JSON-LD de `Course`, canônicos e `hreflang` PT/EN.
- Desempenho: carregamento sob demanda das rotas de curso e do painel, imagens preguiçosas.
- Teste dos três perfis (visitante, aluno gratuito, aluno pago) e revisão de segurança das policies.
- Publicação.

---

## Ordem resumida

```text
0 Fundação → 1 Dados → 2 Catálogo → 3 Aula → 4 Painel do Criador  ← já é operacional
        → 5 Biblioteca → 6 Legendas/EN → 7 Pagamento → 8 Tutor IA
        → 9 Voz → 10 Painéis B/C → 11 Lançamento
```

**Mínimo para o produto existir:** Etapas 0 a 4.
**Mínimo para vender:** + Etapa 7 (freemium; cobrança só em etapa futura opcional).
**Diferencial competitivo:** Etapas 8 e 9.

## Regras de idioma na prática

- Interface: sempre `t('chave')`, nunca texto solto.
- Conteúdo: campos `_pt` e `_en`; se o `_en` estiver vazio, o site mostra o `_pt`.
- Legendas: faixa PT obrigatória, faixa EN gerada por tradução e revisada.
- Vídeos: falados em português; o inglês é atendido por interface + legenda.
