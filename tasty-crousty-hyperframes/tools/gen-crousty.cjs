'use strict';
/* Authoring helper: writes compositions/02-crousty.html with REAL static SVG markup.
   Nothing is generated at render time — every polygon/particle is written into the HTML,
   so HyperFrames can seek any frame deterministically. Run: node tools/gen-crousty.cjs */
const fs = require('fs');
const path = require('path');

const U = 138, C30 = Math.sqrt(3) / 2, S30 = 0.5;
const iso = (x, y, z = 0) => [(x - y) * C30 * U, (x + y) * S30 * U - z * U];
const P = (x, y, z = 0) => iso(x, y, z).map(v => v.toFixed(2));
const pts = a => a.map(p => p.join(',')).join(' ');
const poly = (a, fill, extra = '') => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;
function quad(cx, cy, w, d, z, ang) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]
    .map(([a,b]) => P(cx + a*ca - b*sa, cy + a*sa + b*ca, z));
}
const BOX = { x: -2.1, y: -1.45, w: 4.2, d: 2.9, h: .95 };
const B = BOX;
const AT = P(B.x, B.y, B.h), BT = P(B.x+B.w, B.y, B.h), CT = P(B.x+B.w, B.y+B.d, B.h), DT = P(B.x, B.y+B.d, B.h);
const A0 = P(B.x, B.y, 0), B0 = P(B.x+B.w, B.y, 0), C0 = P(B.x+B.w, B.y+B.d, 0), D0 = P(B.x, B.y+B.d, 0);
const e = .16;
const inner = [P(B.x+e,B.y+e,B.h+.01), P(B.x+B.w-e,B.y+e,B.h+.01), P(B.x+B.w-e,B.y+B.d-e,B.h+.01), P(B.x+e,B.y+B.d-e,B.h+.01)];

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rnd = mulberry32(20261224);
const R = () => rnd();

let svg = [];
svg.push('<svg viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">');
svg.push('<defs>');
svg.push('<radialGradient id="hfGlow"><stop offset="0" stop-color="#F5A93B" stop-opacity=".30"/><stop offset="1" stop-color="#F5A93B" stop-opacity="0"/></radialGradient>');
svg.push('<linearGradient id="hfRice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6E4"/><stop offset=".5" stop-color="#FFE7BE"/><stop offset="1" stop-color="#E7C58F"/></linearGradient>');
svg.push('<linearGradient id="hfChicken" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFCE6B"/><stop offset=".5" stop-color="#F5A93B"/><stop offset="1" stop-color="#D9761E"/></linearGradient>');
svg.push('<linearGradient id="hfSauce" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFC44F"/><stop offset=".5" stop-color="#F59128"/><stop offset="1" stop-color="#E2621C"/></linearGradient>');
svg.push('</defs>');
svg.push('<g id="crousty-stage" transform="translate(960 545)">');
svg.push('<ellipse cx="0" cy="70" rx="470" ry="120" fill="#000" opacity=".45"/>');
svg.push('<circle cx="0" cy="-30" r="560" fill="url(#hfGlow)"/>');

// murs + arêtes
svg.push(`<g id="box-walls" opacity="0">`);
svg.push(poly([B0,C0,CT,BT], '#1A1320'));
svg.push(poly([D0,C0,CT,DT], '#241A28'));
svg.push(`<polyline points="${pts([D0,C0,CT,DT,D0])}" fill="none" stroke="#FF2D78" stroke-width="2.5" opacity=".55"/>`);
svg.push(`<polyline points="${pts([B0,C0,CT,BT,B0])}" fill="none" stroke="#22E0E8" stroke-width="2" opacity=".38"/>`);
// logotype sur la tranche (transform affine locale 260 x 100)
const ax=(CT[0]-DT[0])/260, ay=(CT[1]-DT[1])/260, bx=(D0[0]-DT[0])/100, by=(D0[1]-DT[1])/100;
svg.push(`<g transform="matrix(${ax} ${ay} ${bx} ${by} ${DT[0]} ${DT[1]})"><text x="20" y="62" font-family="Space Grotesk HF" font-size="40" font-weight="700" fill="#FF2D78">CROUSTY</text><rect x="20" y="70" width="120" height="2.5" fill="#22E0E8" opacity=".75"/></g>`);
svg.push('</g>');
svg.push(poly([AT,BT,CT,DT], '#2A1C24', 'stroke="#FF2D78" stroke-width="3" stroke-opacity=".7"'));
svg.push(`<g id="rice" opacity="0">` + poly(inner, 'url(#hfRice)'));
for (let i=0;i<70;i++){
  const u=R(), v=R(), p=iso(B.x+e+u*(B.w-2*e), B.y+e+v*(B.d-2*e), B.h+.02);
  svg.push(`<ellipse cx="${p[0]}" cy="${p[1]}" rx="5.4" ry="2.3" transform="rotate(${(R()*180).toFixed(1)} ${p[0]} ${p[1]})" fill="${i%3===0?'#B0824A':'#FFFFFA'}" opacity=".65"/>`);
}
svg.push('</g>');

