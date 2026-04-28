/* Revitalis – main.js */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll state ── */
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile hamburger ── */
  const hamburger = document.querySelector('.navbar__hamburger');
  const navMenu   = document.querySelector('.navbar__nav');

  hamburger?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click
  navMenu?.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navbar && !navbar.contains(e.target)) {
      navMenu?.classList.remove('open');
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Active nav link ── */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Scroll reveal (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => io.observe(el));
  }

  /* ── Contact form demo handler ── */
  const contactForm = document.querySelector('#contactForm');
  const successMsg  = document.querySelector('.form-success');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Verzenden…';

    // Simulate async send
    setTimeout(() => {
      contactForm.reset();
      btn.disabled = false;
      btn.textContent = 'Bericht verzenden';
      successMsg?.classList.add('show');
      setTimeout(() => successMsg?.classList.remove('show'), 5000);
    }, 1000);
  });

});
