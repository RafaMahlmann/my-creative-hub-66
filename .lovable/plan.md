

## Reposicionar Foto de Perfil para o Quadrante Superior (Ponto Aureo Inverso)

### Conceito

Em vez de colocar a foto a 61.8% do topo (quadrante inferior), vamos posiciona-la a **38.2% do topo** -- que e o ponto aureo invertido. Isso mantem a fundamentacao matematica da proporcao aurea, mas coloca o rosto do terapeuta na zona de atencao primaria da pagina.

```text
Antes (61.8% do topo):              Depois (38.2% do topo):
┌─────────────────────┐             ┌─────────────────────┐
│  ████ FUNDO ████████│             │  ████ FUNDO ████████│
│  ████████████████░░ │             │  ████████████████░░ │
│  ████████████████░░ │             │        (  foto  )   │  <- 38.2% (ponto aureo)
│  ░░░░ degradê ░░░░░ │             │  ░░░░ degradê ░░░░░ │
│        (  foto  )   │  <- 61.8%   │  ░░░░░░░░░░░░░░░░░░ │
│   Nome do Terapeuta │             │   Nome do Terapeuta │
│   Frase de impacto  │             │   Frase de impacto  │
│                     │             │     [Botao CTA]     │
└─────────────────────┘             └─────────────────────┘
```

### Vantagens

- O rosto aparece antes na leitura visual (acima da dobra)
- A imagem de fundo tem mais espaco para "respirar" abaixo da foto
- O nome e a frase ficam na metade inferior, com mais espaco e conforto
- A proporcao aurea continua presente (38.2% = 1 - 61.8%)

### Mudancas no Arquivo `src/components/HeroSection.tsx`

1. **Padding-top do conteudo (linha 155)**: Trocar `pt-[calc(55vh-4rem)] md:pt-[calc(61.8vh-5rem)]` por `pt-[calc(38.2vh-4rem)] md:pt-[calc(38.2vh-5rem)]` -- posiciona a foto no ponto aureo superior.

2. **Banner de fundo permanece igual**: `h-[55vh] md:h-[61.8vh]` -- o fundo continua com a proporcao aurea, mas agora a foto fica dentro dele (no terco inferior do banner), criando a sobreposicao mais elegante.

3. **Mobile**: `pt-[calc(33vh-3rem)]` para compensar as barras do iOS, mantendo a foto no terco superior da tela visivel.

Nenhuma outra mudanca necessaria -- degradê, botao "Alterar fundo", animacoes e comportamento de edicao permanecem identicos.

