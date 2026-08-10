const KEY = 'dev-admin-ui';

/**
 * Destrava as TELAS de admin no desenvolvimento local, para conferir layout
 * sem uma sessão real.
 *
 * Duas garantias, nesta ordem:
 *
 * 1. `import.meta.env.DEV` é trocado por `false` na hora do build, então em
 *    produção este caminho vira código morto e some do pacote. Não existe
 *    jeito de ligar isso no site publicado.
 * 2. Mesmo ligado, **não concede permissão alguma**: quem decide o que pode
 *    ser lido e escrito é o RLS do banco, que continua exigindo o papel de
 *    admin. Nenhuma gravação passa por aqui — só a interface aparece.
 *
 * Liga com `?devadmin=1` na URL, desliga com `?devadmin=0`.
 */
export function isDevAdminUI(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    const q = new URLSearchParams(window.location.search).get('devadmin');
    if (q === '1') localStorage.setItem(KEY, '1');
    if (q === '0') localStorage.removeItem(KEY);
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
