DROP POLICY IF EXISTS "operator readable" ON public.operator_settings;

CREATE POLICY "operator readable by authenticated"
  ON public.operator_settings
  FOR SELECT TO authenticated
  USING (true);

REVOKE SELECT ON public.operator_settings FROM anon;

REVOKE SELECT ON public.videos FROM anon;

GRANT SELECT (
  id,
  title_pt,
  title_en,
  provider,
  ref,
  duration_seconds,
  is_free,
  thumb_url
) ON public.videos TO anon;