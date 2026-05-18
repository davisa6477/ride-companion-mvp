# Local Storage Keys

Current browser-local keys used by the beta app:

```txt
rideCompanion.pairedDevice
rideCompanion.appSettings
```

Admin/content services may also retain local fallback data from earlier phases. Keep this fallback during beta so the app remains resilient if Firebase is temporarily unavailable.

## Important

The paired-device local record is not trusted by itself. It is validated against:

```txt
pairedDevices/{deviceId}
```

If the Firebase record is removed, local pairing is cleared.
