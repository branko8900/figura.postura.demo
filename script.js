/* ==========================================================================
   Figura & Postura — demo (v2, samo srpski)
   1. exercises  – serijal "1 vežba za 1 nedelju" (dodaj novi objekat za vežbu #2, #3...)
   2. ponašanje  – meni, slike, lightbox, traka na mobilnom, pojavljivanje
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. VEŽBE — serijal "1 vežba za 1 nedelju"
     Za novu vežbu kopiraj objekat, promeni broj, sliku (fajl u /images),
     link i tekst. "poz" je object-position slike (koji deo ostaje u kadru).
     --------------------------------------------------------------------- */
  var exercises = [
    {
      number: 1,
      image: 'vezba-1.jpg',
      poz: '50% 99%',
      video: 'https://www.instagram.com/figura_postura/',
      title: 'Aktivacija mišića trupa',
      alt: 'Mirjana sa malom pilates loptom izvodi vežbu za aktivaciju mišića trupa',
      description: 'Iz upora klečećeg, uz aktivaciju trbušnih mišića, podigni kolena nekoliko centimetara od podloge. Telo ostaje u stabilnom položaju.',
      focus: [
        'Aktivacija dubokih mišića trupa',
        'Stabilizacija kičmenog stuba',
        'Kontrola pokreta',
        'Pravilno držanje tela'
      ]
    }
  ];

  /* ---------------------------------------------------------------------
     2. PONAŠANJE
     --------------------------------------------------------------------- */
  var doc = document;
  var root = doc.documentElement;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderExercises() {
    var box = $('#vezbe');
    if (!box) return;
    box.innerHTML = exercises.map(function (ex) {
      return '' +
        '<article class="vezba reveal">' +
          '<figure class="foto" style="--poz: ' + esc(ex.poz || '50% 50%') + '">' +
            '<img src="images/' + esc(ex.image) + '" alt="' + esc(ex.alt) + '" loading="lazy">' +
          '</figure>' +
          '<div class="vezba__tekst">' +
            '<p class="vezba__br">Vežba #' + ex.number + '</p>' +
            '<h3>' + esc(ex.title) + '</h3>' +
            '<p class="vezba__opis">' + esc(ex.description) + '</p>' +
            '<h4>Fokus vežbe</h4>' +
            '<ul role="list">' + ex.focus.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
            '<a class="dugme" href="' + esc(ex.video) + '" target="_blank" rel="noopener">' +
              '<span>Pogledaj video na Instagramu</span>' +
            '</a>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* ----- Slike: placeholder ako fajl ne postoji ----- */
  function markMissing(img) {
    var box = img.closest('.foto');
    if (!box) return;
    box.setAttribute('data-file', (img.getAttribute('src') || '').split('/').pop());
    box.classList.add('is-missing');
  }
  function checkImages() {
    $$('.foto img').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markMissing(img);
    });
  }
  doc.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG' && el.closest && el.closest('.foto')) markMissing(el);
  }, true);

  /* ----- Header: linija kad se skroluje ----- */
  function initHeader() {
    var header = $('#zaglavlje');
    var sensor = $('#senzor');
    if (!header || !sensor || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-skrol', !entries[0].isIntersecting);
    }).observe(sensor);
  }

  /* ----- Meni na mobilnom ----- */
  var burger, menu, menuOpen = false;

  function setMenu(open) {
    if (!burger || !menu) return;
    menuOpen = open;
    menu.classList.toggle('is-otvoren', open);
    menu.inert = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    $('#zaglavlje').classList.toggle('is-meni', open);
    root.classList.toggle('zakljucan', open);
    ['#sadrzaj', '#podnozje', '#traka'].forEach(function (sel) {
      var el = $(sel);
      if (el) el.inert = open;
    });
  }
  function initMenu() {
    burger = $('#burger');
    menu = $('#meni');
    if (!burger || !menu) return;
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); }
    });
    var mq = window.matchMedia('(min-width: 1100px)');
    var onChange = function () { if (mq.matches && menuOpen) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
    $$('#zaglavlje a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () { if (menuOpen) setMenu(false); });
    });
  }

  /* ----- Lightbox (zatvara se na Esc, na X i klikom van slike) ----- */
  function initLightbox() {
    var dlg = $('#lb');
    var img = $('#lb-img');
    var cap = $('#lb-opis');
    var closeBtn = $('#lb-x');
    if (!dlg || !img || typeof dlg.showModal !== 'function') return;
    var opener = null;

    function close() { if (dlg.open) dlg.close(); }

    doc.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-lightbox]') : null;
      if (!btn || btn.classList.contains('is-missing')) return;
      var src = $('img', btn);
      if (!src) return;
      opener = btn;
      img.src = src.currentSrc || src.src;
      img.alt = src.alt;
      cap.textContent = src.alt;
      dlg.showModal();
      root.classList.add('zakljucan');
      closeBtn.focus();
    });

    closeBtn.addEventListener('click', close);
    dlg.addEventListener('click', function (e) {
      if (e.target !== img && e.target !== cap && !closeBtn.contains(e.target)) close();
    });
    dlg.addEventListener('close', function () {
      root.classList.remove('zakljucan');
      img.removeAttribute('src');
      if (opener) { opener.focus(); opener = null; }
    });
  }

  /* ----- Traka na mobilnom: posle hero sekcije, ne preko kontakta i footera ----- */
  function initBar() {
    var bar = $('#traka');
    if (!bar || !('IntersectionObserver' in window)) return;
    var state = { hero: true, kontakt: false, podnozje: false };
    function update() {
      bar.classList.toggle('is-vidljiva', !state.hero && !state.kontakt && !state.podnozje);
    }
    Object.keys(state).forEach(function (id) {
      var el = doc.getElementById(id);
      if (!el) return;
      // kontakt se računa tek kad uđe u donju trećinu ekrana, da traka ne nestane prerano
      var opts = id === 'kontakt' ? { rootMargin: '0px 0px -30% 0px' } : {};
      new IntersectionObserver(function (entries) {
        state[id] = entries[0].isIntersecting;
        update();
      }, opts).observe(el);
    });
  }

  /* ----- Pojavljivanje pri skrolovanju ----- */
  function initReveal() {
    var items = $$('.reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ----- Start ----- */
  function init() {
    renderExercises();
    initMenu();
    checkImages();
    initHeader();
    initLightbox();
    initBar();
    initReveal();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
