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

### 9. Player multi-fonte (Vimeo, YouTube, arquivo próprio)
Em vez de amarrar cada aula ao Vimeo, cada aula guarda um **par: provedor + referência**.

- Campo `video_provider`: `vimeo` | `youtube` | `hls` | `file`.
- Campo `video_ref`: o ID ou a URL correspondente.
- No painel, você cola qualquer link (Vimeo, YouTube ou URL de arquivo/HLS) e o sistema detecta sozinho o provedor. Se errar a detecção, você troca no seletor.
- Biblioteca recomendada: **react-player v3** (MIT, ~10k estrelas, 2,2 milhões de downloads/semana, mantida ativamente). Já entrega YouTube, Vimeo, HLS, DASH e arquivo local com a mesma API, e suporta faixas de legenda.
- Alternativa se quisermos um player 100% com a nossa cara: **Vidstack Player** (MIT, mesma cobertura de provedores, mais controle visual, um pouco mais de trabalho para montar). Sugestão: começar com react-player e migrar para Vidstack só se precisarmos de skin totalmente própria.
- **Reuso do mesmo vídeo em vários lugares**: o vídeo vira um registro próprio na tabela `videos`. As aulas apontam para um vídeo por referência. Assim o mesmo vídeo pode aparecer na aula, numa página de vendas e num destaque do catálogo — e se você trocar o arquivo, troca em todos de uma vez.

### 10. Gratuito ou pago com um clique
- Na árvore de módulos/aulas do painel, cada aula tem um interruptor 🔓/🔒 que salva na hora, sem abrir formulário.
- O mesmo interruptor existe no nível do módulo ("liberar módulo inteiro") e do curso ("curso gratuito").
- Efeito imediato no preview do aluno, sem recarregar a página.

### 11. Legendas
Fluxo em três camadas, todas com base em ferramentas maduras:

1. **Geração automática**: ao subir/vincular um vídeo, uma Edge Function envia o áudio para transcrição (Lovable AI Gateway, mesmo motor da pergunta por voz) e devolve a transcrição com marcação de tempo. Isso gera um arquivo **WebVTT** — o formato padrão da web para legenda.
2. **Edição manual**: editor de legendas simples no painel, listando cada trecho com tempo de início/fim e texto, para você corrigir termos técnicos que a IA errar.
3. **Exibição**: o WebVTT é anexado ao player como faixa de legenda (`<track>`), com botão CC para ligar/desligar. Funciona igual para Vimeo, YouTube e arquivo próprio.

Bibliotecas open source a adotar em vez de escrever do zero: **subtitle** ou **webvtt-parser** (npm, MIT) para ler/escrever WebVTT e converter de/para SRT.

Bônus: a transcrição gerada aqui alimenta automaticamente o contexto do Tutor de IA daquele módulo — um trabalho só, dois resultados.

### 12. Idiomas (Português e Inglês)
- Biblioteca: **i18next + react-i18next** (MIT, padrão de mercado, muito madura).
- Todos os textos da interface saem para arquivos `pt.json` e `en.json`. Nada de texto fixo no código.
- Seletor de idioma no cabeçalho; escolha guardada no navegador e no perfil do usuário logado.
- Conteúdo do curso (título, descrição, apostila) ganha versão por idioma: o painel mostra abas PT | EN em cada campo de texto, e o que estiver vazio cai no português como padrão.
- Legendas por idioma: cada vídeo pode ter faixa PT e faixa EN. A faixa EN pode ser gerada por tradução automática da PT e depois revisada por você.
- Os vídeos continuam falados em português; o inglês é atendido por interface traduzida + legenda.

### 13. Sobre reaproveitar projetos open source prontos
Pesquisei o que existe hoje de plataforma de curso open source. O resumo honesto:

| Projeto | Estrelas | Stack | Serve para copiar inteiro? |
|---|---|---|---|
| CourseLit | ~1.200 | Next.js + MongoDB | Não — stack incompatível com este projeto (React/Vite + Cloud). Serve como referência de fluxo de produtor. |
| LearnHouse | grande | Next.js + Python/FastAPI | Não — precisa de backend Python separado. Boa referência do editor de conteúdo em blocos. |
| ClassroomIO | médio | SvelteKit | Não — framework diferente. |
| Hubfy Lite | ~27 | **React + Supabase** | Stack compatível, mas licença BSL (restringe uso comercial) e projeto muito novo. Só como referência visual. |

