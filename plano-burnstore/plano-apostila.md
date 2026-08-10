# Brief: a apostila — de onde o Positivo bebe, e como copiar isso

> Pesquisa de 10/08/2026 a pedido do Rafa. **Nada será codado sem "PODE CODAR".**
> Complementa `plano-mapa-e-materiais.md`.

---

## 1. O nome que você procurava: aparato pedagógico

Você estava certo — o Positivo não inventou nada. O conjunto de recursos que
você admira tem nome na editoração educacional: **aparato pedagógico**
(*pedagogical apparatus*). É a camada que envolve o texto e o torna estudável,
em vez de só legível.

E ela não é decoração: **cada recurso resolve um problema medido em pesquisa
de aprendizado.** É por isso que a apostila "funcionava" e você lembra dela
trinta anos depois.

| O que você via na apostila | Nome técnico | O que resolve |
|---|---|---|
| O mapa/esquema na abertura do capítulo | **Organizador prévio** (Ausubel, 1960) | a cabeça precisa de uma prateleira antes de receber o conteúdo |
| Boxes "Fique ligado", "Atenção", cores | **Sinalização** (Mayer) | diz onde olhar; sem isso tudo pesa igual |
| Exemplo resolvido passo a passo | **Worked example** (Sweller) | ver alguém resolver ensina mais que tentar sozinho no começo |
| Notas na lateral da página | **Marginália** | comenta sem quebrar o fio do texto |
| Mudar o visual quando muda o assunto | **Variação de ritmo** | página uniforme adormece; a quebra reacorda |
| Síntese no fim | **Consolidação** | fecha o ciclo e dá o que revisar |
| Exercícios no fim | **Prática de recuperação** (Roediger & Karpicke) | **testar-se fixa muito mais que reler** — o recurso de maior impacto de todos |

**As fontes de onde o Positivo bebeu:** Ausubel (organizador prévio, anos 60),
Sweller (carga cognitiva, anos 80), Mayer (aprendizagem multimídia, anos 2000),
Roediger & Karpicke (prática de recuperação, 2006). É ciência cognitiva
aplicada a papel — e nada disso é exclusivo de papel.

### A descoberta que fecha o problema

Repare no formato dessa tabela: **cada linha é um tipo de bloco.**

Destaque, exemplo resolvido, resumo, atenção, exercício, nota lateral. O
aparato pedagógico **já é** um conjunto de blocos — só que impressos.

> Ou seja: montar apostila estilo Positivo = **ter um editor de blocos com os
> blocos certos.** Não é um problema de escrever bonito; é de ter as peças
> prontas para encaixar. Que é exatamente o que você pediu com "já vem meio
> pronto, joga lá e fica legal".

E é também o que Tumblr e Whimsical fazem bem — os dois que você citou são
editores de bloco. Você já sabia a resposta; só faltava o nome.

---

## 2. Quatro propostas

### Proposta A — Apostila de blocos (o "Positivo digital")

Um editor onde você digita `/` e escolhe a peça: **Destaque · Atenção ·
Exemplo resolvido · Resumo · Você sabia · Exercício · Nota lateral**. Cada uma
já vem com cor, ícone e tipografia da identidade do site — você nunca escolhe
fonte nem cor, só o tipo de peça.

Mais **modelos de aula prontos**: abrir uma aula nova já traz a estrutura
montada (abertura → conceito → exemplo → resumo → exercícios), com espaços para
preencher.

- **Ferramenta:** **BlockNote** (React, blocos ao estilo Notion, com menus prontos) ou **Editor.js** (Apache 2.0, blocos com saída em JSON, mais simples de estender).
- ✅ É o mais próximo do que você lembra, e o mais prático no dia a dia.
- ⚠️ É a maior peça de trabalho das quatro.

### Proposta B — Texto simples com tema

Você escreve corrido, com marcações mínimas, e o site formata. Nada de barra
de ferramentas.

