import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return new Response(JSON.stringify({ error: "projectId requis" }), { status: 400, headers: CORS });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: project } = await supabase
      .from("projects")
      .select("*, project_elements(*, references(code, nom_commercial, collection, finition))")
      .eq("id", projectId)
      .single();

    if (!project) {
      return new Response(JSON.stringify({ error: "Projet introuvable" }), { status: 404, headers: CORS });
    }

    const lines = (project.project_elements ?? [])
      .filter((el: any) => el.references)
      .map((el: any) => ({
        type: el.type_element,
        code: el.references.code,
        nom: el.references.nom_commercial,
        collection: el.references.collection,
        finition: el.references.finition,
        surface_m2: el.surface_m2,
      }));

    const recap = {
      projet: project.nom,
      date: new Date().toLocaleDateString("fr-FR"),
      lignes: lines,
      total_m2: lines.reduce((acc: number, l: any) => acc + (l.surface_m2 ?? 0), 0),
    };

    // Envoi email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: Deno.env.get("RESEND_FROM_EMAIL") ?? "devis@prestigehome33.fr",
          to: Deno.env.get("RESEND_TO_EMAIL") ?? "contact@prestigehome33.fr",
          subject: `Demande de devis — ${project.nom}`,
          html: buildEmailHtml(recap),
        }),
      });
    }

    return new Response(JSON.stringify({ recap }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: CORS,
    });
  }
});

function buildEmailHtml(recap: any): string {
  const rows = recap.lignes
    .map(
      (l: any) =>
        `<tr><td>${l.type}</td><td><strong>${l.code}</strong></td><td>${l.nom ?? ""}</td><td>${l.collection}</td><td>${l.surface_m2 ?? "—"} m²</td></tr>`
    )
    .join("");

  return `
    <h2>Demande de devis — ${recap.projet}</h2>
    <p>Date : ${recap.date}</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead><tr><th>Élément</th><th>Code</th><th>Nom</th><th>Collection</th><th>Surface</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="4"><strong>Total</strong></td><td><strong>${recap.total_m2} m²</strong></td></tr></tfoot>
    </table>
  `;
}
