# Phase 40 Admin Dynamic Translation

Adds MyMemory-backed dynamic translation helpers inside Admin for admin-entered fields.

## Driver Profile

`/admin > Profile` now includes:

```txt
Dynamic profile translation
Language selector
Translate Profile
```

This translates:

```txt
bio
localTip
```

Generated translations are staged in the Driver Profile draft and do not publish until:

```txt
Save Driver Profile
```

## Ads / Deals

`/admin > Ads` now includes:

```txt
Dynamic ad translation
Language selector
Translate Draft
Translate existing ad
```

This translates:

```txt
businessName
headline
description
category
```

Generated data is stored in the existing dynamic field shape:

```js
headlineTranslations: {
  es: "..."
}
```

The passenger side still follows the Phase 32 fallback rule:

```txt
Use selected-language manual/dynamic translation if it exists.
Otherwise use English/default field.
```

## Backend

Admin translation calls use:

```txt
src/services/dynamicTranslationApiService.js
POST /api/translate
functions/api/translate/index.js
```

## Fallback

If translation fails, existing English/default text remains untouched.
