# Phase 22 Translation Gap Pass

## What was checked

Runtime passenger-facing keys were checked against the translation modules.

The main real gaps found were:

```txt
guestbook_submitting
guestbook_submit_success
guestbook_submit_error
games_none_available
games_none_available_sub
translate_* keys for German, Portuguese, Chinese, Arabic, Vietnamese, Korean, Japanese, and Hindi
```

Some source-scan results were false positives from HTML/canvas code, such as:

```txt
2d
canvas
textarea
Dealer
```

Those are not translation keys.

## What was added

```txt
src/translations/guestbook.js
src/translations/games.js
src/translations/translate.js
```

## Notes

Dynamic passenger-generated text, web trivia questions, and externally sourced place/weather data are not translated through static app keys.

Future game modules should continue to include `translationKeys` checklists so missing game keys are easier to spot.
