

## Relatorio Diagnostico e Correcoes do Login Admin

### Status Atual do Backend (Verificado)

| Componente | Status | Detalhes |
|---|---|---|
| Auth (signInWithPassword) | OK | Logins com status 200, usuario `flordeplasma@gmail.com` autenticando corretamente |
| Tabela user_roles | OK | Registro existe: user_id `1e065b4b...` com role `admin` |
| Funcao has_role | OK | SECURITY DEFINER, retorna boolean, consulta simples na user_roles |
| RPC via Supabase JS | Suspeito | Pode estar travando no ambiente iframe do preview |

### Diagnostico do Problema

O fluxo de login no `AdminLogin.tsx` e:

```text
1. Usuario submete form (Enter ou clique)
2. signInWithPassword(email, password)  -->  OK (backend confirma status 200)
3. supabase.rpc("has_role", ...)        -->  SUSPEITO: pode travar no iframe
4. onSuccess()                          -->  nunca alcancado se passo 3 trava
```

**Causa provavel**: A chamada RPC `has_role` apos o login pode estar travando no ambiente iframe do preview do Lovable. O `signInWithPassword` funciona (backend confirma), mas a execucao nunca chega ao `onSuccess()`.

### Plano de Correcoes

#### 1. Adicionar logs diagnosticos detalhados

Adicionar `console.log` em cada etapa do `handleLogin` no `AdminLogin.tsx` para rastrear exatamente onde o fluxo para:

- `[AdminLogin] INICIO handleLogin`
- `[AdminLogin] signInWithPassword ENVIADO`
- `[AdminLogin] signInWithPassword RESULTADO: sucesso/erro`
- `[AdminLogin] RPC has_role ENVIADO`
- `[AdminLogin] RPC has_role RESULTADO: valor/erro`
- `[AdminLogin] onSuccess CHAMADO`

Tambem adicionar logs no `useEditMode.ts`:
- `[useEditMode] onAuthStateChange evento: {event}`
- `[useEditMode] has_role resultado: {data}`

#### 2. Garantir Enter = Clique no botao

O form ja tem `onSubmit={handleLogin}` e o botao e `type="submit"`, entao o Enter ja deveria funcionar. Mas para garantir 100%, vou adicionar um `onKeyDown` no form que dispara o submit ao pressionar Enter, como camada extra de seguranca.

#### 3. Como visualizar os logs

Para ver os logs apos o proximo teste de login:
1. Abra o site numa aba separada (nao no preview lateral): clique no icone de "abrir em nova aba" no canto superior direito do preview
2. No navegador, pressione F12 (ou Ctrl+Shift+I / Cmd+Option+I no Mac)
3. Va na aba "Console"
4. Tente fazer login
5. Os logs aparecerao no console com o prefixo `[AdminLogin]` e `[useEditMode]`

Alternativamente, apos tentar o login no preview lateral do Lovable, envie uma mensagem no chat - os logs do console serao capturados automaticamente e eu poderei ve-los.

### Detalhes Tecnicos

**Arquivo: `src/components/AdminLogin.tsx`**
- Adicionar console.log em cada ponto do fluxo handleLogin (linhas 18-58)
- Adicionar onKeyDown no form como fallback para Enter (linha 89)

**Arquivo: `src/hooks/useEditMode.ts`**
- Adicionar console.log no onAuthStateChange (linhas 24-34)

