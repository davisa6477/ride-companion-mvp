# Phase 36B Admin Profile Draft Fix

## Issue

Editing the Driver Profile description/bio could cause:

```txt
Cursor jumping
Field losing active editing
New text flickering in Admin
New text flickering on the passenger tablet
```

This was likely caused by live Admin edits being pushed into shared state and Firestore on every keystroke, then echoed back through listeners.

## Fix

The Driver Profile section now uses a local draft workflow:

```txt
Type into Admin fields
Edits stay local in Admin draft
Passenger tablet keeps showing the last saved profile
Press Save Driver Profile
Saved profile publishes to shared app state / Firestore
Passenger tablet updates once
```

## Controls

```txt
Save Driver Profile
Discard Changes
Unsaved changes badge
```

## Additional protection

`App.jsx` also debounces Driver Profile Firestore writes and ignores short-window Firestore echoes while Admin has just saved a local profile edit.

## Fields covered

```txt
Driver name
Driver bio / description
Driver local tip
Spanish/French manual translations
Profile photo upload/capture
```
