'use strict';

/* ─── Lucide icons ─────────────────────────────── */
lucide.createIcons();

/* ─── AOS init ─────────────────────────────────── */
AOS.init({
  duration: 700,
  easing: 'ease-out-cubic',
  once: true,
  offset: 60,
});

/* ─── Sticky nav: add .scrolled after 60px ─────── */
const header = document.getElementById('site-header');

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 60);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ─── Hamburger menu ───────────────────────────── */
const toggle = document.getElementById('nav-toggle');
const menu   = document.getElementById('nav-menu');

toggle.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a link is clicked
menu.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close menu on outside click
document.addEventListener('click', e => {
  if (!header.contains(e.target) && menu.classList.contains('is-open')) {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* ─── Footer year ──────────────────────────────── */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── Headshot fallback (hero + about) ─────────── */
document.querySelectorAll('.hero__portrait, .about__photo').forEach(img => {
  img.addEventListener('error', () => { img.style.display = 'none'; });
});

/* ─── Animated counters ────────────────────────── */
function initCounters() {
  const numbers = document.querySelectorAll('.counter__number');
  if (!numbers.length) return;

  const DURATION = 2000;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals ?? '0', 10);
      const start    = performance.now();

      observer.unobserve(el);

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / DURATION, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });

  numbers.forEach(n => observer.observe(n));
}

initCounters();

/* ─── Active nav highlighting ──────────────────── */
const sections   = document.querySelectorAll('main section[id]');
const navLinks   = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else         link.removeAttribute('aria-current');
    });
  });
}, { threshold: 0.5 });

sections.forEach(s => sectionObserver.observe(s));
