import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// O texto do termo é lido do banco (consent_terms, versão ativa) no momento do
// aceite — nunca vem do corpo da requisição.
//
// Já esteve fixo aqui, com a intenção correta de impedir que o frontend
// assinasse um texto diferente do exibido. O efeito, porém, era o oposto:
// ativar uma versão nova no banco mudava o que o aluno LIA na tela, mas não o
// que ele ASSINAVA — o hash e a versão continuavam presos ao texto congelado
// no código. Registro e tela divergiam, que é exatamente a falha que aquele
// desenho queria evitar.
//
// Ler do banco server-side preserva a proteção (o cliente segue sem
// influenciar o texto assinado) e elimina a divergência: a mesma linha que
// alimenta a tela alimenta o hash.

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

    const { data: term, error: termError } = await service
      .from("consent_terms")
      .select("version, text_content")
      .eq("term_kind", "student")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Falha fechado: sem termo ativo não existe o que assinar. Gravar um aceite
    // apontando para uma versão indeterminada seria pior que recusar.
    if (termError || !term) {
      console.error("Active term error:", termError);
      return new Response(JSON.stringify({ error: "Nenhuma versão ativa do termo" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const canonicalText = term.text_content
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
        term_version: term.version,
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
