-- ── Versionamento dos termos ───────────────────────────────────────────────
CREATE TABLE public.consent_terms (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_kind     text NOT NULL CHECK (term_kind IN ('student','purchase')),
  version       text NOT NULL,
  text_content  text NOT NULL,
  is_active     boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (term_kind, version)
);
GRANT SELECT ON public.consent_terms TO authenticated, anon;
GRANT ALL    ON public.consent_terms TO service_role;
ALTER TABLE public.consent_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "terms readable" ON public.consent_terms
  FOR SELECT USING (true);
CREATE POLICY "admins insert terms" ON public.consent_terms
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update terms" ON public.consent_terms
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ── Dados do operador ──────────────────────────────────────────────────────
CREATE TABLE public.operator_settings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           text NOT NULL,
  documento      text NOT NULL,
  documento_tipo text NOT NULL DEFAULT 'CPF',
  email_dpo      text NOT NULL,
  dpo_nome       text NOT NULL,
  cidade         text NOT NULL,
  sistema_nome   text NOT NULL,
  sistema_versao text NOT NULL,
  updated_at     timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.operator_settings TO authenticated, anon;
GRANT ALL    ON public.operator_settings TO service_role;
ALTER TABLE public.operator_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "operator readable" ON public.operator_settings FOR SELECT USING (true);
CREATE POLICY "admins update operator" ON public.operator_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_operator_settings_updated_at
  BEFORE UPDATE ON public.operator_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Aceite do aluno ────────────────────────────────────────────────────────
CREATE TABLE public.student_consents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text NOT NULL,
  email           text,
  cpf_typed       text NOT NULL,
  birth_date      date,
  phone           text,
  cep             text,
  street          text,
  number          text,
  complement      text,
  neighborhood    text,
  city            text,
  state           text,
  ip              text,
  user_agent      text,
  accepted_at     timestamptz NOT NULL DEFAULT now(),
  term_version    text NOT NULL,
  term_text_hash  text NOT NULL,
  UNIQUE (student_id)
);
GRANT SELECT, INSERT ON public.student_consents TO authenticated;
GRANT ALL            ON public.student_consents TO service_role;
ALTER TABLE public.student_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student reads own consent" ON public.student_consents
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "student inserts own consent" ON public.student_consents
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

-- ── Aceite de compra ───────────────────────────────────────────────────────
CREATE TABLE public.purchase_consents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id        text NOT NULL,
  full_name       text NOT NULL,
  email           text,
  cpf_typed       text NOT NULL,
  ip              text,
  user_agent      text,
  accepted_at     timestamptz NOT NULL DEFAULT now(),
  term_version    text NOT NULL,
  term_text_hash  text NOT NULL,
  UNIQUE (order_id)
);
GRANT SELECT, INSERT ON public.purchase_consents TO authenticated;
GRANT ALL            ON public.purchase_consents TO service_role;
ALTER TABLE public.purchase_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buyer reads own purchase consent" ON public.purchase_consents
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "buyer inserts own purchase consent" ON public.purchase_consents
  FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());

-- ── Flag no perfil ─────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_accepted_terms boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.fn_set_student_terms_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET has_accepted_terms = true WHERE user_id = NEW.student_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_set_student_terms_accepted
  AFTER INSERT ON public.student_consents
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_student_terms_accepted();

-- ── Dados iniciais ─────────────────────────────────────────────────────────
INSERT INTO public.operator_settings (nome, documento, documento_tipo, email_dpo, dpo_nome, cidade, sistema_nome, sistema_versao)
VALUES ('Rafael Reis Malhmann', '025.689.409-48', 'CPF', 'flordeplasmaprojetos@gmail.com', 'Rafael Reis Malhmann', 'São José dos Pinhais - PR', 'My Digital Space', '1.0');

