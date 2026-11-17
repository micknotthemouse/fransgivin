const ENDPOINT = ""; /* @@ENDPOINT@@ */
/* FRANSGIVIN core: data, API adapter, rendering, form, dedupe UI, take-back. Depends on DEDUPE, ART, FX, SND. */
(function () {
  'use strict';

  // ------------------------------------------------------------------ copy (spec §10, verbatim)
  const CATS = [
    { id: 'Main/Ham', label: 'MAIN/HAM', one: 'Main', word: 'HAM-POW!', panel: 'cat-main' },
    { id: 'Sides', label: 'SIDES', one: 'Side', word: 'SPUD!', panel: 'cat-sides' },
    { id: 'Apps', label: 'APPS', one: 'App', word: 'CRUNCH!', panel: 'cat-apps' },
    { id: 'Desserts', label: 'DESSERTS', one: 'Dessert', word: 'SPLAT!', panel: 'cat-desserts' },
    { id: 'Booze', label: 'BOOZE', one: 'Booze', word: 'GLUG-GLUG!', panel: 'cat-booze' },
    { id: 'Other', label: 'OTHER', one: 'Other', word: '¿ZONK?', panel: 'cat-other' }
  ];
  const CAT = {};
  CATS.forEach(function (c) { CAT[c.id] = c; });
  const NOTE_CHIPS = ['VEGAN', 'GLUTEN-FREE', 'NEEDS OVEN', 'NEEDS FRIDGE', 'NUT-FREE'];

  const JOKES = [
    'Leave the ham. Take the stuffing.',
    "I'm gonna make you an offer you can't refuse: seconds.",
    'Keep your friends close and your gravy closer.',
    "It's not personal. It's strictly casserole.",
    'Just when I thought I was full… they pull me back in for pie.',
    "We don't discuss business at the table. We discuss sides.",
    'Look how they marshmallowed my yams.',
    'Someday, and that day may never come, I will ask you to bring ice.',
    "I'm not a turkey. I'm a businessman.",
    'No turkey required. Nobody touches the Don.',
    "Fredo brought napkins. Again. We don't talk about Fredo.",
    'Revenge is a dish best served with whipped cream.',
    'Tonight we settle all Family business. With Tupperware.',
    'Every family has a ham. Ours is literal.',
    'The gravy is a family secret. The secret is a jar.',
    "Take the cannoli. Take the pie. It's Friendsgiving, take everything.",
    'A Don never asks twice. He refreshes every 20 seconds.',
    "Never tell anyone outside the Family what's in the dip.",
    'The family that cleans together stays together. Plz.',
    'Tipsy? The Don understands. Tap slower.',
    "In this house, the sweet potatoes get marshmallows. That's the law.",
    "You talkin' to me? Wrong movie. Bring rolls.",
    'Yippee-ki-yay, mother-gravy.',
    'I spent my whole life trying not to be stuffed. Now look at me.',
    'Ham would be cool. — The Godfather, probably.'
  ];

  const SUCCESS = [
    "It's done. Your {dish} is on the books.",
    'The offer is accepted. Welcome to the Family, {name}.',
    "{dish}? The Don nods slowly. That's respect.",
    'You came to me on the day of my Friendsgiving… and you brought {dish}.',
    "You're officially made. Like a casserole.",
    "Sonny Spuds salutes you. He's crying a little.",
    'The Family remembers this kindness. Forever. Or until dessert.',
    "You filled a WANTED spot. The Don will never forget this. It's a little intense.",
    'Booze? You honor this house. Salute, {name}.',
    'Your name is now in the Book of Food. In pen. Gravy pen.'
  ];

  const DUPES = [
    '{other} already brings {dish}. Two of those in one house? It could get starchy.',
    "That's {other}'s territory. You wanna step on their {dish}?",
    'Somebody already made this offer. Are you starting a casserole feud?',
    "The Family has {dish}. What the Family doesn't have: {gap}.",
    "I'm gonna make you an offer you CAN refuse: bring {gap} instead?",
    'Sonny Spuds is losing his mind. Two {dish} situations.',
    'Never go against the Family. Unless the Family has zero rolls.'
  ];

  // Used when the matching row is the visitor's own pledge ("You" can't take 'brings' or "'s").
  const DUPES_SELF = [
    'You already pledged {dish}. The Don never forgets. Neither does the ledger.',
    "You're already bringing {dish}. Two of your own? That's a lot of faith in {dish}.",
    'This is YOUR territory already. You wanna step on your own {dish}?',
    "The Family has your {dish}. What the Family doesn't have: {gap}."
  ];

  const ERR = [
    "The pigeon got lost. Your dish isn't on the books yet. Nothing lost; tap TRY AGAIN, CAPISCE?",
    "The Family's ledger isn't answering. Omertà. Check your signal and retry.",
    "Couldn't load the Family list. Showing the last one we saw.",
    "You can't leave the Family that easily. (Removing failed. Try again.)"
  ];

  const T = {
    needName: 'Who are you? I need a name for the books.',
    needCat: 'Pick a category first, capisce?',
    another: 'Bring another? Booze is always welcome.',
    sending: 'SENDING TO THE FAMILY…',
    books: 'ON THE BOOKS',
    notSent: 'NOT SENT',
    yours: 'YOURS',
    isNew: 'NEW!',
    phone: 'only on this phone',
    take: '✕ TAKE IT BACK',
    yes: 'SURE? YES',
    no: 'NO',
    retry: 'TRY AGAIN, CAPISCE?',
    discard: 'DISCARD',
    demoBanner: 'DEMO MODE: your offers stay on THIS phone only. Nobody else sees them. The Don is just pretending.',
    offlineBanner: "The Family's ledger is unreachable. New offers are saved on this phone and sent when it reconnects.",
    notLive: 'NOT LIVE YET. Text the host.',
    full: 'The Family has heard enough from you. Limit reached.',
    double: 'Double {dish}. Bold. The Family respects bold.',
    poof: 'POOF. FORGOTTEN.',
    fredo: "Fredo… I mean, friend. It's forgotten.",
    done: "IT'S DONE.",
    back: '{name}. You came back. Your {dish} is on the books.',
    strong: 'Sonny Spuds says: {other} has this already.',
    strongSelf: 'Sonny Spuds says: You already pledged this.',
    softPie: "There's already a pie ({other}). Different pie? Carry on. Pie is never a problem.",
    softBooze: 'Another bottle? The Family approves.',
    pending1: '{n} pledge not sent yet. Tap to resend.',
    pendingN: '{n} pledges not sent yet. Tap to resend.',
    soundOn: 'SOUND: ON (check your silent switch)',
    soundOff: 'SOUND: OFF',
    soundOffSub: 'the Don naps',
    calmOff: 'CALM THE FAMILY',
    calmOn: 'BRING BACK THE CHAOS',
    calmSubOff: 'fewer explosions',
    calmSubOn: 'more explosions',
    seeIt: 'SEE IT',
    defaultPh: "e.g. Grandma's mac n cheese",
    wantedMore: '+{n} MORE WANTED',
    wantedLess: 'SHOW TOP 6 ONLY',
    coveredBy: ' COVERED by {names}',
    hamCovered: 'THE HAM: covered by the Host',
    sealSub: 'add my dish',
    demoSub: 'saved on this phone only',
    ledgerSum: '{n} {offers} on the table · {w} still WANTED',
    breaking1: 'BREAKING: {name} has made an offer: {dish}',
    breakingN: 'BREAKING: {n} new offers',
    hunger: 'THE FAMILY HUNGERS FOR MORE.',
    respect: 'RESPECT.',
    stillWanted: 'Still WANTED:',
    mystery: 'a mystery {one}',
    mysteryShort: 'mystery {one}'
  };

  const K = {
    token: 'fransgivin.token', mine: 'fransgivin.mine', name: 'fransgivin.name', calm: 'fransgivin.calm',
    outbox: 'fransgivin.outbox', cache: 'fransgivin.cache', demo: 'fransgivin.demo'
  };

  const D = DEDUPE;
  const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

  // ------------------------------------------------------------------ utils
  function $(id) { return document.getElementById(id); }
  function h(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function btn(cls, text, data) {
    const b = h('button', cls, text);
    b.type = 'button';
    if (data) Object.keys(data).forEach(function (k) { b.dataset[k] = data[k]; });
    return b;
  }
  function clean(s, n) { return D.clean(s, n); }
  function ellip(s, n) {
    const a = Array.from(String(s == null ? '' : s));
    return a.length > n ? a.slice(0, n - 1).join('').trim() + '…' : a.join('');
  }
  function tpl(str, map) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return Object.prototype.hasOwnProperty.call(map, k) ? String(map[k]) : m; });
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rnd(n) {
    const b = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(b);
    else for (let i = 0; i < n; i++) b[i] = Math.floor(Math.random() * 256);
    return b;
  }
  function randId() {
    let s = '';
    rnd(8).forEach(function (x) { s += (x % 36).toString(36); });
    return s;
  }
  function randHex(n) {
    return Array.from(rnd(n), function (x) { return (x < 16 ? '0' : '') + x.toString(16); }).join('');
  }
  function tsOf(r) { const t = Date.parse(r.createdAt); return isNaN(t) ? 0 : t; }
  function mysteryOf(cat, short) { return tpl(short ? T.mysteryShort : T.mystery, { one: (CAT[cat] || CAT.Other).one }); }
  function behavior() { return FX.reduced() ? 'auto' : 'smooth'; }
  function scrollToEl(el, block) {
    if (!el) return;
    try { el.scrollIntoView({ behavior: behavior(), block: block || 'start' }); } catch (e) { el.scrollIntoView(); }
  }
  function focusNoScroll(el) {
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }
  function deck(arr) {
    let pool = [], last = null;
    return function () {
      if (!pool.length) {
        pool = arr.slice();
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
        }
        if (pool.length > 1 && pool[pool.length - 1] === last) {
          const t = pool[0]; pool[0] = pool[pool.length - 1]; pool[pool.length - 1] = t;
        }
      }
      last = pool.pop();
      return last;
    };
  }
  const nextJoke = deck(JOKES);

  const store = {
    get: function (k, d) {
      try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* webview without storage */ }
    }
  };

  // ------------------------------------------------------------------ mode (A3)
  const qs = new URLSearchParams(location.search);
  const host = location.hostname;
  const LOCALISH = location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1';
  let endpoint = String(ENDPOINT || '').trim();
  if (LOCALISH && qs.get('api') && /^https?:\/\//i.test(qs.get('api'))) endpoint = qs.get('api');
  const DEMO = qs.get('demo') === '1' || (!endpoint && LOCALISH);
  const NOT_LIVE = !DEMO && !endpoint;

  // ------------------------------------------------------------------ state
  function loadToken() {
    let t = store.get(K.token, '');
    if (typeof t !== 'string' || !/^[0-9a-f]{32}$/.test(t)) { t = randHex(16); store.set(K.token, t); }
    return t;
  }
  function loadMine() {
    const m = store.get(K.mine, []);
    return new Set(Array.isArray(m) ? m.filter(function (x) { return typeof x === 'string' && ID_RE.test(x); }) : []);
  }

  const S = {
    rows: new Map(), cards: new Map(), leaving: new Map(), confirming: new Map(),
    mine: loadMine(), token: loadToken(), name: clean(store.get(K.name, ''), 30),
    tomb: new Map(), inflight: new Set(), newIds: new Set(), ack: new Set(),
    outbox: [], cat: '', catAuto: false, notes: new Set(),
    loaded: false, serverSeen: false, rendered: false, fails: 0, offline: false,
    wanted: D.computeWanted([]), index: [], expanded: false, posterSig: '', coveredSig: '',
    sealBusy: false, sealFor: null, greeted: false, fillPlayed: false,
    donTaps: 0, donTimer: 0, waltzed: false, calm: false, typing: false, ritualVisible: false,
    sheetCtx: null, polling: false, pollSoon: false, pollTimer: 0
  };

  function saveMine() { store.set(K.mine, Array.from(S.mine).slice(-200)); }

  // ------------------------------------------------------------------ sanitize (§9)
  function sanitize(r) {
    if (!r || typeof r !== 'object') return null;
    const id = clean(r.id, 40);
    if (!ID_RE.test(id)) return null;
    return {
      id: id,
      name: clean(r.name, 30),
      dish: clean(r.dish, 60),
      category: CAT[r.category] ? r.category : 'Other',
      note: clean(r.note, 60),
      createdAt: clean(r.createdAt, 40)
    };
  }

  // ------------------------------------------------------------------ API adapter
  function apiErr(code) { const e = new Error(code || 'error'); e.code = code || 'error'; return e; }

  async function call(url, init) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
    try {
      const res = await fetch(url, Object.assign({}, init, ctl ? { signal: ctl.signal } : {}));
      const txt = await res.text();
      try { return JSON.parse(txt); } catch (e) { throw apiErr('bad_json'); }
    } catch (e) {
      if (e && e.code && typeof e.code === 'string') throw e;
      throw apiErr(e && e.name === 'AbortError' ? 'timeout' : 'network');
    } finally {
      clearTimeout(timer);
    }
  }

  function post(body) {
    return call(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
  }

  const remoteApi = {
    list: async function () {
      const sep = endpoint.indexOf('?') >= 0 ? '&' : '?';
      const j = await call(endpoint + sep + 'action=list&t=' + Date.now(), { cache: 'no-store' });
      if (!j || j.ok !== true || !Array.isArray(j.dishes)) throw apiErr((j && j.error) || 'bad_list');
      return j.dishes;
    },
    add: async function (row) {
      const j = await post(Object.assign({ action: 'add' }, row));
      if (!j || j.ok !== true) throw apiErr((j && j.error) || 'bad_add');
      return j;
    },
    remove: async function (id, token) {
      const j = await post({ action: 'remove', id: id, token: token });
      if (!j || j.ok !== true) throw apiErr((j && j.error) || 'bad_remove');
      return j;
    }
  };

  let demoMem = null;
  function demoSeed() {
    const t = Date.now();
    return [
      { id: 'sample01', name: 'SAMPLE Sal', dish: 'Stuffing', category: 'Sides', note: '', createdAt: new Date(t - 3 * 36e5).toISOString(), token: '' },
      { id: 'sample02', name: 'SAMPLE Vito', dish: 'Red wine', category: 'Booze', note: '', createdAt: new Date(t - 2 * 36e5).toISOString(), token: '' },
      { id: 'sample03', name: 'SAMPLE Connie', dish: 'Pecan pie', category: 'Desserts', note: '', createdAt: new Date(t - 1 * 36e5).toISOString(), token: '' }
    ];
  }
  function demoLoad() {
    if (demoMem) return demoMem;
    const d = store.get(K.demo, null);
    demoMem = Array.isArray(d) ? d : demoSeed();
    if (!Array.isArray(d)) store.set(K.demo, demoMem);
    return demoMem;
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  const demoApi = {
    list: function () {
      return wait(250).then(function () {
        return demoLoad().filter(function (r) { return !r.removed; }).map(function (r) {
          return { id: r.id, name: r.name, dish: r.dish, category: r.category, note: r.note, createdAt: r.createdAt };
        });
      });
    },
    add: function (row) {
      return wait(350).then(function () {
        const d = demoLoad();
        if (!d.some(function (r) { return r.id === row.id; })) {
          const s = sanitize(row);
          if (!s || !s.name) throw apiErr('missing_fields');
          s.createdAt = new Date().toISOString();
          s.token = row.token;
          d.push(s);
          store.set(K.demo, d);
        }
        return { ok: true };
      });
    },
    remove: function (id, token) {
      return wait(250).then(function () {
        const d = demoLoad();
        const r = d.find(function (x) { return x.id === id; });
        if (r && r.token && r.token !== token) throw apiErr('not_yours');
        if (r) { r.removed = true; store.set(K.demo, d); }
        return { ok: true };
      });
    }
  };

  const api = DEMO ? demoApi : remoteApi;

  // ------------------------------------------------------------------ outbox (never in demo)
  function loadOutbox() {
    if (DEMO) return [];
    const o = store.get(K.outbox, []);
    return Array.isArray(o) ? o.filter(function (p) { return p && typeof p === 'object' && ID_RE.test(String(p.id || '')); }) : [];
  }
  function outboxSave() { if (!DEMO) store.set(K.outbox, S.outbox); }
  function outboxPut(p) {
    if (DEMO) return;
    if (!S.outbox.some(function (x) { return x.id === p.id; })) S.outbox.push(p);
    outboxSave();
  }
  function outboxDel(id) {
    if (DEMO) return;
    const n = S.outbox.length;
    S.outbox = S.outbox.filter(function (x) { return x.id !== id; });
    if (S.outbox.length !== n) outboxSave();
  }

  // ------------------------------------------------------------------ tombstones
  function isTomb(id) {
    const t = S.tomb.get(id);
    if (!t) return false;
    if (t < Date.now()) { S.tomb.delete(id); return false; }
    return true;
  }

  // ------------------------------------------------------------------ merge by id (§9)
  function merge(serverRows, opts) {
    opts = opts || {};
    const ids = new Set();
    const fresh = [];
    const announce = S.serverSeen && !opts.cache;
    serverRows.forEach(function (r) {
      if (!r || ids.has(r.id)) return;
      ids.add(r.id);
      if (isTomb(r.id)) return;
      const cur = S.rows.get(r.id);
      if (!cur) {
        S.rows.set(r.id, Object.assign({}, r, { state: 'confirmed', miss: 0 }));
        if (announce && !S.mine.has(r.id)) fresh.push(r);
      } else {
        const wasLocal = cur.state !== 'confirmed';
        Object.assign(cur, r, { state: 'confirmed', miss: 0 });
        if (wasLocal) { cur.justConfirmed = true; cur.err = ''; outboxDel(r.id); }
      }
    });
    if (!opts.cache) {
      Array.from(S.rows.values()).forEach(function (cur) {
        if (ids.has(cur.id) || cur.state !== 'confirmed') return;
        cur.miss = (cur.miss || 0) + 1;
        if (cur.miss >= 2) S.rows.delete(cur.id);
      });
      S.serverSeen = true;
    }
    S.loaded = true;
    if (fresh.length) {
      fresh.forEach(function (r) {
        S.newIds.add(r.id);
        setTimeout(function () { S.newIds.delete(r.id); render(); }, 10000);
      });
      const f = fresh[0];
      const text = fresh.length === 1
        ? tpl(T.breaking1, { name: ellip(f.name, 24), dish: ellip(f.dish || mysteryOf(f.category), 40) })
        : tpl(T.breakingN, { n: fresh.length });
      FX.play('ticker', {
        text: text, rows: fresh.slice(),
        names: fresh.map(function (r) { return r.name; }),
        dishes: fresh.map(function (r) { return r.dish || mysteryOf(r.category); })
      });
    }
    render();
  }

  // ------------------------------------------------------------------ polling
  function schedulePoll(ms) {
    clearTimeout(S.pollTimer);
    if (NOT_LIVE) return;
    if (S.polling) { if (ms != null && ms < 5000) S.pollSoon = true; return; }
    if (document.hidden) return;
    const delay = ms == null ? 20000 + (Math.random() * 6000 - 3000) : ms;
    S.pollTimer = setTimeout(poll, delay);
  }

  async function poll() {
    if (NOT_LIVE || S.polling) return;
    clearTimeout(S.pollTimer);
    if (document.hidden) return;
    S.polling = true;
    let ok = false, list = null;
    try { list = await api.list(); ok = true; } catch (e) { ok = false; }
    S.polling = false;
    let next = null;
    if (ok) {
      const rows = list.map(sanitize).filter(Boolean);
      if (!DEMO) store.set(K.cache, rows);
      S.fails = 0;
      if (S.offline) goOnline();
      merge(rows);
      flushOutbox();
    } else {
      next = onListFail();
    }
    if (S.pollSoon) { S.pollSoon = false; schedulePoll(2000); }
    else if (next == null) schedulePoll();
  }

  function onListFail() {
    S.fails++;
    if (!S.serverSeen && !S.offline) {
      if (S.fails === 1) { schedulePoll(3000); return 'retry'; }
      goOffline(true);
      return null;
    }
    if (S.fails >= 2) goOffline(false);
    return null;
  }

  function goOffline(initial) {
    if (S.offline) return;
    S.offline = true;
    showBanner('offline');
    if (initial && !S.serverSeen) {
      const cache = DEMO ? null : store.get(K.cache, null);
      const rows = Array.isArray(cache) ? cache.map(sanitize).filter(Boolean) : [];
      if (rows.length) toast(ERR[2], { err: true });
      else toast(ERR[1], { err: true });
      merge(rows, { cache: true });
    }
    S.rows.forEach(function (r) {
      if (r.state === 'pending' && !S.inflight.has(r.id)) { r.state = 'failed'; r.err = ERR[0]; }
    });
    render();
  }

  function goOnline() {
    S.offline = false;
    showBanner(DEMO ? 'demo' : '');
    render();
  }

  async function flushOutbox() {
    if (DEMO || S.offline) return;
    const list = S.outbox.slice();
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (isTomb(p.id)) { outboxDel(p.id); continue; }
      let r = S.rows.get(p.id);
      if (r && r.state === 'confirmed') { outboxDel(p.id); continue; }
      if (!r) {
        const s = sanitize(p);
        if (!s) { outboxDel(p.id); continue; }
        r = Object.assign(s, { state: 'pending', miss: 0, hp: p.hp || '' });
        S.rows.set(r.id, r);
        S.mine.add(r.id);
      }
      await sendRow(p.id, false);
      if (S.offline) break;
    }
  }

  // ------------------------------------------------------------------ send / retry (single-flight per id)
  async function sendRow(id, user, okMsg) {
    const r = S.rows.get(id);
    if (!r || S.inflight.has(id) || NOT_LIVE) return;
    S.inflight.add(id);
    r.state = 'pending';
    r.err = '';
    render();
    const payload = {
      id: r.id, name: r.name, dish: r.dish, category: r.category, note: r.note,
      createdAt: r.createdAt, token: S.token, hp: r.hp || ''
    };
    let ok = false, code = '';
    try { await api.add(payload); ok = true; } catch (e) { code = (e && e.code) || 'error'; }
    S.inflight.delete(id);
    const cur = S.rows.get(id);
    if (ok) {
      outboxDel(id);
      if (cur && cur.state !== 'confirmed') { cur.state = 'confirmed'; cur.justConfirmed = true; }
      schedulePoll(2000);
      if (user && okMsg) toast(okMsg, { action: { label: T.seeIt, fn: function () { seeCard(id); } } });
    } else {
      if (code === 'full') outboxDel(id);
      if (cur && cur.state !== 'confirmed') { cur.state = 'failed'; cur.err = code === 'full' ? T.full : ERR[0]; }
      if (user) {
        toast(code === 'full' ? T.full : ERR[0], { err: true });
        FX.play('fizzle', { el: S.cards.get(id) || $('sealBtn') });
        SND.play('trombone');
      }
    }
    if (S.sealFor === id) unlockSeal();
    render();
  }

  function unlockSeal() {
    S.sealBusy = false;
    S.sealFor = null;
    $('sealBtn').disabled = NOT_LIVE;
  }

  // ------------------------------------------------------------------ rendering
  function rowsArr() { return Array.from(S.rows.values()); }

  function render() {
    const rows = rowsArr();
    S.index = D.buildIndex(rows.concat([D.HOST_HAM]));
    S.wanted = D.computeWanted(rows);
    renderTable(rows);
    renderWanted();
    renderLedger(rows);
    renderPending(rows);
    renderHeroMine(rows);
    updatePlaceholder();
  }

  function renderTable(rows) {
    const ready = S.loaded || NOT_LIVE;
    $('tableLoading').hidden = ready;
    const byCat = {};
    CATS.forEach(function (c) { byCat[c.id] = []; });
    rows.forEach(function (r) { (byCat[r.category] || byCat.Other).push(r); });
    S.cards.forEach(function (li, id) {
      if (!S.rows.has(id) && !S.leaving.has(id)) { li.remove(); S.cards.delete(id); }
    });
    CATS.forEach(function (c) {
      const panel = $(c.panel);
      const ul = panel.querySelector('.cards');
      const list = byCat[c.id].sort(function (a, b) { return (tsOf(a) - tsOf(b)) || (a.id < b.id ? -1 : 1); });
      list.forEach(function (r, i) {
        let li = S.cards.get(r.id);
        if (!li) {
          li = makeCard(r);
          S.cards.set(r.id, li);
          if (S.rendered) FX.util.once(li, 'card-new', 600);
        }
        updateCard(li, r);
        const at = ul.children[i];
        if (at !== li) ul.insertBefore(li, at || null);
      });
      panel.querySelector('.cat-n').textContent = String(list.length);
      const st = panel.querySelector('.cat-status');
      let status = '';
      if (c.id === 'Sides') status = list.length < 3 ? T.hunger : T.respect;
      else if (list.length) status = T.respect;
      st.textContent = status;
      st.classList.toggle('ok', status === T.respect);
      panel.querySelector('.empty').hidden = list.length > 0 || !ready;
    });
    $('tableEmpty').hidden = !ready || rows.length > 0;
    if (ready) S.rendered = true;
  }

  function makeCard(r) {
    const li = h('li', 'card');
    li.dataset.id = r.id;
    li.appendChild(h('div', 'card-line'));
    const err = h('p', 'card-err');
    err.setAttribute('role', 'alert');
    err.hidden = true;
    li.appendChild(err);
    li.appendChild(h('div', 'card-actions'));
    li.appendChild(h('span', 'seal-slot'));
    return li;
  }

  function tag(cls, text) { return h('span', 'tag ' + cls, text); }

  function updateCard(li, r) {
    const mine = S.mine.has(r.id);
    const st = r.state;
    li.classList.toggle('mine', mine);
    li.classList.toggle('pending', st === 'pending');
    li.classList.toggle('failed', st === 'failed');
    li.classList.toggle('has-seal', !!li.querySelector('.seal-slot svg'));
    const isNew = S.newIds.has(r.id);
    const thunk = !!r.justConfirmed;
    const phone = (DEMO && mine) || (st === 'failed' && S.offline);
    const lineSig = [r.dish, r.name, r.note, r.category, mine, st, isNew, phone, thunk].join('|');
    const line = li.querySelector('.card-line');
    if (li._lineSig !== lineSig) {
      li._lineSig = lineSig;
      line.textContent = '';
      if (!r.dish) {
        const ic = h('span', 'mys-ic');
        ic.innerHTML = ART.icon('mystery', 22);
        line.appendChild(ic);
      }
      line.appendChild(h('span', 'dish', r.dish || mysteryOf(r.category)));
      line.appendChild(document.createTextNode(' '));
      line.appendChild(h('span', 'meta', '— ' + (r.name || '?') + (r.note ? ' · ' + r.note : '')));
      if (mine) {
        const y = tag('tag-yours', '');
        y.innerHTML = ART.icon('fedora', 16);
        y.appendChild(document.createTextNode(T.yours));
        line.appendChild(y);
      }
      if (isNew) line.appendChild(tag('tag-new', T.isNew));
      if (st === 'pending') line.appendChild(tag('tag-state', T.sending));
      else if (st === 'failed') line.appendChild(tag('tag-state', T.notSent));
      else if (mine && !DEMO) line.appendChild(tag('tag-books' + (thunk ? ' thunk' : ''), T.books));
      if (phone) line.appendChild(tag('tag-phone', T.phone));
    }
    if (thunk) delete r.justConfirmed;

    const err = li.querySelector('.card-err');
    const errText = st === 'failed' ? (r.err || ERR[0]) : '';
    if (err.textContent !== errText) err.textContent = errText;
    err.hidden = !errText;

    const confirming = S.confirming.has(r.id);
    const inflight = S.inflight.has(r.id);
    const actSig = [mine, st, confirming, inflight].join('|');
    if (li._actSig !== actSig) {
      li._actSig = actSig;
      const acts = li.querySelector('.card-actions');
      acts.textContent = '';
      if (mine && st === 'failed' && !inflight) {
        acts.appendChild(btn('act act-retry', T.retry, { act: 'retry', id: r.id }));
        acts.appendChild(btn('act', T.discard, { act: 'discard', id: r.id }));
      } else if (mine && st === 'confirmed') {
        if (confirming) {
          acts.appendChild(btn('act act-yes', T.yes, { act: 'yes', id: r.id }));
          acts.appendChild(btn('act act-no', T.no, { act: 'no', id: r.id }));
        } else {
          acts.appendChild(btn('act act-take', T.take, { act: 'take', id: r.id }));
        }
      }
      acts.hidden = !acts.firstChild;
    }
  }

  function posterLi(it) {
    const li = h('li');
    const b = btn('poster', null, { idx: String(it.idx) });
    b.appendChild(h('span', 'p-w', 'WANTED'));
    b.appendChild(h('span', 'p-name', it.label));
    if (it.target > 1 && it.count > 0) b.appendChild(h('span', 'p-prog', it.count + '/' + it.target));
    b.appendChild(h('span', 'p-claim', 'CLAIM ›'));
    li.appendChild(b);
    return li;
  }

  function moreSidesLi() {
    const li = h('li');
    const b = btn('poster poster-more', null, { idx: 'more' });
    b.appendChild(h('span', 'p-w', 'WANTED:'));
    b.appendChild(h('span', 'p-name', 'MORE SIDES'));
    b.appendChild(h('span', 'p-reward', 'Reward: eternal respect'));
    b.appendChild(h('span', 'p-claim', 'CLAIM ›'));
    li.appendChild(b);
    return li;
  }

  function namesLine(names) {
    const shown = names.slice(0, 3).map(function (n) { return ellip(n, 18); });
    return shown.join(', ') + (names.length > 3 ? ' +' + (names.length - 3) : '');
  }

  function renderWanted() {
    const W = S.wanted;
    const unfilled = W.unfilled;
    const show = S.expanded ? unfilled : unfilled.slice(0, 6);
    const sig = show.map(function (it) { return it.idx + ':' + it.count; }).join(',') + '|' + S.expanded;
    if (sig !== S.posterSig) {
      S.posterSig = sig;
      const ul = $('posters');
      ul.textContent = '';
      show.forEach(function (it) { ul.appendChild(posterLi(it)); });
      ul.appendChild(moreSidesLi());
    }
    const extra = unfilled.length - 6;
    const mw = $('moreWanted');
    mw.hidden = extra <= 0;
    mw.textContent = S.expanded ? T.wantedLess : tpl(T.wantedMore, { n: extra });
    mw.setAttribute('aria-expanded', String(S.expanded));
    $('allFilled').hidden = unfilled.length > 0;
    const csig = W.filled.map(function (it) { return it.idx + ':' + it.names.join(','); }).join('|');
    if (csig !== S.coveredSig) {
      S.coveredSig = csig;
      const cv = $('covered');
      cv.textContent = '';
      const ham = h('li');
      ham.appendChild(h('span', 'cv-item', T.hamCovered));
      cv.appendChild(ham);
      W.filled.forEach(function (it) {
        const li = h('li');
        li.appendChild(h('s', null, it.label));
        li.appendChild(document.createTextNode(tpl(T.coveredBy, { names: namesLine(it.names) })));
        cv.appendChild(li);
      });
    }
  }

  function renderLedger(rows) {
    const counts = {};
    CATS.forEach(function (c) { counts[c.id] = 0; });
    rows.forEach(function (r) { counts[r.category] = (counts[r.category] || 0) + 1; });
    document.querySelectorAll('.ledger-btn').forEach(function (b) {
      const c = b.dataset.cat;
      const n = b.querySelector('.lg-n');
      if (c === 'Main/Ham') { n.textContent = 'COVERED'; n.classList.remove('need'); return; }
      const v = counts[c] || 0;
      n.textContent = v ? String(v) : '0 NEED';
      n.classList.toggle('need', !v);
    });
    document.querySelectorAll('#cats .cat').forEach(function (b) {
      b.querySelector('.cat-count').textContent = String(counts[b.dataset.cat] || 0);
    });
    $('ledgerSum').textContent = tpl(T.ledgerSum, { n: rows.length, offers: rows.length === 1 ? 'offer' : 'offers', w: S.wanted.unfilled.length });
  }

  function renderPending(rows) {
    const n = rows.filter(function (r) { return S.mine.has(r.id) && r.state === 'failed'; }).length;
    const b = $('pendingNotice');
    b.hidden = !n;
    if (n) b.textContent = tpl(n === 1 ? T.pending1 : T.pendingN, { n: n });
  }

  function ownRows(rows) {
    return rows.filter(function (r) { return S.mine.has(r.id) && r.state !== 'failed'; })
      .sort(function (a, b) { return tsOf(b) - tsOf(a); });
  }

  function renderHeroMine(rows) {
    const own = ownRows(rows);
    $('seeMine').hidden = !(S.loaded && own.length);
    if (!S.greeted && S.loaded) {
      S.greeted = true;
      if (S.name && own.length) {
        say(tpl(T.back, { name: ellip(S.name, 24), dish: ellip(own[0].dish || mysteryOf(own[0].category, true), 40) }));
      }
    }
  }

  function say(text) { $('donBubble').textContent = ellip(text, 140); }

  function setStatus(text) { $('status').textContent = text || ''; }

  function updatePlaceholder() {
    const top = S.cat ? D.topUnfilled(S.wanted, S.cat) : null;
    $('dishIn').placeholder = top ? 'e.g. ' + top.label : T.defaultPh;
  }

  function showBanner(kind) {
    const b = $('banner');
    if (!kind) { b.hidden = true; return; }
    $('bannerText').textContent = kind === 'demo' ? T.demoBanner : kind === 'notlive' ? T.notLive : T.offlineBanner;
    $('bannerRetry').hidden = kind !== 'offline';
    b.dataset.kind = kind;
    b.hidden = false;
  }

  // ------------------------------------------------------------------ toasts
  function toast(msg, o) {
    o = o || {};
    const box = $('toasts');
    const t = h('div', 'toast' + (o.err ? ' toast-err' : ''));
    if (o.err) t.setAttribute('role', 'alert');
    t.appendChild(h('span', 'toast-msg', ellip(msg, 220)));
    let gone = false;
    function dismiss() {
      if (gone) return;
      gone = true;
      t.classList.add('out');
      setTimeout(function () { t.remove(); }, 320);
    }
    if (o.action) {
      const b = btn('toast-act', o.action.label);
      b.addEventListener('click', function () { o.action.fn(); dismiss(); });
      t.appendChild(b);
    }
    box.appendChild(t);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    setTimeout(dismiss, o.ms || (o.action ? 6500 : 3800));
    return t;
  }

  function seeCard(id) {
    const li = S.cards.get(id);
    if (!li) return;
    scrollToEl(li, 'center');
    FX.util.once(li, 'hl-ring', 2200);
  }

  // ------------------------------------------------------------------ form
  function selectCat(id, o) {
    o = o || {};
    S.cat = CAT[id] ? id : '';
    document.querySelectorAll('#cats .cat').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.cat === S.cat));
    });
    $('hamNote').hidden = S.cat !== 'Main/Ham';
    $('cats').classList.remove('need');
    updatePlaceholder();
    if (!o.noStrip) updateStrip();
  }

  function noteStr() {
    return clean(NOTE_CHIPS.filter(function (n) { return S.notes.has(n); }).join(', '), 60);
  }

  function setNotes(list) {
    S.notes = new Set(list.filter(function (n) { return NOTE_CHIPS.indexOf(n) >= 0; }));
    document.querySelectorAll('#notes .chip').forEach(function (c) {
      c.setAttribute('aria-pressed', String(S.notes.has(c.dataset.note)));
    });
  }

  function resetForm() {
    $('dishIn').value = '';
    S.catAuto = false;
    setNotes([]);
    selectCat('', { noStrip: true });
    $('dupStrip').hidden = true;
  }

  function prefill(r) {
    $('nameIn').value = r.name || $('nameIn').value;
    $('dishIn').value = r.dish || '';
    S.catAuto = false;
    setNotes(String(r.note || '').split(/,\s*/));
    selectCat(r.category);
  }

  function otherName(row) {
    if (!row) return '';
    return S.mine.has(row.id) ? 'You' : ellip(row.name || '?', 24);
  }

  function inferCategory() {
    const dish = clean($('dishIn').value, 60);
    const cat = D.categoryFor(D.keyOf(D.normalize(dish)));
    if (cat && (!S.cat || (S.catAuto && cat !== S.cat))) {
      S.catAuto = true;
      selectCat(cat, { noStrip: true });
    }
  }

  function applyItem(it) {
    $('dishIn').value = it.label;
    S.catAuto = false;
    selectCat(it.category);
  }

  function updateStrip() {
    const strip = $('dupStrip');
    const dish = clean($('dishIn').value, 60);
    const sc = D.score(dish, S.cat, S.index);
    strip.textContent = '';
    if (sc.level === 'strong') {
      const ownStrip = sc.matches[0] && S.mine.has(sc.matches[0].id);
      strip.appendChild(h('span', null, ownStrip ? T.strongSelf : tpl(T.strong, { other: otherName(sc.matches[0]) })));
      const items = D.stillNeeded(S.wanted, S.cat || D.categoryFor(sc.key), sc.key, 3);
      if (items.length) {
        const wrap = h('div', 'chips');
        items.forEach(function (it) {
          const b = btn('chip', it.label);
          b.addEventListener('click', function () { applyItem(it); });
          wrap.appendChild(b);
        });
        strip.appendChild(wrap);
      }
    } else if (sc.level === 'soft') {
      strip.appendChild(h('span', null, sc.kind === 'booze' ? T.softBooze : tpl(T.softPie, { other: otherName(sc.matches[0]) })));
    }
    strip.hidden = !sc.level;
    return sc;
  }

  let dishT = 0;
  function onDishInput() {
    clearTimeout(dishT);
    dishT = setTimeout(function () { inferCategory(); updateStrip(); }, 300);
  }

  function onSeal(e) {
    if (e) e.preventDefault();
    if (NOT_LIVE || S.sealBusy) return;
    const nameIn = $('nameIn');
    const name = clean(nameIn.value, 30);
    if (!name) {
      FX.util.once($('sealBtn'), 'wobble', 460);
      setStatus(T.needName);
      focusNoScroll(nameIn);
      scrollToEl(nameIn, 'center');
      return;
    }
    inferCategory(); // a fast submit can beat the 300ms typing debounce
    if (!S.cat) {
      setStatus(T.needCat);
      $('cats').classList.add('need');
      FX.util.once($('cats'), 'pulse', 700);
      return;
    }
    clearTimeout(dishT);
    const fields = { name: name, dish: clean($('dishIn').value, 60), category: S.cat, note: noteStr() };
    const sc = updateStrip();
    if (sc.level === 'strong' && !S.ack.has(sc.norm)) {
      S.ack.add(sc.norm);
      const cards = Array.from(document.querySelectorAll('#catPanels .card'));
      const matchEls = sc.matches.map(function (r) { return S.cards.get(r.id); }).filter(Boolean);
      const played = FX.play('slam', { rows: cards, matches: matchEls, field: $('dishIn'), don: $('donBtn') });
      SND.play('scratch');
      const delay = played && !FX.reduced() ? 700 : 0;
      setTimeout(function () { openSheet(sc, fields); }, delay);
      return;
    }
    submit(fields);
  }

  function successLine(row, fillItem, dbl) {
    let t;
    if (dbl) t = T.double;
    else if (fillItem) t = SUCCESS[7];
    else if (row.category === 'Booze') t = SUCCESS[8];
    else t = pick([0, 1, 2, 3, 4, 5, 6, 9].map(function (i) { return SUCCESS[i]; }));
    return tpl(t, { dish: ellip(row.dish || mysteryOf(row.category, true), 40), name: ellip(row.name, 24) });
  }

  function playSubmitFx(row, card, fillItem) {
    const sealBtn = $('sealBtn');
    const don = $('donBtn');
    say(T.done);
    if (fillItem && !S.fillPlayed) {
      S.fillPlayed = true;
      if (FX.play('fill', { item: fillItem, card: card, btn: sealBtn, don: don })) { SND.play('boom'); return; }
    }
    const booze = row.category === 'Booze';
    FX.play('seal', { card: card, btn: sealBtn, don: don, confetti: !booze });
    SND.play('boom');
    if (booze) {
      FX.play('cork', { btn: sealBtn, card: card });
      SND.play('pop');
    }
  }

  function submit(f, opts) {
    opts = opts || {};
    if (NOT_LIVE || S.sealBusy) return;
    const name = clean(f.name, 30);
    if (!name) return;
    const row = {
      id: randId(), name: name, dish: clean(f.dish, 60),
      category: CAT[f.category] ? f.category : 'Other', note: clean(f.note, 60),
      createdAt: new Date().toISOString()
    };
    const fillItem = D.wouldFill(rowsArr(), row);
    const hp = clean($('hpIn').value, 60);
    S.name = name;
    store.set(K.name, name);
    S.mine.add(row.id);
    saveMine();
    S.rows.set(row.id, Object.assign({}, row, { state: 'pending', miss: 0, hp: hp }));
    outboxPut(Object.assign({}, row, { token: S.token, hp: hp }));
    S.sealBusy = true;
    S.sealFor = row.id;
    $('sealBtn').disabled = true;
    render();
    const card = S.cards.get(row.id);
    if (card) FX.util.once(card, 'fresh', 3000);
    playSubmitFx(row, card, fillItem);
    // The "it's done" toast waits for the server to confirm, so a failed send never claims success.
    const okMsg = successLine(row, fillItem, opts.double);
    resetForm();
    setStatus(T.another);
    sendRow(row.id, true, okMsg);
  }

  // ------------------------------------------------------------------ duplicate sheet
  function sheetFocusables() {
    return Array.from($('sheetBox').querySelectorAll('button, [tabindex="-1"]#sheetTitle')).filter(function (el) { return !el.hidden; });
  }

  function placeSheet() {
    if ($('sheet').hidden) return;
    const vv = window.visualViewport;
    const box = $('sheetBox');
    if (!vv) return;
    const off = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    box.style.bottom = off + 'px';
    box.style.maxHeight = Math.max(240, vv.height - 12) + 'px';
  }

  function openSheet(sc, fields) {
    S.sheetCtx = { sc: sc, fields: fields };
    const items = D.stillNeeded(S.wanted, fields.category, sc.key, 3);
    const gap = items[0] ? items[0].label : 'MORE SIDES';
    const ownMatch = sc.matches[0] && S.mine.has(sc.matches[0].id);
    $('sheetTitle').textContent = tpl(pick(ownMatch ? DUPES_SELF : DUPES), {
      other: otherName(sc.matches[0]), dish: ellip(fields.dish, 40), gap: gap
    });
    const rowsEl = $('sheetRows');
    rowsEl.textContent = '';
    sc.matches.slice(0, 5).forEach(function (r) {
      const li = h('li');
      li.appendChild(document.createTextNode(ellip(r.name || '?', 30) + ' — '));
      li.appendChild(h('span', 'dish', r.dish || mysteryOf(r.category)));
      rowsEl.appendChild(li);
    });
    const chips = $('sheetChips');
    chips.textContent = '';
    if (items.length) {
      chips.appendChild(h('span', 'sheet-chips-lbl', T.stillWanted));
      items.forEach(function (it) {
        const b = btn('chip', it.label);
        b.addEventListener('click', function () {
          closeSheet(false);
          submit({ name: fields.name, dish: it.label, category: it.category, note: fields.note });
        });
        chips.appendChild(b);
      });
    }
    $('sheet').hidden = false;
    document.documentElement.classList.add('sheet-open');
    placeSheet();
    focusNoScroll($('sheetTitle'));
  }

  function closeSheet(returnFocus) {
    if ($('sheet').hidden) return;
    $('sheet').hidden = true;
    document.documentElement.classList.remove('sheet-open');
    S.sheetCtx = null;
    if (returnFocus) focusNoScroll($('sealBtn'));
  }

  // ------------------------------------------------------------------ take it back / discard
  function clearConfirm(id) {
    const t = S.confirming.get(id);
    if (t) clearTimeout(t);
    S.confirming.delete(id);
  }

  function startConfirm(id) {
    clearConfirm(id);
    S.confirming.set(id, setTimeout(function () { S.confirming.delete(id); render(); }, 4000));
    render();
    const li = S.cards.get(id);
    focusNoScroll(li && li.querySelector('.act-yes'));
  }

  function cancelConfirm(id) {
    clearConfirm(id);
    render();
    const li = S.cards.get(id);
    focusNoScroll(li && li.querySelector('.act-take'));
  }

  async function takeBack(id) {
    clearConfirm(id);
    const r = S.rows.get(id);
    if (!r || !S.mine.has(id)) return;
    const snap = Object.assign({}, r);
    const li = S.cards.get(id);
    S.tomb.set(id, Date.now() + 60000);
    S.rows.delete(id);
    if (li) {
      const played = FX.play('sweep', { el: li });
      const calmNow = FX.reduced() || !played;
      S.leaving.set(id, li);
      li.classList.add('leaving');
      if (calmNow) li.classList.add('fade-out');
      setTimeout(function () {
        if (S.leaving.get(id) !== li) return;
        S.leaving.delete(id);
        if (!S.rows.has(id)) { li.remove(); if (S.cards.get(id) === li) S.cards.delete(id); }
      }, calmNow ? 350 : 900);
    }
    render();
    toast(T.poof);
    say(T.fredo);
    prefill(snap);
    try {
      await api.remove(id, S.token);
      S.mine.delete(id);
      saveMine();
    } catch (e) {
      S.tomb.delete(id);
      if (!S.rows.has(id)) S.rows.set(id, Object.assign(snap, { state: 'confirmed', miss: 0 }));
      const old = S.leaving.get(id) || S.cards.get(id);
      S.leaving.delete(id);
      if (old) {
        old.classList.remove('leaving', 'fade-out');
        old.style.transform = '';
        old.style.opacity = '';
        if (!old.isConnected) S.cards.delete(id);
      }
      render();
      toast(ERR[3], { err: true });
      FX.play('fizzle', { el: S.cards.get(id) });
      SND.play('trombone');
    }
  }

  function discard(id) {
    const r = S.rows.get(id);
    if (!r || S.inflight.has(id)) return;
    S.tomb.set(id, Date.now() + 60000);
    S.rows.delete(id);
    outboxDel(id);
    render();
    api.remove(id, S.token).catch(function () { /* best effort (A5) */ });
  }

  function retryAllFailed() {
    rowsArr().forEach(function (r) {
      if (S.mine.has(r.id) && r.state === 'failed') sendRow(r.id, true);
    });
  }

  // ------------------------------------------------------------------ taps
  function onPledge(e) {
    if (e) e.preventDefault();
    const nameIn = $('nameIn');
    if (!clean(nameIn.value, 30)) focusNoScroll(nameIn);
    scrollToEl($('ritual'), 'start');
  }

  function onPoster(b) {
    const idx = b.dataset.idx;
    const more = idx === 'more';
    const item = more ? null : S.wanted.items[+idx];
    if (!more && !item) return;
    FX.play('yoink', { el: b, item: item });
    const dishIn = $('dishIn');
    S.catAuto = false;
    if (more || item.catLevel) {
      dishIn.value = '';
      selectCat(more ? 'Sides' : item.category);
    } else {
      dishIn.value = item.label;
      selectCat(item.category);
    }
    const nameKnown = !!clean($('nameIn').value, 30);
    if (!nameKnown) {
      focusNoScroll($('nameIn'));
      scrollToEl($('ritual'), 'start');
    } else if (more || item.catLevel) {
      focusNoScroll(dishIn);
      scrollToEl(dishIn, 'center');
    } else {
      scrollToEl($('sealBtn'), 'center');
    }
  }

  function onDon() {
    const don = $('donBtn');
    SND.play('gobble');
    S.donTaps++;
    clearTimeout(S.donTimer);
    S.donTimer = setTimeout(function () { S.donTaps = 0; }, 4000);
    if (S.donTaps >= 5) {
      S.donTaps = 0;
      clearTimeout(S.donTimer);
      FX.play('cannonball', { don: don, table: $('table') });
      SND.play('boom');
    } else {
      FX.play('poke', { n: S.donTaps, don: don });
      say(nextJoke());
    }
  }

  function soundUI() {
    const on = SND.isOn();
    document.querySelectorAll('.js-sound').forEach(function (b) {
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('.snd-ic').textContent = on ? '🔊' : '🔇';
      b.querySelector('.snd-text').textContent = on ? T.soundOn : T.soundOff;
      b.querySelector('.snd-sub').textContent = on ? '' : T.soundOffSub;
      const sh = b.querySelector('.snd-short');
      if (sh) sh.textContent = on ? 'ON' : 'OFF';
    });
  }

  function onSound() {
    const on = SND.setOn(!SND.isOn());
    soundUI();
    if (on) {
      if (!S.waltzed) { S.waltzed = true; SND.play('waltz'); }
      toast(T.soundOn);
    }
  }

  function calmUI() {
    const b = $('calmBtn');
    b.setAttribute('aria-pressed', String(S.calm));
    b.querySelector('.btn-main').textContent = S.calm ? T.calmOn : T.calmOff;
    b.querySelector('.btn-sub').textContent = S.calm ? T.calmSubOn : T.calmSubOff;
  }

  function onCalm() {
    S.calm = !S.calm;
    store.set(K.calm, S.calm);
    FX.setCalm(S.calm);
    calmUI();
  }

  function updateBar() {
    const hide = S.ritualVisible || S.typing;
    $('bar').classList.toggle('off', S.ritualVisible);
    document.body.classList.toggle('bar-hidden', hide);
  }

  const NOT_SPLASH = 'button,a,input,textarea,select,label,summary,[role="dialog"],.toast,.bar,p,h1,h2,h3,.card,.bubble,.chips,.cats,.poster';
  let pdown = null;

  function wire() {
    document.querySelectorAll('.js-pledge').forEach(function (a) { a.addEventListener('click', onPledge); });
    document.querySelectorAll('.js-sound').forEach(function (b) { b.addEventListener('click', onSound); });
    $('calmBtn').addEventListener('click', onCalm);
    $('donBtn').addEventListener('click', onDon);
    $('hamCard').addEventListener('click', function () { FX.play('hamslow', { el: $('hamCard'), art: $('hamArt') }); });
    $('seeMine').addEventListener('click', function () {
      const own = ownRows(rowsArr());
      if (own[0]) seeCard(own[0].id);
    });
    $('pendingNotice').addEventListener('click', retryAllFailed);
    $('bannerRetry').addEventListener('click', function () { poll(); });

    document.querySelectorAll('.ledger-btn').forEach(function (b) {
      b.addEventListener('click', function () { scrollToEl($((CAT[b.dataset.cat] || CAT.Other).panel), 'start'); });
    });

    $('cats').addEventListener('click', function (e) {
      const b = e.target.closest('.cat');
      if (!b) return;
      S.catAuto = false;
      selectCat(b.dataset.cat);
      FX.play('smack', { el: b, word: CAT[b.dataset.cat].word });
    });
    $('notes').addEventListener('click', function (e) {
      const c = e.target.closest('.chip');
      if (!c) return;
      const n = c.dataset.note;
      if (S.notes.has(n)) S.notes.delete(n); else S.notes.add(n);
      c.setAttribute('aria-pressed', String(S.notes.has(n)));
    });
    $('dishIn').addEventListener('input', onDishInput);
    ['nameIn', 'dishIn'].forEach(function (id) {
      $(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); $(id).blur(); }
      });
    });
    $('form').addEventListener('submit', onSeal);

    $('posters').addEventListener('click', function (e) {
      const b = e.target.closest('.poster');
      if (b) onPoster(b);
    });
    $('moreWanted').addEventListener('click', function () { S.expanded = !S.expanded; renderWanted(); });

    $('catPanels').addEventListener('click', function (e) {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const id = b.dataset.id, act = b.dataset.act;
      if (act === 'take') startConfirm(id);
      else if (act === 'no') cancelConfirm(id);
      else if (act === 'yes') takeBack(id);
      else if (act === 'retry') sendRow(id, true);
      else if (act === 'discard') discard(id);
    });

    // duplicate sheet
    $('sheetBackdrop').addEventListener('click', function () { closeSheet(true); });
    $('sheetPick').addEventListener('click', function () {
      closeSheet(false);
      const d = $('dishIn');
      focusNoScroll(d);
      try { d.select(); } catch (err) { /* ignore */ }
      scrollToEl(d, 'center');
    });
    $('sheetAnyway').addEventListener('click', function () {
      const ctx = S.sheetCtx;
      closeSheet(true);
      if (ctx) submit(ctx.fields, { double: true });
    });
    $('sheet').addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeSheet(true); return; }
      if (e.key !== 'Tab') return;
      const f = sheetFocusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!$('sheetBox').contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', placeSheet);
      window.visualViewport.addEventListener('scroll', placeSheet);
    }

    // typing: hide the bar and move toasts to the top (A2)
    document.addEventListener('focusin', function (e) {
      if (e.target && e.target.matches && e.target.matches('input, textarea')) {
        S.typing = true;
        document.body.classList.add('typing');
        updateBar();
      }
    });
    document.addEventListener('focusout', function () {
      setTimeout(function () {
        const a = document.activeElement;
        if (!(a && a.matches && a.matches('input, textarea'))) {
          S.typing = false;
          document.body.classList.remove('typing');
          updateBar();
        }
      }, 60);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { S.ritualVisible = en.isIntersecting; });
        updateBar();
      }, { threshold: 0 }).observe($('ritual'));
      new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) $('footJoke').textContent = nextJoke(); });
      }, { threshold: 0.2 }).observe($('footJoke'));
    }

    // #13 gravy splash: a tap on empty background
    document.addEventListener('pointerdown', function (e) {
      pdown = (e.button && e.button !== 0) ? null : { x: e.clientX, y: e.clientY, t: e.target };
    }, { passive: true });
    document.addEventListener('pointerup', function (e) {
      const p = pdown;
      pdown = null;
      if (!p || Math.hypot(e.clientX - p.x, e.clientY - p.y) >= 10) return;
      if (!$('sheet').hidden) return;
      if (!(p.t instanceof Element) || p.t.closest(NOT_SPLASH)) return;
      const sel = window.getSelection ? String(window.getSelection()) : '';
      if (sel) return;
      FX.play('splash', { x: e.clientX, y: e.clientY });
    }, { passive: true });
    document.addEventListener('pointercancel', function () { pdown = null; }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearTimeout(S.pollTimer);
      else poll();
    });
  }

  function injectArt() {
    const parts = [
      ['donArt', function () { return ART.don({ ids: true }); }],
      ['hamArt', function () { return ART.hamgen(); }],
      ['hamgenArt', function () { return ART.hamgen(); }],
      ['spudsArt', function () { return ART.spuds(); }],
      ['puppetArt', function () { return ART.puppetHand(); }],
      ['broomArt', function () { return ART.broom(); }]
    ];
    parts.forEach(function (p) {
      try { $(p[0]).innerHTML = p[1](); } catch (e) { /* art is decorative */ }
    });
    document.querySelectorAll('#cats .cat').forEach(function (b) {
      try { b.querySelector('.cat-ic').innerHTML = ART.icon(b.dataset.cat, 24); } catch (e) { /* ignore */ }
    });
  }

  function runSelfTest() {
    const strip = $('testStrip');
    let r;
    try { r = D.selfTest(); } catch (e) { r = { pass: 0, fail: 1, total: 1, results: [{ name: 'selfTest threw', pass: false }] }; }
    const fails = r.results.filter(function (x) { return !x.pass; });
    if (window.console) {
      console.log('DEDUPE selfTest: ' + r.pass + '/' + r.total + ' pass');
      fails.forEach(function (f) { console.warn('FAIL ' + f.name, 'got', f.got, 'want', f.want); });
    }
    strip.textContent = 'DEDUPE SELFTEST: ' + r.pass + '/' + r.total + (fails.length ? ' · FAIL: ' + fails.map(function (f) { return f.name; }).join(', ') : ' PASS');
    strip.classList.toggle('fail', fails.length > 0);
    strip.hidden = false;
  }

  function boot() {
    try { FX.init(); } catch (e) { /* effects are optional */ }
    S.calm = store.get(K.calm, false) === true;
    FX.setCalm(S.calm);
    calmUI();
    soundUI();
    injectArt();
    $('nameIn').value = S.name;
    $('footJoke').textContent = nextJoke();
    const lj = h('p', 'loading-line', nextJoke());
    $('tableLoading').appendChild(lj);
    wire();
    updateBar();

    if (NOT_LIVE) {
      showBanner('notlive');
      $('sealBtn').disabled = true;
      S.loaded = true;
    } else if (DEMO) {
      showBanner('demo');
      $('sealSub').textContent = T.demoSub;
    }

    S.outbox = loadOutbox();
    S.outbox.forEach(function (p) {
      const s = sanitize(p);
      if (!s || S.rows.has(s.id)) return;
      S.rows.set(s.id, Object.assign(s, { state: 'pending', miss: 0, hp: clean(p.hp, 60) }));
      S.mine.add(s.id);
    });

    render();
    if (qs.get('test') === '1') runSelfTest();
    FX.play('hero', { hero: $('hero'), logo: document.querySelector('.logo') });
    if (!NOT_LIVE) poll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
