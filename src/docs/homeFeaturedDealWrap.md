# Home Featured Deal Text Wrap

The Featured Local Deal card on Home now uses the same overflow-safe text wrapping pattern as the Deals page cards.

Protected fields:

```txt
businessName
headline
description
```

The card uses:

```txt
min-w-0
overflow-hidden
break-words
leading-tight / leading-snug
```

This prevents long ad text from exceeding card boundaries.