- ✅ Rápido de construir, rápido de digitar, o arquivo é seu para sempre.
- ⚠️ Não entrega os boxes do Positivo sem você aprender uma sintaxe. **Perde justamente o que você admira.**
- **Serve como base por baixo da Proposta A**, não como resposta sozinha.

### Proposta C — A IA escreve o rascunho, você corrige

A legenda da aula já existe. A IA lê a transcrição e devolve **já dentro da
estrutura pedagógica**: abertura com o que a pessoa vai aprender, o conteúdo
limpo em seções, os pontos de atenção destacados, resumo no fim e três
perguntas de fixação.

Você recebe a apostila pronta em rascunho e só ajusta.

- ✅ Elimina a página em branco, que é o que realmente trava a produção.
- ✅ Reaproveita a legenda que já é gerada.
- ⚠️ **Rascunho é rascunho.** Vai errar termo técnico (como errou "bioresonância") e inventar ênfase onde não tem. Precisa da sua passada — mas revisar é muito mais fácil que escrever.

### Proposta D — O texto que anda junto com o vídeo

Esta é a que nenhum concorrente seu tem, e nasce de graça do que já existe.

Como a legenda tem o tempo de cada palavra, o texto e o vídeo podem andar
juntos: o trecho correspondente ao que está sendo falado fica destacado e
acompanha sozinho. Clicar num parágrafo **pula o vídeo para aquele ponto**.
E quem prefere ler, lê — sem assistir.

- ✅ Atende os dois tipos de aluno (quem assiste e quem lê) com um conteúdo só.
- ✅ Transforma a aula em algo **consultável**: "onde ele falou de X?" vira busca.
- ✅ É o que mais aumenta imersão, porque elimina a escolha entre assistir *ou* ler.
- ⚠️ Depende da legenda estar boa. Ou seja: depende do que já construímos.

### Bônus — Proposta E: o caderno do aluno

Deixar o aluno **grifar e anotar** no texto, e reunir isso numa página só —
o caderno dele daquele curso.

- ✅ É o recurso que mais cria vínculo: o material vira dele, não seu.
- ✅ Combina com a prática de recuperação: rever as próprias marcações é estudo.
- ⚠️ Deixar para depois. É ótimo, mas só faz sentido quando já houver texto e alunos.

---

## 3. O que eu recomendo — as quatro se somam

Não são alternativas. São camadas do mesmo caminho:

```
   C  a IA monta o rascunho da transcrição
   ↓
   A  você ajusta nos blocos do Positivo
   ↓
   D  o aluno lê acompanhando o vídeo
   ↓
   E  e marca o que importa para ele     (depois)
```

**Ordem sugerida:** **C → D → A → E.**

O motivo de C e D virem antes de A: as duas **aproveitam o que já está pronto**
(a legenda) e entregam resultado sem você escrever uma linha. O editor de
blocos é a peça mais cara, e faz mais sentido construir depois que já existir
conteúdo passando por ele.

---

## 4. Vídeo → material → questionário, sem cansar

Você perguntou como isso fica imersivo. Duas armadilhas comuns primeiro:

- **Empilhar tudo numa página longa** — a pessoa vê a barra de rolagem minúscula e desiste antes de começar.
- **Separar em abas** — o que está em aba fechada não existe. Já vimos isso acontecer neste projeto: no Modo Conversa do seu outro app, abrir na aba errada fez o texto "sumir".

**O desenho que proponho — uma peça de cada vez, com o próximo sempre à vista:**

```
┌───────────────────────────────┐
│  ▶  vídeo da aula             │
│     ▓▓▓▓▓▓▓▓░░░░░  68%        │
├───────────────────────────────┤
│  📖  Leitura da aula          │   ← aparece ao terminar o vídeo,
│      ~6 min                   │      já com o tempo de leitura
├───────────────────────────────┤
│  ✅  3 perguntas rápidas      │   ← aparece depois da leitura
└───────────────────────────────┘
```

