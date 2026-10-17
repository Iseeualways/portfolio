# Amit Shet — Portfolio

Static site: `index.html` (home), `skills.html`, `project.html`. No build step.

- `assets/css/style.css` — all styles
- `assets/js/main.js` — nav, cursor, copy-email, all GSAP/ScrollTrigger animation
- `assets/vendor/` — GSAP 3.13 + ScrollTrigger (self-hosted)
- `assets/fonts/` — Anton, Inter, Plus Jakarta Sans (self-hosted)

Respects `prefers-reduced-motion`; the horizontal-scroll work section only pins on screens ≥ 992px.
Preview locally: `python3 -m http.server` then open http://localhost:8000
