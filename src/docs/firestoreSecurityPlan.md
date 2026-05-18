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
adminConfig/settings
```

Used for:
- driver profile,
- ads/deals,
- tip options,
- request categories,
- guestbook moderation data,
- admin PIN while still in MVP mode,
- default ZIP/location settings.

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

## Suggested Next Refactor

Before writing final production rules, consider splitting guestbook entries out of the combined adminConfig/content snapshot. The combined snapshot makes it harder to safely allow passenger guestbook writes without also letting passenger clients overwrite other admin fields.

## Important Note

Do not treat the admin PIN as true backend security. It is only a local UI gate. Real backend protection should use Firebase Auth and Firestore security rules.
