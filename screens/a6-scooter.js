// A6. ATTENTION CHECK: Mr. Bear wants to go to Mr. Duck's house. He has a bike and a scooter; today he takes
// the scooter. Which one does he take? He has ridden away by the time the question is asked.
Story.scene({
  id: 'a6', kind: 'attention', title: 'The bike and the scooter',
  build(S) {
    const { m } = Engine;
    const INK = '#3a281e', TEAL = '#3f8f8a';
    // Both stand on (0, 0)
    const BIKE = [-62, 62].map(cx => m.c(cx, -44, 44, 'none', `stroke="${INK}" stroke-width="9"`) + m.c(cx, -44, 7, INK)).join('') +
      m.l('M-10 -44L-24 -104M-24 -100H46M46 -104L-10 -44M-10 -44H-62M-24 -100L-62 -44M46 -104L62 -44M46 -104L52 -130', '#d1495b', 9) +
      m.l('M38 -132H66', INK, 9) + m.r(-42, -116, 36, 11, 5.5, INK);
    const SCOOTER = [-46, 50].map(cx => m.c(cx, -17, 17, INK) + m.c(cx, -17, 5, '#b9bec2')).join('') +
      m.r(-44, -34, 90, 11, 5.5, TEAL) + m.l('M50 -30L38 -152', TEAL, 9) + m.l('M20 -152H56', INK, 10);

    Kit.outdoors(S);
    // His house, and the path along the front
    S.thing(m.r(0, 552, 1000, 98, 0, '#e3dcc8'), { layer: S.L.bg });
    S.thing(Kit.shadow(200, 482, 140, 8) + m.r(80, 300, 240, 180, 6, '#e9dcc5') + m.p('M58 300L200 212L342 300Z', '#c97a5a') +
      m.r(172, 378, 56, 102, 5, '#b98a5e') + m.c(216, 432, 5, '#f2c230') + m.r(102, 338, 46, 46, 7, '#cfe3ea') + m.r(252, 338, 46, 46, 7, '#cfe3ea'),
      { layer: S.L.back, lift: true });
    const GROUND = 606, BIG = 1.45; // the bike and scooter are drawn a size that fits him
    const bike = S.thing(Kit.shadow(0, 1, 110, 6) + BIKE, { x: 400, y: GROUND, sx: BIG, sy: BIG, lift: true });
    const scooter = S.thing(Kit.shadow(0, 1, 62, 5) + SCOOTER, { x: 720, y: GROUND, sx: BIG, sy: BIG, lift: true });
    const bear = S.cast('bear', { x: 215, y: 600, k: 0.66 });
    const nod = thing => {
      S.to(thing, { y: GROUND - 16 }, 0.15, 'out');
      S.to(thing, { y: GROUND }, 0.2, 'in');
    };

    S.wait(0.5);
    S.par(() => S.say('a6.1'), () => bear.walkTo(560));
    const naming = Narration.duration('a6.2');
    S.par(() => S.say('a6.2'), () => {
      S.wait(naming * 0.3);
      bear.look(bike);
      nod(bike);
      S.wait(naming * 0.3);
      bear.look(scooter);
      nod(scooter);
    });

    // He steps on the scooter, takes the handlebar, and rides off
    const BAR = 152 * BIG, DECK = 34 * BIG;
    const bar = dx => ({ point: () => ({ x: scooter.s.x + dx * BIG, y: scooter.s.y - BAR }) });
    S.par(() => S.say('a6.3'), () => {
      bear.walkTo(scooter.s.x - 18);
      S.to(bear, { y: GROUND - DECK }, 0.24, 'out');
      bear.stepSound();
      S.par(() => bear.reach('L', { x: scooter.s.x + 24 * BIG, y: GROUND - BAR }, 0.35), () => bear.reach('R', { x: scooter.s.x + 54 * BIG, y: GROUND - BAR }, 0.35));
      bear.follow('L', bar(24));
      bear.follow('R', bar(54));
      bear.look(null);
      S.wait(0.3);
    });
    S.sound('roll', scooter, { length: 2.1 });
    S.par(() => S.to(bear, { x: 1202, lean: 5 }, 2.1, 'in'), () => S.to(scooter, { x: 1220 }, 2.1, 'in'));
    S.set(bear, { show: false });
    S.wait(0.5);

    S.ask({
      id: 'a6.q', say: 'a6.q', correct: 'scooter',
      cards: [
        { value: 'scooter', label: 'The scooter', art: m.g('translate(-4 72) scale(0.95)', SCOOTER) },
        { value: 'bike', label: 'The bike', art: m.g('translate(0 54) scale(0.9)', BIKE) },
      ],
    });
  },
});
