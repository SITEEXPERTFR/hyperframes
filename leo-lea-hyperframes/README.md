# Léo et Léa — HyperFrames 20 s

Spot produit 20 s pour **« Léo et Léa, mon argent, mes choix, mon avenir »** (Andréa E. AMOS, broché, 67 p., 8–12 ans, ASIN `B0HPJ2T1C3`), décliné dans le langage visuel du showcase Pixel Pop! (papier #fafaf9, grille pointillée 36 px, emerald/mint, cinétique éditoriale).

## Contrat technique
- **1920×1080 · 60 fps · 20,000 s · 1200 frames**
- 1 seul `index.html` : CSS + JS + **GSAP 3.15.0 inliné** (aucun CDN au runtime)
- **1 seule timeline maître** `window.__timelines["main"]`, `paused:true`, `seek(0)`
- zéro `setInterval`, zéro `requestAnimationFrame`, zéro `Date.now()`, zéro `Math.random()`, zéro `fetch`
- polices locales Inter 400/600/800, WAV local 20 s (48 kHz stéréo)
- easings GSAP core (`expo.out`, `power4.out`, `back.out`) : CustomEase absent du build GSAP embarqué, donc `cubic-bezier(0.16, 1, 0.3, 1)` est approché
- source éditable : `src/template.html` + `build.py` → régénère `index.html` avec GSAP inliné

## Transparence sur les visuels — à lire
Le visuel de couverture officiel **n'a pas pu être récupéré** : le CDN Amazon est bloqué dans ce sandbox
(`m.media-amazon.com` et `images-na.ssl-images-amazon.com` → `curl: (35) OpenSSL SSL_connect: SSL_ERROR_SYSCALL`,
Chromium → `net::ERR_CONNECTION_CLOSED`, `fetch_page` → HTTP 500), et aucune image de couverture de ce titre
n'est indexée dans le cache de recherche d'images.

Conséquence, assumée et documentée :
- **aucune image générée**, **aucun faux screenshot** de la fiche Amazon, **aucune couverture inventée présentée comme officielle** ;
- le « livre » à l'écran est une **cover plate typographique** clairement stylisée (recto blanc, titre, auteur, pastilles jaunes), pas une reproduction de la couverture réelle ;
- **tous les chiffres affichés proviennent de la fiche produit Amazon** : 10 histoires / 10 leçons, 67 pages, 8–12 ans, 16,99 × 24,99 cm, 177 g, langue française, ASIN B0HPJ2T1C3. Aucun prix, aucun avis, aucun classement, aucun « best-seller » n'est affiché.

Pour une version avec la vraie couverture : déposer le fichier (ou fournir un chemin d'extraction autorisé), remplacer
le contenu de `.face` par une `<img>`, relancer `build.py` puis le rendu — la timeline n'a pas besoin d'être modifiée.

## Découpage (20 s)
| Temps | Beat |
|---|---|
| 0.00 → 2.10 | Hook : « MON ARGENT. / MES CHOIX. / MON AVENIR. » + cover plate 3D + 2 chips |
| 2.10 → 5.10 | 10 histoires / 10 leçons, grille de 10 cartes numérotées + barres d'accent |
| 5.10 → 8.10 | Besoin vs envie, deux panneaux + pastille « Trier avant de dépenser. » |
| 8.10 → 11.10 | 3 enveloppes (Dépenser / Épargner / Partager) qui se remplissent |
| 11.10 → 13.60 | Épargne projet : bocal qui remplit + 3 règles + « Régulier. Pas spectaculaire. » |
| 13.60 → 15.40 | Et si j'attendais ? L'ENVIE → LA PAUSE → LE CHOIX |
| 15.40 → 17.40 | Facts produit : 10 · 67 · 8–12 · FR |
| 17.40 → 20.00 | Lockup : cover + wordmark, ligne de preuve, CTA « Disponible sur Amazon.fr », ASIN, hold |

## Sound design
`assets/audio/leo-lea.wav` — 20,00 s, 48 kHz stéréo, généré localement et déterministe (`make_audio.py`, seed fixe) :
pops tactiles, bass-thumps, whooshes filtrés, cloches douces, pièces, riser, shimmer et accord de résolution Fmaj7.
Une frappe audio par beat visuel, aucune voix.

## Commandes
```bash
python3 build.py          # src/template.html + GSAP → index.html
python3 make_audio.py     # régénère le WAV 20 s

HYPERFRAMES_BROWSER_PATH=/tmp/chromium LD_LIBRARY_PATH=/tmp/al2023/lib FONTCONFIG_PATH=/tmp/fonts \
HYPERFRAMES_FFMPEG_PATH=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") \
HYPERFRAMES_FFPROBE_PATH=/tmp/hfkit/node_modules/@ffprobe-installer/linux-x64/ffprobe HYPERFRAMES_CHROME_SANDBOX=0 \
npx hyperframes check --json

# même env
npx hyperframes render . -o renders/leo-lea-hyperframes.mp4 --fps 60 --workers 1 --quality standard --crf 18
```

## Livrables
- `../leo-lea-hyperframes.mp4` : 1080p60 H.264/yuv420p + AAC 48 kHz stéréo, `+faststart`, 20,000 s, 1200 frames.
- `../leo-lea-hyperframes-720p.mp4` : variante 720p60 légère.
- Preview : `/leo-lea`, téléchargements `/download/leo-lea.mp4`, `/download/leo-lea-720p.mp4`, storyboard `/tasty-crousty/stills/leo-lea/contact-sheet.jpg`.
- Validation : `hyperframes check --json` → `ok:true`, `lint 0 erreur`, `craft 0 avertissement`, `layout 0`, `runtime 0`, `audio 0` ;
  `ffprobe` → `duration 20.000000`, `r_frame_rate 60/1`, `nb_frames 1200`, 1920×1080 `yuv420p`, AAC 48 kHz stéréo ; décodage FFmpeg OK.
