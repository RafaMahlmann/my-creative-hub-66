# Chaves de API: trazer a estrutura madura do Vox para a área de cursos

## O que eu fui olhar

Li o repositório `RafaMahlmann/Meutranscritor` (o Vox) e comparei com o que existe aqui.
O Vox tem, pronto e testado em uso real, exatamente a peça que falta no nosso projeto:
um sistema de chaves de API do próprio usuário, com troca de provedor, teste de conexão,
reserva automática e mensagens de erro que a pessoa entende.

O print que você mandou mostra o outro lado do mesmo buraco: o servidor imprime
`Falha ao gerar legenda: Falta a chave do groq. Configure no painel.` no terminal —
e o site não fica sabendo de nada. Falha silenciosa, exatamente como você descreveu.

## O que o Vox tem que dá para trazer (e o quanto custa)

| # | O que é lá no Vox | Vale aqui? | Esforço |
|---|---|---|---|
| 1 | **Registro de provedores** (`_txtAITargets`): cada provedor é uma linha com url, chave, modelo e nome. Trocar de provedor = trocar uma linha | Sim — é o coração | baixo |
| 2 | **Reserva automática**: se o provedor escolhido falha, tenta o próximo que tem chave configurada, na ordem de preferência | Sim | baixo |
| 3 | **Presets prontos** (`TXTAI_PRESETS`): Groq, OpenAI, Gemini, DeepSeek, OpenRouter, Cerebras, Kimi, Z.ai, Ollama e LM Studio — todos falando o formato OpenAI, com o link de onde pegar a chave | Sim, muito | baixo |
| 4 | **Erros traduzidos** (`_friendlyAIError`): 401 vira "a chave não foi aceita", 402 vira "os créditos acabaram", falha de rede vira "o serviço está no ar?" | Sim — é o antídoto da falha silenciosa | baixo |
| 5 | **Retry inteligente**: 429 lê o "try again in Xs" do próprio provedor e espera sozinho; 400 por parâmetro recusado tira o parâmetro e refaz | Sim | baixo |
| 6 | **Testar conexão** antes de precisar: botão que valida a chave na hora e mostra selo "ativo" | Sim | baixo |
| 7 | **Backup das chaves com senha** (AES-GCM + PBKDF2, arquivo `.json` para guardar) | Sim, na fase 2 | médio |
| 8 | **Lista de modelos ao vivo** (`/models`): pergunta ao provedor quais modelos existem hoje, em vez de nome fixo que envelhece | Sim — evita legenda quebrar quando um modelo sai do ar | baixo |
| 9 | **Detecção do servidor local + tela de instruções** (`checkAndStartServer`): duas telas diferentes — "nunca instalou" e "só precisa ligar" — e some sozinha quando o servidor sobe | Sim, e resolve a sua reclamação de clicar e não acontecer nada | médio |
| 10 | **Caminho do `.bat` guardado** com botão "copiar caminho" | Sim | baixo |

## O que eu vi que você talvez não esteja vendo

- **Uma chave só serve para tudo.** A mesma chave Groq que gera a legenda no servidor
  serve para limpar o texto da apostila, para o tutor do módulo e para traduzir a legenda
  PT↔EN. Hoje esses três caminhos passam pelo Lovable AI (créditos seus). Com a chave
  própria, o custo cai para perto de zero e você deixa de depender de nós.
- **O Ollama/LM Studio no preset é um detalhe grande.** Como o servidor do HD já roda na sua
  máquina, dá para ligar uma IA local ao lado dele e ter apostila e tutor sem internet.
- **A ordem de reserva é uma rede de proteção pedagógica.** Aluno perguntando ao tutor às
  22h com a Groq no limite do minuto não pode receber erro — cai na segunda chave e segue.
- **Estado do servidor precisa virar painel, não texto.** Fila de legendas, etapa atual, erro
  da última tentativa — você é visual, e hoje o único lugar que conta a verdade é o terminal.

## Como isso muda o plano anterior

O plano que te passei tinha 4 itens. Fica assim:

| Antes | Agora |
|---|---|
| 1. Destravar site ↔ servidor (https bloqueando http) | **Continua igual e continua sendo o primeiro** — sem isso nada aparece |
| 2. "Na pasta do servidor" pingar o localhost e falar o que achou | **Continua, agora copiando o modelo do Vox**: duas telas (nunca instalou / só ligar), fecha sozinha quando o servidor sobe |
| 3. Painel visual de legenda com chave da Groq | **Vira o item maior**: nasce a Central de Chaves inteira, não só um campo de Groq |
| 4. Ajustes no repo do servidor | **Continua, e ganha itens**: o servidor precisa expor o estado da chave e da fila em `/api/saude`, e aceitar receber a chave pelo site |
| — | **Novo**: reaproveitar a chave própria também no tutor, na limpeza de texto e na tradução de legenda |

## Proposta de execução

**Etapa A — parar a falha silenciosa (o mais urgente)**
- O site passa a ler do `/api/saude` se falta chave, se há trabalho travado e qual foi o último erro.
- Antes de o botão "gerar legenda" ficar disponível, o site já avisa que falta a chave, com o campo para colar ali mesmo.
- Botão "destravar trabalho preso".
- Enquanto o servidor não expõe esses campos, o site trata a ausência como "não sei dizer" em vez de "tudo certo".

**Etapa B — Central de Chaves (`src/lib/aiProviders.ts` + tela)**
- Registro de provedores no molde do `_txtAITargets`, com os presets do Vox.
- Chaves guardadas só no navegador do admin (`localStorage`), nunca no banco, nunca no código.
- Botão "testar conexão" por provedor, com selo de ativo.
- Erros traduzidos na voz do app.
- Ordem de reserva configurável.

**Etapa C — ligar a chave própria nas funções que hoje gastam crédito**
- Limpeza de texto da legenda, tutor do módulo e tradução PT↔EN passam a aceitar a chave do admin, caindo no Lovable AI só quando não houver chave.

**Etapa D — servidor do HD (repo separado, escrevo o que mudar)**
- `/api/saude` devolvendo `chave: ok|faltando`, `fila`, `ultimoErro`.
- Rota para receber a chave a partir do site.
- Limpar trabalho travado.

**Etapa E — backup das chaves com senha** (o AES-GCM + PBKDF2 do Vox), quando o resto estiver de pé.

## Detalhes técnicos

- Nada de copiar o `index.html` de 2 MB: o que vem para cá é a lógica, reescrita em TypeScript
  como módulo (`src/lib/aiProviders.ts`), com testes.
- Todos os provedores dos presets falam o formato OpenAI (`/chat/completions`), então um único
  cliente atende todos — é por isso que trocar de provedor lá é barato.
- Chave do admin fica no navegador. Se um dia precisar rodar do lado do servidor, aí sim entra
  como secret do backend — mas para o servidor do HD isso não se aplica.
- i18n PT/EN na mesma etapa de cada tela, como sempre.

Nada será codado sem o seu "PODE CODAR".
