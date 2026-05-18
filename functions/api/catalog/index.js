import { errorResponse, jsonResponse, requireMethod } from "../_shared.js";

// ===== CATALOG API SCAFFOLD =====
// Cloudflare Pages Function route:
// /api/catalog
//
// This is intentionally read-only for Phase 31.
// Later phases can connect this to:
// - signed developer manifests
// - server-side catalog publishing
// - payment checks
// - per-admin install entitlements

const CATALOG_VERSION = "phase-31-scaffold";

const scaffoldCatalogItems = [
  {
    id: "memory-deluxe",
    componentKey: "memoryMatch",
    fallbackTitle: "Memory Match Deluxe",
    fallbackDescription: "A ride-friendly memory matching game.",
    priceLabel: "Available",
    status: "scaffold",
  },
];

export async function onRequest(context) {
  const methodError = requireMethod(context.request, ["GET"]);

  if (methodError) return methodError;

  try {
    return jsonResponse({
      ok: true,
      version: CATALOG_VERSION,
      source: "cloudflare-pages-functions",
      message:
        "Catalog API scaffold is online. Existing Firebase/local catalog behavior remains active.",
      items: scaffoldCatalogItems,
    });
  } catch (error) {
    return errorResponse("Catalog API failed.", 500, error?.message || null);
  }
}
