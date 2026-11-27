#!/usr/bin/env bash
# Installe tout ce qu'il faut pour re-rendre le spot. Aucun Chromium, aucun CDN,
# aucun compte, aucune clé d'API : npm (polices + canvas natif) + PyPI (FFmpeg).
set -euo pipefail
cd "$(dirname "$0")"

npm install
python3 -m pip install --break-system-packages --quiet imageio-ffmpeg

echo "OK.  npm run stills  |  npm run video"
