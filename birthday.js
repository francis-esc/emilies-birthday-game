// ---------------------------------------------------------------------------
// Birthday garden quest for Émilie
//
// This file is intentionally self-contained so the base Animal Crossing game
// keeps working. It only adds a small, optional quest on top of the existing
// world: find six glowing shoots, plant them by the pond, water them, then
// open the birthday present.
// ---------------------------------------------------------------------------

let bdOrigin = null;
let bdScale = 1;
let bdDigSpots = [];
let bdPlots = [];
let bdInventory = [];
let bdGift = null;
let bdConfetti = [];
let bdLang = 'ja';
let bdCollected = 0;
let bdPlanted = 0;
let bdGrown = 0;
let bdGiftReady = false;
let bdGiftOpened = false;
let bdIntroShown = false;
let bdModalOpen = false;
let bdHover = null;
let bdFreezePlayer = false;
let bdToastTimeout = null;
let bdEl = {};

const BD_PLANTS = [
  { id: 'sakura',  ja: 'サクラ',    en: 'Sakura',    color: [255, 183, 197] },
  { id: 'momiji',  ja: 'モミジ',    en: 'Momiji',    color: [229, 115, 115] },
  { id: 'bonsai',  ja: 'ボンサイ',  en: 'Bonsai',    color: [141, 110,  99] },
  { id: 'fuji',    ja: 'フジ',      en: 'Wisteria',  color: [149, 117, 205] },
  { id: 'bamboo',  ja: '竹',        en: 'Bamboo',    color: [129, 199, 132] },
  { id: 'tsubaki', ja: 'ツバキ',    en: 'Camellia',  color: [240,  98, 146] },
];

const BD_TEXT = {
  ja: {
    title: 'エミリーの誕生日ガーデン',
    progress: (c, p, g) => `タネ ${c}/6 ・ 植えた ${p}/6 ・ 咲いた ${g}/6`,
    hint: '光る場所をクリックで掘る / 畑をクリックで植える・水やり',
    langBtn: 'English',
    dug: (n) => `タネを掘り出した！ (${n}/6)`,
    planted: 'タネを植えた！ もう一度クリックで水をあげよう',
    watered: (n) => `水をあげた (${n}/3)`,
    bloom: 'きれいに咲いた！✨',
    allBloomed: '6つ全部咲いたよ！プレゼントの風船が降りてきた！🎈',
    giftHint: 'プレゼントをクリックして開けよう',
    giftOpen: 'プレゼントを開けた！',
    noShoot: '植えるタネがないよ。光る場所を探そう',
    alreadyGrown: 'この花はもう咲いているよ',
    intro: 'エミリー、誕生日おめでとう！6つのタネを探して、池のそばの畑に植えよう🌸',
    letterTitle: 'エミリー、お誕生日おめでとう！🌸',
    letterBody: `エミリーへ

お誕生日おめでとう！🌸
いつも笑顔で周りを照らしてくれてありがとう。
新しい一年が、やさしい光と小さな幸せでいっぱいになりますように。

プレゼントは3つ：`,
    letterOutro: `また一緒に、たくさん思い出をつくろうね。
大好きだよ。`,
    giftNames: ['ポーチ', '新しいトップス', 'コスメ'],
    close: '閉じる',
    digLabel: '掘る',
    plantLabel: '植える',
    waterLabel: '水やり',
    bloomLabel: '満開',
    giftLabel: '開ける',
  },
  en: {
    title: "Émilie's Birthday Garden",
    progress: (c, p, g) => `Shoots ${c}/6 • Planted ${p}/6 • Bloomed ${g}/6`,
    hint: 'Click a sparkle to dig • Click a plot to plant or water',
    langBtn: '日本語',
    dug: (n) => `Found a shoot! (${n}/6)`,
    planted: 'Planted! Click again to water it',
    watered: (n) => `Watered (${n}/3)`,
    bloom: 'It bloomed! ✨',
    allBloomed: 'All six are blooming! A present balloon is floating down! 🎈',
    giftHint: 'Click the present to open it',
    giftOpen: 'You opened the present!',
    noShoot: 'No shoots left to plant. Look for the sparkles!',
    alreadyGrown: 'This flower is already blooming',
    intro: "Émilie, happy birthday! Find the six shoots and plant them by the pond 🌸",
    letterTitle: 'Happy Birthday, Émilie! 🌸',
    letterBody: `Dear Émilie,

Happy Birthday! 🌸
Thank you for always lighting up the world with your smile.
May the year ahead be full of gentle light and little joys.

Your presents:`,
    letterOutro: `Let's make many more memories together.
With all my love.`,
    giftNames: ['A pouch', 'A new top', 'Some cosmetics'],
    close: 'Close',
    digLabel: 'Dig',
    plantLabel: 'Plant',
    waterLabel: 'Water',
    bloomLabel: 'Bloom',
    giftLabel: 'Open',
  },
};

