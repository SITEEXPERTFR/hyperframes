'use strict';
/* Mini serveur statique avec support HTTP Range (indispensable pour <video> :
   le navigateur doit pouvoir seek / reprendre le flux).
   Aucune dépendance. Écoute sur 0.0.0.0 pour la preview Arena. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.PORT || '3000', 10);
const INDEX = path.join(__dirname, 'preview', 'index.html');
const KAIRO_INDEX = path.join(__dirname, 'preview', 'kairo.html');
const DOWNLOAD_INDEX = path.join(__dirname, 'preview', 'download.html');
const PIXEL_POP_INDEX = path.join(__dirname, 'preview', 'pixel-pop.html');
const LEO_LEA_INDEX = path.join(__dirname, 'preview', 'leo-lea.html');
const DOWNLOADS = Object.freeze({
  '/download/kairo.mp4': path.join(ROOT, 'kairo-hyperframes.mp4'),
  '/download/kairo': path.join(ROOT, 'kairo-hyperframes.mp4'),
  '/download/kairo-720p.mp4': path.join(ROOT, 'kairo-hyperframes-720p.mp4'),
  '/download/kairo-720p': path.join(ROOT, 'kairo-hyperframes-720p.mp4'),
  '/download/pixel-pop.mp4': path.join(ROOT, 'pixel-pop-hyperframes.mp4'),
  '/download/pixel-pop': path.join(ROOT, 'pixel-pop-hyperframes.mp4'),
  '/download/pixel-pop-720p.mp4': path.join(ROOT, 'pixel-pop-hyperframes-720p.mp4'),
  '/download/pixel-pop-720p': path.join(ROOT, 'pixel-pop-hyperframes-720p.mp4'),
  '/download/leo-lea.mp4': path.join(ROOT, 'leo-lea-hyperframes.mp4'),
  '/download/leo-lea': path.join(ROOT, 'leo-lea-hyperframes.mp4'),
  '/download/leo-lea-720p.mp4': path.join(ROOT, 'leo-lea-hyperframes-720p.mp4'),
  '/download/leo-lea-720p': path.join(ROOT, 'leo-lea-hyperframes-720p.mp4'),
});

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch (_) { res.writeHead(400).end('Bad request'); return; }

  const downloadFile = DOWNLOADS[pathname];
  let file = pathname === '/download' ? DOWNLOAD_INDEX
            : downloadFile ? downloadFile
            : pathname === '/pixel-pop' || pathname === '/pixel-pop.html' ? PIXEL_POP_INDEX
            : pathname === '/leo-lea' || pathname === '/leo-lea.html' ? LEO_LEA_INDEX
            : pathname === '/kairo' || pathname === '/kairo.html' ? KAIRO_INDEX
            : (pathname === '/' || pathname === '/index.html') ? INDEX
            : path.resolve(ROOT, '.' + pathname);
  if (!file.startsWith(ROOT + path.sep) && file !== INDEX && file !== KAIRO_INDEX && file !== DOWNLOAD_INDEX && file !== PIXEL_POP_INDEX && file !== LEO_LEA_INDEX) { res.writeHead(403).end('Forbidden'); return; }

  let stat;
  try { stat = fs.statSync(file); } catch (_) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 — fichier introuvable'); return; }
  if (stat.isDirectory()) { res.writeHead(404).end('404'); return; }

  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const base = {
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  if (downloadFile) {
    base['Content-Disposition'] = `attachment; filename="${path.basename(downloadFile)}"`;
    base['Access-Control-Expose-Headers'] = 'Content-Disposition';
  }

  const range = req.headers.range;
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m) { res.writeHead(416, { ...base, 'Content-Range': `bytes */${stat.size}` }).end(); return; }
    let start, end;
    if (m[1] === '') {                       // bytes=-500 (les 500 derniers octets)
      const n = parseInt(m[2], 10);
      start = Math.max(0, stat.size - n); end = stat.size - 1;
    } else {
      start = parseInt(m[1], 10);
      end = m[2] === '' ? stat.size - 1 : Math.min(parseInt(m[2], 10), stat.size - 1);
    }
    if (isNaN(start) || start >= stat.size || start > end) {
      res.writeHead(416, { ...base, 'Content-Range': `bytes */${stat.size}` }).end(); return;
    }
    res.writeHead(206, { ...base, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, { ...base, 'Content-Length': stat.size });
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lecteur Kairo / Tasty Crousty : http://0.0.0.0:${PORT}/  (root=${ROOT})`);
});