INSERT INTO public.consent_terms (term_kind, version, is_active, text_content) VALUES
('student', '1.0', true,
'TERMO DE CIÊNCIA, RESPONSABILIDADE E USO — FORMAÇÃO EM PRÁTICAS INTEGRATIVAS E COMPLEMENTARES EM SAÚDE
Versão 1.0

1. NATUREZA DA FORMAÇÃO
O conteúdo oferecido por {{OPERADOR}} ({{DOC_TIPO}} {{DOC}}) tem natureza estritamente educacional e informativa, no campo das Práticas Integrativas e Complementares em Saúde (PICS), conforme a Política Nacional de Práticas Integrativas e Complementares (Portaria MS nº 971/2006 e atualizações).

Esta formação NÃO confere registro profissional em conselho de saúde, NÃO habilita ao exercício de profissão regulamentada e NÃO substitui formação acadêmica em qualquer área da saúde.

2. LIMITES DA PRÁTICA — DECLARAÇÃO DO ALUNO
O aluno declara compreender e se compromete a observar que as práticas ensinadas:
• não curam, não tratam e não previnem doenças;
• não constituem diagnóstico de qualquer natureza;
• não constituem prescrição terapêutica ou medicamentosa;
• não substituem avaliação, exames ou tratamentos conduzidos por profissionais de saúde legalmente habilitados.

O aluno compromete-se a NÃO divulgar, anunciar ou apresentar as práticas aprendidas como cura, tratamento, diagnóstico ou prescrição, em qualquer meio, incluindo redes sociais e material publicitário.

3. ENCAMINHAMENTO
O aluno compromete-se a orientar toda pessoa que apresente sintomas, agravos ou condições de saúde a buscar avaliação de profissional de saúde habilitado, sem desencorajar, adiar ou substituir tratamento médico em curso.

4. SUBSTÂNCIAS NATURAIS E PLANTAS MEDICINAIS
Referências a plantas medicinais, nutrientes ou suplementos apresentadas no conteúdo têm finalidade informativa e educacional e não constituem prescrição. Tais substâncias podem apresentar contraindicações e interações. O aluno declara ciência de que a orientação sobre uso é atribuição de profissional qualificado e dentro dos limites legais de sua própria formação.

5. PROTEÇÃO DE DADOS (LGPD — Lei nº 13.709/2018)
{{OPERADOR}} atua como Controlador dos dados cadastrais do aluno, tratando-os para matrícula, emissão de certificados, comunicação e cumprimento de obrigação legal.

Quando o aluno passar a atender pessoas, ELE será o Controlador dos dados desses atendidos, respondendo isoladamente pela base legal do tratamento, pela coleta de consentimento, pela segurança e pelo atendimento aos direitos dos titulares.

Encarregado (DPO): {{DPO_NOME}} — {{DPO_EMAIL}}.
Retenção: os registros de aceite são mantidos por, no mínimo, 5 (cinco) anos após o encerramento da relação, para cumprimento de obrigação legal e exercício regular de direitos.

6. USO DO MATERIAL
O material é licenciado para uso pessoal e intransferível do aluno. É vedada a reprodução, revenda, redistribuição, compartilhamento de acesso ou uso do conteúdo para ministrar formação própria sem autorização escrita de {{OPERADOR}}.

7. ACEITE ELETRÔNICO
O aluno declara ter lido integralmente este termo e manifesta aceite livre, informado e inequívoco. O aceite é registrado com data e hora do servidor, endereço IP de origem, versão do termo e hash criptográfico SHA-256 do texto assinado, garantindo a integridade e a reconstituição do conteúdo aceito.

8. FORO
Fica eleito o foro da comarca de {{CIDADE}} para dirimir controvérsias oriundas deste termo.'),
('purchase', '1.0', true,
'TERMO DE CIÊNCIA E CONDIÇÕES DE COMPRA
Versão 1.0

1. NATUREZA DO PRODUTO
Os produtos comercializados por {{OPERADOR}} ({{DOC_TIPO}} {{DOC}}) NÃO são medicamentos. Não se destinam a diagnosticar, tratar, curar ou prevenir qualquer doença.

2. FINALIDADE
Os produtos têm finalidade de bem-estar e uso no contexto de práticas integrativas e complementares. As informações fornecidas têm caráter informativo e educacional e não substituem avaliação médica, exames laboratoriais ou tratamento prescrito por profissional de saúde habilitado.

3. CONTRAINDICAÇÕES E USO RESPONSÁVEL
Substâncias naturais podem apresentar contraindicações e interações, inclusive com medicamentos de uso contínuo. Gestantes, lactantes, crianças, pessoas com condições de saúde preexistentes ou em uso de medicamentos devem consultar profissional de saúde antes do uso. O comprador declara ter lido as informações de composição e modo de uso disponibilizadas na página do produto.

4. AUSÊNCIA DE PROMESSA DE RESULTADO
Não há promessa, garantia ou expectativa de resultado terapêutico. Resultados variam conforme fatores individuais.

5. TROCA, DEVOLUÇÃO E ARREPENDIMENTO
Nos termos do art. 49 do Código de Defesa do Consumidor, nas compras realizadas fora do estabelecimento comercial o comprador pode desistir da contratação em até 7 (sete) dias corridos contados do recebimento, desde que o produto esteja lacrado e íntegro. Produtos de uso pessoal com lacre rompido não são passíveis de devolução por questões sanitárias, salvo defeito comprovado.

6. PROTEÇÃO DE DADOS
Os dados do comprador são tratados para execução do contrato, entrega, emissão fiscal e cumprimento de obrigação legal, nos termos da LGPD.
Encarregado (DPO): {{DPO_NOME}} — {{DPO_EMAIL}}.

7. ACEITE ELETRÔNICO
O comprador declara ter lido integralmente este termo. O aceite é registrado com data e hora do servidor, IP de origem, número do pedido, versão do termo e hash SHA-256 do texto assinado.

8. FORO
Fica eleito o foro da comarca de {{CIDADE}}.');