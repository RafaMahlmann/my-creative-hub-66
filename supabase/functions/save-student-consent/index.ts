import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Texto canônico do TERMO DO ALUNO — versão 1.0 ───────────────────────────
// Duplicado aqui de propósito: o hash é sempre calculado a partir desta cópia
// server-side, para que o frontend não possa assinar um texto diferente do
// exibido. NÃO importar este texto do frontend.
const STUDENT_TERM_VERSION = "1.0";
const STUDENT_TERM_TEMPLATE =
  `TERMO DE CIÊNCIA, RESPONSABILIDADE E USO — FORMAÇÃO EM PRÁTICAS INTEGRATIVAS E COMPLEMENTARES EM SAÚDE
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
Fica eleito o foro da comarca de {{CIDADE}} para dirimir controvérsias oriundas deste termo.`;

/** Calcula SHA-256 de uma string e retorna hex lowercase. */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  if (rem !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  if (rem !== parseInt(digits[10])) return false;

  return true;
}

const BodySchema = z.object({
  fullName: z.string().trim().min(3).max(150),
  cpf: z.string().trim().min(11).max(20),
  birthDate: z.string().trim().max(20).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email().max(255).optional().nullable(),
  cep: z.string().trim().max(15).optional().nullable(),
  street: z.string().trim().max(200).optional().nullable(),
  number: z.string().trim().max(20).optional().nullable(),
  complement: z.string().trim().max(120).optional().nullable(),
  neighborhood: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(5).optional().nullable(),
  nameTyped: z.string().trim().min(3).max(150),
  accepted: z.literal(true),
});

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anon.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // O ID do aluno vem SEMPRE do token, nunca do corpo da requisição.
    const studentId = claimsData.claims.sub as string;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos", fields: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const body = parsed.data;

    if (!validateCPF(body.cpf)) {
      return new Response(JSON.stringify({ error: "CPF inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (norm(body.nameTyped) !== norm(body.fullName)) {
      return new Response(
        JSON.stringify({ error: "O nome digitado não confere com o nome do cadastro" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: operator, error: operatorError } = await service
      .from("operator_settings")
      .select("nome, documento, documento_tipo, email_dpo, dpo_nome, cidade")
      .limit(1)
      .maybeSingle();

    if (operatorError || !operator) {
      console.error("Operator settings error:", operatorError);
      return new Response(JSON.stringify({ error: "Configuração do operador ausente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const canonicalText = STUDENT_TERM_TEMPLATE
      .replaceAll("{{OPERADOR}}", operator.nome)
      .replaceAll("{{DOC_TIPO}}", operator.documento_tipo)
      .replaceAll("{{DOC}}", operator.documento)
      .replaceAll("{{DPO_NOME}}", operator.dpo_nome)
      .replaceAll("{{DPO_EMAIL}}", operator.email_dpo)
      .replaceAll("{{CIDADE}}", operator.cidade);

    const termTextHash = await sha256(canonicalText);

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const { data: inserted, error: insertError } = await service
      .from("student_consents")
      .insert({
        student_id: studentId,
        full_name: body.fullName,
        email: body.email || null,
        cpf_typed: body.cpf,
        birth_date: body.birthDate || null,
        phone: body.phone || null,
        cep: body.cep || null,
        street: body.street || null,
        number: body.number || null,
        complement: body.complement || null,
        neighborhood: body.neighborhood || null,
        city: body.city || null,
        state: body.state || null,
        ip: clientIp,
        user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
        term_version: STUDENT_TERM_VERSION,
        term_text_hash: termTextHash,
      })
      .select("id, accepted_at, term_version, term_text_hash, ip")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return new Response(JSON.stringify({ error: "Este aluno já registrou o aceite" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Erro ao salvar o aceite" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, consent: inserted }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
