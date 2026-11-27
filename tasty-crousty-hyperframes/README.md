# Tasty Crousty — **vrai projet HyperFrames**

> Pour être clair : le premier MP4 livré (`../tasty-crousty.mp4`) venait d'un moteur canvas
> maison (`../tasty-crousty/engine.cjs`), **pas** de HyperFrames. Ce dossier-ci est la version
> demandée : un projet HyperFrames éditable, avec `index.html`, `compositions/`, des clips
> `data-start`/`data-duration` et des timelines GSAP enregistrées dans `window.__timelines`.
> Il a été **rendu par le CLI HyperFrames** (`hyperframes render`), pas par FFmpeg seul.

## Où sont les animations

> Index rapide : **`ANIMATIONS.md`** (les 6 timelines, fichier par fichier, avec les commandes `grep`).

| Fichier | Scène | Animations (recettes du catalogue) |
|---|---|---|
| `index.html` | root | `window.__timelines["main"]` : barre de progression linéaire + **flash-through-white** aux 4 coupes (`immediateRender:false` sur les fromTo suivants) |
| `compositions/01-logo.html` | 0 → 2.6 s | **per-word-rise** : lettres `blur(10px)→0`, `y:90→0`, stagger 0.055 s, `power4.out` ; tubes néon `scaleX` ; flicker déterministe par `tl.set` ; push-through final |
| `compositions/02-crousty.html` | 2.6 → 10 s | barquette isométrique en SVG : 7 aiguillettes `back.out(1.5)` en cascade, sauce révélée par `strokeDashoffset` (`power2.inOut`), oignons en stagger, vapeur `repeat:3 yoyo`, **count-up** via `tl.set(textContent)` sur le compteur d'étapes, punch-in caméra `scale .90 → 1.06` |
| `compositions/03-reseau.html` | 10 → 15.5 s | carte France en points qui s'allument, routes en `strokeDashoffset`, nœuds `back.out(2)` + anneaux, **per-word-rise** sur le titre, flicker `tl.set`, chips en stagger |
| `compositions/04-kinetic.html` | 15.5 → 19.5 s | **per-word-rise** (`blur(8px)→0`, 0.13 s, 0.067 s d'écart), **kinetic-type-swap** (`croustillant → crousty → croustillant` par `tl.set`), règles néon `scaleX`, sorties `blur(8px)` |
| `compositions/05-outro.html` | 19.5 → 24 s | **cta-close** : lockup par lettres, CTA qui claque, HOLD immobile, respiration néon `repeat:4 yoyo` (jamais `repeat:-1`) |

Les sources des primitives du catalogue sont copiées dans `compositions/primitives/`
(`per-word-rise`, `count-up`, `cta-close`, `flash-through-white`). Elles ne sont pas montées
directement : leurs recettes de timeline sont réimplémentées dans chaque scène pour rester
compatibles avec les variables et le découpage en 5 scènes.

Contrat respecté : aucun `Date.now()`, aucun `Math.random()`, aucun timer, aucun `fetch`,
aucun `repeat:-1`, aucun `play()/pause()`, pas de `display`/`visibility` tweenée sur une
`.clip`, `fromTo` (jamais `from`), états de départ posés dans le markup, registration de la
timeline **après** la construction. `check --json` : **ok: true, 0 erreur** (6 warnings de
densité de piste / taille de fichier, volontaires pour garder une scène = un fichier).

## Structure

```
index.html                     root, variables, 5 hôtes de scène, audio, overlays
compositions/01-logo.html      …
compositions/02-crousty.html   généré par tools/gen-crousty.cjs (SVG statique, pas de JS au rendu)
compositions/03-reseau.html
compositions/04-kinetic.html
compositions/05-outro.html
compositions/primitives/       sources du catalogue (référence)
assets/fonts/                  Space Grotesk + Inter en TTF locaux (@font-face)
assets/audio/beat.wav          bande-son synthétisée en code (24 s)
assets/vendor/gsap.min.js      GSAP 3.15.0 inliné dans index.html (zéro CDN)
renders/                       MP4 produit par `hyperframes render`
tools/gen-crousty.cjs          helper d'authoring : écrit le SVG statique
SPEC.md                        beat sheet / décisions chiffrées
```

## Commandes

Le projet est standard : sur une machine normale, `npx hyperframes preview` puis
`npx hyperframes render`. Dans cette sandbox (CDN bloqués), tout a été installé depuis npm :

```bash
# CLI + Chromium + GSAP + ffprobe, tous depuis registry.npmjs.org
npm install hyperframes@0.9.100 gsap@3.15.0 @sparticuz/chromium@158.0.0 \
            @ffprobe-installer/linux-x64@5.2.0

export HYPERFRAMES_BROWSER_PATH=/tmp/chromium        # extrait de @sparticuz/chromium
export LD_LIBRARY_PATH=/tmp/al2023/lib               # libs AL2023 du même paquet
export FONTCONFIG_PATH=/tmp/fonts
export HYPERFRAMES_FFMPEG_PATH=<chemin ffmpeg>       # imageio-ffmpeg (PyPI)
export HYPERFRAMES_FFPROBE_PATH=<chemin ffprobe>
export HYPERFRAMES_CHROME_SANDBOX=0

npx hyperframes check --json        # ok: true, 0 erreur
npx hyperframes render . -o renders/tasty-crousty-hyperframes.mp4 --fps 30 --workers 1
npx hyperframes snapshot . -o renders/snapshots --at 1.5,4.2,6.6,8.8,12.5,16.4,18.8,21.6,23.9 --no-end --json
npx hyperframes timeline --json
```

## Résultat vérifié ici

- `hyperframes render` réel : `../tasty-crousty-hyperframes.mp4` (copie livrable à la racine ;
  original du CLI dans `renders/tasty-crousty-hyperframes.mp4`), **24,00 s,
  1920×1080, 30 fps, H.264 High yuv420p, AAC 48 kHz stéréo**, 3,7 Mo, audio inclus ;
  720 frames capturées en 1 min 30 par le CLI (screenshot + software GL, 0 erreur).
- `hyperframes check --json` : **ok: true**, 0 erreur (lint/runtime/layout/motion/audio).
- `hyperframes snapshot --at ... --no-end` : 9 PNG + contact sheet ; copies livrables dans
  `../tasty-crousty/stills/hyperframes/` (le dossier `renders/` est ignoré par Git),
  capturés **depuis la composition** (preuve que les timelines sont seekables).
- `../tasty-crousty/stills/planche-hyperframes.jpg` : les 9 mêmes instants extraits du **MP4 rendu**;
  les deux planches concordent.
- Le lecteur `../tasty-crousty/preview/index.html` (port 3000) lit cette version par défaut;
  HTTP `Range` vérifié en 206.

### Correctifs de QA appliqués après le premier rendu

Les tubes néon du logo étaient des blocs plein cadre : ajout de `.tube` + valeurs
`position/width/height` verrouillées par ID. La variable `cta` répétait « CE SOIR » :
elle ne porte plus que la seconde ligne (`C’EST CROUSTY.`). Re-rendu complet après correction.
```

## Variables éditables (Studio)

`data-composition-variables` sur `<html>` : `brand`, `slogan`, `cta` (seconde ligne du CTA), `pink`, `cyan`, `gold`.
Le slogan et le CTA sont liés avec `data-var-text`, les couleurs avec `var(--pink)` etc.
Changer un mot ou une couleur = un champ, puis re-rendre.

## À valider avant diffusion

Comme pour la version canvas : aucun prix, nombre de restaurants, horaire précis ni label
affirmé à l'écran ; les villes de la carte sont décoratives ; le CTA est neutre ; le lockup
est typographique (pas de logo officiel) ; le produit est une interprétation vectorielle.
La bande-son est un synthé minimal, sans voix off.

## Limites

Le rendu officiel demande Chromium : ici il vient de `@sparticuz/chromium` (npm) avec les
libs Amazon Linux 2023, car `cdn.playwright.dev` / `storage.googleapis.com` sont bloqués.
Sur ta machine, `npx hyperframes render` téléchargera son propre Chrome normalement.
