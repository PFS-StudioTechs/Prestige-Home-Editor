import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return new Response(JSON.stringify({ error: "imageUrl requis" }), { status: 400, headers: CORS });

    const falKey = Deno.env.get("FAL_KEY");
    if (!falKey) throw new Error("FAL_KEY non configurée");

    // 1. Grounding DINO — détection des éléments de cuisine
    const dinoRes = await fetch("https://fal.run/fal-ai/grounding-dino", {
      method: "POST",
      headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: "kitchen cabinet door . drawer front . worktop . backsplash . kitchen island . side panel . hood casing",
        box_threshold: 0.3,
        text_threshold: 0.25,
      }),
    });
    const dinoData = await dinoRes.json();

    // 2. SAM 2 — masquage précis de chaque boîte détectée
    const elements = [];
    for (const box of dinoData.boxes ?? []) {
      const samRes = await fetch("https://fal.run/fal-ai/sam2", {
        method: "POST",
        headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, box }),
      });
      const samData = await samRes.json();
      elements.push({
        label: box.label,
        boundingBox: box,
        mask: samData.mask,
      });
    }

    return new Response(JSON.stringify({ elements }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: CORS,
    });
  }
});
