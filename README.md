# Pocket Arcade

Three lightweight browser games in one responsive, dependency-free site:

- **Star Sprint** — collect stars, dodge meteors, and survive for 35 seconds.
- **Flip Match** — match six pairs with the fewest moves.
- **Quick Tap** — wait for green and test your reaction time.

## Run locally

```bash
python3 -m http.server 5173
```

Then open <http://localhost:5173>.

Each game also has a shareable hash route: `#dodge`, `#memory`, or `#reaction`.

## Controls

- Star Sprint: arrow keys / WASD, mouse, or touch drag
- Flip Match: mouse or touch
- Quick Tap: Space, mouse, or touch
- Fullscreen: F

Scores are saved locally in the browser. The site is static and can be hosted directly on GitHub Pages.

## Rights and licensing

This project contains only original, dependency-free code and generated canvas graphics. It does not include ROMs, emulators, commercial game assets, third-party fonts, or copied audio. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the content manifest.

Released under the [CC0-1.0 public-domain dedication](LICENSE).
