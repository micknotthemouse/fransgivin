/* FRANSGIVIN sound: synthesized WebAudio, off by default, never restored ON on reload (A7), never autoplays. */
var SND = (function () {
  'use strict';
  var KEY = 'fransgivin.sound';
  var on = false;
  var ctx = null;
  var master = null;

  function save(v) {
    try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) { /* webview without storage */ }
  }

  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.3;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; master = null; }
    return ctx;
  }

  function resume() {
    if (ctx && ctx.state !== 'running' && ctx.resume) {
      try { ctx.resume(); } catch (e) { /* ignore */ }
    }
  }

  /** Call only inside a user tap. Creating/resuming the context needs a gesture. */
  function setOn(v) {
    on = !!v;
    if (on) { ensure(); resume(); }
    save(on);
    return on;
  }

  function isOn() { return on; }

  /* ---------------------------------------------------------------- synth helpers (spec §7 Sound) */
  var noiseBuf = null;
  function noise(ac) {
    if (noiseBuf && noiseBuf.sampleRate === ac.sampleRate) return noiseBuf;
    var len = Math.ceil(ac.sampleRate * 0.6);
    var b = ac.createBuffer(1, len, ac.sampleRate);
    var d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noiseBuf = b;
    return b;
  }

  /** Gain node with a quick attack and an exponential decay to silence. */
  function env(ac, out, t, peak, attack, decay) {
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(out);
    return g;
  }

  function osc(ac, type, f, t) {
    var o = ac.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    return o;
  }

  function noiseSrc(ac, t, dur) {
    var src = ac.createBufferSource();
    src.buffer = noise(ac);
    src.start(t);
    src.stop(t + dur + 0.02);
    return src;
  }

  /** Sound names: waltz, boom, pop, gobble, scratch, trombone. Each gets (ctx, masterGain 0.3). */
  var SOUNDS = {
    // first ON: 3 plucked triangle notes A4, C#5, E5, 0.25s apart, 0.3s exponential decay
    waltz: function (ac, out) {
      var t0 = ac.currentTime + 0.02;
      [440, 554.37, 659.25].forEach(function (f, i) {
        var t = t0 + i * 0.25;
        var o = osc(ac, 'triangle', f, t);
        o.connect(env(ac, out, t, 0.8, 0.005, 0.3));
        o.start(t); o.stop(t + 0.34);
      });
    },
    // #2 #3 #7: 0.5s white noise through a lowpass sweeping 800 -> 60 Hz
    boom: function (ac, out) {
      var t = ac.currentTime + 0.01;
      var lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(800, t);
      lp.frequency.exponentialRampToValueAtTime(60, t + 0.5);
      lp.connect(env(ac, out, t, 1.0, 0.01, 0.49));
      noiseSrc(ac, t, 0.5).connect(lp);
    },
    // #10: a sine sweeping 600 -> 1200 Hz over 80ms
    pop: function (ac, out) {
      var t = ac.currentTime + 0.01;
      var o = osc(ac, 'sine', 600, t);
      o.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
      o.connect(env(ac, out, t, 0.7, 0.004, 0.08));
      o.start(t); o.stop(t + 0.1);
    },
    // Don tap: 3 square bursts 400 -> 250 Hz with 20 Hz vibrato, 60ms each
    gobble: function (ac, out) {
      var t0 = ac.currentTime + 0.01;
      for (var i = 0; i < 3; i++) {
        var t = t0 + i * 0.085;
        var o = osc(ac, 'square', 400, t);
        o.frequency.linearRampToValueAtTime(250, t + 0.06);
        var lfo = osc(ac, 'sine', 20, t);
        var depth = ac.createGain();
        depth.gain.setValueAtTime(30, t);
        lfo.connect(depth);
        depth.connect(o.frequency);
        o.connect(env(ac, out, t, 0.3, 0.004, 0.056));
        o.start(t); o.stop(t + 0.065);
        lfo.start(t); lfo.stop(t + 0.065);
      }
    },
    // #4: bandpassed noise sweeping 2000 -> 300 Hz over 0.2s
    scratch: function (ac, out) {
      var t = ac.currentTime + 0.01;
      var bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.setValueAtTime(3, t);
      bp.frequency.setValueAtTime(2000, t);
      bp.frequency.exponentialRampToValueAtTime(300, t + 0.2);
      bp.connect(env(ac, out, t, 1.0, 0.01, 0.19));
      noiseSrc(ac, t, 0.2).connect(bp);
    },
    // #14: sad trombone, 4 sawtooth notes descending from G3, 0.25s each
    trombone: function (ac, out) {
      var t0 = ac.currentTime + 0.02;
      var lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1100, t0);
      lp.connect(out);
      [196.0, 185.0, 174.61, 164.81].forEach(function (f, i) {
        var t = t0 + i * 0.25;
        var o = osc(ac, 'sawtooth', f, t);
        var g = ac.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.35, t + 0.03);
        g.gain.setValueAtTime(0.35, t + 0.19);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.245);
        o.connect(g);
        g.connect(lp);
        o.start(t); o.stop(t + 0.25);
      });
    }
  };
  function play(name) {
    if (!on || !ctx) return false;
    resume();
    var fn = SOUNDS[name];
    if (!fn) return false;
    try { fn(ctx, master); } catch (e) { return false; }
    return true;
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && on) resume();
  });

  return {
    setOn: setOn, isOn: isOn, play: play, sounds: SOUNDS,
    context: function () { return { ctx: ctx, master: master }; }
  };
})();
