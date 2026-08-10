# Brief: Servidor próprio no HD externo (modelo Jellyfin)

> Documento de discussão — **nenhuma linha de código será escrita sem "PODE CODAR"**.
> Complementa `plano-burnstore.md` (visão) e `plano-execucao.md` (etapas 0–11).
> Data: agosto/2026.

---

## 1. O que eu entendi do seu pedido

- Momento de **economia financeira**: não quer pagar hospedagem de vídeo.
- Quer os vídeos e materiais **no seu HD externo**, servidos por um servidor seu.
- O HD tem que ser **portátil entre os dois computadores** — pluga num, funciona; pluga no outro, funciona igual.
- Quer **miniaturas** dos vídeos, com um lugar para colocá-las.
- Quer um **painel de controle** geral, além da edição direta na vitrine — as duas formas convivendo.
- Quer **trocar a fonte de um vídeo facilmente** (servidor seu ↔ Vimeo ↔ YouTube), clicando na miniatura ali mesmo.
- Quer que seja **plug and play**, com **cards instrutivos** onde houver qualquer complicação.
- Referência de qualidade: **Jellyfin/Jellyflix** e boas práticas de projetos consolidados.

---

## 2. A analogia que organiza tudo

O Jellyflix que você admira é, na verdade, **duas coisas separadas**:

| Peça | O que faz | No seu caso |
|---|---|---|
| **Jellyfin** (o servidor) | Varre o HD, lê os arquivos, gera miniatura, descobre duração, serve o vídeo | ❌ **Não existe ainda** |
| **Jellyflix** (a vitrine) | Interface bonita estilo Netflix, fileiras, capas, hover | ✅ **Você já tem** — é a sua aba Curso |

**Você já construiu a parte difícil de aparência. O que falta é o motor do porão.**

Isso é uma boa notícia: não precisamos redesenhar nada da vitrine. Precisamos construir a peça que hoje não existe e conectar as duas.

---

## 3. O ponto cego — a pergunta que decide toda a arquitetura

Seu site mora **na nuvem** (Lovable). Seus alunos acessam **pela internet**. Se o vídeo está num HD na sua casa, existe uma consequência que precisa ficar explícita:

> **O vídeo só existe para o aluno enquanto o seu computador estiver ligado, com o HD plugado e a internet funcionando.**

Você desligou o PC para dormir? O curso saiu do ar. Faltou luz? Saiu do ar. Levou o HD para o outro computador? Saiu do ar no intervalo.

Isso **não é motivo para desistir** — é motivo para decidir conscientemente. Existem três caminhos, e o melhor é combinar dois deles.

### As três formas de o aluno receber o vídeo

| | Onde mora | Custo | Aluno assiste | Bom para |
|---|---|---|---|---|
| 💾 **Só no HD** | HD externo | **R$ 0** | Só você | Acervo bruto, edição, arquivo |
| 🏠 **Servido de casa** | HD + túnel público | **R$ 0** | Só com o PC ligado | Testes, turma pequena, conteúdo pesado |
| ☁️ **Nuvem barata (R2)** | Cloudflare R2 | **~US$ 1,50/mês por 100 GB** | Sempre | Conteúdo pago, aulas principais |
| 🎬 **YouTube/Vimeo** | Plataforma externa | Grátis (YouTube) | Sempre | Aulas-isca gratuitas (ainda ganha alcance e busca) |

### Por que eu recomendo o híbrido, e não o servidor puro

"Economia financeira" não é o mesmo que "custo zero a qualquer preço". Repare no número:

- **Cloudflare R2**: 10 GB grátis; depois **US$ 0,015/GB/mês**, e — o detalhe que muda tudo — **banda de saída custa ZERO**, em qualquer volume.
- 100 GB de aula no R2 = **US$ 1,50/mês**. Menos que um café.
- Compare com Amazon S3, onde a saída custa ~US$ 0,09/GB: 100 GB assistidos = **US$ 9 só de banda**, todo mês. É a banda que quebra, não o armazenamento.
- ⚠️ Vale notar: o **Supabase Storage que você usa hoje** (o upload de 500 MB no editor) cobra egress caro. É justamente o modelo que R2 evita.

**Minha recomendação concreta:**

