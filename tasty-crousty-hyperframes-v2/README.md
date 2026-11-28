# Tasty Crousty — HyperFrames V2

Refait pour se rapprocher de la DA **Opus 5.5 / HyperFrames** décrite dans la vidéo de
Maxence Tison « Comment faire du Motion Design PRO avec Claude Opus 5.5 » : mini-monde 3D
isométrique, éclairage cinématique, objets flottants, panneaux de verre, néons, zooms lents.
Référence : https://www.youtube.com/watch?v=DBQqB8eqpFI

**Transparence** : les frames exactes des rendus montrés dans la vidéo n'ont pas pu être
extraites ici. Les 5 plaques `assets/plates/*.jpg` sont donc des **rendus-proxy générés
localement** à partir de la miniature officielle, de la description, des chapitres et
d'exemples adjacents de code-motion — pas des copies des plans de Tison. Elles servent de
base visuelle ; tout le texte, le HUD et les animations restent éditables dans HyperFrames.
Aucune image ne contient de vrai lettrage.

Ce n'est pas l'ancien SVG plat : chaque scène part d'une plaque rendue, puis HyperFrames
ajoute par-dessus une caméra lente, des panneaux 3D, du per-word-rise, des compteurs, des
tracés SVG et des flashs de coupe. Les layers plein écran portent `class="clip layer"` ;
les panneaux/chips gardent `class="clip"` avec une taille auto pour éviter tout débordement.

## Structure

```
index.html                      root 24 s, 5 hôtes, audio, grain, vignette, flash, HUD
compositions/01-logo.html       0 → 2.6   mini-monde + lockup
compositions/02-crousty.html   2.6 → 10  assemblage + compteur 01→04 + sauce
compositions/03-reseau.html    10 → 15.5 carte France + routes + villes
compositions/04-kinetic.html   15.5 → 19.5 type cinétique + swap + cartes
compositions/05-outro.html     19.5 → 24 halo + CTA + HOLD
assets/plates/*.jpg             5 plaques 3D locales, sans réseau au rendu
assets/fonts/                   Space Grotesk + Inter
assets/audio/beat.wav           bande-son synthétisée, sans voix off
assets/vendor/gsap.min.js       GSAP 3.15.0, inliné dans index.html
```

## Animations

Voir `ANIMATIONS.md` et `SPEC.md`. Contrat respecté : `class="clip"` + `data-start` +
`data-duration`, 6 timelines GSAP en pause dans `window.__timelines`, `fromTo` plutôt que
`from`, aucune boucle infinie, aucun `Date.now()` / `Math.random()` / timer / `fetch`,
aucun asset distant.

## Commandes

```bash
npx hyperframes check --json
npx hyperframes render . -o renders/tasty-crousty-hyperframes-v2.mp4 --fps 30
npx hyperframes snapshot . -o renders/snapshots --at 1.5,4.2,6.6,8.8,12.5,16.4,18.8,21.6,23.9 --no-end
```

Dans cette sandbox, Chromium vient de `@sparticuz/chromium` et FFmpeg de `imageio-ffmpeg` ;
les variables exactes sont dans `../../tasty-crousty-hyperframes/README.md`.

## Gardes-fous

Aucun prix, nombre de restaurants, horaire précis ni label affirmé ; villes décoratives ;
CTA neutre ; lockup typographique ; produit en interprétation 3D ; pas de voix off.
Le dossier `../tasty-crousty-hyperframes/` reste la V1 (SVG plat) et `../tasty-crousty/`
reste le secours canvas.
