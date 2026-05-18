# Local Page Frame

The Local page now uses the standard passenger page frame:

```txt
PAGE_FRAME_CLASS
```

The card itself is fixed to the available screen height below the title/nav area. The page header remains fixed inside the card, and the content below the header scrolls internally when needed.

This matches the Mirror baseline approach:

```txt
Title/nav are included in the screen calculation
Main page card fits the usable frame
Content scrolls inside the card instead of pushing the whole screen
```
