'use strict';
/* CLI de rendu : renderAt(t) -> frames -> FFmpeg -> MP4
   node render.cjs stills 1.5 6.0 12.5 18.6 21.5
   node render.cjs video
   node render.cjs video --fps 30 --dur 24 --out ../tasty-crousty.mp4
*/
const { execFileSync, spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { once } = require('events');
const { draw, W, H, FPS, DUR, createCanvas } = require('./engine.cjs');
const { makeBeat } = require('./beat.cjs');

const ROOT = __dirname;
const STILLS = path.join(ROOT, 'stills');

function ffmpegExe() {
  return execFileSync('python3', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' }).trim();
}
function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function renderStills(times) {
  fs.mkdirSync(STILLS, { recursive: true });
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const t0 = Date.now();
  for (const raw of times) {
    const t = parseFloat(raw);
    if (Number.isNaN(t)) continue;
    draw(ctx, t, Math.round(t * FPS));
    const buf = canvas.toBuffer('image/jpeg', 88);
    const file = path.join(STILLS, `t${t.toFixed(2).padStart(5, '0')}.jpg`);
    fs.writeFileSync(file, buf);
    console.log(`still  t=${t.toFixed(2)}s  ${(buf.length / 1024).toFixed(0)} Ko  -> ${path.basename(file)}`);
  }
  console.log(`${times.length} images en ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

async function renderVideo(fps, dur, out) {
  const ff = ffmpegExe();
  const n = Math.round(fps * dur);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const t0 = Date.now();

  const args = [
    '-y', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(fps), '-i', '-',
    '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
    '-g', String(fps * 2), '-movflags', '+faststart', out,
  ];
  const proc = spawn(ff, args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let errTail = '';
  proc.stderr.on('data', d => { errTail = (errTail + d.toString()).slice(-4000); });

  for (let i = 0; i < n; i++) {
    const t = i / fps;
    draw(ctx, t, i);
    const img = ctx.getImageData(0, 0, W, H);
    const buf = Buffer.from(img.data.buffer, img.data.byteOffset, img.data.byteLength);
    if (!proc.stdin.write(buf)) await once(proc.stdin, 'drain');
    if (i % 60 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`  frame ${i}/${n}  ${el.toFixed(0)}s  (${(el / Math.max(1, i) * 1000).toFixed(0)} ms/frame)`, { flush: true });
    }
  }
  proc.stdin.end();
  const [code] = await once(proc, 'close');
  if (code !== 0) throw new Error(`ffmpeg a échoué (${code}) :\n${errTail}`);
  const size = fs.statSync(out).size;
  console.log(`MP4 muet -> ${out}  ${(size / 1e6).toFixed(1)} Mo  en ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  return out;
}

async function main() {
  const mode = process.argv[2] || 'stills';
  if (mode === 'stills') {
    renderStills(process.argv.slice(3).length ? process.argv.slice(3) : ['1.5', '4.0', '6.6', '8.6', '12.5', '16.4', '18.8', '21.6']);
    return;
  }
  if (mode === 'video') {
    const fps = parseInt(arg('--fps', String(FPS)), 10);
    const dur = parseFloat(arg('--dur', String(DUR)));
    const out = path.resolve(ROOT, arg('--out', '../tasty-crousty-muet.mp4'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await renderVideo(fps, dur, out);
    // bande-son synthétisée en code, puis mixage
    const wav = path.join(ROOT, 'beat.wav');
    makeBeat(wav, dur);
    const final = path.resolve(ROOT, arg('--final', '../tasty-crousty.mp4'));
    const ff = ffmpegExe();
    const r = spawnSync(ff, ['-y', '-loglevel', 'error', '-i', out, '-i', wav,
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', final],
      { encoding: 'utf8' });
    if (r.status !== 0) throw new Error('mixage audio échoué : ' + r.stderr);
    console.log(`MP4 SONORE -> ${final}  ${(fs.statSync(final).size / 1e6).toFixed(1)} Mo`);
    return;
  }
  console.log('Usage : node render.cjs stills [t...] | video [--fps n] [--dur n] [--out f] [--final f]');
}

main().catch(e => { console.error(e); process.exit(1); });
