# Phase 41 More Tablet Runtime Translation

Extends tablet-side runtime translation to more passenger-facing dynamic/admin-entered areas.

## Added runtime translation coverage

```txt
Requests page
- admin/custom request category names
- admin/custom request item labels
- request status cards showing those labels

Attract mode
- featured deal businessName
- featured deal headline
- featured deal description

Local page
- admin configured fallback location label in passenger-facing status text
```

## Not translated

```txt
Google Maps search values
flight numbers
tip provider brand names
guestbook passenger messages
```

These are intentionally left as-is to avoid breaking search quality, brand/payment labels, or altering passenger-authored notes.

## Behavior

Runtime translation still follows the same rule:

```txt
English/default text if passenger language is English
Saved manual translation first where available
/api/translate if needed
English/default fallback if API fails
```
