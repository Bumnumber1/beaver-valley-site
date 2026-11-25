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
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
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
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<span class="lb-close" aria-label="Close">&times;</span><img alt=""><div class="lb-cap"></div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('.lb-cap');

  function openLb(src, cap) {
    lbImg.src = src;
    lbCap.textContent = cap || '';
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('on');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.zoomable').forEach(function (el) {
    el.addEventListener('click', function () {
      var img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (!img) return;
      openLb(img.getAttribute('src'), el.getAttribute('data-cap') || img.getAttribute('alt'));
    });
  });
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });

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
