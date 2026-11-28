# Timeline unique — `main` (20 s)

`gsap.timeline({paused:true})`, durée 20,0 s, 1200 frames à 60 fps. Tout est `seek`-able : aucune boucle, aucun `repeat:-1`, aucun temps libre.

## Scènes (fenêtres réelles des clips)
| Clip | Fenêtre | Contenu |
|---|---|---|
| `#s1` | 0.00 → 2.10 | eyebrow, headline 3 lignes, cover plate héro, subline, 2 chips |
| `#cover-hero` | 0.00 → 2.10 | objet livre 3D (rotateY −16 → −6 → sortie +18) |
| `#s2` | 2.10 → 5.10 | 10 cartes leçons (stagger 0.05) + barres d'accent |
| `#s3` | 5.10 → 8.10 | panneau BESOIN / panneau ENVIE + pastille |
| `#s4` | 8.10 → 11.10 | 3 enveloppes, remplissage décalé puis ajustement |
| `#s5` | 11.10 → 13.60 | bocal (eau 14 % → 72 %), 3 règles, note, pastille pages |
| `#s6` | 13.60 → 15.40 | 3 étapes + 2 flèches, respiration sur LA PAUSE |
| `#s7` | 15.40 → 17.40 | 4 cartes facts |
| `#s8` | 17.40 → 20.00 | cover réduite, wordmark, titre, preuve, CTA, ASIN, hold |

## Détail des beats
| Temps | Animation |
|---|---|
| 0.00 | `#s1` opacité 1 ; `#headline` y 44 → 0 + rotateX −12 → 0 (`expo.out`) et opacité .55 → 1 (frame 0 déjà lisible) |
| 0.00 | `#s1-eyebrow` .4 → 1 ; `#cover-hero` rotateY −16 → −6, x 120 → 0, scale .9 → 1 (`power4.out`) |
| 0.62 / 0.86 | subline puis chips |
| 1.80 | sortie `#s1` (scale 1.05 + fade) ; cover poussée hors champ |
| 2.10 | entrée `#s2`, titre, sous-titre, 10 cartes en stagger |
| 2.64 | barres d'accent : width 24 → 120, opacité 0 → 1 |
| 4.72 | micro-sortie des cartes (`y −16`, `scale 1.02`) |
| 5.10 | `#s3` : panneaux en miroir (x ±90, rotateY ±8) puis items en stagger |
| 6.28 | pastille « Trier avant de dépenser. » |
| 6.92 | halo ambre sur le panneau ENVIE |
| 8.10 | `#s4` : 3 enveloppes en stagger, remplissages décalés (54 / 62 / 40 %) |
| 9.92 | ajustement `#env-b` 62 → 70 % (`sine.inOut`) |
| 11.10 | `#s5` : bocal + « Mon projet », eau 14 → 72 % sur 1,45 s |
| 12.06 | note « Régulier. Pas spectaculaire. » |
| 12.46 | pastille factuelle « de 60 à 67 pages » |
| 13.60 | `#s6` : 3 étapes + flèches, puis respiration sur LA PAUSE |
| 15.40 | `#s7` : 4 cartes facts en stagger |
| 17.40 | `#s8` : cover + wordmark déjà partiellement visibles (anti-frame-vide), puis kicker, titre, preuve, CTA, ASIN |
| 18.40 → 20.00 | hold déterministe (`#hold` opacity 0 → 1, ease none) |

## Règles respectées
- Aucun chevauchement de tweens sur une même propriété (vérifié par `hyperframes lint`).
- Un seul `fromTo` par propriété et par cible (pas de baseline instable).
- Aucun texte sous 28 px (plancher de lisibilité), aucune ligne sous son plancher de lecture (vérifié par `hyperframes check`, craft 0).
- Frame 0 non vide : headline, eyebrow, cover et fond déjà présents.
