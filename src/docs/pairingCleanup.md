# Pairing Cleanup Behavior

When Admin removes a paired device from `/admin > Pairing`, the app now removes:

```txt
pairedDevices/{deviceId}
```

and any related pairing code documents:

```txt
pairingCodes/{code}
where deviceId == removed deviceId
```

This prevents old approved/rejected/pending pairing-code documents from lingering after a device has been deactivated.

The paired browser still validates its local pairing against `pairedDevices/{deviceId}`. Once that document is removed, the browser clears local pairing and returns to the pairing screen.
