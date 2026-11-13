/* Story pages: scroll reveals, scroll-linked images, lightbox, reveal panels
   and whole-section clicks. No libraries. Motion is skipped under
   prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* Reveal on scroll */
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('fx');
    document.querySelectorAll('[data-fx="stagger"]').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); });
    });
    document.querySelectorAll('[data-fx="lines"]').forEach(function (g) {
      g.querySelectorAll('.ln').forEach(function (c, i) { c.style.setProperty('--i', i); });
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-fx]').forEach(function (el) { io.observe(el); });

    /* Scroll-linked images: gentle scale-up and a parallax pan. */
    var scales = document.querySelectorAll('.scroll-scale');
    var pans = document.querySelectorAll('.scroll-pan');
    var ticking = false;
    function progress(el) {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      return Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
    }
    function update() {
      ticking = false;
      scales.forEach(function (el) { el.style.setProperty('--sc', (0.94 + 0.08 * Math.min(1, progress(el) * 1.6)).toFixed(3)); });
      pans.forEach(function (el) { el.style.setProperty('--px', ((0.5 - progress(el)) * 10).toFixed(2) + '%'); });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* Lightbox */
  var lb = document.createElement('dialog');
  lb.className = 'lb';
  lb.setAttribute('aria-label', 'Enlarged view');
  lb.innerHTML = '<button type="button" class="x" aria-label="Close">&times;</button><figure><img alt=""><figcaption></figcaption></figure>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption');
  lb.querySelector('.x').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  document.querySelectorAll('[data-lb]').forEach(function (b) {
    b.addEventListener('click', function () {
      lbImg.src = b.getAttribute('data-lb');
      lbImg.alt = b.getAttribute('data-alt') || '';
      var cap = b.getAttribute('data-cap') || '';
      lbCap.textContent = cap; lbCap.hidden = !cap;
      lb.showModal();
    });
  });

  /* Reveal panels */
  document.querySelectorAll('[data-reveal]').forEach(function (b) {
    var panel = document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  /* Whole-section click: empty space in a section runs its main action. */
  document.querySelectorAll('[data-go]').forEach(function (s) {
    var target = s.querySelector(s.getAttribute('data-go'));
    if (!target) return;
    s.addEventListener('click', function (e) {
      if (e.target.closest('a, button, dialog, .hit')) return;
      target.click();
    });
  });
})();
