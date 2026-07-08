/* ==========================================================================
   Animations — IntersectionObserver scroll reveals
   Progressive enhancement: content is visible by default. JS opts in
   to the hidden/revealed treatment only once it confirms support.
   ========================================================================== */

(function initScrollReveals() {
  if (!('IntersectionObserver' in window)) {
    return; // No support: content stays visible, no enhancement applied.
  }

  document.documentElement.classList.add('js-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  function observeAll() {
    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((target) => observer.observe(target));
  }

  observeAll();

  // Exposed so scripts that inject content after load (e.g. products.js)
  // can bring newly added [data-reveal] elements under observation.
  window.SLTRefreshReveals = observeAll;
})();
