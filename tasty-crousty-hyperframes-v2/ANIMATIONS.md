# Où sont les animations

6 timelines en pause, une par fichier :

| Fichier | ID | Mouvements |
|---|---|---|
| `index.html` | `main` | progression linéaire 24 s + 4 flash-through-white |
| `compositions/01-logo.html` | `scene-logo` | caméra lente sur plaque, panneaux `back.out(1.7)` en 3D, per-word-rise, flicker, push-through |
| `compositions/02-crousty.html` | `scene-crousty` | zoom produit, 5 panneaux en cascade, `strokeDashoffset` sauce, count-up `tl.set` 01→04, pulse fini |
| `compositions/03-reseau.html` | `scene-reseau` | routes tracées, villes en `back.out`, néon flicker, chips en stagger |
| `compositions/04-kinetic.html` | `scene-kinetic` | per-word-rise, kinetic-type-swap `croustillant → crousty → croustillant`, orbes `repeat:3 yoyo`, barre de progression |
| `compositions/05-outro.html` | `scene-outro` | lockup lettre par lettre, CTA, halo `repeat:4 yoyo`, HOLD immobile final |

Repères rapides :

```bash
grep -R -n 'window.__timelines' index.html compositions/*.html
grep -R -n 'tl.fromTo\|tl.set\|stagger\|strokeDashoffset' index.html compositions/*.html
```

## Isolation des scènes

Chaque composition est scopée par un conteneur `#s1` … `#s5` : les sélecteurs CSS et GSAP
sont préfixés, et l'ID de composition / la clé `window.__timelines` correspondent à l'hôte
(`scene-logo`, `scene-crousty`, …). Les calques plein écran portent `class="clip layer"` ;
les panneaux, chips, règles et orbes gardent `class="clip"` mais passent en taille auto via
la règle `.clip` scopée. Cela évite qu'un `border-radius:999px` appliqué à un chip ne devienne
un cercle de 1920×1080.