function bdT() {
  return BD_TEXT[bdLang];
}

// Four-page birthday greeting for each villager. The base game appends the
// player name to the first page of the default dialogue, so we replace that
// whole page here and insert the name ourselves.
const BD_VILLAGER_BIRTHDAY = {
  0: [ // Blathers
    'Hoo! My goodness! Happy Birthday to you, {name}!',
    'What a magnificent occasion! Did you know that\nhuman birthdays are a fascinating tradition\ndating back centuries?',
    "Oh, but pardon me—I shan't ramble on and\nbore you on your special day!",
    'May your new year be filled with extraordinary\ndiscoveries, rare fossils, and—hoo!—\nabsolutely no bugs!',
  ],
  1: [ // Isabelle
    'Happy, happy Birthday, {name}! *claps hands*',
    'Everyone on the island has been talking\nabout it all morning! I made sure to highlight\ntoday in the morning announcements, of course.',
    'Please make sure you take time to relax, eat some\ncake, and celebrate with all your friends today.',
    "You do so much for our town, and we're all\nso lucky to have you!",
  ],
  2: [ // K.K. Slider
    'Hey... happy birthday, kid.\nAnother trip around the sun, huh?',
    'Music is a lot like aging—it gets richer\nthe longer it plays.',
    'I wrote a little tune for a day just like this.\nSo kick back, close your eyes, and let the rhythm\ncarry you into your next year.',
    "This one's for you...",
  ],
  3: [ // Tom Nook
    'Ah, yes! Happy Birthday, {name}!\nAnother year older, another year of growth...',
    '...and speaking of growth, your island home value\nhas never looked better!',
    "Now, I won't ask for a single Bell today.\nIn fact, why don't you head over to Nook's Cranny\nand treat yourself to something nice?",
    'Just remember... tomorrow, we get back to business!\nYes, yes!',
  ],
  4: [ // Marshal (the smug villager in this game)
    'Ah, the guest of honor arrives!\nHappy Birthday, {name}, my friend.',
    "Crisp air, flawless lighting, and you at the very\ncenter of it all—it's practically a scene from\na movie, isn't it?",
    "I've curated a look just for today, but honestly,\nyour birthday glow is doing all the work.",
    'Stay iconic!',
  ],
};

