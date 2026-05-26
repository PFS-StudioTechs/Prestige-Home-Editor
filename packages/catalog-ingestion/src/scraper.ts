/**
 * Scraper Cover Styl' — usage interne Prestige Home 33
 * Autorisation écrite Cover Styl'/Tego requise avant tout usage en production.
 * Rate-limit : 1 req/s, User-Agent honnête.
 */

import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://coverstyl.com";
const RATE_LIMIT_MS = 1000;

const COLLECTIONS: Record<string, string> = {
  wood: "/fr/collection/wood/",
  color: "/fr/collection/color/",
  stone: "/fr/collection/stone/",
  concrete: "/fr/collection/concrete/",
  metal: "/fr/collection/metal/",
  textile: "/fr/collection/textile/",
  glitter: "/fr/collection/glitter/",
};

const SECONDARY_FAMILIES: Record<string, string> = {
  "pvc-free": "/fr/collection/pvc-free/",
  xl: "/fr/collection/xl/",
  "high-resistant": "/fr/collection/high-resistant/",
  exterior: "/fr/collection/exterior/",
};

const isDryRun = process.argv.includes("--dry-run");

interface CoverStylReference {
  code: string;
  nom_commercial: string | null;
  collection: string;
  famille_secondaire: string | null;
  finition: string | null;
  couleur_dominante: string | null;
  texture_url: string | null;
  texture_hd_url: string | null;
  fiche_technique_url: string | null;
}

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PrestigeHomeEditor/1.0 (contact@prestigehome33.fr; scraping autorisé)",
      "Accept-Language": "fr-FR,fr;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} pour ${url}`);
  return response.text();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeCollectionPage(
  url: string,
  collection: string,
  familleSecondaire: string | null
): Promise<CoverStylReference[]> {
  const html = await fetchPage(BASE_URL + url);
  const $ = cheerio.load(html);
  const refs: CoverStylReference[] = [];

  $("[data-ref], .product-card, .reference-item").each((_, el) => {
    const code =
      $(el).attr("data-ref") ||
      $(el).find("[data-ref]").attr("data-ref") ||
      $(el).find(".ref-code, .product-code").text().trim().toLowerCase() ||
      null;

    if (!code || !/^[a-z]{2}\d{2}$/i.test(code)) return;

    const nomCommercial =
      $(el).find(".product-name, .ref-name, h3, h4").first().text().trim() || null;

    const textureUrl =
      $(el).find("img").attr("data-src") ||
      $(el).find("img").attr("src") ||
      null;

    const finitionRaw = $(el).find(".finition, [data-finition]").text().trim().toLowerCase();
    const finition = finitionRaw.includes("mat")
      ? "mat"
      : finitionRaw.includes("satin")
      ? "satine"
      : finitionRaw.includes("brillant")
      ? "brillant"
      : finitionRaw.includes("struct")
      ? "structure"
      : null;

    const couleurDominante =
      $(el).find(".color-name, [data-color]").text().trim() || null;

    refs.push({
      code: code.toLowerCase(),
      nom_commercial: nomCommercial,
      collection,
      famille_secondaire: familleSecondaire,
      finition,
      couleur_dominante: couleurDominante,
      texture_url: textureUrl
        ? textureUrl.startsWith("http")
          ? textureUrl
          : `https://cms.coverstyl.com${textureUrl}`
        : null,
      texture_hd_url: null,
      fiche_technique_url: null,
    });
  });

  return refs;
}

async function scrapeAllCollections(): Promise<CoverStylReference[]> {
  const all: CoverStylReference[] = [];

  for (const [collection, path] of Object.entries(COLLECTIONS)) {
    console.log(`Collection : ${collection}`);
    try {
      const refs = await scrapeCollectionPage(path, collection, null);
      console.log(`  → ${refs.length} références`);
      all.push(...refs);
    } catch (err) {
      console.error(`  Erreur sur ${path}:`, err);
    }
    await sleep(RATE_LIMIT_MS);
  }

  for (const [famille, path] of Object.entries(SECONDARY_FAMILIES)) {
    console.log(`Gamme spécialisée : ${famille}`);
    try {
      const refs = await scrapeCollectionPage(path, "specialise", famille);
      console.log(`  → ${refs.length} références`);
      all.push(...refs);
    } catch (err) {
      console.error(`  Erreur sur ${path}:`, err);
    }
    await sleep(RATE_LIMIT_MS);
  }

  return all;
}

async function upsertToSupabase(refs: CoverStylReference[]): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local");
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const BATCH = 50;
  for (let i = 0; i < refs.length; i += BATCH) {
    const batch = refs.slice(i, i + BATCH);
    const { error } = await supabase
      .from("references")
      .upsert(batch, { onConflict: "code" });
    if (error) console.error(`Erreur upsert batch ${i}:`, error.message);
    else console.log(`Upsert batch ${i}–${i + batch.length} OK`);
    await sleep(200);
  }
}

async function main() {
  console.log(`Mode : ${isDryRun ? "DRY RUN (pas d'écriture Supabase)" : "PRODUCTION"}`);
  console.log("Scraping Cover Styl'...\n");

  const refs = await scrapeAllCollections();
  console.log(`\nTotal : ${refs.length} références collectées`);

  if (isDryRun) {
    console.log("\nExemples :");
    refs.slice(0, 5).forEach((r) => console.log(" ", JSON.stringify(r)));
    return;
  }

  await upsertToSupabase(refs);
  console.log("\nIngestion terminée.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
