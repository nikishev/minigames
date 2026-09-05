# Pocket Arcade

Five browser games in a 1990s–2000s arcade cabinet, powered by Phaser 4 and Vite:

- **Star Sprint** — collect stars, dodge meteors, and survive for 35 seconds.
- **Flip Match** — match six pairs with the fewest moves.
- **Quick Tap** — wait for green and test your reaction time.
- **Neco** — an animated blue-black cat follows the pointer, sits, and sleeps in a moonlit room.
- **Pocket Pet** — feed, play with, clean, and rest a sprout creature; care progress persists on this device.

The responsive interface uses glossy cartridges, beveled chrome controls, a pink/cyan marquee, and generated pixel-art characters and environments based on the user-approved concept.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

Each game also has a shareable hash route: `#dodge`, `#memory`, `#reaction`, `#neco`, or `#tamagotchi` (Pocket Pet; retained for existing links).

To check the production build, run `npm run build` then `npm run preview -- --port 4173` and open <http://localhost:4173>. The unbuilt HTML requires the server; it is not a standalone offline file.

## Controls

- Star Sprint: arrow keys / WASD, mouse, or touch drag
- Flip Match: mouse or touch
- Quick Tap: Space, mouse, or touch
- Neco: pointer/touch or arrow keys/WASD; click near the cat for a pat
- Pocket Pet: Feed, Play, Nap, and Clean buttons; tap the pet for affection
- Fullscreen: F

Scores are saved locally in the browser. The site is static and can be hosted directly on GitHub Pages.

## Rights and licensing

This project uses original game code, generated raster artwork, CSS, canvas graphics, and synthesized audio. It does not include ROMs, emulator files, commercial game assets, third-party fonts, or copied audio. Neco is an original browser interpretation of cursor-pet behavior, not a port of the Swift Neco repository. Phaser is used under its MIT license. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [art provenance](public/art/PROVENANCE.md).

Released under the [CC0-1.0 public-domain dedication](LICENSE).

See [ROADMAP.md](ROADMAP.md) for the next original games, including the
Neko-style cat and old-school desktop lamb ideas.
