# Developer Module Import

Admin now includes:

```txt
/admin > Developer
```

This page imports a trusted in-house game module manifest into the system catalog.

## Safety boundary

This first pass does **not** execute arbitrary remote JavaScript. A manifest must reference a bundled `componentKey`.

Available component keys are defined in:

```txt
src/config/importableGameComponents.jsx
```

## Manifest example

```json
{
  "id": "memory-deluxe",
  "componentKey": "memoryMatch",
  "fallbackTitle": "Memory Match Deluxe",
  "fallbackDescription": "A ride-friendly memory matching game.",
  "titleKey": "games_memory_deluxe",
  "descriptionKey": "games_memory_deluxe_sub",
  "priceLabel": "Available",
  "catalogOnlyByDefault": true,
  "installedByDefault": false,
  "enabled": false,
  "order": 910
}
```

After import, the module appears under:

```txt
/admin > Games > Available Games
```

Then Admin can import it into the passenger Games list.
