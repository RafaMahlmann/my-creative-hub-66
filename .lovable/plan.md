# Plano: Área de Cursos "Burnstore" no Site do Terapeuta

## Visão geral
Transformar a aba **Curso** (hoje um card em branco na seção Serviços) em uma área de membros completa dentro do site atual, com experiência visual entre Hotmart (catálogo + aula) e Jellyflix (navegação fluida em catálogo de vídeos). O conteúdo será hospedado no Vimeo, com aulas gratuitas de isca e módulos pagos. Cada módulo terá um tutor de IA que conhece apenas o conteúdo daquele módulo, e o aluno poderá fazer perguntas por voz usando a lógica de áudio adaptada do Meutranscritor.

## Decisões já tomadas
- Escopo: aba "Curso" no site atual (não app separado no MVP).
- Monetização: freemium — vídeos/apostilas gratuitas + conteúdo pago desbloqueável.
- IA: tutor por curso/módulo, não assistente geral.
- MVP: catálogo de cursos, player de vídeo do Vimeo, apostilas, tutor de IA por módulo e interação por voz.

## O que não está no MVP inicial
- Pagamentos integrados (será adicionado na fase 2, após a estrutura de conteúdo estar validada).
- App mobile nativo (será web app responsivo).
- Certificados e provas.

## Arquitetura proposta

### 1. Roteamento e navegação
- Nova rota `/curso` acessível pelo item "Curso" no menu de navegação.
- Sub-rotas dentro da área de cursos:
  - `/curso` → catálogo de cursos (estilo capa/Jellyflix).
  - `/curso/:courseSlug` → página do curso com módulos e aulas.
  - `/curso/:courseSlug/:moduleSlug/:lessonSlug` → player de aula + apostila + tutor de IA + pergunta por voz.
- A navegação global do site continua visível, mas dentro da área de curso o foco é a sidebar/playlist de aulas.

### 2. Banco de dados (Lovable Cloud / Supabase)
Novas tabelas no schema `public` (com RLS, GRANTs e policies):

- `courses` — curso (título, slug, descrição, capa, status public/draft, preço, etc.).
- `modules` — módulo de um curso (título, slug, ordem, resumo).
- `lessons` — aula de um módulo (título, slug, ordem, Vimeo video_id, duração, flag `is_free`, conteúdo em markdown).
- `lesson_materials` — materiais de apoio de uma aula (nome, tipo PDF/link, URL do arquivo no Storage).
- `enrollments` — matrícula do usuário em um curso (user_id, course_id, status, data de expiração se assinatura).
- `lesson_progress` — progresso do usuário por aula (concluída, tempo assistido, última posição).
- `module_tutor_context` — texto/base de conhecimento que o tutor de IA do módulo usará.
- `chat_threads` — conversas do tutor por módulo.
- `chat_messages` — mensagens de cada conversa.

Observação: as tabelas de autenticação e papéis (`profiles`, `user_roles`) já existem e serão reaproveitadas.

### 3. Controle de acesso freemium
- Aulas marcadas como `is_free = true` podem ser assistidas por qualquer visitante logado ou não.
- Aulas pagas exigem `enrollments` válido para o curso.
- O player nunca expõe a URL direta do Vimeo no front-end de forma insegura: usamos o embed do Vimeo com `video_id` público apenas para aulas gratuitas; para aulas pagas, o `video_id` é carregado via backend apenas se o usuário tiver matrícula.
- Vimeo Pro/Business recomendado: privacidade de domínio, senha de embed e restrição de download para proteger conteúdo pago.

### 4. Player e experiência de aula
- Layout dividido em três colunas em desktop:
  - Esquerda: playlist de módulos/aulas com progresso.
  - Centro: player do Vimeo + título/descrição + botão "Marcar como concluída".
  - Direita: abas "Apostila", "Tutor de IA" e "Perguntar por voz".
