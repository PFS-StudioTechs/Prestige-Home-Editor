import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { projectId, elementId, referenceCode } = await req.json();
    if (!projectId || !elementId || !referenceCode) {
      return new Response(
        JSON.stringify({ error: "projectId, elementId et referenceCode requis" }),
        { status: 400, headers: CORS }
      );
    }

    // Le rendu texture est effectué côté client via packages/vision/texture-renderer.ts
    // Cette Edge Function met uniquement à jour la référence en base
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: ref } = await supabase
      .from("references")
      .select("id")
      .eq("code", referenceCode)
      .single();

    if (!ref) {
      return new Response(JSON.stringify({ error: "Référence introuvable" }), { status: 404, headers: CORS });
    }

    const { error } = await supabase
      .from("project_elements")
      .update({ reference_id: ref.id })
      .eq("id", elementId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: CORS,
    });
  }
});
