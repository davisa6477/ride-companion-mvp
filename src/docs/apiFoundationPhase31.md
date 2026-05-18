# Phase 31 API Foundation

## What was added

App-side API client:

```txt
src/services/apiClient.js
src/services/catalogApiService.js
```

Cloudflare Pages Functions scaffold:

```txt
functions/api/_shared.js
functions/api/catalog/index.js
```

Developer portal test card:

```txt
/developer > API Foundation > Test Catalog API
```

## Endpoint

```txt
GET /api/catalog
```

Expected response:

```json
{
  "ok": true,
  "version": "phase-31-scaffold",
  "source": "cloudflare-pages-functions",
  "items": []
}
```

## Current boundary

This is a scaffold only. Existing Firebase/local catalog behavior remains active.

Next wiring phase can move:

```txt
Developer publish -> backend API
Admin catalog list -> backend API
Payment/entitlements -> backend API
```

## Cloudflare note

Cloudflare Pages Functions must be deployed with the `functions` folder at the project root, beside `src`.
