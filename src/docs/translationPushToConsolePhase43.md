# Phase 43 Translation Messages Push to Console

## What changed

The passenger Translation tab now sends translated messages to the Driver Console.

Previously, Passenger → Driver translation only displayed the English result on the tablet. Now the passenger can tap:

```txt
Send to Driver
```

That creates a console request with:

```txt
category: Translation
type: translation
message: English translated message
originalMessage: passenger's original typed text
originalLanguage
originalLanguageLabel
```

## Driver Console

The console request card shows:

```txt
English translated message
Original passenger-language message
Ack / Clear controls
```

This keeps translated passenger messages inside the same immediate communication flow as Requests.

## Translation tab labels

The Translation tab also runtime-translates newer helper text that may not exist in the static dictionary yet.

It uses:

```txt
translateRuntimeText()
/api/translate
```

for the tab’s newer explanatory labels and status messages.

## Keyboard note

The app still cannot force the tablet OS keyboard language. It can only set `lang` and `dir` hints on the text box.