> **O HD externo é a fonte da verdade — o seu arquivo-mestre, onde tudo mora em qualidade máxima.**
> **A nuvem barata é a vitrine — só o que está publicado, só na versão comprimida.**
> **O servidor de casa é a ponte** — para testar, para conteúdo pesado, e para não pagar nada enquanto o curso é pequeno.

Você começa 100% grátis (💾 + 🏠), e sobe aula por aula para o R2 conforme o curso ganha aluno pagante. Um botão faz a mudança. Nada é irreversível.

---

## 4. O que o Jellyfin ensina — e o que copiar de verdade

Estudei o que faz o Jellyfin funcionar bem. Seis lições valem ouro aqui, e uma coisa **não** deve ser copiada.

### ✅ 1. A pasta é a interface (a lição mais importante)
No Jellyfin **não existe "fazer upload"**. Você põe o arquivo numa pasta com um nome padronizado e manda o servidor varrer. Ele descobre o resto.

Para você isso é enorme: **o melhor painel de upload é o Explorer do Windows, que você já sabe usar.** Arrastar arquivo para pasta é mais rápido e mais confiável que qualquer formulário que eu construa.

Estrutura proposta:

```
PLASMA  (o HD externo, com esse rótulo de volume)
├── INICIAR-SERVIDOR.bat        ← duplo clique. É só isso.
├── servidor/
│   ├── node/                   ← Node portátil (não precisa instalar nada)
│   ├── ffmpeg/                 ← ffmpeg + ffprobe portáteis
│   ├── app.js
│   └── biblioteca.db           ← catálogo local (SQLite, um arquivo só)
└── midia/
    └── curso-bioressonancia/
        ├── capa.jpg
        ├── 01-fundamentos/
        │   ├── 01-o-que-e.mp4
        │   ├── 01-o-que-e.jpg      ← miniatura (opcional — gera sozinho)
        │   ├── 01-o-que-e.pt.vtt   ← legenda
        │   ├── 01-o-que-e.md       ← apostila
        │   └── 01-o-que-e.json     ← ficha do vídeo (o servidor escreve)
        └── 02-pratica/
```

**A estrutura de pastas vira a estrutura do curso.** Você organiza no Explorer, clica em "varrer", e o curso se monta.

### ✅ 2. Varredura, não cadastro
Um botão **"Procurar novidades"**. Ele compara a pasta com o catálogo e mostra: *"3 vídeos novos encontrados"*. Você confirma. Pronto.

### ✅ 3. Miniatura por convenção + geração automática
O Jellyfin procura uma imagem ao lado do arquivo (`poster.jpg`, `folder.jpg`). Se não acha, **extrai um quadro do próprio vídeo** com FFmpeg.

Você ganha os dois: se puser um `.jpg` com o mesmo nome do vídeo, ele usa o seu; se não puser, ele gera um automaticamente e você pode trocar depois clicando na miniatura na vitrine.

### ✅ 4. FFprobe preenche o que você digita à mão hoje
Hoje o campo **duração** no editor de aula é digitado manualmente. O FFprobe lê duração, resolução e formato do arquivo em milissegundos. Um trabalho a menos, para sempre.

### ✅ 5. A ficha viaja junto com o arquivo (o "NFO" do Jellyfin)
O Jellyfin escreve um arquivo de metadados ao lado do vídeo. Vamos fazer igual, em `.json`.

**Por que isso importa muito no seu caso:** é o que faz o HD ser genuinamente portátil. Título, descrição e — principalmente — o **ID do vídeo** ficam gravados no HD. Se o banco de dados sumir, se você levar o HD para o outro computador, se renomear a pasta: a informação está lá e o vínculo se refaz sozinho.

### ✅ 6. ID estável, não caminho de arquivo
O Jellyfin tem um problema conhecido: renomeou o arquivo, ele perde o vínculo e o progresso do usuário some. Evitamos isso gravando o ID no `.json` na primeira varredura. Renomeou? Ele reencontra pelo ID, não pelo nome.

### ❌ O que NÃO copiar: transcodificação em tempo real
É a parte mais pesada e complicada do Jellyfin — converter o vídeo na hora, esquentando o processador. Ela resolve um problema que **você não tem**: o Jellyfin recebe arquivos de origens variadas e imprevisíveis.

Você controla seus próprios arquivos. **Exporte tudo em MP4 / H.264 / AAC** e toca em qualquer navegador, celular e TV, sem conversão nenhuma. Isso elimina a maior fonte de complexidade do projeto de uma canetada.

