# Phase 32 Dynamic Field Fallback

## Goal

Dynamic/admin-entered content should not require automatic translation.

Display rule:

```txt
Use selected-language manual translation if it exists.
Otherwise fall back to the default English/admin-entered field.
```

## Shared helper

```txt
src/utils/dynamicFields.js
```

Primary helper:

```js
getTranslatedField(record, field, language)
```

Expected data shape:

```js
{
  headline: "Free appetizer with entrée",
  headlineTranslations: {
    es: "Aperitivo gratis con plato principal"
  }
}
```

## Applied to

```txt
Home driver bio
Home driver local tip
Home featured deal businessName/headline/description
Deals businessName/headline/description/category
```

## Not included

No automatic translation API call is made in this phase.

Passenger-created Guestbook entries remain displayed as written.
