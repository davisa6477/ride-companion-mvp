# Phase 37 Driver → Passenger Translated Messages

Adds basic driver-to-passenger communication from the Driver Console.

## Driver Console

`/console` now includes:

```txt
Driver Messages
```

The driver can send hard-coded message templates. Each template includes manual translations for supported passenger languages.

## Passenger Tablet

The passenger tablet listens to:

```txt
rideSessions/current/latestDriverMessage
```

When a new unacknowledged driver message arrives, the tablet shows a popup with:

```txt
Translated driver message
English fallback/reference when passenger language is not English
Got it acknowledgment button
```

## Acknowledgment

When the passenger taps `Got it`, the app writes:

```txt
latestDriverMessage.acknowledged = true
latestDriverMessage.acknowledgedAt
latestDriverMessage.acknowledgedByDevice
```

The Driver Console shows whether the latest driver message is waiting or acknowledged.

## Current boundary

This phase uses hard-coded safe message templates. It does not allow arbitrary free-text driver messages yet, which avoids unsafe/poor translation issues while driving.
