(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const startButton = document.querySelector("#start-btn");
  const soundButton = document.querySelector("#sound-btn");
  const fullscreenButton = document.querySelector("#fullscreen-btn");
  const instructions = document.querySelector("#instructions");
  const tabs = [...document.querySelectorAll(".game-tab")];
  const W = canvas.width;
  const H = canvas.height;
  const TAU = Math.PI * 2;

  const config = {
    dodge: {
      title: "Star Sprint",
      button: "Play Star Sprint",
      instruction: "Move with WASD / arrows or drag. Collect stars and dodge meteors.",
      accent: "#ff6b6b",
    },
    memory: {
      title: "Flip Match",
      button: "Play Flip Match",
      instruction: "Click or tap two cards. Match all six pairs in as few moves as possible.",
      accent: "#59e1c0",
    },
    reaction: {
      title: "Quick Tap",
      button: "Play Quick Tap",
      instruction: "Wait for green, then tap the game or press Space. Don’t jump the gun.",
      accent: "#ffd166",
    },
  };

  const game = {
    selected: "dodge",
    mode: "preview",
    score: 0,
    muted: false,
    keys: new Set(),
    pointerDown: false,
    pointer: { x: W / 2, y: H / 2 },
    seed: 934857,
    highScores: loadScores(),
    data: {},
  };

  let audioContext = null;
  let lastTime = performance.now();

  function loadScores() {
    try {
      return JSON.parse(localStorage.getItem("pocket-arcade-scores")) || {};
    } catch {
      return {};
    }
  }

  function saveBest(name, value, lowerIsBetter = false) {
    const old = game.highScores[name];
    if (old == null || (lowerIsBetter ? value < old : value > old)) {
      game.highScores[name] = value;
      localStorage.setItem("pocket-arcade-scores", JSON.stringify(game.highScores));
      return true;
    }
    return false;
  }

  function random() {
    game.seed = (game.seed * 1664525 + 1013904223) >>> 0;
    return game.seed / 4294967296;
  }

  function beep(frequency = 440, duration = 0.06, type = "sine", volume = 0.05) {
    if (game.muted) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch { /* Audio is optional. */ }
  }

  function roundRect(x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function text(value, x, y, size, color = "#f8fbff", align = "left", weight = 700) {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(value, x, y);
  }

  function drawBackdrop(tint = "76, 201, 240") {
    const gradient = ctx.createRadialGradient(W * 0.5, H * 0.42, 20, W * 0.5, H * 0.45, W * 0.72);
    gradient.addColorStop(0, `rgba(${tint}, 0.09)`);
    gradient.addColorStop(1, "rgba(7, 17, 31, 0)");
    ctx.fillStyle = "#091525";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let x = 24; x < W; x += 48) {
      for (let y = 24; y < H; y += 48) ctx.fillRect(x, y, 2, 2);
    }
  }

  function drawTopBar(title, leftLabel, leftValue, rightLabel, rightValue, accent) {
    roundRect(24, 20, W - 48, 64, 18, "rgba(6, 15, 27, 0.68)", "rgba(255,255,255,0.09)");
    roundRect(40, 35, 34, 34, 10, accent);
    text(title, 88, 52, 18, "#f8fbff", "left", 850);
    text(leftLabel.toUpperCase(), W - 330, 42, 10, "#7890aa", "left", 850);
    text(String(leftValue), W - 330, 62, 18, "#f8fbff", "left", 850);
    text(rightLabel.toUpperCase(), W - 160, 42, 10, "#7890aa", "left", 850);
    text(String(rightValue), W - 160, 62, 18, "#f8fbff", "left", 850);
  }

  function selectGame(name, updateUrl = true) {
    game.selected = name;
    game.mode = "preview";
    game.data = {};
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.game === name));
    startButton.textContent = config[name].button;
    instructions.textContent = config[name].instruction;
    if (updateUrl && location.hash !== `#${name}`) history.replaceState(null, "", `#${name}`);
    render();
  }

  function startSelected() {
    if (game.selected === "dodge") startDodge();
    if (game.selected === "memory") startMemory();
    if (game.selected === "reaction") startReaction();
    startButton.textContent = "Restart";
  }

  function startDodge() {
    game.mode = "playing";
    game.score = 0;
    game.seed = 88421;
    game.data = {
      elapsed: 0,
      remaining: 35,
      lives: 3,
      player: { x: W / 2, y: H - 80, r: 18, speed: 330, invulnerable: 0 },
      meteors: [],
      stars: [],
      meteorTimer: 0.4,
      starTimer: 0.8,
      particles: [],
    };
    beep(540, 0.08, "triangle");
  }

  function spawnMeteor() {
    const size = 15 + random() * 21;
    game.data.meteors.push({
      x: 35 + random() * (W - 70),
      y: 95 - size,
      r: size,
      speed: 155 + random() * 155 + game.data.elapsed * 2.2,
      drift: (random() - 0.5) * 55,
      spin: random() * TAU,
    });
  }

  function spawnStar() {
    game.data.stars.push({ x: 45 + random() * (W - 90), y: 105, r: 12, speed: 118 + random() * 42, pulse: random() * TAU });
  }

  function burst(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = random() * TAU;
      const speed = 35 + random() * 80;
      game.data.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.5 + random() * 0.3, color });
    }
  }

  function circlesTouch(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r;
  }

  function updateDodge(dt) {
    const d = game.data;
    d.elapsed += dt;
    d.remaining = Math.max(0, 35 - d.elapsed);
    d.player.invulnerable = Math.max(0, d.player.invulnerable - dt);

    let dx = 0;
    let dy = 0;
    if (game.keys.has("arrowleft") || game.keys.has("a")) dx--;
    if (game.keys.has("arrowright") || game.keys.has("d")) dx++;
    if (game.keys.has("arrowup") || game.keys.has("w")) dy--;
    if (game.keys.has("arrowdown") || game.keys.has("s")) dy++;
    if (dx || dy) {
      const length = Math.hypot(dx, dy);
      d.player.x += (dx / length) * d.player.speed * dt;
      d.player.y += (dy / length) * d.player.speed * dt;
    }
    if (game.pointerDown) {
      const amount = Math.min(1, dt * 10);
      d.player.x += (game.pointer.x - d.player.x) * amount;
      d.player.y += (game.pointer.y - d.player.y) * amount;
    }
    d.player.x = Math.max(d.player.r + 24, Math.min(W - d.player.r - 24, d.player.x));
    d.player.y = Math.max(112 + d.player.r, Math.min(H - d.player.r - 20, d.player.y));

    d.meteorTimer -= dt;
    if (d.meteorTimer <= 0) {
      spawnMeteor();
      d.meteorTimer = Math.max(0.28, 0.72 - d.elapsed * 0.009) * (0.75 + random() * 0.55);
    }
    d.starTimer -= dt;
    if (d.starTimer <= 0) {
      spawnStar();
      d.starTimer = 1.05 + random() * 0.75;
    }

    for (const meteor of d.meteors) {
      meteor.y += meteor.speed * dt;
      meteor.x += meteor.drift * dt;
      meteor.spin += dt * 1.7;
      if (d.player.invulnerable <= 0 && circlesTouch(d.player, meteor)) {
        d.lives--;
        d.player.invulnerable = 1.1;
        meteor.y = H + 100;
        burst(d.player.x, d.player.y, "#ff6b6b");
        beep(130, 0.16, "sawtooth", 0.06);
      }
    }
    for (const star of d.stars) {
      star.y += star.speed * dt;
      star.pulse += dt * 5;
      if (circlesTouch(d.player, star)) {
        game.score += 100;
        star.y = H + 100;
        burst(star.x, star.y - 100, "#ffd166");
        beep(760, 0.07, "sine");
      }
    }
    for (const particle of d.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    }
    d.meteors = d.meteors.filter((item) => item.y < H + 60 && item.x > -80 && item.x < W + 80);
    d.stars = d.stars.filter((item) => item.y < H + 40);
    d.particles = d.particles.filter((item) => item.life > 0);

    if (d.lives <= 0) finishDodge(false);
    else if (d.remaining <= 0) finishDodge(true);
  }

  function finishDodge(survived) {
    game.mode = survived ? "won" : "lost";
    game.data.survived = survived;
    game.data.isBest = saveBest("dodge", game.score);
    startButton.textContent = "Play again";
    beep(survived ? 920 : 180, 0.22, survived ? "sine" : "sawtooth", 0.07);
  }

  function drawDodge() {
    drawBackdrop("255, 107, 107");
    const d = game.data;
    drawTopBar("Star Sprint", "Score", game.score, "Time", `${Math.ceil(d.remaining)}s`, "#ff6b6b");

    for (const star of d.stars) {
      ctx.save();
      ctx.translate(star.x, star.y);
      ctx.rotate(star.pulse * 0.15);
      ctx.fillStyle = "rgba(255,209,102,0.16)";
      ctx.beginPath(); ctx.arc(0, 0, 25 + Math.sin(star.pulse) * 2, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 ? 5 : 13;
        const angle = -Math.PI / 2 + i * Math.PI / 5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }

    for (const meteor of d.meteors) {
      ctx.save(); ctx.translate(meteor.x, meteor.y); ctx.rotate(meteor.spin);
      const gradient = ctx.createRadialGradient(-meteor.r * 0.3, -meteor.r * 0.35, 2, 0, 0, meteor.r);
      gradient.addColorStop(0, "#ff9b7a"); gradient.addColorStop(1, "#9e354e");
      ctx.fillStyle = gradient; ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = meteor.r * (0.78 + randomVisual(meteor.x + i) * 0.22);
        const a = i * TAU / 10;
        i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(70,20,42,0.34)"; ctx.beginPath(); ctx.arc(-meteor.r * 0.25, 0, meteor.r * 0.2, 0, TAU); ctx.fill();
      ctx.restore();
    }

    for (const particle of d.particles) {
      ctx.globalAlpha = Math.min(1, particle.life * 2);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    const p = d.player;
    ctx.save();
    ctx.globalAlpha = p.invulnerable > 0 && Math.floor(p.invulnerable * 12) % 2 ? 0.28 : 1;
    ctx.translate(p.x, p.y);
    ctx.shadowColor = "#4cc9f0"; ctx.shadowBlur = 20;
    ctx.fillStyle = "#4cc9f0";
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(19, 18); ctx.lineTo(0, 11); ctx.lineTo(-19, 18); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = "#f8fbff"; ctx.beginPath(); ctx.arc(0, -3, 5, 0, TAU); ctx.fill();
    ctx.restore();

    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = i < d.lives ? 1 : 0.18;
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath(); ctx.arc(45 + i * 23, H - 28, 7, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function randomVisual(n) {
    return Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
  }

  function startMemory() {
    game.mode = "playing";
    game.score = 0;
    game.seed = 12991;
    const values = ["✦", "●", "▲", "◆", "☾", "⚡", "✦", "●", "▲", "◆", "☾", "⚡"];
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    game.data = {
      cards: values.map((value, index) => ({ value, index, flipped: false, matched: false })),
      open: [],
      moves: 0,
      elapsed: 0,
      lockTime: 0,
      matched: 0,
    };
    beep(540, 0.08, "triangle");
  }

  function cardRect(index) {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const width = 150;
    const height = 116;
    const gap = 18;
    const totalWidth = width * 4 + gap * 3;
    return { x: (W - totalWidth) / 2 + col * (width + gap), y: 128 + row * (height + gap), width, height };
  }

  function flipCard(index) {
    const d = game.data;
    const card = d.cards[index];
    if (game.mode !== "playing" || d.lockTime > 0 || !card || card.flipped || card.matched) return;
    card.flipped = true;
    d.open.push(index);
    beep(430 + index * 12, 0.04, "triangle", 0.035);
    if (d.open.length === 2) {
      d.moves++;
      const [a, b] = d.open.map((cardIndex) => d.cards[cardIndex]);
      if (a.value === b.value) {
        a.matched = true;
        b.matched = true;
        d.matched += 2;
        d.open = [];
        game.score += 250;
        beep(780, 0.1, "sine", 0.055);
        if (d.matched === d.cards.length) {
          game.mode = "won";
          game.score = Math.max(100, 3000 - d.moves * 100 - Math.floor(d.elapsed) * 10);
          d.isBest = saveBest("memory", d.moves, true);
          startButton.textContent = "Play again";
        }
      } else {
        d.lockTime = 0.72;
      }
    }
  }

  function updateMemory(dt) {
    const d = game.data;
    d.elapsed += dt;
    if (d.lockTime > 0) {
      d.lockTime -= dt;
      if (d.lockTime <= 0) {
        d.open.forEach((index) => { d.cards[index].flipped = false; });
        d.open = [];
      }
    }
  }

  const memoryColors = { "✦": "#ffd166", "●": "#ff6b6b", "▲": "#4cc9f0", "◆": "#59e1c0", "☾": "#bd93f9", "⚡": "#ff9f43" };

  function drawMemory() {
    drawBackdrop("89, 225, 192");
    const d = game.data;
    drawTopBar("Flip Match", "Moves", d.moves, "Pairs", `${d.matched / 2}/6`, "#59e1c0");
    d.cards.forEach((card, index) => {
      const r = cardRect(index);
      const visible = card.flipped || card.matched;
      const fill = card.matched ? "rgba(89,225,192,0.16)" : visible ? "#132b43" : "#102238";
      roundRect(r.x, r.y, r.width, r.height, 18, fill, card.matched ? "rgba(89,225,192,0.55)" : "rgba(255,255,255,0.10)");
      if (visible) {
        ctx.save();
        if (card.matched) { ctx.shadowColor = memoryColors[card.value]; ctx.shadowBlur = 18; }
        text(card.value, r.x + r.width / 2, r.y + r.height / 2, 43, memoryColors[card.value], "center", 900);
        ctx.restore();
      } else {
        ctx.strokeStyle = "rgba(76,201,240,0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x + r.width / 2, r.y + r.height / 2, 17, 0, TAU);
        ctx.stroke();
        text("?", r.x + r.width / 2, r.y + r.height / 2, 19, "#58708a", "center", 850);
      }
    });
  }

  function startReaction() {
    game.mode = "playing";
    game.score = 0;
    // A repeatable seed keeps automated checks reliable while the delay still
    // feels unpredictable to a person starting a new round.
    game.seed = 7291;
    game.data = { phase: "waiting", timer: 1.8 + random() * 2.2, reaction: null, rounds: [], message: "WAIT FOR GREEN" };
    beep(360, 0.05, "triangle");
  }

  function reactionAction() {
    if (game.selected !== "reaction") return;
    const d = game.data;
    if (game.mode === "preview") { startSelected(); return; }
    if (game.mode === "won" || d.phase === "result" || d.phase === "false") { startReaction(); return; }
    if (d.phase === "waiting") {
      d.phase = "false";
      d.message = "TOO SOON";
      game.mode = "lost";
      startButton.textContent = "Try again";
      beep(140, 0.18, "sawtooth", 0.06);
    } else if (d.phase === "ready") {
      d.reaction = Math.round(d.timer * 1000);
      d.phase = "result";
      d.message = d.reaction < 220 ? "LIGHTNING FAST" : d.reaction < 320 ? "NICE REFLEXES" : "KEEP PRACTICING";
      game.mode = "won";
      game.score = Math.max(0, 1000 - d.reaction);
      d.isBest = saveBest("reaction", d.reaction, true);
      startButton.textContent = "Go again";
      beep(880, 0.12, "sine", 0.06);
    }
  }

  function updateReaction(dt) {
    const d = game.data;
    if (d.phase === "waiting") {
      d.timer -= dt;
      if (d.timer <= 0) {
        d.phase = "ready";
        d.timer = 0;
        d.message = "TAP NOW!";
        beep(680, 0.08, "square", 0.05);
      }
    } else if (d.phase === "ready") {
      d.timer += dt;
      if (d.timer >= 2) {
        d.reaction = 2000;
        d.phase = "result";
        d.message = "MISSED IT";
        game.mode = "lost";
        startButton.textContent = "Try again";
      }
    }
  }

  function drawReaction() {
    const d = game.data;
    const ready = d.phase === "ready";
    const failed = d.phase === "false";
    drawBackdrop(ready ? "89, 225, 192" : failed ? "255, 107, 107" : "255, 209, 102");
    drawTopBar("Quick Tap", "Best", game.highScores.reaction ? `${game.highScores.reaction}ms` : "—", "Score", game.score, "#ffd166");

    const color = ready ? "#59e1c0" : failed ? "#ff6b6b" : "#ffd166";
    ctx.fillStyle = ready ? "rgba(89,225,192,0.10)" : failed ? "rgba(255,107,107,0.08)" : "rgba(255,209,102,0.07)";
    ctx.beginPath(); ctx.arc(W / 2, 327, 155, 0, TAU); ctx.fill();
    ctx.strokeStyle = color; ctx.globalAlpha = 0.24; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W / 2, 327, 122, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(W / 2, 327, ready ? 86 : 74, 0, TAU); ctx.fill();
    text(ready ? "!" : failed ? "×" : d.phase === "result" ? "✓" : "…", W / 2, 322, 62, "#07111f", "center", 950);
    text(d.message, W / 2, 455, 24, color, "center", 900);
    if (d.reaction != null && d.phase === "result") text(`${d.reaction} ms`, W / 2, 500, 40, "#f8fbff", "center", 900);
    else text("Press Space or tap the circle", W / 2, 500, 15, "#7890aa", "center", 650);
  }

  function drawPreview() {
    const selected = config[game.selected];
    const tint = game.selected === "dodge" ? "255, 107, 107" : game.selected === "memory" ? "89, 225, 192" : "255, 209, 102";
    drawBackdrop(tint);
    const best = game.highScores[game.selected];
    text(selected.title, W / 2, 188, 55, "#f8fbff", "center", 900);
    text(game.selected === "dodge" ? "COLLECT. DODGE. SURVIVE." : game.selected === "memory" ? "SIX PAIRS. ONE SHARP MIND." : "ONE TAP. EVERY MILLISECOND COUNTS.", W / 2, 242, 14, selected.accent, "center", 900);

    const icons = game.selected === "dodge" ? ["✦", "↗", "●"] : game.selected === "memory" ? ["◇", "◆", "○"] : ["…", "⚡", "!"];
    icons.forEach((icon, index) => {
      const x = W / 2 + (index - 1) * 118;
      roundRect(x - 45, 286, 90, 90, 24, index === 1 ? selected.accent : "rgba(255,255,255,0.055)", "rgba(255,255,255,0.09)");
      text(icon, x, 332, 35, index === 1 ? "#07111f" : "#8195ad", "center", 900);
    });
    text(selected.instruction, W / 2, 425, 15, "#93a5bc", "center", 600);
    roundRect(W / 2 - 110, 464, 220, 48, 14, selected.accent);
    text("CLICK PLAY TO START", W / 2, 488, 12, "#07111f", "center", 950);
    if (best != null) {
      const label = game.selected === "reaction" ? `${best} ms` : game.selected === "memory" ? `${best} moves` : `${best} pts`;
      text(`YOUR BEST  ${label}`, W / 2, 548, 11, "#667b95", "center", 850);
    }
  }

  function drawOverlay() {
    ctx.fillStyle = "rgba(4,10,19,0.78)";
    ctx.fillRect(0, 0, W, H);
    const won = game.mode === "won";
    const d = game.data;
    const accent = won ? "#59e1c0" : "#ff6b6b";
    text(won ? "NICE RUN!" : d.phase === "false" ? "JUMPED THE GUN" : "GAME OVER", W / 2, 235, 42, "#f8fbff", "center", 950);
    let result = `${game.score} POINTS`;
    if (game.selected === "memory") result = `${d.moves} MOVES`;
    if (game.selected === "reaction" && d.reaction != null) result = `${d.reaction} MS`;
    text(result, W / 2, 291, 20, accent, "center", 900);
    if (d.isBest) text("NEW PERSONAL BEST", W / 2, 332, 12, "#ffd166", "center", 900);
    roundRect(W / 2 - 96, 370, 192, 50, 14, accent);
    text("PLAY AGAIN", W / 2, 395, 13, "#07111f", "center", 950);
    text("Click the button below or press Enter", W / 2, 456, 13, "#7890aa", "center", 600);
  }

  function update(dt) {
    if (game.mode !== "playing") return;
    if (game.selected === "dodge") updateDodge(dt);
    if (game.selected === "memory") updateMemory(dt);
    if (game.selected === "reaction") updateReaction(dt);
  }

  function render() {
    if (game.mode === "preview") drawPreview();
    else {
      if (game.selected === "dodge") drawDodge();
      if (game.selected === "memory") drawMemory();
      if (game.selected === "reaction") drawReaction();
      if (game.mode === "won" || game.mode === "lost") drawOverlay();
    }
  }

  function frame(now) {
    const dt = Math.min(0.035, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * W / rect.width, y: (event.clientY - rect.top) * H / rect.height };
  }

  function handlePointer(event) {
    const point = canvasPoint(event);
    game.pointer = point;
    if (game.mode === "preview") return;
    if (game.selected === "memory" && game.mode === "playing") {
      game.data.cards.forEach((_, index) => {
        const r = cardRect(index);
        if (point.x >= r.x && point.x <= r.x + r.width && point.y >= r.y && point.y <= r.y + r.height) flipCard(index);
      });
    } else if (game.selected === "reaction") {
      reactionAction();
    }
  }

  canvas.addEventListener("pointerdown", (event) => {
    game.pointerDown = true;
    canvas.setPointerCapture?.(event.pointerId);
    handlePointer(event);
  });
  canvas.addEventListener("pointermove", (event) => {
    game.pointer = canvasPoint(event);
  });
  canvas.addEventListener("pointerup", () => { game.pointerDown = false; });
  canvas.addEventListener("pointercancel", () => { game.pointerDown = false; });

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(key)) event.preventDefault();
    game.keys.add(key);
    if (key === "f") toggleFullscreen();
    if (key === "enter" && game.mode !== "playing") startSelected();
    if ((key === " " || key === "spacebar") && game.selected === "reaction" && !event.repeat) reactionAction();
  });
  window.addEventListener("keyup", (event) => game.keys.delete(event.key.toLowerCase()));

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.querySelector(".game-frame").requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => selectGame(tab.dataset.game)));
  startButton.addEventListener("click", startSelected);
  fullscreenButton.addEventListener("click", toggleFullscreen);
  soundButton.addEventListener("click", () => {
    game.muted = !game.muted;
    soundButton.textContent = game.muted ? "×" : "♪";
    soundButton.setAttribute("aria-label", game.muted ? "Enable sound" : "Mute sound");
  });

  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < steps; i++) update(1 / 60);
    render();
  };

  window.render_game_to_text = () => {
    const base = {
      coordinateSystem: "canvas 960x600; origin top-left; x increases right, y increases down",
      selectedGame: game.selected,
      mode: game.mode,
      score: game.score,
      best: game.highScores[game.selected] ?? null,
    };
    if (game.mode === "preview") return JSON.stringify({ ...base, action: `Activate Play ${config[game.selected].title} to begin` });
    if (game.selected === "dodge") {
      const d = game.data;
      return JSON.stringify({ ...base, player: { x: Math.round(d.player.x), y: Math.round(d.player.y), radius: d.player.r, lives: d.lives, invulnerable: d.player.invulnerable > 0 }, timeRemaining: Number(d.remaining.toFixed(1)), meteors: d.meteors.map((m) => ({ x: Math.round(m.x), y: Math.round(m.y), radius: Math.round(m.r) })), stars: d.stars.map((s) => ({ x: Math.round(s.x), y: Math.round(s.y), radius: s.r })) });
    }
    if (game.selected === "memory") {
      const d = game.data;
      return JSON.stringify({ ...base, moves: d.moves, matchedPairs: d.matched / 2, locked: d.lockTime > 0, cards: d.cards.map((card, index) => ({ index, row: Math.floor(index / 4), column: index % 4, visible: card.flipped || card.matched, value: card.flipped || card.matched ? card.value : null, matched: card.matched })) });
    }
    const d = game.data;
    return JSON.stringify({ ...base, phase: d.phase, prompt: d.message, reactionMs: d.reaction });
  };

  const initialGame = config[location.hash.slice(1)] ? location.hash.slice(1) : "dodge";
  selectGame(initialGame, false);
  requestAnimationFrame(frame);
})();