// aiguillettes de poulet
const STRIPS = [
  {x:-1.18,y:-.72,a:-.24},{x:.12,y:-.78,a:.18},{x:1.32,y:-.55,a:-.12},
  {x:-1.15,y:.28,a:.15},{x:.18,y:.30,a:-.2},{x:1.30,y:.55,a:.22},{x:-.35,y:.82,a:-.05}
];
STRIPS.forEach((s,i)=>{
  const top = quad(s.x,s.y,1.38,.46,B.h+.18,s.a);
  const bot = quad(s.x,s.y,1.38,.46,B.h+.05,s.a);
  svg.push(`<g id="strip-${i+1}" opacity="0">`);
  svg.push(poly([bot[3],bot[2],top[2],top[3]], '#B4641B'));
  svg.push(poly([bot[1],bot[2],top[2],top[1]], '#D98322'));
  svg.push(poly(top, 'url(#hfChicken)', 'stroke="#60300A" stroke-opacity=".5" stroke-width="1.5"'));
  for (let k=0;k<10;k++){
    const p=iso(s.x+(R()-.5)*1.15, s.y+(R()-.5)*.34, B.h+.182);
    svg.push(`<circle cx="${p[0]}" cy="${p[1]}" r="${(1+R()*1.6).toFixed(1)}" fill="${k%3===0?'#8A4310':'#FFE0A0'}" opacity=".6"/>`);
  }
  svg.push(`<polyline points="${pts([top[0],top[1]])}" fill="none" stroke="#FFF0CD" stroke-width="2.5" opacity=".75"/>`);
  svg.push('</g>');
});

// sauce : un seul chemin, révélé par stroke-dashoffset (GSAP)
const sauce=[];
for (let i=0;i<=120;i++){
  const u=i/120, wx=-1.92+u*3.84, wy=-.28+Math.sin(u*Math.PI*3.1)*.62+Math.sin(u*9)*.05;
  sauce.push(iso(wx,wy,B.h+.32));
}
svg.push(`<g id="sauce"><path id="sauce-shadow" opacity="0" d="M${sauce.map(p=>p.join(' ')).join(' L')}" fill="none" stroke="#FFB43C" stroke-opacity=".28" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"/>`);
svg.push(`<path id="sauce-path" d="M${sauce.map(p=>p.join(' ')).join(' L')}" fill="none" stroke="url(#hfSauce)" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1500" stroke-dashoffset="1500"/>`);
svg.push(`<path id="sauce-glint" d="M${sauce.map(p=>p.join(' ')).join(' L')}" fill="none" stroke="#FFF6D7" stroke-opacity=".45" stroke-width="4" stroke-linecap="round" transform="translate(-2 -5)" stroke-dasharray="1500" stroke-dashoffset="1500"/></g>`);

// oignons frits
svg.push('<g id="onions">');
for (let i=0;i<28;i++){
  const p=iso(-1.75+R()*3.5, -1.05+R()*2.1, B.h+.38);
  svg.push(`<g class="onion" opacity="0" transform="translate(${p[0]} ${p[1]})"><path d="M ${(9+R()*7).toFixed(1)} 0 A ${(9+R()*7).toFixed(1)} ${(9+R()*7).toFixed(1)} 0 0 1 -3 8" fill="none" stroke="${i%4===0?'#FFE1A0':'#F5A93B'}" stroke-width="${(3+R()*2).toFixed(1)}" stroke-linecap="round"/></g>`);
}
svg.push('</g>');

