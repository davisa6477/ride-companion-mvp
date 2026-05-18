# Ride Companion Firebase Structure

## Current beta model

```txt
Firebase Auth
  Admin email/password user

Firestore
  adminConfig
    content                MVP admin PIN state only
    profile                driver profile
    settings               default ZIP/location
    tipOptions             direct tipping links
    requestCategories      passenger request categories

  ads
    {adId}                 local deals/ads

  guestbookEntries
    {entryId}              guestbook notes, pending/approved

  rideSessions
    current
      requests
        {requestId}        passenger requests/status

  pairingCodes
    {code}                 short-lived pending device pairing request

  pairedDevices
    {deviceId}             approved passenger tablet / driver console records

  guestbook                legacy Phase 11 fallback container
```

## Security model

```txt
Admin:
- Firebase Auth email/password sign-in
- Local PIN as secondary screen lock
- Can write adminConfig, ads, approval/deletion actions, paired devices

Passenger Tablet:
- No Firebase Auth sign-in
- Must be paired
- Can read passenger-safe content
- Can submit guestbook entries and requests

Driver Console:
- No Firebase Auth sign-in required for the device
- Must be paired as Driver Console
- Can update request status through paired device metadata/token rules
```

## Local device storage

Paired devices store a local record in browser storage:

```txt
rideCompanion.pairedDevice
```

That local record is validated against:

```txt
pairedDevices/{deviceId}
```

If Admin removes the device from Firebase, the browser clears local pairing and returns to the pairing screen.

## Legacy cleanup note

The `guestbook` collection is legacy. Keep it until you are certain all old Phase 11 entries were migrated or are no longer needed. Current Guestbook uses:

```txt
guestbookEntries/{entryId}
```
