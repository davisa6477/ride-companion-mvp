# Pairing Code Reset

Before pairing tests, it can be useful to clear old pairing code documents.

In Admin:

```txt
/admin > Pairing > Clear Pairing Codes
```

This deletes all documents under:

```txt
pairingCodes/{code}
```

It does **not** remove approved paired devices under:

```txt
pairedDevices/{deviceId}
```

Use this when you want a clean pairing-code list before testing. To deactivate a device, remove it from the Paired Devices list instead.
