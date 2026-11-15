// Sound effects for every screen, made with the Web Audio API (no sound files). Play one with
// Sounds.play('<name>'). Names: swish and liftSwish (cookie into / out of a jar), cookieLift (pop with sparkle),
// carryGlide, drop (plop), footstep (Mr. Bear) and turtleStep (Mr. Turtle), doorCreak, doorShut,
// hover, select, and prompt (the three-note "your turn" chime). The two steps take the ground underfoot:
// Sounds.play('footstep', { surface: 'tile' }) indoors or { surface: 'path' } on the sandy path outside.
// Browsers only allow sound once the page has been clicked or tapped, so the first click unlocks it.
const Sounds = (() => {
  let audioCtx = null;
  const noiseBuffers = new WeakMap(); // one second of white noise per audio context, for footstep textures

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

  // ---------- footstep building blocks ----------
  function noise(ctx) {
    if (!noiseBuffers.has(ctx)) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noiseBuffers.set(ctx, buffer);
    }
    return noiseBuffers.get(ctx);
  }

  // Each step varies a little, so a walk doesn't sound like one sample on repeat
  function vary(value, amount) {
    return value * (1 + (Math.random() * 2 - 1) * amount);
  }

  // A short burst of filtered noise: the slap, click or crunch of a foot meeting the ground
  function noiseBurst(ctx, start, { filter, freq, q = 1, peak, attack, decay }) {
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
    gain.connect(ctx.destination);
    source.start(start, Math.random() * 0.8);
    source.stop(start + attack + decay + 0.02);
  }

  // A low, falling tone: the weight of the body landing on that foot
  function thump(ctx, start, { from, to, peak, length }) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(vary(from, 0.05), start);
    osc.frequency.exponentialRampToValueAtTime(to, start + length);
    gain.gain.setValueAtTime(vary(peak, 0.1), start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + length + 0.01);
  }

  // Mr. Bear: a heavy, soft-padded paw. On the tiled floor, a muffled pat with a short slap off the hard tile;
  // on the sandy path, a duller landing that crunches grit underfoot.
  function bearStep(ctx, now, surface) {
    if (surface === 'path') {
      thump(ctx, now, { from: 110, to: 60, peak: 0.07, length: 0.09 });
      noiseBurst(ctx, now, { filter: 'lowpass', freq: 1100, q: 0.7, peak: 0.075, attack: 0.012, decay: 0.15 });
      noiseBurst(ctx, now + 0.025, { filter: 'bandpass', freq: 2600, q: 3, peak: 0.03, attack: 0.004, decay: 0.03 });
      noiseBurst(ctx, now + 0.06, { filter: 'bandpass', freq: 2200, q: 3, peak: 0.022, attack: 0.004, decay: 0.03 });
    } else {
      thump(ctx, now, { from: 150, to: 70, peak: 0.12, length: 0.075 });
      noiseBurst(ctx, now, { filter: 'bandpass', freq: 1800, q: 0.9, peak: 0.07, attack: 0.002, decay: 0.045 });
    }
  }

  // Mr. Turtle: a small, light foot with claws. On the tiled floor, a soft tap and two quick claw clicks; on the
  // sandy path, a light scuff.
  function turtleStep(ctx, now, surface) {
    if (surface === 'path') {
      thump(ctx, now, { from: 180, to: 100, peak: 0.065, length: 0.06 });
      noiseBurst(ctx, now, { filter: 'lowpass', freq: 1000, q: 0.7, peak: 0.08, attack: 0.01, decay: 0.11 });
      noiseBurst(ctx, now + 0.03, { filter: 'bandpass', freq: 2400, q: 3, peak: 0.02, attack: 0.003, decay: 0.025 });
    } else {
      thump(ctx, now, { from: 260, to: 150, peak: 0.08, length: 0.05 });
      noiseBurst(ctx, now + 0.004, { filter: 'bandpass', freq: 3800, q: 4, peak: 0.085, attack: 0.001, decay: 0.018 });
      noiseBurst(ctx, now + 0.026, { filter: 'bandpass', freq: 4300, q: 4, peak: 0.065, attack: 0.001, decay: 0.016 });
    }
  }

  // Friendly cartoon Web Audio synthesis sound effects
  function play(type, options = {}) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'swish') {
        // Descending slide whistle/swish (putting cookie into jar)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(1400, now + 0.3);
        filter.frequency.linearRampToValueAtTime(400, now + 0.7);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.7);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.3);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.71);
      } else if (type === 'liftSwish') {
        // Ascending cartoon slide whistle for lifting cookie out of left jar
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.linearRampToValueAtTime(1200, now + 0.4);
        filter.frequency.linearRampToValueAtTime(1600, now + 0.75);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.75);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.20, now + 0.35);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.75);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.76);
      } else if (type === 'cookieLift') {
        // Ascending popping sound when cookie reaches top apex above jar
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.32);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.33);

        [780, 980].forEach((freq, idx) => {
          const sp = ctx.createOscillator();
          const g = ctx.createGain();
          sp.type = 'triangle';
          sp.frequency.setValueAtTime(freq, now + 0.08 + idx * 0.08);
          g.gain.setValueAtTime(0.1, now + 0.08 + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.28 + idx * 0.08);
          sp.connect(g);
          g.connect(ctx.destination);
          sp.start(now + 0.08 + idx * 0.08);
          sp.stop(now + 0.30 + idx * 0.08);
        });
      } else if (type === 'carryGlide') {
        // Gentle glide while turtle transports cookie across table
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.linearRampToValueAtTime(460, now + 0.6);
        osc.frequency.linearRampToValueAtTime(360, now + 1.2);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
        gain.gain.linearRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.22);
      } else if (type === 'drop') {
        // Cartoon plop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.28);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.29);
      } else if (type === 'footstep') {
        bearStep(ctx, now, options.surface);
      } else if (type === 'turtleStep') {
        turtleStep(ctx, now, options.surface);
      } else if (type === 'doorCreak') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.27);
      } else if (type === 'doorShut') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'hover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(940, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'select') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'prompt') {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.11);
          gain.gain.setValueAtTime(0.15, now + i * 0.11);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.11 + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.11);
          osc.stop(now + i * 0.11 + 0.33);
        });
      }
    } catch (e) {
      console.warn('Audio note prevented: ', e);
    }
  }

  document.addEventListener('click', unlock);

  return { play, unlock };
})();
