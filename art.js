// Generated production art follows the user-approved arcade concept.
const base = import.meta.env.BASE_URL;
export const sprites = new Image();
export const rooms = new Image();
export const approved = new Image();
export const icons = new Image();
sprites.src = `${base}art/pets.png`;
rooms.src = `${base}art/rooms.png`;
approved.src = `${base}art/arcade-approved.png`;
icons.src = `${base}art/icons.png`;
export const artReady = Promise.all(
  [sprites, rooms, approved, icons].map((img) =>
    img.decode().catch(() => null),
  ),
);

export function arcadeIcon(ctx, name, x, y, size) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 18);
  ctx.clip();
  if (name === "memory" || name === "reaction") {
    if (icons.complete && icons.naturalWidth) {
      const w = icons.naturalWidth / 2;
      ctx.drawImage(
        icons,
        name === "memory" ? 0 : w,
        0,
        w,
        icons.naturalHeight,
        x,
        y,
        size,
        size,
      );
    }
  } else if (approved.complete && approved.naturalWidth) {
    ctx.drawImage(approved, 648, 320, 137, 165, x, y, size, size);
  }
  ctx.restore();
}

export function label(
  ctx,
  value,
  x,
  y,
  size = 16,
  color = "#d8edff",
  align = "left",
) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(value, x, y);
}

export function sprite(
  ctx,
  row,
  frame,
  x,
  y,
  size = 210,
  facing = 1,
  bounce = 0,
) {
  if (!sprites.complete || !sprites.naturalWidth) return;
  const w = sprites.naturalWidth / 4,
    h = sprites.naturalHeight / 2;
  ctx.save();
  ctx.translate(x, y + bounce);
  ctx.scale(facing, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    sprites,
    frame * w,
    row * h,
    w,
    h,
    -size / 2,
    -size * 0.72,
    size,
    size,
  );
  ctx.restore();
}

export function room(ctx, pet = false) {
  ctx.fillStyle = pet ? "#424b23" : "#081b39";
  ctx.fillRect(0, 0, 960, 600);
  if (rooms.complete && rooms.naturalWidth) {
    const w = rooms.naturalWidth / 2;
    ctx.drawImage(
      rooms,
      pet ? w : 0,
      0,
      w,
      rooms.naturalHeight,
      0,
      0,
      960,
      600,
    );
  }
  const vignette = ctx.createRadialGradient(480, 340, 150, 480, 300, 590);
  vignette.addColorStop(0, "#0000");
  vignette.addColorStop(1, "#01081b99");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 960, 600);
}

export function petScene(ctx, d, pointer, pet = false) {
  room(ctx, pet);
  ctx.fillStyle = "#050e1bd9";
  ctx.fillRect(0, 0, 960, 66);
  label(
    ctx,
    pet ? "MOCHI’S ROOM" : "NECO / AFTER HOURS",
    28,
    32,
    18,
    pet ? "#d8f18d" : "#83ddff",
  );
  label(
    ctx,
    pet ? `DAY ${d.day}   ♥ ${d.bond}` : d.activity.toUpperCase(),
    932,
    32,
    16,
    pet ? "#e0f1ac" : "#8be7ff",
    "right",
  );
  if (pet) {
    const stats = [
      ["FULL", d.hunger, "#ffbe63"],
      ["HAPPY", d.happiness, "#ff9dcb"],
      ["ENERGY", d.energy, "#bda5ff"],
      ["CLEAN", d.cleanliness, "#67e5e0"],
    ];
    stats.forEach(([title, value, color], i) => {
      const x = 22 + i * 237;
      ctx.fillStyle = "#0c172ddd";
      ctx.fillRect(x, 79, 215, 51);
      label(ctx, title, x + 12, 94, 11, color);
      label(ctx, `${Math.round(value)}%`, x + 198, 94, 11, color, "right");
      for (let n = 0; n < 10; n++) {
        ctx.fillStyle = value > n * 10 ? color : "#354039";
        ctx.fillRect(x + 12 + n * 19, 108, 15, 11);
      }
    });
  }
  const frame = pet
    ? ({ feed: 1, play: 2, nap: 3, clean: 2 }[d.action] ?? 0)
    : d.activity === "sleeping"
      ? 3
      : d.activity === "sitting"
        ? 2
        : d.activity === "chasing"
          ? Math.floor(d.elapsed * 8) % 2
          : 0;
  const bob = pet
    ? d.action === "play"
      ? Math.sin(d.elapsed * 12) * 14
      : Math.sin(d.elapsed * 2) * 3
    : d.activity === "chasing"
      ? Math.sin(d.elapsed * 16) * 4
      : 0;
  sprite(
    ctx,
    pet ? 1 : 0,
    frame,
    d.pet.x,
    d.pet.y,
    pet ? 265 : 210,
    pet ? 1 : d.pet.facing,
    bob,
  );
  if (!pet) {
    ctx.strokeStyle = "#8be9ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.ellipse(pointer.x, pointer.y + 30, 22, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.save();
    ctx.translate(pointer.x, pointer.y);
    ctx.fillStyle = "#e6fbff";
    ctx.strokeStyle = "#2b9de8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 22);
    ctx.lineTo(6, 16);
    ctx.lineTo(12, 28);
    ctx.lineTo(17, 25);
    ctx.lineTo(10, 14);
    ctx.lineTo(20, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  for (const p of d.particles) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    label(ctx, "✦", p.x, p.y, 18, p.color);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#050e1bdf";
  ctx.fillRect(0, 553, 960, 47);
  label(
    ctx,
    pet ? d.actionMessage : d.message,
    480,
    577,
    15,
    pet ? "#e0f1ac" : "#a6e8ff",
    "center",
  );
}

export function petPreview(ctx, pet = false) {
  room(ctx, pet);
  sprite(ctx, pet ? 1 : 0, pet ? 0 : 2, 480, 367, pet ? 305 : 275);
  ctx.fillStyle = "#041024b8";
  ctx.fillRect(0, 0, 960, 152);
  label(
    ctx,
    pet ? "POCKET PET" : "NECO",
    480,
    64,
    43,
    pet ? "#daf693" : "#7fe8ff",
    "center",
  );
  label(
    ctx,
    pet
      ? "A LITTLE FRIEND TO CALL YOUR OWN"
      : "YOUR DESKTOP COMPANION, REIMAGINED",
    480,
    117,
    15,
    "#e1eafd",
    "center",
  );
  ctx.fillStyle = "#061326df";
  ctx.fillRect(0, 477, 960, 123);
  label(
    ctx,
    pet
      ? "Feed, play, rest, and grow together."
      : "Move your pointer. Make a little friend.",
    480,
    508,
    17,
    "#e2eafa",
    "center",
  );
  label(
    ctx,
    "▶  PRESS PLAY OR TAP TO START",
    480,
    559,
    19,
    pet ? "#d3f183" : "#75dfff",
    "center",
  );
}
