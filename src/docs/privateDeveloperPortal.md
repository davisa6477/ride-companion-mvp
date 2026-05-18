# Private Developer Portal

The developer module import workflow moved out of `/admin`.

Developer-only route:

```txt
/developer
```

## Purpose

This keeps end-user Admins from pasting random module manifests into the system.

## Developer flow

```txt
/developer
Developer login
Paste trusted in-house module manifest
Stage manifest
Render/test inside the real GameShell frame
Publish to Admin catalog
/admin > Games imports it into the end-user passenger Games list
```

## Current security boundary

This is a beta local gate. It is separate from the Admin PIN/Auth screen, but it is not a production-grade developer role system.

Production direction:

```txt
Firebase Auth custom claims
developer:true role
server-side catalog publishing
signed module manifests
```

## First-run code

```txt
RC-DEV-CHANGE-ME
```

Change it from inside `/developer` after first unlock.
