-- ═══════════════════════════════════════════════════════════════════════════
-- Verificação pública de comprovante de aceite, pelo hash.
--
-- Por que uma função e não uma consulta direta: a política de
-- student_consents é "TO authenticated" e só libera o próprio aceite — o que
-- está certo e não deve mudar. Afrouxar o RLS para permitir a verificação
-- abriria a tabela inteira; a função resolve devolvendo APENAS os dois campos
-- que não identificam ninguém.
--
-- SECURITY DEFINER faz a função rodar com os privilégios de quem a criou,
-- contornando o RLS de forma controlada: quem chama não ganha acesso à
-- tabela, só a este recorte. O SET search_path evita o ataque clássico de
-- criar um schema falso na frente do public para sequestrar a resolução dos
-- nomes.
--
-- Devolve data do aceite e versão do termo. NÃO devolve nome, CPF, e-mail
-- nem IP: quem tem o hash está conferindo integridade, não colhendo dado
-- pessoal. Sem isso, um comprovante vazado viraria consulta a dado de aluno.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.verificar_comprovante(p_hash text)
RETURNS TABLE (accepted_at timestamptz, term_version text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sc.accepted_at, sc.term_version
    FROM public.student_consents sc
   WHERE sc.term_text_hash = lower(trim(p_hash))
   LIMIT 1;
$$;

-- Pública de propósito: o objetivo é que um terceiro (um órgão, por exemplo)
-- confira sem precisar de conta.
GRANT EXECUTE ON FUNCTION public.verificar_comprovante(text) TO anon, authenticated;

-- Conferência: com um hash inexistente deve voltar zero linhas, sem erro.
SELECT * FROM public.verificar_comprovante('0000000000000000000000000000000000000000000000000000000000000000');
