# Où trouver les animations (HyperFrames)

Cherche `window.__timelines` : il y a **6 timelines GSAP mises en pause**, une par fichier.
Le CLI les seeke frame par frame; ce ne sont pas des animations pré-aplaties.

```bash
grep -R -n 'window.__timelines' index.html compositions/*.html
grep -R -n 'tl.fromTo\|tl.set\|stagger\|data-start\|data-duration' index.html compositions/*.html
```

| Fichier | ID de timeline | Ce qui bouge |
|---|---|---|
| `index.html` | `main` | barre de progression linéaire + 4 flash-through-white aux coupes 2,6 / 10 / 15,5 / 19,5 s |
| `compositions/01-logo.html` | `scene-logo` | 6 `fromTo` + 4 `tl.set` : tubes néon `scaleX`, per-word-rise des deux mots (`blur 10px→0`, `y 90→0`, stagger), flicker déterministe, push-through final |
| `compositions/02-crousty.html` | `scene-crousty` | 14 `fromTo` + 4 `tl.set` : 7 aiguillettes `back.out(1.5)` en cascade, sauce `strokeDashoffset 1500→0`, oignons en stagger, vapeur `repeat:3 yoyo`, count-up 01→04, punch-in caméra |
| `compositions/03-reseau.html` | `scene-reseau` | 11 `fromTo` + 4 `tl.set` : grille de points, 10 nœuds `back.out(2)`, 4 routes tracées, néon flicker, chips en cascade |
| `compositions/04-kinetic.html` | `scene-kinetic` | 4 `fromTo` + 2 `tl.set` : per-word-rise sur 3 phrases, kinetic-type-swap `croustillant → crousty → croustillant`, règles néon `scaleX`, blur-out |
| `compositions/05-outro.html` | `scene-outro` | 10 `fromTo` : cta-close (lockup lettre par lettre, CTA qui claque), respiration néon `repeat:4 yoyo`, HOLD immobile final |

Les 4 primitives du catalogue (`per-word-rise`, `count-up`, `cta-close`,
`flash-through-white`) sont dans `compositions/primitives/` à titre de référence;
elles ne sont **pas** montées telles quelles, leurs recettes sont réimplémentées dans
les scènes pour respecter le découpage et les variables. Ce n'est donc pas un
`include` magique : le code des animations est bien lisible dans les fichiers ci-dessus.

Contrat HyperFrames vérifié : `class="clip"` + `data-start` + `data-duration` sur les
éléments timed, `tl.fromTo()` plutôt que `from()`, timelines enregistrées **après**
construction, aucun `play()/pause()`, aucun `repeat:-1`, aucun `Date.now()` /
`Math.random()` / `fetch` / timer. GSAP 3.15.0 est inliné dans `index.html`.

Preuves de rendu :
- `../tasty-crousty-hyperframes.mp4` — MP4 officiel (copie livrable)
- `renders/tasty-crousty-hyperframes.mp4` — sortie brute du CLI
- `../tasty-crousty/stills/hyperframes/` — 9 PNG officiels + contact sheet, copies livrables hors `renders/`
- `../tasty-crousty/stills/contact-sheet-hyperframes.jpg` — snapshots officiels de la composition
- `../tasty-crousty/stills/planche-hyperframes.jpg` — mêmes instants extraits du MP4
- `README.md` / `SPEC.md` — commandes, beat sheet, easings et timings
