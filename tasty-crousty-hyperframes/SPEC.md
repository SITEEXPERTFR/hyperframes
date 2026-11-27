# SPEC — Tasty Crousty (24 s, 1920×1080, 30 fps)

Tout adjectif est un nombre. Défauts bannis : fade + slide-up sur chaque titre, breathing /
floating loops, titres qui continuent de bouger après l'atterrissage, bounce sur UI, fondu
entre deux mondes, `repeat:-1`, aléatoire non semé, `Date.now()`.

## Beat sheet (100 BPM → 0,6 s par beat, 40 beats)

| Temps | Scène | Action à l'image | Son |
|---|---|---|---|
| 0.00 | Logo | grille + deux tubes néon s'ouvrent depuis le centre (`scaleX 0→1`, 0,55 s, `power4.out`) | riser 0 → 2,6 |
| 0.34 | Logo | `TASTY` lettre par lettre : `blur 10px→0`, `y 90→0`, 0,18 s, stagger 0,055 s | |
| 0.52 | Logo | flicker déterministe : opacity .42 → 1 → .66 → 1 sur 4 `tl.set` | |
| 0.58 | Logo | `CROUSTY` même entrée, décalée de 0,24 s | |
| 0.95 / 1.35 / 1.65 | Logo | kicker, slogan, ligne produit : `y 14/18→0`, 0,35–0,4 s | |
| 2.28 | Logo | push-through `scale 1→1.10` en 0,32 s `power2.in` | |
| **2.60** | **Coupe 1** | flash blanc 0,035 s → 0,12 s de retour | impact |
| 2.65 | Crousty | murs `opacity 0→1`, `y 40→0`, 0,45 s | kick + basse |
| 2.85 | Crousty | riz `opacity 0→1`, `y 24→0`, 0,7 s | |
| 3.95 → 5.39 | Crousty | 7 aiguillettes : `y -230→0`, `rotation -8→0`, 0,52 s, `back.out(1.5)`, 0,24 s d'écart | hi-hats |
| 4.05 / 6.05 / 7.35 / 8.35 | Crousty | compteur d'étapes 01→04 par `tl.set(textContent)` (count-up) | |
| 6.05 → 7.75 | Crousty | sauce : `strokeDashoffset 1500→0`, 1,7 s, `power2.inOut` | |
| 7.30 → 8.20 | Crousty | 28 oignons : `y -300→0`, 0,5 s, stagger 0,028 s, `power2.in` | |
| 6.00 → 12.4 | Crousty | vapeur : `repeat:3, yoyo`, 1,6 s (répétition finie) | |
| 0 → 7.4 | Crousty | caméra `scale .90→1.06`, linéaire, sur le produit uniquement | |
| **10.00** | **Coupe 2** | flash blanc | impact |
| 10.12 → 10.30 | Réseau | 3 lignes de titre : `blur 10px→0`, 0,18 s, stagger 0,18 s | |
| 10.35 → 12.75 | Réseau | grille de points `opacity .18→1`, 2,4 s | |
| 10.55 → 12.50 | Réseau | 10 nœuds `back.out(2)`, stagger 0,17 s + anneaux | |
| 10.90 → 12.30 | Réseau | 4 routes `strokeDashoffset 220→0`, stagger 0,18 s | |
| 11.35 → 11.76 | Réseau | néon `OUVERT TARD` + 4 `tl.set` de flicker | |
| 12.10 → 12.90 | Réseau | 3 chips `y 20→0`, stagger 0,18 s | |
| **15.50** | **Coupe 3** | flash blanc | impact |
| 15.60 | Kinetic | `Pas de compromis.` : per-word-rise 0,13 s / 0,067 s d'écart | accent phrase 1 |
| 16.95 | Kinetic | `Juste du croustillant.` + swap `croustillant → crousty → croustillant` | accent phrase 2 |
| 18.25 | Kinetic | `Et une sauce / qu'on ne révèle pas.` (deux lignes, même recette) | accent phrase 3 |
| **19.50** | **Coupe 4** | flash blanc | impact |
| 19.65 → 20.10 | Outro | lockup par lettres, 0,18 s, stagger 0,045 s | |
| 20.20 → 20.70 | Outro | règle `scaleX 0→1`, point `back.out(2)` | |
| 20.60 → 20.90 | Outro | CTA en 2 lignes, `blur 8px→0`, 0,16 s | |
| 21.30 → 21.95 | Outro | services + slogan | |
| 21.10 → 24.00 | Outro | respiration néon `repeat:4, yoyo`, puis **HOLD immobile > 2 s** | pad + fade 0,9 s |

## Règles de mouvement appliquées

- Entrées 0,13–0,55 s, sorties 40–50 % plus courtes (0,18–0,2 s).
- Chevauchement : l'élément suivant démarre quand le précédent est à ~30–50 %.
- Un titre atterri reste **parfaitement immobile** ; le mouvement passe au monde derrière.
- Une seule famille d'easing par geste (`power4.out` titres, `back.out` produit, `power2.inOut` tracés).
- Coupes au point le plus rapide du mouvement, flash 0,035 s + 0,12 s de retour.
- 3 types de transitions maximum : flash-through-white, push-through, per-word blur-out.
- Aucune boucle infinie, aucune mesure de layout dans `onUpdate`.

## Palette

`--pink #FF2D78` · `--cyan #22E0E8` · `--gold #F5A93B` · `--cream #FFF4E6` · fond `#0B0B12`.
Espace couleur SDR, grain/vignette statiques (pas de filtre CSS sur média).
