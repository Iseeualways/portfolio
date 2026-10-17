/* Amit Shet — portfolio
   Shared behaviour for all pages. Everything visible works without JS;
   GSAP only enhances, and only when the visitor hasn't asked for reduced motion. */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Navigation drawer ─────────────────────────────────────────────── */
  function initNav() {
    const burger = $('.burger');
    const drawer = $('#drawer');
    if (!burger || !drawer) return;

    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    drawer.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ── Copy email ────────────────────────────────────────────────────── */
  function toast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.textContent = message;
    document.body.appendChild(el);
    if (window.gsap && !reduceMotion.matches) {
      gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' });
      gsap.to(el, { opacity: 0, y: 8, duration: 0.4, delay: 2.2, onComplete: () => el.remove() });
    } else {
      setTimeout(() => el.remove(), 2600);
    }
  }

  function initCopyEmail() {
    $$('[data-copy-email]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const email = btn.dataset.email || 'amitshet42@gmail.com';
        try {
          await navigator.clipboard.writeText(email);
          toast('Email copied — ' + email);
        } catch (err) {
          location.href = 'mailto:' + email; // clipboard blocked: fall back to the mail app
        }
      });
    });
  }

  /* ── Custom cursor (mouse only) ────────────────────────────────────── */
  function initCursor() {
    if (!matchMedia('(pointer: fine)').matches || reduceMotion.matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    root.classList.add('has-cursor');

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    let visible = false;

    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!visible) {
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
        visible = true;
      }
      moveX(e.clientX);
      moveY(e.clientY);
    }, { passive: true });

    root.addEventListener('mouseleave', () => { visible = false; gsap.to(cursor, { opacity: 0, duration: 0.2 }); });

    const hot = 'a, button, [data-cursor]';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest(hot)) gsap.to(cursor, { scale: 2.2, duration: 0.4, ease: 'power3.out' });
    });
    document.addEventListener('pointerout', (e) => {
      const next = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(hot) : null;
      if (e.target.closest(hot) && !next) gsap.to(cursor, { scale: 1, duration: 0.4, ease: 'power3.out' });
    });
  }

  /* ── Helpers ───────────────────────────────────────────────────────── */
  // Wrap each character in a span (word-safe, so text still wraps on small screens).
  function splitChars(el) {
    if (!el.dataset.splitDone) {
      const text = el.textContent.trim();
      if (/^H[1-6]$/.test(el.tagName) && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', text);
      el.textContent = '';
      const words = text.split(' ');
      words.forEach((word, i) => {
        const w = document.createElement('span');
        w.className = 'w';
        w.setAttribute('aria-hidden', 'true');
        Array.from(word).forEach((ch) => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = ch;
          w.appendChild(c);
        });
        el.appendChild(w);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      el.dataset.splitDone = '1';
    }
    return $$('.char', el);
  }

  const once = (trigger, start = 'top 88%') => ({ trigger, start, once: true });

  /* ── Motion shared by every page ───────────────────────────────────── */
  function sharedMotion() {
    // Reading-progress bar
    gsap.to('.progress', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });

    // Big split-letter headings
    $$('[data-split]').forEach((el) => {
      const chars = splitChars(el);
      const isName = el.classList.contains('name');
      gsap.from(chars, {
        yPercent: isName ? 40 : 60, opacity: 0, duration: 0.9, ease: 'power3.out',
        stagger: isName ? 0.04 : 0.03,
        scrollTrigger: once(el, isName ? 'top 98%' : 'top 88%'),
      });
    });

    // Single blocks that fade up
    $$('[data-reveal], .group__head, .block__head, .cta-band').forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: once(el) });
    });

    // Groups whose children stagger in
    $$('[data-reveal-group]').forEach((group) => {
      gsap.from(group.children, {
        y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09,
        scrollTrigger: once(group, 'top 86%'),
      });
    });

    // Animated counters (final value is already in the HTML)
    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const state = { v: 0 };
      el.textContent = '0' + suffix;
      gsap.to(state, {
        v: end, duration: 1.6, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(state.v) + suffix; },
        scrollTrigger: once(el, 'top 92%'),
      });
    });

    // Hero entrance (home hero + work-page hero)
    const heroItems = $$('[data-hero]');
    const words = $$('.hero .word__in');
    if (heroItems.length || words.length) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
      if (words.length) tl.fromTo(words, { yPercent: 108, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.12 }, 0.15);
      if (heroItems.length) tl.fromTo(heroItems, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, words.length ? 0.35 : 0);
      const photo = $('.hero__photo img');
      if (photo) tl.fromTo(photo, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0.3);
    }
  }

  /* ── Home ──────────────────────────────────────────────────────────── */
  function homeHorizontal() {
    const section = $('.hscroll');
    const track = $('.hscroll__track');
    const bar = $('.hscroll__bar i');
    if (!section || !track) return;

    const distance = () => track.scrollWidth - innerWidth;

    const slide = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: section, pin: true, scrub: 0.8, start: 'top top',
        end: () => '+=' + distance(), invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => { if (bar) gsap.set(bar, { scaleX: self.progress }); },
      },
    });

    $$('.panel', section).forEach((panel, i) => {
      const text = Array.from($('.panel__text', panel).children);
      const shot = $('.browser__view img', panel);

      if (i > 0) {
        gsap.from(text, {
          y: 44, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07,
          scrollTrigger: { trigger: panel, containerAnimation: slide, start: 'left 78%', once: true },
        });
      }
      if (shot) {
        gsap.fromTo(shot, { xPercent: -6, scale: 1.14 }, {
          xPercent: 6, scale: 1.14, ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
        });
      }
    });
  }

  function homeMotion() {
    // Hero headline drifts up as you leave the hero
    gsap.to('.hero__title', {
      y: -70, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ── Skills ────────────────────────────────────────────────────────── */
  function skillsMotion() {
    // Marquee words slide across as you scroll
    $$('.words__item').forEach((el) => {
      const dir = Number(el.dataset.dir) || 1;
      gsap.fromTo(el, { xPercent: dir > 0 ? -100 : 100 }, {
        xPercent: dir > 0 ? 100 : -100, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'bottom top', scrub: 1 },
      });
    });

    // Timeline line draws as you read down it
    const line = $('.timeline__line i');
    if (line) {
      gsap.fromTo(line, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 70%', scrub: true },
      });
    }
  }

  /* ── Work ──────────────────────────────────────────────────────────── */
  function workMotion() {
    $$('.case').forEach((item) => {
      const frame = $('.browser', item);
      const shot = $('.browser__view img', item);
      gsap.from(frame, { y: 90, opacity: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: once(item, 'top 85%') });
      gsap.from(shot, { scale: 1.15, duration: 1.8, ease: 'power3.out', scrollTrigger: once(item, 'top 85%') });
      gsap.from($('.case__info', item).children, {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: once($('.case__info', item), 'top 90%'),
      });
    });
  }

  /* ── Boot ──────────────────────────────────────────────────────────── */
  initNav();
  initCopyEmail();

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js'); // library failed to load: show everything as plain HTML
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    initCursor();

    const mm = gsap.matchMedia();
    const page = document.body.dataset.page;

    // Order matters: the pinned section is created first so every later trigger
    // measures its position with the pin spacing already in place.
    if (page === 'home') {
      mm.add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', homeHorizontal);
    }
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      sharedMotion();
      if (page === 'home') homeMotion();
      if (page === 'skills') skillsMotion();
      if (page === 'work') workMotion();
    });

    const refresh = () => ScrollTrigger.refresh();
    addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  } catch (err) {
    console.error(err);
    root.classList.remove('js');
    gsap.set('[data-hero], [data-reveal], .word__in, .char, .panel__text > *', { clearProps: 'all' });
  }
})();
