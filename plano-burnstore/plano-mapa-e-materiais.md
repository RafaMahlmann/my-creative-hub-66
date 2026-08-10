# Brief: mapa do curso, progresso e material de apoio

> Pesquisa e proposta — **nada será codado sem "PODE CODAR"**.
> Pedido do Rafa (10/08/2026): mapa de onde a pessoa está, porcentagem do curso,
> "dinâmica meio juicy", material complementar tipo Hotmart, e um modo de
> apresentação de documento que funcione bem no celular, no iPad e no Windows.

---

## 1. Onde estamos hoje — o diagnóstico sem maquiagem

Fui olhar o código antes de opinar. O resumo:

| | Situação |
|---|---|
| Banco de progresso (`lesson_progress`) | ✅ existe, guarda concluída e segundos assistidos |
| Marcar aula como concluída | ✅ existe, **mas só no clique manual** |
| Porcentagem do curso | ❌ **não existe em lugar nenhum** |
| Página do curso mostra progresso | ❌ **zero** — nem uma barra |
| Mapa / trilha / "onde estou" | ❌ não existe |
| "Continuar de onde parei" | 🟡 só na página "Minhas aulas" |
| Adicionar material de apoio | 🟡 **três campos de texto: título, URL colada à mão e tipo** |
| Aluno abrir o material | 🟡 vira link de download — **ele sai do site** |
| Visualizar PDF/slide dentro da aula | ❌ não existe |

**O buraco maior não é o mapa — é o material.** Hoje, para anexar uma apostila,
você precisa hospedar o arquivo em algum lugar por conta própria e **colar a
URL na mão**. E o aluno que clica é jogado para fora da aula. Isso é o oposto
do que você descreveu.

---

## 2. Sobre o Miro — a resposta pé no chão que você pediu

Entendo a atração, e ela é legítima: o Miro tem uma qualidade rara, que é
**você bater o olho e ver o conjunto inteiro**.

Mas preciso ser honesto sobre a parte que não se transporta: **o Miro resolve
um problema que não é o seu.** Ele existe para pensar junto num espaço livre,
onde não há ordem certa. Curso tem ordem. E aí o canvas trabalha contra:

- A pergunta do aluno não é *"como tudo se conecta?"* — é **"o que eu faço agora?"**. Canvas responde mal a essa pergunta, porque toda direção parece igualmente válida.
- Pan e zoom em celular é briga com o gesto de rolagem da página. Você pediu justamente que funcionasse bem no celular.
- Canvas livre não tem "próximo" óbvio. Sem próximo óbvio, a pessoa fecha a aba.

Repare quem resolveu isso e como: **Netflix não tem mapa. Duolingo é uma
trilha vertical. Coursera é lista com barra.** Nenhum dos três é canvas — e
todos são referências em manter gente engajada.

**O que eu levo do Miro e o que deixo:**

- ✅ **Levo:** a visão de conjunto que cabe numa tela só, sem precisar rolar para entender o tamanho da coisa.
- ❌ **Deixo:** o canvas infinito, o pan/zoom e a liberdade de direção.

> Minha recomendação: **trilha vertical compacta**, não mapa navegável. Você
> ganha 90% da sensação que te atrai, com 10% do trabalho, e funciona no
> celular.

Se depois de pronto você sentir falta do canvas, dá para acrescentar uma
"visão de conjunto" opcional. Mas começar por ela seria construir o difícil
antes do útil.

---

## 3. Duas coisas sobre aprendizado que costumam passar batido

Você pediu para eu trazer o que os humanos não veem. Aqui vão as duas que mais
importam neste caso:

**a) Mostrar "12% concluído" no começo do curso desmotiva.**
É contraintuitivo, mas número baixo logo na largada comunica "falta muito".
O jeito conhecido de contornar é medir progresso **por módulo, não pelo curso
inteiro** — módulos são curtos, então a barra anda visivelmente e a pessoa
coleciona conclusões pequenas em vez de encarar uma barra parada em 12%.
A porcentagem do curso continua existindo, mas discreta, não como manchete.

