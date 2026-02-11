

## Melhorias no formulario de login

### 1. Enter para submeter
O formulario ja usa `<form onSubmit={handleLogin}>`, entao o Enter ja deveria funcionar. Porem, vou garantir que o botao de submit tenha foco acessivel e que nada bloqueie o comportamento padrao do Enter.

### 2. Salvar senha no navegador (autocomplete)
Para que o navegador ofereca salvar a senha, os inputs precisam dos atributos `autoComplete` corretos:
- Input de email: `autoComplete="username"` (o navegador reconhece como campo de usuario)
- Input de senha: `autoComplete="current-password"`
- Adicionar `name` nos inputs (`name="email"`, `name="password"`) para o gerenciador de senhas identificar os campos

### Alteracoes

**Arquivo: `src/components/AdminLogin.tsx`**
- Adicionar `name="email"` e `autoComplete="username"` no input de email (linha 101-108)
- Adicionar `name="password"` e `autoComplete="current-password"` no input de senha (linha 116-123)

Sao mudancas pequenas e diretas que habilitam o gerenciador de senhas do navegador.

