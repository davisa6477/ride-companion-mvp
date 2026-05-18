# Admin Game Module Management

Admin can manage installed game modules from:

```txt
/admin > Games
```

Supported from Admin:

```txt
Show/hide installed modules
Reorder games
View translation key checklist
Restore default module order/visibility
```

## Display behavior

The Admin list is sorted using the same configured order that the passenger Games page uses. Hidden games stay visible in Admin so they can be re-enabled, but they are removed from the passenger Games nav.

The Admin row styling is intentionally neutral now. Visibility changes should not visually resize or radically change the row; the status text and button label show whether the game is active/hidden.

## Passenger Games nav

The passenger Games nav card uses the same static available page-frame height as the game card. If the list gets too long, the nav list scrolls inside the fixed card instead of growing the page.

## Important limitation

Truly adding a brand-new game still requires a code deployment.

A new game needs:

```txt
src/components/games/NewGame.jsx
src/components/games/modules/newGameModule.jsx
```

Then import the module in:

```txt
src/components/games/modules/index.jsx
```

Game module settings are stored in:

```txt
adminConfig/gameModules
```