Os princípios por trás:

1. **Uma coisa por vez, o resto recolhido** — mas visível, para a pessoa saber o tamanho do caminho. Recolhido ≠ escondido.
2. **Sempre dizer quanto falta** — "~6 min de leitura", "3 perguntas". Ninguém começa o que não sabe o tamanho.
3. **A peça seguinte se abre sozinha** quando a anterior termina — é o que a Netflix faz ao emendar o episódio: remove o instante de decisão, que é onde se perde gente.
4. **Nada é obrigatório.** Bloquear a leitura até terminar o vídeo irrita quem prefere ler. Sugerir a ordem, sim; impor, não.
5. **O questionário não é prova.** Sem nota, sem reprovação: erra, mostra a resposta e o trecho da aula onde aquilo aparece. É **prática de recuperação** — e a pesquisa mostra que é o que mais fixa. Com nota, vira ansiedade e a pessoa evita.

E as perguntas podem sair da mesma transcrição, no mesmo passo da Proposta C.
**Um trabalho, cinco resultados** — legenda, apostila, busca, tutor e questionário.

---

## 5. O traço desenhado à mão — sua pergunta sobre a biblioteca

Você lembrou do SketchUp, e a intuição foi ótima: o SketchUp ficou conhecido
justamente por desenhar linhas **imperfeitas de propósito**, para o projeto não
parecer decidido antes da hora.

**A biblioteca existe e é pequena: Rough.js.**

- **9 KB**, licença **MIT**, ~20 mil estrelas.
- Desenha linhas, curvas, retângulos e caminhos SVG **com aparência de rascunho**.
- É a mesma base do visual do Excalidraw — o traço que todo mundo reconhece.
- Funciona tanto em Canvas quanto em SVG, então conversa com o React Flow do mapa.

**Como eu usaria, e onde pararia:**

- ✅ **Conectores do mapa** desenhados com Rough.js — a linha entre duas aulas ganha leve irregularidade, como caneta.
- ✅ **A linha se desenhando na abertura** (`stroke-dasharray` animado), uma vez só.
- ✅ **Molduras de destaque** nos boxes da apostila, com o traço de caneta.
- ❌ **Não** usar em botão, campo de formulário ou ícone de navegação — ali a irregularidade lê como defeito, não como charme.

Ou seja: **traço à mão no que é conteúdo e mapa; traço reto no que é controle.**
Essa fronteira é o que separa "acolhedor" de "amador".

---

## 6. Resumo em uma frase

> O Positivo é **ciência cognitiva virada em blocos de papel**. A gente
> reconstrói esses mesmos blocos em tela, deixa a IA preencher o rascunho a
> partir da legenda que já é gerada, apresenta o texto andando junto com o
> vídeo, e usa o traço à mão só onde ele acolhe — no mapa e nos destaques,
> nunca nos botões.

---

## Fontes

- Princípios de aprendizagem multimídia (Mayer), sinalização e organizador prévio: <https://waterbearlearning.com/mayers-principles-multimedia-learning/> · <https://ctl.risepoint.com/principles-of-multimedia-learning/>
- Exemplos resolvidos e carga cognitiva (Sweller): <https://www.researchgate.net/publication/200773238_Learning_from_Examples_Instructional_Principles_from_the_Worked_Examples_Research>
- Princípios de design instrucional: <https://www.teachfloor.com/blog/instructional-design-principles> · <https://med.emory.edu/about/_files/hirumi_2020_id-principles_201011.pdf>
- Editores de bloco (BlockNote, Editor.js, Tiptap, Plate): <https://medium.com/@support_56991/editor-js-vs-tiptap-2026-block-based-vs-headless-dd1bd451714e>
- Rough.js (MIT, ~20k estrelas): <https://github.com/rough-stuff/rough> · <https://roughjs.com/>
