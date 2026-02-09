
## Garantir que a foto de perfil salva apareça sempre

### Problema
A foto de perfil IS salva no banco de dados e no storage (confirmei ambos), mas o componente mostra o placeholder porque:
1. O hook `useSiteSettings` carrega os dados de forma assincrona -- enquanto carrega, `profilePhotoUrl` e `undefined`
2. Quando o preview recarrega (durante edições de código), há um flash do placeholder antes dos dados chegarem
3. Não há indicação visual de que os dados estão carregando

### Solução

**1. Adicionar estado de loading ao `useSiteSettings`**
- Adicionar um `isLoading` ao hook para que os componentes saibam quando os dados ainda estão sendo buscados
- Evitar mostrar o placeholder enquanto os dados não chegaram

**2. Melhorar o HeroSection para tratar o estado de carregamento**
- Enquanto `isLoading` for true, mostrar um skeleton/shimmer no lugar da foto (em vez do icone de usuario)
- Quando carregar e nao tiver foto, ai sim mostrar o placeholder

**3. Persistir settings em localStorage como cache**
- Salvar os settings em localStorage apos o fetch
- Na proxima carga, usar o cache do localStorage imediatamente enquanto o fetch atualiza em background
- Isso elimina o flash do placeholder em recarregamentos

### Detalhes Tecnicos

**Arquivo: `src/hooks/useSiteSettings.ts`**
- Adicionar `isLoading` state (inicia como `true`, vira `false` apos o fetch)
- No `useState` inicial, carregar de `localStorage.getItem("site_settings")` se existir
- Apos cada fetch bem-sucedido, salvar em `localStorage.setItem("site_settings", JSON.stringify(map))`

**Arquivo: `src/pages/Index.tsx`**
- Desestruturar `isLoading` do `useSiteSettings()`
- Passar `isLoading` para o `HeroSection`

**Arquivo: `src/components/HeroSection.tsx`**
- Adicionar prop `isLoading`
- Quando `isLoading` for true e nao houver `profilePhotoUrl`, mostrar um Skeleton circular animado no lugar do icone de usuario
- Quando `isLoading` for false e nao houver `profilePhotoUrl`, mostrar o icone de usuario normalmente