Conclusão: **não existe um "Hotmart open source" que dê para colar inteiro aqui** sem trocar toda a base do site (React + Vite + Lovable Cloud). O que faz sentido é o meio-termo: copiar bibliotecas maduras para as peças difíceis (player, legendas, idiomas, arrastar e soltar, editor de texto) e construir só a camada de produto — que é onde está a sua diferença. Peças que vamos adotar prontas:

- `react-player` — player multi-provedor (MIT)
- `subtitle` / `webvtt-parser` — legendas (MIT)
- `i18next` + `react-i18next` — idiomas (MIT)
- `@dnd-kit` — arrastar e soltar no painel (MIT)
- `Tiptap` — editor de texto rico das descrições (MIT)
- `shadcn/ui` — componentes de interface, já no projeto (MIT)

### 14. Decidido: hospedagem no Vimeo/YouTube + registro do caminho do arquivo original
Nada de servidor próprio por enquanto. Os vídeos ficam no Vimeo (pago/protegido) ou YouTube (gratuito), como já previsto no item 9.

O que muda: cada vídeo ganha um campo **"Arquivo original"** — um texto livre onde você, como editor, guarda o caminho do arquivo no seu computador (ex.: `D:\Cursos\Modulo2\aula-03-final.mp4`). Só registro, nenhum upload.

- Campo `source_path` (texto) e `source_note` (observação curta, opcional: disco externo, versão, data da edição) na tabela `videos`.
- Aparece na aba **Vídeo** do editor de aula e como coluna no **Painel A — Biblioteca de vídeos**.
- Botão "copiar caminho" com um clique, para colar direto no explorador de arquivos.
- Busca no Painel A cobre o caminho, então você acha por nome de pasta ou de arquivo.
- Visível apenas para admin/editor — nunca exposto ao aluno.



### 15. Painel auxiliar de operação (Central do Criador)

**Cinco projetos open source pesquisados como referência:**

| Projeto | Estrelas | O que ele resolve | Dá para integrar? |
|---|---|---|---|
| Postiz | ~34.000 | Agendamento e publicação em todas as redes, calendário visual, analytics por post | Não colar inteiro (Next.js + Redis), mas é a melhor referência de calendário e de "um card por post". Pode rodar separado e ser embutido por link. |
| Brightbean Studio | ~2.100 | Alternativa ao Buffer, self-hosted, dashboard único para 10+ redes | Não (Django/Python). Boa referência de layout de dashboard. |
| Trypost | ~465 | Agendamento focado em criador, simples | Não (Laravel/Vue). Referência de simplicidade. |
| Umami | grande | Analytics de site self-hosted, privacidade-first, painel limpo | **Sim** — dá para plugar por script e ver visitas por página/aula. Integração real e barata. |
| Plausible | grande | Mesma ideia do Umami, também self-hosted | **Sim**, alternativa ao Umami. Escolher um dos dois. |

**O que eu vejo que talvez você não esteja vendo:**

O risco aqui não é falta de painel — é excesso. Painel de campanha social é uma ferramenta de *marketing*, e ela só faz sentido quando já existe conteúdo publicado e tráfego chegando. Se construirmos isso agora, junto com o curso, você vai passar tempo alimentando tabelas vazias em vez de gravar aula. E painel desatualizado é pior que painel nenhum, porque você para de confiar nele.

O que realmente vai te fazer falta cedo não é "quantos likes o Instagram deu". É outra coisa, mais chata e mais útil:

1. **Inventário de vídeos** — você vai ter vídeo no Vimeo, no YouTube, arquivo bruto no computador, versão cortada para o Reels. Em três meses ninguém lembra qual é qual. Uma tabela `videos` com origem, status (bruto / editado / publicado), onde está usado e se é gratuito ou pago resolve 80% da dor. **E isso já está no item 9 do plano** — só precisa de uma tela listando.
2. **Onde cada vídeo aparece** — o mesmo vídeo pode estar na aula 3, num post de Instagram e na página de vendas. Uma coluna "usado em" evita você despublicar algo e quebrar três lugares sem perceber.
3. **Um checklist de lançamento por aula** — gravado / editado / legenda revisada / apostila pronta / publicado. Isso é um kanban de cinco colunas, não uma plataforma de marketing.

**Proposta concreta — "Central do Criador", uma aba, três painéis, nada além disso:**

