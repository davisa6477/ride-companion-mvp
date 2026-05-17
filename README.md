# Ride Companion MVP

A Vite + React prototype for a rideshare passenger tablet.

## Run locally

1. Install Node.js.
2. Open this folder in VS Code.
3. Run:

```bash
npm install
npm run dev
```

Then open the local URL Vite gives you.

## File map

- `src/App.jsx` — main app state and navigation
- `src/components/HomePage.jsx` — Meet Your Driver home screen
- `src/components/GuestbookPage.jsx` — passenger guestbook
- `src/components/AdsPage.jsx` — local deals display
- `src/components/TriviaPage.jsx` — trivia page
- `src/components/WeatherPage.jsx` — weather page
- `src/components/RequestsPage.jsx` — passenger ride requests
- `src/components/MirrorPage.jsx` — front-camera mirror
- `src/components/AdminPage.jsx` — driver admin controls
- `src/data/defaultRequests.js` — default request categories
- `src/data/starterAds.js` — starter local ads
- `src/data/trivia.js` — trivia helpers and fallback questions

## Notes

Camera and location features usually require HTTPS or localhost.
