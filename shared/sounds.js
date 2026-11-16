// Sound effects for every screen, made with the Web Audio API (no sound files). Each one is modelled on the real
// thing (a latch clicking, a lid on a ceramic jar, water filling a glass) rather than a cartoon tone, and each
// is played only when that thing happens on screen: Sounds.play('<name>', options).
//
//   step          a footstep. { who: 'bear' | 'cub' | 'big' | 'turtle' | 'duck' | 'pig' | 'rabbit',
//                 surface: 'floor' | 'ground' }
//   doorOpen, doorClose
//   lidOff, lidOn, drop ({ soft }), cookiePickup, jarTap        the ceramic cookie jars
//   marker, eraser                                              drawing on, and wiping, a whiteboard
//   boxFlap, rattle, cardboard                                  a cardboard box; marbles rolling in it
//   block, cloth, drawerOpen, drawerClose                       tidying up
//   fridgeOpen, fridgeClose, munch, wrapper                     the kitchen; eating
//   plink                                                       something small dropped into a glass jar
//   pour ({ length }), gulp                                     water
//   splash                                                      paint spilling
//   blow                                                        one puff into a balloon
//   kick, net, bounce, clang                                    balls and the jungle gym
//   roll ({ length })                                           scooter wheels
//   click                                                       a TV remote
//   card, hover, select, prompt                                 the answer buttons
//
// Where it happens can go in the options too: { pan: -1 (left) .. 1 (right), gain: 0..1 (quieter when further
// away), muffled: true (heard through a shut door) }.
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

  // One decaying partial of something hard ringing (ceramic, glass, metal, a bell)
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

  // A tone that slides (a squeak, rubber stretching)
  function slide(ctx, out, start, { from, to, peak, length, type = 'triangle' }) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(to, start + length);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + length * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + length + 0.01);
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

  // Air or water moving: noise swept through a soft band
  function sweep(ctx, out, start, { length, level, from, to, q = 0.9, rise = 0.45 }) {
    const source = ctx.createBufferSource();
    source.buffer = noise(ctx);
    source.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = q;
    band.frequency.setValueAtTime(from, start);
    band.frequency.exponentialRampToValueAtTime(to, start + length);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + length * rise);
    gain.gain.setValueAtTime(level, start + length * Math.max(rise, 0.8));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    source.connect(band);
    band.connect(gain);
    gain.connect(out);
    source.start(start, Math.random() * 0.5);
    source.stop(start + length + 0.02);
  }

  // ---------- footsteps ----------
  // [thump from, to, peak, length], then the slap or scuff of the foot, then any claws, webs or hooves.
  // Indoors is a hard floor (a pat and a slap); outdoors is ground (a duller landing and a little grit).
  const FEET = {
    bear: { floor: [150, 70, 0.12, 0.075, 1800, 0.07, 0.045], ground: [110, 60, 0.07, 0.09, 1100, 0.075, 0.15] },
    big: { floor: [125, 58, 0.14, 0.09, 1500, 0.075, 0.05], ground: [95, 52, 0.085, 0.1, 1000, 0.08, 0.16] },
    cub: { floor: [190, 95, 0.085, 0.06, 2100, 0.055, 0.04], ground: [140, 80, 0.055, 0.07, 1300, 0.06, 0.12] },
    rabbit: { floor: [170, 85, 0.08, 0.06, 1600, 0.05, 0.05], ground: [130, 70, 0.055, 0.08, 1100, 0.06, 0.13] },
    turtle: { floor: [260, 150, 0.08, 0.05, 0, 0, 0], ground: [180, 100, 0.065, 0.06, 1000, 0.08, 0.11] },
    duck: { floor: [300, 180, 0.05, 0.04, 2600, 0.085, 0.05], ground: [220, 130, 0.04, 0.05, 1500, 0.07, 0.1] },
    pig: { floor: [210, 120, 0.09, 0.05, 0, 0, 0], ground: [150, 85, 0.07, 0.07, 1200, 0.07, 0.12] },
  };

  function step(ctx, out, now, o) {
    const outside = o.surface === 'ground';
    const f = (FEET[o.who] || FEET.bear)[outside ? 'ground' : 'floor'];
    thump(ctx, out, now, { from: f[0], to: f[1], peak: f[2], length: f[3] });
    if (f[4]) noiseBurst(ctx, out, now, { filter: outside ? 'lowpass' : 'bandpass', freq: f[4], q: 0.8, peak: f[5], attack: outside ? 0.012 : 0.002, decay: f[6] });
    if (outside) {
      noiseBurst(ctx, out, now + 0.03, { filter: 'bandpass', freq: 2500, q: 3, peak: 0.022, attack: 0.004, decay: 0.03 });
    } else if (o.who === 'turtle') { // two quick claw clicks
      noiseBurst(ctx, out, now + 0.004, { filter: 'bandpass', freq: 3800, q: 4, peak: 0.085, attack: 0.001, decay: 0.018 });
      noiseBurst(ctx, out, now + 0.026, { filter: 'bandpass', freq: 4300, q: 4, peak: 0.065, attack: 0.001, decay: 0.016 });
    } else if (o.who === 'pig') { // a hoof
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2900, q: 3, peak: 0.1, attack: 0.001, decay: 0.022 });
      ring(ctx, out, now, { freq: 1500, peak: 0.02, decay: 0.03 });
    }
  }

  // ---------- doors ----------
  // The handle turns and the latch clicks back, then the door swings open on its hinge with a short creak
  function doorOpen(ctx, out, now) {
    noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 3300, q: 3, peak: 0.2, attack: 0.001, decay: 0.022 });
    ring(ctx, out, now, { freq: vary(2650, 0.04), peak: 0.03, decay: 0.06 });
    noiseBurst(ctx, out, now + 0.085, { filter: 'bandpass', freq: 2400, q: 2.5, peak: 0.15, attack: 0.001, decay: 0.03 });
    thump(ctx, out, now + 0.085, { from: 210, to: 150, peak: 0.06, length: 0.05 });
    creak(ctx, out, now + 0.13, { length: vary(0.42, 0.1), level: 7 });
    sweep(ctx, out, now + 0.12, { length: 0.5, level: 0.05, from: 300, to: 700 });
  }

  // The door thuds into its frame (the wooden slab rings low) and the latch snaps into the strike plate
  function doorClose(ctx, out, now) {
    thump(ctx, out, now, { from: 125, to: 68, peak: 0.17, length: 0.24 });
    thump(ctx, out, now, { from: 250, to: 185, peak: 0.07, length: 0.12 });
    noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 750, q: 0.7, peak: 0.13, attack: 0.002, decay: 0.12 });
    noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 1500, q: 1.2, peak: 0.05, attack: 0.001, decay: 0.04 });
    noiseBurst(ctx, out, now + 0.028, { filter: 'bandpass', freq: 3600, q: 4, peak: 0.08, attack: 0.001, decay: 0.016 });
    ring(ctx, out, now + 0.028, { freq: vary(2900, 0.04), peak: 0.016, decay: 0.05 });
    noiseBurst(ctx, out, now + 0.06, { filter: 'bandpass', freq: 2600, q: 3, peak: 0.035, attack: 0.001, decay: 0.02 });
  }

  // ---------- ceramic and glass ----------
  // A ceramic crock's resonances (Hz), loudest first, and how long each rings
  const CROCK = [[415, 0.36], [1065, 0.24], [1990, 0.13], [3170, 0.07]];
  function crockRing(ctx, out, start, amount, from = 0) {
    const tune = vary(1, 0.02);
    CROCK.slice(from).forEach(([freq, decay], i) => {
      ring(ctx, out, start, { freq: freq * tune, peak: amount * [1, 0.8, 0.5, 0.3][i], decay });
    });
  }

  // Something landing on the bottom of the crock: a dull clunk, the jar's hollow ring, a tiny bounce
  function drop(ctx, out, now, o) {
    if (o.soft) {
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 900, q: 0.7, peak: 0.07, attack: 0.002, decay: 0.05 });
      thump(ctx, out, now, { from: 150, to: 105, peak: 0.06, length: 0.07 });
      crockRing(ctx, out, now, 0.012);
      return;
    }
    noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 1400, q: 0.8, peak: 0.17, attack: 0.001, decay: 0.05 });
    thump(ctx, out, now, { from: 170, to: 110, peak: 0.13, length: 0.09 });
    crockRing(ctx, out, now, 0.035);
    noiseBurst(ctx, out, now + 0.075, { filter: 'lowpass', freq: 1300, q: 0.8, peak: 0.05, attack: 0.001, decay: 0.03 });
    crockRing(ctx, out, now + 0.075, 0.01);
  }

  const SOUNDS = {
    step,
    doorOpen,
    doorClose,
    drop,

    // The lid scraping off the rim, and settling back on it with a clack
    lidOff(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2300, q: 1.6, peak: 0.07, attack: 0.02, decay: 0.09 });
      crockRing(ctx, out, now + 0.02, 0.012, 1);
    },
    lidOn(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 1700, q: 0.8, peak: 0.11, attack: 0.001, decay: 0.035 });
      thump(ctx, out, now, { from: 230, to: 160, peak: 0.05, length: 0.05 });
      crockRing(ctx, out, now, 0.03, 1);
      noiseBurst(ctx, out, now + 0.06, { filter: 'bandpass', freq: 2600, q: 2, peak: 0.03, attack: 0.001, decay: 0.02 });
    },
    // The cookie scraping off the glazed bottom as it's picked up
    cookiePickup(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 1900, q: 1.6, peak: 0.11, attack: 0.03, decay: 0.12 });
      noiseBurst(ctx, out, now + 0.05, { filter: 'bandpass', freq: 3200, q: 2, peak: 0.045, attack: 0.02, decay: 0.08 });
      crockRing(ctx, out, now + 0.02, 0.005);
    },
    // A fingertip tapping the glazed side of a crock
    jarTap(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2800, q: 1.5, peak: 0.07, attack: 0.001, decay: 0.012 });
      thump(ctx, out, now, { from: 320, to: 240, peak: 0.05, length: 0.04 });
      crockRing(ctx, out, now, 0.03, 1);
    },
    // Something small and hard landing in a glass jar or on glass
    plink(ctx, out, now) {
      const tune = vary(1, 0.05);
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 5200, q: 3, peak: 0.05, attack: 0.001, decay: 0.012 });
      ring(ctx, out, now, { freq: 2350 * tune, peak: 0.05, decay: 0.2 });
      ring(ctx, out, now, { freq: 3900 * tune, peak: 0.025, decay: 0.12 });
      ring(ctx, out, now + 0.07, { freq: 2350 * tune, peak: 0.014, decay: 0.1 });
    },

    // ---------- drawing ----------
    // A marker stroke on a whiteboard: a soft rub with a faint squeak
    marker(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2600, q: 1.3, peak: 0.04, attack: 0.05, decay: 0.2 });
      slide(ctx, out, now + 0.02, { from: vary(1900, 0.1), to: vary(2300, 0.1), peak: 0.006, length: 0.14, type: 'sine' });
    },
    eraser(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 950, q: 0.7, peak: 0.07, attack: 0.07, decay: 0.2 });
    },

    // ---------- cardboard, marbles ----------
    boxFlap(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 1300, q: 0.8, peak: 0.08, attack: 0.008, decay: 0.08 });
      thump(ctx, out, now, { from: 320, to: 210, peak: 0.035, length: 0.05 });
    },
    // A cardboard box handled or set down
    cardboard(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 1500, q: 1, peak: 0.05, attack: 0.03, decay: 0.1 });
      thump(ctx, out, now + 0.03, { from: 260, to: 170, peak: 0.03, length: 0.06 });
    },
    // Marbles knocking against each other and the box
    rattle(ctx, out, now, o) {
      const length = o.length || 0.6;
      for (let i = 0, n = Math.round(length * 14); i < n; i++) {
        const at = now + Math.random() * length;
        ring(ctx, out, at, { freq: 2400 + Math.random() * 2200, peak: 0.022, decay: 0.05 });
        noiseBurst(ctx, out, at, { filter: 'bandpass', freq: 5000, q: 3, peak: 0.02, attack: 0.001, decay: 0.008 });
        if (i % 3 === 0) thump(ctx, out, at, { from: 340, to: 240, peak: 0.02, length: 0.04 });
      }
    },

    // ---------- tidying up ----------
    block(ctx, out, now) {
      thump(ctx, out, now, { from: 720, to: 520, peak: 0.09, length: 0.04 });
      ring(ctx, out, now, { freq: vary(1350, 0.08), peak: 0.03, decay: 0.05 });
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2500, q: 1.5, peak: 0.05, attack: 0.001, decay: 0.014 });
    },
    cloth(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 750, q: 0.7, peak: 0.06, attack: 0.04, decay: 0.16 });
    },
    drawerOpen(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 520, q: 1, peak: 0.08, attack: 0.1, decay: 0.16 });
    },
    drawerClose(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 520, q: 1, peak: 0.07, attack: 0.08, decay: 0.1 });
      thump(ctx, out, now + 0.17, { from: 150, to: 90, peak: 0.13, length: 0.12 });
      noiseBurst(ctx, out, now + 0.17, { filter: 'lowpass', freq: 800, q: 0.7, peak: 0.08, attack: 0.002, decay: 0.07 });
    },

    // ---------- kitchen ----------
    // The door's rubber seal letting go, and the bottles in the door rattling
    fridgeOpen(ctx, out, now) {
      thump(ctx, out, now, { from: 170, to: 95, peak: 0.1, length: 0.09 });
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 520, q: 0.7, peak: 0.09, attack: 0.004, decay: 0.09 });
      ring(ctx, out, now + 0.08, { freq: 2250, peak: 0.012, decay: 0.1 });
      ring(ctx, out, now + 0.13, { freq: 3100, peak: 0.009, decay: 0.08 });
    },
    fridgeClose(ctx, out, now) {
      thump(ctx, out, now, { from: 115, to: 62, peak: 0.16, length: 0.16 });
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 620, q: 0.7, peak: 0.1, attack: 0.002, decay: 0.1 });
      ring(ctx, out, now + 0.03, { freq: 2250, peak: 0.014, decay: 0.12 });
      ring(ctx, out, now + 0.07, { freq: 3100, peak: 0.01, decay: 0.09 });
    },
    // A few crunchy bites
    munch(ctx, out, now, o) {
      for (let i = 0, n = o.bites || 3; i < n; i++) {
        const at = now + i * 0.19;
        noiseBurst(ctx, out, at, { filter: 'bandpass', freq: 1800, q: 0.9, peak: 0.09, attack: 0.004, decay: 0.05 });
        noiseBurst(ctx, out, at, { filter: 'lowpass', freq: 700, q: 0.7, peak: 0.06, attack: 0.004, decay: 0.07 });
      }
    },
    // A sweet wrapper crinkling open
    wrapper(ctx, out, now) {
      for (let i = 0; i < 6; i++) {
        noiseBurst(ctx, out, now + i * 0.045 + Math.random() * 0.02, { filter: 'highpass', freq: 4200, q: 0.7, peak: 0.035, attack: 0.002, decay: 0.02 });
      }
    },

    // ---------- water, paint ----------
    // Water pouring into a glass: the note rises as the glass fills
    pour(ctx, out, now, o) {
      const length = o.length || 1.2;
      sweep(ctx, out, now, { length, level: 0.06, from: 520, to: 1500, q: 1.4, rise: 0.12 });
      sweep(ctx, out, now, { length, level: 0.03, from: 2600, to: 3400, q: 0.8, rise: 0.12 });
      for (let i = 0, n = Math.round(length * 9); i < n; i++) {
        ring(ctx, out, now + Math.random() * length, { freq: 380 + Math.random() * 500, peak: 0.012, decay: 0.05 });
      }
    },
    gulp(ctx, out, now, o) {
      for (let i = 0, n = o.times || 3; i < n; i++) {
        const at = now + i * 0.34;
        thump(ctx, out, at, { from: 240, to: 130, peak: 0.07, length: 0.09 });
        noiseBurst(ctx, out, at + 0.05, { filter: 'lowpass', freq: 600, q: 0.7, peak: 0.02, attack: 0.01, decay: 0.05 });
      }
    },
    // Thick paint landing: a wet slap, then drips
    splash(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 1900, q: 0.7, peak: 0.17, attack: 0.005, decay: 0.18 });
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 620, q: 0.9, peak: 0.09, attack: 0.01, decay: 0.3 });
      thump(ctx, out, now, { from: 190, to: 90, peak: 0.08, length: 0.12 });
      [0.22, 0.34, 0.5].forEach(after => ring(ctx, out, now + after, { freq: 700 + Math.random() * 500, peak: 0.015, decay: 0.05 }));
    },

    // ---------- play ----------
    // One long breath into a balloon, and the rubber stretching
    blow(ctx, out, now) {
      sweep(ctx, out, now, { length: 0.55, level: 0.07, from: 700, to: 1700, q: 0.8, rise: 0.25 });
      slide(ctx, out, now + 0.12, { from: vary(250, 0.08), to: vary(380, 0.08), peak: 0.012, length: 0.4 });
    },
    kick(ctx, out, now) {
      thump(ctx, out, now, { from: 190, to: 72, peak: 0.2, length: 0.12 });
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 950, q: 0.7, peak: 0.1, attack: 0.002, decay: 0.05 });
    },
    // A ball pushing into a net
    net(ctx, out, now) {
      sweep(ctx, out, now, { length: 0.3, level: 0.05, from: 2400, to: 700, q: 0.8, rise: 0.1 });
    },
    bounce(ctx, out, now) {
      thump(ctx, out, now, { from: 310, to: 150, peak: 0.12, length: 0.09 });
      noiseBurst(ctx, out, now, { filter: 'lowpass', freq: 1200, q: 0.7, peak: 0.04, attack: 0.002, decay: 0.03 });
    },
    // Feet landing on the metal bars of the jungle gym
    clang(ctx, out, now) {
      thump(ctx, out, now, { from: 180, to: 110, peak: 0.07, length: 0.07 });
      ring(ctx, out, now, { freq: vary(880, 0.04), peak: 0.03, decay: 0.3 });
      ring(ctx, out, now, { freq: vary(2140, 0.04), peak: 0.014, decay: 0.16 });
    },
    // Small hard wheels rolling along the path
    roll(ctx, out, now, o) {
      const length = o.length || 1;
      sweep(ctx, out, now, { length, level: 0.05, from: 260, to: 340, q: 0.7, rise: 0.15 });
      for (let i = 0, n = Math.round(length * 11); i < n; i++) {
        noiseBurst(ctx, out, now + i * length / n, { filter: 'bandpass', freq: 1900, q: 2, peak: 0.012, attack: 0.001, decay: 0.012 });
      }
    },
    click(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 3500, q: 2, peak: 0.06, attack: 0.001, decay: 0.012 });
      thump(ctx, out, now, { from: 900, to: 700, peak: 0.02, length: 0.02 });
    },

    // ---------- answer buttons ----------
    // A paper card flicking into place
    card(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2400, q: 1, peak: 0.035, attack: 0.004, decay: 0.05 });
    },
    hover(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 4200, q: 2, peak: 0.03, attack: 0.001, decay: 0.012 });
      ring(ctx, out, now, { freq: 1750, peak: 0.012, decay: 0.035 });
    },
    // A chunky wooden toy button being pressed
    select(ctx, out, now) {
      thump(ctx, out, now, { from: 560, to: 400, peak: 0.13, length: 0.06 });
      ring(ctx, out, now, { freq: 1180, peak: 0.03, decay: 0.05 });
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2100, q: 1.5, peak: 0.06, attack: 0.001, decay: 0.02 });
    },
    // Three soft handbell notes (C5, E5, G5), "your turn"; a bell's overtones aren't whole multiples of its note
    prompt(ctx, out, now) {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const t = now + i * 0.14;
        [[1, 0.09, 1.1], [2.0, 0.025, 0.6], [2.76, 0.03, 0.4], [5.4, 0.012, 0.18]].forEach(([ratio, peak, decay]) => {
          ring(ctx, out, t, { freq: freq * ratio, peak, decay, attack: 0.004 });
        });
      });
    },
  };

  // Loudness trims, from measuring every sound against a footstep: these came out too quiet to notice
  const LOUDER = {
    munch: 3.2, wrapper: 3, click: 3.5, rattle: 2.2, marker: 2.6, eraser: 2.4, lidOff: 2.4, boxFlap: 2.6, cardboard: 2.2,
    cloth: 2.8, drawerOpen: 2.6, roll: 3, pour: 1.5, card: 2, cookiePickup: 1.6,
  };

  // Builds one sound into `out` at time `when` (also used to measure sounds with an OfflineAudioContext)
  function build(ctx, out, when, type, options = {}) {
    if (!SOUNDS[type]) return console.warn('Unknown sound: ' + type);
    if (LOUDER[type]) {
      const trim = ctx.createGain();
      trim.gain.value = LOUDER[type];
      trim.connect(out);
      out = trim;
    }
    SOUNDS[type](ctx, out, when, options);
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

  return { play, unlock, build, names: Object.keys(SOUNDS) };
})();
