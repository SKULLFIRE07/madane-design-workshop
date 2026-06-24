// Force-enable animations for every visitor. Windows reports
// prefers-reduced-motion: reduce whenever "Animation effects" is off or the
// laptop is in Battery saver, which otherwise disables all motion on this site.
// Neutralise that query so the JS gates (incl. gsap.matchMedia) always animate.
// Imported first in main.jsx so the patch lands before any component mounts.
const _matchMedia = window.matchMedia.bind(window)
window.matchMedia = (query) =>
  /prefers-reduced-motion/i.test(query)
    ? {
        matches: false,
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() { return false },
      }
    : _matchMedia(query)
