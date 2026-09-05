Original prompt: connect to git and lets build some mini games so people can play online.

## Completed

- Isolated the project in its own Git repository to avoid the placeholder repository inherited from the home directory.
- Built a responsive Pocket Arcade shell with Star Sprint, Flip Match, and Quick Tap.
- Added keyboard, mouse, touch, sound, fullscreen, local high scores, deterministic time stepping, and text-state output.
- Audited `wheredidicomefrom/oldGamesOnline`; it contains commercial ROMs and artwork plus unlicensed emulator files, so it must not be used as the publication source for a copyright-safe release.
- Confirmed this project has no third-party runtime dependencies or external creative assets; added CC0-1.0 dedication and a content/rights manifest.
- Verified Star Sprint movement/collisions visually and confirmed Flip Match reveal, mismatch reset, matching, scoring, and win flow through the required Playwright loop.
- Verified Star Sprint star collection, scoring, life loss, and game-over flow; verified Quick Tap false-start and successful 152 ms reaction flows. Inspected gameplay and result screenshots for all three games. No browser console errors were emitted.
- Selected Phaser 4.2.1 as the production web-game engine and Vite 8.2.2 for builds. Both are pinned, MIT-licensed, and npm audit reports zero vulnerabilities for this isolated dependency tree.
- Re-ran the Playwright smoke tests against the Vite production preview after migration: Star Sprint movement and Quick Tap success (163 ms) pass with no console errors. Production build is 364 kB gzip for the engine bundle.
- Added a copyright-safe roadmap for Cursor Cat (Neko-style) and Desktop Lamb, plus five additional original mini-game concepts.
- Added Neco as the fourth game: original vector cat, pointer chasing, pats, affection scoring, synthesized purr cues, and a 30-second round.
- Verified Neco on the production preview: pointer following and pat scoring produce the expected state (`score: 50`, `pats: 1`) and the screenshot shows the complete cat/room scene with no console errors.
- Reworked Neco after review: removed the timer/chase-score framing and replaced it with a persistent Tamagotchi-style care loop (hunger, energy, happiness, cleanliness, bond, day), visible Feed/Play/Nap actions, and stateful feedback messages.
- Split that mixed concept into two independent games: Neco is now a pointer-chasing desktop cat, while Tamagotchi has its own persistent care loop and Feed/Play/Nap controls.
- Fixed the broken fifth-tab runtime error (`config.tamagotchi` was missing) and added a raw-file redirect to the local Vite preview so opening `index.html` does not leave a dead page.
- Fixed `.pet-actions` overriding the HTML `hidden` attribute; care controls are now absent from Neco and available only in Tamagotchi.
- Verified both games with the required Playwright loop and inspected gameplay captures. Neco reports `activity: chasing`; Tamagotchi exposes its four needs. No browser console errors were emitted.
- Generated a high-quality 1990s–2000s arcade art-direction approval sheet with original characters/icons. Do not implement that visual direction until the user approves it.

## TODO

- User approved the art direction and requested implementation. Rebuilt the shell as a chrome/candy-plastic arcade cabinet with five interactive cartridge selectors and responsive touch layout.
- Generated and integrated two distinct animated pets, their room atlas, and matching card/lightning illustrations. Public virtual-pet name is Pocket Pet; retained #tamagotchi links.
- Added Clean action, visible care animations, Neco keyboard movement, hash navigation, and pointer/tap start. Browser checks cover all cartridges, Neco chase/sleep/wake, care state persistence, reaction lose/win, dodge movement, memory interaction, and mobile overflow.
- Final desktop/mobile screenshots inspected. Both the required web-game client and cross-game regression checks pass, with no browser console errors. Build succeeds; Vite still reports a size advisory for the Phaser bundle.
- Approved redesign ready for publication; assets and prompt provenance recorded in public/art/PROVENANCE.md.
- Optional future expansion: online leaderboards and multiplayer rooms.
