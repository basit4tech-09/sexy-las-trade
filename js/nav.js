/* ==========================================================================
   Navigation — mobile menu toggle, header scroll behavior
   ========================================================================== */

(function initNavigation() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const header = document.querySelector('.site-header');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Slightly darken header once user scrolls past the hero fold
  if (header) {
    let lastScrollY = 0;
    const handleScroll = () => {
      const scrolled = window.scrollY > 40;
      header.style.background = scrolled
        ? 'rgba(13, 13, 13, 0.92)'
        : 'rgba(13, 13, 13, 0.72)';
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }
})();