---

## 5. A ideia central de modelagem: um vídeo, várias fontes

Hoje o banco guarda **uma** fonte por vídeo (`provider` + `ref`). Proponho mudar para **várias fontes por vídeo, com prioridade** — que é como o Jellyfin trata múltiplas versões do mesmo filme.

```
vídeo "Aula 01 — O que é bioressonância"
   ├── 💾 HD          E:\midia\...\01-o-que-e.mp4      (mestre, 4 GB)
   ├── 🏠 casa        https://midia.flordeplasma...     (mesma origem, comprimido)
   ├── ☁️ R2          https://cdn.flordeplasma...       (publicado)
   └── 🎬 YouTube     dQw4w9WgXcQ                       (versão isca)
```

Isso resolve **três pedidos seus de uma vez só**:

1. **Trocar a fonte facilmente** → é só arrastar a prioridade, ou clicar num selo.
2. **Fallback automático** → servidor de casa caiu? O player cai sozinho para a cópia do R2 ou do YouTube. O aluno não vê erro.
3. **"Usado em"** → você enxerga de relance onde cada cópia do vídeo existe.

Sem isso, "trocar de fonte" significa apagar uma informação e digitar outra — e perder o rastro da anterior.

### 5.1 — Refinamento confirmado pelo Rafa (agosto/2026)

O caminho de crescimento foi confirmado e ficou mais concreto:

> *"No início o micro ligado mesmo, sem problema. Quando entrarem os alunos, eu assino o Vimeo e subo tudo o que está no servidor pra lá. Visualmente vai ter a mesma estrutura — eu só troco de onde vem cada um. E quando eu quiser atualizar, eu subo de volta do meu backup. Um sistema que permite crescer de forma equilibrada e sustentável."*

Duas consequências de projeto que isso traz, e que **não estavam no brief original**:

**a) O destino de nuvem escolhido é o Vimeo, não o R2.**
Decisão do Rafa, e é legítima: mais caro que o R2, porém traz o player, a proteção por domínio e o controle de download prontos — menos peças para manter. O modelo de fontes múltiplas trata Vimeo, R2 e YouTube exatamente igual, então **essa escolha não precisa ser feita agora e pode mudar depois sem retrabalho**. O R2 permanece registrado como alternativa caso o custo do Vimeo incomode.

**b) Republicar precisa ser um fluxo de primeira classe — não um remendo.**
O Rafa vai atualizar um vídeo no HD e querer "subir de volta nos lugares". Isso significa que o sistema precisa saber **qual cópia está velha**:

- Cada vídeo do HD ganha uma **impressão digital** (hash do arquivo) e uma data de modificação.
- Cada fonte publicada guarda **qual versão do mestre ela representa**.
- Quando o mestre muda, o painel marca sozinho: **⚠️ "A cópia do Vimeo é mais antiga que o arquivo no HD"**, com um botão **"Republicar"**.
- A referência (o ID do Vimeo) é **substituída no lugar**, então nenhum link de aula quebra. O aluno não percebe nada além do vídeo novo.

Sem isso, a atualização vira aquele problema clássico: em três meses ninguém lembra se o que está no ar é a versão final ou a penúltima. É o mesmo raciocínio do inventário de vídeos que já está no `plano-burnstore.md` (item 15) — só que agora aplicado às **versões**, não só à localização.

> Esse aviso de "cópia desatualizada" entra na **Etapa C**, junto com o seletor de fontes.

---

## 6. O HD entre os dois computadores — os problemas reais e como resolver

Isso funciona bem, mas tem quatro armadilhas clássicas. Todas têm solução conhecida:

| Armadilha | Por que acontece | Solução |
|---|---|---|
| **A letra do drive muda** (`E:` num PC, `F:` no outro) | O Windows atribui por ordem de conexão | **Nunca gravar caminho absoluto.** Tudo relativo à raiz do HD; o `.bat` descobre a letra sozinha pelo **rótulo do volume** (`PLASMA`) |
| **Node instalado nos dois PCs** | Instalador cria dependência da máquina | **Node portátil** (versão .zip) dentro do próprio HD. Zero instalação nos computadores |
| **Banco de dados fica no PC** | Configuração some ao trocar de máquina | **SQLite**: o banco é um arquivo só, dentro do HD. Vai junto |
| **Tirar o HD no meio da escrita corrompe o banco** | SQLite escrevendo quando o cabo sai | Botão **"Desligar servidor com segurança"** antes de ejetar, e o `.json` ao lado de cada vídeo como rede de segurança |

