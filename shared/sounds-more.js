// The sounds the screens after S4 need, added to the ones in shared/sounds.js and made from the same building
// blocks (a burst of filtered noise, a thump, a ringing tone). Like those, each belongs to something that
// happens on screen: play it with Sounds.play('<name>', { pan, gain, muffled }) as the thing happens.
//
//   step { who, surface }      a footstep. Mr. Bear and Mr. Turtle keep the footsteps they have in S3a and S4;
//                              the others get their own (a cub, a grown-up bear, a rabbit, webbed feet, trotters)
//   plink                      something small and hard landing in a glass jar
//   marker / eraser            a stroke on the drawing board, and wiping it
//   boxFlap / cardboard / rattle { length }   a cardboard box, and marbles rolling
//   block / cloth / drawerOpen / drawerClose  tidying up
//   fridgeOpen / fridgeClose / munch / wrapper
//   pour { length } / gulp { times } / splash
//   blow / kick / net / bounce / clang / roll { length } / click
Sounds.add(({ noise, vary, noiseBurst, thump, ring }) => {
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
  // [thump from, to, peak, length], then the slap or scuff of the foot. Indoors is a hard floor (a pat and a
  // slap); outdoors is the path (a duller landing and a little grit).
  const FEET = {
    big: { floor: [125, 58, 0.14, 0.09, 1500, 0.075, 0.05], path: [95, 52, 0.085, 0.1, 1000, 0.08, 0.16] },
    cub: { floor: [190, 95, 0.085, 0.06, 2100, 0.055, 0.04], path: [140, 80, 0.055, 0.07, 1300, 0.06, 0.12] },
    rabbit: { floor: [170, 85, 0.08, 0.06, 1600, 0.05, 0.05], path: [130, 70, 0.055, 0.08, 1100, 0.06, 0.13] },
    duck: { floor: [300, 180, 0.05, 0.04, 2600, 0.085, 0.05], path: [220, 130, 0.04, 0.05, 1500, 0.07, 0.1] },
    pig: { floor: [210, 120, 0.09, 0.05, 0, 0, 0], path: [150, 85, 0.07, 0.07, 1200, 0.07, 0.12] },
  };

  function step(ctx, out, now, o) {
    const outside = o.surface === 'ground' || o.surface === 'path';
    if (o.who === 'turtle') return Sounds.build(ctx, out, now, 'turtleStep', { surface: outside ? 'path' : 'floor' });
    if (!FEET[o.who]) return Sounds.build(ctx, out, now, 'footstep', { surface: outside ? 'path' : 'floor' });
    const f = FEET[o.who][outside ? 'path' : 'floor'];
    thump(ctx, out, now, { from: f[0], to: f[1], peak: f[2], length: f[3] });
    if (f[4]) noiseBurst(ctx, out, now, { filter: outside ? 'lowpass' : 'bandpass', freq: f[4], q: 0.8, peak: f[5], attack: outside ? 0.012 : 0.002, decay: f[6] });
    if (outside) {
      noiseBurst(ctx, out, now + 0.03, { filter: 'bandpass', freq: 2500, q: 3, peak: 0.022, attack: 0.004, decay: 0.03 });
    } else if (o.who === 'pig') { // a hoof
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 2900, q: 3, peak: 0.1, attack: 0.001, decay: 0.022 });
      ring(ctx, out, now, { freq: 1500, peak: 0.02, decay: 0.03 });
    }
  }

  const SOUNDS = {
    step,

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
    // A button on a remote control
    click(ctx, out, now) {
      noiseBurst(ctx, out, now, { filter: 'bandpass', freq: 3500, q: 2, peak: 0.06, attack: 0.001, decay: 0.012 });
      thump(ctx, out, now, { from: 900, to: 700, peak: 0.02, length: 0.02 });
    },
  };

  // Loudness trims, from measuring every sound against a footstep: these came out too quiet to notice
  const LOUDER = {
    munch: 3.2, wrapper: 3, click: 3.5, rattle: 2.2, marker: 2.6, eraser: 2.4, boxFlap: 2.6, cardboard: 2.2,
    cloth: 2.8, drawerOpen: 2.6, roll: 3, pour: 1.5,
  };
  const made = {};
  Object.keys(SOUNDS).forEach(type => {
    made[type] = (ctx, out, when, options) => {
      let into = out;
      if (LOUDER[type]) {
        into = ctx.createGain();
        into.gain.value = LOUDER[type];
        into.connect(out);
      }
      SOUNDS[type](ctx, into, when, options);
    };
  });
  return made;
});
