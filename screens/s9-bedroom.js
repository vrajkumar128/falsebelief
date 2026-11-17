// S9. ATTENTION CHECK: Mr. Bear tidies his room. The blocks go in the toy box and the clothes go in the dresser.
// Where do the blocks go? The child answers by tapping the toy box or the dresser. By the question the drawer
// is shut and the floor is clear, so the picture gives nothing away.
Story.scene({
  id: 's9', kind: 'attention', title: 'Tidying the bedroom', spatial: true,
  build(S) {
    const { m } = Engine;
    const WOOD = '#e3c694', FRONT = '#f0d8ab', KNOB = '#c69339';
    Kit.room(S, {
      kind: 'bedroom',
      // his bed, against the far wall
      also: m.r(352, 262, 296, 120, 18, '#e3cca3') + m.r(338, 350, 324, 112, 14, '#ffffff') + m.r(374, 338, 112, 46, 20, '#f7f0e3') +
        m.r(338, 394, 324, 86, 12, '#bed8e6') + m.r(350, 474, 22, 22, 4, '#d9be90') + m.r(628, 474, 22, 22, 4, '#d9be90'),
    });

    // The toy box: an open chest; what goes in drops behind its front
    const TOY = 205;
    S.thing(m.r(-90, -196, 180, 96, 10, '#e6911f') + m.r(-84, -112, 168, 20, 6, '#7f4b0f'), { x: TOY, y: 604 });
    const inToyBox = S.slot();
    S.thing(Kit.shadow(0, 1, 92) + m.r(-90, -104, 180, 104, 12, '#ffac33') + m.r(-90, -64, 180, 14, 0, '#ee9b20') + Kit.star(0, -34, 15, '#ffe082'),
      { x: TOY, y: 604 });

    // The dresser: a low chest of two drawers. The top one is open (pulled 20 toward us), ready for the clothes.
    const DRESSER = 790, SHUT = 498, OPEN = SHUT + 20;
    S.thing(Kit.shadow(0, 1, 96) + m.r(-92, -152, 184, 152, 10, WOOD) + m.r(-78, -138, 156, 58, 8, '#997546') +
      m.r(-78, -70, 156, 58, 8, FRONT) + m.c(-40, -41, 7, KNOB) + m.c(40, -41, 7, KNOB),
      { layer: S.L.back, x: DRESSER, y: SHUT });
    const inDrawer = S.slot(S.L.back);
    const drawer = S.thing(m.r(-78, -138, 156, 58, 8, FRONT) + m.c(-40, -109, 7, KNOB) + m.c(40, -109, 7, KNOB),
      { layer: S.L.back, x: DRESSER, y: OPEN });

    // Two big blocks and a shirt on the floor. Mr. Bear's arms are short, so he bends his knees to pick things up,
    // and holds each by its top.
    const BLOCK = 58, FLOOR = 582;
    const block = (x, color) => S.thing(m.r(-BLOCK / 2, -BLOCK, BLOCK, BLOCK, 8, color), { x, y: FLOOR });
    const red = block(296, '#e53935'), yellow = block(508, '#ffca28');
    const shirt = S.thing(m.g('scale(1.3)', m.scaled(1.3, () => m.p('M-30 -44L-12 -52Q0 -44 12 -52L30 -44L44 -26L29 -17L22 -24V0H-22V-24L-29 -17L-44 -26Z', '#26a69a'))),
      { x: 735, y: FLOOR + 2 });
    const bear = S.cast('bear', { x: 600, y: 592, k: 0.85 });

    S.wait(0.5);
    S.par(() => S.say('s9.1'), () => {
      bear.look(red);
      S.wait(1);
      bear.look(shirt);
    });

    // Both blocks, one in each paw, into the toy box
    S.par(() => S.say('s9.2'), () => {
      bear.look(red);
      bear.walkTo(402);
      S.par(() => bear.crouch(58), () => bear.reach('L', { x: 296, y: FLOOR - 54 }, 0.4), () => bear.reach('R', { x: 508, y: FLOOR - 54 }, 0.4));
      S.hold(red, bear, 'L', { dy: 54, layer: S.L.top });
      S.hold(yellow, bear, 'R', { dy: 54, layer: S.L.top });
      S.par(() => bear.crouch(0), () => bear.carry('L', -118, -160, 0.4), () => bear.carry('R', 118, -160, 0.4));
      bear.look({ x: TOY, y: 500 });
      bear.walkTo(TOY);
      S.set(red, { layer: inToyBox });
      S.set(yellow, { layer: inToyBox });
      S.par(() => bear.reach('L', { x: TOY - 40, y: 440 }, 0.4), () => bear.reach('R', { x: TOY + 40, y: 440 }, 0.4));
      S.drop(red, { x: TOY - 40, y: 494 });
      S.to(red, { y: 600 }, 0.2, 'in');
      S.sound('block', TOY);
      S.drop(yellow, { x: TOY + 40, y: 494 });
      S.to(yellow, { y: 600 }, 0.2, 'in');
      S.sound('block', TOY);
      bear.rest();
    });

    // The shirt into the dresser's open drawer, and the drawer pushed shut
    S.par(() => S.say('s9.3'), () => {
      bear.look(shirt);
      bear.walkTo(658);
      S.par(() => bear.crouch(58), () => bear.reach('R', { x: 735, y: FLOOR - 60 }, 0.4));
      S.hold(shirt, bear, 'R', { dy: 62, layer: S.L.top });
      S.par(() => bear.crouch(0), () => bear.carry('R', 118, -165, 0.4));
      bear.look({ x: DRESSER, y: 390 });
      bear.walkTo(700);
      S.set(shirt, { layer: inDrawer });
      bear.reach('R', { x: DRESSER, y: 322 }, 0.4);
      S.drop(shirt, { x: DRESSER, y: 384 });
      S.to(shirt, { y: 424, sy: 0.6 }, 0.25, 'in');
      S.sound('cloth', DRESSER);
      S.set(shirt, { show: false });
      bear.reach('R', { x: DRESSER + 40, y: OPEN - 109 }, 0.3);
      S.sound('drawerClose', DRESSER);
      S.par(() => S.to(drawer, { y: SHUT }, 0.3), () => bear.reach('R', { x: DRESSER + 40, y: SHUT - 109 }, 0.3));
      bear.rest('R');
    });
    bear.look(null);
    bear.walkTo(500);
    S.wait(0.3);

    S.ask({
      id: 's9.q', say: 's9.q', correct: 'toybox',
      things: [
        { value: 'toybox', label: 'The toy box', hit: { x: TOY, y: 506, rx: 130, ry: 118 } },
        { value: 'dresser', label: 'The dresser', hit: { x: DRESSER, y: 420, rx: 126, ry: 108 } },
      ],
    });
  },
});
