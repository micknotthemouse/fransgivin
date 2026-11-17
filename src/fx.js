/* FRANSGIVIN effects: registry, reduced mode, particle engine, DOM helpers, effects #1-#14 (spec §7) and the Don blink. */
var FX = (function () {
  'use strict';

  var COL = { ink: '#16110F', cream: '#FFF3D6', kapow: '#C8102E', yolk: '#FFD23F', pumpkin: '#FF7A1A', gravy: '#7A4520', white: '#FFFFFF', gold: '#D4A24C' };
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var calm = false;
  var listeners = [];

  function reduced() { return calm || !!(mq && mq.matches); }

  function applyMode() {
    var r = reduced();
    document.documentElement.classList.toggle('reduced', r);
    if (r) engine.clear();
    listeners.forEach(function (fn) { try { fn(r); } catch (e) { /* ignore */ } });
  }

  function setCalm(v) { calm = !!v; applyMode(); }
  function onChange(fn) { listeners.push(fn); }

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function range(v, dflt) {
    if (v == null) return dflt;
    return Array.isArray(v) ? v : [v, v];
  }

  // ---------------------------------------------------------------- particle engine
  var engine = (function () {
    var canvas = null, ctx = null, W = 0, H = 0, dpr = 1;
    var CAP = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ? 60 : 120;
    var pool = [];
    for (var i = 0; i < CAP; i++) pool.push({});
    var live = 0, raf = 0, last = 0, factor = 1;
    var frames = [], fsum = 0;
    var resizeT = 0;

    function size(force) {
      if (!canvas) return;
      var w = window.innerWidth;
      if (!force && w === W) return; // height-only resizes (iOS toolbar) never re-allocate or wipe (A7)
      W = w;
      H = Math.max((window.screen && window.screen.height) || 0, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init(c) {
      canvas = c;
      ctx = c && c.getContext ? c.getContext('2d') : null;
      if (!ctx) { canvas = null; return; }
      size(true);
      window.addEventListener('resize', function () {
        clearTimeout(resizeT);
        resizeT = setTimeout(function () { size(false); }, 150);
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) clear();
      });
    }

    function track(ft) {
      if (factor < 1 || ft <= 0 || ft > 250) return;
      frames.push(ft); fsum += ft;
      if (frames.length > 30) fsum -= frames.shift();
      if (frames.length === 30 && fsum / 30 > 24) factor = 0.5; // adaptive halving for the rest of the session
    }

    function draw(p) {
      var a = p.life / p.max;
      ctx.globalAlpha = a < 0.3 ? a / 0.3 : 1;
      var s = p.size;
      switch (p.shape) {
        case 'rect':
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.fillRect(-s / 2, -s / 4, s, s / 2);
          ctx.restore();
          break;
        case 'feather':
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.35, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.fill();
          ctx.lineWidth = 1.5; ctx.strokeStyle = COL.ink; ctx.stroke();
          ctx.restore();
          break;
        case 'bubble':
          ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
          ctx.lineWidth = 2; ctx.strokeStyle = p.color; ctx.stroke();
          break;
        case 'cork':
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = '#C8A36A'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(-s, -s * 0.7, s * 2, s * 1.4, s * 0.4); else ctx.rect(-s, -s * 0.7, s * 2, s * 1.4);
          ctx.fill(); ctx.stroke();
          ctx.restore();
          break;
        default:
          ctx.beginPath(); ctx.arc(p.x, p.y, s / 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.fill();
      }
    }

    function tick(t) {
      raf = 0;
      if (!ctx) return;
      var ft = t - last;
      var dt = Math.min(0.05, Math.max(0, ft / 1000));
      last = t;
      track(ft);
      ctx.clearRect(0, 0, W, H);
      for (var i = live - 1; i >= 0; i--) {
        var p = pool[i];
        p.life -= dt;
        if (p.life <= 0 || p.y > H + 60 || p.y < -200) {
          live--; pool[i] = pool[live]; pool[live] = p;
          continue;
        }
        p.vy += p.g * dt;
        p.vx *= (1 - p.drag * dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        draw(p);
      }
      ctx.globalAlpha = 1;
      if (live > 0) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    }

    /**
     * spawn(n, opts) -> number actually spawned (truncated to free slots; 0 in reduced mode).
     * opts: {x, y, spread, colors[], shapes[] (circle|rect|feather|bubble|cork), speed:[min,max] px/s,
     *        angle:[min,max] radians (0 = right, -PI/2 = up), g px/s^2 (negative rises), life:[min,max] s,
     *        size:[min,max] px, spin:[min,max] rad/s, drag}
     */
    function spawn(n, o) {
      o = o || {};
      if (!ctx || reduced() || document.hidden) return 0;
      n = Math.floor(n * factor);
      var free = CAP - live;
      if (n > free) n = free;
      if (n <= 0) return 0;
      var colors = o.colors || [COL.kapow, COL.yolk, COL.gravy, COL.white];
      var shapes = o.shapes || ['circle'];
      var sp = range(o.speed, [200, 600]), an = range(o.angle, [0, Math.PI * 2]);
      var lf = range(o.life, [0.8, 1.2]), sz = range(o.size, [5, 9]), spin = range(o.spin, [-8, 8]);
      var spread = o.spread || 0;
      for (var i = 0; i < n; i++) {
        var p = pool[live++];
        var ang = rnd(an[0], an[1]), v = rnd(sp[0], sp[1]);
        p.x = (o.x || 0) + rnd(-spread, spread);
        p.y = (o.y || 0) + rnd(-spread / 2, spread / 2);
        p.vx = Math.cos(ang) * v;
        p.vy = Math.sin(ang) * v;
        p.g = o.g == null ? 900 : o.g;
        p.max = p.life = rnd(lf[0], lf[1]);
        p.size = rnd(sz[0], sz[1]);
        p.color = pick(colors);
        p.shape = pick(shapes);
        p.rot = rnd(0, Math.PI * 2);
        p.vr = rnd(spin[0], spin[1]);
        p.drag = o.drag == null ? 0.4 : o.drag;
      }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
      return n;
    }

    function clear() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0; live = 0;
      if (ctx) ctx.clearRect(0, 0, W, H);
    }

    return {
      init: init, spawn: spawn, clear: clear, cap: CAP,
      live: function () { return live; }, factor: function () { return factor; }
    };
  })();

  // ---------------------------------------------------------------- DOM helpers
  var layerEl = null;
  function layer() {
    if (!layerEl) layerEl = document.getElementById('fxLayer');
    return layerEl;
  }

  function center(el) {
    if (!el || !el.getBoundingClientRect) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, top: r.top, left: r.left };
  }

  function inView(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  }

  /** Place static SVG markup (ART output only, never user data) centered at x,y in the fx layer. */
  function sticker(markup, x, y, o) {
    o = o || {};
    var L = layer();
    if (!L) return null;
    var w = o.w || 160, h = o.h || w;
    x = Math.max(w / 2 + 4, Math.min(window.innerWidth - w / 2 - 4, x));
    var d = document.createElement('div');
    d.className = 'fx-sticker ' + (o.cls || '');
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.style.width = w + 'px';
    d.style.height = h + 'px';
    d.style.marginLeft = (-w / 2) + 'px';
    d.style.marginTop = (-h / 2) + 'px';
    d.innerHTML = markup;
    L.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, o.ms || 1000);
    return d;
  }

  /** Floating comic word, textContent only. */
  function floatWord(text, x, y, o) {
    o = o || {};
    var L = layer();
    if (!L) return null;
    var d = document.createElement('div');
    d.className = 'fx-word ' + (o.cls || '');
    d.textContent = text;
    x = Math.max(60, Math.min(window.innerWidth - 60, x));
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    L.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, o.ms || 800);
    return d;
  }

  /** Restartable one-shot class. */
  function once(el, cls, ms) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    clearTimeout(el['_fx_' + cls]);
    el['_fx_' + cls] = setTimeout(function () { el.classList.remove(cls); }, ms || 600);
  }

  /** Screen shake moves only #stage. */
  function shake(px, frames) {
    if (reduced()) return;
    var st = document.getElementById('stage');
    if (!st) return;
    var i = 0;
    (function step() {
      if (i >= frames) { st.style.transform = ''; return; }
      var a = px * (1 - i / frames);
      st.style.transform = 'translate(' + ((i % 2 ? -1 : 1) * a).toFixed(1) + 'px,' + (Math.random() * a - a / 2).toFixed(1) + 'px)';
      i++;
      requestAnimationFrame(step);
    })();
  }

  // ---------------------------------------------------------------- registry
  var effects = {};
  var lastBig = -1e9;

  /** FX.play(name, opts) -> true if a registered effect handled it (in either mode). */
  function play(name, opts) {
    var e = effects[name];
    if (!e) return false;
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    if (e.big) {
      if (now - lastBig < 400) return false; // one big effect at a time; skip within 400ms
      lastBig = now;
    }
    opts = opts || {};
    try {
      if (reduced()) { if (typeof e.reduced === 'function') e.reduced(opts); }
      else if (typeof e.run === 'function') e.run(opts);
    } catch (err) {
      if (window.console) console.warn('FX ' + name + ' failed', err);
    }
    return true;
  }

  // ---------------------------------------------------------------- effects owned by builder 1

  function stampCard(card, calmMode) {
    if (!card) return;
    var slot = card.querySelector('.seal-slot');
    if (!slot) return;
    slot.innerHTML = window.ART ? ART.waxSeal() : '';
    slot.className = 'seal-slot r-ok ' + (calmMode ? 'seal-fade' : 'seal-slam');
  }

  // #2 SEAL THE DEAL KAPOW. opts: {card, btn, don, confetti:boolean}
  effects.seal = {
    big: true,
    run: function (o) {
      var c = center(o.btn);
      stampCard(o.card, false);
      shake(8, 6);
      if (window.ART) sticker(ART.burst('BADA-BOOM!'), c.x, c.y - 40, { w: 210, cls: 'fx-pop', ms: 1200 });
      if (o.confetti !== false) {
        engine.spawn(60, {
          x: c.x, y: c.y, spread: 40, colors: [COL.gravy, COL.kapow, COL.yolk, COL.white],
          shapes: ['rect', 'rect', 'circle'], speed: [380, 950], angle: [-Math.PI * 0.92, -Math.PI * 0.08],
          g: 900, life: [0.9, 1.3], size: [6, 12], drag: 0.6
        });
      }
      if (o.don) once(o.don, 'don-kiss', 800);
    },
    reduced: function (o) {
      var c = center(o.btn);
      stampCard(o.card, true);
      if (o.card) once(o.card, 'hl-ring', 3000);
      if (window.ART) sticker(ART.burst('BADA-BOOM!'), c.x, c.y - 40, { w: 190, cls: 'fx-static', ms: 1000 });
    }
  };

  // #5 Category smack. opts: {el, word}
  effects.smack = {
    big: false,
    run: function (o) {
      if (!o.el) return;
      once(o.el, 'fx-squash', 420);
      var c = center(o.el);
      if (o.word) floatWord(o.word, c.x, c.top - 6, { cls: 'fx-rise', ms: 700 });
    },
    reduced: function (o) {
      if (!o.el) return;
      once(o.el, 'fx-flash', 400);
      var c = center(o.el);
      if (o.word) floatWord(o.word, c.x, c.top - 14, { cls: 'fx-static', ms: 900 });
    }
  };

  var SPLASH_WORDS = ['KA-POW-TATO!', 'YAM!', "STUFF'D!", 'GRAVY TRAIN!', 'CAPISCE!', 'BADA-BING!'];

  // #13 Gravy splash. opts: {x, y}. Reduced: nothing.
  effects.splash = {
    big: false,
    run: function (o) {
      var x = o.x, y = o.y;
      var variant = Math.random() < 0.3 ? 'cranberry' : 'gravy';
      if (window.ART) sticker(ART.splat(variant), x, y, { w: 90, h: 98, cls: 'fx-splat', ms: 800 });
      engine.spawn(12, {
        x: x, y: y, colors: variant === 'cranberry' ? [COL.kapow, COL.kapow, COL.gravy] : [COL.gravy, COL.gravy, '#9b5a2b'],
        shapes: ['circle'], speed: [160, 440], angle: [-Math.PI, 0], g: 1100, life: [0.5, 0.8], size: [4, 8]
      });
      floatWord(pick(SPLASH_WORDS), x, y - 56, { cls: 'fx-rise', ms: 800 });
    },
    reduced: function () { }
  };

  // #14 Error fizzle. opts: {el} or {x, y}
  effects.fizzle = {
    big: false,
    run: function (o) {
      var c = o.el ? center(o.el) : { x: o.x || window.innerWidth / 2, y: o.y || window.innerHeight / 2 };
      if (!o.el || !inView(o.el)) c = o.x != null ? { x: o.x, y: o.y } : { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
      if (window.ART) sticker(ART.burst('pfffbbt', { rotate: 6 }), c.x, c.y, { w: 160, cls: 'fx-deflate', ms: 850 });
    },
    reduced: function (o) {
      var c = o.el && inView(o.el) ? center(o.el) : { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
      if (window.ART) sticker(ART.burst('pfffbbt', { rotate: 6 }), c.x, c.y, { w: 110, cls: 'fx-static fx-deflated', ms: 900 });
    }
  };

  // ---------------------------------------------------------------- builder 2: helpers
  // All DOM motion below is transform + opacity via the Web Animations API. Text is textContent only.

  function anim(el, frames, opt) {
    if (!el || !el.animate) return null;
    try { return el.animate(frames, opt); } catch (e) { return null; }
  }
  function kill(el, ms) {
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, ms);
  }
  var BIDI = /[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩]/g;
  function safe(s, n) {
    var a = Array.from(String(s == null ? '' : s).replace(BIDI, ' ').replace(/\s+/g, ' ').trim());
    return a.length > n ? a.slice(0, n - 1).join('').trim() + '…' : a.join('');
  }
  /** Absolutely placed box in the fx layer; x,y = top-left in viewport px. */
  function box(cls, x, y, w, h) {
    var L = layer();
    if (!L) return null;
    var d = document.createElement('div');
    d.className = cls;
    d.style.left = Math.round(x) + 'px';
    d.style.top = Math.round(y) + 'px';
    if (w != null) d.style.width = Math.round(w) + 'px';
    if (h != null) d.style.height = Math.round(h) + 'px';
    L.appendChild(d);
    return d;
  }
  /** A fresh Don (no ids) inside el; opts.shades shows the shades. */
  function donInto(el, o) {
    if (!el || !window.ART) return el;
    el.innerHTML = ART.don(); // static art markup only
    if (o && o.shades) { var s = el.querySelector('.don-shades'); if (s) s.removeAttribute('display'); }
    return el;
  }
  /** Caption centered on x,y (outer holds the centering transform, inner is animated). */
  function caption(text, x, y, o) {
    o = o || {};
    var outer = box('fx-cap' + (o.cls ? ' ' + o.cls : ''), x, y);
    if (!outer) return null;
    var inner = document.createElement('span');
    inner.className = 'fx-cap-in';
    inner.textContent = safe(text, o.max || 60);
    outer.appendChild(inner);
    var half = Math.min(outer.offsetWidth || 0, window.innerWidth - 16) / 2;
    outer.style.left = Math.round(Math.max(half + 8, Math.min(window.innerWidth - half - 8, x))) + 'px';
    kill(outer, o.ms || 1000);
    return inner;
  }
  function popIn(el, ms) {
    return anim(el, [
      { transform: 'scale(.2) rotate(-18deg)', opacity: 0 },
      { transform: 'scale(1.15) rotate(5deg)', opacity: 1, offset: 0.3 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1, offset: 0.5 },
      { transform: 'scale(1)', opacity: 1, offset: 0.82 },
      { transform: 'scale(1.06)', opacity: 0 }
    ], { duration: ms, easing: 'ease-out', fill: 'forwards' });
  }
  function burstAt(word, x, y, w, ms, o) {
    if (!window.ART) return null;
    var s = sticker(ART.burst(word, o), x, y, { w: w, cls: 'fx-b2', ms: ms + 30 });
    popIn(s, ms);
    return s;
  }
  function vw() { return window.innerWidth; }
  function vh() { return window.innerHeight; }
  function clampY(y, pad) { pad = pad || 60; return Math.max(pad, Math.min(vh() - pad, y)); }
  function part(root, name) { return root ? root.querySelector('.' + name) : null; }
  function setAttr(el, k, v, ms) {
    if (!el) return;
    var old = el.getAttribute(k);
    if (v == null) el.removeAttribute(k); else el.setAttribute(k, v);
    if (ms) setTimeout(function () { if (old == null) el.removeAttribute(k); else el.setAttribute(k, old); }, ms);
  }

  /** Slide-in Don peeking from the bottom-right edge (used when the hero Don is off-screen). */
  function donPeek(ms, o) {
    o = o || {};
    var w = 96, h = 106;
    var d = box('fx-peek', vw() - w - 6, vh() - h - 4, w, h);
    if (!d) return null;
    donInto(d, o);
    if (!o.still) {
      anim(d, [
        { transform: 'translateY(110%)' }, { transform: 'translateY(0)', offset: 0.18 },
        { transform: 'translateY(0)', offset: 0.85 }, { transform: 'translateY(110%)' }
      ], { duration: ms, easing: 'ease-out', fill: 'forwards' });
    }
    kill(d, ms + 20);
    return d;
  }

  // ---------------------------------------------------------------- #1 Hero slam (0.8s, 0 particles)
  function shine(logo, delay, dur) {
    if (!logo || !logo.animate) return;
    setTimeout(function () {
      var w = logo.clientWidth;
      if (!w || !inView(logo)) return;
      var bw = Math.max(48, Math.round(w * 0.3));
      var win = document.createElement('span');
      win.className = 'fx-shine';
      win.setAttribute('aria-hidden', 'true');
      win.style.width = bw + 'px';
      var txt = document.createElement('span');
      txt.className = 'fx-shine-txt';
      txt.textContent = 'FRANSGIVIN';
      txt.style.width = w + 'px';
      win.appendChild(txt);
      logo.appendChild(win);
      var opt = { duration: dur, easing: 'ease-in-out', fill: 'forwards' };
      anim(win, [{ transform: 'translateX(' + (-bw) + 'px)' }, { transform: 'translateX(' + w + 'px)' }], opt);
      anim(txt, [{ transform: 'translateX(' + bw + 'px)' }, { transform: 'translateX(' + (-w) + 'px)' }], opt);
      kill(win, dur + 30);
    }, delay);
  }

  effects.hero = {
    big: false,
    run: function (o) {
      if (!o.hero) return;
      anim(o.hero, [
        { transform: 'translateY(-40px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1, offset: 0.38 },
        { transform: 'translate(6px,2px)', offset: 0.5 },
        { transform: 'translate(-5px,-1px)', offset: 0.62 },
        { transform: 'translate(2px,0)', offset: 0.75 },
        { transform: 'none', opacity: 1 }
      ], { duration: 800, easing: 'ease-out' });
      shine(o.logo, 300, 480);
      setTimeout(function () {
        if (!inView(o.hero)) return;
        var l = center(o.logo || o.hero);
        burstAt('THWACK!', l.x + (l.w || 200) * 0.34, Math.max(64, l.top - 4), 118, 500);
      }, 300);
    },
    reduced: function (o) {
      if (o.hero) anim(o.hero, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
    }
  };

  // ---------------------------------------------------------------- #3 Cool Turkey Doesn't Look At Explosions (2.0s, 80)
  var CAP_COOL = 'UNFINISHED BUSINESS: FINISHED';
  function heroShades(don, ms) { setAttr(part(don, 'don-shades'), 'display', null, ms); }

  effects.fill = {
    big: true,
    run: function (o) {
      stampCard(o.card, false);
      heroShades(o.don, 2000);
      var W = vw(), H = vh();
      var bx = W / 2, by = Math.max(150, H - 230);
      var bw = Math.min(W * 0.95, 380);
      if (window.ART) {
        var b = sticker(ART.burst('', { rotate: 0 }), bx, by, { w: bw, cls: 'fx-b2', ms: 2000 });
        anim(b, [
          { transform: 'scale(.08) rotate(-20deg)', opacity: 0 },
          { transform: 'scale(.6) rotate(-6deg)', opacity: 1, offset: 0.15 },
          { transform: 'scale(1.05) rotate(4deg)', opacity: 1, offset: 0.5 },
          { transform: 'scale(1.12) rotate(8deg)', opacity: 1, offset: 0.82 },
          { transform: 'scale(1.18) rotate(10deg)', opacity: 0 }
        ], { duration: 2000, easing: 'ease-out', fill: 'forwards' });
      }
      setTimeout(function () {
        engine.spawn(80, {
          x: bx, y: by, spread: 30, colors: [COL.kapow, COL.pumpkin, COL.yolk, COL.white],
          shapes: ['circle', 'rect'], speed: [260, 820], angle: [0, Math.PI * 2], g: 520,
          life: [0.8, 1.4], size: [5, 11], drag: 0.8
        });
      }, 180);
      var cap = caption(CAP_COOL, bx, by, { ms: 1900 });
      anim(cap, [
        { transform: 'scale(.4) rotate(-4deg)', opacity: 0 },
        { transform: 'scale(1.08) rotate(-3deg)', opacity: 1, offset: 0.12 },
        { transform: 'scale(1) rotate(-3deg)', opacity: 1, offset: 0.2 },
        { transform: 'scale(1) rotate(-3deg)', opacity: 1, offset: 0.85 },
        { transform: 'scale(1) rotate(-3deg)', opacity: 0 }
      ], { duration: 1900, fill: 'forwards' });
      var strut = box('fx-strut', 0, 0);
      if (!strut) return;
      var bob = document.createElement('div');
      bob.className = 'fx-strut-bob';
      strut.appendChild(bob);
      donInto(bob, { shades: true });
      anim(strut, [{ transform: 'translateX(-150px)' }, { transform: 'translateX(' + (W + 20) + 'px)' }],
        { duration: 2000, easing: 'linear', fill: 'forwards' });
      anim(bob, [
        { transform: 'translateY(0) rotate(-3deg)' }, { transform: 'translateY(-9px) rotate(0deg)', offset: 0.5 },
        { transform: 'translateY(0) rotate(3deg)' }
      ], { duration: 400, iterations: 5, direction: 'alternate', easing: 'ease-in-out' });
      kill(strut, 2000);
    },
    reduced: function (o) {
      stampCard(o.card, true);
      if (o.card) once(o.card, 'hl-ring', 1500);
      var d = box('fx-cool', 0, 0);
      if (!d) return;
      var art = document.createElement('span');
      art.className = 'fx-cool-don';
      donInto(art, { shades: true });
      var t = document.createElement('span');
      t.className = 'fx-cap-in';
      t.textContent = CAP_COOL;
      d.appendChild(art);
      d.appendChild(t);
      kill(d, 1500);
    }
  };

  // ---------------------------------------------------------------- #4 Table Slam (0.9s, 12)
  function wingSlam(root) {
    var wl = part(root, 'don-wing-l'), wr = part(root, 'don-wing-r');
    var opt = { duration: 520, easing: 'ease-in' };
    if (wl) { wl.style.transformOrigin = '54px 118px'; anim(wl, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(115deg)', offset: 0.45 }, { transform: 'rotate(-12deg)', offset: 0.62 }, { transform: 'rotate(0deg)' }], opt); }
    if (wr) { wr.style.transformOrigin = '146px 118px'; anim(wr, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-115deg)', offset: 0.45 }, { transform: 'rotate(12deg)', offset: 0.62 }, { transform: 'rotate(0deg)' }], opt); }
  }

  function fieldSpot(field) {
    if (field && inView(field)) {
      var r = field.getBoundingClientRect();
      return { x: r.right - 10, y: r.top - 12, top: r.top, cx: r.left + r.width / 2 };
    }
    return { x: vw() - 40, y: vh() * 0.5, top: vh() * 0.5, cx: vw() / 2 };
  }

  effects.slam = {
    big: true,
    run: function (o) {
      var donEl = o.don && inView(o.don) ? o.don : null;
      var root = donEl || donPeek(900);
      setTimeout(function () { wingSlam(root); }, donEl ? 0 : 140);
      var cards = (o.rows || []).filter(inView).slice(0, 14);
      cards.forEach(function (c, i) {
        anim(c, [{ transform: 'none' }, { transform: 'translateY(-10px)', offset: 0.4 }, { transform: 'none' }],
          { duration: 240, delay: 200 + i * 30, easing: 'ease-out' });
      });
      (o.matches || []).forEach(function (m) { once(m, 'hl-ring', 900); });
      setTimeout(function () { shake(5, 5); }, 250);
      var f = fieldSpot(o.field);
      setTimeout(function () {
        if (window.ART) sticker(ART.splat(Math.random() < 0.3 ? 'cranberry' : 'gravy'), f.x, f.y, { w: 52, h: 57, cls: 'fx-splat', ms: 640 });
        engine.spawn(12, {
          x: f.x, y: f.y, colors: [COL.gravy, COL.gravy, '#9b5a2b'], shapes: ['circle'],
          speed: [140, 380], angle: [-Math.PI, 0], g: 1100, life: [0.4, 0.7], size: [4, 7]
        });
      }, 250);
      setTimeout(function () { burstAt('WHAM!', f.cx, clampY(f.top - 70, 80), 150, 620); }, 230);
    },
    reduced: function (o) {
      var lids = part(o.don, 'don-lids');
      setAttr(lids, 'transform', 'translate(0 3.5)', 1500);
      var f = fieldSpot(o.field);
      if (window.ART) sticker(ART.burst('WHAM!'), f.cx, clampY(f.top - 70, 80), { w: 130, cls: 'fx-static', ms: 1000 });
    }
  };

  // ---------------------------------------------------------------- #6 Poster YOINK (0.5s)
  effects.yoink = {
    big: false,
    run: function (o) {
      var el = o.el;
      if (!el || !inView(el)) return;
      var r = el.getBoundingClientRect();
      var c = el.cloneNode(true); // static poster labels only (spec WANTED list), never user data
      c.removeAttribute('id');
      c.setAttribute('tabindex', '-1');
      c.classList.add('fx-yoink');
      c.style.left = r.left + 'px';
      c.style.top = r.top + 'px';
      c.style.width = r.width + 'px';
      c.style.height = r.height + 'px';
      var L = layer();
      if (!L) return;
      L.appendChild(c);
      var form = document.getElementById('ritual');
      var tr = form ? form.getBoundingClientRect() : null;
      var tx = (tr ? tr.left + tr.width / 2 : vw() / 2) - (r.left + r.width / 2);
      var ty = clampY(tr ? tr.top + 60 : vh() - 60, 40) - (r.top + r.height / 2);
      anim(c, [
        { transform: 'none', opacity: 1 },
        { transform: 'rotate(-12deg) skewX(-8deg) scale(1.04)', opacity: 1, offset: 0.3 },
        { transform: 'translate(' + (tx * 0.5) + 'px,' + (ty * 0.5 - 40) + 'px) rotate(-30deg) skewX(-6deg) scale(.7)', opacity: 0.9, offset: 0.65 },
        { transform: 'translate(' + tx + 'px,' + ty + 'px) rotate(-50deg) scale(.25)', opacity: 0 }
      ], { duration: 500, easing: 'ease-in', fill: 'forwards' });
      kill(c, 520);
      anim(el, [{ opacity: 0.35 }, { opacity: 0.35, offset: 0.6 }, { opacity: 1 }], { duration: 500 });
      floatWord('YOINK!', r.left + r.width / 2, r.top - 4, { cls: 'fx-rise', ms: 700 });
    },
    reduced: function () {
      var f = document.getElementById('ritual');
      if (f) once(f, 'yoinked', 1500);
    }
  };

  // ---------------------------------------------------------------- #7 Turkey Cannonball (1.5s, 20)
  effects.cannonball = {
    big: true,
    run: function (o) {
      var don = o.don;
      if (!don) return;
      var r = don.getBoundingClientRect();
      if (!r.width) return;
      var fly = box('fx-don-fly', r.left, r.top, r.width, r.height);
      if (!fly) return;
      donInto(fly);
      don.style.opacity = '0';
      var tr = o.table ? o.table.getBoundingClientRect() : null;
      var lx = vw() * 0.38, ly = clampY(tr ? tr.top + 70 : vh() - 120, 110);
      if (ly < r.top + 60) ly = clampY(r.top + 140, 110);
      var dx = lx - (r.left + r.width / 2), dy = ly - (r.top + r.height / 2);
      var peak = -Math.min(170, Math.max(90, r.top - 20));
      var frames = [{ transform: 'translate(0,0) rotate(0deg) scale(1)', offset: 0 },
        { transform: 'translate(0,8px) rotate(-20deg) scale(.82,.7)', offset: 0.12 }];
      for (var i = 1; i <= 6; i++) {
        var t = i / 6;
        var x = dx * t, y = dy * t + peak * 4 * t * (1 - t);
        frames.push({ transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + Math.round(720 * t) + 'deg) scale(.78)', offset: 0.12 + 0.6 * t });
      }
      frames.push({ transform: 'translate(' + dx.toFixed(1) + 'px,' + (dy + 6).toFixed(1) + 'px) rotate(720deg) scale(1.1,.7)', offset: 0.8 });
      frames.push({ transform: 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) rotate(720deg) scale(1)', opacity: 0 });
      anim(fly, frames, { duration: 1500, easing: 'linear', fill: 'forwards' });
      kill(fly, 1500);
      setTimeout(function () {
        shake(7, 6);
        burstAt('BOOM-GOBBLE!', lx, clampY(ly - 50, 80), 190, 560);
        engine.spawn(20, {
          x: lx, y: ly, spread: 20, colors: [COL.pumpkin, COL.yolk, COL.kapow, COL.gravy],
          shapes: ['feather'], speed: [180, 520], angle: [-Math.PI, 0], g: 260, life: [0.9, 1.3], size: [7, 12], spin: [-5, 5], drag: 1.2
        });
      }, 1080);
      setTimeout(function () {
        don.style.opacity = '';
        anim(don, [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 250, easing: 'ease-out' });
      }, 1250);
    },
    reduced: function () {
      var d = box('fx-sign-wrap', 0, 0);
      if (!d) return;
      var art = document.createElement('span');
      art.className = 'fx-sign-don';
      donInto(art);
      var sign = document.createElement('span');
      sign.className = 'fx-sign';
      sign.textContent = 'CANNONBALL (IMAGINE IT)';
      d.appendChild(art);
      d.appendChild(sign);
      kill(d, 1600);
    }
  };

  // ---------------------------------------------------------------- #8 Don poke roulette (0.6-1s)
  var pokeLast = -1, pokeAnims = [], pokeTimers = [];
  function pokeReset(don) {
    pokeAnims.forEach(function (a) { try { a.cancel(); } catch (e) { /* ignore */ } });
    pokeTimers.forEach(clearTimeout);
    pokeAnims = []; pokeTimers = [];
    setAttr(part(don, 'don-shades'), 'display', 'none');
    setAttr(part(don, 'don-napkin'), 'display', 'none');
  }
  function pa(el, frames, opt) { var a = anim(el, frames, opt); if (a) pokeAnims.push(a); return a; }
  function pt(fn, ms) { pokeTimers.push(setTimeout(fn, ms)); }

  var STUNTS = [
    function hatTip(d) {
      var hat = part(d, 'don-hat');
      if (!hat) return;
      hat.style.transformOrigin = '74px 40px';
      pa(hat, [{ transform: 'none' }, { transform: 'translate(-4px,-10px) rotate(-24deg)', offset: 0.35 }, { transform: 'translate(-4px,-10px) rotate(-24deg)', offset: 0.65 }, { transform: 'none' }], { duration: 700, easing: 'ease-in-out' });
    },
    function hatSpin(d) {
      var hat = part(d, 'don-hat');
      if (!hat) return;
      hat.style.transformOrigin = '100px 30px';
      pa(hat, [{ transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(-26px) rotate(360deg)', offset: 0.55 }, { transform: 'translateY(0) rotate(720deg)' }], { duration: 800, easing: 'ease-in-out' });
    },
    function faint(d) {
      var art = d.querySelector('.don-art') || d;
      art.style.transformOrigin = '50% 95%';
      pa(art, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(90deg) translateY(-6px)', offset: 0.3 }, { transform: 'rotate(86deg)', offset: 0.75 }, { transform: 'rotate(0deg)' }], { duration: 1000, easing: 'ease-in-out' });
    },
    function shadesDrop(d) {
      var s = part(d, 'don-shades');
      if (!s) return;
      s.removeAttribute('display');
      pa(s, [{ transform: 'translateY(-34px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: 0.3 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 950, easing: 'ease-out' });
      pt(function () { s.setAttribute('display', 'none'); }, 950);
    },
    function sob(d) {
      var n = part(d, 'don-napkin'), head = part(d, 'don-head');
      if (n) n.removeAttribute('display');
      if (head) pa(head, [{ transform: 'none' }, { transform: 'translateY(3px) rotate(-3deg)' }, { transform: 'translateY(1px) rotate(3deg)' }, { transform: 'translateY(3px) rotate(-3deg)' }, { transform: 'translateY(1px) rotate(3deg)' }, { transform: 'none' }], { duration: 900 });
      pt(function () { if (n) n.setAttribute('display', 'none'); }, 900);
    },
    function tailPuff(d) {
      var t = part(d, 'don-tail');
      if (!t) return;
      t.style.transformOrigin = '100px 120px';
      pa(t, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: 0.3 }, { transform: 'scale(1.3)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 650, easing: 'ease-out' });
    }
  ];

  effects.poke = {
    big: false,
    run: function (o) {
      var d = o.don;
      if (!d) return;
      pokeReset(d);
      var i;
      do { i = Math.floor(Math.random() * STUNTS.length); } while (i === pokeLast && STUNTS.length > 1);
      pokeLast = i;
      STUNTS[i](d);
    },
    reduced: function () { /* bubble only (core sets it) */ }
  };

  // ---------------------------------------------------------------- #9 Ham Slow-Mo (1.4s, 0)
  var HAM_LINE = 'HAM WOULD BE COOL';
  effects.hamslow = {
    big: false,
    run: function (o) {
      var art = o.art || (o.el && o.el.querySelector('.ham-art'));
      if (art && art._spin) { try { art._spin.cancel(); } catch (e) { /* ignore */ } }
      if (art) {
        art._spin = anim(art, [
          { transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(400deg) scale(1.45)', offset: 0.35 },
          { transform: 'rotate(720deg) scale(1)' }
        ], { duration: 1400, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
      var c = center(art || o.el);
      for (var i = 0; i < 3; i++) {
        var f = box('fx-flare', c.x - 30, c.y - 30, 60, 60);
        anim(f, [{ transform: 'scale(.2)', opacity: 0.95 }, { transform: 'scale(' + (1.8 + i * 0.7) + ')', opacity: 0 }],
          { duration: 900, delay: i * 160, easing: 'ease-out', fill: 'both' });
        kill(f, 900 + i * 160 + 40);
      }
      var cap = caption(HAM_LINE, vw() / 2, clampY(c.y - 58, 50), { cls: 'fx-cap-word', ms: 1400 });
      anim(cap, [
        { transform: 'translateY(10px) scale(.7)', opacity: 0 }, { transform: 'translateY(0) scale(1.05)', opacity: 1, offset: 0.2 },
        { transform: 'translateY(-6px) scale(1)', opacity: 1, offset: 0.8 }, { transform: 'translateY(-14px) scale(1)', opacity: 0 }
      ], { duration: 1400, easing: 'ease-out', fill: 'forwards' });
    },
    reduced: function (o) {
      var c = center(o.art || o.el);
      caption(HAM_LINE, vw() / 2, clampY(c.y - 58, 50), { cls: 'fx-cap-word', ms: 1400 });
    }
  };

  // ---------------------------------------------------------------- #10 Cork pop (1.2s, 40)
  effects.cork = {
    big: false,
    run: function (o) {
      var c = center(o.btn);
      var x = c.x + (c.w || 200) * 0.28, y = c.top != null ? c.top : c.y;
      engine.spawn(1, { x: x, y: y, shapes: ['cork'], colors: ['#C8A36A'], speed: [760, 820], angle: [-Math.PI * 0.6, -Math.PI * 0.55], g: 1500, life: [1.1, 1.2], size: [9, 9], spin: [10, 14], drag: 0.1 });
      engine.spawn(39, {
        x: x, y: y, spread: 26, colors: [COL.white, COL.cream, COL.yolk], shapes: ['bubble'],
        speed: [50, 220], angle: [-Math.PI * 0.85, -Math.PI * 0.15], g: -280, life: [0.7, 1.2], size: [3, 8], spin: [0, 0], drag: 1.5
      });
      floatWord('POP!', x, y - 70, { cls: 'fx-rise', ms: 700 });
    },
    reduced: function (o) {
      var c = center(o.btn);
      floatWord('POP!', c.x + (c.w || 200) * 0.28, (c.top != null ? c.top : c.y) - 50, { cls: 'fx-static', ms: 1000 });
    }
  };

  // ---------------------------------------------------------------- #11 Broom sweep (0.9s, 15)
  effects.sweep = {
    big: false,
    run: function (o) {
      var li = o.el;
      if (!li) return;
      var r = li.getBoundingClientRect();
      var vis = inView(li);
      var a = anim(li, [
        { transform: 'none', opacity: 1 }, { transform: 'translateX(-6px)', opacity: 1, offset: 0.35 },
        { transform: 'translateX(110%) rotate(2deg)', opacity: 0 }
      ], { duration: 900, easing: 'ease-in' });
      if (a) {
        a.onfinish = function () {
          if (li.classList.contains('leaving')) { li.style.opacity = '0'; li.style.transform = 'translateX(110%)'; }
        };
        var iv = setInterval(function () {
          if (!li.classList.contains('leaving')) { clearInterval(iv); try { a.cancel(); } catch (e) { /* ignore */ } }
        }, 100);
        setTimeout(function () { clearInterval(iv); }, 950);
      }
      if (!vis || !window.ART) return;
      var bh = Math.max(64, Math.min(96, r.height * 1.6)), bw = bh / 2;
      var b = box('fx-broom', -bw - 10, r.top + r.height / 2 - bh * 0.75, bw, bh);
      if (!b) return;
      b.innerHTML = ART.broom(); // static art markup
      anim(b, [
        { transform: 'translateX(0) rotate(-35deg)' },
        { transform: 'translateX(' + (r.left + 30) + 'px) rotate(-55deg)', offset: 0.35 },
        { transform: 'translateX(' + (r.left + r.width * 0.6) + 'px) rotate(-20deg)', offset: 0.7 },
        { transform: 'translateX(' + (vw() + 40) + 'px) rotate(-40deg)', opacity: 0.8 }
      ], { duration: 900, easing: 'ease-in-out', fill: 'forwards' });
      kill(b, 920);
      setTimeout(function () {
        engine.spawn(15, {
          x: Math.min(vw() - 20, r.left + r.width * 0.75), y: r.top + r.height * 0.7, spread: 30,
          colors: ['#cbbfa8', '#e6dcc6', '#a89c86'], shapes: ['circle'], speed: [40, 170],
          angle: [-Math.PI, 0], g: -40, life: [0.5, 0.8], size: [7, 14], drag: 2.5
        });
      }, 380);
    },
    reduced: function () { /* core fades the card out */ }
  };

  // ---------------------------------------------------------------- #12 Breaking News (capped 2s, 8)
  var tickerEl = null;
  function ticker(o, slide) {
    var L = layer();
    if (!L) return;
    if (tickerEl && tickerEl.parentNode) tickerEl.parentNode.removeChild(tickerEl);
    var text = safe(o.text || '', 140);
    var t = document.createElement('div');
    t.className = 'fx-ticker';
    var m = /^BREAKING:\s*/.exec(text);
    if (m) {
      var lab = document.createElement('span');
      lab.className = 'fx-ticker-lab';
      lab.textContent = 'BREAKING:';
      t.appendChild(lab);
      t.appendChild(document.createTextNode(' ' + text.slice(m[0].length)));
    } else {
      t.textContent = text;
    }
    L.appendChild(t);
    tickerEl = t;
    kill(t, 2000);
    if (slide) {
      anim(t, [
        { transform: 'translateY(-110%)' }, { transform: 'translateY(0)', offset: 0.13 },
        { transform: 'translateY(0)', offset: 0.87 }, { transform: 'translateY(-110%)' }
      ], { duration: 2000, easing: 'ease-out', fill: 'forwards' });
    }
    return t;
  }

  effects.ticker = {
    big: false,
    run: function (o) {
      var t = ticker(o, true);
      if (!t) return;
      setTimeout(function () {
        engine.spawn(8, {
          x: vw() * 0.85, y: 46, spread: 40, colors: [COL.yolk, COL.cream, COL.white], shapes: ['rect'],
          speed: [60, 200], angle: [Math.PI * 0.2, Math.PI * 0.8], g: 700, life: [0.6, 0.9], size: [6, 10]
        });
      }, 260);
    },
    reduced: function (o) { ticker(o, false); }
  };

  // ---------------------------------------------------------------- Don blink: an opacity swap every 6s, off in reduced mode
  var blinkT = 0;
  function startBlink() {
    clearTimeout(blinkT);
    blinkT = setTimeout(function step() {
      if (!reduced() && !document.hidden) {
        var b = document.querySelector('#donBtn .don-blink');
        if (b) { b.setAttribute('opacity', '1'); setTimeout(function () { b.setAttribute('opacity', '0'); }, 140); }
      }
      blinkT = setTimeout(step, 6000);
    }, 6000);
  }

  function init() {
    engine.init(document.getElementById('fx'));
    if (mq) {
      if (mq.addEventListener) mq.addEventListener('change', applyMode);
      else if (mq.addListener) mq.addListener(applyMode);
    }
    applyMode();
    startBlink();
  }

  return {
    init: init, reduced: reduced, setCalm: setCalm, onChange: onChange,
    effects: effects, play: play, engine: engine, COLORS: COL,
    util: { layer: layer, center: center, inView: inView, sticker: sticker, floatWord: floatWord, once: once, shake: shake, rnd: rnd, pick: pick, stampCard: stampCard }
  };
})();
