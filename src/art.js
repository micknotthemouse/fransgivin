/* FRANSGIVIN art: original inline SVG built only from static strings. No user data ever enters these. */
var ART = (function () {
  'use strict';

  var C = {
    ink: '#16110F', cream: '#FFF3D6', kapow: '#C8102E', yolk: '#FFD23F', pumpkin: '#FF7A1A',
    gravy: '#7A4520', ham: '#E89A8C', white: '#FFFFFF', gold: '#D4A24C', sienna: '#A0522D', jowl: '#8E4A24'
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function f1(n) { return Math.round(n * 10) / 10; }

  function svg(viewBox, body, opts) {
    opts = opts || {};
    var size = opts.size ? ' width="' + opts.size + '" height="' + (opts.h || opts.size) + '"' : '';
    var cls = opts.cls ? ' class="' + esc(opts.cls) + '"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '"' + size + cls +
      ' aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /** Star polygon points: n points alternating radius r1 and r2. */
  function burstPoints(points, r1, r2, cx, cy) {
    cx = cx || 0; cy = cy || 0;
    var out = [];
    for (var i = 0; i < points * 2; i++) {
      var r = i % 2 ? r2 : r1;
      var a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      out.push(f1(cx + r * Math.cos(a)) + ',' + f1(cy + r * Math.sin(a)));
    }
    return out.join(' ');
  }

  /**
   * Don Gobbleone, viewBox 0 0 200 220. Parts are <g> groups with classes
   * don-tail, don-wing-l, don-wing-r, don-body, don-head, don-lids, don-blink, don-hat, don-shades, don-napkin.
   * opts.ids adds matching element ids (use for one instance only).
   */
  function don(opts) {
    opts = opts || {};
    function g(name, body, extra) {
      var id = opts.ids ? ' id="' + name + '"' : '';
      return '<g' + id + ' class="' + name + '"' + (extra || '') + '>' + body + '</g>';
    }
    var tailCols = [C.pumpkin, C.yolk, C.kapow];
    var tail = '';
    for (var i = 0; i < 7; i++) {
      var ang = -60 + i * 20;
      tail += '<rect x="88" y="24" width="24" height="90" rx="12" fill="' + tailCols[i % 3] +
        '" stroke="' + C.ink + '" stroke-width="3" transform="rotate(' + ang + ' 100 120)"/>';
    }
    var wingL = '<ellipse cx="46" cy="146" rx="15" ry="32" fill="' + C.jowl + '" stroke="' + C.ink + '" stroke-width="3" transform="rotate(18 46 146)"/>';
    var wingR = '<ellipse cx="154" cy="146" rx="15" ry="32" fill="' + C.jowl + '" stroke="' + C.ink + '" stroke-width="3" transform="rotate(-18 154 146)"/>';
    var carnation = '';
    for (var k = 0; k < 5; k++) {
      var a = k * 72 * Math.PI / 180;
      carnation += '<circle cx="' + f1(130 + 5 * Math.cos(a)) + '" cy="' + f1(134 + 5 * Math.sin(a)) + '" r="6" fill="' + C.kapow + '" stroke="' + C.ink + '" stroke-width="1.5"/>';
    }
    carnation += '<circle cx="130" cy="134" r="2.5" fill="' + C.yolk + '"/>';
    var body =
      '<ellipse cx="100" cy="140" rx="60" ry="65" fill="' + C.gravy + '" stroke="' + C.ink + '" stroke-width="3"/>' +
      '<path d="M58 118 L142 118 L158 172 Q100 214 42 172 Z" fill="' + C.ink + '"/>' +
      '<polygon points="84,116 116,116 100,168" fill="' + C.cream + '"/>' +
      '<polygon points="86,113 100,120 86,127" fill="' + C.ink + '"/>' +
      '<polygon points="114,113 100,120 114,127" fill="' + C.ink + '"/>' +
      '<circle cx="100" cy="120" r="3" fill="' + C.ink + '"/>' +
      '<circle cx="100" cy="140" r="2" fill="' + C.ink + '"/><circle cx="100" cy="152" r="2" fill="' + C.ink + '"/>' +
      carnation;
    var lids =
      '<path d="M80.2 65.6 A8 8 0 1 1 95.8 65.6 Z" fill="' + C.gravy + '" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<path d="M104.2 65.6 A8 8 0 1 1 119.8 65.6 Z" fill="' + C.gravy + '" stroke="' + C.ink + '" stroke-width="2"/>';
    var shades =
      '<rect x="75" y="58" width="23" height="12" rx="4" fill="' + C.ink + '"/>' +
      '<rect x="102" y="58" width="23" height="12" rx="4" fill="' + C.ink + '"/>' +
      '<line x1="97" y1="63" x2="103" y2="63" stroke="' + C.ink + '" stroke-width="3"/>';
    var hat =
      '<polygon points="72,40 128,40 121,12 79,12" fill="' + C.ink + '"/>' +
      '<path d="M86 14 Q100 22 114 14" fill="none" stroke="#3a302b" stroke-width="2"/>' +
      '<polygon points="73,32 127,32 128,40 72,40" fill="' + C.kapow + '"/>' +
      '<ellipse cx="100" cy="41" rx="52" ry="8" fill="' + C.ink + '"/>';
    var head =
      '<circle cx="100" cy="70" r="34" fill="' + C.sienna + '" stroke="' + C.ink + '" stroke-width="3"/>' +
      '<ellipse cx="80" cy="86" rx="11" ry="8" fill="' + C.jowl + '"/>' +
      '<ellipse cx="120" cy="86" rx="11" ry="8" fill="' + C.jowl + '"/>' +
      '<circle cx="88" cy="64" r="8" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<circle cx="112" cy="64" r="8" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<circle cx="89" cy="67" r="3.5" fill="' + C.ink + '"/><circle cx="113" cy="67" r="3.5" fill="' + C.ink + '"/>' +
      g('don-lids', lids) +
      g('don-blink', '<circle cx="88" cy="64" r="9" fill="' + C.gravy + '" stroke="' + C.ink + '" stroke-width="2"/>' +
        '<circle cx="112" cy="64" r="9" fill="' + C.gravy + '" stroke="' + C.ink + '" stroke-width="2"/>' +
        '<path d="M80 66 Q88 70 96 66 M104 66 Q112 70 120 66" fill="none" stroke="' + C.ink + '" stroke-width="2"/>', ' opacity="0"') +
      '<polygon points="93,74 107,74 100,88" fill="' + C.yolk + '" stroke="' + C.ink + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M103 84 Q113 96 106 106 Q98 108 100 96 Z" fill="' + C.kapow + '" stroke="' + C.ink + '" stroke-width="2"/>' +
      g('don-shades', shades, ' display="none"') +
      g('don-hat', hat);
    var napkin =
      '<rect x="86" y="92" width="28" height="28" fill="' + C.white + '" stroke="' + C.ink + '" stroke-width="2" transform="rotate(8 100 106)"/>' +
      '<line x1="88" y1="94" x2="112" y2="118" stroke="#d9d0c0" stroke-width="2"/>';
    return svg('0 0 200 220',
      g('don-tail', tail) + g('don-wing-l', wingL) + g('don-wing-r', wingR) + g('don-body', body) +
      g('don-head', head) + g('don-napkin', napkin, ' display="none"'), { cls: 'don-svg' });
  }

  var uid = 0;

  /**
   * Tom Hamgen, Consigliere (viewBox 0 0 100 100): ham teardrop, 6 gold crosshatch lines,
   * 5 gravy cloves, a cream bone (circle + knob), tiny round glasses. opts.glasses=false drops the glasses.
   */
  function hamgen(opts) {
    opts = opts || {};
    var cid = 'hgclip' + (++uid);
    var HAM = 'M80 22 C62 14 32 16 19 36 C6 56 14 84 38 89 C62 94 84 78 85 57 C86 43 84 31 80 22 Z';
    var hatch = '';
    for (var i = 0; i < 3; i++) {
      hatch += '<line x1="' + (6 + i * 22) + '" y1="34" x2="' + (46 + i * 22) + '" y2="96" stroke="' + C.gold + '" stroke-width="2.4"/>';
      hatch += '<line x1="' + (74 - i * 22) + '" y1="30" x2="' + (34 - i * 22) + '" y2="92" stroke="' + C.gold + '" stroke-width="2.4"/>';
    }
    var cloves = [[29, 66], [51, 66], [40, 80], [62, 80], [70, 54]].map(function (p) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.6" fill="' + C.gravy + '"/>';
    }).join('');
    var face =
      '<circle cx="39" cy="50" r="2.4" fill="' + C.ink + '"/><circle cx="57" cy="50" r="2.4" fill="' + C.ink + '"/>' +
      '<path d="M41 63 Q48 67 55 61" fill="none" stroke="' + C.ink + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M51 40 L62 37" stroke="' + C.ink + '" stroke-width="2.4" stroke-linecap="round"/>';
    var glasses = opts.glasses === false ? '' :
      '<g class="hamgen-glasses">' +
      '<circle cx="39" cy="50" r="7.5" fill="#FFF3D6" fill-opacity=".45" stroke="' + C.ink + '" stroke-width="2.6"/>' +
      '<circle cx="57" cy="50" r="7.5" fill="#FFF3D6" fill-opacity=".45" stroke="' + C.ink + '" stroke-width="2.6"/>' +
      '<line x1="46.5" y1="50" x2="49.5" y2="50" stroke="' + C.ink + '" stroke-width="2.6"/>' +
      '<line x1="31.5" y1="49" x2="25" y2="46" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<path d="M35 46 Q37 44 40 44.5" fill="none" stroke="' + C.white + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M53 46 Q55 44 58 44.5" fill="none" stroke="' + C.white + '" stroke-width="1.6" stroke-linecap="round"/></g>';
    return svg('0 0 100 100',
      '<defs><clipPath id="' + cid + '"><path d="' + HAM + '"/></clipPath></defs>' +
      '<g class="hamgen-bone"><rect x="77" y="12" width="9" height="14" rx="3" transform="rotate(40 81 19)" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="2.5"/>' +
      '<circle cx="86" cy="13" r="6" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="2.5"/>' +
      '<circle cx="92" cy="7" r="5" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="2.5"/></g>' +
      '<path d="' + HAM + '" fill="' + C.ham + '"/>' +
      '<g clip-path="url(#' + cid + ')">' + hatch + '<path d="M14 72 Q44 98 84 66 L90 100 L10 100 Z" fill="#C97A6C" opacity=".55"/></g>' +
      '<path d="' + HAM + '" fill="none" stroke="' + C.ink + '" stroke-width="3" stroke-linejoin="round"/>' +
      cloves + face + glasses, { cls: 'hamgen-svg', size: opts.size });
  }

  /**
   * Sonny Spuds (viewBox 0 0 100 100): a hot-headed mashed potato. Cream lumpy blob (8 points,
   * radius jittered 38-44) with an ink outline, angry brows, a gravy-pool hat, a tiny ink suit.
   */
  function spuds(opts) {
    opts = opts || {};
    var jit = [41, 38, 43, 39.5, 44, 40, 42.5, 38.5];
    var pts = jit.map(function (r, i) {
      var a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      return [50 + r * 0.86 * Math.cos(a), 55 + r * 0.72 * Math.sin(a)];
    });
    var d = 'M' + f1((pts[7][0] + pts[0][0]) / 2) + ' ' + f1((pts[7][1] + pts[0][1]) / 2);
    for (var i = 0; i < 8; i++) {
      var p = pts[i], q = pts[(i + 1) % 8];
      d += ' Q' + f1(p[0]) + ' ' + f1(p[1]) + ' ' + f1((p[0] + q[0]) / 2) + ' ' + f1((p[1] + q[1]) / 2);
    }
    var suit =
      '<g class="spuds-suit"><polygon points="33,80 67,80 78,100 22,100" fill="' + C.ink + '"/>' +
      '<polygon points="43,80 57,80 50,94" fill="' + C.white + '"/>' +
      '<polygon points="48,82 52,82 53,92 50,96 47,92" fill="' + C.kapow + '"/></g>';
    var face =
      '<g class="spuds-brows" stroke="' + C.ink + '" stroke-width="4.5" stroke-linecap="round"><line x1="29" y1="41" x2="45" y2="49"/><line x1="71" y1="41" x2="55" y2="49"/></g>' +
      '<circle cx="39" cy="55" r="5" fill="' + C.white + '" stroke="' + C.ink + '" stroke-width="2"/><circle cx="61" cy="55" r="5" fill="' + C.white + '" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<circle cx="40.5" cy="56" r="2.4" fill="' + C.ink + '"/><circle cx="59.5" cy="56" r="2.4" fill="' + C.ink + '"/>' +
      '<rect x="38" y="65" width="24" height="9" rx="3" fill="' + C.white + '" stroke="' + C.ink + '" stroke-width="2.4"/>' +
      '<g stroke="' + C.ink + '" stroke-width="1.6"><line x1="44" y1="65.5" x2="44" y2="73.5"/><line x1="50" y1="65.5" x2="50" y2="73.5"/><line x1="56" y1="65.5" x2="56" y2="73.5"/><line x1="38.5" y1="69.5" x2="61.5" y2="69.5"/></g>' +
      '<path d="M70 30 l5 -5 M74 33 l6 -2 M72 26 l1 -7" stroke="' + C.kapow + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M20 64 q-4 -2 -3 -7 M80 64 q4 -2 3 -7" fill="none" stroke="#d9cdb4" stroke-width="2" stroke-linecap="round"/>';
    var hat =
      '<g class="spuds-hat"><ellipse cx="49" cy="25" rx="21" ry="7" fill="' + C.gravy + '" stroke="' + C.ink + '" stroke-width="2.4"/>' +
      '<path d="M33 27 Q32 35 35 36 Q38 35 37 28" fill="' + C.gravy + '" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<ellipse cx="44" cy="23" rx="7" ry="2" fill="#9b5a2b"/></g>';
    return svg('0 0 100 100',
      suit + '<path d="' + d + ' Z" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M30 76 Q50 84 70 76" fill="none" stroke="#e2d3b0" stroke-width="3" stroke-linecap="round"/>' +
      hat + face, { cls: 'spuds-svg', size: opts.size });
  }

  /**
   * Comic burst with a centered word.
   * opts: {size, outer, inner, core, rotate, fontSize}
   */
  function burst(word, opts) {
    opts = opts || {};
    var w = String(word == null ? '' : word);
    var len = Math.max(3, Array.from(w).length);
    var fs = opts.fontSize || Math.min(46, Math.floor(200 / (len * 0.95)));
    var rot = opts.rotate == null ? -8 : opts.rotate;
    return svg('-125 -125 250 250',
      '<polygon points="' + burstPoints(14, 110, 66) + '" fill="' + (opts.outer || C.kapow) + '" stroke="' + C.ink + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<polygon points="' + burstPoints(14, 100, 60) + '" fill="' + (opts.inner || C.yolk) + '" stroke="' + C.ink + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<circle r="30" fill="' + (opts.core || C.white) + '"/>' +
      (w ? '<text x="0" y="0" transform="rotate(' + rot + ')" text-anchor="middle" dominant-baseline="central" ' +
        'font-family="Cinzel, Georgia, serif" font-size="' + fs + '" letter-spacing="1" fill="' + C.ink +
        '" stroke="' + C.white + '" stroke-width="6" paint-order="stroke" stroke-linejoin="round">' + esc(w) + '</text>' : ''),
      { size: opts.size, cls: 'burst-svg' });
  }

  var SEAL_PATH = (function () {
    var n = 20, d = '';
    for (var i = 0; i < n; i++) {
      var a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2;
      if (!i) d += 'M' + f1(50 + 42 * Math.cos(a0)) + ' ' + f1(50 + 42 * Math.sin(a0));
      d += ' Q' + f1(50 + 50 * Math.cos(am)) + ' ' + f1(50 + 50 * Math.sin(am)) + ' ' + f1(50 + 42 * Math.cos(a1)) + ' ' + f1(50 + 42 * Math.sin(a1));
    }
    return d + ' Z';
  })();

  /** Wax seal, viewBox 0 0 100 100. */
  function waxSeal(opts) {
    opts = opts || {};
    return svg('0 0 100 100',
      '<path d="' + SEAL_PATH + '" fill="' + C.kapow + '" stroke="' + C.ink + '" stroke-width="3"/>' +
      '<circle cx="50" cy="50" r="34" fill="none" stroke="' + C.gold + '" stroke-width="3"/>' +
      '<text x="45" y="52" text-anchor="middle" dominant-baseline="central" font-family="\'Playfair Display\', Georgia, serif" font-style="italic" font-weight="900" font-size="40" fill="' + C.cream + '">F</text>' +
      '<g stroke="' + C.cream + '" stroke-width="3" stroke-linecap="round"><line x1="64" y1="68" x2="58" y2="56"/><line x1="64" y1="68" x2="65" y2="54"/><line x1="64" y1="68" x2="72" y2="58"/></g>',
      { size: opts.size, cls: 'seal-svg' });
  }

  /** Gravy splat (8 lobes, 3 drips). variant 'cranberry' fills kapow. Randomized per call. */
  function splat(variant, opts) {
    opts = opts || {};
    var fill = variant === 'cranberry' ? C.kapow : C.gravy;
    var lobes = 8, d = '';
    var valley = [];
    var lobe = [];
    var off = Math.random() * Math.PI;
    for (var i = 0; i < lobes; i++) {
      var a = off + (i / lobes) * Math.PI * 2;
      var r = 44 * (0.7 + Math.random() * 0.3);
      lobe.push([Math.cos(a + Math.PI / lobes) * r * 1.25, Math.sin(a + Math.PI / lobes) * r * 1.25]);
      valley.push([Math.cos(a) * 26, Math.sin(a) * 26]);
    }
    d = 'M' + f1(valley[0][0]) + ' ' + f1(valley[0][1]);
    for (var j = 0; j < lobes; j++) {
      var v = valley[(j + 1) % lobes];
      d += ' Q' + f1(lobe[j][0]) + ' ' + f1(lobe[j][1]) + ' ' + f1(v[0]) + ' ' + f1(v[1]);
    }
    var drips = '';
    for (var k = 0; k < 3; k++) {
      drips += '<ellipse cx="' + f1(-26 + k * 26 + (Math.random() * 10 - 5)) + '" cy="' + f1(50 + Math.random() * 14) +
        '" rx="5" ry="9" fill="' + fill + '" stroke="' + C.ink + '" stroke-width="2"/>';
    }
    return svg('-64 -64 128 140', '<path d="' + d + ' Z" fill="' + fill + '" stroke="' + C.ink + '" stroke-width="3" stroke-linejoin="round"/>' + drips,
      { size: opts.size, cls: 'splat-svg' });
  }

  /**
   * Puppet hand (viewBox 0 0 320 60): a gravy turkey foot (3 toe paths) gripping a puppeteer's bar,
   * with 4 thin cream strings dropping toward the F, A, G and N of FRANSGIVIN (assumes a centered ~280px logo).
   */
  function puppetHand() {
    var toes = 'M160 2 L160 16 M160 16 L134 30 M160 16 L160 34 M160 16 L186 30 M160 16 L172 6';
    var strings = [[106, 30, 34], [136, 33, 90], [184, 33, 174], [214, 30, 286]].map(function (s) {
      return '<line x1="' + s[0] + '" y1="' + s[1] + '" x2="' + s[2] + '" y2="60"/>';
    }).join('');
    return svg('0 0 320 60',
      '<g stroke="' + C.cream + '" stroke-width="1.4" stroke-linecap="round" opacity=".85">' + strings + '</g>' +
      '<rect x="100" y="27" width="120" height="6" rx="3" fill="' + C.gold + '" stroke="' + C.ink + '" stroke-width="1.5"/>' +
      '<path d="' + toes + '" fill="none" stroke="' + C.ink + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + toes + '" fill="none" stroke="' + C.gravy + '" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g stroke="#5a3318" stroke-width="1.2"><line x1="157" y1="6" x2="163" y2="6"/><line x1="157" y1="10" x2="163" y2="10"/></g>' +
      '<g fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="1"><path d="M131 30 L127 36 L135 33 Z"/><path d="M157 34 L160 41 L163 34 Z"/><path d="M189 30 L193 36 L185 33 Z"/></g>',
      { cls: 'puppet-svg' });
  }

  /** Broom (viewBox 0 0 60 120): gravy handle, yolk head with 5 ink bristle lines, a kapow binding band. */
  function broom(opts) {
    opts = opts || {};
    return svg('0 0 60 120',
      '<rect x="27" y="0" width="6" height="70" rx="3" fill="' + C.gravy + '" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<polygon points="30,64 54,116 6,116" fill="' + C.yolk + '" stroke="' + C.ink + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<g stroke="' + C.ink + '" stroke-width="2"><line x1="30" y1="76" x2="14" y2="114"/><line x1="30" y1="76" x2="22" y2="114"/><line x1="30" y1="76" x2="30" y2="114"/><line x1="30" y1="76" x2="38" y2="114"/><line x1="30" y1="76" x2="46" y2="114"/></g>' +
      '<rect x="23" y="66" width="14" height="7" rx="2" fill="' + C.kapow + '" stroke="' + C.ink + '" stroke-width="2"/>',
      { size: opts.size, cls: 'broom-svg' });
  }

  /** Cork (viewBox 0 0 40 30): a tan rounded rect with pores and a wine-stained end. The #10 effect draws it on canvas. */
  function cork(opts) {
    opts = opts || {};
    return svg('0 0 40 30', '<rect x="4" y="4" width="32" height="22" rx="6" fill="#C8A36A" stroke="' + C.ink + '" stroke-width="3"/>' +
      '<rect x="29" y="5.5" width="5.5" height="19" rx="2.5" fill="#8E2A3A" opacity=".75"/>' +
      '<g fill="#8a6a3a"><circle cx="11" cy="11" r="1.6"/><circle cx="19" cy="19" r="1.6"/><circle cx="23" cy="10" r="1.4"/><circle cx="13" cy="20" r="1.1"/></g>', { size: opts.size, cls: 'cork-svg' });
  }

  var ICON_ALIAS = { 'Main/Ham': 'ham', Sides: 'sides', Apps: 'apps', Desserts: 'desserts', Booze: 'booze', Other: 'other' };

  var ICONS = {
    ham: '<path d="M7 21 C3 13 10 5 18 6 C26 7 29 15 24 21 C20 26 12 27 7 21Z" fill="' + C.ham + '" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<path d="M11 12 L19 22 M17 10 L25 18 M13 20 L21 11" stroke="' + C.gold + '" stroke-width="1.5"/>' +
      '<circle cx="25" cy="24" r="3" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="1.5"/><circle cx="28.5" cy="27.5" r="2.5" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="1.5"/>',
    sides: '<path d="M3 16 H29 C29 24 23 28 16 28 C9 28 3 24 3 16Z" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="2.2"/>' +
      '<g fill="none" stroke="' + C.ink + '" stroke-width="2" stroke-linecap="round"><path d="M10 12 Q8 9 10 7 Q12 5 10 3"/><path d="M16 12 Q14 9 16 7 Q18 5 16 3"/><path d="M22 12 Q20 9 22 7 Q24 5 22 3"/></g>',
    apps: '<polygon points="3,25 29,25 29,10" fill="' + C.yolk + '" stroke="' + C.ink + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<g fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="1.2"><circle cx="20" cy="21" r="2"/><circle cx="25" cy="17" r="1.6"/><circle cx="26" cy="22.5" r="1.3"/></g>',
    desserts: '<path d="M16 5 L29 24 Q16 29 3 24 Z" fill="' + C.pumpkin + '" stroke="' + C.ink + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M3 24 Q16 29 29 24" fill="none" stroke="' + C.gravy + '" stroke-width="3"/>' +
      '<g stroke="' + C.ink + '" stroke-width="1.2"><line x1="12" y1="12" x2="20" y2="24"/><line x1="20" y1="12" x2="12" y2="24"/><line x1="9" y1="18" x2="23" y2="18"/></g>',
    booze: '<rect x="4" y="13" width="9" height="16" rx="2" fill="' + C.kapow + '" stroke="' + C.ink + '" stroke-width="2"/><rect x="6.5" y="5" width="4" height="9" fill="' + C.kapow + '" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<path d="M18 6 H29 Q29 15 23.5 16 Q18 15 18 6Z" fill="' + C.kapow + '" stroke="' + C.ink + '" stroke-width="2"/><path d="M23.5 16 V26 M19 27 H28" stroke="' + C.ink + '" stroke-width="2" stroke-linecap="round"/>',
    other: '<rect x="4" y="7" width="24" height="20" rx="2" fill="' + C.cream + '" stroke="' + C.ink + '" stroke-width="2.2"/><path d="M4 12 H28" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<text x="16" y="22" text-anchor="middle" dominant-baseline="central" font-family="Cinzel, Georgia, serif" font-size="13" fill="' + C.ink + '">?</text>',
    mystery: '<rect x="4" y="7" width="24" height="20" rx="2" fill="' + C.yolk + '" stroke="' + C.ink + '" stroke-width="2.2"/><path d="M4 12 H28" stroke="' + C.ink + '" stroke-width="2"/>' +
      '<text x="16" y="22" text-anchor="middle" dominant-baseline="central" font-family="Cinzel, Georgia, serif" font-size="13" fill="' + C.ink + '">?</text>',
    fedora: '<polygon points="9,17 23,17 21,7 11,7" fill="' + C.ink + '"/><rect x="9" y="14" width="14" height="3" fill="' + C.kapow + '"/><ellipse cx="16" cy="18" rx="14" ry="3.5" fill="' + C.ink + '"/>'
  };

  /** Category / UI icon. name: category id or one of ham, sides, apps, desserts, booze, other, mystery, fedora. */
  function icon(name, size) {
    var key = ICON_ALIAS[name] || name;
    var body = ICONS[key] || ICONS.other;
    return svg('0 0 32 32', body, { size: size || 24, cls: 'icon icon-' + key });
  }

  return {
    COLORS: C, burstPoints: burstPoints, don: don, hamgen: hamgen, spuds: spuds, burst: burst,
    waxSeal: waxSeal, splat: splat, puppetHand: puppetHand, icon: icon, broom: broom, cork: cork
  };
})();
