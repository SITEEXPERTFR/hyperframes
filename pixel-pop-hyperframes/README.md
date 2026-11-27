# Pixel Pop! — HyperFrames showcase 6 s

Showcase agency « MAXENCE TISON × FRAMER AWARDS » pour **Pixel Pop!**, studio Framer Pro Expert.

## Contrat technique
- **1920×1080 · 60 fps · 6,000 s · 360 frames**
- 1 seul `index.html` : CSS + JS + GSAP 3.15.0 inlinés
- **1 seule timeline maître** `window.__timelines["main"]`, `paused:true`, `seek(0)`
- zéro `setInterval`, zéro `requestAnimationFrame`, zéro `Date.now()`, zéro `Math.random()`, zéro `fetch`
- polices locales Inter 400/600/800, WAV local 6,0 s, assets image locaux
- `expo.out` / `power4.out` / `back.out` pour approximer `cubic-bezier(0.16, 1, 0.3, 1)` sans plugin CustomEase
- perspective 1800 px, cartes 1260×780, images `object-fit:cover; object-position:top center`

## Real assets — transparence importante
Le CDN `framerusercontent.com` est bloqué dans ce sandbox (shell, `fetch_page` **et** Chromium). Les 4 URLs HTTPS du brief ont été vérifiées dans le HTML des pages officielles `pixel-pop.studio` et du profil `framer.com/@pixel-pop`, puis les visuels réels ont été récupérés via le cache d'images de recherche. Voir `assets/real/ASSETS.md`.

- MagicPost et Adzap : dimensions exactes 1188×751 et 2205×1795, réencodées WebP.
- Blify : vrai screenshot officiel Pixel Pop! 960×768, upscalé proprement en 2520×1666.
- Logo : mark officiel du profil Framer, recadré/netteté en 512×512.

**Ce ne sont pas les octets exacts des 4 URLs** ; ce sont bien des captures/mark officiels réels, pas des mockups générés. Pour une fidélité octet-par-octet, remplacer les 4 fichiers de `assets/real/` par les fichiers uploadés : aucune modification de `index.html` nécessaire. Les URLs exactes restent tracées dans `data-official-src` et `ASSETS.md`.

## Découpage
0–1.15 hook · 1.15–2.25 Blify · 2.25–3.35 MagicPost · 3.35–4.05 Adzap · 4.05–4.65 fan-out 3 sites · 4.65–4.95 collapse · 4.95–5.35 lockup · 5.35–6.00 HOLD statique.

## Sound design
`assets/audio/pixel-pop.wav` — 6,00 s, 48 kHz stéréo, sec : pop 0.05 · bass-thump/paper-snap 0.30 · glassy whoosh 1.15 · whip+click 2.25 · riser 3.35 · shimmer 4.05 · percussive lock + resolve chord 4.95. Volume WAV ≈ -17,7 dB RMS / -0,4 dB crête.

## Commandes
```bash
# env sandbox
HYPERFRAMES_BROWSER_PATH=/tmp/chromium LD_LIBRARY_PATH=/tmp/al2023/lib FONTCONFIG_PATH=/tmp/fonts \
HYPERFRAMES_FFMPEG_PATH=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") \
HYPERFRAMES_FFPROBE_PATH=/tmp/hfkit/node_modules/@ffprobe-installer/linux-x64/ffprobe HYPERFRAMES_CHROME_SANDBOX=0 \
npx hyperframes check --json

# même env
npx hyperframes render . -o renders/pixel-pop-hyperframes.mp4 --fps 60 --workers 1 --quality standard --crf 18
```

## Livrables
- `../pixel-pop-hyperframes.mp4` : 1080p60 H.264/yuv420p + AAC, `+faststart`, 6,000 s, 360 frames.
- `../pixel-pop-hyperframes-720p.mp4` : variante 720p60 légère.
- Preview : `/pixel-pop`, `/download/pixel-pop.mp4`, `/download/pixel-pop-720p.mp4`, storyboard `/tasty-crousty/stills/pixel-pop/contact-sheet.jpg`.
- Validation : `hyperframes check --json` `ok:true`, 0 erreur ; `ffprobe` `duration 6.000000`, `r_frame_rate 60/1`, `nb_frames 360`, 1920×1080 `yuv420p`, AAC 48 kHz stéréo ; décodage FFmpeg OK.
