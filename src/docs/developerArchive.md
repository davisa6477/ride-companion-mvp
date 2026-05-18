# Developer Catalog Archive

The Developer portal now supports archiving published catalog modules for developer cleanup.

## Behavior

```txt
Archive in Developer:
- hides the item from the active Developer catalog list
- does NOT remove the imported module manifest
- does NOT remove it from Admin catalog
- does NOT deactivate it for end users
```

This is only a Developer Portal view cleanup tool.

## Restore

Archived items can be shown with:

```txt
Show Archived
```

Then restored with:

```txt
Restore to Developer
```

## Stored fields

Imported module manifests can now include:

```txt
developerArchived
developerArchivedAtMs
```
