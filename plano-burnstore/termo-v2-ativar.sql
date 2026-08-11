-- ═══════════════════════════════════════════════════════════════════════════
-- Ativa a versão 2.0 do termo do ALUNO e aposenta a 1.0.
--
-- A 1.0 é DESATIVADA, nunca apagada: a seção 7 promete "reconstituição do
-- conteúdo aceito", e quem assinou a 1.0 continua tendo direito a recuperar
-- exatamente o texto que leu. Apagar a linha quebraria essa promessa e
-- inutilizaria o hash guardado no aceite dele.
--
-- Tudo dentro de uma transação: se o INSERT falhar depois do UPDATE, o banco
-- ficaria sem nenhum termo ativo — e aí fetchActiveTerm() lança erro e a área
-- de curso inteira trava para todo aluno. BEGIN/COMMIT garante os dois ou
-- nenhum.
--
-- NÃO mexe no termo de COMPRA (term_kind = 'purchase'), que segue na 1.0 —
-- ele ainda foi escrito para suplemento/produto natural e precisa de revisão
-- própria (ver Demandas futuras: termo-compra-alegacao-energetica).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE public.consent_terms
   SET is_active = false
 WHERE term_kind = 'student' AND version = '1.0';

INSERT INTO public.consent_terms (term_kind, version, is_active, text_content) VALUES
('student', '2.0', true,
'TERMO DE CIÊNCIA, RESPONSABILIDADE E USO — FORMAÇÃO EM PRÁTICAS INTEGRATIVAS E COMPLEMENTARES EM SAÚDE
Versão 2.0

1. NATUREZA DA FORMAÇÃO
O conteúdo oferecido por {{OPERADOR}} ({{DOC_TIPO}} {{DOC}}) tem natureza educacional e informativa, no campo das Práticas Integrativas e Complementares em Saúde (PICS), em diálogo com a Política Nacional de Práticas Integrativas e Complementares (Portaria MS nº 971/2006 e atualizações).

Esta formação NÃO confere registro profissional em conselho de saúde, NÃO habilita ao exercício de profissão regulamentada e NÃO substitui formação acadêmica em qualquer área da saúde.

2. NATUREZA E LIMITES DA PRÁTICA — DECLARAÇÃO DO ALUNO
As práticas ensinadas situam-se no campo da promoção da saúde, do bem-estar e do autocuidado, em consonância com os valores de autonomia, protagonismo e corresponsabilidade do sujeito que fundamentam a Política Nacional de Práticas Integrativas e Complementares.

O aluno declara compreender que a saúde é um processo próprio e intransferível de cada pessoa. O trabalho do praticante é oferecer condições, informação e acompanhamento para que a própria pessoa exerça o cuidado de si — nunca substituir-se a ela, nem prometer resultado em seu lugar.

O aluno compromete-se a observar que as práticas ensinadas:
• não constituem diagnóstico de qualquer natureza;
• não constituem prescrição terapêutica ou medicamentosa;
• não substituem avaliação, exames ou tratamentos conduzidos por profissionais de saúde legalmente habilitados;
• não devem ser anunciadas como cura ou tratamento de doenças, em qualquer meio, incluindo redes sociais e material publicitário.

3. ENCAMINHAMENTO
O aluno compromete-se a orientar toda pessoa que apresente sintomas, agravos ou condições de saúde a buscar avaliação de profissional de saúde habilitado, sem desencorajar, adiar ou substituir tratamento em curso.

4. NATUREZA DOS DISPOSITIVOS E MATERIAIS
As práticas e os dispositivos abordados nesta formação — incluindo o uso de metais, cristais, minerais e composições geométricas — inscrevem-se em tradições de conhecimento de diversas culturas sobre a relação entre materiais, ambiente e bem-estar, e em uma compreensão própria do ecossistema Flor de Plasma.

O aluno declara ciência de que:
• tais dispositivos são objetos de bem-estar, artesanais e de finalidade cultural e pessoal — não são dispositivos médicos, não possuem registro sanitário e não se destinam a finalidade médica, diagnóstica ou terapêutica;
• os fundamentos aqui apresentados não constituem consenso da medicina convencional e não são apresentados como tal;
• não há promessa, garantia ou expectativa de resultado;
• não envolvem radiação ionizante, fármacos ou qualquer agente de ação farmacológica.

4.1 CONFECÇÃO E COMERCIALIZAÇÃO PELO ALUNO
O aluno que vier a confeccionar ou comercializar dispositivos a partir do que aprendeu assume responsabilidade integral e exclusiva por suas próprias alegações, publicidade e relação de consumo, comprometendo-se a não apresentá-los como cura, tratamento, diagnóstico ou substituto de cuidado de saúde. {{OPERADOR}} não responde por anúncio, promessa ou prática de terceiro formado.

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
Fica eleito o foro da comarca de {{CIDADE}} para dirimir controvérsias oriundas deste termo.');

COMMIT;

-- Conferência: deve devolver 'student 1.0 false' e 'student 2.0 true'.
SELECT term_kind, version, is_active
  FROM public.consent_terms
 WHERE term_kind = 'student'
 ORDER BY version;
