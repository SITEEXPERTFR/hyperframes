# Real-asset provenance / transparence

Le CDN `framerusercontent.com` est bloqué depuis ce sandbox : `curl` renvoie `SSL_ERROR_SYSCALL`, `fetch_page` renvoie HTTP 500 et Chromium renvoie `net::ERR_CONNECTION_CLOSED`. Les URLs HTTPS du brief ont donc été **vérifiées dans le HTML des pages officielles** `https://pixel-pop.studio/`, `/realisations-framer`, `/realisations-framer/blify`, `/realisations-framer/magicpost-2`, `/realisations-framer/adzap` et du profil officiel `https://www.framer.com/@pixel-pop/`, puis les fichiers affichés ont été récupérés via le cache d'images de recherche.

| Rôle | URL officielle demandée | Fichier local | Provenance du cache | Statut |
|---|---|---|---|---|
| Logo Pixel Pop! | `https://framerusercontent.com/images/BTpvDKCQV7cluUV9cg6k97bJU.png` | `logo-pixel-pop.png` | profil Framer officiel `@pixel-pop` | même mark officiel, recadré/netteté 512 px ; **pas les octets exacts du PNG** |
| Blify | `https://framerusercontent.com/images/AsAXrdfQg1sqFmlmbojDBQiUvY.webp` | `blify.webp` | page officielle Pixel Pop! | vrai screenshot Blify officiel, 960×768 → 2520×1666 ; **pas les octets exacts du WebP 2520×1666** |
| MagicPost | `https://framerusercontent.com/images/dO16ij8t1Benw5Tps7Hbc5eKys0.webp` | `magicpost.webp` | page officielle `/magicpost-2` | dimensions exactes 1188×751, réencodé WebP |
| Adzap | `https://framerusercontent.com/images/59Ks1NM9HfLrrk1YSUCPMWH43ow.webp` | `adzap.webp` | page officielle `/adzap` | dimensions exactes 2205×1795, réencodé WebP |

**Aucun site mockup généré, aucune image générée, aucun emoji.** Tous les visuels de sites sont des captures réelles Pixel Pop!. Si une fidélité octet-par-octet est exigée, il faut uploader les 4 fichiers ou fournir un chemin d'extraction CDN autorisé ; il suffira alors de remplacer ces 4 fichiers sans toucher à `index.html`.

Les URLs exactes sont conservées ci-dessus et dans le HTML via `data-official-src` pour traçabilité.
