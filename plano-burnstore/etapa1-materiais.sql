-- ═══════════════════════════════════════════════════════════════════════════
-- Etapa 1 — material de apoio com upload de verdade
--
-- Hoje, para anexar uma apostila é preciso hospedar o arquivo por conta
-- própria e colar a URL à mão. Isto cria o lugar onde os arquivos passam a
-- morar.
--
-- O bucket é PRIVADO de propósito. Público seria mais simples, mas deixaria
-- toda apostila de aula paga acessível a quem descobrisse o endereço — e o
-- endereço de bucket público é adivinhável. Privado + link que expira é o que
-- permite, mais adiante (Etapa E), liberar por matrícula sem refazer nada.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Só o admin coloca, troca e remove arquivo.
CREATE POLICY "Admins manage course materials"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'));

-- Material de aula GRATUITA e publicada: qualquer visitante gera o link, do
-- mesmo jeito que já assiste ao vídeo gratuito sem login. Sem esta policy,
-- ficaria inconsistente: vídeo grátis abre para todo mundo, mas o PDF da
-- mesma aula pediria login — mesmo padrão de junção que "Public can view
-- subtitles of published lessons" já usa.
CREATE POLICY "Public read materials of free published lessons"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'course-materials' AND EXISTS (
      SELECT 1 FROM public.lesson_materials lm
      JOIN public.lessons l ON l.id = lm.lesson_id
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE lm.storage_path = storage.objects.name
        AND l.is_free AND l.is_published AND m.is_published AND c.is_published
    )
  );

-- Material de aula PAGA: por enquanto, qualquer aluno logado gera o link —
-- ainda não checa matrícula, no mesmo estágio em que o vídeo pago está hoje
-- (ver a auditoria de segurança: "o paywall é cosmético"). Fechar isso é
-- trabalho da Etapa 7 (matrículas), para vídeo e material ao mesmo tempo.
CREATE POLICY "Signed in students read course materials"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'course-materials');

-- Guarda o caminho no bucket, separado de file_url. Assim convivem os dois
-- casos: arquivo que subimos (storage_path) e link externo legítimo, como um
-- artigo ou vídeo de terceiro (file_url).
ALTER TABLE public.lesson_materials
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS size_bytes  bigint;

-- file_url deixa de ser obrigatório: material enviado por upload não tem URL
-- fixa, o link é gerado na hora e expira.
ALTER TABLE public.lesson_materials ALTER COLUMN file_url DROP NOT NULL;

-- Precisa ter uma coisa OU a outra — nunca as duas vazias.
ALTER TABLE public.lesson_materials
  DROP CONSTRAINT IF EXISTS lesson_materials_origem_check;
ALTER TABLE public.lesson_materials
  ADD CONSTRAINT lesson_materials_origem_check
  CHECK (file_url IS NOT NULL OR storage_path IS NOT NULL);