- Em mobile: abas inferiores ou acordeão (Player, Conteúdo, Apostila, Tutor, Voz).
- Player responsivo com iframe nativo do Vimeo.

### 5. Tutor de IA por módulo
- Cada módulo tem um contexto fixo (`module_tutor_context`) com resumo do conteúdo, transcrição ou notas do instrutor.
- O tutor é um chat por módulo, não por aula, para manter contexto amplo.
- Implementação via Supabase Edge Function usando Lovable AI Gateway:
  - Recebe pergunta + histórico da thread + contexto do módulo.
  - Responde apenas sobre o conteúdo daquele módulo/curso.
  - Respostas em português, tom calmo e acolhedor, alinhado à identidade visual do site.
- Histórico salvo em `chat_threads` + `chat_messages` para o usuário logado.

### 6. Interação por voz (adaptado do Meutranscritor)
- Reaproveitar a lógica de gravação de áudio do Meutranscritor:
  - `navigator.mediaDevices.getUserMedia` para capturar o microfone.
  - `MediaRecorder` para gravar em `audio/webm` (Chrome/Firefox) ou `audio/mp4` (Safari).
  - `AudioContext` + `AnalyserNode` para o medidor VU (ondinha visual durante a gravação).
- Converter para React:
  - Hook `useAudioRecorder` com estados `idle | recording | processing`.
  - Componente `VoiceRecorder` com botão de gravar, timer e visualização VU.
- Fluxo de uso na aula:
  - Aluno segura/clica no botão de microfone e fala a pergunta.
  - Áudio é enviado para uma Edge Function `transcribe-audio`.
  - Edge Function usa Lovable AI Gateway (modelo `openai/gpt-4o-transcribe` ou similar) para converter fala em texto.
  - Texto transcrito é inserido automaticamente no campo de pergunta do tutor de IA.
  - Aluno envia a pergunta e recebe resposta do tutor.
- Diferença em relação ao Meutranscritor original:
  - No Meutranscritor, a chave da API fica no navegador do usuário (BYOK).
  - Aqui, a chave fica no backend (Lovable AI Gateway) e a Edge Function gerencia a transcrição.
  - O áudio não fica armazenado localmente; é processado e descartado (ou armazenado brevemente se necessário para logs).

### 7. Painel do Criador (estilo "Área de Produtor" do Hotmart)
Esta é a sua experiência como dono do conteúdo. Não é um formulário técnico: é um painel com cara de aplicativo, onde você vê o mesmo layout que o aluno vê e edita ali dentro.

Acesso: rota `/curso/admin`, liberada apenas para quem tem papel `admin` (reaproveita o login secreto pela foto de perfil já existente).

**7.1 — Dashboard inicial do criador**
- Visão geral em cards: total de cursos, aulas publicadas, rascunhos, alunos matriculados, aulas mais assistidas.
- Botão grande "Novo curso".
- Lista de cursos em grade com miniatura da capa, status (Publicado / Rascunho) e menu de ações (Editar, Duplicar, Pré-visualizar, Arquivar).

**7.2 — Editor de curso (estrutura em árvore, arrastar e soltar)**
- Coluna esquerda: árvore Curso → Módulos → Aulas, com arrastar e soltar para reordenar (usando `@dnd-kit`).
- Botões inline "+ Novo módulo" e "+ Nova aula" dentro de cada nível.
- Cada item mostra um selo: 🔓 Gratuita / 🔒 Paga / 📝 Rascunho.
- Coluna direita: o editor do item selecionado, sem sair da tela.

**7.3 — Editor de aula (o coração do painel)**
Abas dentro do editor de aula, imitando o padrão Hotmart:
- **Vídeo**: campo para colar o link ou ID do Vimeo. Assim que colar, o player já aparece embutido para você conferir. Campo de duração preenchido automaticamente quando possível.
- **Conteúdo**: título, subtítulo e descrição em editor de texto rico (negrito, listas, links).
- **Materiais**: área de arrastar arquivos (PDF, imagens) que sobem para o Storage e viram lista de downloads na aula.
- **Acesso**: alternador Gratuita / Paga, e data de liberação programada (drip content) se você quiser soltar aula por aula.
- **Tutor de IA**: caixa de texto com o contexto que a IA daquele módulo vai dominar, mais um botão "Gerar contexto a partir da transcrição do vídeo" (usa a transcrição por IA).

