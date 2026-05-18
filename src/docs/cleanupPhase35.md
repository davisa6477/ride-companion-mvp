# Phase 35 Cleanup Pass

## What changed

This pass is a light cleanup/hardening checkpoint.

```txt
Removed legacy duplicate root page components from src/components/*.jsx
Kept active organized components under src/components/pages, console, admin, developer, layout, shared, and games
Updated README.md to match the current architecture
Expanded .gitignore
Fixed AdsPage route to receive appLanguage for dynamic field fallback
```

## Removed legacy files

```txt
src/components/AdminPage.jsx
src/components/AdsPage.jsx
src/components/DriverConsolePage.jsx
src/components/DriverTranslationCard.jsx
src/components/FlightCheckerPage.jsx
src/components/GameShell.jsx
src/components/GamesPage.jsx
src/components/GuestbookPage.jsx
src/components/HomePage.jsx
src/components/LocalPage.jsx
src/components/MirrorPage.jsx
src/components/NavButton.jsx
src/components/PageCard.jsx
src/components/RequestsPage.jsx
src/components/TipModal.jsx
src/components/TranslationPage.jsx
src/components/TriviaPage.jsx
src/components/WeatherPage.jsx
```

These were older duplicate components left from before the modular folder split. Current imports use the organized folders.

## Bug fixed

`App.jsx` now passes `appLanguage` into `AdsPage`, so manually translated dynamic ad fields can display correctly on the Deals page.

## Deferred cleanup

```txt
AdminPage is still large and should be split into admin section components later.
Firestore rules should get a final beta/security pass.
Docs contain useful phase history, but may eventually need a shorter production README.
```
