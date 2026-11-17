// Sound effects for every screen, made with the Web Audio API (no sound files). Each one is modelled on the real
// thing (the click of a latch, a hinge creaking, a cookie landing in a ceramic crock) rather than a cartoon tone.
// Play one with Sounds.play('<name>', options). Names:
//   footstep (Mr. Bear) and turtleStep (Mr. Turtle): { surface: 'tile' } indoors or { surface: 'path' } on the
//     sandy path outside
//   doorOpen: the handle's latch clicks, the hinge creaks and the door swings
//   doorClose: the door thuds into its frame and the latch catches
//   drop: the cookie lands in a ceramic jar; { soft: true } when it's set down gently rather than dropped
//   cookiePickup: the cookie scraping off the bottom of the jar as it's picked up
//   jarTap: a finger tapping the side of a glazed ceramic jar (choosing it)
//   hover, select: a soft tick, a wooden toy-button "tok"
//   prompt: three soft bell notes, "your turn"
// Every sound should come from something that actually happens on screen, at the moment it happens. Where it
// happens can go in the options too: { pan: -1 (left) .. 1 (right), gain: 0..1 (quieter when further away),
// muffled: true (heard through a shut door) }.
// Browsers only allow sound once the page has been clicked or tapped, so the first click unlocks it.
const Sounds = (() => {
  let audioCtx = null;
  const noiseBuffers = new WeakMap(); // one second of white noise per audio context, for textures

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function unlock() {
    getAudioContext();
  }

  // ---------- building blocks ----------
  function noise(ctx) {
    if (!noiseBuffers.has(ctx)) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noiseBuffers.set(ctx, buffer);
    }
    return noiseBuffers.get(ctx);
  }

  // Every hit varies a little, so repeated sounds don't sound like one sample on repeat
  function vary(value, amount) {
    return value * (1 + (Math.random() * 2 - 1) * amount);
  }

  // A short burst of filtered noise: a slap, click, scrape or crunch
  function noiseBurst(ctx, out, start, { filter, freq, q = 1, peak, attack, decay }) {
    const source = ctx.createBufferSource();
    source.buffer = noise(ctx);
    const shape = ctx.createBiquadFilter();
    shape.type = filter;
    shape.frequency.value = vary(freq, 0.08);
    shape.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vary(peak, 0.15), start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
    source.connect(shape);
    shape.connect(gain);
    gain.connect(out);
    source.start(start, Math.random() * 0.5);
    source.stop(start + attack + decay + 0.02);
  }

  // A low, falling tone: the weight of something landing (a foot, a door in its frame)
  function thump(ctx, out, start, { from, to, peak, length }) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(vary(from, 0.05), start);
    osc.frequency.exponentialRampToValueAtTime(to, start + length);
    gain.gain.setValueAtTime(vary(peak, 0.1), start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + length + 0.01);
  }

  // One decaying partial of something hard ringing (ceramic, metal, a bell)
  function ring(ctx, out, start, { freq, peak, decay, attack = 0.002 }) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
    osc.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + attack + decay + 0.01);
  }

  // A hinge creak: the hinge sticks and slips many times a second, and each slip rings the door's wood and the
  // hinge's metal. Modelled as an uneven train of tiny clicks through a few narrow resonances.
  function creak(ctx, out, start, { length, level }) {
    const sr = ctx.sampleRate;
    const n = Math.floor(length * sr);
    const buffer = ctx.createBuffer(1, n, sr);
    const data = buffer.getChannelData(0);
    const pitch = vary(1, 0.12);
    let next = 0;
    while (next < n) {
      const u = next / n;
      const env = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.7);
      const a = env * (0.55 + Math.random() * 0.45);
      data[next] += a;
      if (next + 1 < n) data[next + 1] -= a * 0.6;
      // slip rate wanders as the door speeds up and slows down
      const rate = pitch * (34 + 26 * Math.sin(Math.PI * u) + 9 * Math.sin(2 * Math.PI * u * 2.3 + 1));
      next += Math.max(1, Math.round(sr / rate * vary(1, 0.18)));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const sum = ctx.createGain();
    sum.gain.value = level;
    [[640, 18, 1.0], [1270, 20, 0.75], [1960, 16, 0.5], [3050, 12, 0.22]].forEach(([freq, q, g]) => {
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = freq * pitch;
      band.Q.value = q;
      const bandGain = ctx.createGain();
      bandGain.gain.value = g;
      source.connect(band);
      band.connect(bandGain);
      bandGain.connect(sum);
    });
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 280;
    sum.connect(highpass);
    highpass.connect(out);
    source.start(start);
    source.stop(start + length + 0.05);
  }

  // Air moving past something swinging: noise swept through a soft band
  function airSweep(ctx, out, start, { length, level, from, to }) {
    const source = ctx.createBufferSource();
    source.buffer = noise(ctx);
    source.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(from, start);
    band.frequency.exponentialRampToValueAtTime(to, start + length);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + length * 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    source.connect(band);
    band.connect(gain);
    gain.connect(out);
    source.start(start, Math.random() * 0.5);
    source.stop(start + length + 0.02);
  }

  // ---------- footsteps ----------
  // Mr. Bear: a heavy, soft-padded paw. On the tiled floor, a muffled pat with a short slap off the hard tile;
  // on the sandy path, a duller landing that crunches grit underfoot.
  function bearStep(ctx, out, now, surface) {
    if (surface === 'path') {
      thump(ctx, out, now, { from: 110, to: 60, peak: 0.07, length: 0.09 });
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 1100, q: 0.7, peak: 0.075, attack: 0.012, decay: 0.15 });
      noiseBurst(ctx, out, now + 0.025, { filter: 'bandpass', freq: 2600, q: 3, peak: 0.03, attack: 0.004, decay: 0.03 });
      noiseBurst(ctx, out, now + 0.06, { filter: 'bandpass', freq: 2200, q: 3, peak: 0.022, attack: 0.004, decay: 0.03 });
    } else {
      thump(ctx, out, now, { from: 150, to: 70, peak: 0.12, length: 0.075 });
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 1800, q: 0.9, peak: 0.07, attack: 0.002, decay: 0.045 });
    }
  }

  // Mr. Turtle: a small, light foot with claws. On the tiled floor, a soft tap and two quick claw clicks; on the
  // sandy path, a light scuff.
  function turtleStep(ctx, out, now, surface) {
    if (surface === 'path') {
      thump(ctx, out, now, { from: 180, to: 100, peak: 0.065, length: 0.06 });
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 1000, q: 0.7, peak: 0.08, attack: 0.01, decay: 0.11 });
      noiseBurst(ctx, out, now + 0.03, { filter: 'bandpass', freq: 2400, q: 3, peak: 0.02, attack: 0.003, decay: 0.025 });
    } else {
      thump(ctx, out, now, { from: 260, to: 150, peak: 0.08, length: 0.05 });
      noiseBurst(ctx, out, now + 0.004, { filter: 'bandpass', freq: 3800, q: 4, peak: 0.085, attack: 0.001, decay: 0.018 });
      noiseBurst(ctx, out, now + 0.026, { filter: 'bandpass', freq: 4300, q: 4, peak: 0.065, attack: 0.001, decay: 0.016 });
    }
  }

  // ---------- doors ----------
  // The handle turns and the latch clicks back (two small metal clicks), then the door swings open on its hinge
  // with a short creak and a little air. Play it as the door starts to move.
  function doorOpen(ctx, out, now) {
    noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 3300, q: 3, peak: 0.2, attack: 0.001, decay: 0.022 });
    ring(ctx, out, now, { freq: vary(2650, 0.04), peak: 0.03, decay: 0.06 });
    noiseBurst(ctx, out, now + 0.085, { filter: 'bandpass', freq: 2400, q: 2.5, peak: 0.15, attack: 0.001, decay: 0.03 });
    thump(ctx, out, now + 0.085, { from: 210, to: 150, peak: 0.06, length: 0.05 });
    creak(ctx, out, now + 0.13, { length: vary(0.55, 0.1), level: 7 });
    airSweep(ctx, out, now + 0.12, { length: 0.6, level: 0.05, from: 300, to: 700 });
  }

  // The door swings to with a little air, thuds into its frame (the wooden slab rings low) and the latch snaps
  // into the strike plate. Play it the moment the door meets the frame.
  function doorClose(ctx, out, now) {
    thump(ctx, out, now, { from: 125, to: 68, peak: 0.17, length: 0.24 });
    thump(ctx, out, now, { from: 250, to: 185, peak: 0.07, length: 0.12 });
    noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 750, q: 0.7, peak: 0.13, attack: 0.002, decay: 0.12 });
    noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 1500, q: 1.2, peak: 0.05, attack: 0.001, decay: 0.04 });
    noiseBurst(ctx, out, now + 0.028, { filter: 'bandpass', freq: 3600, q: 4, peak: 0.08, attack: 0.001, decay: 0.016 });
    ring(ctx, out, now + 0.028, { freq: vary(2900, 0.04), peak: 0.016, decay: 0.05 });
    noiseBurst(ctx, out, now + 0.06, { filter: 'bandpass', freq: 2600, q: 3, peak: 0.035, attack: 0.001, decay: 0.02 });
  }

  // ---------- the cookie and the jars ----------
  // Ceramic crock resonances (Hz), loudest first, and how long each rings
  const CROCK_MODES = [[415, 0.36], [1065, 0.24], [1990, 0.13], [3170, 0.07]];

  function crockRing(ctx, out, start, amount) {
    const tune = vary(1, 0.02);
    CROCK_MODES.forEach(([freq, decay], i) => {
      ring(ctx, out, start, { freq: freq * tune, peak: amount * [1, 0.8, 0.5, 0.3][i], decay });
    });
  }

  // A cookie landing on the bottom of the crock: a dull clunk (it's soft-ish and crumbly), the jar's hollow
  // ring, a tiny bounce and a crumb or two. Gently set down, it's a quieter clunk with hardly any ring.
  function cookieDrop(ctx, out, now, soft) {
    if (soft) {
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 900, q: 0.7, peak: 0.07, attack: 0.002, decay: 0.05 });
      thump(ctx, out, now, { from: 150, to: 105, peak: 0.06, length: 0.07 });
      crockRing(ctx, out, now, 0.012);
      return;
    }
    noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 1400, q: 0.8, peak: 0.17, attack: 0.001, decay: 0.05 });
    thump(ctx, out, now, { from: 170, to: 110, peak: 0.13, length: 0.09 });
    crockRing(ctx, out, now, 0.035);
    // a small bounce
    noiseBurst(ctx, out, now + 0.075, { filter: 'lowpass', freq: 1300, q: 0.8, peak: 0.05, attack: 0.001, decay: 0.03 });
    crockRing(ctx, out, now + 0.075, 0.01);
    // crumbs
    for (let i = 0; i < 3; i++) {
      noiseBurst(ctx, out, now + 0.02 + Math.random() * 0.12,
        { filter: 'bandpass', freq: 5000 + Math.random() * 1800, q: 5, peak: 0.016, attack: 0.001, decay: 0.01 });
    }
  }

  // The cookie scraping off the glazed bottom as the flipper picks it up
  function cookiePickup(ctx, out, now) {
    noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 1900, q: 1.6, peak: 0.11, attack: 0.03, decay: 0.12 });
    noiseBurst(ctx, out, now + 0.05, { filter: 'bandpass', freq: 3200, q: 2, peak: 0.045, attack: 0.02, decay: 0.08 });
    crockRing(ctx, out, now + 0.02, 0.005);
  }

  // A fingertip tapping the glazed side of a crock: a tiny click and a short, bright ceramic ring
  function jarTap(ctx, out, now) {
    noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2800, q: 1.5, peak: 0.07, attack: 0.001, decay: 0.012 });
    thump(ctx, out, now, { from: 320, to: 240, peak: 0.05, length: 0.04 });
    const tune = vary(1, 0.02);
    [[1065, 0.03, 0.16], [1990, 0.022, 0.1], [3170, 0.012, 0.06]].forEach(([freq, peak, decay]) => {
      ring(ctx, out, now, { freq: freq * tune, peak, decay });
    });
  }

  // ---------- buttons ----------
  function hoverTick(ctx, out, now) {
    noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 4200, q: 2, peak: 0.03, attack: 0.001, decay: 0.012 });
    ring(ctx, out, now, { freq: 1750, peak: 0.012, decay: 0.035 });
  }

  // A chunky wooden toy button being pressed
  function selectTok(ctx, out, now) {
    thump(ctx, out, now, { from: 560, to: 400, peak: 0.13, length: 0.06 });
    ring(ctx, out, now, { freq: 1180, peak: 0.03, decay: 0.05 });
    noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2100, q: 1.5, peak: 0.06, attack: 0.001, decay: 0.02 });
  }

  // Three soft handbell notes (C5, E5, G5); a bell's overtones aren't whole multiples of its note
  function bellChime(ctx, out, now) {
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const t = now + i * 0.14;
      [[1, 0.09, 1.1], [2.0, 0.025, 0.6], [2.76, 0.03, 0.4], [5.4, 0.012, 0.18]].forEach(([ratio, peak, decay]) => {
        ring(ctx, out, t, { freq: freq * ratio, peak, decay, attack: 0.004 });
      });
    });
  }

  // More sounds can be added from another file, made from the same building blocks as the ones above
  // (shared/sounds-more.js adds the ones the screens after S4 need)
  const EXTRA = {};
  function add(define) {
    Object.assign(EXTRA, define({ noise, vary, noiseBurst, thump, ring }));
  }

  // Builds one sound into `out` at time `when` (also used to measure sounds with an OfflineAudioContext)
  function build(ctx, out, when, type, options = {}) {
    switch (type) {
      case 'footstep': return bearStep(ctx, out, when, options.surface);
      case 'turtleStep': return turtleStep(ctx, out, when, options.surface);
      case 'doorOpen': return doorOpen(ctx, out, when);
      case 'doorClose': return doorClose(ctx, out, when);
      case 'drop': return cookieDrop(ctx, out, when, !!options.soft);
      case 'cookiePickup': return cookiePickup(ctx, out, when);
      case 'jarTap': return jarTap(ctx, out, when);
      case 'hover': return hoverTick(ctx, out, when);
      case 'select': return selectTok(ctx, out, when);
      case 'prompt': return bellChime(ctx, out, when);
      default:
        if (EXTRA[type]) return EXTRA[type](ctx, out, when, options);
        console.warn('Unknown sound: ' + type);
    }
  }

  // Where the sound comes from: off to one side, further away, or through a shut door
  function placement(ctx, { pan = 0, gain = 1, muffled = false }) {
    let out = ctx.destination;
    if (pan && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      panner.connect(out);
      out = panner;
    }
    if (muffled) {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 650;
      lowpass.connect(out);
      out = lowpass;
      gain *= 0.7;
    }
    if (gain !== 1) {
      const level = ctx.createGain();
      level.gain.value = gain;
      level.connect(out);
      out = level;
    }
    return out;
  }

  function play(type, options = {}) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      build(ctx, placement(ctx, options), ctx.currentTime, type, options);
    } catch (e) {
      console.warn('Audio note prevented: ', e);
    }
  }

  document.addEventListener('click', unlock);

  return { play, unlock, build, add };
})();