**7.4 — Preview ao vivo lado a lado**
- Botão alternador no topo: **Editar | Pré-visualizar**.
- No modo Pré-visualizar, a mesma tela mostra exatamente o que o aluno vê (player, sidebar, apostila, tutor), sem precisar abrir outra aba nem sair do painel.
- Em telas largas, opção "Dividir tela": editor à esquerda, preview do aluno à direita, atualizando conforme você digita.
- Seletor "Ver como": Visitante / Aluno gratuito / Aluno pago — para conferir o que cada perfil enxerga.

**7.5 — Salvamento e segurança de edição**
- Salvamento automático com indicador discreto ("Salvo às 14:32").
- Botão "Publicar" separado de "Salvar rascunho": nada aparece para o aluno até você publicar.
- Confirmação antes de sair com alterações não salvas.

**7.6 — Aparência**
- Interface do painel com cara de aplicativo: sidebar fixa, cabeçalho com breadcrumb (Curso › Módulo › Aula), cards suaves, transições curtas.
- Mesma paleta sálvia/cream do site, para não parecer um painel genérico colado por cima.


### 8. Identidade visual
- Manter a paleta atual (sálvia/cream) e tipografia Cormorant Garamond + Nunito Sans.
- Área de curso terá aparência mais "app": cards com hover, transições suaves, sidebar fixa, player centralizado.
- Não usar gradientes genéricos; seguir o estilo calmo e minimalista já estabelecido.

## Fases de implementação

### Fase 1 — Estrutura e catálogo (sem pagamento)
1. Criar tabelas: `courses`, `modules`, `lessons`, `lesson_materials`.
2. Criar rota `/curso` e página de catálogo.
3. Criar página de curso com lista de módulos/aulas.
4. Criar player de aula com Vimeo (apenas aulas gratuitas inicialmente).
5. Criar painel admin para gerenciar cursos, módulos e aulas.

### Fase 2 — Acesso pago e matrículas
1. Criar tabelas `enrollments` e `lesson_progress`.
2. Implementar controle de acesso (free vs paid).
3. Integrar pagamentos (Paddle ou Stripe, a definir na fase 2).
4. Criar página "Minhas Matrículas" para o aluno.

### Fase 3 — Tutor de IA
1. Criar tabelas `module_tutor_context`, `chat_threads`, `chat_messages`.
2. Criar Edge Function para o tutor de IA por módulo.
3. Criar interface de chat na página de aula.
4. Permitir que admin edite o contexto de cada módulo.

### Fase 4 — Pergunta por voz
1. Criar hook/componente de gravação de áudio adaptado do Meutranscritor.
2. Criar Edge Function `transcribe-audio` usando Lovable AI Gateway.
3. Integrar botão de voz no chat do tutor de IA.
4. Testar em Chrome, Safari e mobile.

### Fase 5 — Polimento
1. Progresso do aluno (barra de conclusão, continuar assistindo).
2. Busca de aulas.
3. Notificações e lembretes.
4. Otimizações mobile e PWA leve.

## Próximos passos imediatos
1. Aprovar este plano atualizado.
2. Definir nome final do projeto (Burnstore, Brainstore ou outro).
3. Criar conta Vimeo Pro/Business e configurar privacidade de domínio.
4. Preparar o primeiro curso piloto: título, módulos, aulas gratuitas e apostilas.

## Nota importante
Nenhuma alteração de código será feita neste projeto sem a autorização explícita "PODE CODAR". Este plano serve para alinharmos a arquitetura antes de começar a implementar.
