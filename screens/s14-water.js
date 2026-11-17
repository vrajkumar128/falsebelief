// S14. TEST: how much there is. Mr. Bear pours a glass of water and drinks nearly all of it, then goes to his
// room. While he is away, Mr. Turtle fills the glass up again. How much water does Mr. Bear think is in it?
// The glass is in plain view, so Mr. Bear is still away when the question is asked.
Story.scene({
  id: 's14', kind: 'test', title: 'The glass of water',
  build(S) {
    const { m } = Engine;
    const WATER = '#4fc3f7', LOW = 0.14, FULL = 0.95;
    // A tumbler standing on (0, 0), with water up to `level` (0..1)
    const waterShape = level => {
      const top = -4 - 88 * level, half = 25 + 5 * (88 * level / 90);
      return level > 0.01 ? `M-25 -4H25L${half.toFixed(1)} ${top.toFixed(1)}H${(-half).toFixed(1)}Z` : 'M0 0';
    };
    const glassArt = level => m.p('M-33 -98L-27 0H27L33 -98Z', '#cfe9f1', 'fill-opacity=".55"') + m.p(waterShape(level), WATER, 'class="water"') +
      m.r(-21, -86, 7, 58, 3.5, '#ffffff', 'opacity=".5"') + m.l('M-33 -98H33', '#b1d7e4', 4);

    const doors = Kit.room(S, { left: 'hall', right: 'hall' });
    Kit.table(S);
    const GLASS = { x: 440, y: Kit.TABLE }, STAND = 520;
    // The jug is drawn around its handle, where a hand holds it, so it tips about the hand; its spout is at
    // (-106, -50) and its base 70 below the handle
    const HANDLE = { x: 664, y: Kit.TABLE - 70 }, POUR = { x: 543, y: 255 }, TILT = -58;
    const jug = S.thing(m.l('M-16 -28Q24 -16 -12 40', '#e8deca', 12) + m.p('M-90 70Q-102 10 -86 -42H-18Q-2 10 -14 70Z', '#f7f0e3') +
      m.p('M-86 -42L-107 -51L-83 -22Z', '#f7f0e3') + m.r(-93, 8, 82, 14, 7, WATER), { x: HANDLE.x, y: HANDLE.y });
    // The stream falls from the spout (when the jug is tipped) into the glass
    const stream = S.thing(m.r(-4, 0, 8, 124, 4, WATER), { x: GLASS.x + 4, y: 318, show: false });
    const glass = S.thing(glassArt(0), {
      x: GLASS.x, y: GLASS.y, level: 0,
      draw: (s, thing) => {
        if (thing.levelWas === s.level) return;
        thing.levelWas = s.level;
        thing.el.querySelector('.water').setAttribute('d', waterShape(s.level));
      },
    });
    const bear = S.cast('bear', { x: STAND, y: Kit.BACK });
    const turtle = S.cast('turtle', { show: false });

    // Picks up the jug, pours until the water reaches `level`, and puts the jug back
    const pour = (p, level) => {
      p.look(glass);
      p.reach('R', HANDLE, 0.4);
      S.hold(jug, p, 'R');
      S.par(() => p.reach('R', POUR, 0.55), () => {
        S.wait(0.25);
        S.to(jug, { rot: TILT }, 0.3);
      });
      S.set(stream, { show: true });
      S.sound('pour', glass, { length: 1.4 });
      S.to(glass, { level }, 1.4, 'linear');
      S.set(stream, { show: false });
      S.par(() => S.to(jug, { rot: 0 }, 0.3), () => p.reach('R', HANDLE, 0.55));
      S.drop(jug, HANDLE);
      p.rest('R');
    };

    // Mr. Bear pours a glass and drinks nearly all of it
    S.wait(0.5);
    S.par(() => S.say('s14.1'), () => {
      S.wait(1);
      pour(bear, FULL);
    });
    S.par(() => S.say('s14.2'), () => {
      bear.reach('L', { x: GLASS.x, y: GLASS.y - 46 }, 0.4);
      S.hold(glass, bear, 'L', { dy: 46, layer: S.L.top });
      S.par(() => bear.reach('L', { x: 474, y: 322 }, 0.5), () => S.to(glass, { rot: 32 }, 0.5));
      S.sound('gulp', bear, { times: 4 });
      S.set(bear, { eyes: 'closed' });
      S.to(glass, { level: LOW }, 1.5, 'linear');
      S.set(bear, { eyes: 'open' });
      S.par(() => bear.reach('L', { x: GLASS.x, y: GLASS.y - 46 }, 0.5), () => S.to(glass, { rot: 0 }, 0.4));
      S.drop(glass, { x: GLASS.x, y: GLASS.y, layer: S.L.front });
      bear.rest('L');
      bear.look(null);
    });
    S.par(() => S.say('s14.3'), () => Kit.leave(S, bear, doors.L));
    S.wait(0.4);

    // Mr. Turtle fills it up
    S.par(() => S.say('s14.4'), () => {
      Kit.arrive(S, turtle, doors.R, { x: 540 });
      turtle.look(glass);
    });
    S.par(() => S.say('s14.5'), () => pour(turtle, FULL));
    turtle.look(null);
    S.say('s14.6');
    S.par(() => S.say('s14.7'), () => Kit.leave(S, turtle, doors.R));
    S.wait(0.3);
    S.say('s14.8');

    const card = level => m.g('translate(0 70) scale(1.45)', m.scaled(1.45, () => glassArt(level)));
    const cards = [
      { value: 'little', label: 'A little water', art: card(LOW) },
      { value: 'full', label: 'A full glass', art: card(FULL) },
    ];
    S.ask({ id: 's14.q', say: 's14.q', who: 'bear', cards, correct: 'little' });
    if (STUDY.realityChecks) S.ask({ id: 's14.r', say: 's14.r', kind: 'reality', cards, correct: 'full' });
  },
});
