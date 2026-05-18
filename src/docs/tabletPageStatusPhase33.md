# Phase 33 Tablet Page Status

The passenger tablet now syncs its current visible page to the ride session document.

## Firestore location

```txt
rideSessions/current
  passengerPage
  passengerPageLabel
  passengerPageUpdatedAt
  passengerPageUpdatedByDevice
```

## Driver Console

`/console` now displays a Tablet Page status card in the header.

Examples:

```txt
Tablet Page: Home
Tablet Page: Games
Tablet Page: Mirror
Tablet Page: Requests
```

The console also shows the last update time.

## Behavior

The passenger app updates the status whenever the passenger-facing page changes. The status uses the navigation item's fallback label, so it remains readable for the driver.
