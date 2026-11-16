// A2. ATTENTION CHECK: at the playground there is a teeter-totter and a jungle gym; Mr. Bear's favourite is the
// jungle gym. What is his favourite toy? The child answers by tapping one of them.
Story.scene({
  id: 'a2', kind: 'attention', title: 'The playground', spatial: true,
  build(S) {
    const { m } = Engine;
    const TEAL = '#3f8f8a', TEAL_DARK = '#32736f', GREY = '#8d8478', GROUND = 572;
    Kit.outdoors(S);
    // The jungle gym: four posts, two rungs and a deck on top (184 above the ground)
    const gym = S.thing(
      Kit.shadow(0, 2, 136, 9) +
      [-116, -42, 30, 104].map(px => m.r(px, -176, 14, 176, 6, TEAL_DARK)).join('') +
      m.r(-116, -64, 234, 12, 6, TEAL) + m.r(-116, -122, 234, 12, 6, TEAL) + m.r(-128, -184, 258, 20, 9, '#e9a23b'),
      { layer: S.L.back, x: 245, y: GROUND, lift: true });
    // The teeter-totter: a plank on a stand, one end down
    const totter = S.thing(
      Kit.shadow(0, 2, 150, 8) + m.p('M-28 0L0 -48L28 0Z', GREY) +
      m.g('rotate(-9 0 -48)', m.r(-152, -58, 304, 16, 8, '#e0703a') + m.r(-152, -66, 50, 10, 5, '#c85a28') + m.r(102, -66, 50, 10, 5, '#c85a28') +
        m.r(-112, -92, 10, 30, 4, GREY) + m.r(102, -92, 10, 30, 4, GREY)),
      { layer: S.L.back, x: 755, y: GROUND, lift: true });
    const bear = S.cast('bear', { x: 500, y: 604, k: 0.62 });
    const nod = thing => {
      S.to(thing, { sx: 1.04, sy: 1.07 }, 0.16, 'out');
      S.to(thing, { sx: 1, sy: 1 }, 0.22, 'in');
    };
    // A jump from where he is to (x, y), landing with `sound`
    const jump = (x, y, sound) => {
      S.par(
        () => S.to(bear, { x }, 0.5),
        () => S.to(bear, { y }, 0.5, y < bear.b.y ? 'out' : 'in'),
        () => {
          S.to(bear, { hop: 56 }, 0.25, 'out');
          S.to(bear, { hop: 0 }, 0.25, 'in');
        });
      bear.b.x = x;
      bear.b.y = y;
      if (sound) S.sound(sound, x);
      else bear.stepSound();
    };

    S.wait(0.5);
    S.say('a2.1');
    const naming = Narration.duration('a2.2');
    S.par(() => S.say('a2.2'), () => {
      S.wait(naming * 0.3);
      bear.look(totter);
      nod(totter);
      S.wait(naming * 0.3);
      bear.look(gym);
      nod(gym);
    });
    bear.look(null);

    // He runs to the jungle gym, climbs on top, cheers, and comes back to the middle
    S.par(() => S.say('a2.3'), () => {
      bear.look(gym);
      bear.walkTo(380, { speed: 230 });
      jump(250, GROUND - 184, 'clang');
      bear.look(null);
      bear.cheer(1.1);
    });
    jump(382, 604);
    bear.walkTo(500);
    S.wait(0.3);

    S.ask({
      id: 'a2.q', say: 'a2.q', correct: 'gym',
      things: [
        { value: 'gym', label: 'The jungle gym', hit: { x: 245, y: 478, rx: 168, ry: 124 } },
        { value: 'totter', label: 'The teeter-totter', hit: { x: 755, y: 505, rx: 178, ry: 96 } },
      ],
    });
  },
});