Resultado: **pluga o HD em qualquer um dos dois PCs, duplo clique no `INICIAR-SERVIDOR.bat`, e é exatamente o mesmo sistema.** Nada de configurar de novo.

### Backup — resolvido pelo Rafa (agosto/2026)

> *"Serão 2 a 3 HDs com o mesmo arquivo, sempre terei um backup."*

Risco encerrado. Mas ter **várias cópias muda dois pontos do projeto**, e para melhor:

**a) Identificar o HD pelo rótulo passa a ser má ideia.**
Se os 2–3 HDs forem clones, todos teriam o mesmo rótulo de volume — e com dois plugados ao mesmo tempo o Windows não sabe qual é qual. O `INICIAR-SERVIDOR.bat` deve procurar um **arquivo marcador na raiz** (ex.: `.plasma-raiz`), varrendo as letras disponíveis. Robusto, e funciona igual em qualquer cópia, em qualquer computador, sem configurar nada.

**b) Manter as cópias em dia é trabalho de ferramenta pronta, não nossa.**
Espelhar HD é problema resolvido há décadas — não vamos escrever isso:
- **FreeFileSync** (open source, GPL, interface visual, salva o "trabalho de espelhamento" e roda com um clique) — a recomendação.
- **robocopy /MIR** (já vem no Windows) se você preferir um `.bat`.

⚠️ **A armadilha do espelhamento:** o modo espelho apaga no destino o que sumiu na origem. Se um arquivo corromper ou for apagado por engano no HD principal, o próximo espelhamento **propaga o estrago** para os backups. Por isso a regra: **um dos 3 HDs nunca é espelhado automaticamente** — ele é atualizado à mão, de tempos em tempos. É o que separa "backup" de "cópia do mesmo erro".

---

## 7. Os dois painéis — e por que você está certo em querer os dois

Você quer editar na vitrine **e** ter um painel geral. Isso não é indecisão, é o padrão consolidado (Notion, Figma, WordPress fazem assim):

| | Para quê | Estado hoje |
|---|---|---|
| **Edição na vitrine** (`/curso`) | Ajuste rápido, no contexto. "Essa miniatura está feia" → clica e troca | ✅ Já existe (mover, destacar, gratuito/pago) |
| **Painel geral** (`/curso/admin`) | Trabalho em lote, visão de conjunto, o que não cabe na vitrine | ✅ Existe, mas é **lista de texto** |
| **Central de Mídia** (novo) | Conversa com o servidor do HD: ligado/desligado, espaço livre, varredura, publicar | ❌ Não existe |

**O que falta na vitrine:** clicar na miniatura e trocar a imagem ali mesmo; clicar num selo e trocar a fonte do vídeo ali mesmo.

**O que falta no painel:** virar **grade visual de miniaturas** (estilo Jellyfin), não lista de texto. Você reconhece vídeo por imagem muito mais rápido que por nome de arquivo.

**Sobre os cards instrutivos:** boa notícia — o componente `HelpCard` com o botão de ligar/desligar ajuda **já existe** no projeto. É só continuar usando em cada tela nova. A regra que proponho: **toda tela nova nasce com o card de ajuda escrito junto**, nunca "depois".

---

## 8. Riscos honestos — o que pode dar errado

Registrando para você decidir de olhos abertos, não para assustar:

1. **PC ligado o tempo todo** = conta de luz, desgaste, barulho no ambiente de trabalho. Se isso incomodar, um mini PC usado (R$ 500–800) resolve melhor que o desktop principal.
2. **Sua banda de upload é o teto de audiência.** Uma aula em 1080p bem comprimida consome ~3 Mbps por aluno assistindo ao mesmo tempo. **Precisamos medir seu upload real** (teste em fast.com) antes de contar com isso.
3. **Cloudflare Tunnel para vídeo é zona cinzenta.** A restrição histórica de vídeo (a famosa cláusula 2.8) hoje se aplica ao CDN com cache, e o Tunnel não cacheia por padrão — milhares de usuários de Jellyfin usam assim sem problema. Mas **não é uma garantia contratual**. Se um dia apertarem, o plano B é o R2.
4. **Conteúdo pago sem proteção vaza.** Se o vídeo é uma URL direta, o aluno copia o link e manda no WhatsApp. Para conteúdo pago precisamos de **link assinado que expira** (ex.: vale 2 horas, amarrado ao aluno). Vale fazer desde o começo — remendar depois é pior.
5. **Queda silenciosa.** Internet caiu às 3h da manhã e você só descobre pela reclamação do aluno. Por isso o **monitor de saúde** e o **fallback automático** do item 5 não são luxo: são o que separa "servidor caseiro" de "servidor amador".

