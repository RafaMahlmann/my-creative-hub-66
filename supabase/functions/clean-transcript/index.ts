import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { streamText } from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";

const BodySchema = z.object({
  text: z.string().min(1).max(200000),
  lang: z.enum(["pt", "en"]).default("pt"),
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

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const { text, lang } = parsed.data;

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const gateway = createLovableAiGatewayProvider(key);
    const langName = lang === "pt" ? "Portuguese (Brazil)" : "English";

    const result = streamText({
      model: gateway("google/gemini-2.5-flash"),
      system:
        `You turn a raw spoken-language lesson transcript (from auto-generated subtitles) into ` +
        `clean reading text in ${langName}. Remove filler words, false starts and repeated ` +
        `sentences typical of speech ("um", "so", "like I said", restarted sentences). Group the ` +
        `content into short paragraphs by topic. Keep every idea and technical term the speaker ` +
        `actually said — never invent content, never summarize away detail, never add facts that ` +
        `were not said. If a technical term looks garbled by the transcription, keep it as heard ` +
        `rather than guessing a replacement. Output plain paragraphs of prose, no headings, no ` +
        `bullet lists, no markdown, no commentary about what you did.`,
      prompt: `Transcript:\n\n${text}`,
    });

    const cleaned = (await result.text).trim();
    return json({ text: cleaned });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unexpected error";
    return json({ error: message }, 500);
  }
});
