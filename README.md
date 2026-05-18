# Ride Companion MVP

Ride Companion is a passenger-tablet and driver-console web app for rideshare/gig use. It is built with Vite, React, Firebase, and Cloudflare Pages Functions.

## Run locally

```bash
npm install
npm run dev
```

Camera, location, and some device APIs usually require HTTPS or `localhost`.

## Build

```bash
npm run build
```

If a copied `node_modules` folder causes native binding errors, delete `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

On Windows, delete the `node_modules` folder manually or use GitHub Desktop/VS Code terminal.

## Current routes

```txt
/           Passenger tablet
/console    Driver console
/admin      End-user driver/admin controls
/developer  Private developer portal
/pair       Device pairing
/api/catalog Cloudflare Pages Function scaffold
```

## Current source map

```txt
src/App.jsx                          Main routing, shared state, passenger shell
src/components/pages/                 Passenger-facing pages
src/components/console/               Driver console
src/components/admin/                 End-user admin
src/components/developer/             Private developer portal
src/components/games/                 Game components
src/components/games/modules/         Game module metadata
src/components/layout/                Shared layout components
src/components/shared/                Shared UI such as TipModal
src/config/                           App config, nav, page frame, registry
src/services/                         Firebase/local/API service layer
src/translations/                     Static UI translations
src/utils/                            Shared helpers
functions/api/                        Cloudflare Pages Functions
```

## Deployment notes

Do not deploy or commit generated folders such as:

```txt
node_modules
dist
.git
```

For Cloudflare Pages Functions, keep this folder at the project root:

```txt
functions
```

## Beta focus areas remaining

```txt
Admin organization/cleanup
Firestore/security rules review
Developer portal hardening
Final beta smoke-test checklist
Production API/payment/entitlement design
```
