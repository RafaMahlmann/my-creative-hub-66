# Legendas — o que existe de melhor, e o que eu recomendo

> Pesquisa feita em 09/08/2026 a pedido do Rafa: *"queria um sistema de legendas
> super eficiente como do YouTube ou CapCut, sem inventar a roda de novo."*
> Complementa a Etapa 6 do `plano-execucao.md`.

## A conclusão primeiro

**Nada precisa ser inventado.** As três peças do problema já têm vencedor claro,
todas gratuitas e de código aberto:

| Peça | Ferramenta | Por quê |
|---|---|---|
| **Transcrever** | **whisper.cpp** | Um executável, zero dependências, roda no seu PC, escreve VTT/SRT direto |
| **Formato** | **WebVTT** | Padrão da web, o navegador entende sozinho, sem biblioteca nenhuma |
| **Corrigir à mão** | **Subtitle Edit** | O editor de legenda mais consagrado do Windows, gratuito |

E o detalhe que fecha tudo: **whisper.cpp se instala exatamente como o FFmpeg** —
você baixa o `.exe`, joga na pasta do HD, e passa a valer nos dois computadores.
Mesmo padrão que a Etapa B já usa.

---

## 1. Transcrever: qual Whisper

O Whisper (da OpenAI) é o modelo que praticamente todo mundo usa, incluindo por
baixo de muita ferramenta paga. Ele tem três "motores" diferentes rodando o
**mesmo modelo** — a escolha é por hardware, não por qualidade:

| Motor | Melhor em | Serve para você? |
|---|---|---|
| **whisper.cpp** | CPU e Mac, binário único sem instalar nada | ✅ **É este** |
| faster-whisper | Placa NVIDIA, ~4× mais rápido | Só se você tiver GPU boa; exige Python |
| Whisper original | Referência | Pesado e lento, sem motivo aqui |
| **WhisperX** | Timing por palavra (±50 ms) + separar quem fala | Talvez depois — exige Python + PyTorch |

**Escolha: whisper.cpp.** O motivo decisivo não é velocidade, é portabilidade:
é um executável solto, sem Python, sem instalar nada — a única coisa compatível
com a ideia de "tudo mora no HD e funciona nos dois PCs".

- **Modelo sugerido:** `large-v3-turbo` (bom português, rápido). Se o PC sofrer,
  cai para `medium`.
- **Custo: zero.** Roda offline, no seu computador. Nada de API, nada por minuto.
- **Privacidade:** o áudio nunca sai da sua máquina.

> Comparação honesta: a transcrição por API (Groq, OpenAI) sai mais precisa e
> muito mais rápida, mas cobra por minuto e manda o áudio para terceiros. Para
> um acervo grande que você transcreve uma vez só, local ganha.

---

## 2. O formato: WebVTT — e ele já faz o efeito CapCut

Aqui está a descoberta que evita trabalho: **o efeito de destacar palavra por
palavra não precisa de biblioteca nenhuma.** O WebVTT tem isso embutido, através
de marcações de tempo dentro da própria legenda:

```
00:00:01.000 --> 00:00:04.000
<00:00:01.000>Hoje <00:00:01.400>vamos <00:00:01.900>falar
<00:00:02.400>sobre <00:00:02.800>bioressonância
```

O navegador entende esses tempos sozinho e vai marcando a palavra atual — dá
para estilizar com `::cue` no CSS e chegar bem perto do visual do CapCut, sem
nenhuma dependência e sem sair do padrão da web.

O outro formato capaz disso é o **ASS** (com as marcações `\k`, usado no mundo
do anime e no Aegisub). É mais poderoso visualmente, mas exige biblioteca para
tocar no navegador. **Não compensa aqui.**

> Como o whisper.cpp já entrega tempo por palavra, dá para gerar essa legenda
> "com karaokê" diretamente, sem passo extra.

---

## 3. Corrigir à mão

A IA vai errar termo técnico — "bioressonância", nomes de aparelho, jargão.
Duas camadas:

- **Ajuste rápido** (trocar uma palavra): editor simples embutido no painel,
  lista de trechos com tempo e texto. É pouco código.
- **Trabalho pesado** (retimbrar, dividir, revisar tudo): **Subtitle Edit** —
  gratuito, open source, ativo, o mais usado do mundo Windows. Ele abre o VTT
  do HD direto, você corrige e salva por cima. Não vamos reimplementar isso.

O **Aegisub** é a referência para legenda estilizada (karaokê, efeitos), e o
**Subtitle Composer** é a alternativa do mundo Linux/KDE. Nenhum dos dois
precisa entrar no projeto — são ferramentas de mesa, não código nosso.

---

## 4. Como isso encaixa no que já existe

O ganho de juntar com a Etapa B é grande, porque **um trabalho serve para três coisas**:

```
vídeo novo no HD
      │
      ├─→ FFmpeg  ──→ duração + capa            (Etapa B, pronto)
      │
      └─→ whisper.cpp ──→ legenda .vtt ao lado do vídeo
                              │
                              ├─→ botão CC no player
                              ├─→ contexto do Tutor de IA  (já existe no site)
                              └─→ busca dentro da aula ("em que minuto ele fala de X")
```

A legenda vira um arquivo `01-aula.pt.vtt` ao lado do vídeo — mesma lógica da
ficha `.json`: **viaja junto com o HD**, não fica presa a um banco.

E a versão em inglês sai de tradução automática da faixa em português, revisada
por você — como já está previsto na Etapa 6.

---

## 5. O que eu faria, em ordem

1. **Baixar o whisper.cpp** para `servidor/whisper/` no HD (igual ao FFmpeg).
2. **Gerar a legenda na varredura**, junto com duração e capa — mesmo momento,
   mesmo botão "Procurar novidades".
3. **Botão CC no player** (local e no site) lendo o `.vtt`.
4. **Editor simples de trechos** no painel, para corrigir termo errado.
5. **Estilo palavra-a-palavra** com `::cue`, se você gostar do visual.
6. **Faixa em inglês** por tradução, revisada.

Passos 1 a 3 já entregam legenda funcionando de ponta a ponta.

---

## Fontes

- Comparação dos motores Whisper: <https://northflank.com/blog/best-open-source-speech-to-text-stt-model-in-2026-benchmarks> · <https://codersera.com/blog/faster-whisper-vs-whisper-cpp-speech-to-text-2026/>
- WhisperX (timing por palavra e separação de vozes): <https://www.gladia.io/blog/best-whisper-alternatives-2026>
- WebVTT e marcação por palavra: <https://www.speechpad.com/captions/webvtt>
- Subtitle Edit: <https://github.com/SubtitleEdit/subtitleedit> · Aegisub: <https://aegisub.org/>