- **Painel A — Biblioteca de vídeos**: tabela única de todos os vídeos com origem (Vimeo/YouTube/arquivo), duração, gratuito/pago com o mesmo interruptor de um clique, e "usado em" listando cada lugar. Filtro por status. É a visão que você pediu de "acompanhar a estrutura dos vídeos gratuitos".
- **Painel B — Produção (kanban)**: colunas Ideia → Gravado → Editado → Legendado → Publicado. Cada card é uma aula ou um vídeo avulso, arrastável. Usa o mesmo `@dnd-kit` do painel de curso, então custa pouco.
- **Painel C — Números**: visitas por página e por aula (via Umami ou Plausible, self-hosted), aulas mais assistidas, matrículas do mês. Somente leitura, sem configuração.

**O que fica de fora de propósito** (e por quê):
- Agendamento e publicação automática em redes sociais — exige aprovação de app em cada rede (Instagram e TikTok levam semanas) e quebra sozinho quando as APIs mudam. Se você quiser isso depois, rodamos o Postiz separado e colocamos só um link no painel.
- Métricas de Instagram/YouTube dentro do nosso painel — mesma razão. Se for necessário, começamos com campos manuais que você preenche uma vez por semana; se você não preencher duas semanas seguidas, é sinal de que não era necessário mesmo.

**Decidido**: os três painéis (A, B e C) estão aprovados e a Central do Criador vira uma aba própria. Ordem de construção: Painel A junto da Fase 1 (nasce da tabela `videos`), Painel B na Fase 6 e Painel C na Fase 6, ligado assim que houver tráfego real para medir.






## Fases de implementação

### Fase 1 — Estrutura, catálogo e Painel do Criador
1. Criar tabelas: `courses`, `modules`, `lessons`, `videos`, `lesson_materials`.
2. Criar rota `/curso` e página de catálogo.
3. Criar página de curso com lista de módulos/aulas.
4. Criar player multi-fonte com react-player (Vimeo, YouTube e arquivo), começando pelas aulas gratuitas.
5. Criar o Painel do Criador em `/curso/admin`: dashboard, árvore arrastável de módulos/aulas, editor de aula em abas e alternador Editar / Pré-visualizar com "Ver como".
6. Interruptor 🔓/🔒 de gratuito/pago com salvamento imediato.
7. Painel A da Central do Criador: biblioteca de vídeos com origem, status e "usado em".

### Fase 2 — Idiomas e legendas
1. Instalar i18next e extrair todos os textos da interface para `pt.json` e `en.json`.
2. Seletor de idioma no cabeçalho, com preferência salva.
3. Campos de conteúdo com abas PT | EN no painel.
4. Tabela `subtitles` e Edge Function de geração automática de legenda em WebVTT.
5. Editor de legendas no painel e botão CC no player.

### Fase 3 — Acesso pago e matrículas
1. Criar tabelas `enrollments` e `lesson_progress`.
2. Implementar controle de acesso (free vs paid).
3. Integrar pagamentos (Paddle ou Stripe, a definir nesta fase).
4. Criar página "Minhas Matrículas" para o aluno.

### Fase 4 — Tutor de IA
1. Criar tabelas `module_tutor_context`, `chat_threads`, `chat_messages`.
2. Criar Edge Function para o tutor de IA por módulo.
3. Criar interface de chat na página de aula.
4. Alimentar o contexto do tutor automaticamente com a transcrição das legendas.

### Fase 5 — Pergunta por voz
1. Criar hook/componente de gravação de áudio adaptado do Meutranscritor.
2. Criar Edge Function `transcribe-audio` usando Lovable AI Gateway.
3. Integrar botão de voz no chat do tutor de IA.
4. Testar em Chrome, Safari e mobile.

### Fase 6 — Polimento
1. Progresso do aluno (barra de conclusão, continuar assistindo).
2. Busca de aulas.
3. Notificações e lembretes.
4. Otimizações mobile e PWA leve.
5. Painel B da Central do Criador: kanban de produção (Ideia → Gravado → Editado → Legendado → Publicado).
6. Painel C: números de audiência via Umami ou Plausible, se já houver tráfego.

## Próximos passos imediatos
1. Aprovar este plano atualizado.
2. Definir nome final do projeto (Burnstore, Brainstore ou outro).
3. Preparar o primeiro curso piloto: título, módulos, aulas gratuitas e apostilas.

## Nota importante
Nenhuma alteração de código será feita neste projeto sem a autorização explícita "PODE CODAR". Este plano serve para alinharmos a arquitetura antes de começar a implementar.
