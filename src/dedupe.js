/* FRANSGIVIN dedupe + WANTED math. Pure functions, no DOM access. Spec §6, §8 plus skeptic amendment A4. */
var DEDUPE = (function () {
  'use strict';

  var CATS = ['Main/Ham', 'Sides', 'Apps', 'Desserts', 'Booze', 'Other'];

  // Control, zero-width and bidi characters (A8).
  var STRIP_RE = /[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩﻿]/g;

  /** Cap by code points so emoji never split. */
  function cap(s, n) {
    return Array.from(String(s)).slice(0, n).join('');
  }

  /** Strip control/bidi chars, collapse whitespace, trim, cap at n code points. */
  function clean(s, n) {
    var out = String(s == null ? '' : s).replace(STRIP_RE, ' ').replace(/\s+/g, ' ').trim();
    return n ? cap(out, n).trim() : out;
  }

  var FILLER = ['store bought', 'gluten free', 'dairy free', 'home made', 'homemade', 'grandmas', 'moms', 'dads',
    'famous', 'classic', 'extra', 'some', 'big', 'small', 'little', 'best', 'my', 'the', 'an', 'a', 'vegan', 'gf']
    .sort(function (a, b) { return b.length - a.length; });

  function singular(t) {
    if (t.length <= 3) return t;
    if (/ies$/.test(t)) return (t.length - 3 <= 3) ? t.slice(0, -1) : t.slice(0, -3) + 'y';
    if (/oes$/.test(t)) return t.slice(0, -2);
    if (/(ch|sh)es$/.test(t)) return t.slice(0, -2);
    if (/s$/.test(t) && !/ss$/.test(t)) return t.slice(0, -1);
    return t;
  }

  function removeWord(padded, phrase) {
    var p = ' ' + phrase + ' ';
    while (padded.indexOf(p) >= 0) padded = padded.split(p).join(' ');
    return padded;
  }

  function normalize(dish) {
    var s = clean(dish).toLowerCase();
    if (s.normalize) s = s.normalize('NFD');
    s = s.replace(/[̀-ͯ]/g, '');
    s = s.replace(/[‘’ʼ`´]/g, "'");
    s = s.replace(/[&+]/g, ' and ');
    s = s.replace(/(^|\s)'?n'?(?=\s|$)/g, '$1and');
    s = s.replace(/'/g, '');
    s = s.replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    var padded = ' ' + s + ' ';
    for (var i = 0; i < FILLER.length; i++) padded = removeWord(padded, FILLER[i]);
    return padded.trim().split(/\s+/).filter(Boolean).map(singular).join(' ');
  }

  var SYN = {
    mash: ['mashed potato', 'smashed potato', 'potato mash', 'mashed tater', 'mash'],
    mac: ['macaroni and cheese', 'mac and cheese', 'mac cheese', 'macaroni', 'mac'],
    greenbean: ['green bean casserole', 'green bean', 'string bean'],
    stuffing: ['stuffing', 'dressing'],
    sweetpotato: ['sweet potato casserole', 'candied yam', 'sweet potato', 'yam'],
    bread: ['dinner roll', 'cornbread', 'biscuit', 'bread', 'roll'],
    cranberry: ['cranberry sauce', 'cranberry'],
    gravy: ['gravy'],
    salad: ['green salad', 'salad'],
    veg: ['roasted vegetable', 'roasted veg', 'brussels sprout', 'veggie', 'squash', 'carrot'],
    pumpkinpie: ['pumpkin pie'],
    applepie: ['apple pie'],
    pecanpie: ['pecan pie'],
    pie: ['pie'],
    wine: ['red wine', 'white wine', 'wine', 'rose', 'prosecco', 'champagne'],
    beer: ['hard seltzer', 'beer', 'cider', 'ipa'],
    na: ['non alcoholic', 'sparkling water', 'mocktail', 'seltzer', 'soda', 'juice'],
    ice: ['ice'],
    togo: ['to go container', 'tupperware', 'container', 'foil'],
    ham: ['ham'],
    turkey: ['turkey']
  };

  // Checked FIRST. An empty key blanks the phrase so it can never trigger a key; a real key wins at once.
  var EXCEPT = {
    'ice cream': '', 'carrot cake': '', 'egg roll': '', 'cinnamon roll': '', 'pot pie': '',
    'sweet potato pie': 'pie', 'apple cider': 'na', 'cranberry juice': 'na'
  };

  var KEY_CAT = {
    mash: 'Sides', mac: 'Sides', greenbean: 'Sides', stuffing: 'Sides', sweetpotato: 'Sides', bread: 'Sides',
    cranberry: 'Sides', gravy: 'Sides', salad: 'Sides', veg: 'Sides',
    pumpkinpie: 'Desserts', applepie: 'Desserts', pecanpie: 'Desserts', pie: 'Desserts',
    wine: 'Booze', beer: 'Booze',
    na: 'Other', ice: 'Other', togo: 'Other',
    ham: 'Main/Ham', turkey: 'Main/Ham'
  };

  var FAMILY = { pie: 'pie', pumpkinpie: 'pie', applepie: 'pie', pecanpie: 'pie' };

  /** Normalized phrase list (synonyms run through normalize at startup, plus their plural form). */
  function buildPhrases(map) {
    var out = [];
    var seen = {};
    Object.keys(map).forEach(function (k) {
      var list = Array.isArray(map[k]) ? map[k] : [k];
      list.forEach(function (raw) {
        var key = Array.isArray(map[k]) ? k : map[k];
        [normalize(raw), normalize(raw + 's')].forEach(function (p) {
          if (p && !seen[p]) { seen[p] = 1; out.push({ p: p, key: key }); }
        });
      });
    });
    return out.sort(function (a, b) { return b.p.length - a.p.length; });
  }
  var PHRASES = buildPhrases(SYN);
  var EXC_PHRASES = buildPhrases(EXCEPT);

  function keyOf(norm) {
    if (!norm) return '';
    var t = ' ' + norm + ' ';
    var i;
    for (i = 0; i < EXC_PHRASES.length; i++) {
      var e = EXC_PHRASES[i];
      if (t.indexOf(' ' + e.p + ' ') >= 0) {
        if (e.key) return e.key;
        t = removeWord(t, e.p);
      }
    }
    for (i = 0; i < PHRASES.length; i++) {
      if (t.indexOf(' ' + PHRASES[i].p + ' ') >= 0) return PHRASES[i].key;
    }
    return '';
  }

  function analyze(dish) {
    var norm = normalize(dish);
    return { norm: norm, key: keyOf(norm), tokens: norm ? norm.split(' ') : [] };
  }

  function categoryFor(key) { return KEY_CAT[key] || ''; }

  function levenshtein(a, b) {
    if (a === b) return 0;
    var al = a.length, bl = b.length;
    if (!al) return bl;
    if (!bl) return al;
    var prev = new Array(bl + 1), cur = new Array(bl + 1), i, j;
    for (j = 0; j <= bl; j++) prev[j] = j;
    for (i = 1; i <= al; i++) {
      cur[0] = i;
      for (j = 1; j <= bl; j++) {
        var c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
      }
      var tmp = prev; prev = cur; cur = tmp;
    }
    return prev[bl];
  }

  function jaccard(ta, tb) {
    var A = {}, B = {}, inter = 0, uni = 0, k;
    ta.forEach(function (t) { A[t] = 1; });
    tb.forEach(function (t) { B[t] = 1; });
    for (k in A) { uni++; if (B[k]) inter++; }
    for (k in B) { if (!A[k]) uni++; }
    return uni ? inter / uni : 0;
  }

  /** Compare two analyzed dishes: 'strong' | 'soft' | ''. */
  function compare(a, b) {
    if (!a.norm || !b.norm) return '';
    if (a.key && b.key) {
      if (a.key === b.key) return 'strong';
      if (FAMILY[a.key] && FAMILY[a.key] === FAMILY[b.key]) return 'soft';
      return '';
    }
    if (a.norm === b.norm) return 'strong';
    if (jaccard(a.tokens, b.tokens) >= 0.6) return 'strong';
    if (!a.key && !b.key && a.norm.length >= 6 && b.norm.length >= 6) {
      var L = Math.max(a.norm.length, b.norm.length);
      if (levenshtein(a.norm, b.norm) <= (L <= 12 ? 2 : 3)) return 'strong';
    }
    return '';
  }

  /** The Host's ham: scored, never rendered, never removable (A4). */
  var HOST_HAM = { id: '__host_ham', name: 'The Host', dish: 'Ham', category: 'Main/Ham', note: '', virtual: true };

  function buildIndex(rows) {
    return rows.map(function (r) { return { row: r, a: analyze(r.dish) }; });
  }

  /**
   * Score a new dish against an index.
   * Returns {level:'strong'|'soft'|'', kind:'booze'|'pie'|'', matches:[rows], norm, key}.
   */
  function score(dish, category, index) {
    var a = analyze(dish);
    var res = { level: '', kind: '', matches: [], norm: a.norm, key: a.key };
    if (!a.norm) return res;
    var strong = [], soft = [];
    for (var i = 0; i < index.length; i++) {
      var l = compare(a, index[i].a);
      if (l === 'strong') strong.push(index[i].row);
      else if (l === 'soft') soft.push(index[i].row);
    }
    res.matches = strong.concat(soft);
    if (strong.length) res.level = 'strong';
    else if (soft.length) { res.level = 'soft'; res.kind = 'pie'; }
    if (res.level === 'strong' && category === 'Booze') { res.level = 'soft'; res.kind = 'booze'; }
    return res;
  }

  var WANTED = [
    ['Mashed Potatoes', 'Sides', 'mash', 1],
    ['Stuffing', 'Sides', 'stuffing', 1],
    ['Gravy', 'Sides', 'gravy', 1],
    ['Mac & Cheese', 'Sides', 'mac', 1],
    ['Green Bean Casserole', 'Sides', 'greenbean', 1],
    ['Sweet Potatoes', 'Sides', 'sweetpotato', 1],
    ['Cranberry Sauce', 'Sides', 'cranberry', 1],
    ['Rolls', 'Sides', 'bread', 1],
    ['Salad', 'Sides', 'salad', 1],
    ['Roasted Veggies', 'Sides', 'veg', 1],
    ['Apps / Cheese Board', 'Apps', '', 2],
    ['Pumpkin Pie', 'Desserts', 'pumpkinpie', 1],
    ['Another Dessert', 'Desserts', '', 2],
    ['Wine', 'Booze', 'wine', 2],
    ['Beer / Cider', 'Booze', 'beer', 1],
    ['Non-Alcoholic Drinks', 'Other', 'na', 1],
    ['Ice', 'Other', 'ice', 1],
    ['To-Go Containers', 'Other', 'togo', 1]
  ];

  /** WANTED fill state for a list of rows ({name, dish, category}). */
  function computeWanted(rows) {
    var items = WANTED.map(function (w, i) {
      return { idx: i, label: w[0], category: w[1], key: w[2], target: w[3], count: 0, names: [], filled: false, catLevel: !w[2] };
    });
    rows.forEach(function (r) {
      if (!r || r.virtual) return;
      var k = keyOf(normalize(r.dish));
      var hit = null, i;
      if (k) {
        for (i = 0; i < items.length; i++) {
          if (items[i].key === k && items[i].category === r.category) { hit = items[i]; break; }
        }
      }
      if (!hit) {
        for (i = 0; i < items.length; i++) {
          if (items[i].catLevel && items[i].category === r.category) { hit = items[i]; break; }
        }
      }
      if (hit) {
        hit.count++;
        if (r.name && hit.names.indexOf(r.name) < 0) hit.names.push(r.name);
      }
    });
    items.forEach(function (it) { it.filled = it.count >= it.target; });
    return {
      items: items,
      unfilled: items.filter(function (it) { return !it.filled; }),
      filled: items.filter(function (it) { return it.filled; })
    };
  }

  /** The WANTED item a new row would newly fill, or null. */
  function wouldFill(rows, row) {
    var before = computeWanted(rows).items;
    var after = computeWanted(rows.concat([row])).items;
    for (var i = 0; i < after.length; i++) {
      if (after[i].filled && !before[i].filled) return after[i];
    }
    return null;
  }

  /** Up to n unfilled keyed items: same category first, then Sides, excluding a key. */
  function stillNeeded(wanted, category, excludeKey, n) {
    n = n || 3;
    var pool = wanted.unfilled.filter(function (it) { return it.key && it.key !== excludeKey; });
    var out = [];
    function take(pred) {
      pool.forEach(function (it) { if (out.length < n && pred(it) && out.indexOf(it) < 0) out.push(it); });
    }
    take(function (it) { return it.category === category; });
    take(function (it) { return it.category === 'Sides'; });
    take(function () { return true; });
    return out;
  }

  function topUnfilled(wanted, category) {
    for (var i = 0; i < wanted.unfilled.length; i++) {
      if (!category || wanted.unfilled[i].category === category) return wanted.unfilled[i];
    }
    return null;
  }

  function selfTest() {
    var results = [];
    function check(name, got, want) {
      results.push({ name: name, pass: got === want, got: got, want: want });
    }
    var keyVectors = [
      ['Mashed Potatoes', 'mash'], ["Grandma's mac n cheese", 'mac'], ['Mac & Cheese', 'mac'],
      ["mac 'n' cheese", 'mac'], ['Brussels sprouts', 'veg'], ['Roasted veggies', 'veg'],
      ['Pies', 'pie'], ['Ice cream', ''], ['Bag of ice', 'ice'], ['Carrot cake', ''],
      ['Egg rolls', ''], ['Cinnamon rolls', ''], ['Dinner rolls', 'bread'], ['Chicken pot pie', ''],
      ['Sweet potato pie', 'pie'], ['Sweet potato casserole', 'sweetpotato'], ['Apple cider', 'na'],
      ['Cranberry juice', 'na'], ['Cranberry sauce', 'cranberry'], ['Hard seltzer', 'beer'],
      ['To-go containers', 'togo'], ['Homemade Stuffing', 'stuffing'], ['Crème brûlée', ''],
      ['Green bean casserole', 'greenbean'], ['Rosé', 'wine'], ['Pumpkin pie with ice cream', 'pumpkinpie']
    ];
    keyVectors.forEach(function (v) { check('key:' + v[0], keyOf(normalize(v[0])), v[1]); });
    check('norm:pies', normalize('Pies'), 'pie');
    check('norm:accents', normalize('Crème Brûlée'), 'creme brulee');
    check('norm:filler', normalize("My mom's famous GF stuffing!!"), 'stuffing');

    function s(dish, cat, other) { return score(dish, cat, buildIndex([{ dish: other, name: 'x', category: 'Sides' }])).level; }
    check('score:stuffing~dressing', s('Stuffing', 'Sides', 'Dressing'), 'strong');
    check('score:salad~salsa', s('Salad', 'Sides', 'Salsa'), '');
    check('score:chips~chili', s('Chips', 'Apps', 'Chili'), '');
    check('score:pumpkin~pecan', s('Pumpkin pie', 'Desserts', 'Pecan pie'), 'soft');
    check('score:pie~apple', s('Pie', 'Desserts', 'Apple pie'), 'soft');
    check('score:booze exempt', s('Red wine', 'Booze', 'Red wine'), 'soft');
    check('score:brownies', s('Chocolate brownies', 'Desserts', 'Chocolate brownie'), 'strong');
    check('score:deviled', s('Deviled eggs', 'Apps', 'Devilled eggs'), 'strong');
    check('score:mashed taters', s('Mashed taters', 'Sides', 'Mashed potatoes'), 'strong');
    check('score:empty', s('', 'Sides', 'Stuffing'), '');
    check('score:filler only', s('The best', 'Sides', 'The best'), '');
    check('score:host ham', score('Ham', 'Main/Ham', buildIndex([HOST_HAM])).level, 'strong');

    var w1 = computeWanted([{ name: 'a', dish: 'Ice cream', category: 'Desserts' }]);
    check('wanted:ice cream not ice', w1.items[16].count, 0);
    var w2 = computeWanted([{ name: 'a', dish: 'Bag of ice', category: 'Other' }]);
    check('wanted:ice fills', w2.items[16].filled, true);
    var w3 = computeWanted([{ name: 'a', dish: 'Pumpkin pie', category: 'Sides' }]);
    check('wanted:category must match', w3.items[11].filled, false);
    check('wouldFill:stuffing', (wouldFill([], { name: 'a', dish: 'Stuffing', category: 'Sides' }) || {}).label, 'Stuffing');

    var pass = results.filter(function (r) { return r.pass; }).length;
    return { pass: pass, fail: results.length - pass, total: results.length, results: results };
  }

  var api = {
    CATS: CATS, KEY_CAT: KEY_CAT, FAMILY: FAMILY, WANTED: WANTED, HOST_HAM: HOST_HAM,
    cap: cap, clean: clean, normalize: normalize, keyOf: keyOf, analyze: analyze, categoryFor: categoryFor,
    levenshtein: levenshtein, jaccard: jaccard, compare: compare, buildIndex: buildIndex, score: score,
    computeWanted: computeWanted, wouldFill: wouldFill, stillNeeded: stillNeeded, topUnfilled: topUnfilled,
    selfTest: selfTest
  };
  return api;
})();

if (typeof module !== "undefined") module.exports = { DEDUPE: DEDUPE, normalize: DEDUPE.normalize, keyOf: DEDUPE.keyOf, score: DEDUPE.score, buildIndex: DEDUPE.buildIndex, computeWanted: DEDUPE.computeWanted, selfTest: DEDUPE.selfTest };
