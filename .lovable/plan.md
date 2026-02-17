

## Melhoria Visual do Hero com Proporcao Aurea (phi = 1.618)

### O que e a Proporcao Aurea

A proporcao aurea (phi = 1.618) divide um espaco em duas partes onde a maior esta para o todo assim como a menor esta para a maior. Aplicada ao layout, cria harmonia visual natural.

### Como Aplicar ao Hero

A secao Hero ocupa `100vh` (tela inteira). Dividindo pela proporcao aurea:

- **Banner de fundo**: 61.8% da tela (`61.8vh`)
- **Conteudo abaixo**: 38.2% da tela (`38.2vh`)

A foto de perfil fica exatamente na linha de transicao (61.8% do topo), criando o ponto focal natural.

```text
┌──────────────────────────────────┐  0%
│                                  │
│     ████████████████████████     │
│     ████  FUNDO (61.8vh) ████   │
│     ████████████████████████     │
│     ████████████████████████     │
│     ░░░░ degradê suave ░░░░░    │
│           (  foto  )            │  <- 61.8% (ponto aureo)
├──────────────────────────────────┤
│       Nome do Terapeuta         │
│      Frase de impacto           │  38.2%
│        [Botao CTA]              │
│                                  │
└──────────────────────────────────┘  100%
```

### Mudancas no Arquivo `src/components/HeroSection.tsx`

1. **Banner de fundo (linha 159)**: Trocar `h-48 md:h-64` por `h-[61.8vh]` -- o fundo ocupa exatamente a proporcao aurea da tela.

2. **Posicionamento do conteudo (linha 155)**: Trocar `flex items-center justify-center` por `flex flex-col items-center` e adicionar `pt-[calc(61.8vh-5rem)]` -- posiciona a foto de perfil no ponto aureo, com metade da foto acima e metade abaixo da linha.

3. **Degradê mais longo (linha 164)**: Usar `from-transparent via-background/20 to-background` com o degradê comecando em `top-[38.2%]` da imagem e terminando no final -- transicao suave no terco inferior do banner.

4. **Fallback sem imagem (linha 167)**: Mesma altura `h-[61.8vh]`.

5. **Mobile**: No mobile, usar `h-[55vh]` e `pt-[calc(55vh-4rem)]` para compensar barras de navegacao do iOS que reduzem o viewport real, mantendo a proporcao proxima da aurea (55/100 ~ 0.55, ajuste pratico para telas menores).

### Resultado Esperado

A foto de perfil ficara sobreposta ao banner, exatamente no "ponto de ouro" da pagina, criando aquele efeito classico de perfil (estilo redes sociais) mas com fundamentacao matematica na proporcao aurea. O degradê sera longo e suave, sem corte abrupto.

