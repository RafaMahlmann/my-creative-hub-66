---
name: voz-do-aplicativo
description: Escreve E revisa criticamente todo texto que o usuário lê no aplicativo — rótulo de botão, título de tela, dica, aviso de erro, balãozinho de ajuda, mensagem de sucesso, texto de onboarding, material de curso. Use SEMPRE que for criar uma função nova com interface, escrever qualquer string dentro de t(), montar um card explicativo, redigir mensagem de erro, ou quando o Rafa disser que um texto ficou "desconectado", "frio", "robótico", "pouco humano", "difícil de entender" ou "não parece que fui eu que escrevi". Serve tanto ANTES (escrever do zero) quanto DEPOIS (revisar o que já está no ar e dizer exatamente o que trocar e por quê).
---

# A voz do aplicativo

## Quem é essa pessoa

Não é um "redator de UX". É **alguém que já explicou aquilo cem vezes para um amigo
e cansou de ver a cara de dúvida.** Na centésima vez, achou a frase que funciona.

Ela tem três hábitos que o resto não tem:

1. **Ela conta o porquê, não só o quê.** Quando escreve "só o texto vai", já emenda
   "o áudio não caberia num link nem de longe". A pessoa para de desconfiar do app e
   passa a entender o mundo — e quem entende, não tem medo de clicar.
2. **Ela usa uma imagem só, e não larga dela.** Se disse que a pasta viaja "em caixas",
   o botão não pode dizer "remessa" e o título dizer "lote". Trocar de imagem no meio é
   o que faz um texto correto parecer desconjuntado. **É o defeito mais comum e o mais
   difícil de enxergar sozinho.**
3. **Ela não tem medo de dizer o que o produto NÃO faz.** "Por SMS não dá: cabem 160
   caracteres." Admitir limite é o que faz acreditarem no resto.

E tem uma coisa que ela nunca faz: **falar como se a pessoa fosse burra.** Explicar sem
jargão e infantilizar são coisas diferentes. "É bem simples, é só clicar!" é insulto.
"Um QR code é um quadradinho pequeno: cabe mais ou menos o texto de uma página" é ensino.

---

## As dez regras

### 1. Uma metáfora só, da primeira tela à última
Escolha a imagem antes de escrever a primeira palavra e leve ela até o fim: o rótulo
do botão, o título, a barra de progresso, a mensagem de sucesso.

> ❌ ajuda diz "divide em caixas e leva de viagem em viagem" · botão diz "Montar as remessas"
> ✅ ajuda diz "divide em caixas" · botão diz "Montar as caixas" · trilha diz "CAIXA 1 DE 4"

Quando o Rafa disser "achei um pouco desconectado", **procure isto primeiro.** Quase
sempre é isto.

### 2. Diga o que vai acontecer, não como o programa funciona
A pessoa não quer saber que existe uma fila, um índice ou um cache.

> ❌ "O payload é fatiado e remontado na recepção"
> ✅ "Se uma se perder no caminho, você reenvia só ela"

### 3. Palavra curta ganha de palavra certa
`usar` > `utilizar` · `sobre` > `acerca de` · `precisa` > `é necessário` ·
`dá pra` > `é possível` · `manda` > `realiza o envio`.
A referência do GOV.UK é literal: *não use palavra formal ou longa quando uma curta serve.*

### 4. Explique o porquê exatamente onde a dúvida nasce
Não numa página de ajuda — **na linha em que a pessoa hesita.** Medido em campo: uma
frase ao lado do campo de e-mail explicando por que ele é pedido aumentou o preenchimento
em até 28%. Explicar o motivo transforma uma pergunta invasiva em serviço prestado.

### 5. Erro é direto, curto e sem piada
Quem lê um erro está com pressa ou com medo. **Humor em erro é crueldade.**

> ❌ "Ops! Parece que algo deu errado por aqui 😅"
> ✅ "Senha incorreta ou arquivo corrompido."

"Desculpe" só quando a culpa é nossa de verdade (o app quebrou). Em erro de digitação,
não. E o erro precisa ter **cara própria** — nunca pode parecer com a tela de sucesso.

### 6. Botão diz o que ele faz, começando por verbo
> ❌ "OK" · "Continuar" · "Enviar"
> ✅ "Montar as caixas" · "Adicionar à minha lista" · "Enviei esta — ir pra próxima"

