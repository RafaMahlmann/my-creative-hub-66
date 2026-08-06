import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { streamText } from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";

const BodySchema = z.object({ moduleId: z.string().uuid() });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const stripVtt = (vtt: string) =>
  vtt
    .split(/\r?\n/)
    .filter((l) => l.trim() && !/^WEBVTT/i.test(l) && !l.includes("-->") && !/^\d+$/.test(l.trim()))
    .join(" ");

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

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { moduleId } = parsed.data;

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const { data: mod } = await supabase
      .from("modules")
      .select("title_pt, description_pt")
      .eq("id", moduleId)
      .maybeSingle();
    if (!mod) return json({ error: "module_not_found" }, 404);

    const { data: lessons } = await supabase
      .from("lessons")
      .select("title_pt, description_pt, content_pt, video_id")
      .eq("module_id", moduleId)
      .order("position", { ascending: true });

    const videoIds = (lessons ?? []).map((l) => l.video_id).filter(Boolean) as string[];
    let transcripts = "";
    if (videoIds.length) {
      const { data: subs } = await supabase
        .from("subtitles")
        .select("video_id, content")
        .in("video_id", videoIds)
        .eq("language", "pt");
      transcripts = (subs ?? []).map((s) => stripVtt(s.content)).join("\n\n").slice(0, 60000);
    }

    const source = [
      `MÓDULO: ${mod.title_pt}${mod.description_pt ? ` — ${mod.description_pt}` : ""}`,
      (lessons ?? [])
        .map((l) => `AULA: ${l.title_pt}\n${l.description_pt ?? ""}\n${l.content_pt ?? ""}`)
        .join("\n\n"),
      transcripts ? `TRANSCRIÇÕES:\n${transcripts}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const gateway = createLovableAiGatewayProvider(key);

    const run = async (lang: "pt" | "en") => {
      const result = streamText({
        model: gateway("google/gemini-3.6-flash"),
        system:
          lang === "pt"
            ? "Você resume material didático para servir de contexto a um tutor de IA. Escreva em português do Brasil, em tópicos densos: conceitos, termos, procedimentos, materiais e advertências. Sem introdução nem conclusão."
            : "You summarize course material to serve as context for an AI tutor. Write in English, dense bullet points: concepts, terms, procedures, materials and warnings. No intro, no conclusion.",
        prompt: source,
      });
      return (await result.text).trim();
    };

    const [context_pt, context_en] = await Promise.all([run("pt"), run("en")]);

    const { error: upErr } = await supabase.from("module_tutor_context").upsert(
      { module_id: moduleId, context_pt, context_en, is_auto: true },
      { onConflict: "module_id" },
    );
    if (upErr) return json({ error: upErr.message }, 500);

    return json({ context_pt, context_en });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unexpected error";
    return json({ error: message }, 500);
  }
});
