#!/usr/bin/env python3
"""Assemble index.html: template + inlined GSAP core (no CDN, deterministic render)."""
import pathlib, re

root = pathlib.Path(__file__).parent
tpl = (root / "src" / "template.html").read_text(encoding="utf-8")
gsap_path = root / "assets" / "vendor-gsap.js"
# Prefer the exact GSAP build already vendored in the repo.
if not gsap_path.exists():
    gsap_path = root.parent / "tasty-crousty-hyperframes-v2" / "assets" / "vendor" / "gsap.min.js"
gsap = gsap_path.read_text(encoding="utf-8")
assert "CustomEase" not in gsap
html = tpl.replace("/*__GSAP_INLINE__*/", gsap)
(root / "index.html").write_text(html, encoding="utf-8")
print("index.html", len(html), "bytes")
