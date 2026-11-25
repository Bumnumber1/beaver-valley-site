/* Beaver Valley — site interactions (vanilla, no deps) */
(function () {
  'use strict';

  /* ---- Nav: shrink on scroll + mobile toggle ---- */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', String(links.classList.toggle('open')));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Hero parallax (subtle) ---- */
  var heroBg = document.querySelector('.hero-bg img');
  if (heroBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) heroBg.style.transform = 'translateY(' + (y * 0.18) + 'px) scale(1.06)';
    }, { passive: true });
  }

  /* ---- Lightbox for screenshots ---- */
  var lb = document.createElement('dialog');
  lb.className = 'lightbox';
  lb.setAttribute('aria-label', 'Full gameplay screenshot');
  lb.innerHTML = '<button type="button" class="lb-close" aria-label="Close image">&times;</button><img alt=""><div class="lb-cap"></div>';
  document.body.appendChild(lb);
  var opener;
  var previousOverflow;
  var fullImage = lb.querySelector('img');
  var caption = lb.querySelector('.lb-cap');

  function openFrame(el) {
    var img = el.matches('img') ? el : el.querySelector('img');
    if (!img) return;
    opener = el;
    var portrait = el.classList.contains('cast-face');
    var label = el.dataset.cap || img.alt;
    fullImage.src = el.dataset.full || (el.matches('a[href]') ? el.href : img.currentSrc || img.src);
    fullImage.alt = portrait ? label : img.alt;
    caption.textContent = label;
    lb.classList.toggle('lb-portrait', portrait);
    lb.setAttribute('aria-label', portrait ? 'Cast portrait' : 'Full gameplay screenshot');
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lb.showModal();
  }
  document.querySelectorAll('.zoomable').forEach(function (el) {
    if (typeof lb.showModal !== 'function') return;
    el.setAttribute('aria-haspopup', 'dialog');
    if (!el.matches('button, a[href]')) {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openFrame(el);
        }
      });
    }
    el.addEventListener('click', function (event) {
      if (el.matches('a[href]')) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
      }
      openFrame(el);
    });
  });
  lb.addEventListener('click', function (event) {
    if (event.target === lb || event.target.closest('.lb-close')) lb.close();
  });
  lb.addEventListener('close', function () {
    document.body.style.overflow = previousOverflow;
    if (opener) opener.focus({preventScroll: true});
  });

  /* ---- Pull-quote rotator ---- */
  var stage = document.querySelector('.quote-stage');
  if (stage) {
    var quotes = stage.querySelectorAll('.quote');
    var dotsWrap = document.querySelector('.quote-dots');
    var idx = 0, timer;
    if (dotsWrap) {
      quotes.forEach(function (_, i) {
        var b = document.createElement('button');
        b.setAttribute('aria-label', 'Quote ' + (i + 1));
        if (i === 0) b.classList.add('on');
        b.addEventListener('click', function () { show(i); reset(); });
        dotsWrap.appendChild(b);
      });
    }
    var dots = dotsWrap ? dotsWrap.querySelectorAll('button') : [];
    function show(i) {
      quotes[idx].classList.remove('on');
      if (dots[idx]) dots[idx].classList.remove('on');
      idx = (i + quotes.length) % quotes.length;
      quotes[idx].classList.add('on');
      if (dots[idx]) dots[idx].classList.add('on');
    }
    function next() { show(idx + 1); }
    function reset() { clearInterval(timer); timer = setInterval(next, 4600); }
    reset();
  }

  /* ---- Footer year ---- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
