# Phase 36 Passenger Attract Mode

Adds a rotating passenger screen saver / attract mode.

## Behavior

```txt
Passenger tablet idle for 75 seconds
Attract mode appears
Slides rotate every 7 seconds
Tap/click/key exits
Exit returns to Home
CTA buttons can navigate to relevant pages
```

## Slides

Initial slides include:

```txt
Welcome / feel free to use the tablet
Local search prompt
Featured deal prompt when an active deal exists
Game prompt
Ride request prompt
Tip reminder prompt
```

## Guardrails

Attract mode is passenger-only. It does not run on:

```txt
/admin
/console
/developer
/pair
Mirror page
```

The Mirror page is excluded because it may be using the camera/light mode.