**b) "Marcar como concluída" no clique é frágil, e o dado para resolver já está no banco.**
A tabela já guarda `seconds_watched`. Dá para marcar sozinho ao passar de ~90%
do vídeo — que é o que YouTube e Netflix fazem — mantendo o botão manual para
quem quer marcar por conta. Hoje, quem assiste a aula inteira e esquece de
clicar simplesmente não tem progresso registrado.

---

## 4. O "juicy" — e onde ele NÃO deve entrar

Existe uma confusão comum aqui que vale desfazer, porque ela decide o projeto:

> **Game feel ≠ gamificação.**
> Game feel é como um botão responde ao toque. Gamificação é XP, nível, medalha,
> ofensiva. Um botão do iPhone é gostoso de apertar e não tem ponto nenhum.

Você pediu game feel. **Não vou propor gamificação** — pontos e medalhas num
curso de terapeuta soariam infantis e, pior, criariam a expectativa de um
sistema de recompensa que não existe por trás.

A régua que vou usar para dosar é a **frequência de uso**: quanto mais vezes a
pessoa faz algo, menos aquilo deve chamar atenção.

| Ação | Frequência | Quanto de efeito |
|---|---|---|
| Passar o olho pela lista de aulas | dezenas de vezes | quase nada — só um realce barato |
| Abrir uma aula | várias vezes ao dia | transição curta e discreta |
| **Concluir uma aula** | **poucas vezes por curso** | **aqui vale caprichar** |
| Terminar um módulo | raríssimo | o único momento de celebração |

**Os momentos de movimento, e só estes quatro:**

1. **Concluir uma aula** — o ponto da trilha preenche de vazio para cheio (~300 ms), e a linha até o próximo ponto "acende" no mesmo gesto. Uma vez só, sem repetir.
2. **Barra do módulo** — cresce com desaceleração suave quando o número muda, em vez de pular.
3. **Hover/toque no ponto da trilha** — leve elevação, para dizer "dá para clicar".
4. **Fechar um módulo inteiro** — o único momento com um respiro maior: o bloco do módulo se assenta e marca. Sem confete, sem som.

**Fronteiras — o que fica de fora de propósito:** sem XP, sem nível, sem
ofensiva/streak, sem medalha, sem partícula, sem som, sem cadeado dramatizado.
Nada disso tem mecânica real por trás, e sem mecânica vira enfeite que envelhece mal.

**Referência de calibragem:** o gráfico de contribuições do GitHub. Zero
animação, zero brilho — e é o exemplo mais citado de "satisfatório numa
ferramenta séria". A satisfação vem do padrão visual, não do efeito.

---

## 5. Material de apoio — onde está o verdadeiro salto

Aqui está o problema real, e aqui está a solução que ninguém precisa inventar.

### O problema do PDF no celular

PDF foi desenhado para papel A4. No celular ele obriga a dar zoom e arrastar
para os lados — a pior experiência de leitura que existe. E a biblioteca padrão
da web para isso (**PDF.js**, da Mozilla) é excelente no computador mas
**reconhecidamente pesada no celular**, porque desenha tudo em canvas: o toque
engasga, o pinça-para-ampliar trava.

Ou seja: só embutir um leitor de PDF **não** resolve o que você pediu.

### A saída — e você já tem a peça principal montada

O caminho que as ferramentas boas usam é **converter antes, servir simples
depois**. E isso é trabalho para o servidor do HD, que já existe e já faz
exatamente esse tipo de tarefa (miniatura, duração, legenda):

```
você joga um PDF ou PPTX na pasta da aula
              │
     LibreOffice (--headless)  →  vira PDF
              │
     pdftoppm                  →  vira uma imagem por página
              │
     o site mostra uma galeria de páginas
```

Por que isso ganha de tudo o mais:

- **Imagem funciona igualmente bem em qualquer aparelho.** Sem canvas, sem lag, sem plugin. Rolagem nativa, pinça nativa.
- **Serve para PDF e PowerPoint pelo mesmo caminho** — você joga o arquivo que tiver.
- **Carrega só a página que aparece na tela**, então material pesado não trava o celular.
- **Continua oferecendo o arquivo original para baixar**, para quem quiser imprimir.
- São duas ferramentas maduras, gratuitas, instaladas do mesmo jeito que o FFmpeg.

