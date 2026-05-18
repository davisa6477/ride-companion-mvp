# Phase 34 Console Notification Sounds

The Driver Console can now play a notification sound when passenger activity happens.

## Passenger events

The passenger app sends a console notification for:

```txt
Passenger request sent
Tip link opened
Guestbook note submitted
```

Notification data is written to:

```txt
rideSessions/current/latestConsoleNotification
```

## Driver Console

`/console` now has a speaker button in the header.

Browsers require a user gesture before audio can play, so the driver must tap the speaker button once to enable sound on that console browser.

## Important tip limitation

The app can detect when the passenger opens/scans/taps the tip option from the Ride Companion UI. It cannot verify that an external payment was completed inside Cash App, Venmo, PayPal, etc.
