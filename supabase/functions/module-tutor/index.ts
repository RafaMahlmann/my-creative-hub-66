import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { streamText } from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";

const BodySchema = z.object({
  moduleId: z.string().uuid(),
  message: z.string().min(1).max(4000),
  language: z.enum(["pt", "en"]).default("pt"),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { moduleId, message, language } = parsed.data;

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    // Module + context
    const { data: mod } = await supabase
      .from("modules")
      .select("id, title_pt, title_en, description_pt, description_en, is_published")
      .eq("id", moduleId)
      .maybeSingle();
    if (!mod || !mod.is_published) return json({ error: "module_not_found" }, 404);

    const { data: ctx } = await supabase
      .from("module_tutor_context")
      .select("context_pt, context_en")
      .eq("module_id", moduleId)
      .maybeSingle();

    const { data: lessons } = await supabase
      .from("lessons")
      .select("title_pt, title_en, description_pt, description_en")
      .eq("module_id", moduleId)
      .eq("is_published", true)
      .order("position", { ascending: true });

    // Thread (one per user + module)
    let threadId: string | null = null;
    const { data: existing } = await supabase
      .from("chat_threads")
      .select("id")
      .eq("user_id", user.id)
      .eq("module_id", moduleId)
      .maybeSingle();
    if (existing) {
      threadId = existing.id;
    } else {
      const { data: created, error: cErr } = await supabase
        .from("chat_threads")
        .insert({ user_id: user.id, module_id: moduleId, language })
        .select("id")
        .single();
      if (cErr) return json({ error: cErr.message }, 500);
      threadId = created.id;
    }

    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("thread_id", threadId!)
      .order("created_at", { ascending: true })
      .limit(30);

    const { error: insErr } = await supabase
      .from("chat_messages")
      .insert({ thread_id: threadId!, role: "user", content: message });
    if (insErr) return json({ error: insErr.message }, 500);

    const contextText =
      (language === "en" ? ctx?.context_en : ctx?.context_pt) ||
      ctx?.context_pt ||
      ctx?.context_en ||
      "";

    const outline = (lessons ?? [])
      .map((l) => `- ${l.title_pt}${l.description_pt ? `: ${l.description_pt}` : ""}`)
      .join("\n");

    const system = [
      language === "en"
        ? "You are the AI tutor of a single course module. Always answer in English."
        : "Você é o tutor de IA de um único módulo do curso. Responda sempre em português do Brasil.",
      language === "en"
        ? "Answer ONLY questions related to this module's content. If the question is off-topic, politely say it is outside the module and suggest a related question."
        : "Responda APENAS perguntas relacionadas ao conteúdo deste módulo. Se a pergunta fugir do tema, diga com gentileza que está fora do módulo e sugira uma pergunta relacionada.",
      language === "en"
        ? "This is health-education content: never give a medical diagnosis or replace a health professional."
        : "Este é conteúdo educativo em saúde: nunca dê diagnóstico médico nem substitua um profissional de saúde.",
      `MODULE: ${mod.title_pt}${mod.description_pt ? ` — ${mod.description_pt}` : ""}`,
      outline ? `LESSONS:\n${outline}` : "",
      contextText ? `MODULE CONTEXT:\n${contextText}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const gateway = createLovableAiGatewayProvider(key);
    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system,
      messages: [
        ...(history ?? []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ],
    });

    const reply = (await result.text).trim();

    await supabase
      .from("chat_messages")
      .insert({ thread_id: threadId!, role: "assistant", content: reply });
    await supabase
      .from("chat_threads")
      .update({ updated_at: new Date().toISOString(), language })
      .eq("id", threadId!);

    return json({ threadId, reply });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unexpected error";
    return json({ error: message }, 500);
  }
});
