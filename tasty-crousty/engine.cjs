'use strict';
/* =====================================================================
   TASTY CROUSTY — moteur de motion design déterministe
   Une seule fonction pilote tout : draw(ctx, t).
   Aucune animation CSS, aucun setTimeout, aucun asset réseau :
   à un temps t donné, l'image est toujours identique.
   ===================================================================== */

const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

const W = 1920, H = 1080, FPS = 30, DUR = 24;

const C = {
  pink: '#FF2D78',
  pinkDeep: '#B31558',
  cyan: '#22E0E8',
  cyanDeep: '#0E9AA8',
  bg: '#0B0B12',
  deep: '#07070C',
  gold: '#F5A93B',
  amber: '#FFB43C',
  cream: '#FFF4E6',
  rice: '#FFE7BE',
  ink: '#1B1420',
};

/* ------------------------------------------------------------------ */
/* Polices : TTF locales, enregistrées dans le moteur de rendu.        */
/* ------------------------------------------------------------------ */
let fontsReady = false;
function registerFonts() {
  if (fontsReady) return;
  const root = path.join(__dirname, 'node_modules', '@expo-google-fonts');
  const files = [
    ['space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf', 'Space Grotesk'],
    ['space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf', 'Space Grotesk'],
    ['space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf', 'Space Grotesk'],
    ['inter/400Regular/Inter_400Regular.ttf', 'Inter'],
    ['inter/600SemiBold/Inter_600SemiBold.ttf', 'Inter'],
    ['inter/700Bold/Inter_700Bold.ttf', 'Inter'],
  ];
  for (const [rel, family] of files) {
    try { GlobalFonts.registerFromPath(path.join(root, rel), family); } catch (_) { /* ignoré */ }
  }
  fontsReady = true;
}

/* ------------------------------------------------------------------ */
/* Maths / temps                                                       */
/* ------------------------------------------------------------------ */
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeIn = k => k * k * k;
const easeInOut = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOutExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const easeOutBack = (k, s = 1.45) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const io = (t, a, b, c, d) => Math.min(seg(t, a, b), 1 - seg(t, c, d)); // fade in / fade out

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let v = Math.imul(a ^ a >>> 15, 1 | a);
    v = v + Math.imul(v ^ v >>> 7, 61 | v) ^ v;
    return ((v ^ v >>> 14) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261224);
const RN = Array.from({ length: 4000 }, () => rnd());
const R = i => RN[Math.abs(Math.floor(i)) % RN.length];
// clé de scène interpolée
function keyAt(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const k = easeInOut(seg(t, keys[i - 1][0], keys[i][0]));
      return lerp(keys[i - 1][1], keys[i][1], k);
    }
  }
  return keys[keys.length - 1][1];
}

/* ------------------------------------------------------------------ */
/* Dessin : helpers                                                    */
/* ------------------------------------------------------------------ */
function rgba(hex, a) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}
function glow(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(.45, rgba(color, alpha * .35));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function poly(ctx, points, fill, stroke, sw = 1) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr); ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr); ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}
function dot(ctx, x, y, r, color, alpha = 1) {
  ctx.globalAlpha = alpha; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}
function strokePath(ctx, pts, color, width, opts = {}) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  if (opts.dash) ctx.setLineDash(opts.dash);
  if (opts.dashOffset) ctx.lineDashOffset = opts.dashOffset;
  if (opts.glow) { ctx.shadowColor = opts.glowColor || color; ctx.shadowBlur = opts.glow; }
  ctx.globalAlpha = opts.alpha === undefined ? 1 : opts.alpha;
  ctx.stroke();
  ctx.restore();
}

/* Texte : lettre par lettre, tracking, halo néon, animation par caractère.
   o.anim(i,n) -> {dx, dy, rot, scale, alpha, color}                      */
function text(ctx, str, x, y, o = {}) {
  const size = o.size || 80;
  const family = o.family === 'body' ? 'Inter' : 'Space Grotesk';
  ctx.save();
  ctx.font = `${o.weight || 700} ${size}px "${family}"`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const track = o.tracking || 0;
  const chars = [...str];
  const widths = chars.map(ch => ctx.measureText(ch).width + track);
  const total = widths.reduce((a, b) => a + b, 0) - track;
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  const baseAlpha = o.alpha === undefined ? 1 : o.alpha;
  const gl = o.glow === undefined ? 0 : o.glow;
  for (let i = 0; i < chars.length; i++) {
    const a = o.anim ? (o.anim(i, chars.length) || {}) : {};
    const alpha = baseAlpha * (a.alpha === undefined ? 1 : a.alpha);
    if (alpha <= 0.002) { cx += widths[i]; continue; }
    ctx.save();
    ctx.translate(cx + (a.dx || 0), y + (a.dy || 0));
    if (a.rot) ctx.rotate(a.rot);
    if (a.scale && a.scale !== 1) ctx.scale(a.scale, a.scale);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = a.color || o.color || C.cream;
    if (gl > 0) {
      ctx.shadowColor = rgba(o.glowColor || o.color || C.pink, .95);
      ctx.shadowBlur = gl;
      ctx.fillText(chars[i], 0, 0);
      ctx.shadowBlur = gl * .45;
      ctx.fillText(chars[i], 0, 0);
      ctx.shadowBlur = 0;
    }
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
    cx += widths[i];
  }
  ctx.restore();
  return total;
}
function riseAnim(t, start, stagger = .045, dist = 90, dur = .62) {
  return (i) => {
    const k = seg(t, start + i * stagger, start + i * stagger + dur);
    return { dy: lerp(dist, 0, easeOutBack(k)), alpha: seg(t, start + i * stagger, start + i * stagger + .12), scale: .92 + .08 * easeOut(k) };
  };
}
function flick(t, a, b) {
  if (t < a || t > b) return t < a ? 0 : 1;
  const k = seg(t, a, b);
  const f = clamp(.62 + .55 * Math.sin(t * 43) * Math.sin(t * 13.7) + .3 * Math.sin(t * 7.3));
  return clamp(lerp(f, 1, easeOut(seg(t, a + (b - a) * .55, b))));
}

