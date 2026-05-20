# Phase 42 Translation Tab Cleanup

## What changed

The passenger Translation tab was simplified.

Removed:

```txt
Passenger quick questions
Mock translation phrase buttons
Old mock translation notice
```

Those quick passenger needs now belong in the Requests tab.

Kept:

```txt
Passenger language selection
Passenger language sync to Driver Console
Passenger-to-English custom message translation
Back to English
```

## Layout

The page now uses the same fixed passenger frame pattern:

```txt
PAGE_FRAME_CLASS
flex min-h-0 flex-col overflow-hidden
internal scroll area
```

This prevents the full passenger screen from scrolling.

## Keyboard behavior

Browsers cannot force the tablet’s system keyboard language.

What the app can do:

```txt
set lang on the textarea
set dir=rtl for Arabic
hint autocorrect/autocapitalize behavior
```

The passenger may still need to change the on-screen keyboard language through the tablet OS keyboard controls.
