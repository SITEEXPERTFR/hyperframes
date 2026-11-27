# Timeline unique — `main`

`gsap.timeline({paused:true})`, durée 6,0 s, 360 frames à 60 fps.

| Temps | Beat |
|---|---|
| 0.00–0.35 | logo snap `scale .4 → 1.04 → 1`, `back.out` |
| 0.25–0.65 | `+50 SITES FRAMER.` mot par mot, `clip-path inset(100% → 0%)`, `expo.out` |
| 0.65–1.15 | mint badge « ● Pro Expert officiel · SaaS & B2B » |
| 1.05–1.15 | zoom-through `scale 1.18` + fondu |
| 1.15–2.25 | Blify : 3D slam `rotateY(-12→-4)`, `rotateX(6→2)`, ken-burns 1.06, pill, sélection Framer bleue 0.35 s |
| 2.25–3.35 | whip-swipe 0.22 s, MagicPost miroir `rotateY(12→4)`, push 1.07, pill violette |
| 3.35–4.05 | pop vertical Adzap, pill émeraude |
| 4.05–4.65 | fan-out 3 sites en 3D + header « Conçus pour convertir. » + shimmer audio |
| 4.65–4.95 | collapse inward `power3.in` |
| 4.95–5.35 | lockup logo + wordmark, proof line, CTA émeraude, shimmer diagonal |
| 5.35–6.00 | **HOLD statique** déterministe (`tl.to('#hold', …, 0.65)`) |

Aucune boucle infinie, aucun `repeat:-1`, aucun temps libre. Easing physique demandé `cubic-bezier(0.16,1,0.3,1)` approché par `expo.out`/`power4.out` (GSAP core sans CustomEase).
