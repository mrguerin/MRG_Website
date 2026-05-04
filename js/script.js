'use strict';

/* ─── Mobile scroll fix ─────────────────────────── */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => window.scrollTo(0, 0));

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

/* ─── World Map (amCharts 5) ────────────────────── */
(function initWorldMap() {
  if (!document.getElementById('world-map') || typeof am5 === 'undefined') return;

  const NAVY      = am5.color(0x163358);
  const GOLD      = am5.color(0xc9a84c);
  const CREAM_DIM = am5.color(0xf8f4ee);

  const root = am5.Root.new('world-map');

  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      projection:    am5map.geoMercator(),
      panX:          'none',
      panY:          'none',
      wheelX:        'none',
      wheelY:        'none',
      maxZoomLevel:  1,
    })
  );

  /* Land polygons */
  const polygonSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON:  am5geodata_worldLow,
      exclude:  ['AQ'],
    })
  );
  polygonSeries.mapPolygons.template.setAll({
    fill:           NAVY,
    stroke:         CREAM_DIM,
    strokeOpacity:  0.1,
    strokeWidth:    0.5,
    interactive:    false,
  });
  polygonSeries.mapPolygons.template.states.create('hover', { fill: NAVY });

  /* Trans-Atlantic arc: Paris → Chicago */
  const lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
  lineSeries.mapLines.template.setAll({
    stroke:         GOLD,
    strokeWidth:    1.5,
    strokeDasharray:[5, 4],
    strokeOpacity:  0.55,
    interactive:    false,
  });
  lineSeries.data.push({
    geometry: { type: 'LineString', coordinates: [[2.3, 48.9], [-87.6, 41.9]] }
  });

  /* City markers */
  const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

  const cityTooltip = am5.Tooltip.new(root, { pointerOrientation: 'down' });
  cityTooltip.get('background').setAll({
    fill:          am5.color(0x0a1628),
    stroke:        GOLD,
    strokeOpacity: 0.35,
    cornerRadiusTL: 4, cornerRadiusTR: 4,
    cornerRadiusBL: 4, cornerRadiusBR: 4,
  });
  cityTooltip.label.setAll({
    fill:     CREAM_DIM,
    fontSize: 12,
    lineHeight: 1.6,
  });

  pointSeries.bullets.push(() =>
    am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius:      5,
        fill:        GOLD,
        stroke:      GOLD,
        strokeWidth: 0,
        cursorOverStyle: 'pointer',
        tooltip:     cityTooltip,
        tooltipText: '[bold]{title}[/]\n{employer}\n[opacity: 0.65]{years}[/]',
      }),
    })
  );

  const cities = [
    { title: 'Plano, TX',      employer: 'Aimbridge Hospitality',               years: '2023–Present', geometry: { type: 'Point', coordinates: [-96.7, 33.0] } },
    { title: 'Chicago, IL',    employer: 'KPMG · Blackstone · Hyatt',           years: '2018–2023',    geometry: { type: 'Point', coordinates: [-87.6, 41.9] } },
    { title: 'San Diego, CA',      employer: 'Hyatt Regency La Jolla & Mission Bay',     years: '2017–2018',   geometry: { type: 'Point', coordinates: [-117.16, 32.72] } },
    { title: 'Long Beach, CA', employer: 'Hyatt Regency Long Beach',             years: '2016–2017',   geometry: { type: 'Point', coordinates: [-118.2, 33.8] } },
    { title: 'Cannes, France', employer: 'InterContinental Carlton Cannes',      years: '2015',        geometry: { type: 'Point', coordinates: [7.0, 43.6] } },
    { title: 'Paris, France',  employer: 'Hyatt Regency Paris CDG',              years: '2014',        geometry: { type: 'Point', coordinates: [2.3, 48.9] } },
    { title: 'Newport Beach, CA', employer: 'Hyatt Regency Newport Beach',         years: '2013',        geometry: { type: 'Point', coordinates: [-117.87, 33.62] } },
    { title: 'Costa Mesa, CA', employer: 'Ramada Inn',                           years: '2011–2013',   geometry: { type: 'Point', coordinates: [-117.9, 33.6] } },
  ];
  pointSeries.data.setAll(cities);

  chart.appear(800, 100);
}());