/* ------------------------------------------------------------------ */
/* Fonds & overlays globaux                                            */
/* ------------------------------------------------------------------ */
function nightBg(ctx, t, o = {}) {
  ctx.fillStyle = o.base || C.bg;
  ctx.fillRect(0, 0, W, H);
  const drift = Math.sin(t * .35) * 40;
  glow(ctx, 300 + drift, 420, 820, C.pink, o.pink === undefined ? .13 : o.pink);
  glow(ctx, 1620 - drift, 680, 780, C.cyan, o.cyan === undefined ? .11 : o.cyan);
  glow(ctx, 960, 1000, 700, C.gold, o.gold === undefined ? .045 : o.gold);
  // grille fine
  ctx.save();
  ctx.strokeStyle = rgba(C.cream, .028); ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
  // perspective au sol
  ctx.save();
  ctx.strokeStyle = rgba(C.cyan, .045); ctx.lineWidth = 1;
  const horizon = 790, vx = W / 2;
  for (let i = -14; i <= 14; i++) {
    ctx.beginPath(); ctx.moveTo(vx, horizon); ctx.lineTo(vx + i * 170, H); ctx.stroke();
  }
  for (let i = 1; i < 9; i++) {
    const y = horizon + Math.pow(i / 9, 2.1) * (H - horizon);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
}

let grainTile = null;
function grain(ctx, frame) {
  if (!grainTile) {
    grainTile = createCanvas(256, 256);
    const g = grainTile.getContext('2d');
    const img = g.createImageData(256, 256);
    const r2 = mulberry32(777);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + r2() * 145;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = .035;
  ctx.globalCompositeOperation = 'lighter';
  const ox = (frame * 37) % 256, oy = (frame * 83) % 256;
  for (let x = ox - 256; x < W; x += 256) for (let y = oy - 256; y < H; y += 256) ctx.drawImage(grainTile, x, y);
  ctx.restore();
}
function vignette(ctx) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 280, W / 2, H / 2, 1180);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(.65, 'rgba(4,4,10,.18)');
  g.addColorStop(1, 'rgba(3,3,8,.78)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function corners(ctx, alpha = .3) {
  ctx.save();
  ctx.lineWidth = 2; ctx.globalAlpha = alpha;
  const m = 54, l = 46;
  const L = (x, y, sx, sy, color) => {
    ctx.strokeStyle = color;
    ctx.beginPath(); ctx.moveTo(x + sx * l, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * l); ctx.stroke();
  };
  L(m, m, 1, 1, C.cyan); L(W - m, m, -1, 1, C.pink);
  L(m, H - m, 1, -1, C.pink); L(W - m, H - m, -1, -1, C.cyan);
  ctx.restore();
}
const CUTS = [2.6, 10.0, 15.5, 19.5];
function overlays(ctx, t, frame) {
  for (const c of CUTS) {
    if (t >= c && t < c + .12) {
      const a = .58 * Math.pow(1 - seg(t, c, c + .12), 2);
      ctx.fillStyle = rgba(C.cream, a); ctx.fillRect(0, 0, W, H);
    }
  }
  // barre de progression
  const pw = W * seg(t, 0, DUR);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, C.pink); g.addColorStop(1, C.cyan);
  ctx.globalAlpha = .55; ctx.fillStyle = g; ctx.fillRect(0, H - 5, pw, 5);
  ctx.globalAlpha = 1;
  glow(ctx, pw, H - 3, 26, C.cyan, .5);
  vignette(ctx);
  grain(ctx, frame);
}

/* ------------------------------------------------------------------ */
/* SCÈNE A — 0.0 → 2.6 : néon & logo                                  */
/* ------------------------------------------------------------------ */
function sceneA(ctx, t) {
  nightBg(ctx, t, { pink: .17, cyan: .14 });
  ctx.save();
  const push = 1 + .12 * easeIn(seg(t, 2.28, 2.6));
  ctx.translate(W / 2, H / 2); ctx.scale(push, push); ctx.translate(-W / 2, -H / 2);

  const on = flick(t, .18, .92);
  // tubes néon
  const lineW = 3;
  for (const [y, col] of [[318, C.pink], [752, C.cyan]]) {
    const k = easeOutExpo(seg(t, .12, .95));
    const half = (W / 2 - 250) * k;
    ctx.save();
    ctx.shadowColor = col; ctx.shadowBlur = 26 * on;
    ctx.strokeStyle = rgba(col, .15 + .85 * on); ctx.lineWidth = lineW; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(W / 2 - half, y); ctx.lineTo(W / 2 + half, y); ctx.stroke();
    ctx.restore();
  }
  // halo derrière le mot
  glow(ctx, W / 2, 545, 620, C.pink, .10 * on + .05);

  const f1 = riseAnim(t, .34, .052, 105, .7);
  const f2 = riseAnim(t, .58, .052, 105, .7);
  text(ctx, 'TASTY', W / 2, 515, {
    size: 224, align: 'center', color: C.cream, glowColor: C.pink,
    glow: 38 * on, weight: 700, tracking: 12,
    alpha: .98, anim: i => { const a = f1(i); a.alpha *= .35 + .65 * on; return a; },
  });
  text(ctx, 'CROUSTY', W / 2, 700, {
    size: 224, align: 'center', color: C.cyan, glowColor: C.cyan,
    glow: 40 * on, weight: 700, tracking: 8,
    anim: i => { const a = f2(i); a.alpha *= .35 + .65 * on; return a; },
  });
  ctx.restore();

  const kKick = easeOut(seg(t, .95, 1.45));
  text(ctx, 'LE CROUSTY ORIGINAL', W / 2, 268, {
    size: 24, family: 'body', weight: 700, align: 'center', tracking: 12,
    color: C.pink, alpha: kKick * .95, glowColor: C.pink, glow: 12 * on,
  });
  const kBase = easeOut(seg(t, 1.35, 1.95));
  text(ctx, 'Testée une fois, validée à vie.', W / 2, 815, {
    size: 38, family: 'body', weight: 400, align: 'center', tracking: 1.5,
    color: C.cream, alpha: kBase * .9,
    anim: i => ({ dy: lerp(18, 0, easeOut(seg(t, 1.35 + i * .012, 1.7 + i * .012))) }),
  });
  const kSub = easeOut(seg(t, 1.65, 2.2));
  text(ctx, 'RIZ · POULET CROUSTILLANT · SAUCE SECRÈTE · OIGNONS FRITS', W / 2, 878, {
    size: 20, family: 'body', weight: 600, align: 'center', tracking: 5,
    color: C.cyan, alpha: kSub * .55,
  });
  corners(ctx, .32 * on);
}