// vapeur + miettes
svg.push('<g id="steam">');
for (let i=0;i<4;i++){
  const bx=-260+i*160;
  svg.push(`<path class="wisp" opacity="0" d="M${bx} -120 C${bx+40} -190 ${bx-40} -260 ${bx+10} -340" fill="none" stroke="#FFF4E6" stroke-opacity=".10" stroke-width="12" stroke-linecap="round"/>`);
}
svg.push('</g>');
svg.push('<g id="crumbs">');
for (let i=0;i<24;i++){
  const p=iso(-2+R()*4, -1.3+R()*2.6, B.h+.4+R()*.5);
  svg.push(`<circle cx="${p[0]}" cy="${p[1]}" r="${(1.4+R()*2).toFixed(1)}" fill="${i%3===0?'#FF2D78':'#F5A93B'}" opacity="0"/>`);
}
svg.push('</g>');
svg.push('</g></svg>');

const HEAD = `<!doctype html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>02 — Le crousty</title></head>
<body>
<template>
  <style>
    @font-face { font-family: "Space Grotesk HF"; src: url("assets/fonts/SpaceGrotesk_700Bold.ttf") format("truetype"); font-weight: 700; }
    @font-face { font-family: "Inter HF"; src: url("assets/fonts/Inter_400Regular.ttf") format("truetype"); font-weight: 400; }
    #root { position:absolute; inset:0; overflow:hidden; isolation:isolate; background:
      radial-gradient(760px 560px at 16% 18%, rgba(255,45,120,.10), transparent 70%),
      radial-gradient(760px 560px at 86% 76%, rgba(34,224,232,.09), transparent 70%), #0B0B12;
      font-family:"Inter HF", Inter, sans-serif; }
    .clip { position:absolute; left:0; top:0; width:100%; height:100%; }
    #c-svg-host { position:absolute; left:0; top:0; }
    .neon { position:absolute; border-radius:22px; border:4px solid var(--pink,#FF2D78); box-shadow:0 0 34px var(--pink,#FF2D78); opacity:.34; }
    #sign-left { left:150px; top:190px; width:330px; height:150px; }
    #sign-right { left:1435px; top:790px; width:345px; height:120px; border-color:var(--cyan,#22E0E8); box-shadow:0 0 30px var(--cyan,#22E0E8); }
    .sign-text { position:absolute; font-family:"Space Grotesk HF",sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; }
    #sign-left-text { left:178px; top:258px; color:var(--pink,#FF2D78); }
    #sign-right-text { left:1465px; top:845px; color:var(--cyan,#22E0E8); }
    #c-kicker { position:absolute; left:128px; top:150px; font-size:21px; font-weight:600; letter-spacing:9px; color:var(--pink,#FF2D78); }
    #c-title { position:absolute; left:124px; top:820px; font-family:"Space Grotesk HF",sans-serif; font-size:96px; font-weight:700; color:var(--cream,#FFF4E6); text-shadow:0 0 26px rgba(255,45,120,.6); }
    #c-sub { position:absolute; left:130px; top:938px; font-size:26px; color:var(--cream,#FFF4E6); opacity:.72; }
    #c-steps { position:absolute; left:130px; top:1000px; font-family:"Space Grotesk HF",sans-serif; font-size:30px; font-weight:700; color:var(--gold,#F5A93B); letter-spacing:3px; }
    #c-badge { position:absolute; left:1470px; top:150px; width:320px; height:84px; border:2px solid var(--cyan,#22E0E8); border-radius:18px; box-shadow:0 0 18px rgba(34,224,232,.55); }
    #c-badge-text { position:absolute; left:1470px; top:186px; width:320px; text-align:center; font-size:23px; font-weight:600; letter-spacing:4px; color:var(--cyan,#22E0E8); }
  </style>
  <div id="root" data-composition-id="scene-crousty" data-width="1920" data-height="1080" data-layout-allow-overflow>
    <div id="c-svg-host" class="clip" data-start="0" data-duration="7.4" data-track-index="0">`;
