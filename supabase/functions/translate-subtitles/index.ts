import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { streamText } from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";

const BodySchema = z.object({
  vtt: z.string().min(1).max(200000),
  from: z.enum(["pt", "en"]).default("pt"),
  to: z.enum(["pt", "en"]).default("en"),
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
    const { vtt, from, to } = parsed.data;

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const gateway = createLovableAiGatewayProvider(key);
    const langName = (c: string) => (c === "pt" ? "Portuguese (Brazil)" : "English");

    const result = streamText({
      model: gateway("google/gemini-2.5-flash"),
      system:
        "You translate WebVTT subtitle files. Keep the WEBVTT header, cue identifiers, timings and blank lines exactly as they are. Translate ONLY the spoken text lines. Return the raw WebVTT content and nothing else, no code fences.",
      prompt: `Translate this WebVTT from ${langName(from)} to ${langName(to)}:\n\n${vtt}`,
    });

    let text = await result.text;
    text = text.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/, "").trim();
    if (!/^WEBVTT/i.test(text)) text = `WEBVTT\n\n${text}`;

    return json({ vtt: text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unexpected error";
    return json({ error: message }, 500);
  }
});
