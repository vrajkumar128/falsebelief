// Asking the child a question, on the screens after S4. A scene asks with:
//
//   S.ask({
//     id: 's6.q', say: 's6.q',            // its name in the answer log, and the narration line that asks it
//     kind: 'test',                       // 'test' | 'attention' | 'reality' | 'guess' (the scene's kind unless said)
//     correct: 'butterfly',               // left out when there is no right answer (the crayon-box guess)
//     who: 'bear',                        // optional: whose mind the question is about, shown as a small badge
//     cards: [{ value: 'butterfly', label: 'A butterfly', art: '<svg shapes, drawn around (0, 0), about 200 x 150>' },
//             { value: 'bus', label: 'A school bus', art: '...' }],
//     // ...or, when the answers are things in the scene itself:
//     things: [{ value: 'gym', label: 'The jungle gym', hit: { x, y, rx, ry } }, { value: 'totter', ... }],
//   });
//
// It works like the questions in S3a and S4. Picture answers are buttons like the two under the schools: a face
// that presses down onto its dark ledge. Things in the scene get the same yellow guide ring as the schools and
// the jars: it shows on both for a moment when it's time to choose, and stays on the one that is tapped.
// The story's clock stops while a question is up. The answers appear, the question is said, and only then can
// they be tapped (so a child can't answer before hearing it). Nothing shows whether an answer was right. If
// nothing is tapped for a while the question is asked again. Every answer goes to Study.record.
//
// Which answer is on which side comes from Study.firstOnLeft: buttons are simply swapped; for things, the whole
// scene is drawn mirrored (see Story.scene's `spatial`), and the side is read from where each thing ends up.
const Question = (() => {
  const { svg, m, plain } = Engine;
  const INK = Look.INK, CREAM = '#fffaf2', GLOW = '#ffeb3b';
  // The buttons sit low, clear of whatever is on the table (so the child can still see how things really are)
  const CARD = { w: 236, h: 176, y: 540, x: [352, 648] };
  let live = null;

  const panOf = x => ({ pan: Math.max(-1, Math.min(1, (x - 500) / 500 * 0.7)) });

  function present(S, hold, done) {
    const q = hold.question;
    const ui = svg('g', null, S.ui);
    const state = live = { S, hold, q, done, ui, t: 0, phase: 'asking', asked: false, opts: [], reprompts: 0, glowUntil: 0 };

    if (q.cards) {
      const box = (x, y, w, h, round, fill, extra) => plain.r(x - w / 2, y - h / 2, w, h, round, fill, extra);
      q.cards.forEach((card, i) => {
        const place = (i === 0) === S.firstOnLeft ? 0 : 1, cx = CARD.x[place];
        const pos = svg('g', { transform: `translate(${cx} ${CARD.y})` }, ui);
        const reveal = svg('g', { class: 'opt-reveal' }, pos);
        const g = svg('g', { class: 'opt is-waiting', role: 'button', 'aria-label': card.label }, reveal);
        g.innerHTML = box(0, 4, CARD.w + 26, CARD.h + 34, 40, 'none', 'class="opt-focus"') +
          box(0, 8, CARD.w, CARD.h, 30, INK) +
          `<g class="opt-top">${box(0, 0, CARD.w, CARD.h, 30, CREAM, `stroke="${INK}" stroke-width="5"`)}<g>${card.art}</g></g>`;
        state.opts.push({ g, reveal, value: card.value, x: cx, side: place ? 'right' : 'left' });
      });
      // Whose mind the question is about: their face, between the two buttons
      if (q.who) {
        const badge = svg('g', { transform: 'translate(500 500)' }, ui);
        state.badge = svg('g', { class: 'opt-reveal' }, badge);
        state.badge.innerHTML = plain.c(0, 0, 46, CREAM, `stroke="${INK}" stroke-width="4.5"`) + m.g('scale(0.4)', Cast.head(q.who));
      }
    } else {
      q.things.forEach(thing => {
        const hit = thing.hit, cx = S.flip ? Engine.W - hit.x : hit.x;
        const pos = svg('g', { transform: `translate(${cx} ${hit.y})` }, ui);
        const g = svg('g', { class: 'opt opt--thing is-waiting', role: 'button', 'aria-label': thing.label }, pos);
        g.innerHTML = `<ellipse rx="${hit.rx}" ry="${hit.ry}" fill="#000" fill-opacity="0"/>` +
          `<ellipse class="opt-glow" rx="${hit.rx}" ry="${hit.ry}" fill="none" stroke="${GLOW}" stroke-width="9"/>`;
        state.opts.push({ g, value: thing.value, x: cx, side: cx < 500 ? 'left' : 'right' });
      });
    }

    state.opts.forEach((opt, i) => {
      opt.g.addEventListener('click', () => choose(state, i));
      opt.g.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        choose(state, i);
      });
      opt.g.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse' && state.phase === 'open') Sounds.play('hover', panOf(opt.x));
      });
    });
    state.askAt = 0.55;
    state.openAt = state.askAt + (q.say ? Narration.duration(q.say) : 0.3);
  }

  // Runs on the scene's clock while the question is up
  function tick(S, dt) {
    const state = live;
    if (!state || state.S !== S) return;
    state.t += dt;
    if (!state.shown && state.t > 0.05) { // the buttons slide up into place
      state.shown = true;
      state.opts.forEach(opt => opt.reveal && opt.reveal.classList.add('is-shown'));
      if (state.badge) state.badge.classList.add('is-shown');
    }
    if (state.glowUntil && state.t >= state.glowUntil) {
      state.glowUntil = 0;
      state.opts.forEach(opt => opt.g.classList.remove('is-nudge'));
    }
    if (state.phase === 'asking') {
      if (!state.asked && state.t >= state.askAt) {
        state.asked = true;
        state.hold.line = state.q.say || null;
        if (state.q.say) Narration.play(state.q.say);
      }
      if (state.t >= state.openAt) open(state);
    } else if (state.phase === 'open') {
      if (state.t - state.promptedAt > STUDY.repromptAfter) {
        state.reprompts++;
        state.promptedAt = state.t;
        if (state.q.say) Narration.play(state.q.say);
        nudge(state);
      }
    } else if (state.phase === 'chosen' && state.t >= state.closeAt) {
      finish(state);
    }
  }

  // "Your turn": the chime, and a moment's guide ring on both things (or a little hop of both buttons), the same
  // for both so neither is suggested
  function nudge(state) {
    state.opts.forEach(opt => {
      opt.g.classList.remove('is-nudge');
      opt.g.getBoundingClientRect();
      opt.g.classList.add('is-nudge');
    });
    state.glowUntil = state.t + 0.75;
    Sounds.play('prompt');
  }

  function open(state) {
    state.phase = 'open';
    state.promptedAt = state.t;
    state.openedAt = performance.now();
    state.opts.forEach(opt => {
      opt.g.classList.remove('is-waiting');
      opt.g.setAttribute('tabindex', '0');
    });
    nudge(state);
  }

  function choose(state, index) {
    if (state.phase !== 'open') return;
    state.phase = 'chosen';
    const { S, q } = state, picked = state.opts[index];
    state.glowUntil = 0;
    state.opts.forEach((opt, i) => {
      opt.g.classList.remove('is-nudge');
      opt.g.classList.add('is-done', i === index ? 'is-chosen' : 'is-dim');
    });
    Sounds.play(q.tap || 'select', panOf(picked.x));
    const on = side => (state.opts.find(opt => opt.side === side) || {}).value;
    Study.record({
      screen: S.id,
      kind: q.kind || S.kind,
      question: q.id,
      asked: q.say ? Narration.text(q.say) : '',
      left: on('left'),
      right: on('right'),
      choice: picked.value,
      side: picked.side,
      correctAnswer: q.correct === undefined ? '' : q.correct,
      correct: q.correct === undefined ? '' : (picked.value === q.correct ? 1 : 0),
      rtMs: Math.round(performance.now() - state.openedAt),
      reprompts: state.reprompts,
    });
    state.closeAt = state.t + 1.1;
  }

  function finish(state) {
    state.ui.remove();
    state.hold.line = null;
    live = null;
    state.done();
  }

  function cancel(S) {
    if (!live || live.S !== S) return;
    live.ui.remove();
    live.hold.line = null;
    live = null;
  }

  // For checking a scene without tapping: Question.answer('left'), or the 1 and 2 keys with ?dev
  function answer(side) {
    if (!live || live.phase !== 'open') return false;
    choose(live, live.opts.findIndex(opt => opt.side === side));
    return true;
  }

  window.addEventListener('keydown', event => {
    if (Study.flags.dev && (event.key === '1' || event.key === '2')) answer(event.key === '1' ? 'left' : 'right');
  });

  return { present, tick, cancel, answer, get live() { return live; } };
})();
