# Weather Page Frame

The Weather page now uses the standard passenger page frame:

```txt
PAGE_FRAME_CLASS
```

The card itself is fixed to the usable screen height below the title/nav area. The header/refresh control remain fixed inside the card, and the weather content below the header scrolls internally when needed.

This follows the same layout strategy as the Local page and the Mirror baseline:

```txt
Main card fits the available frame
Header stays visible
Content scrolls inside the card
The whole tablet page should not scroll
```