/* ------------------------------------------------------------------ */
/* SCÈNE B — 2.6 → 10.0 : le crousty                                  */
/* ------------------------------------------------------------------ */
const U = 138, C30 = Math.sqrt(3) / 2, S30 = .5;
const iso = (x, y, z = 0) => [(x - y) * C30 * U, (x + y) * S30 * U - z * U];
const BOX = { x: -2.1, y: -1.45, w: 4.2, d: 2.9, h: .95 };
function isoQuad(cx, cy, w, d, z, ang = 0) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]
    .map(([a, b]) => iso(cx + a * ca - b * sa, cy + a * sa + b * ca, z));
}
const STRIPS = [
  { x: -1.18, y: -.72, a: -.24 }, { x: .12, y: -.78, a: .18 }, { x: 1.32, y: -.55, a: -.12 },
  { x: -1.15, y: .28, a: .15 }, { x: .18, y: .30, a: -.2 }, { x: 1.30, y: .55, a: .22 },
  { x: -.35, y: .82, a: -.05 },
];
function faceText(ctx, DT, CT, D, label, color) {
  // transforme un repère local 260 × 100 sur la face avant de la barquette
  const a = (CT[0] - DT[0]) / 260, b = (CT[1] - DT[1]) / 260;
  const c = (D[0] - DT[0]) / 100, d = (D[1] - DT[1]) / 100;
  ctx.save();
  ctx.transform(a, b, c, d, DT[0], DT[1]);
  ctx.font = '700 40px "Space Grotesk"';
  ctx.fillStyle = color;
  ctx.shadowColor = color; ctx.shadowBlur = 14;
  ctx.fillText('CROUSTY', 20, 62);
  ctx.shadowBlur = 0;
  ctx.fillStyle = rgba(C.cyan, .75);
  ctx.fillRect(20, 70, 120, 2.5);
  ctx.restore();
}
function boxFaces(ctx, BT, CT, DT, B, Cp, D) {
  const gFront = ctx.createLinearGradient(DT[0], DT[1], D[0], D[1]);
  gFront.addColorStop(0, '#241A28'); gFront.addColorStop(1, '#110D16');
  const gRight = ctx.createLinearGradient(BT[0], BT[1], B[0], B[1]);
  gRight.addColorStop(0, '#1A1320'); gRight.addColorStop(1, '#0C0910');
  poly(ctx, [B, Cp, CT, BT], gRight);
  poly(ctx, [D, Cp, CT, DT], gFront);
  // arêtes néon
  strokePath(ctx, [D, Cp, CT, DT, D], rgba(C.pink, .55), 2.5, { glow: 12, glowColor: C.pink });
  strokePath(ctx, [B, Cp, CT, BT, B], rgba(C.cyan, .35), 2, { glow: 9, glowColor: C.cyan });
}
function chickenStrip(ctx, s, z, alpha) {
  const q = isoQuad(s.x, s.y, 1.38, .46, z, s.a);
  const qb = isoQuad(s.x, s.y, 1.38, .46, z - .13, s.a);
  ctx.save(); ctx.globalAlpha = alpha;
  // ombre portée sur le riz
  poly(ctx, isoQuad(s.x + .06, s.y + .06, 1.42, .5, BOX.h + .04, s.a), 'rgba(20,10,8,.35)');
  // faces
  poly(ctx, [qb[3], qb[2], q[2], q[3]], '#B4641B');
  poly(ctx, [qb[1], qb[2], q[2], q[1]], '#D98322');
  const g = ctx.createLinearGradient(q[0][0], q[0][1], q[2][0], q[2][1]);
  g.addColorStop(0, '#FFCE6B'); g.addColorStop(.45, '#F5A93B'); g.addColorStop(1, '#D9761E');
  poly(ctx, q, g, 'rgba(96,45,10,.55)', 1.5);
  // panure : points + éclats
  const ca = Math.cos(s.a), sa = Math.sin(s.a);
  for (let i = 0; i < 15; i++) {
    const u = (R(i * 7 + 31) - .5) * 1.3, v = (R(i * 11 + 71) - .5) * .4;
    const wx = s.x + u * ca - v * sa, wy = s.y + u * sa + v * ca;
    const p = iso(wx, wy, z + .002);
    dot(ctx, p[0], p[1], .9 + R(i + 200) * 1.9, i % 3 === 0 ? '#8A4310' : '#FFE0A0', .55);
  }
  strokePath(ctx, [q[0], q[1]], 'rgba(255,240,205,.75)', 2.5);
  ctx.restore();
}
function drawCroustyBox(ctx, tb) {
  const { x, y, w, d, h } = BOX;
  const A = iso(x, y, 0), B = iso(x + w, y, 0), Cp = iso(x + w, y + d, 0), D = iso(x, y + d, 0);
  const AT = iso(x, y, h), BT = iso(x + w, y, h), CT = iso(x + w, y + d, h), DT = iso(x, y + d, h);

  // ombre au sol
  ctx.save();
  ctx.translate(0, 46); ctx.scale(1, .32);
  glow(ctx, 0, 0, 470, '#000000', .55);
  ctx.restore();

  boxFaces(ctx, BT, CT, DT, B, Cp, D);
  faceText(ctx, DT.map(v => v + 0), CT, D, 'TASTY CROUSTY', rgba(C.pink, .85));

  // couvercle / bord
  poly(ctx, [AT, BT, CT, DT], '#2A1C24', rgba(C.pink, .7), 3);
  const e = .16;
  const inner = [iso(x + e, y + e, h + .01), iso(x + w - e, y + e, h + .01),
  iso(x + w - e, y + d - e, h + .01), iso(x + e, y + d - e, h + .01)];
  poly(ctx, inner, '#3A241E');

  // --- 1. RIZ ---------------------------------------------------------
  const kRice = easeOut(seg(tb, .25, 1.15));
  if (kRice > 0) {
    ctx.save();
    ctx.beginPath(); ctx.moveTo(inner[0][0], inner[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(inner[i][0], inner[i][1]);
    ctx.closePath(); ctx.clip();
    ctx.globalAlpha = kRice;
    const gr = ctx.createLinearGradient(inner[0][0], inner[0][1], inner[2][0], inner[2][1]);
    gr.addColorStop(0, '#FFF6E4'); gr.addColorStop(.5, C.rice); gr.addColorStop(1, '#E7C58F');
    ctx.fillStyle = gr; ctx.fillRect(-700, -500, 1400, 1200);
    for (let i = 0; i < 300; i++) {
      const u = R(i * 3 + 400), v = R(i * 5 + 900);
      const p = iso(x + e + u * (w - 2 * e), y + e + v * (d - 2 * e), h + .02);
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(R(i + 1300) * 6.28);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(176,130,74,.45)' : 'rgba(255,255,250,.75)';
      ctx.beginPath(); ctx.ellipse(0, 0, 5.5, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // --- 2. POULET CROUSTILLANT ----------------------------------------
  STRIPS.forEach((s, i) => {
    const ts = 1.35 + i * .24;
    const k = seg(tb, ts, ts + .52);
    if (k <= 0) return;
    const z = h + .18 + 1.55 * (1 - easeOutBack(k));
    chickenStrip(ctx, s, z, seg(tb, ts, ts + .1));
    // éclats de panure à l'atterrissage
    const kp = seg(tb, ts + .38, ts + 1.0);
    if (kp > 0 && kp < 1) {
      const c = iso(s.x, s.y, h + .25);
      for (let j = 0; j < 9; j++) {
        const ang = R(i * 13 + j) * Math.PI * 2;
        const rad = 20 + kp * (55 + R(j + 80) * 60);
        dot(ctx, c[0] + Math.cos(ang) * rad, c[1] + Math.sin(ang) * rad - 30 * Math.sin(kp * Math.PI),
          2 + R(j + 300) * 2.5, j % 2 ? C.gold : C.cream, (1 - kp) * .8);
      }
    }
  });

  // --- 3. SAUCE SECRÈTE ----------------------------------------------
  const kSauce = easeOutExpo(seg(tb, 3.45, 5.15));
  if (kSauce > 0) {
    const pts = [];
    for (let i = 0; i <= 180; i++) {
      const u = i / 180;
      const wx = -1.92 + u * 3.84;
      const wy = -.28 + Math.sin(u * Math.PI * 3.1) * .62 + Math.sin(u * 9) * .05;
      pts.push(iso(wx, wy, h + .30));
    }
    const n = Math.max(1, Math.floor(kSauce * 180));
    const grad = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[180][0], pts[180][1]);
    grad.addColorStop(0, '#FFC44F'); grad.addColorStop(.5, '#F59128'); grad.addColorStop(1, '#E2621C');
    strokePath(ctx, pts.slice(0, n), grad, 19, { glow: 18, glowColor: C.amber });
    ctx.save(); ctx.translate(-2, -5);
    strokePath(ctx, pts.slice(0, n), 'rgba(255,246,215,.45)', 4);
    ctx.restore();
    // coulures sur la face avant
    for (let i = 0; i < 3; i++) {
      const u = .22 + i * .28;
      if (kSauce < u) continue;
      const wx = -1.92 + u * 3.84;
      const top = iso(wx, y + d, h);
      const len = .17 + R(i + 55) * .2;
      const bottom = iso(wx, y + d, h - len);
      strokePath(ctx, [top, [top[0], top[1] + 6], bottom], C.amber, 8, { glow: 6, glowColor: C.amber });
    }
    // éclat de brillance
    if (kSauce > .98) {
      const p = pts[Math.floor(150 + Math.sin(tb * 3) * 12)];
      glow(ctx, p[0], p[1], 42, C.cream, .35);
    }
  }

  // --- 4. OIGNONS FRITS ----------------------------------------------
  for (let i = 0; i < 48; i++) {
    const ts = 4.6 + R(i * 17 + 1500) * 1.0;
    const k = seg(tb, ts, ts + .5);
    if (k <= 0) continue;
    const wx = -1.75 + R(i * 19 + 1700) * 3.5;
    const wy = -1.05 + R(i * 23 + 1900) * 2.1;
    const target = iso(wx, wy, h + .36);
    const fall = 1 - easeIn(k);
    const p = [target[0] + (R(i + 2100) - .5) * 110 * fall, target[1] - 290 * fall];
    ctx.save();
    ctx.translate(p[0], p[1]);
    ctx.rotate(R(i + 2300) * Math.PI * 2 + tb * (1 + R(i + 2400)) * (1 - k));
    ctx.strokeStyle = i % 4 === 0 ? '#FFE1A0' : C.gold;
    ctx.lineWidth = 3.2 + R(i + 2500) * 2.2; ctx.lineCap = 'round';
    ctx.shadowColor = C.gold; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(0, 0, 10 + R(i + 2600) * 8, .25, 2.5); ctx.stroke();
    ctx.restore();
  }
  // paillettes de croustillant
  const kSpark = io(tb, 5.6, 6.1, 9.2, 10.0);
  if (kSpark > 0) {
    for (let i = 0; i < 22; i++) {
      const a = R(i * 29 + 3000) * Math.PI * 2;
      const rad = 170 + R(i + 3100) * 330;
      const x0 = Math.cos(a) * rad, y0 = Math.sin(a) * rad * .55 - 40;
      const pulse = .35 + .65 * Math.abs(Math.sin(tb * 2.2 + i));
      dot(ctx, x0, y0, 1.5 + R(i + 3200) * 2.2, i % 3 ? C.gold : C.cream, kSpark * pulse * .8);
      if (i % 5 === 0) glow(ctx, x0, y0, 16, C.gold, kSpark * pulse * .3);
    }
  }

  // --- vapeur ---------------------------------------------------------
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const bx = -300 + i * 150, by = -125 + R(i + 400) * 40;
    const ph = tb * .55 + i * 1.3;
    const amp = 38 + 18 * Math.sin(ph * 1.3);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.bezierCurveTo(bx + amp, by - 70, bx - amp, by - 140, bx + Math.sin(ph) * 22, by - 215);
    ctx.strokeStyle = rgba(C.cream, .07 + .055 * Math.sin(ph) ** 2);
    ctx.lineWidth = 13 - i;
    ctx.shadowColor = C.cream; ctx.shadowBlur = 22;
    ctx.stroke();
  }
  ctx.restore();

  // contour lumineux du bord
  strokePath(ctx, [AT, BT, CT, DT, AT], rgba(C.cream, .18), 2);
}
function sceneB(ctx, t) {
  const tb = t - 2.6;
  nightBg(ctx, t, { pink: .10, cyan: .09, gold: .10 });
  // enseignes néon en fond
  const signGlow = .55 + .45 * Math.sin(t * 2.1);
  ctx.save(); ctx.globalAlpha = .34 + .12 * signGlow;
  roundRect(ctx, 150, 190, 330, 150, 24);
  ctx.strokeStyle = C.pink; ctx.lineWidth = 5; ctx.shadowColor = C.pink; ctx.shadowBlur = 34; ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = '700 26px "Space Grotesk"'; ctx.fillStyle = C.pink;
  ctx.fillText('FRAIS & CHAUD', 178, 275);
  roundRect(ctx, 1435, 790, 345, 120, 22);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 5; ctx.shadowColor = C.cyan; ctx.shadowBlur = 30; ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.cyan; ctx.fillText('JUSQUE TARD', 1465, 862);
  ctx.restore();
  glow(ctx, W / 2, 560, 620, C.gold, .16);

  const zoom = keyAt(t, [[2.6, .86], [4.0, 1.0], [8.4, 1.12], [10.0, 1.22]]);
  const cx = keyAt(t, [[2.6, 1000], [10.0, 930]]);
  const cy = keyAt(t, [[2.6, 590], [10.0, 545]]);
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(zoom, zoom);
  drawCroustyBox(ctx, tb);
  ctx.restore();

  // miettes flottantes (espace écran, taille constante)
  for (let i = 0; i < 70; i++) {
    const x = (R(i * 31 + 500) * W + Math.sin(t * .5 + i) * 25) % W;
    const y = ((R(i * 37 + 700) * H - t * (18 + R(i + 800) * 28)) % (H + 100) + H + 100) % (H + 100) - 50;
    dot(ctx, x, y, .8 + R(i + 900) * 2.1, i % 5 === 0 ? C.pink : C.gold, .12 + R(i + 1000) * .35);
  }

  // cartouche produit
  const kL = io(tb, .15, .8, 7.0, 7.4);
  if (kL > 0) {
    text(ctx, '01 / LE CROUSTY', 128, 168, {
      size: 21, family: 'body', weight: 700, tracking: 9, color: C.pink, alpha: kL * .9, glowColor: C.pink, glow: 10,
    });
    text(ctx, 'Le crousty.', 124, 900, {
      size: 96, color: C.cream, alpha: kL, glowColor: C.pink, glow: 20,
      anim: riseAnim(tb, .2, .035, 60, .55),
    });
    text(ctx, 'Riz · Poulet croustillant · Sauce secrète · Oignons frits', 130, 958, {
      size: 26, family: 'body', weight: 400, color: C.cream, alpha: kL * .72,
    });
  }
  // badge sauce secrète
  const kB = io(tb, 3.4, 4.0, 9.25, 9.9) * .95;
  if (kB > 0) {
    ctx.save(); ctx.globalAlpha = kB;
    roundRect(ctx, 1470, 150, 320, 84, 18);
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.shadowColor = C.cyan; ctx.shadowBlur = 18; ctx.stroke();
    ctx.shadowBlur = 0;
    text(ctx, 'SAUCE SECRÈTE', 1630, 202, {
      size: 23, family: 'body', weight: 700, tracking: 4, align: 'center', color: C.cyan,
    });
    ctx.restore();
  }
  corners(ctx, .18);
}

/* ------------------------------------------------------------------ */
/* SCÈNE C — 10.0 → 15.5 : le réseau                                  */
/* ------------------------------------------------------------------ */
const FRANCE = [
  [.28, .04], [.52, .00], [.68, .10], [.84, .16], [.94, .30], [.86, .43],
  [.95, .57], [.82, .70], [.74, .88], [.56, .97], [.40, .93], [.30, .84],
  [.12, .79], [.05, .62], [.13, .46], [.04, .32], [.14, .17],
];
const NODES = [
  [.43, .25, 'PARIS'], [.60, .38, 'LYON'], [.62, .72, 'MARSEILLE'], [.40, .12, 'LILLE'],
  [.22, .58, 'BORDEAUX'], [.19, .38, 'NANTES'], [.36, .76, 'TOULOUSE'], [.79, .32, 'STRASBOURG'],
  [.76, .62, 'NICE'], [.52, .55, 'CLERMONT'], [.28, .22, 'RENNES'], [.70, .52, 'GRENOBLE'],
  [.48, .86, 'MONTPELLIER'],
];
const MAP = { x: 880, y: 165, s: 690 };
const mp = p => [MAP.x + p[0] * MAP.s, MAP.y + p[1] * MAP.s];
function sceneC(ctx, t) {
  nightBg(ctx, t, { pink: .10, cyan: .14, gold: .02 });
  const tc = t - 10.0;
  // silhouette
  const fp = FRANCE.map(mp);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(fp[0][0], fp[0][1]);
  for (let i = 1; i < fp.length; i++) ctx.lineTo(fp[i][0], fp[i][1]);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = 'rgba(20,22,38,.42)'; ctx.fillRect(MAP.x - 20, MAP.y - 20, MAP.s + 40, MAP.s + 40);
  // grille de points
  let idx = 0;
  for (let y = MAP.y - 10; y < MAP.y + MAP.s + 10; y += 21) {
    for (let x = MAP.x - 10; x < MAP.x + MAP.s + 10; x += 21) {
      const on = seg(tc, .35 + R(idx + 1200) * 2.6, 1.1 + R(idx + 1200) * 2.6);
      const near = NODES.some(n => { const p = mp(n); return Math.hypot(p[0] - x, p[1] - y) < 130; });
      if (on > 0) {
        dot(ctx, x, y, 1.4 + on * 1.5, idx % 4 === 0 ? C.pink : C.cyan, .12 + on * (near ? .75 : .32));
      } else dot(ctx, x, y, 1.35, '#59617B', .24);
      idx++;
    }
  }
  ctx.restore();
  strokePath(ctx, [...fp, fp[0]], rgba(C.cyan, .55), 2, { glow: 16, glowColor: C.cyan });

  // routes
  const routes = [[0, 2], [1, 8], [3, 7], [4, 6], [0, 9], [2, 12]];
  routes.forEach((r, i) => {
    const a = mp(NODES[r[0]]), b = mp(NODES[r[1]]);
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 70 - i * 9];
    const pts = [];
    for (let s = 0; s <= 40; s++) {
      const u = s / 40, v = 1 - u;
      pts.push([v * v * a[0] + 2 * v * u * mid[0] + u * u * b[0], v * v * a[1] + 2 * v * u * mid[1] + u * u * b[1]]);
    }
    const vis = io(tc, .9 + i * .18, 1.5 + i * .18, 5.0, 5.5);
    if (vis <= 0) return;
    strokePath(ctx, pts, i % 2 ? rgba(C.pink, .5) : rgba(C.cyan, .5), 2,
      { dash: [7, 13], dashOffset: -t * 90, alpha: vis, glow: 8, glowColor: C.cyan });
    const u = (t * .32 + i * .17) % 1, v = 1 - u;
    const p = [v * v * a[0] + 2 * v * u * mid[0] + u * u * b[0], v * v * a[1] + 2 * v * u * mid[1] + u * u * b[1]];
    glow(ctx, p[0], p[1], 22, C.cream, .5 * vis);
    dot(ctx, p[0], p[1], 3.2, C.cream, vis);
  });

  // nœuds
  NODES.forEach((n, i) => {
    const p = mp(n);
    const ts = .55 + i * .17;
    const k = seg(tc, ts, ts + .5);
    if (k <= 0) return;
    const col = i % 3 === 0 ? C.pink : C.cyan;
    glow(ctx, p[0], p[1], 46, col, .55 * k);
    dot(ctx, p[0], p[1], 5.5, C.cream, k);
    dot(ctx, p[0], p[1], 3.2, col, k);
    // anneau
    const ring = seg(tc, ts, ts + .9);
    ctx.save(); ctx.globalAlpha = (1 - ring) * .65;
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p[0], p[1], 8 + ring * 42, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    if (i < 6 && k > .8) {
      const off = i % 2 ? -1 : 1;
      const lx = p[0] + off * 18, ly = p[1] - 14;
      ctx.save(); ctx.globalAlpha = .72;
      ctx.strokeStyle = rgba(col, .5); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p[0], p[1] - 6); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.restore();
      text(ctx, n[2], lx + (off > 0 ? 5 : -5), ly - 5, {
        size: 17, family: 'body', weight: 700, tracking: 2.5, color: C.cream,
        alpha: .72, align: off > 0 ? 'left' : 'right',
      });
    }
  });

  // colonne de gauche
  const kH = io(tc, .1, .75, 4.95, 5.5);
  text(ctx, '02 / LE RÉSEAU', 120, 190, {
    size: 21, family: 'body', weight: 700, tracking: 9, color: C.pink, alpha: kH * .9, glowColor: C.pink, glow: 10,
  });
  text(ctx, 'UNE NUIT.', 114, 360, {
    size: 106, color: C.cream, alpha: kH, glowColor: C.pink, glow: 16,
    anim: riseAnim(tc, .12, .05, 75, .6),
  });
  text(ctx, 'TOUTE LA', 114, 470, {
    size: 106, color: C.cream, alpha: kH, anim: riseAnim(tc, .3, .05, 75, .6),
  });
  text(ctx, 'FRANCE.', 114, 580, {
    size: 106, color: C.cyan, alpha: kH, glowColor: C.cyan, glow: 22,
    anim: riseAnim(tc, .48, .05, 75, .6),
  });
  const kN = io(tc, 1.35, 2.0, 4.95, 5.5);
  const fl = flick(t, 11.4, 12.1);
  text(ctx, 'OUVERT TARD', 120, 720, {
    size: 62, color: C.pink, alpha: kN * (.45 + .55 * fl), glowColor: C.pink, glow: 26 * fl,
  });
  text(ctx, 'Ce soir aussi.', 124, 782, {
    size: 34, family: 'body', weight: 400, color: C.cream, alpha: kN * .8,
  });
  const chips = ['À EMPORTER', 'SUR PLACE', 'JUSQUE TARD'];
  chips.forEach((c, i) => {
    const k = seg(tc, 2.1 + i * .18, 2.6 + i * .18) * kN;
    if (k <= 0) return;
    const x = 120 + i * 210;
    ctx.save(); ctx.globalAlpha = k;
    roundRect(ctx, x, 830, 190, 56, 28);
    ctx.strokeStyle = i === 2 ? C.cyan : rgba(C.pink, .8); ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
    text(ctx, c, x + 95, 866, {
      size: 18, family: 'body', weight: 700, tracking: 2, align: 'center',
      color: i === 2 ? C.cyan : C.cream, alpha: k * .9,
    });
  });
  corners(ctx, .22);
}

/* ------------------------------------------------------------------ */
/* SCÈNE D — 15.5 → 19.5 : type cinétique                             */
/* ------------------------------------------------------------------ */
function kinetic(ctx, t, start, end, words, o = {}) {
  const vis = io(t, start, start + .38, end - .32, end);
  if (vis <= 0) return;
  const y = o.y || 520;
  const size = o.size || 128;
  ctx.save();
  // fantôme
  const ghost = text(ctx, words.map(w => w[0]).join(' '), W / 2 + 9, y + 8, {
    size, align: 'center', color: C.cyan, alpha: .1 * vis, weight: 700, tracking: 2,
  });
  // mots décalés
  const full = words.map(w => w[0]).join(' ');
  ctx.font = `700 ${size}px "Space Grotesk"`;
  const totalW = ctx.measureText(full).width + (words.length - 1) * 16;
  let cx = W / 2 - totalW / 2;
  words.forEach((w, i) => {
    const k = easeOutExpo(seg(t, start + i * .09, start + i * .09 + .55));
    const exit = seg(t, end - .32, end);
    const ww = ctx.measureText(w[0]).width;
    ctx.save();
    ctx.translate(lerp(-140, 0, k) + cx, y + lerp(70, 0, k) - exit * 75);
    ctx.globalAlpha = vis * k;
    const col = w[2] || C.cream;
    ctx.font = `700 ${size}px "Space Grotesk"`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = col;
    if (w[1]) {
      ctx.shadowColor = rgba(w[2] || C.pink, .95); ctx.shadowBlur = 34;
      ctx.fillText(w[0], 0, 0);
      ctx.shadowBlur = 14; ctx.fillText(w[0], 0, 0);
    }
    ctx.shadowBlur = 0; ctx.fillText(w[0], 0, 0);
    ctx.restore();
    cx += ww + 16;
  });
  // règle néon
  const kr = easeOutExpo(seg(t, start + .12, start + .7));
  const rw = Math.min(totalW, 620) * kr;
  const grad = ctx.createLinearGradient(W / 2 - rw / 2, 0, W / 2 + rw / 2, 0);
  grad.addColorStop(0, C.pink); grad.addColorStop(1, C.cyan);
  strokePath(ctx, [[W / 2 - rw / 2, y + 52], [W / 2 + rw / 2, y + 52]], grad, 3,
    { alpha: vis, glow: 14, glowColor: C.pink });
  ctx.restore();
}
function sceneD(ctx, t) {
  nightBg(ctx, t, { base: '#080810', pink: .16, cyan: .12, gold: .02 });
  // faisceaux diagonaux
  ctx.save(); ctx.globalAlpha = .08;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, rgba(C.pink, 0)); g.addColorStop(.5, rgba(C.pink, 1)); g.addColorStop(1, rgba(C.cyan, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(W, 0); ctx.lineTo(W, 260); ctx.lineTo(0, 460); ctx.closePath(); ctx.fill();
  ctx.restore();
  text(ctx, 'CROUSTY', W / 2, 760, {
    size: 300, align: 'center', color: C.cream, alpha: .028, weight: 700, tracking: 20,
  });
  // miettes
  for (let i = 0; i < 55; i++) {
    const x = R(i * 41 + 3300) * W + Math.sin(t * .8 + i) * 22;
    const y = ((R(i * 43 + 3400) * H - t * (30 + R(i + 3500) * 45)) % (H + 60) + H + 60) % (H + 60) - 30;
    dot(ctx, x, y, 1 + R(i + 3600) * 2.4, i % 4 ? C.gold : C.pink, .18 + R(i + 3700) * .4);
  }
  kinetic(ctx, t, 15.6, 16.95, [['Pas de', false], ['compromis.', true, C.pink]], { y: 540, size: 132 });
  kinetic(ctx, t, 16.95, 18.25, [['Juste du', false], ['croustillant.', true, C.gold]], { y: 540, size: 128 });
  // troisième : deux lignes
  const k3 = io(t, 18.25, 18.55, 19.32, 19.5);
  if (k3 > 0) {
    text(ctx, 'Et une sauce', W / 2, 450, {
      size: 110, align: 'center', color: C.cream, alpha: k3,
      anim: riseAnim(t, 18.25, .02, 62, .42),
    });
    text(ctx, "qu'on ne révèle pas.", W / 2, 585, {
      size: 110, align: 'center', color: C.cyan, alpha: k3, glowColor: C.cyan, glow: 22,
      anim: riseAnim(t, 18.35, .02, 62, .42),
    });
  }
  corners(ctx, .2);
}

/* ------------------------------------------------------------------ */
/* SCÈNE E — 19.5 → 24.0 : outro                                      */
/* ------------------------------------------------------------------ */
function sceneE(ctx, t) {
  const te = t - 19.5;
  nightBg(ctx, t, { pink: .16, cyan: .13, gold: .09 });
  const pulse = .8 + .2 * Math.sin(t * 3.2);
  glow(ctx, W / 2, 545, 760, C.pink, .09 * pulse);
  // barquette stylisée en bas, très atténuée
  ctx.save();
  ctx.globalAlpha = .16 * easeOut(seg(te, .3, 1.5));
  ctx.translate(W / 2, 980); ctx.scale(.62, .62);
  const q = [iso(-1.7, -1.1, .9), iso(1.7, -1.1, .9), iso(1.7, 1.1, .9), iso(-1.7, 1.1, .9)];
  const gr = ctx.createLinearGradient(q[0][0], q[0][1], q[2][0], q[2][1]);
  gr.addColorStop(0, C.gold); gr.addColorStop(1, C.pinkDeep);
  poly(ctx, q, gr, rgba(C.cream, .4), 2);
  ctx.restore();
  // enseignes
  ctx.save(); ctx.globalAlpha = .25;
  roundRect(ctx, 110, 250, 250, 120, 20);
  ctx.strokeStyle = C.pink; ctx.lineWidth = 4; ctx.shadowColor = C.pink; ctx.shadowBlur = 30; ctx.stroke();
  roundRect(ctx, 1560, 250, 250, 120, 20);
  ctx.strokeStyle = C.cyan; ctx.shadowColor = C.cyan; ctx.stroke();
  ctx.restore();

  const k1 = easeOut(seg(te, .15, .85));
  text(ctx, 'TASTY', W / 2, 360, {
    size: 132, align: 'center', color: C.cream, alpha: k1, glowColor: C.pink,
    glow: 30 * pulse, tracking: 8, anim: riseAnim(te, .15, .045, 55, .6),
  });
  text(ctx, 'CROUSTY', W / 2, 490, {
    size: 132, align: 'center', color: C.cyan, alpha: k1, glowColor: C.cyan,
    glow: 32 * pulse, tracking: 5, anim: riseAnim(te, .3, .045, 55, .6),
  });
  const kRule = easeOutExpo(seg(te, .7, 1.4));
  const rw = 430 * kRule;
  strokePath(ctx, [[W / 2 - rw, 540], [W / 2 + rw, 540]], rgba(C.cream, .35), 2, { glow: 10, glowColor: C.pink });
  dot(ctx, W / 2, 540, 4, C.pink, kRule);

  const k2 = easeOut(seg(te, 1.1, 1.8));
  text(ctx, 'CE SOIR,', W / 2, 660, {
    size: 84, align: 'center', color: C.cream, alpha: k2,
    anim: riseAnim(te, 1.1, .04, 45, .55),
  });
  text(ctx, "C'EST CROUSTY.", W / 2, 750, {
    size: 84, align: 'center', color: C.pink, alpha: k2, glowColor: C.pink, glow: 28 * pulse,
    anim: riseAnim(te, 1.25, .04, 45, .55),
  });
  const k3 = easeOut(seg(te, 1.8, 2.5));
  text(ctx, 'À EMPORTER · SUR PLACE · JUSQUE TARD', W / 2, 828, {
    size: 23, family: 'body', weight: 700, tracking: 6, align: 'center',
    color: C.cyan, alpha: k3 * .85,
  });
  text(ctx, 'Testée une fois, validée à vie.', W / 2, 890, {
    size: 30, family: 'body', weight: 400, align: 'center', color: C.cream, alpha: k3 * .75,
  });
  corners(ctx, .3 * pulse);
}

/* ------------------------------------------------------------------ */
/* Point d'entrée unique                                               */
/* ------------------------------------------------------------------ */
function draw(ctx, t, frame) {
  registerFonts();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  if (t < 2.6) sceneA(ctx, t);
  else if (t < 10.0) sceneB(ctx, t);
  else if (t < 15.5) sceneC(ctx, t);
  else if (t < 19.5) sceneD(ctx, t);
  else sceneE(ctx, t);
  overlays(ctx, t, frame === undefined ? Math.round(t * FPS) : frame);
}

module.exports = { draw, W, H, FPS, DUR, C, createCanvas, registerFonts };