const MID = `</div>
    <div id="sign-left" class="clip neon" data-start="0" data-duration="7.4" data-track-index="1"></div>
    <div id="sign-right" class="clip neon" data-start="0" data-duration="7.4" data-track-index="1"></div>
    <div id="sign-left-text" class="clip sign-text" data-start="0" data-duration="7.4" data-track-index="2">FRAIS &amp; CHAUD</div>
    <div id="sign-right-text" class="clip sign-text" data-start="0" data-duration="7.4" data-track-index="2">JUSQUE TARD</div>
    <div id="c-kicker" class="clip" data-start="0" data-duration="7.4" data-track-index="2">01 / LE CROUSTY</div>
    <div id="c-title" class="clip" data-start="0" data-duration="7.4" data-track-index="2">Le crousty.</div>
    <div id="c-sub" class="clip" data-start="0" data-duration="7.4" data-track-index="2">Riz · Poulet croustillant · Sauce secrète · Oignons frits</div>
    <div id="c-steps" class="clip" data-start="0" data-duration="7.4" data-track-index="2">ÉTAPE <span id="step-num">01</span> / 04</div>
    <div id="c-badge" class="clip" data-start="3.4" data-duration="3.6" data-track-index="3"></div>
    <div id="c-badge-text" class="clip" data-start="3.4" data-duration="3.6" data-track-index="3">SAUCE SECRÈTE</div>
  </div>
  <script>
    var tl = gsap.timeline({ paused: true });

    // Caméra : lent punch-in sur le produit (jamais sur le titre).
    tl.fromTo("#crousty-stage", { scale: .90 }, { scale: 1.06, duration: 7.4, ease: "none" }, 0);

    // 1 — la barquette et le riz
    tl.fromTo("#box-walls", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .45, ease: "power3.out" }, .05);
    tl.fromTo("#rice", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, ease: "power2.out" }, .25);

    // 2 — 7 aiguillettes qui tombent (ressort, jamais d'aléatoire au rendu)
    for (var i = 1; i <= 7; i++) {
      tl.fromTo("#strip-" + i,
        { y: -230, opacity: 0, rotation: -8, transformOrigin: "50% 50%" },
        { y: 0, opacity: 1, rotation: 0, duration: .52, ease: "back.out(1.5)" }, 1.35 + (i-1)*.24);
    }
    // Recette « count-up » du catalogue : tl.set sur textContent, à des temps absolus.
    tl.set("#step-num", { textContent: "01" }, 1.35);
    tl.set("#step-num", { textContent: "02" }, 1.55);
    tl.set("#step-num", { textContent: "03" }, 3.45);
    tl.set("#step-num", { textContent: "04" }, 4.75);

    // 3 — la sauce qui coule (stroke-dashoffset, une seule propriété = seek sûr)
    tl.fromTo("#sauce-path, #sauce-glint", { strokeDashoffset: 1500 },
      { strokeDashoffset: 0, duration: 1.7, ease: "power2.inOut" }, 3.45);
    tl.fromTo("#sauce-shadow", { opacity: 0 }, { opacity: 1, duration: .4 }, 3.45);

    // 4 — oignons frits + miettes
    tl.fromTo("#onions .onion", { y: -300, opacity: 0, rotation: -40 },
      { y: 0, opacity: 1, rotation: 0, duration: .5, stagger: .028, ease: "power2.in" }, 4.7);
    tl.fromTo("#crumbs circle", { scale: 0, opacity: 0 },
      { scale: 1, opacity: .7, duration: .3, stagger: .015, ease: "back.out(2)" }, 4.9);

    // Vapeur : répétition FINIE, pas de repeat:-1.
    tl.fromTo("#steam .wisp", { y: 20, opacity: 0 },
      { y: -30, opacity: .18, duration: 1.6, stagger: .2, ease: "sine.inOut", repeat: 3, yoyo: true }, 2.0);

    // Textes et badge
    tl.fromTo("#c-kicker", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .35 }, .15);
    tl.fromTo("#c-title", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: .55, ease: "power4.out" }, .2);
    tl.fromTo("#c-sub", { opacity: 0, y: 18 }, { opacity: .72, y: 0, duration: .4 }, .5);
    tl.fromTo("#c-steps", { opacity: 0 }, { opacity: 1, duration: .3 }, .8);
    tl.fromTo("#c-badge, #c-badge-text", { opacity: 0, scale: .82 },
      { opacity: 1, scale: 1, duration: .45, ease: "back.out(1.8)" }, 3.4);
    tl.to("#c-kicker, #c-title, #c-sub, #c-steps, #c-badge, #c-badge-text",
      { opacity: 0, duration: .35, ease: "power2.in" }, 7.0);

    tl.seek(0);
    window.__timelines = window.__timelines || {};
    window.__timelines["scene-crousty"] = tl;
  </script>
</template>
</body>
</html>
`;
const out = HEAD + svg.join('\n') + MID;
fs.writeFileSync(path.join(__dirname, '..', 'compositions', '02-crousty.html'), out);
console.log('02-crousty.html écrit :', (out.length/1024).toFixed(0), 'Ko,', svg.length, 'lignes SVG');
