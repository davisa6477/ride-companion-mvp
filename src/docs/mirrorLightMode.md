# Mirror Light Mode

When the passenger starts Mirror, the Mirror card now switches to a white "screen light" mode:

```txt
Start Mirror:
- camera starts
- surrounding card area turns white
- QR/video surround gets a white light border
- app requests a screen wake lock when supported

Stop Mirror:
- camera stops
- wake lock is released
- card returns to normal
```

## Browser limitation

Standard browsers generally cannot control the device's actual system brightness setting. This build simulates the useful part by turning the app surface white around the camera preview so the screen itself can act as a soft light source.

Some kiosk browsers may offer device brightness controls outside the web app, but that would need a kiosk-specific integration.
