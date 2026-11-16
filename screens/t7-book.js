// T7. TEST: what colour something is. Mr. Bear has a yellow book; he leaves it on the table and goes up to his
// room. While he is away, his dad spills blue paint all over it. What colour does Mr. Bear think his book is?
// The book is in plain view, so Mr. Bear is still away when the question is asked. (Yellow and blue stay easy
// to tell apart for colour-blind children.)
Story.scene({
  id: 't7', kind: 'test', title: 'The book',
  build(S) {
    const { m } = Engine;
    const YELLOW = '#f2c230', BLUE = '#2f6db5', BLUE_DARK = '#23538c', STEEL = '#b9bec2';
    // A book standing on (0, 0); `painted` is the same book under a coat of blue, with drips
    const cover = (main, spine) => m.r(-42, -120, 90, 118, 5, '#fffdf7') + m.r(-48, -124, 92, 124, 7, main) + m.r(-48, -124, 15, 124, 7, spine);
    const PLAIN = cover(YELLOW, '#d9a514') + Kit.star(6, -64, 23, '#fbe69a');
    const PAINTED = cover(BLUE, BLUE_DARK) + m.e(2, 3, 64, 8, BLUE) + m.r(-32, -4, 11, 18, 5.5, BLUE) + m.r(6, -4, 12, 24, 6, BLUE) + m.r(30, -4, 9, 14, 4.5, BLUE);

    const doors = Kit.room(S, { wall: '#f3ede3', left: 'hall', right: 'hall' });
    Kit.table(S);
    const SPOT = { x: 430, y: Kit.TABLE, rot: -5 }; // where the book stands on the table
    // The paint runs down over the book: `paint` 0..1 uncovers the painted book from the top
    const clipId = S.clip(m.r(-80, -130, 160, 0, 0, '#000'));
    const coat = S.defs.querySelector('#' + clipId + ' rect');
    const book = S.thing(`<g>${PLAIN}</g><g clip-path="url(#${clipId})">${PAINTED}</g>`, {
      layer: S.L.top, lift: true, paint: 0,
      draw: (s, thing) => {
        if (thing.paintWas === s.paint) return;
        thing.paintWas = s.paint;
        coat.setAttribute('height', (164 * s.paint).toFixed(1));
      },
    });
    // The can is drawn hanging from its handle (where a hand holds it), open at the top
    const can = S.thing(m.l('M-30 12Q0 -34 30 12', '#8a8f93', 4) + m.r(-30, 8, 60, 66, 6, STEEL) + m.r(-30, 22, 60, 12, 0, '#a4aaaf') + m.e(0, 9, 30, 7, BLUE),
      { layer: S.L.top, show: false, lift: true });
    const stream = S.thing(m.r(-6, 0, 12, 36, 6, BLUE), { layer: S.L.top, x: 466, y: 302, show: false });

    const bear = S.cast('bear', { x: 500, y: Kit.BACK });
    const dad = S.cast('dad', { show: false });

    // Mr. Bear shows his yellow book and stands it on the table
    bear.pose('R', 88, -292);
    S.hold(book, bear, 'R', { dy: 62 });
    bear.look(book);
    S.wait(0.6);
    S.par(() => S.say('t7.1'), () => {
      S.wait(1.4);
      bear.hop(20);
    });
    S.par(() => S.say('t7.2'), () => {
      S.par(() => bear.reach('R', { x: SPOT.x, y: SPOT.y - 62 }, 0.55), () => S.to(book, { rot: SPOT.rot }, 0.55));
      S.drop(book, Object.assign({ layer: S.L.front }, SPOT));
      S.sound('cardboard', SPOT.x);
      bear.rest('R');
      bear.look(null);
    });
    S.par(() => S.say('t7.3'), () => Kit.leave(S, bear, doors.L));
    S.wait(0.4);

    // Dad comes by with a can of blue paint (in the hand nearer the book), stumbles, and it spills over the book
    dad.pose('L', -104, -184);
    S.hold(can, dad, 'L', { dy: 12 });
    S.par(() => S.say('t7.4'), () => {
      Kit.arrive(S, dad, doors.R, Kit.BACK, [can]);
      dad.walkTo(548);
    });
    S.par(() => S.say('t7.5'), () => {
      S.par(
        () => S.to(dad, { lean: -9 }, 0.2, 'out'),
        () => dad.hop(16, 0.3),
        () => dad.reach('L', { x: 464, y: 262 }, 0.3),
        () => S.to(can, { rot: -78 }, 0.3));
      dad.face('open');
      dad.look(book);
      S.set(stream, { show: true });
      S.sound('splash', SPOT.x);
      S.to(book, { paint: 1 }, 0.9, 'in');
      S.set(stream, { show: false });
      S.par(() => S.to(dad, { lean: 0 }, 0.3), () => S.to(can, { rot: 0 }, 0.3), () => dad.carry('L', -104, -184, 0.4));
      S.wait(0.6);
      dad.face('smile');
    });
    dad.look(null);
    S.say('t7.6');
    // He takes the can in his other hand (the one that won't open the door) and goes
    S.par(() => S.say('t7.7'), () => {
      const middle = dad.at(0, -190);
      S.par(() => dad.reach('L', middle, 0.3), () => dad.reach('R', middle, 0.3));
      S.hold(can, dad, 'R', { dy: 12 });
      S.par(() => dad.rest('L'), () => dad.carry('R', 104, -184, 0.35));
      Kit.leave(S, dad, doors.R, [can]);
    });
    S.wait(0.3);
    S.say('t7.8');

    const card = art => m.g('translate(0 70) scale(1.1)', art);
    const cards = [
      { value: 'yellow', label: 'A yellow book', art: card(PLAIN) },
      { value: 'blue', label: 'A blue book', art: card(PAINTED) },
    ];
    S.ask({ id: 't7.q', say: 't7.q', who: 'bear', cards, correct: 'yellow' });
    if (STUDY.realityChecks) S.ask({ id: 't7.r', say: 't7.r', kind: 'reality', cards, correct: 'blue' });
  },
});
