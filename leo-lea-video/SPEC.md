GOAL:    on comprend en 3 s que c'est un vrai livre illustré pour apprendre l'argent, et on retient le titre.
OUTPUT:  HyperFrames, 1920x1080, 60 fps
TIME:    20 s x 60 = 1200 frames · pas de musique mesurée, sound design dry (une frappe par beat)
LOOK:    ground #fafaf9 + paper #fffdf8 ; ink #121211 ; muted #575752 ; accent unique emerald #1f6b45
         (plus mint #e8f6ee pour les surfaces, coin #ffbe0c pour la monnaie, blue #00a0fe sur 2 marques de sélection MAX) ;
         display Inter 800, 92-150 px, tracking -4.5% ; labels Inter 600, 28-34 px, tracking 0 ;
         medium = papier imprimé : pages blanches, filets 1 px #ecebe6, ombre de pli au centre, couverture cartonnée
         avec tranche de mousse ; profondeur = perspective 2200 px, ombre portée 0 60px 120px rgba(18,18,17,.20)
OBJECTS: le livre (couverture cartonnée, bloc de pages, tranche, signet), deux personnages illustrés (Léo, Léa),
         pièce de monnaie (cercle + €, anneau interne), jarre de projet avec graduation, enveloppes papier à rabat,
         cartes de leçons imprimées numérotées — tous dessinés en CSS/SVG, aucun faux screenshot
MOTION:  arrivées expo.out (0.5-0.8 s) ; ouverture de livre power3.inOut (0.9 s) ; sorties power3.in (0.22 s = 45 % de l'entrée) ;
         page tournée rotateY -78 -> 0 en 0.55 s ; pièces en back.out(1.5) ; stagger cartes 4 frames
SHOTS:   0.00-2.60 couverture 3D qui atterrit + titre kinétique + 10/67/8-12 ; 2.60-5.20 le livre s'ouvre, page tournée,
         double page enfants + pièce ; 5.20-8.80 page "10 histoires" + grille des 10 leçons ;
         8.80-12.20 besoin/envie, listes imprimées, pièce qui bascule ; 12.20-15.20 trois enveloppes qui se remplissent ;
         15.20-17.60 jarre de projet 72 % + pièces ; 17.60-20.00 couverture + titre + preuve + CTA + ASIN, hold 2 s
BANNED:  fond sombre, glow/neon, dégradés violet, glass cards, tout centré qui fade-in, chips génériques,
         faux screenshot Amazon, prix/avis inventés, cartes 3-en-rangée sans matière, logo dans un coin
QA:      0.30 (couverture + titre lisibles, frame 0 non vide) · 3.60 (livre ouvert, deux pages) · 6.60 (10 leçons)
         · 10.40 (besoin/envie) · 13.60 (enveloppes) · 16.40 (jarre) · 19.90 (lockup final complet)
