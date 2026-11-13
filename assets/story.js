/* Story pages and the work hub. No frameworks, no build step.
   Under prefers-reduced-motion everything renders in its final state. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Reveal on scroll ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('fx');
    $$('[data-fx="stagger"], [data-fx="slide-stagger"]').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); });
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-fx]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll-linked pieces ---------- */
  function progress(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
  }
  function pinProgress(el) {
    var r = el.getBoundingClientRect(), span = r.height - window.innerHeight;
    return span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 1;
  }
  var floats = $$('.float'), rotors = $$('[data-rotate]'), rings = $$('[data-ring]'), pins = $$('[data-pin]');

  function setPin(sec, p) {
    var lv = $$('.lv', sec), out = $('.readout', sec);
    var idx = reduce ? lv.length - 1 : Math.min(lv.length - 1, Math.floor(p * lv.length));
    lv.forEach(function (l, i) { l.classList.toggle('lit', i <= idx); l.classList.toggle('now', !reduce && i === idx); });
    if (out) out.textContent = lv[idx].getAttribute('data-say');
  }
  function update() {
    ticking = false;
    floats.forEach(function (el) {
      var p = progress(el);
      el.style.setProperty('--fy', ((0.5 - p) * 60).toFixed(1) + 'px');
      el.style.setProperty('--fs', (0.96 + 0.06 * Math.min(1, p * 1.8)).toFixed(3));
    });
    rotors.forEach(function (el) {
      var from = +el.getAttribute('data-from'), to = +el.getAttribute('data-to');
      var p = Math.min(1, progress(el.parentNode) * 1.7);
      el.style.setProperty('--rot', (from + (to - from) * p).toFixed(1) + 'deg');
    });
    rings.forEach(function (el) { el.style.setProperty('--fill', Math.min(1, progress(el) * 1.7).toFixed(3)); });
    pins.forEach(function (el) { setPin(el, pinProgress(el)); });
  }
  var ticking = false;
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  } else {
    pins.forEach(function (el) { setPin(el, 1); });
  }

  /* ---------- Count-up ---------- */
  var counts = $$('[data-count]');
  if (!reduce && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, end = +el.getAttribute('data-count'), t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1200);
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        }
        el.textContent = '0';
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counts.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Local nav ---------- */
  var nav = $('.lnav');
  if (nav) {
    var menu = $('.menu', nav);
    if (menu) menu.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '×' : '+';
    });
    $$('.links a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        if (menu) { menu.setAttribute('aria-expanded', 'false'); menu.textContent = '+'; }
      });
    });
    if ('IntersectionObserver' in window) {
      var map = {};
      $$('.links a', nav).forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
      var no = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            $$('.links a', nav).forEach(function (a) { a.classList.remove('on'); a.removeAttribute('aria-current'); });
            var a = map[e.target.id]; if (a) { a.classList.add('on'); a.setAttribute('aria-current', 'true'); }
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) no.observe(s); });
    }
  }

  /* ---------- Carousel arrows ---------- */
  $$('[data-rail]').forEach(function (wrap) {
    var rail = $('.rail', wrap);
    $$('[data-dir]', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var card = $('.card', rail), w = card ? card.getBoundingClientRect().width + 20 : 300;
        var dir = +b.getAttribute('data-dir'), max = rail.scrollWidth - rail.clientWidth;
        var beh = reduce ? 'auto' : 'smooth';
        /* Wrap around at either end so the arrow always moves somewhere. */
        if (dir < 0 && rail.scrollLeft <= 2) rail.scrollTo({ left: max, behavior: beh });
        else if (dir > 0 && rail.scrollLeft >= max - 2) rail.scrollTo({ left: 0, behavior: beh });
        else rail.scrollBy({ left: dir * w, behavior: beh });
      });
    });
  });

  /* ---------- Modal ---------- */
  var dlg = document.createElement('dialog');
  dlg.className = 'modal';
  dlg.setAttribute('aria-labelledby', 'modal-title');
  dlg.innerHTML = '<button type="button" class="x" aria-label="Close">×</button><div class="in"><h2 id="modal-title"></h2><div class="body"></div></div>';
  document.body.appendChild(dlg);
  var lastFocus = null;
  function openModal(trigger) {
    lastFocus = trigger;
    $('#modal-title', dlg).textContent = trigger.getAttribute('data-title') || '';
    var body = $('.body', dlg); body.innerHTML = '';
    var tpl = trigger.getAttribute('data-tpl');
    if (tpl) body.appendChild(document.getElementById(tpl).content.cloneNode(true));
    var text = trigger.getAttribute('data-text');
    if (text) { var p = document.createElement('p'); p.textContent = text; body.appendChild(p); }
    var src = trigger.getAttribute('data-img');
    if (src) { var im = document.createElement('img'); im.src = src; im.alt = trigger.getAttribute('data-alt') || ''; body.appendChild(im); }
    dlg.showModal();
    $('.x', dlg).focus();
  }
  function closeModal() { if (dlg.open) dlg.close(); }
  dlg.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });
  $('.x', dlg).addEventListener('click', closeModal);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeModal(); });
  /* Keep Tab inside the dialog */
  dlg.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = $$('button, a[href], input, [tabindex]:not([tabindex="-1"])', dlg);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  $$('[data-modal]').forEach(function (b) { b.addEventListener('click', function () { openModal(b); }); });

  /* ---------- Caption tabs ---------- */
  $$('[data-tabs]').forEach(function (box) {
    var tabs = $$('[role="tab"]', box), line = document.getElementById(box.getAttribute('data-tabs'));
    function pick(t, focus) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
      line.textContent = t.getAttribute('data-line');
      if (focus) t.focus();
      var app = t.getAttribute('data-app');
      if (app) {
        var fr = document.getElementById(box.getAttribute('data-frame'));
        try { fr.contentWindow.showTab(app); } catch (err) { /* app not loaded yet */ }
      }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        pick(t);
        /* Each tab also jumps to the control it describes. */
        var j = t.getAttribute('data-jump'), target = j && document.querySelector(j);
        if (target) { target.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); target.focus({ preventScroll: true }); }
      });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* ---------- Toner lab (Why Blonde Goes Brassy) ---------- */
  var lab = $('#toner-lab');
  if (lab) {
    var data = JSON.parse($('#toner-data').textContent);
    var range = $('input', lab), sw = $('.swatch', lab), swl = $('.swatch span', lab), msg = $('.msg', lab), lvOut = $('#lv-out', lab);
    var btns = $$('.toners button', lab);
    function level() { return data.levels[range.value]; }
    function paint() {
      var L = level();
      sw.style.setProperty('--sw', 'linear-gradient(160deg,' + L.hex + ' 10%,' + L.warm + ' 95%)');
      swl.textContent = 'Level ' + range.value + ' · ' + L.pigment + ' warmth';
      lvOut.textContent = range.value + ' · ' + L.name;
      msg.textContent = 'Pick the toner that cancels ' + L.pigment.toLowerCase() + '.';
      btns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    }
    range.addEventListener('input', paint);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var L = level(), id = b.getAttribute('data-toner');
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        if (L.fix.indexOf(id) > -1) {
          sw.style.setProperty('--sw', L.neutral);
          swl.textContent = L.neutralLabel;
          msg.textContent = 'Yes. ' + b.textContent.trim() + ' cancels ' + L.pigment.toLowerCase() + '.';
        } else {
          msg.textContent = 'Not quite. Try the color across the wheel.';
          sw.classList.remove('bounce'); void sw.offsetWidth; sw.classList.add('bounce');
        }
      });
    });
    paint();
  }

  /* ---------- Sorter (Clean Station) ---------- */
  var sorter = $('#sorter');
  if (sorter) {
    var items = JSON.parse($('#sort-data').textContent);
    var toolBox = $('.tools', sorter), say = $('.msg', sorter), bins = $$('.bin', sorter), reset = $('.reset', sorter);
    var picked = null;
    function render() {
      toolBox.innerHTML = '';
      items.filter(function (it) { return !it.placed; }).forEach(function (it) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'tool'; b.textContent = it.label;
        b.setAttribute('aria-pressed', String(picked === it)); b.dataset.id = it.id;
        b.addEventListener('click', function () { if (b.dataset.dragged) { delete b.dataset.dragged; return; } select(it); });
        b.addEventListener('pointerdown', function (e) { startDrag(e, b, it); });
        toolBox.appendChild(b);
      });
      bins.forEach(function (bin) {
        var inn = $('.in', bin); inn.innerHTML = '';
        items.filter(function (it) { return it.placed && it.bin === bin.dataset.bin; }).forEach(function (it) {
          var s = document.createElement('span'); s.textContent = it.label; inn.appendChild(s);
        });
      });
      if (items.every(function (it) { return it.placed; })) {
        reset.hidden = false;
        requestAnimationFrame(function () { reset.classList.add('done'); });
        say.textContent = 'Every tool is sorted. The room is reset for the next client.';
      }
    }
    function select(it) {
      picked = picked === it ? null : it;
      say.textContent = picked ? picked.label + ' picked up. Now choose Trash or Disinfect tray.' : 'Pick up a tool, then choose a bin.';
      render();
      if (picked) { var nb = $('.tool[data-id="' + it.id + '"]', toolBox); if (nb) nb.focus(); }
    }
    function drop(it, binId) {
      if (it.bin === binId) {
        it.placed = true; picked = null;
        say.textContent = it.right;
        render();
        var first = $('.tool', toolBox); if (first) first.focus(); else $('.bin', sorter).focus();
      } else {
        picked = null;
        say.textContent = 'Not quite. Can it be disinfected, or is it single-use?';
        render();
        var back = $('.tool[data-id="' + it.id + '"]', toolBox);
        if (back) { back.classList.add('bounce'); back.focus(); }
      }
    }
    bins.forEach(function (bin) {
      bin.addEventListener('click', function () {
        if (!picked) { say.textContent = 'Pick up a tool first, then choose a bin.'; return; }
        drop(picked, bin.dataset.bin);
      });
    });
    function startDrag(e, el, it) {
      if (e.button !== 0) return;
      var sx = e.clientX, sy = e.clientY, moved = false, ghost = null;
      function move(ev) {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
        if (!moved) {
          moved = true; ghost = el.cloneNode(true); ghost.classList.add('dragging'); document.body.appendChild(ghost);
          el.style.visibility = 'hidden';
        }
        ghost.style.left = (ev.clientX - ghost.offsetWidth / 2) + 'px';
        ghost.style.top = (ev.clientY - ghost.offsetHeight / 2) + 'px';
        var under = document.elementFromPoint(ev.clientX, ev.clientY);
        bins.forEach(function (b) { b.classList.toggle('hot', !!under && b.contains(under)); });
      }
      function up(ev) {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        if (!moved) return;
        el.dataset.dragged = '1';
        if (ghost) ghost.remove();
        el.style.visibility = '';
        var under = document.elementFromPoint(ev.clientX, ev.clientY), hit = null;
        bins.forEach(function (b) { if (under && b.contains(under)) hit = b; b.classList.remove('hot'); });
        if (hit) drop(it, hit.dataset.bin);
      }
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    }
    $('[data-again]', sorter).addEventListener('click', function () {
      items.forEach(function (it) { it.placed = false; });
      reset.classList.remove('done'); reset.hidden = true; picked = null;
      say.textContent = 'Pick up a tool, then choose a bin.';
      render();
      $('.tool', toolBox).focus();
    });
    render();
  }
})();
