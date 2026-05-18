# Admin Cleanup Backlog

Admin is functional but large. Suggested future split:

```txt
src/components/admin/AdminPage.jsx
src/components/admin/sections/AdminAuthSection.jsx
src/components/admin/sections/GuestbookAdminSection.jsx
src/components/admin/sections/AdsAdminSection.jsx
src/components/admin/sections/RequestsAdminSection.jsx
src/components/admin/sections/GamesAdminSection.jsx
src/components/admin/sections/PairingAdminSection.jsx
src/components/admin/sections/SettingsAdminSection.jsx
src/components/admin/sections/TipsAdminSection.jsx
src/components/admin/sections/DriverProfileAdminSection.jsx
```

Priority order:

```txt
1. Pairing section
2. Games section
3. Ads/Deals section
4. Driver profile section
5. Settings/security section
```

Goal: keep behavior unchanged while reducing AdminPage size and risk.
