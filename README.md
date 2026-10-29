# ملعب (Mal3ab) — multiplayer mini games

Live: https://bdy612.github.io/Mal3ab/

## Games
- **Online (same device or room code):** Tic-Tac-Toe, Connect 4, Chess (clock, move list, draw offer, resign, premove, right-click arrows).
- **My games:** City Hall, Turf Rush, Pitch Legends, Voxel Sandbox.

## Features
- Arabic / English (button in the top bar, remembered).
- Online rooms: 4-letter code or an invite link (`index.html?join=CODE`).
- Accounts (email + password) with wins/losses/draws, or play as a guest with a name.
- Match history (`history.html`): online games are saved to the database; guests see their local history.
- "Play again" at the end of every game.

## Files
```
index.html            hub: games, join by code, account
history.html          match history
games/tictactoe.html  games/connect4.html  games/chess.html
games/city-hall/  games/turf-rush.html  games/pitch-legends/  games/voxel/
shared/net.js         Supabase: rooms (realtime), Auth, History
shared/shell.js       shared game shell (local/online, turns, status, try again, recording)
shared/i18n.js        Arabic/English strings
shared/style.css
```

## Adding an online game
Copy `games/tictactoe.html`, keep `S.state.turn` and `S.state.winner`, call `S.commit()` after each move,
then add it to `ONLINE` in `index.html` and its name to `shared/i18n.js`.

## Supabase (project "Mal3ab Games")
Tables: `rooms` (live game state), `profiles` (accounts + stats), `matches` (history). RPC: `record_result`.
