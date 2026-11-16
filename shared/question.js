// Asking the child a question. A scene asks with:
//
//   S.ask({
//     id: 't2.q', say: 't2.q',            // its name in the answer log, and the narration line that asks it
//     kind: 'test',                       // 'test' | 'attention' | 'reality' | 'guess' (the scene's kind unless said)
//     correct: 'butterfly',               // left out when there is no right answer (the crayon-box guess)
//     who: 'bear',                        // optional: whose mind the question is about, shown as a small badge
//     cards: [{ value: 'butterfly', label: 'A butterfly', art: '<svg shapes, drawn around (0, 0), about 200 x 150>' },
//             { value: 'bus', label: 'A school bus', art: '...' }],
//     // ...or, when the answers are things in the scene itself:
//     things: [{ value: 'blue', label: 'The blue jar', hit: { x, y, rx, ry } }, { value: 'orange', ... }],
//   });
//
// The story's clock stops while a question is up. The two answers appear, the question is said, and only then
// can they be tapped (so a child can't answer before hearing it). Nothing shows whether an answer was right: the
// one tapped gets a ring, the other fades, and the story moves on. If nothing is tapped for a while the
// question is asked again. Every answer goes to Study.record (shared/study.js).
//
// Which answer is on which side comes from Study.firstOnLeft: cards are simply swapped; for things, the whole
// scene is drawn mirrored (see Story.scene's `spatial`), and the side is read from where each thing ends up.
const Question = (() => {
  const { svg, m } = Engine;
  const INK = '#3a281e', PAPER = '#fffdf7';
  // The cards sit low, clear of whatever is on the table (so the child can still see how things really are)
  const CARD = { w: 236, h: 184, y: 544, x: [352, 648] };
  let live = null;

  const panOf = x => ({ pan: Math.max(-1, Math.min(1, (x - 500) / 500 * 0.7)) });

  function present(S, hold, done) {
    const q = hold.question;
    const ui = svg('g', null, S.ui);
    const state = live = { S, hold, q, done, ui, t: 0, phase: 'asking', asked: false, opts: [], reprompts: 0 };

    if (q.cards) {
      q.cards.forEach((card, i) => {
        const place = (i === 0) === S.firstOnLeft ? 0 : 1, cx = CARD.x[place];
        const pos = svg('g', { transform: `translate(${cx} ${CARD.y}) rotate(${place ? 1.5 : -1.5})` }, ui);
        const g = svg('g', { class: 'opt is-in is-waiting', role: 'button', 'aria-label': card.label }, pos);
        g.innerHTML = m.r(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 18, PAPER, 'filter="url(#lift)"') + `<g>${card.art}</g>` +
          m.r(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 18, 'none', `class="opt-ring" stroke="${INK}" stroke-width="7"`);
        state.opts.push({ g, value: card.value, x: cx, side: place ? 'right' : 'left' });
      });
      // Whose mind the question is about: their face, between the two cards
      if (q.who) {
        const badge = svg('g', { transform: 'translate(500 500)' }, ui);
        svg('g', { class: 'opt is-in is-waiting' }, badge).innerHTML = m.c(0, 0, 47, PAPER, 'filter="url(#lift)"') + m.g('scale(0.45)', Cast.head(q.who));
      }
      Sounds.play('card');
    } else {
      q.things.forEach(thing => {
        const hit = thing.hit, cx = S.flip ? Engine.W - hit.x : hit.x;
        const pos = svg('g', { transform: `translate(${cx} ${hit.y})` }, ui);
        const g = svg('g', { class: 'opt opt--thing is-waiting', role: 'button', 'aria-label': thing.label }, pos);
        const oval = extra => `<ellipse rx="${hit.rx}" ry="${hit.ry}" ${extra}/>`;
        g.innerHTML = oval('fill="#000" fill-opacity="0"') +
          oval(`class="opt-halo" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 17"`) +
          oval(`class="opt-ring" fill="none" stroke="${INK}" stroke-width="7"`);
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
      opt.g.addEventListener('animationend', () => opt.g.classList.remove('is-in', 'is-nudge'));
    });
    state.askAt = 0.55;
    state.openAt = state.askAt + (q.say ? Narration.duration(q.say) : 0.3);
  }

  // Runs on the scene's clock while the question is up
  function tick(S, dt) {
    const state = live;
    if (!state || state.S !== S) return;
    state.t += dt;
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

  function nudge(state) {
    state.opts.forEach(opt => {
      opt.g.classList.remove('is-nudge');
      opt.g.getBoundingClientRect();
      opt.g.classList.add('is-nudge');
    });
    Sounds.play('prompt');
  }

  function open(state) {
    state.phase = 'open';
    state.promptedAt = state.t;
    state.openedAt = performance.now();
    state.opts.forEach(opt => {
      opt.g.classList.remove('is-waiting', 'is-in');
      opt.g.setAttribute('tabindex', '0');
    });
    nudge(state);
  }

  function choose(state, index) {
    if (state.phase !== 'open') return;
    state.phase = 'chosen';
    const { S, q } = state, picked = state.opts[index];
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
    state.closeAt = state.t + 1;
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
