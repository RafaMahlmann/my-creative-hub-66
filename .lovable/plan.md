

## Ajustar Posicao da Medalha no iPad/Desktop para Corresponder ao Mobile

### Analise

Atualmente o codigo usa dois valores diferentes:
- **Mobile**: `pt-[calc(33vh-3rem)]` -- medalha mais alta (sua preferencia)
- **iPad/Desktop**: `pt-[calc(38.2vh-5rem)]` -- medalha mais baixa

A sua versao preferida (primeira foto) usa o valor do mobile, que posiciona a medalha a ~33% do topo. Isso esta mais proximo da **regra dos tercos** (33.3%), que e uma variacao classica da proporcao aurea usada em fotografia e design.

### Mudanca

**Arquivo: `src/components/HeroSection.tsx`, linha 155**

Unificar o padding para que iPad e desktop tambem usem a posicao mais alta:

- De: `pt-[calc(33vh-3rem)] md:pt-[calc(38.2vh-5rem)]`
- Para: `pt-[calc(33vh-3rem)] md:pt-[calc(33vh-4rem)]`

O `md` agora usa `33vh-4rem` (em vez de `38.2vh-5rem`), mantendo a medalha na mesma zona visual em todas as telas, com um pequeno ajuste de rem para compensar o tamanho maior da fonte/espacamento no desktop.

Nenhuma outra alteracao necessaria.
