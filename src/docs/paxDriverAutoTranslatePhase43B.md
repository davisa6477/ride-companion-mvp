# Phase 43B Passenger → Driver Auto-Translate Fix

## Issue

Passenger → Driver messages could be sent without translation if the passenger typed a message and tapped `Send to Driver` without first tapping `Translate to English`.

## Fix

`Send to Driver` now automatically translates before sending when needed.

## Behavior

```txt
Passenger types message
Passenger taps Translate to English:
  English result appears on tablet

Passenger taps Send to Driver:
  If current text has not been translated yet, translate first
  If text changed after translation, translate the current text again
  Send translated English message to Driver Console
  Include original passenger-language text on the console card
```

## Fallback

If translation fails, the original message is still sent so the driver sees something instead of nothing.


Keyword: auto-translate before send.
