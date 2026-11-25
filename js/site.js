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

  /* ---- Lightbox for screenshots and cast photos ---- */
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Expanded image');
  lb.innerHTML = '<button class="lb-close" type="button" aria-label="Close image">&times;</button><img alt=""><div class="lb-cap"></div>';
  document.body.appendChild(lb);
  var lbClose = lb.querySelector('.lb-close');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('.lb-cap');
  var opener;
  var bodyOverflow;

  function openLb(src, cap, trigger) {
    opener = trigger;
    bodyOverflow = document.body.style.overflow;
    lbImg.alt = cap || '';
    lbImg.src = src;
    lbCap.textContent = cap || '';
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLb() {
    if (!lb.classList.contains('on')) return;
    lb.classList.remove('on');
    document.body.style.overflow = bodyOverflow;
    if (opener) opener.focus({ preventScroll: true });
  }
  document.querySelectorAll('.screen-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      var img = link.querySelector('img');
      var figure = link.closest('figure');
      var caption = link.getAttribute('data-cap') || (figure && figure.getAttribute('data-cap'));
      openLb(link.href, caption || img.alt, link);
    });
  });
  document.querySelectorAll('.zoomable').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var link = el.querySelector('.screen-link');
      if (link) { link.click(); return; }
      var img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (!img) return;
      openLb(img.currentSrc || img.src, el.getAttribute('data-cap') || img.alt, null);
    });
  });
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target === lbClose) closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'Tab') { e.preventDefault(); lbClose.focus(); }
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
