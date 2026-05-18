import { apiGet } from "./apiClient.js";

// ===== DEVELOPER CATALOG API SERVICE =====
// First scaffold only: reads backend catalog health/items from /api/catalog.
// Existing Firebase/local catalog behavior remains the source of truth for now.

export async function getCatalogApiStatus() {
  return apiGet("/catalog");
}
