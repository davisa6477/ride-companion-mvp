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
