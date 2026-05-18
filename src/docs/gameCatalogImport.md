# Game Catalog / Import Foundation

## What this does

The app now has a simple in-house game catalog foundation in Admin:

```txt
/admin > Games
```

Admin can:

```txt
Import available in-house games
Hide/show installed games
Reorder installed games
Remove a game from the installed list
Re-import removed catalog games later
```

## Important limitation

This is not a runtime code marketplace yet. Games are still bundled with the deployed app code.

Current model:

```txt
New game created in-house
Game component/module ships in app bundle
Module can be marked catalogOnlyByDefault
Admin imports it from Available Games
Game appears in passenger Games list
```

Future payment/download infrastructure can replace the current free import button.

## Added catalog test game

```txt
Memory Match
```

It is bundled but not installed by default. It should appear under Available Games until imported.