function bdVillagerGreeting(index, page) {
  const pages = BD_VILLAGER_BIRTHDAY[index];
  if (!pages || page < 0 || page >= pages.length) return null;
  const name = (typeof playerName !== 'undefined' && playerName) ? playerName : 'Émilie';
  return pages[page].replace(/\{name\}/g, name);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

function bdSetup() {
  bdScale = Math.max(0.55, Math.min(width, height) / 800);
  bdOrigin = { x: playerFemale.position.x, y: playerFemale.position.y };

  // Two columns of shoots on either side of the player. Keeping them off the
  // center column stops the player sprite (drawn after bdDraw) hiding one, and
  // keeps the top row below the HUD.
  const digColX = [-0.24, 0.24];
  const digY = [-0.25, -0.10, 0.05];
  const plotColX = [-0.27, 0, 0.27];
  const plotY = [0.15, 0.31];

  // Six dig spots in the grass around the player.
  bdDigSpots = [];
  let spotIndex = 0;
  for (let row = 0; row < digY.length; row++) {
    for (let col = 0; col < digColX.length; col++) {
      bdDigSpots.push({
        x: bdOrigin.x + digColX[col] * width,
        y: bdOrigin.y + digY[row] * height,
        collected: false,
        phase: spotIndex * 0.9,
      });
      spotIndex++;
    }
  }

  // Six soil plots in a little garden below the player.
  bdPlots = [];
  for (let row = 0; row < plotY.length; row++) {
    for (let col = 0; col < plotColX.length; col++) {
      bdPlots.push({
        x: bdOrigin.x + plotColX[col] * width,
        y: bdOrigin.y + plotY[row] * height,
        planted: false,
        plantIndex: -1,
        water: 0,
        grown: false,
        sway: Math.random() * Math.PI * 2,
      });
    }
  }

  bdInventory = [];
  bdCollected = 0;
  bdPlanted = 0;
  bdGrown = 0;
  bdGiftReady = false;
  bdGiftOpened = false;
  bdGift = {
    active: false,
    opened: false,
    notified: false,
    x: bdOrigin.x + width * 0.14,
    y: bdOrigin.y - height * 0.65,
    targetY: bdOrigin.y + height * 0.10,
    t: 0,
  };
  bdConfetti = [];

  bdEl = {
    hud: document.getElementById('birthdayHud'),
    title: document.getElementById('birthdayTitle'),
    progress: document.getElementById('birthdayProgress'),
    hint: document.getElementById('birthdayHint'),
    lang: document.getElementById('birthdayLang'),
    toast: document.getElementById('birthdayToast'),
    modal: document.getElementById('birthdayModal'),
    letterTitle: document.getElementById('birthdayLetterTitle'),
    letterBody: document.getElementById('birthdayLetterBody'),
    letterOutro: document.getElementById('birthdayLetterOutro'),
    giftImages: [
      document.getElementById('birthdayGiftPouchImg'),
      document.getElementById('birthdayGiftTopImg'),
      document.getElementById('birthdayGiftCosmeticsImg'),
    ],
    close: document.getElementById('birthdayClose'),
    letterLang: document.getElementById('birthdayLetterLang'),
  };

  if (bdEl.lang) {
    bdEl.lang.addEventListener('click', bdToggleLanguage);
  }
  if (bdEl.letterLang) {
    bdEl.letterLang.addEventListener('click', bdToggleLanguage);
  }
  if (bdEl.close) {
    bdEl.close.addEventListener('click', bdCloseLetter);
  }
  if (bdEl.modal) {
    bdEl.modal.addEventListener('click', (event) => {
      if (event.target === bdEl.modal) {
        bdCloseLetter();
      }
    });
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && bdModalOpen) {
      bdCloseLetter();
      return;
    }
    if ((event.key === 'e' || event.key === 'E') && bdCanPlay()) {
      bdInteractNearest();
    }
  });

  bdApplyLanguage();
  bdUpdateHud();
}

function bdToggleLanguage() {
  bdLang = bdLang === 'ja' ? 'en' : 'ja';
  bdApplyLanguage();
}

function bdApplyLanguage() {
  const t = bdT();
  if (bdEl.title) bdEl.title.textContent = t.title;
  if (bdEl.hint) bdEl.hint.textContent = t.hint;
  if (bdEl.lang) bdEl.lang.textContent = t.langBtn;
  if (bdEl.letterLang) bdEl.letterLang.textContent = t.langBtn;
  if (bdEl.letterTitle) bdEl.letterTitle.textContent = t.letterTitle;
  if (bdEl.letterBody) bdEl.letterBody.textContent = t.letterBody;
  if (bdEl.letterOutro) bdEl.letterOutro.textContent = t.letterOutro;
  (bdEl.giftImages || []).forEach((img, i) => {
    if (img) img.alt = t.giftNames[i];
  });
  if (bdEl.close) bdEl.close.textContent = t.close;
  bdUpdateHud();
}

function bdUpdateHud() {
  if (!bdEl.progress) return;
  bdEl.progress.textContent = bdT().progress(bdCollected, bdPlanted, bdGrown);
}