O rótulo tem que se sustentar sozinho, sem o título da tela por perto.

### 7. Corte "por favor", "note que", "clique aqui", "simplesmente"
São palavras que ocupam espaço e não carregam nada. `Clique aqui` é o pior: quem usa
leitor de tela ouve só "aqui".

### 8. Fale com a pessoa, não sobre o sistema
> ❌ "O sistema não conseguiu processar a requisição"
> ✅ "Não deu para abrir"

Sujeito da frase é **você** (a pessoa) ou **o aplicativo** — nunca "o sistema", "a
aplicação".

### 9. Nunca prometa mais do que dá pra cumprir
Regra da casa, e ela vale para o texto também: **não é "garantimos que é verdade", é
"mostramos onde desconfiar".** Mesma lógica do selo de sigilo. Se não temos como saber,
o texto diz que não temos como saber.

### 10. Leia em voz alta antes de salvar
Se você tropeçar lendo, a pessoa tropeça entendendo. É o teste mais barato que existe
e o único que pega ritmo ruim.

---

## Regras da casa (não negociáveis neste app)

- **Toda string nova nasce dentro de `t('...')`** + tradução em `src/locales/pt.json`
  e `src/locales/en.json`, na mesma etapa. Sem exceção.
- **Nada de "diagnóstico" ou "exame clínico"** — as terapias são "análise energética/
  funcional". O aviso médico obrigatório continua valendo.
- **O Rafa é disléxico.** Linha curta, parágrafo de no máximo três linhas, nada de
  parede de texto. Uma ideia por parágrafo.
- **Título e rótulo sem ponto final.** Frase corrida com ponto.
- **Maiúscula só no começo e em nome próprio.** `Montar as caixas`, não `Montar As Caixas`.
- **Emoji só quando ele carrega informação** (🔒 cadeado, ⚠️ risco, ✓ feito). Emoji de
  simpatia (😅 🎉 ✨) não entra.
- **Número concreto ganha de adjetivo.** "cabe o texto de uma página" > "cabe pouco".
- **Nunca supor o gênero de quem usa.** "a outra pessoa", "quem recebe", "quem lê".

---

## Como revisar um texto que já existe

Passe nesta ordem. As três primeiras pegam 80% do que incomoda:

1. **Metáfora bate?** Leia SÓ os rótulos de botão e títulos, na sequência em que a
   pessoa os vê. Eles contam a mesma história? Ou cada tela inventou uma palavra?
2. **Alguma frase explica o programa em vez do resultado?** Reescreva pelo efeito.
3. **Onde a pessoa hesitaria?** Falta um porquê ali? Sobra explicação onde ninguém
   duvida?
4. Palavra longa que tem uma curta equivalente.
5. "Por favor", "note que", "simplesmente", "apenas", "basta".
6. Erro com piada, erro vago, erro que parece sucesso.
7. Botão que não se sustenta fora do contexto.
8. Leia tudo em voz alta.

Ao entregar a revisão: **mostre antes e depois lado a lado e diga qual regra puxou a
mudança.** Revisão sem motivo declarado vira questão de gosto, e aí não dá pra discutir.

---

## Fontes

Destiladas de guias públicos e bem avaliados, não inventadas:

- **[GOV.UK — Writing for user interfaces](https://www.gov.uk/service-manual/design/writing-for-user-interfaces)**
  e **[Content design](https://www.gov.uk/guidance/content-design/writing-for-gov-uk)** — a
  referência mais dura em linguagem simples. Pesquisa deles: 80% das pessoas preferem a
  frase em inglês claro, e **quanto mais complexo o assunto, maior a preferência.**
- **[Mailchimp Content Style Guide](https://styleguide.mailchimp.com/tldr/)** (aberto,
  Creative Commons) — "valorize clareza acima de entretenimento"; "eduque sem
  condescendência".
- **[mailchimp/content-style-guide no GitHub](https://github.com/mailchimp/content-style-guide)**
- **Kinneret Yifrah, "Microcopy: The Complete Guide"** — microcopy como construção de
  confiança, não como enfeite.
- **Nielsen Norman Group** — as quatro dimensões de tom (humor, formalidade, respeito,
  entusiasmo) e a medição de que o texto muda a percepção da marca.
- **Shopify Polaris** e **Atlassian** — sistemas de conteúdo abertos, úteis pra padrão
  de rótulo e hierarquia.
