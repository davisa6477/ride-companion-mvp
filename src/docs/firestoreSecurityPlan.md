# Firestore Security Prep

## Summary

The app now has service boundaries and route-scoped client writes, but client-side route checks are not real authorization. Before relying on shared Firestore admin content in production, Firebase rules and/or Firebase Auth should enforce who can read and write each document.

## Current Firestore Usage

### Ride session sync

```txt
rideSessions/current
rideSessions/current/requests/{requestId}
```

Used for:
- passenger requests,
- request status updates,
- passenger language sync,
- driver console live updates.

### Shared admin/app config

```txt
adminConfig/content
adminConfig/profile
adminConfig/settings
adminConfig/tipOptions
adminConfig/requestCategories
guestbookEntries/{entryId}
ads/{adId}
```

Used for:
- driver profile in its own profile document,
- ads/deals in a separate ads container,
- tip options,
- request categories,
- admin PIN while still in MVP mode,
- default ZIP/location settings,
- guestbook entries in a separate guestbook container.

## Current Risk

The frontend now limits writes by route:

```txt
/admin writes full admin content and settings.
passenger pages only write guestbook entries.
```

That is useful for reducing mistakes, but it does not prevent a determined user from writing directly to Firestore if rules allow it.

## Recommended Beta Security Model

For early beta, keep it simple:

```txt
Passenger tablet:
- Can read shared admin content/settings.
- Can create passenger requests.
- Can create guestbook entries only through a controlled field path or separate collection.

Driver/Admin:
- Can read/write shared admin content/settings.
- Can update request status.
```

## Better Future Data Shape

The current snapshot document works, but security rules are easier if we split admin content into separate documents/collections:

```txt
adminConfig/profile
adminConfig/settings
adminConfig/requestCategories
adminConfig/tipOptions
ads/{adId}
guestbookEntries/{entryId}
```

That would allow rules like:

```txt
Passengers can create guestbookEntries.
Passengers cannot approve guestbookEntries.
Admins can approve/delete guestbookEntries.
```

## Guestbook Container Status

Guestbook entries have been split out of the combined adminConfig/content snapshot into:

```txt
guestbookEntries/{entryId}
```

This is safer than storing entries beside driver profile, ads, tips, request categories, and admin PIN. A future improvement would be moving from a single guestbookEntries/{entryId} document to per-entry documents:

```txt
guestbookEntries/{entryId}
```

That would allow even cleaner create/update/delete rules.

## Important Note

Do not treat the admin PIN as true backend security. It is only a local UI gate. Real backend protection should use Firebase Auth and Firestore security rules.


## Ads Container Status

Ads/deals have been split out of the combined adminConfig/content snapshot into per-ad documents:

```txt
ads/{adId}
```

This lets Admin add, delete, and toggle ads independently from profile/settings-style content. It also prepares future rules where only Admin can write ads while passengers can read active deals.


## Driver Profile Container Status

Driver profile has been split out of the combined adminConfig/content snapshot into:

```txt
adminConfig/profile
```

This lets profile edits sync independently from request categories, tip options, and admin PIN.


## Tip Options and Request Categories Container Status

Tip options and request categories have been split out of the combined adminConfig/content snapshot into:

```txt
adminConfig/tipOptions
adminConfig/requestCategories
```

The remaining adminConfig/content snapshot now primarily holds MVP admin PIN state until real backend auth replaces it.


## Phase 16 Security Prep Status

A visible Admin security notice has been added so beta users understand the current local PIN is only a browser UI gate.

A copy/paste Firestore rules draft has been added at:

```txt
src/firestore.rules
src/docs/firestoreRulesPhase16Draft.rules
```

Do not publish the strict draft until Firebase Auth/admin claims or an equivalent admin identity model is ready. The placeholder `isAdmin()` currently returns false.


## Phase 17B Prep Status

Passenger Guestbook submission now writes a single pending document through `createSharedGuestbookEntry()` instead of rewriting the whole guestbook array. This supports rules where passengers may create pending entries, but only Admin may approve/edit/delete them.

A rules draft has been added at:

```txt
src/firestore.rules
src/docs/firestoreRulesPhase17BDraft.rules
```

For the single-admin beta, the draft treats any signed-in Firebase Auth user as Admin. Before broader release, replace `isAdmin()` with a custom-claims check.


## Phase 18A Device Pairing Foundation

Added a YouTube-TV-style pairing foundation:

```txt
/pair
pairingCodes/{code}
pairedDevices/{deviceId}
```

Devices can generate a short code without Admin credentials. Admin approves the code from `/admin > Pairing`. The device then stores its paired device record locally.

This is not yet used to scope reads/writes by config/session, but it establishes the structure needed for device-based rules later.
