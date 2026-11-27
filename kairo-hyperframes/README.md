# KAIRO — HyperFrames

Vidéo motion design UI B2B, 1920×1080, **60 fps**, **20,000 s** (1200 frames), rendue avec le CLI HyperFrames officiel.

## Architecture
- **1 seul fichier source** `index.html` : CSS + JS + GSAP 3.15.0 inlinés.
- **1 seule timeline maître** `window.__timelines["main"]`, `paused:true`, `seek(0)`.
- Aucun `setInterval`, aucun `requestAnimationFrame` libre, aucun `Date.now()`, aucun `Math.random()`, aucun `fetch`.
- Polices locales `assets/fonts/*.woff2` : Inter 400/600/800 + JetBrains Mono 500/700.
- Tous les icônes, graphiques, curseur, checkmarks et courbes sont des **SVG inline** ; aucune image externe, aucun emoji.
- Bande-son `assets/audio/kairo.wav` synthétisée localement : nappe sombre ≈ -18 dB, whooshes 2.8 / 9.1 / 13.5 s, clic 9.0 s, pings 9.60 / 9.95 / 10.30 s, impact sub 17.2 s.

## Découpage
0–3 accroche cinétique · 3–8 révélation UI 3D · 8–13.5 curseur + clic + zoom KPI/graph · 13.5–17 cartes flottantes · 17–20 outro KAIRO.

## Commandes (sandbox)
```bash
HYPERFRAMES_BROWSER_PATH=/tmp/chromium \
LD_LIBRARY_PATH=/tmp/al2023/lib \
FONTCONFIG_PATH=/tmp/fonts \
HYPERFRAMES_FFMPEG_PATH=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") \
HYPERFRAMES_FFPROBE_PATH=/tmp/hfkit/node_modules/@ffprobe-installer/linux-x64/ffprobe \
HYPERFRAMES_CHROME_SANDBOX=0 \
npx hyperframes check --json

# même env
npx hyperframes render . -o renders/kairo-hyperframes.mp4 --fps 60 --workers 1 --quality standard --crf 18
npx hyperframes snapshot . -o renders/snapshots --at 1.5,4.5,7.5,9.05,10.5,14.8,18.5,19.9 --no-end
```

## Gardes-fous
Aucun prix/chiffre d'affaires réel revendiqué : les KPI sont ceux du brief fictif. Pas de voix off, pas de réseau au rendu, pas d'asset distant.

## Livrables
- `../kairo-hyperframes.mp4` : 1080p60 H.264/yuv420p + AAC, `+faststart`, 20,000 s.
- `../kairo-hyperframes-720p.mp4` : variante 720p60 légère pour lecture/partage.
- `renders/snapshots/` : 10 stills officiels HyperFrames + planches.
- Le preview du port 3000 expose les deux MP4, le README, la timeline et le storyboard Kairo.

Validation finale : `hyperframes check --json` → `ok:true`, 0 erreur (lint/runtime/layout/motion/audio/contrast/craft) ; `ffprobe` → 1920×1080, `60/1` fps, durée `20.000000`, H.264 `yuv420p`, AAC 48 kHz stéréo ; décodage FFmpeg sans erreur.

## Téléchargement
- MP4 1080p60 : [`../kairo-hyperframes.mp4`](../kairo-hyperframes.mp4) · [lien GitHub](https://github.com/SITEEXPERTFR/hyperframes/raw/refs/heads/arena/9dec692a-hyperframes/kairo-hyperframes.mp4)
- MP4 720p : [`../kairo-hyperframes-720p.mp4`](../kairo-hyperframes-720p.mp4) · [lien GitHub](https://github.com/SITEEXPERTFR/hyperframes/raw/refs/heads/arena/9dec692a-hyperframes/kairo-hyperframes-720p.mp4)
- Page de téléchargement du preview : `/download`
