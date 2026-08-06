# Plano: Área de Cursos "Burnstore" no Site do Terapeuta

## Visão geral
Transformar a aba **Curso** (hoje um card em branco na seção Serviços) em uma área de membros completa dentro do site atual, com experiência visual entre Hotmart (catálogo + aula) e Jellyflix (navegação fluida em catálogo de vídeos). O conteúdo será hospedado no Vimeo, com aulas gratuitas de isca e módulos pagos. Cada módulo terá um tutor de IA que conhece apenas o conteúdo daquele módulo.

## Decisões já tomadas
- Escopo: aba "Curso" no site atual (não app separado no MVP).
- Monetização: freemium — vídeos/apostilas gratuitas + conteúdo pago desbloqueável.
- IA: tutor por curso/módulo, não assistente geral.
- MVP: catálogo de cursos, player de vídeo do Vimeo, apostilas e tutor de IA por módulo.

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
  - `/curso/:courseSlug/:moduleSlug/:lessonSlug` → player de aula + apostila + tutor de IA.
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
  - Direita: abas "Apostila" e "Tutor de IA".
- Em mobile: abas inferiores ou acordeão (Player, Conteúdo, Apostila, Tutor).
- Player responsivo com `react-player` ou iframe nativo do Vimeo.

### 5. Tutor de IA por módulo
- Cada módulo tem um contexto fixo (`module_tutor_context`) com resumo do conteúdo, transcrição ou notas do instrutor.
- O tutor é um chat por módulo, não por aula, para manter contexto amplo.
- Implementação via Supabase Edge Function usando Lovable AI Gateway:
  - Recebe pergunta + histórico da thread + contexto do módulo.
  - Responde apenas sobre o conteúdo daquele módulo/curso.
  - Respostas em português, tom calmo e acolhedor, alinhado à identidade visual do site.
- Histórico salvo em `chat_threads` + `chat_messages` para o usuário logado.

### 6. Painel administrativo
- Reaproveitar o modo de edição existente (acesso secreto pela foto de perfil + login admin).
- Nova seção "Gerenciar Cursos" no modo admin:
  - CRUD de cursos, módulos e aulas.
  - Upload de capas e apostilas para o Storage bucket `hero-assets` ou novo bucket `course-assets`.
  - Editor de contexto do tutor de IA por módulo.
  - Visualização de matrículas e progresso (futuro).

### 7. Identidade visual
- Manter a paleta atual (sálvia/cream) e tipografia Cormorant Garamond + Nunito Sans.
- Área de curso terá aparência mais "app": cards com hover, transições suaves, sidebar fixa, player centralizado.
- Não usar gradientes genéricos; seguir o estilo calmo e minimalista já estabelecido.

### 8. Fases de implementação

#### Fase 1 — Estrutura e catálogo (sem pagamento)
1. Criar tabelas: `courses`, `modules`, `lessons`, `lesson_materials`.
2. Criar rota `/curso` e página de catálogo.
3. Criar página de curso com lista de módulos/aulas.
4. Criar player de aula com Vimeo (apenas aulas gratuitas inicialmente).
5. Criar painel admin para gerenciar cursos, módulos e aulas.

#### Fase 2 — Acesso pago e matrículas
1. Criar tabelas `enrollments` e `lesson_progress`.
2. Implementar controle de acesso (free vs paid).
3. Integrar pagamentos (Paddle ou Stripe, a definir na fase 2).
4. Criar página "Minhas Matrículas" para o aluno.

#### Fase 3 — Tutor de IA
1. Criar tabelas `module_tutor_context`, `chat_threads`, `chat_messages`.
2. Criar Edge Function para o tutor de IA por módulo.
3. Criar interface de chat na página de aula.
4. Permitir que admin edite o contexto de cada módulo.

#### Fase 4 — Polimento
1. Progresso do aluno (barra de conclusão, continuar assistindo).
2. Busca de aulas.
3. Notificações e lembretes.
4. Otimizações mobile e PWA leve.

## Próximos passos imediatos
1. Aprovar este plano.
2. Definir nome final do projeto (Burnstore, Brainstore ou outro).
3. Criar conta Vimeo Pro/Business e configurar privacidade de domínio.
4. Preparar o primeiro curso piloto: título, módulos, aulas gratuitas e apostilas.

## Nota importante
Nenhuma alteração de código será feita neste projeto sem a autorização explícita "PODE CODAR". Este plano serve para alinharmos a arquitetura antes de começar a implementar.
