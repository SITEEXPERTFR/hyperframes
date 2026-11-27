'use strict';
/* Bande-son 100 % synthétisée en code (aucun fichier audio externe, aucun droit).
   Électro discret : kick / clap / hi-hat / basse / nappe + impacts sur les coupes. */
const fs = require('fs');

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let v = Math.imul(a ^ a >>> 15, 1 | a);
    v = v + Math.imul(v ^ v >>> 7, 61 | v) ^ v;
    return ((v ^ v >>> 14) >>> 0) / 4294967296;
  };
}

function makeBeat(file, dur = 24) {
  const SR = 44100, N = Math.round(SR * dur);
  const buf = new Float32Array(N);
  const rnd = mulberry32(424242);
  const TAU = Math.PI * 2;
  const BPM = 100, beat = 60 / BPM, bar = beat * 4;
  const add = (start, len, fn) => {
    const a = Math.max(0, Math.round(start * SR)), b = Math.min(N, a + Math.round(len * SR));
    for (let i = a; i < b; i++) buf[i] += fn((i - a) / SR, (i - a) / SR / len);
  };
  const noise = () => rnd() * 2 - 1;

  const kick = (at, gain = 1) => add(at, .38, t => {
    const f = 46 + 105 * Math.exp(-t * 32);
    return Math.sin(TAU * f * t) * Math.exp(-t * 12) * .55 * gain;
  });
  const clap = (at, gain = 1) => add(at, .24, t => {
    const n = noise(), env = Math.exp(-t * 26) * (1 + Math.exp(-t * 90));
    return (n * .32 + Math.sin(TAU * 190 * t) * .12) * env * gain;
  });
  const hat = (at, gain = 1) => {
    let prev = 0;
    add(at, .07, t => {
      const n = noise(), hp = n - prev; prev = n;
      return hp * Math.exp(-t * 85) * .13 * gain;
    });
  };
  const bassNotes = [55.00, 43.65, 65.41, 49.00, 55.00, 43.65, 49.00, 65.41]; // A1 F1 C2 G1 …
  const bass = (at, f, gain = 1) => add(at, beat * 3.6, t => {
    const env = Math.min(1, t * 90) * Math.exp(-t * 2.6);
    return (Math.sin(TAU * f * t) * .22 + Math.sin(TAU * f * 2 * t) * .055) * env * gain;
  });
  const pad = (at, len, freqs, gain = 1) => add(at, len, t => {
    const env = Math.min(1, t * 3) * Math.min(1, (len - t) * 2);
    let v = 0;
    for (const f of freqs) v += Math.sin(TAU * f * t + Math.sin(t * 1.7) * .4) * .045;
    return v * env * gain;
  });
  const riser = (at, len) => {
    add(at, len, (t, p) => (noise() * .10 * Math.pow(p, 2.2) + Math.sin(TAU * (150 + 650 * p) * t) * .05 * p));
  };
  const impact = (at, gain = 1) => {
    add(at, .9, t => Math.sin(TAU * (70 - 25 * t) * t) * Math.exp(-t * 5) * .4 * gain);
    add(at, .5, t => noise() * Math.exp(-t * 14) * .1 * gain);
  };

  // --- intro 0 → 2.6 : montée + impact ---
  riser(0, 2.6);
  pad(.2, 2.5, [110, 164.81, 220], .5);
  impact(2.6, 1.0);
  impact(10.0, .75); impact(15.5, .85); impact(19.5, 1.0);

  // --- nappes de fond ---
  pad(2.6, 12.9, [110, 164.81, 220], .75);
  pad(15.5, 4.0, [87.31, 130.81, 174.61], .7);
  pad(19.5, 4.5, [110, 164.81, 220, 329.63], .9);

  // --- rythme ---
  for (let b = 0; ; b++) {
    const at = 2.6 + b * beat;
    if (at > dur - .15) break;
    const inBreak = at >= 15.5 && at < 19.5;
    const inOutro = at >= 19.5;
    const g = inBreak ? .55 : 1;
    if (!inBreak || b % 2 === 0) kick(at, g);
    if (b % 4 === 1 || b % 4 === 3) clap(at, inBreak ? .45 : .85);
    hat(at, inBreak ? .4 : .85);
    if (!inBreak) hat(at + beat / 2, .5);
    if (b % 4 === 0) {
      const idx = Math.floor((at - 2.6) / bar) % bassNotes.length;
      bass(at, bassNotes[idx], inOutro ? .8 : 1);
    }
    if (inBreak && b % 4 === 2) bass(at, 65.41, .45);
  }

  // --- accents sur les phrases de type cinétique ---
  [15.6, 16.95, 18.25].forEach((at, i) => {
    impact(at, .35 + i * .1);
    add(at, .25, t => noise() * Math.exp(-t * 20) * .09);
  });

  // --- master : fade, soft clip, écriture WAV 16 bits ---
  const pcm = Buffer.alloc(44 + N * 2);
  pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 2, 4); pcm.write('WAVE', 8);
  pcm.write('fmt ', 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20);
  pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28);
  pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34);
  pcm.write('data', 36); pcm.writeUInt32LE(N * 2, 40);
  const fadeIn = SR * .25, fadeOut = SR * .9;
  for (let i = 0; i < N; i++) {
    let v = buf[i] * .78;
    v = Math.tanh(v * 1.35) * .82;
    v *= Math.min(1, i / fadeIn);
    v *= Math.min(1, (N - i) / fadeOut);
    pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2);
  }
  fs.writeFileSync(file, pcm);
  console.log(`Bande-son -> ${file}  ${(pcm.length / 1e6).toFixed(1)} Mo  (${dur}s, 44.1 kHz, mono)`);
}

module.exports = { makeBeat };
if (require.main === module) makeBeat(require('path').join(__dirname, 'beat.wav'), parseFloat(process.argv[2]) || 24);
