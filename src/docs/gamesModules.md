# Games Plug-and-Play Modules

## Current structure

```txt
src/components/games/
  BlackjackGame.jsx
  EmojiGuessGame.jsx
  RideBingoGame.jsx
  TicTacToeGame.jsx
  TriviaGame.jsx

src/components/games/modules/
  blackjackGameModule.jsx
  emojiGuessGameModule.jsx
  rideBingoGameModule.jsx
  ticTacToeGameModule.jsx
  triviaGameModule.jsx
  index.jsx

src/config/gameRegistry.jsx
```

## How GamesPage works

`GamesPage.jsx` does not need game-specific branching. It reads:

```txt
config/gameRegistry.jsx
```

The registry reads the enabled modules from:

```txt
components/games/modules/index.jsx
```

Each module provides:

```js
{
  id: "example",
  enabled: true,
  order: 10,
  titleKey: "games_example",
  fallbackTitle: "Example Game",
  descriptionKey: "games_example_sub",
  fallbackDescription: "Short description.",
  Component: ExampleGame,
}
```

## Add a new game

1. Create the game component:

```txt
src/components/games/ExampleGame.jsx
```

2. Create a module file:

```txt
src/components/games/modules/exampleGameModule.jsx
```

3. Import it in:

```txt
src/components/games/modules/index.jsx
```

4. Add it to the `gameModules` array.

## Hide a game

Set this in the module:

```js
enabled: false
```

## Reorder games

Change the module `order` value. Lower values appear first.

## Sizing rule

Games should fit inside the existing `GameShell`, which uses the same page-frame baseline as the current Mirror screen/card. New games should avoid page-level scrolling and scale their internal content within the provided height.
