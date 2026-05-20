# Phase 39 MyMemory Translation Scaffold

## What changed

Driver Translation quick phrases were moved into the Driver Messages section.

```txt
/console > Communication > Driver Messages
```

Preset buttons now all behave the same way:

```txt
Tap preset
Passenger receives popup
Passenger language translation is used when available
Passenger taps Got it
Console sees acknowledgment
```

## Typed messages

Typed driver messages now attempt dynamic translation through:

```txt
POST /api/translate
```

The backend Cloudflare Pages Function calls MyMemory:

```txt
https://api.mymemory.translated.net/get
```

Expected request body:

```json
{
  "text": "One moment please.",
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

## Fallback behavior

```txt
If passenger language is English:
  send original text

If MyMemory succeeds:
  send original English + translated passenger-language text

If MyMemory fails:
  send original English text
```

## MyMemory limits

MyMemory documents the `q` field as max 500 bytes, so this endpoint rejects longer text. Keep typed driver messages short.

## Optional Cloudflare env vars

```txt
MYMEMORY_EMAIL
MYMEMORY_KEY
```

These are optional and are passed to MyMemory if configured.
