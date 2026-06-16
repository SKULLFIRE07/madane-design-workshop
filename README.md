# Madane Design Workshop — madane.in

An award-grade, monochrome portfolio for **Madane Design Workshop LLP** — a Mumbai/Pune
architecture, interiors & turnkey studio. "Think to Innovate · We design & build Bharat."

Editorial black-and-white design (Fraunces + Inter), built with React + Vite, GSAP +
ScrollTrigger + Lenis smooth scroll, Three.js, anime.js and react-spring. Full world-footprint
map, cinematic project galleries, growth data, studio & contact.

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview
```

## Deploy
Designed to be served from a domain **root** (assets use absolute `/assets/...` paths).
- **Vercel (recommended):** import the repo → it auto-detects Vite → deploy. Add the custom domain `madane.in`.
- **GitHub Pages:** works only with a **custom domain** (root). A project subpath (user.github.io/repo) needs path changes.
