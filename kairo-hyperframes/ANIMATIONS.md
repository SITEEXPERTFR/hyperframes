# Timeline unique

`window.__timelines["main"]` — `gsap.timeline({paused:true})`, durée exacte 20 s.

| Temps | Action |
|---|---|
| 0–3 | badge, mots masqués par `clip-path`, zoom/fondu à 2.6 |
| 3–8 | fenêtre `rotateX 14°→0`, `scale .88→1`, frappe du prompt, barres calmes |
| 8–9.12 | curseur SVG, clic `scale .94`, ripple, bouton vert + check SVG |
| 9.2–11.7 | caméra `scale 1.18→1`, compteur 18 400 € → 54 900 €, badge LIVE, 12 barres stagger .04 |
| 9.6–13.3 | 3 toasts stagger .35 + pings audio |
| 13.5–17 | pivot `rotationY -7`, 2 cartes parallax, progression 100 %, courbe `stroke-dashoffset` |
| 17–20 | fade/zoom arrière, logo KAIRO., shimmer diagonal, sous-titre, HOLD |

Easings : `expo.out`, `power4.out`, `power3.inOut`, `back.out`, `sine.inOut`. Boucles finies uniquement (`repeat:1, yoyo:true`), jamais `repeat:-1`.
