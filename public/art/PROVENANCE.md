# Arcade artwork

Created September 4, 2026 with the built-in image-generation tool. The user
approved the concept sheet and requested implementation. This is a record of
generation, not an assertion of exclusive copyright or a legal clearance opinion.

- `arcade-approved.png`: original approved concept. Brief: premium 1990s–2000s
  digital-toy arcade, translucent candy plastic, chrome controls, subtle CRT
  texture, distinct original cat and sprout pet, five cartridge cards. No existing
  console logos, commercial characters, branded devices, or copied game UI.
  Source output: `exec-b5c025f4-a324-48af-9604-85cf5bb499bd.png`.
- `pets.png`: 4×2 sprite atlas. Brief: match the approved blue-black cat in
  standing/running/sitting/sleeping poses and chartreuse sprout pet in
  happy/eating/bouncing/sleeping poses; eight equal cells, no lettering, transparent
  background. A second image-tool pass removed a baked-in checkerboard and
  produced true PNG alpha. Source output: `exec-f342d1e5-1f2d-49a9-9d2b-e67db86c58bb.png`.
- `rooms.png`: two equal square backgrounds. Brief: empty blue moonlit room
  and warm sunny green room, window on left, shelf on right, generous empty floor,
  matching pixel art; no pets, UI, or text. Source output:
  `exec-e0a0712a-953a-4c60-9583-335289b1c8ab.png`.
- `icons.png`: two equal square illustrations. Brief: pink matching star cards
  and amber lightning arcade button, sparkling pixel-art backgrounds matching
  the approved concept, no lettering or logos. Source output:
  `exec-5f492c26-aa32-4fa5-899a-cc483e59ec48.png`.

Sprites and image regions are selected in CSS/canvas at runtime; the source
artwork remains intact. No external runtime image URLs are used.
