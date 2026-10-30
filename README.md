# ملعب (Mal3ab) — multiplayer mini games

Live: https://bdy612.github.io/Mal3ab/

## Games
- **Online (same device or room code):** Tic-Tac-Toe, Connect 4, Chess (clock, move list, draw offer, resign, premove, right-click arrows).
- **My games:** City Hall, Turf Rush, Pitch Legends, Voxel Sandbox (its own UI untouched; account name + cloud-saved worlds via shared/cloud.js).
- **Voxel Strike** (`games/voxel-strike/`): blocky arena shooter on a generated voxel map — pistol, rifle, shotgun, sniper (scope), grenades that blow holes in the map, placeable blocks; Deathmatch vs bots (easy/medium/hard, 3–9 bots, first to 20), Waves (survive; best wave saved), Online (room code, invite link `?room=CODE`, Fast Connect; first to 15 wins the round, new round every 8 s). Online uses a Supabase broadcast channel `vstrike-CODE`: each player runs their own character, hits go to the victim, grenade explosions and block changes are replayed on every screen, late joiners get a sync of the changed blocks and scores. Touch controls on phones.
- **Brick Builder** (`games/brick-builder/`): pick up building bricks and snap them onto a 32×32 baseplate — bricks, plates, tiles, slopes, round pieces and cones in 21 colours (4 see-through); Build / Move (pick a piece up and put it somewhere else) / Paint / Copy / Delete, rotate (R or right click), undo/redo, stack-on-top snapping, saved builds (`bricks-saves`, synced to the account), photo export. Mouse, keyboard and touch (tap to place, one finger turns, two fingers zoom/move).
- Both new games use the local copy of three.js r149 in `shared/vendor/three.min.js` and the shared Arabic/English strings (`addStrings` in `shared/i18n.js`).

## Features
- Arabic / English (button in the top bar, remembered). The layout never flips — only the text direction changes.
- Online rooms: 4-letter code or an invite link (`index.html?join=CODE`).
- Accounts: player name + password (email optional), bcrypt-hashed in the database, no email confirmation. Log in with name or email. Sessions last 3 hours of inactivity, or 7 days with "keep me signed in"; while the site is open a heartbeat keeps you logged in. Wins/losses/draws on the profile. Or play as a guest.
- Friends: add by name, accept requests, see who is online; **Fast connect** invites an online friend straight into a game (chess, Connect 4, X-O, Turf Rush, Pitch Legends, Voxel Strike, Voxel Sandbox — pick one of your worlds, the friend lands in it) — they get a popup on the site and accept, no code or link needed.
- Match history (`history.html`): online games are saved to the database; guests see their local history.
- "Play again" at the end of every game.

## Playing against the computer
- Chess, Connect 4, X-O: "🤖 vs Computer" on the hub with Easy / Medium / Hard (`?bot=easy|medium|hard`). X-O Hard plays perfectly, Connect 4 uses alpha-beta search (depth 3/6), chess uses a material + position evaluation (depth 1–3).
- Turf Rush: "Opponent" picker in the local menu (or `turf-rush.html?bot=hard`). The computer steers the blue painter via the small `TurfAPI`/`TurfBot` hooks; you can use either key set.

## Accounts & admin
- `account.html`: change username, password, profile picture (shrunk to 128×128 and stored in the database) and preferred language (saved on the account and applied on every page/game after login).
- `history.html`: delete a game from *your* history (the other player keeps theirs).
- `admin.html` (admins only): every user, with ban (with a reason — banned players are signed out and can't log in), unban, make/remove admin and delete. Admins can't ban/delete themselves.

## Files
```
index.html            hub: games, join by code, account
history.html          match history
games/tictactoe.html  games/connect4.html  games/chess.html
games/city-hall/  games/turf-rush.html  games/pitch-legends/
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

## Standalone games
- All four share the Mal3ab look via `shared/theme.css` (CSS variables only; game code untouched).
- `shared/cloud.js`: cloud saves (the game's localStorage keys are mirrored to the `saves` table for logged-in players) and the account name becomes the mayor / player name.
- Turf Rush: `turf-online.js` — invite link `?join=CODE`.
- Voxel: only `shared/cloud.js` (worlds, profile and friend list mirrored to the account); it keeps its own friends/multiplayer system.
- Pitch Legends: `online.js` — challenge codes/links: your squad (cards, levels, stats) is stored in `squads`; a friend plays against it and results go to both the squad record and the match history.
