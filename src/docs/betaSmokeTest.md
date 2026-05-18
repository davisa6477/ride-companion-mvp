# Ride Companion Beta Smoke Test

## Admin

1. Open `/admin`.
2. Sign in with Firebase Admin email/password.
3. Unlock with local PIN.
4. Confirm the Admin sections load:
   - Guestbook
   - PIN
   - Profile
   - Settings
   - Pairing
   - Tips
   - Requests
   - Ads

## Fresh Passenger Tablet

1. Clear site data or open a private window.
2. Open the root app URL.
3. Confirm the Pairing screen appears instead of Home.
4. Enter a device name.
5. Create a pairing code.
6. Approve the code from `/admin > Pairing`.
7. Confirm the tablet redirects to Home.
8. Refresh and confirm it still loads Home.

## Fresh Driver Console

1. Clear site data or open a private window.
2. Open `/console`.
3. Confirm Driver Console pairing appears instead of passenger content.
4. Enter a device name.
5. Create a pairing code.
6. Approve the code from `/admin > Pairing`.
7. Confirm the browser redirects to `/console`.
8. Refresh and confirm the Driver Console opens.

## Device Removal

1. Remove a paired passenger tablet from `/admin > Pairing`.
2. Confirm that device returns to the pairing screen.
3. Remove a paired driver console from `/admin > Pairing`.
4. Confirm `/console` returns to Driver Console pairing.

## Content Sync

1. Change driver profile text in `/admin > Profile`.
2. Confirm passenger Home updates live.
3. Add/toggle/delete an ad in `/admin > Ads`.
4. Confirm passenger Deals/Home updates live.
5. Add/delete a tip option in `/admin > Tips`.
6. Confirm Home tip modal updates.
7. Add/delete a custom request in `/admin > Requests`.
8. Confirm passenger Requests updates.

## Guestbook

1. Submit a guestbook note from passenger screen.
2. Confirm it appears pending in `/admin > Guestbook`.
3. Approve it.
4. Confirm it appears on the passenger Guestbook wall.
5. Delete it.
6. Confirm it disappears.

## Requests

1. Send a passenger request.
2. Confirm it appears in `/console`.
3. Update request status from `/console`.
4. Confirm status update works.