function bdSyncHudVisibility() {
  if (!bdEl || !bdEl.hud) return;
  const visible = typeof gameState !== 'undefined'
    && gameState === 'world'
    && !isOpening
    && !enterName;
  bdEl.hud.classList.toggle('birthday-hidden', !visible);
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function bdDraw() {
  if (!bdOrigin || !bdEl.hud) return;

  if (!bdIntroShown && !isOpening && !enterName) {
    bdIntroShown = true;
    bdShowToast(bdT().intro, 5200);
  }

  bdUpdateHover();
  // The base game walks the player toward the cursor every frame. While the
  // cursor is over a quest target, stop her so the target doesn't slide away
  // between aiming and clicking.
  if (bdHover) {
    if (!bdFreezePlayer && playerFemale && playerFemale.changeAnimation) {
      playerFemale.changeAnimation('normal');
    }
    bdFreezePlayer = true;
  } else {
    bdFreezePlayer = false;
  }
  bdDrawPond();
  for (let i = 0; i < bdPlots.length; i++) {
    bdDrawPlot(bdPlots[i], i);
  }
  for (let i = 0; i < bdDigSpots.length; i++) {
    bdDrawDigSpot(bdDigSpots[i], i);
  }

  if (bdGift.active) {
    bdDrawGift();
  }
  bdDrawConfetti();
  bdHandleClick();
}

function bdDrawPond() {
  const s = bdScale;
  const px = bdOrigin.x;
  const py = bdOrigin.y + height * 0.23;
  const pw = width * 0.62;
  const ph = height * 0.10;

  push();

  // Sandy bank and sunny rim.
  noStroke();
  fill(232, 214, 158, 225);
  ellipse(px, py + 3 * s, pw + 30 * s, ph + 24 * s);
  fill(245, 231, 188, 195);
  ellipse(px, py, pw + 12 * s, ph + 11 * s);

  // Pond water: a darker base with a soft sunlit reflection.
  fill(63, 146, 191, 240);
  ellipse(px, py, pw, ph);
  fill(88, 174, 211, 170);
  ellipse(px, py - ph * 0.10, pw * 0.82, ph * 0.72);
  fill(116, 201, 224, 85);
  ellipse(px - pw * 0.10, py + ph * 0.03, pw * 0.60, ph * 0.42);
  noFill();
  stroke(42, 113, 142, 90);
  strokeWeight(2.4 * s);
  ellipse(px, py, pw, ph);

  // Ripples.
  stroke(255, 255, 255, 95);
  strokeWeight(2 * s);
  ellipse(px - pw * 0.14, py - ph * 0.08, pw * 0.24, ph * 0.26);
  ellipse(px + pw * 0.17, py + ph * 0.10, pw * 0.18, ph * 0.22);
  ellipse(px + pw * 0.02, py - ph * 0.02, pw * 0.10, ph * 0.14);
  const ripple = 0.90 + Math.sin(frameCount * 0.028) * 0.09;
  stroke(255, 255, 255, 48);
  ellipse(px + pw * 0.05, py + ph * 0.02, pw * 0.33 * ripple, ph * 0.38 * ripple);

  // Lily pads, with a tiny blossom on the largest one.
  noStroke();
  const pads = [
    { dx: -0.23, dy: -0.17, size: 1.00, rot: 18 },
    { dx: 0.20, dy: 0.15, size: 0.82, rot: 205 },
    { dx: -0.04, dy: 0.21, size: 0.64, rot: 110 },
  ];
  for (let i = 0; i < pads.length; i++) {
    const pad = pads[i];
    const lx = px + pad.dx * pw;
    const ly = py + pad.dy * ph;
    fill(92, 168, 101, 235);
    arc(lx, ly, 25 * s * pad.size, 17 * s * pad.size, pad.rot, pad.rot + 320, PIE);
    fill(135, 198, 128, 120);
    arc(
      lx - 2 * s,
      ly - 1.5 * s,
      15 * s * pad.size,
      10 * s * pad.size,
      pad.rot + 20,
      pad.rot + 170,
      PIE
    );
    if (i === 0) {
      const fx = lx + 3 * s;
      const fy = ly - 2 * s;
      fill(255, 198, 213, 235);
      for (let p = 0; p < 5; p++) {
        const angle = (Math.PI * 2 * p) / 5 - Math.PI / 2;
        ellipse(fx + Math.cos(angle) * 4 * s, fy + Math.sin(angle) * 4 * s, 4 * s, 4 * s);
      }
      fill(255, 222, 112);
      ellipse(fx, fy, 3 * s, 3 * s);
    }
  }

  // A few reeds at the water's edge.
  for (let side = -1; side <= 1; side += 2) {
    const rx = px + side * pw * 0.43;
    const ry = py + ph * 0.14;
    for (let r = 0; r < 3; r++) {
      const tipX = rx + side * r * 6 * s;
      const tipY = ry - (22 + r * 7) * s;
      stroke(76, 139, 68, 220);
      strokeWeight(2 * s);
      line(rx + side * r * 4 * s, ry, tipX, tipY);
      noStroke();
      fill(133, 89, 55, 235);
      ellipse(tipX, tipY, 5 * s, 11 * s);
    }
  }

  pop();
}

function bdDrawDigSpot(spot, index) {
  const s = bdScale;
  const hovered = bdHover && bdHover.type === 'dig' && bdHover.index === index;

  push();
  translate(spot.x, spot.y);
  noStroke();

  if (spot.collected) {
    fill(121, 85, 72, 170);
    ellipse(0, 7 * s, 24 * s, 9 * s);
    fill(93, 64, 55, 130);
    ellipse(0, 5 * s, 12 * s, 5 * s);
  } else {
    const pulse = 1 + 0.12 * Math.sin(frameCount * 0.08 + spot.phase);
    // Soft golden glow.
    fill(255, 218, 83, 55);
    ellipse(0, 0, 58 * s * pulse, 58 * s * pulse);
    fill(255, 226, 115, 75);
    ellipse(0, 0, 42 * s * pulse, 42 * s * pulse);

    // Sparkle cross.
    fill(255, 225, 90);
    beginShape();
    vertex(0, -19 * s * pulse);
    vertex(5 * s, -5 * s);
    vertex(19 * s * pulse, 0);
    vertex(5 * s, 5 * s);
    vertex(0, 19 * s * pulse);
    vertex(-5 * s, 5 * s);
    vertex(-19 * s * pulse, 0);
    vertex(-5 * s, -5 * s);
    endShape(CLOSE);

    // Tiny green shoot peeking out of the sparkle.
    stroke(67, 160, 71);
    strokeWeight(3 * s);
    noFill();
    line(0, 9 * s, 0, 1 * s);
    fill(102, 187, 106);
    noStroke();
    ellipse(-5 * s, 1 * s, 9 * s, 5 * s);
    ellipse(5 * s, -2 * s, 9 * s, 5 * s);
  }

  if (hovered && !spot.collected) {
    noFill();
    stroke(255, 255, 255, 210);
    strokeWeight(3 * s);
    ellipse(0, 0, 50 * s, 50 * s);
    bdDrawLabel(bdT().digLabel, 0, -40 * s);
  }
  pop();
}

function bdDrawPlot(plot, index) {
  const s = bdScale;
  const hovered = bdHover && bdHover.type === 'plot' && bdHover.index === index;
  const w = 64 * s;
  const h = 42 * s;

  push();
  translate(plot.x, plot.y);

  // Soil bed.
  fill(124, 88, 70);
  stroke(82, 53, 43);
  strokeWeight(3 * s);
  rect(-w / 2, -h / 2, w, h, 6 * s);
  noStroke();
  fill(146, 105, 82);
  rect(-w / 2 + 4 * s, -h / 2 + 4 * s, w - 8 * s, h - 8 * s, 4 * s);

  if (plot.planted) {
    const plant = BD_PLANTS[plot.plantIndex];
    const sway = Math.sin(frameCount * 0.045 + plot.sway) * 2.4 * s;
    const growth = plot.grown ? 1 : 0.5 + plot.water * 0.13;
    const stemH = 25 * s * growth;

    // Stem and leaves.
    stroke(67, 160, 71);
    strokeWeight(3.5 * s);
    noFill();
    line(0, 8 * s, sway, 8 * s - stemH);
    noStroke();
    fill(102, 187, 106);
    ellipse(sway - 7 * s, 8 * s - stemH * 0.46, 14 * s, 7 * s);
    ellipse(sway + 7 * s, 8 * s - stemH * 0.66, 14 * s, 7 * s);

    if (plot.grown) {
      // Flower petals.
      const cx = sway;
      const cy = 10 * s - stemH;
      fill(plant.color[0], plant.color[1], plant.color[2]);
      for (let p = 0; p < 6; p++) {
        const angle = (Math.PI * 2 * p) / 6 + frameCount * 0.003;
        ellipse(
          cx + Math.cos(angle) * 8 * s,
          cy + Math.sin(angle) * 8 * s,
          12 * s,
          12 * s
        );
      }
      fill(255, 225, 115);
      ellipse(cx, cy, 8 * s, 8 * s);
      fill(255, 255, 255, 170);
      ellipse(cx - 3 * s, cy - 3 * s, 3 * s, 3 * s);
    } else {
      // Bud.
      fill(plant.color[0], plant.color[1], plant.color[2], 190);
      ellipse(sway, 10 * s - stemH, 9 * s + plot.water * 1.5 * s, 10 * s + plot.water * 1.5 * s);
    }
  } else {
    // Little planting holes.
    noStroke();
    fill(82, 53, 43, 150);
    ellipse(-12 * s, 0, 6 * s, 4 * s);
    ellipse(0, 4 * s, 6 * s, 4 * s);
    ellipse(12 * s, -2 * s, 6 * s, 4 * s);
    fill(255, 255, 255, 95);
    ellipse(0, -h / 2 - 5 * s, 10 * s, 4 * s);
  }

  if (hovered) {
    noFill();
    stroke(255, 255, 255, 220);
    strokeWeight(3 * s);
    rect(-w / 2 - 3 * s, -h / 2 - 3 * s, w + 6 * s, h + 6 * s, 8 * s);
    const label = plot.grown
      ? bdT().bloomLabel
      : (plot.planted ? bdT().waterLabel : bdT().plantLabel);
    bdDrawLabel(label, 0, -h / 2 - 16 * s);
  }
  pop();
}

function bdDrawLabel(label, x, y) {
  const s = bdScale;
  push();
  textAlign(CENTER, CENTER);
  textSize(13 * s);
  textFont('sans-serif');
  const labelWidth = textWidth(label) + 18 * s;
  noStroke();
  fill(255, 255, 255, 235);
  rect(x - labelWidth / 2, y - 10 * s, labelWidth, 20 * s, 10 * s);
  fill(74, 48, 38);
  text(label, x, y + 0.5 * s);
  pop();
}

function bdDrawGift() {
  const s = bdScale;
  const g = bdGift;
  g.t += 1;

  if (g.y < g.targetY) {
    g.y = Math.min(g.targetY, g.y + 2.1 * s);
  } else if (!g.notified && !g.opened) {
    g.notified = true;
    bdShowToast(bdT().giftHint, 6000);
  }
  const bob = Math.sin(frameCount * 0.06) * 3 * s;
  const hovered = bdHover && bdHover.type === 'gift';

  push();
  translate(g.x, g.y + bob);

  // Soft glow.
  noStroke();
  fill(255, 230, 130, 55 + 20 * Math.sin(frameCount * 0.06));
  ellipse(0, -18 * s, 110 * s, 110 * s);

  // Balloon and string.
  if (!g.opened) {
    fill(226, 92, 112);
    ellipse(0, -86 * s, 48 * s, 58 * s);
    fill(255, 255, 255, 70);
    ellipse(-8 * s, -102 * s, 11 * s, 16 * s);
    stroke(110, 74, 58);
    strokeWeight(1.5 * s);
    noFill();
    line(0, -57 * s, 0, -36 * s);
  }

  // Gift box.
  noStroke();
  fill(196, 50, 54);
  rect(-34 * s, -36 * s, 68 * s, 55 * s, 5 * s);
  fill(255, 255, 255, 220);
  rect(-4 * s, -36 * s, 8 * s, 55 * s, 2 * s);
  fill(168, 36, 40);
  rect(-38 * s, -44 * s, 76 * s, 13 * s, 5 * s);
  fill(255, 214, 90);
  ellipse(0, -58 * s, 18 * s, 12 * s);
  fill(255, 255, 255, 210);
  ellipse(-3 * s, -60 * s, 6 * s, 4 * s);

  if (g.opened) {
    fill(255, 255, 255, 230);
    ellipse(0, -34 * s, 42 * s, 12 * s);
  }

  if (hovered && !g.opened) {
    noFill();
    stroke(255, 255, 255, 230);
    strokeWeight(3 * s);
    ellipse(0, -12 * s, 92 * s, 92 * s);
    bdDrawLabel(bdT().giftLabel, 0, -122 * s);
  }
  pop();
}

function bdSpawnConfetti(x, y) {
  const colors = [
    [255, 112, 140],
    [255, 214, 90],
    [116, 214, 255],
    [149, 225, 144],
    [206, 153, 255],
    [255, 255, 255],
  ];
  for (let i = 0; i < 110; i++) {
    bdConfetti.push({
      x: x + random(-34, 34),
      y: y + random(-30, 20),
      vx: random(-7, 7),
      vy: random(-14, -3),
      gravity: random(0.26, 0.42),
      size: random(4, 10),
      color: random(colors),
      rot: random(TWO_PI),
      spin: random(-0.22, 0.22),
      life: random(70, 150),
      maxLife: 150,
    });
  }
}

function bdDrawConfetti() {
  if (bdConfetti.length === 0) return;
  push();
  noStroke();
  for (let i = bdConfetti.length - 1; i >= 0; i--) {
    const c = bdConfetti[i];
    c.x += c.vx;
    c.y += c.vy;
    c.vy += c.gravity;
    c.rot += c.spin;
    c.life--;
    if (c.life <= 0 || c.y > bdOrigin.y + height * 0.75) {
      bdConfetti.splice(i, 1);
      continue;
    }
    push();
    translate(c.x, c.y);
    rotate(c.rot);
    fill(c.color[0], c.color[1], c.color[2], Math.min(255, c.life * 4));
    rect(-c.size / 2, -c.size / 4, c.size, c.size / 2, 1);
    pop();
  }
  pop();
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function bdCanPlay() {
  return typeof gameState !== 'undefined'
    && gameState === 'world'
    && !isOpening
    && !enterName
    && !bdModalOpen;
}

function bdWorldMouse() {
  if (!camera) return { x: mouseX, y: mouseY };
  return {
    x: mouseX - width / 2 + camera.position.x,
    y: mouseY - height / 2 + camera.position.y,
  };
}

function bdUpdateHover() {
  bdHover = null;
  if (!bdCanPlay()) return;

  const m = bdWorldMouse();
  const s = bdScale;
  const hit = 42 * s;
  let best = hit;

  for (let i = 0; i < bdPlots.length; i++) {
    const d = dist(m.x, m.y, bdPlots[i].x, bdPlots[i].y);
    if (d < best) {
      best = d;
      bdHover = { type: 'plot', index: i };
    }
  }
  for (let i = 0; i < bdDigSpots.length; i++) {
    if (bdDigSpots[i].collected) continue;
    const d = dist(m.x, m.y, bdDigSpots[i].x, bdDigSpots[i].y);
    if (d < best) {
      best = d;
      bdHover = { type: 'dig', index: i };
    }
  }
  if (bdGift.active && !bdGift.opened) {
    const d = dist(m.x, m.y, bdGift.x, bdGift.y - 18 * s);
    if (d < 58 * s) {
      bdHover = { type: 'gift', index: 0 };
    }
  }
}

function bdPointerOverUi() {
  if (typeof document.elementFromPoint !== 'function') return false;
  const el = document.elementFromPoint(mouseX, mouseY);
  return !!(el && el.closest && el.closest('#birthdayHud, #birthdayModal, #birthdayToast'));
}

function bdHandleClick() {
  if (!mouseWentDown() || !bdCanPlay() || bdPointerOverUi()) return;
  if (!bdHover) return;

  if (bdHover.type === 'dig') {
    bdCollectSpot(bdHover.index);
  } else if (bdHover.type === 'plot') {
    bdUsePlot(bdHover.index);
  } else if (bdHover.type === 'gift') {
    bdOpenGift();
  }
}

function bdInteractNearest() {
  if (!bdCanPlay()) return;
  const px = playerFemale.position.x;
  const py = playerFemale.position.y;
  const s = bdScale;
  let nearest = null;
  let best = 100 * s;

  for (let i = 0; i < bdDigSpots.length; i++) {
    if (bdDigSpots[i].collected) continue;
    const d = dist(px, py, bdDigSpots[i].x, bdDigSpots[i].y);
    if (d < best) {
      best = d;
      nearest = { type: 'dig', index: i };
    }
  }
  for (let i = 0; i < bdPlots.length; i++) {
    const d = dist(px, py, bdPlots[i].x, bdPlots[i].y);
    if (d < best) {
      best = d;
      nearest = { type: 'plot', index: i };
    }
  }
  if (bdGift.active && !bdGift.opened) {
    const d = dist(px, py, bdGift.x, bdGift.y);
    if (d < 110 * s) {
      nearest = { type: 'gift', index: 0 };
    }
  }

  if (!nearest) {
    bdShowToast(bdT().hint);
    return;
  }

  if (nearest.type === 'dig') {
    bdCollectSpot(nearest.index);
  } else if (nearest.type === 'plot') {
    bdUsePlot(nearest.index);
  } else {
    bdOpenGift();
  }
}

function bdCollectSpot(index) {
  const spot = bdDigSpots[index];
  if (!spot || spot.collected) return;
  spot.collected = true;
  bdCollected++;
  bdInventory.push(index);
  if (typeof chooseSound !== 'undefined' && chooseSound.play) chooseSound.play();
  bdShowToast(bdT().dug(bdCollected));
  bdUpdateHud();
}

function bdUsePlot(index) {
  const plot = bdPlots[index];
  if (!plot) return;

  if (plot.grown) {
    bdShowToast(bdT().alreadyGrown);
    return;
  }

  if (!plot.planted) {
    if (bdInventory.length === 0) {
      bdShowToast(bdT().noShoot);
      return;
    }
    const plantIndex = bdInventory.shift();
    plot.planted = true;
    plot.plantIndex = plantIndex;
    plot.water = 0;
    bdPlanted++;
    if (typeof chooseSound !== 'undefined' && chooseSound.play) chooseSound.play();
    bdShowToast(bdT().planted);
    bdUpdateHud();
    return;
  }

  plot.water++;
  if (typeof catchFishSound !== 'undefined' && catchFishSound.play) catchFishSound.play();
  if (plot.water >= 3) {
    plot.grown = true;
    bdGrown++;
    if (typeof chaChing !== 'undefined' && chaChing.play) chaChing.play();
    bdShowToast(bdT().bloom);
    if (bdGrown >= bdPlots.length) {
      bdUnlockGift();
    }
  } else {
    bdShowToast(bdT().watered(plot.water));
  }
  bdUpdateHud();
}

function bdUnlockGift() {
  if (bdGiftReady) return;
  bdGiftReady = true;
  bdGift.active = true;
  bdGift.opened = false;
  bdGift.notified = false;
  // Land on the open right bank: clear of the player, dig columns, and plots.
  bdGift.x = bdOrigin.x + width * 0.14;
  bdGift.y = bdOrigin.y - height * 0.68;
  bdGift.targetY = bdOrigin.y + height * 0.10;
  bdShowToast(bdT().allBloomed, 7000);
  if (typeof chaChing !== 'undefined' && chaChing.play) chaChing.play();
}

function bdOpenGift() {
  if (!bdGift.active || bdGift.opened) return;
  bdGift.opened = true;
  bdGiftOpened = true;
  bdSpawnConfetti(bdGift.x, bdGift.y - 20 * bdScale);
  if (typeof chaChing !== 'undefined' && chaChing.play) chaChing.play();
  bdShowToast(bdT().giftOpen);
  setTimeout(() => {
    bdShowLetter();
  }, 420);
}

function bdShowLetter() {
  if (!bdEl.modal) return;
  bdApplyLanguage();
  bdModalOpen = true;
  bdEl.modal.classList.add('birthday-open');
  // Freeze the world while the letter is open. Don't reuse isTalking: the
  // villager dialogue system owns that flag and crashes without a villager.
  if (typeof noLoop === 'function') noLoop();
}

function bdCloseLetter() {
  if (!bdEl.modal) return;
  bdEl.modal.classList.remove('birthday-open');
  bdModalOpen = false;
  if (typeof loop === 'function') loop();
}

// ---------------------------------------------------------------------------
// Small UI helpers
// ---------------------------------------------------------------------------

function bdShowToast(message, duration) {
  if (!bdEl.toast) return;
  bdEl.toast.textContent = message;
  bdEl.toast.classList.add('birthday-toast-show');
  if (bdToastTimeout) clearTimeout(bdToastTimeout);
  bdToastTimeout = setTimeout(() => {
    bdEl.toast.classList.remove('birthday-toast-show');
  }, duration || 2600);
}
