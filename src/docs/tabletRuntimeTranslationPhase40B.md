# Phase 40B Tablet Runtime Translation

## Change in direction

Admin no longer needs to generate or enter translations for dynamic fields.

The tablet translates admin-entered English/default content at runtime when the passenger selects a non-English language.

## Runtime translated fields

Passenger Home:

```txt
driver bio
driver local tip
featured deal businessName/headline/description
```

Deals page:

```txt
businessName
headline
description
category
```

## Behavior

```txt
Passenger language is English:
  show English/default fields

Passenger language is not English:
  saved manual translation is used first if present
  otherwise tablet calls /api/translate
  if translation succeeds, translated text is shown
  if translation fails, English/default text remains
```

## Cache

Runtime translations are cached in memory for the browser session to avoid repeatedly translating the same text.

## Backend

Uses the existing Phase 39 backend:

```txt
POST /api/translate
functions/api/translate/index.js
```

## Admin

The Admin dynamic translation generation buttons from Phase 40 were removed. Admin can enter normal English/default content only.
