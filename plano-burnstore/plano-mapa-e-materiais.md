# Brief v2: mapa do curso, leitura e a apostila que se escreve sozinha

> Revisão de 10/08/2026 depois das suas observações. A v1 está no histórico do
> git — mudei de posição em dois pontos e vou dizer exatamente onde e por quê.
> **Nada será codado sem "PODE CODAR".**

---

## 1. Respondendo direto o que você perguntou

### "O PDF está fora de época?"

**Não é velho — é formato de impressão.** Nasceu para garantir que uma folha
saísse igual em qualquer impressora, e nisso continua imbatível. O problema é
usá-lo para ler em tela: ele congela o texto numa folha A4, e num celular isso
vira zoom e arrasto.

O contraste que importa não é antigo × moderno, é **layout fixo × texto fluido**:

| | Layout fixo (PDF) | Texto fluido (HTML/EPUB) |
|---|---|---|
| Celular | precisa de zoom | se adapta à tela |
| Tamanho da letra | fixo | **o leitor escolhe** |
| Busca | limitada | busca tudo |
| Leitor de tela | sofrível | funciona |
| Slide, gráfico, diagrama | **imbatível** | perde o desenho |

Texto fluido é o que Kindle, Medium, Notion e a documentação de qualquer
produto sério usam. Não por moda — porque **quem lê escolhe o tamanho da letra**,
e isso mais que qualquer outra coisa define conforto de leitura.

> **Então o certo não é escolher um. É usar cada um onde ele ganha.** Ver o item 3.

### "Dá para guardar o material no Lovable, e ter cópia no servidor?"

Dá, e é o desenho certo — o mesmo dos vídeos:

- **Supabase Storage** (o "banco" do Lovable) guarda o arquivo que o aluno acessa.
- **O HD** continua sendo o mestre, com os originais em qualidade cheia.
- O servidor do HD **prepara** o material (converte, extrai texto) e você publica.

### "Tem que ser à prova de invasão, não pode virar via de duas mãos"

Preocupação certa, e é o ponto que mais me importa aqui. Três regras, sendo
que **as duas primeiras já estão valendo**:

1. **O servidor do HD é somente leitura.** Nenhuma rota aceita arquivo vindo de fora — não existe upload. Ele lê de uma pasta e envia; nada entra.
2. **Nenhum caminho escapa da pasta de mídia.** Testei cinco jeitos diferentes de pedir arquivo fora dela (`../`, `%2f`, barra invertida, caminho absoluto) — todos recusados.
3. **Regra permanente daqui pra frente:** quando abrirmos o túnel para os alunos, o servidor continua sem aceitar escrita. Publicar é sempre você empurrando do HD para a nuvem — **nunca a nuvem alcançando o seu computador**. É isso que impede a via de duas mãos.

E no lado da nuvem: **bucket privado com link que expira**, nunca arquivo
público. Material pago com URL eterna vaza no primeiro WhatsApp.

---

## 2. O mapa — onde você me convenceu

Na v1 eu recomendei não fazer mapa. **Você esclareceu o pedido e isso muda a
resposta.** O que você descreveu não é canvas livre para passear:

> *"isso aqui eu já concluí; essa eu não concluí, posso ir por aqui; não
> precisa exatamente nessa ordem, mas tem que cumprir essas etapas antes"*

Isso é **mapa de pré-requisitos** — e responde uma pergunta que lista nenhuma
responde: *"o que eu posso fazer agora, e o que depende de quê?"*. Isso tem
valor real de aprendizado, diferente do canvas decorativo que critiquei.

**Mantenho uma ressalva, e ela é importante:** o mapa precisa **nascer da
estrutura do curso**, não ser desenhado à mão. Mapa desenhado manualmente
desatualiza na segunda aula que você mover, e aí atrapalha mais do que ajuda.
Você marca "esta aula depende daquela" e o desenho se organiza sozinho.

