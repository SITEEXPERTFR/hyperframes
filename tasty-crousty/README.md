# Tasty Crousty — spot motion design généré en code

> **Version HyperFrames** : `../tasty-crousty-hyperframes/` contient le vrai projet éditable
> (`index.html` + `compositions/` + timelines GSAP + registry), rendu par `hyperframes render`.
> Ce dossier-ci est la version de secours en canvas, utilisée quand Chromium n'était pas dispo.
> Le lecteur `preview/index.html` lit désormais le rendu HyperFrames officiel par défaut ;
> les 9 snapshots officiels sont recopiés dans `stills/hyperframes/` pour rester livrables.

Vidéo livrée : **`../tasty-crousty.mp4`** (24,0 s · 1920×1080 · 30 fps · H.264 + bande-son).
Version sans son : `../tasty-crousty-muet.mp4`.

> **Le MP4 ne s'ouvre pas dans le viewer de fichiers ?** Ce n'est pas le fichier (décodage
> FFmpeg vérifié sans erreur), c'est le lecteur intégré. Deux solutions :
> 1. **Lecteur web** : `npm run preview` (ou `node serve.cjs`) → la preview live affiche un
>    `<video>` avec 4 qualités et support HTTP Range. Page : `preview/index.html`.
> 2. **Versions allégées et plus compatibles** (H.264 **Main** au lieu de High, audio stéréo,
>    `+faststart`) : `../tasty-crousty-hd.mp4` (1080p, 5 Mo), `../tasty-crousty-leger.mp4`
>    (720p, 2 Mo), `../tasty-crousty-mini.mp4` (480p, 1 Mo). Ce sont les mêmes 24 s.
> Un simple `<video controls src="...">` dans n'importe quel navigateur suffit.

Reprend exactement la méthode de la conversation précédente : **pas d'After Effects, pas de
template, pas d'asset externe**. Une fonction `draw(ctx, t)` reconstruit l'image à l'instant
`t`, on capture 720 frames, FFmpeg encode. À un `t` donné, l'image est toujours identique.

## Pourquoi pas HyperFrames / Remotion ici

Le repo est bien HyperFrames, mais la sandbox de cette session bloque les CDN de téléchargement
de Chromium. J'ai donc utilisé le **plan B validé** dans la conversation : canvas 2D natif
(`@napi-rs/canvas`) + FFmpeg (`imageio-ffmpeg`). Zéro navigateur, zéro dépendance système,
~130 ms par frame en 1080p, rendu complet en ~2 min.

```bash
bash setup.sh          # npm + imageio-ffmpeg (une seule fois)
npm run stills         # 8 images de contrôle dans stills/
npm run video          # -> tasty-crousty-muet.mp4 + tasty-crousty.mp4
```

Commandes fines :

```bash
node render.cjs stills 1.5 6.6 12.5 18.8 21.6   # n'importe quels instants
node render.cjs video --fps 30 --dur 24 --out ../autre.mp4
node beat.cjs 24                                  # régénère beat.wav seul
```

## Fichiers

| Fichier | Rôle |
|---|---|
| `engine.cjs` | **le spot** : palette, helpers, 5 scènes, `draw(ctx, t)` |
| `render.cjs` | frames RGBA → pipe FFmpeg → MP4, puis mixage audio |
| `beat.cjs` | bande-son 100 % synthétisée (kick/clap/hat/basse/nappe/impacts) |
| `setup.sh` | installation reproductible |
| `stills/` | 8 images de contrôle (`.jpg`), `planche.jpg`, et `planche-finale.jpg` (16 instants extraits du MP4 final) |

## Storyboard

| Temps | Scène | Ce qui se passe |
|---|---|---|
| 0.0 – 2.6 | Logo | nuit, tubes néon qui s'allument avec flicker, `TASTY / CROUSTY` lettre par lettre, slogan |
| 2.6 – 10.0 | Le crousty | barquette isométrique : riz → 7 aiguillettes de poulet qui tombent → sauce qui coule → oignons frits, vapeur, miettes, zoom caméra |
| 10.0 – 15.5 | Le réseau | France en points qui s'allument, routes animées, `UNE NUIT. TOUTE LA FRANCE.`, `OUVERT TARD` |
| 15.5 – 19.5 | Type cinétique | `Pas de compromis.` → `Juste du croustillant.` → `Et une sauce qu'on ne révèle pas.` |
| 19.5 – 24.0 | Outro | lockup, `CE SOIR, C'EST CROUSTY.`, services, slogan |

Palette : rose `#FF2D78`, cyan `#22E0E8`, noir `#0B0B12`, doré `#F5A93B`, blanc chaud
`#FFF4E6`. Polices Space Grotesk + Inter (TTF locaux fournis par npm, enregistrées dans le
moteur, jamais chargées depuis un CDN).

## Personnaliser

* **Textes** : dans `engine.cjs`, chercher les commentaires `SCÈNE A` … `SCÈNE E`.
* **Palette** : constante `C` en haut de `engine.cjs`.
* **Rythme / timings** : les `seg(t, a, b)` et `keyAt(t, ...)` dans chaque scène ; les coupes
  sont dans `CUTS` (et dans `beat.cjs` pour les impacts audio).
* **Durée / fps** : `--dur` / `--fps` (penser à adapter `DUR` dans `engine.cjs` pour la barre
  de progression et la bande-son).
* **Format 9:16** : `W` et `H` sont des constantes, mais les compositions sont calées pour le
  16:9 — il faut recomposer (produit au centre, texte au-dessus), pas seulement changer `W/H`.
* **Audio** : `beat.cjs` est un synthétiseur minimal ; pour une voix off, remplacer `beat.wav`
  par un fichier WAV et relancer le mixage FFmpeg de `render.cjs`.

## À valider avant diffusion (important)

Le spot est volontairement **sans aucune donnée chiffrée inventée** :

* aucun prix, aucun « 60+ restaurants », aucune note, aucune heure précise, aucun label
  (halal…) affirmé à l'écran ;
* les noms de villes sur la carte sont **décoratifs** : à remplacer par les vraies adresses du
  réseau si le spot est publié ;
* le CTA est neutre (`CE SOIR, C'EST CROUSTY.`) : pas d'URL, d'adresse ou de promo inventée —
  c'est l'emplacement à remplir ;
* le lockup est **typographique** : si la marque a un logo officiel, il faut l'intégrer comme
  asset (ce projet n'utilise aucune image de la marque) ;
* le produit est une **interprétation vectorielle** (riz, poulet frit, sauce, oignons frits),
  pas une photo du vrai crousty.

## Limites honnêtes

* Vectoriel 2D en projection isométrique, pas de la vraie 3D / WebGL.
* Bande-son électronique synthétisée en code, **pas de voix off** et pas de musique libre de
  droits externe. Elle est discrète et calée sur les coupes, mais reste un « placement »
  technique : pour une diffusion réelle, mieux vaut une vraie prod audio.
* Le rendu est déterministe, mais `libx264` reste dépendant de la version de FFmpeg : deux
  machines différentes peuvent produire des octets légèrement différents (pas des images
  différentes).