---

## 9. Plano proposto — cada etapa termina funcionando

Seguindo o princípio que já está no seu plano de execução: nada de etapa que só faz sentido depois da seguinte.

### Etapa A — Miniaturas e grade visual · *meio dia* · **sem servidor nenhum**
Ganho imediato, independente de todo o resto.
- Campo de miniatura por vídeo no banco (hoje só o curso tem capa).
- Trocar miniatura **clicando na imagem** na vitrine e no painel.
- Painel de vídeos vira **grade visual** em vez de lista de texto.

**Pronto quando:** você reconhece qualquer vídeo batendo o olho.

### Etapa B — O servidor do HD, versão mínima · *1 dia* · **só na sua rede, nada exposto**
- `INICIAR-SERVIDOR.bat` que descobre a letra do drive sozinho.
- Node + FFmpeg portáteis no HD; banco SQLite no HD.
- Varredura da pasta `midia/`, com FFprobe pegando duração/resolução e FFmpeg gerando miniatura.
- Ficha `.json` gravada ao lado de cada vídeo.
- Botão "Procurar novidades".

**Pronto quando:** você joga um arquivo na pasta, clica em varrer, e ele aparece com miniatura e duração — tudo sozinho.

### Etapa C — Ponte com o site · *1 dia*
- Tabela de **fontes múltiplas** por vídeo (item 5).
- Túnel público para o servidor de casa.
- Seletor de fonte 💾/🏠/☁️/🎬 clicável na vitrine.
- **Monitor de saúde + fallback automático.**

**Pronto quando:** o aluno assiste de fora, e se o seu PC desligar ele nem percebe.

### Etapa D — Publicar na nuvem barata · *meio dia*
- Botão "publicar" que sobe do HD para o R2 e marca o selo ☁️.
- O R2 passa a ser também o seu backup do material publicado.

### Etapa E — Proteção do conteúdo pago · *meio dia*
- Link assinado com expiração para aula paga, no servidor de casa e no R2.

### Etapa F — Cards instrutivos
**Não é uma etapa no fim.** É regra em todas: toda tela nova nasce com o card de ajuda escrito.

---

## 10. O que eu preciso saber de você

1. **Os alunos já vão assistir de fora, ou por enquanto é só você organizando o acervo?**
   (Se for só organizar, fazemos A + B e paramos. Sai grátis e resolve muito.)
2. **Qual a velocidade de *upload* da sua internet?** — teste em fast.com e me diga o número de subida.
3. **Quantos GB de vídeo você tem hoje, mais ou menos?** — decide se a nuvem custa US$ 1,50 ou US$ 15 por mês.
4. **O computador pode ficar ligado à noite?**
5. **Você já tem alguma segunda cópia desses vídeos hoje?**

---

## 11. Resumo em uma frase

> Construir o **"Jellyfin do Flor de Plasma"**: um servidor que roda de dentro do HD externo, que trata a **pasta como interface**, gera **miniatura e duração sozinho**, grava a **ficha ao lado de cada arquivo** para o HD ser portátil de verdade — e conectá-lo à vitrine que você já tem, com **cada vídeo podendo ter várias fontes** e cair sozinho para a próxima quando uma falhar.

---

## Fontes consultadas

- Cloudflare R2 — preço e egress zero: <https://egresscost.com/cloudflare/>
- Cloudflare ToS 2.8 e Tunnel para vídeo: <https://community.cloudflare.com/t/are-occasional-video-streams-via-cloudflare-tunnels-against-free-plan-rules/789491> · <https://blog.cloudflare.com/updated-tos>
- Jellyflix (vitrine estilo Netflix para Jellyfin): <https://github.com/ocervell/jellyflix>