**Ferramenta, sem inventar a roda:** **React Flow** (`@xyflow/react`) — licença
MIT, 38 mil estrelas, mantido ativamente, é o padrão de mercado para telas de
nós e conexões. Nós personalizados, conectores com rótulo e toque no celular
já vêm prontos. Combinado com layout automático, você nunca posiciona nada à mão.

### E o "vídeo com a mãozinha desenhando"

O nome que você procurava é **RSA Animate** — ou *whiteboard animation*,
*video scribing*. A série do Royal Society of Arts (2010) popularizou o estilo:
um ilustrador desenha enquanto a pessoa fala.

**Pé no chão: produzir isso é trabalho de ilustrador.** Caro, lento, e não
automatiza bem. Não recomendo produzir vídeos assim.

**Mas há uma parte que se transporta e custa quase nada** — e é justamente a
que provoca a sensação que você gostou:

- **O traço, não o vídeo.** Ícones e conectores com cara de desenho à mão, em vez de linha reta perfeita de software.
- **A linha que se desenha.** Em SVG, dá para fazer o traço aparecer como se estivesse sendo desenhado agora (é um truque conhecido, `stroke-dasharray` animado). Quando o mapa abre, as ligações **se desenham** em vez de simplesmente estarem lá.

Isso é o RSA Animate aplicado onde cabe: **na abertura do mapa**, que é um
momento ocasional — exatamente onde vale gastar animação. E resolve o que você
chamou de "quebrar a monotonia da seriedade quadradinha" sem custo de produção.

---

## 3. A ideia mais forte que você teve: a apostila que se escreve sozinha

> *"a gente vai criar um banco de dados cérebro que o próprio sistema, conforme
> a gente vai montando o curso, vai alimentando"*

**Isso reorganiza o projeto inteiro, e a maior parte já está de pé.**

Repare no que já existe: toda aula gera legenda automática. Legenda é
transcrição. Transcrição é **texto**. Ou seja — **o curso já está produzindo a
matéria-prima da apostila sem ninguém digitar nada.**

```
      aula gravada
           │
   legenda automática  ← já funciona
           │
   texto limpo por IA  ← passo que falta
           │
    ┌──────┼──────┬─────────────┐
  apostila  busca  tutor de IA  "continuar lendo"
  do curso  no      (já existe,   em vez de
            curso   fica melhor)   reassistir
```

**Um trabalho, quatro resultados.** E o texto é fluido, então lê bem em
qualquer aparelho — é a resposta para "existe algo melhor que imagem e PDF?".
Existe, e você vai ganhar de graça.

### A ressalva honesta, para você não esperar mágica

**Transcrição crua não é apostila.** Fala transcrita tem "né", "então",
repetição, frase que recomeça no meio. Ninguém lê isso com prazer.

Falta uma passada de IA que transforma fala em texto de leitura: tira vício de
linguagem, junta parágrafo, põe subtítulo. Isso é barato e você já tem tudo
para fazer (o Groq configurado e o gateway do Lovable) — mas **é um passo, não
é automático**. E vale você revisar: a IA vai errar termo técnico igual erra
na legenda ("bioresonância" com um *s* só, como vimos).

### As três camadas de leitura

Fechando a resposta do PDF:

| O material | Como fica | Por quê |
|---|---|---|
| **Apostila gerada** (das aulas) | **texto fluido** | melhor leitura possível; letra ajustável, busca, funciona em tudo |
| **Slide / PowerPoint** | **galeria de imagens** | slide é desenho; virar texto destruiria |
| **PDF que você já tem** | **galeria + texto extraído junto** | você lê como imagem, e a busca ainda acha |

---

## 4. Imersão — o que segura a pessoa, na prática

Você me pediu para olhar como especialista em imersão. O que vale dizer:

**A maior parte da imersão não vem de efeito visual — vem de nunca deixar a
pessoa sem saber o que fazer a seguir.** Toda vez que alguém termina uma aula e
cai numa tela morta, você perde um pouco. É por isso que a Netflix já emenda o
próximo episódio: não é enfeite, é remover o instante de decisão.

Três coisas que valem mais que qualquer animação:

