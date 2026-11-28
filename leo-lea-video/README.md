# Léo et Léa — spot produit HyperFrames (20 s)

Spot de 20 secondes pour **« Léo et Léa, mon argent, mes choix, mon avenir : 10 histoires pour apprendre à bien gérer son argent »** (Andréa E. AMOS, livre broché, 67 pages, 8–12 ans, ASIN B0HPJ2T1C3).

Ce projet est **entièrement HyperFrames** : un `index.html` qui monte 7 sous-compositions, chacune avec ses clips minutés (`data-start`, `data-duration`, `data-track-index`, `class="clip"`) et **une seule timeline GSAP en pause**, enregistrée dans `window.__timelines`. Aucune animation CSS `@keyframes` : tout le mouvement est écrit en GSAP et piloté par le seek de HyperFrames.

## Structure

```
leo-lea-video/
├── index.html                  # #root data-composition-id="main" · 1920×1080 · 20 s · 60 fps + piste audio
├── SPEC.md                     # brief : objectif, palette, mouvement, décisions
├── assets/
│   ├── book.css                # système visuel partagé (papier, double page, filets, pièce, cartes)
│   ├── gsap.min.js             # GSAP local (aucun CDN au rendu)
│   ├── fonts/*.woff2           # Inter 400 / 600 / 800 (sous-ensemble latin)
│   └── audio/leo-lea.wav       # lit sonore 20 s
└── compositions/
    ├── s1-cover.html           # 0,0–2,6 s   couverture cartonnée 3D + titre kinétique + 10 / 67 / 8–12
    ├── s2-open.html            # 2,6–5,2 s   le livre s'ouvre, page qui se tourne, enfants + pièce
    ├── s3-lessons.html         # 5,2–8,8 s   page « 10 histoires » + grille des 10 leçons
    ├── s4-need.html            # 8,8–12,2 s  besoin / envie, liste imprimée, pièce qui bascule
    ├── s5-envelopes.html       # 12,2–15,2 s 3 enveloppes qui se remplissent
    ├── s6-jar.html             # 15,2–17,6 s jarre de projet 72 % + pièces qui tombent
    └── s7-outro.html           # 17,6–20,0 s lockup final + CTA Amazon.fr + mention de transparence
```

## Contrat HyperFrames respecté

- `index.html` : `#root[data-composition-id="main"]`, `data-width="1920" data-height="1080" data-fps="60" data-duration="20"`, 7 hôtes `data-composition-src` + `<audio data-track-index="9" data-volume="0.9">`.
- Chaque scène : `<template>` → `#root[data-composition-id="sN"]`, un `.clip` minuté **avec `id`** (cible stable pour le Studio), toute la mise en page dans un `.stage` (l'hôte est imposé plein cadre par le runtime : on ne positionne jamais l'hôte, seulement ses descendants).
- Une timeline `gsap.timeline({paused:true})` par scène, animations `fromTo` uniquement, enregistrée dans `window.__timelines["sN"]` **après** les tweens.
- La racine ne fait que monter les scènes : `window.__timelines["main"] = gsap.timeline({paused:true})` (pas de `add()` des timelines enfants).

## Vérification

```bash
hyperframes check leo-lea-video --json
# ok: true — lint 0/0 · craft 0/0 · layout 0/0 · runtime 0/0 · audio 0/0
```

Le plancher typographique HyperFrames (2,6 % du petit côté = **28 px**) est respecté partout, y compris sur les sur-titres de page et les mentions légales. Aucun texte ne reste moins de temps qu'il n'en faut pour le lire, aucun débordement de page.

## Rendu

- 1920×1080 · 60 fps · 1200 frames · 20,000 s · H.264 (yuv420p) + AAC · `+faststart` pour la lecture web.
- Commande : `hyperframes render leo-lea-video -q looks --fps 60`

## Transparence sur les visuels

La couverture Amazon officielle (fichier CDN) **n'était pas accessible** depuis cet environnement : les URLs d'images Amazon.fr renvoient une erreur, et aucune fiche OpenLibrary / Google Books ne référence l'ISBN 979-8165347450.

- La couverture et les pages montrées dans le film sont donc **reconstruites** en CSS/SVG à partir des éléments vérifiés de la fiche produit (titre, auteur, thème, 67 pages, 8–12 ans).
- Ce n'est **pas** le fichier officiel, et le film l'indique à l'écran (`Couverture reconstituée · visuel Amazon inaccessible`).
- Aucun faux screenshot de page Amazon, aucun avis, aucune note, aucun prix inventé : le film n'affiche que des faits vérifiés et l'ASIN.
