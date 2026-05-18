# Admin Game Module Management

Admin can manage installed game modules from:

```txt
/admin > Games
```

Supported from Admin:

```txt
Activate/deactivate installed modules
Hide/show games from passenger Games nav
Reorder games
View translation key checklist
Restore default module order/activation
```

Important limitation:

```txt
Adding a brand-new game still requires a code deployment.
```

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
