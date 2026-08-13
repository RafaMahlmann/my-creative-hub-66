# Flor de Plasma — Área de Cursos ("Burnstore")

**ANTES DE QUALQUER COISA: leia nesta ordem.**
1. `plano-burnstore/plano-burnstore.md` — visão geral do projeto
2. `plano-burnstore/plano-execucao.md` — as 11 etapas, o que já foi feito
3. `plano-burnstore/plano-mapa-e-materiais.md` e `plano-burnstore/plano-apostila.md` — a
   frente de trabalho mais recente (10/08/2026), ainda **não codada**
4. A seção "ONDE PARAMOS" no fim deste arquivo

## O que é este projeto (e o que NÃO é)

Este repo é o site do terapeuta (Flor de Plasma). A aba **Curso** ("Burnstore") é a
frente ativa: área de membros com catálogo estilo Jellyflix, player multi-fonte,
apostilas e tutor de IA por módulo.

- **NÃO é** o `plasma-therapist-aid` (esse é outro repo — app de consultas/prontuário).
- Ignore o texto do `README.md` — é o prompt de voz original que criou o projeto no
  Lovable ("My Digital Space"), de uma ideia antiga que não é o que está sendo
  construído aqui. O nome da pasta (`my-creative-hub-999`) também é só o nome que o
  Lovable gerou sozinho — não significa nada sobre o conteúdo.
- **Live:** my-creative-hub-999.lovable.app · projeto **Lovable** (React + Vite + shadcn
  + Supabase/Lovable Cloud).

## Regras do projeto

1. **Nada é codado sem "PODE CODAR"** explícito do Rafa — está escrito em
   `plano-burnstore.md` e vale para qualquer proposta nova.
2. **Bilíngue desde o primeiro dia.** Nenhum texto fixo no código — tudo em
   `src/locales/pt.json` / `en.json`, criado na mesma etapa da tela.
3. **Não reinventar a roda.** Bibliotecas aprovadas: `react-player`, `i18next` +
   `react-i18next`, `@dnd-kit`, `Tiptap`, `subtitle`/`webvtt-parser`, `shadcn/ui`,
   `TanStack Query`, `zod`. Para o mapa de pré-requisitos (ainda não codado):
   `@xyflow/react` (React Flow). Para o traço à mão (ainda não codado): `Rough.js`.
4. **Visual "Jellyflix"** dentro da área de curso — catálogo escuro, capas 16:9,
   hover que amplia. Paleta sálvia/cream do site principal, variante escura própria.
5. **Segurança por padrão.** Toda tabela nova nasce com RLS + GRANTs + policies na
   mesma migração.
6. **Lovable e edição local disputam o mesmo repo.** Os commits "Changes" são do
   Lovable. Rodar `git status` e conferir sync com `origin/main` antes de editar, se
   houver prompt feito no Lovable em paralelo.

## Armadilhas já confirmadas na prática (não reintroduzir)

1. **Não dá para aplicar migração de banco daqui.** O `.env` só tem a chave
   publishable; sem Supabase CLI e sem service_role. Todo SQL novo precisa que o
   Rafa cole no painel do Supabase — por isso existe o `PendingSetupCard`, que
   detecta a coluna faltando e mostra o comando com botão copiar.
2. **Nunca usar `videos(*)` em query pública.** A tabela guarda `source_path`/
   `source_note` (caminho no computador dele) — interno. Listar coluna por coluna,
   ver `videoCols()` em `src/lib/thumbs.ts`.
3. **Coluna nova quebra a query inteira** enquanto o SQL não roda (erro 42703).
   Padrão: checar uma vez, cachear a **promessa** (não só o resultado), montar a
   lista de colunas conforme.
4. **`HTTP 204` não prova escrita** no PostgREST — um UPDATE que o RLS filtrou para
   0 linhas devolve 204 igual. Testar com `Prefer: return=representation`.

## Estado (10/08/2026)

Etapas 0–5, 7 e 8 do `plano-execucao.md` já construídas: catálogo Jellyflix com
edição inline, player multi-fonte, painel do criador, biblioteca de vídeos,
matrículas, consentimento LGPD, tutor de IA por módulo. **Faltam:** pergunta por
voz (etapa 9), Tiptap, painéis B/C.

Servidor próprio no HD externo (`C:\Users\xrafa\Programas\plasma-servidor`, repo
**separado** — nunca colocar código dele aqui, este repo é público) serve vídeo e
material sem upload — a pasta é a interface. Ver `plano-servidor-local.md` para a
arquitetura completa.

## A frente da manhã de 10/08 — ainda não codada

Depois de pesquisa e brainstorm (`plano-mapa-e-materiais.md` + `plano-apostila.md`),
a ordem combinada para os próximos passos é:

| # | O quê | Por quê nesta posição |
|---|---|---|
| **1** | Upload de material de verdade (arrastar arquivo; hoje é URL colada à mão) | maior dor, menor esforço — **em andamento agora, ver "ONDE PARAMOS"** |
| **2** | Progresso: aulas concluídas, horas estudadas, barra por módulo | alimenta o mapa; sem isso o mapa é enfeite |
| **3** | Próximo passo e retomar no minuto exato do vídeo | onde a imersão mais se ganha |
| **4** | Texto limpo por IA a partir da legenda | destrava apostila, busca e tutor melhor |
| **5** | Leitor de texto fluido (letra ajustável, tema claro/escuro) | a experiência de leitura completa |
| **6** | Mapa de pré-requisitos (React Flow, linhas que se desenham) | precisa de 2 e 4 prontos primeiro |
| **7** | Galeria de páginas (PDF/PPTX via servidor do HD) | complementa o que não vira texto |

A ideia central desta frente: a apostila se escreve sozinha a partir da legenda que
já é gerada automaticamente — **um trabalho, múltiplos resultados** (apostila,
busca, tutor, questionário). Ver seção 3 de `plano-mapa-e-materiais.md` para o
raciocínio completo. Rejeitado explicitamente: canvas livre, mapa desenhado à mão,
vídeo estilo RSA Animate, gamificação (XP/medalha/ofensiva), PDF.js como leitor
principal.

## ONDE PARAMOS

Etapa 1 (upload de material) está em andamento, com autorização já dada
(commits `e0c20da Etapa 1: upload de material de verdade` e
`1c2c259 Aplicou Etapa 1 do plano de banco` — a migração `etapa1-materiais.sql`
já rodou no Supabase).

**Arquivo com mudança NÃO commitada:** `src/components/course/MaterialsTab.tsx`.
Estava recebendo uma prop opcional `simular?: LessonMaterial[]` para funcionar na
página `/admin/simulacao` (testar telas de admin sem precisar de login — mesmo
padrão já usado em `ServidorLocalCard` e `PuxarLegendaDoHD`, ver `Simulacao.tsx`).

**Próximo passo exato:** terminar de ligar `<MaterialsTab simular={...} />` dentro
de `src/pages/admin/Simulacao.tsx` (ainda não está lá — os outros componentes já
têm, este não) e depois commitar as duas coisas juntas.

Depois de fechar isso, seguir para o item 2 da tabela acima (Progresso).