1. **Sempre haver um próximo passo óbvio** — ao terminar a aula, o próximo já está ali, com nome e duração. Hoje existe "próxima", mas discreta.
2. **Retomar exatamente onde parou** — inclusive no minuto do vídeo. O banco já guarda os segundos assistidos e ninguém usa.
3. **Nunca fazer a pessoa esperar sem saber o que está acontecendo** — carregando sem aviso é a forma mais silenciosa de perder alguém.

### Sobre a porcentagem — sua ideia estava certa, e dá para melhorar

Você propôs mostrar a porcentagem só depois da metade. O princípio por trás é
esse mesmo, e generaliza bem:

> **Número que só sobe motiva. Número que mostra o quanto falta desmotiva no começo.**

Então, em vez de esconder e depois revelar (o que fica estranho quando aparece
do nada):

- **Sempre visível:** "3 aulas concluídas" · "2h40 de estudo" — só sobem, nunca acusam.
- **Barra por módulo:** módulo é curto, a barra anda de verdade.
- **Porcentagem do curso:** discreta desde o início, e ganha destaque depois da metade — quando vira incentivo em vez de cobrança.

E o **contador de horas que você sugeriu é a melhor métrica das três**: é
acumulativa, é real, e nunca vira cobrança. "Você estudou 12h neste curso" só
dá orgulho.

---

## 5. Ordem revisada

| # | O quê | Por que nesta posição | Tamanho |
|---|---|---|---|
| **1** | **Upload de material** (arrastar arquivo; hoje é URL colada à mão) | maior dor atual, menor esforço | pequeno |
| **2** | **Progresso**: aulas concluídas, horas estudadas, barra por módulo, conclusão automática aos 90% | alimenta o mapa; sem isso o mapa é enfeite | pequeno |
| **3** | **Próximo passo e retomar no minuto** | onde a imersão mais se ganha | pequeno |
| **4** | **Texto limpo por IA** a partir da legenda | destrava a apostila, a busca e o tutor melhor | médio |
| **5** | **Leitor de texto fluido** (letra ajustável, tema claro/escuro) | a experiência de leitura que você quer | médio |
| **6** | **Mapa de pré-requisitos** (React Flow, linhas que se desenham) | precisa de 2 e 4 para ter o que mostrar | médio |
| **7** | **Galeria de páginas** (PDF/PPTX via servidor do HD) | complementa o que não vira texto | médio |

**Continuo recomendando começar por 1, 2 e 3** — são as três menores somadas e
já mudam a sensação do produto. A **6** é a que você mais quer ver, e fica
muito melhor depois da 2 e da 4: sem progresso e sem conteúdo ligado, o mapa é
um desenho bonito sem informação dentro.

---

## 6. O que continuo recomendando não fazer

- **Canvas livre para navegar** (pan/zoom infinito) — mapa de pré-requisitos sim; passeio livre não.
- **Mapa desenhado à mão** — desatualiza e vira mentira. Ele nasce da estrutura.
- **Produzir vídeo estilo RSA Animate** — trabalho de ilustrador. Levamos o traço, não a produção.
- **Gamificação** (XP, medalha, ofensiva) — você já disse que não quer, e concordo.
- **PDF.js como leitor principal** — falha justamente no celular.

---

## Fontes

- Texto fluido × layout fixo para leitura e acessibilidade: <https://changethisfile.com/blog/epub-vs-pdf-reading> · <https://kitaboo.com/reflowable-or-fixed-layout-epub-which-is-better/>
- PDF.js em dispositivos móveis: <https://www.nutrient.io/blog/top-5-javascript-pdf-viewers/>
- React Flow / xyflow (MIT, 38k estrelas): <https://github.com/xyflow/xyflow>
- RSA Animate e whiteboard animation: <https://en.wikipedia.org/wiki/Andrew_Park_(animator)> · <https://www.b2w.tv/blog/types-of-whiteboard-animation>
- Conversão PPTX/PDF em imagens: <https://www.systutorials.com/how-to-convert-pptx-slides-to-jpg-or-png-images-on-linux-in-command-line/>
