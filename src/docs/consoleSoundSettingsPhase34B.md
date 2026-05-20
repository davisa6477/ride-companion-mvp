# Phase 34B Console Sound Settings

The Driver Console now has local notification sound settings.

## Location

```txt
/console > Notification Sounds
```

## Settings

```txt
Sound style: Soft / Bright / Subtle
Volume slider
Requests on/off
Guestbook on/off
Tip links on/off
Test Sound button
```

## Storage

These settings are stored locally on the console browser:

```txt
rideCompanion.consoleSoundSettings
rideCompanion.consoleSoundEnabled
```

This allows each console device to choose its own alert behavior.

## Tip limitation

Tip alerts mean the passenger opened a tip link from the Ride Companion UI. The app cannot verify external payment completion.