> Uma ressalva honesta: virando imagem, o texto deixa de ser selecionável e o
> buscador não lê. Como o material é apoio de aula (não artigo público), o
> ganho de leitura compensa. E dá para guardar o texto extraído junto, se um dia
> quisermos busca dentro da apostila.

### Sobre "já sair bonito sem eu formatar"

Você descreveu jogar o conteúdo e ele já sair apresentável. A solução
consolidada para isso **não** é um editor tipo Word — é **texto simples com
tema pronto**. Você escreve com marcações mínimas (título, negrito, lista) e o
site aplica a tipografia do curso. É como funcionam Notion, Obsidian e a
documentação de praticamente todo produto sério. Fica bonito porque você não
escolhe fonte nem cor — o tema escolhe.

Para quem já tem slide pronto em PowerPoint, o caminho é o de cima: joga o
arquivo, vira galeria.

---

## 6. Editar na própria tela

Você já tem o começo disso e funciona bem — o modo de edição da vitrine, onde
se troca miniatura e alterna gratuito/pago sem abrir formulário. A proposta é
**estender o mesmo padrão**, não criar outro:

- Arrastar um arquivo **direto para dentro da aula** para virar material (hoje é URL colada à mão).
- Renomear e reordenar material na própria lista.
- Reordenar aulas arrastando na trilha.
- Tudo salvando na hora, com aquele "Salvo às 14:32" discreto.

---

## 7. Ordem que eu proponho

Cada etapa entrega algo utilizável sozinho.

| # | O quê | Ganho | Tamanho |
|---|---|---|---|
| **1** | **Upload de material de verdade** (arrastar o arquivo, sem colar URL) | tira a maior dor de hoje | pequeno |
| **2** | **Progresso visível**: barra por módulo, porcentagem discreta do curso, conclusão automática aos 90% | o aluno passa a ver que anda | pequeno |
| **3** | **Trilha do curso** com os quatro momentos de movimento do item 4 | o "mapa" que você pediu | médio |
| **4** | **Galeria de páginas** no servidor do HD (LibreOffice + pdftoppm) e visualizador embutido | lê bem em qualquer aparelho | médio |
| **5** | **Apostila em texto com tema** | escrever direto, sem formatar | médio |
| **6** | Visão de conjunto opcional, estilo mapa | só se fizer falta depois | grande |

**Começar pela 1 e pela 2.** São as menores e resolvem as dores mais concretas.
A 3 é a que você mais quer ver, e fica muito melhor depois que a 2 existir —
sem dado de progresso, a trilha é um enfeite bonito e vazio.

---

## 8. O que eu recomendo NÃO fazer

Registrando para a gente não gastar fôlego à toa:

- **Canvas navegável estilo Miro como navegação principal** — item 2.
- **Gamificação** (XP, medalha, ofensiva) — cria expectativa de sistema que não existe e destoa do tom do seu trabalho.
- **Editor de texto tipo Word** — muito trabalho para um resultado pior que tema pronto.
- **PDF.js puro como visualizador principal** — falha exatamente no celular, que é onde você quer que funcione bem.
- **Converter PowerPoint no navegador** — existe biblioteca para isso e o resultado é sofrível; conversão é trabalho de servidor, e você já tem um.

---

## Fontes

- Limitações do PDF.js em dispositivos móveis: <https://www.nutrient.io/blog/top-5-javascript-pdf-viewers/> · <https://apryse.com/blog/pdfjs-alternatives>
- Conversão de PPTX/PDF em imagens (LibreOffice headless + pdftoppm): <https://blog.fileformat.com/en/image/top-open-source-office-document-to-image-converter-apis-complete-guide/> · <https://www.systutorials.com/how-to-convert-pptx-slides-to-jpg-or-png-images-on-linux-in-command-line/>
- Trilhas de aprendizagem e progresso visível: <https://www.paradisosolutions.com/blog/learning-paths-for-lms/>
- Game feel × gamificação, e calibragem por frequência: "Juice it or Lose it" (Jonasson & Purho); *Game Feel* (Steve Swink)
