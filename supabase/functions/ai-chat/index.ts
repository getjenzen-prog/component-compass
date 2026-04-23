// AI chat edge function for Helix supply chain dashboard.
// Streams responses from Lovable AI Gateway grounded in seeded supply data.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Compact context the model can reason over.
const SUPPLY_CONTEXT = `You are Helix Copilot, an AI assistant for hardware supply chain managers.

The company tracks ~40 electronic components across ~12 suppliers in US/EU/Asia.

Categories: MCU, Passive, Connector, Memory, Power, Sensor.

Critical / at-risk components (by MPN, manufacturer, weeks of supply, lead time, suppliers):
- STM32H743ZIT6 (STMicro): 7w supply, 22w lead, 2 suppliers (US+Asia) — high risk
- ATSAMD21G18A (Microchip): 1.5w supply, 28w lead, single-source Asia — critical
- NRF52840-QIAA (Nordic): 1.9w supply, 26w lead, single-source EU — critical
- MAX17048G+T10 (Maxim): 0.75w supply, 28w lead, single-source US — critical
- LIS3DH (STMicro): 1.2w supply, 22w lead, single-source US — critical
- TPS62130RGTR (TI): 1.7w supply, 24w lead, single-source US — critical
- S34ML01G200TFI000 (Cypress): 1.6w supply, 30w lead, single-source EU — critical
- CP2102N (Silicon Labs): 1.7w supply, 22w lead, single-source Asia — critical
- BQ24074RGTR (TI): 2.7w supply, 22w lead, 2 suppliers — watch
- C17 Molex 53261-0871: 1.75w supply, 20w lead, single-source — critical

Key suppliers: Avnet (US, 92), Arrow (US, 89), Digi-Key (US, 97), Mouser (US, 96), Future Electronics (EU, 84), Rutronik (EU, 86), Farnell (EU, 91), WPG (Asia, 78), Macnica (Asia, 83), LCSC (Asia, 81), Marubun (Asia, 88), TTI (US, 90).

Risk drivers we use: low weeks-of-supply (<8w), long lead time (>=20w), single-source dependency, geographic concentration (Asia-only).

Style: Be concise, direct, and actionable. Use plain prose unless lists genuinely help. Cite specific MPNs and numbers when relevant. Never invent components or suppliers not listed above.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt =
      mode === "summary"
        ? `${SUPPLY_CONTEXT}\n\nWrite a tight 3-sentence executive briefing. Plain prose only.`
        : SUPPLY_CONTEXT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Payment required" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
