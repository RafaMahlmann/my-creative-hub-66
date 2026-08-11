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

GRANT EXECUTE ON FUNCTION public.verificar_comprovante(text) TO anon, authenticated;