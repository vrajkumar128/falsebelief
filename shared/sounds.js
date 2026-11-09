// Sound effects for every screen, made with the Web Audio API (no sound files). Play one with
// Sounds.play('<name>'). Names: swish and liftSwish (cookie into / out of a jar), cookieLift (pop with sparkle),
// carryGlide, drop (plop with bell notes), footstep, turtleStep, doorCreak, doorShut, hover, select, and prompt
// (the three-note "your turn" chime). Browsers only allow sound once the page has been clicked or tapped, so the
// first click unlocks it.
const Sounds = (() => {
  let audioCtx = null;

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

  // Friendly cartoon Web Audio synthesis sound effects
  function play(type) {
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
        // Cartoon plop with resonant chime harmonics
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

        [880, 1174.66, 1396.91, 1760].forEach((freq, idx) => {
          const spOsc = ctx.createOscillator();
          const spGain = ctx.createGain();
          spOsc.type = 'triangle';
          spOsc.frequency.setValueAtTime(freq, now + 0.05 + idx * 0.06);
          spGain.gain.setValueAtTime(0.12, now + 0.05 + idx * 0.06);
          spGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32 + idx * 0.06);
          spOsc.connect(spGain);
          spGain.connect(ctx.destination);
          spOsc.start(now + 0.05 + idx * 0.06);
          spOsc.stop(now + 0.35 + idx * 0.06);
        });
      } else if (type === 'footstep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      } else if (type === 'turtleStep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.09);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
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
