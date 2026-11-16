// A4. ATTENTION CHECK: Mr. Bear tidies his room. The blocks go in the toy box and the clothes go in the dresser.
// Where do the blocks go? The child answers by tapping the toy box or the dresser. By the question both are
// shut again and the floor is clear, so the picture gives nothing away.
Story.scene({
  id: 'a4', kind: 'attention', title: 'Tidying the bedroom', spatial: true,
  build(S) {
    const { m } = Engine;
    const WOOD = '#d7c3a0', FRONT = '#e6d5b5', KNOB = '#b08d4f';
    S.thing(m.r(0, 0, 1000, 650, 0, '#f3ebe4') + m.r(0, Kit.FLOOR - 12, 1000, 12, 0, '#e9dfd5') + m.r(0, Kit.FLOOR, 1000, 180, 0, '#d9d4c8') +
      // his bed, against the far wall
      m.r(352, 262, 296, 120, 18, '#d9c9ad') + m.r(338, 350, 324, 112, 14, '#fffdf7') + m.r(374, 338, 112, 46, 20, '#f4efe6') +
      m.r(338, 394, 324, 86, 12, '#c5d6df') + m.r(350, 474, 22, 22, 4, '#cdbb9c') + m.r(628, 474, 22, 22, 4, '#cdbb9c'),
      { layer: S.L.bg });

    // The toy box: an open chest; what goes in drops behind its front
    const TOY = 205;
    S.thing(m.r(-90, -196, 180, 96, 10, '#c98d3c') + m.r(-84, -112, 168, 20, 6, '#6f4a1f'), { x: TOY, y: 604 });
    const inToyBox = S.slot();
    S.thing(Kit.shadow(0, 1, 92) + m.r(-90, -104, 180, 104, 12, '#e3a74f') + m.r(-90, -64, 180, 14, 0, '#d1953d') + Kit.star(0, -34, 15, '#f6d68a'),
      { x: TOY, y: 604, lift: true });

    // The dresser: a low chest of two drawers; the top one slides open
    const DRESSER = 790;
    S.thing(Kit.shadow(0, 1, 96) + m.r(-92, -152, 184, 152, 10, WOOD) + m.r(-78, -138, 156, 58, 8, '#8a7355') +
      m.r(-78, -70, 156, 58, 8, FRONT) + m.c(-40, -41, 7, KNOB) + m.c(40, -41, 7, KNOB),
      { layer: S.L.back, x: DRESSER, y: 498, lift: true });
    const inDrawer = S.slot(S.L.back);
    const drawer = S.thing(m.r(-78, -138, 156, 58, 8, FRONT) + m.c(-40, -109, 7, KNOB) + m.c(40, -109, 7, KNOB),
      { layer: S.L.back, x: DRESSER, y: 498 });

    const block = (x, color) => S.thing(m.r(-22, -44, 44, 44, 7, color), { layer: S.L.back, x, y: 580, lift: true });
    const red = block(392, '#d1495b'), yellow = block(452, '#f2c230');
    const shirt = S.thing(m.p('M-30 -44L-12 -52Q0 -44 12 -52L30 -44L44 -26L29 -17L22 -24V0H-22V-24L-29 -17L-44 -26Z', '#3f8f8a'),
      { layer: S.L.back, x: 630, y: 582, lift: true });
    const bear = S.cast('bear', { x: 540, y: 592 });

    S.wait(0.5);
    S.par(() => S.say('a4.1'), () => {
      bear.look(red);
      S.wait(1);
      bear.look(shirt);
    });

    // Both blocks, one in each paw, into the toy box
    S.par(() => S.say('a4.2'), () => {
      bear.look(red);
      bear.walkTo(422);
      S.par(() => bear.crouch(112), () => bear.reach('L', { x: 392, y: 552 }, 0.4), () => bear.reach('R', { x: 452, y: 552 }, 0.4));
      S.hold(red, bear, 'L', { dy: 18, layer: S.L.top });
      S.hold(yellow, bear, 'R', { dy: 18, layer: S.L.top });
      S.par(() => bear.crouch(0), () => bear.carry('L', -62, -226, 0.4), () => bear.carry('R', 62, -226, 0.4));
      bear.look({ x: TOY, y: 500 });
      bear.walkTo(TOY);
      S.set(red, { layer: inToyBox });
      S.set(yellow, { layer: inToyBox });
      S.par(() => bear.reach('L', { x: TOY - 36, y: 452 }, 0.4), () => bear.reach('R', { x: TOY + 36, y: 452 }, 0.4));
      S.drop(red, { x: TOY - 36, y: 470 });
      S.to(red, { y: 600 }, 0.2, 'in');
      S.sound('block', TOY);
      S.drop(yellow, { x: TOY + 36, y: 470 });
      S.to(yellow, { y: 600 }, 0.2, 'in');
      S.sound('block', TOY);
      bear.rest();
    });

    // The shirt into the dresser's top drawer
    S.par(() => S.say('a4.3'), () => {
      bear.look(shirt);
      bear.walkTo(618);
      S.par(() => bear.crouch(112), () => bear.reach('R', { x: 632, y: 556 }, 0.4));
      S.hold(shirt, bear, 'R', { dy: 22, layer: S.L.top });
      S.par(() => bear.crouch(0), () => bear.carry('R', 62, -226, 0.4));
      bear.look({ x: DRESSER, y: 390 });
      bear.walkTo(690);
      bear.reach('L', { x: DRESSER - 40, y: 389 }, 0.35);
      S.sound('drawerOpen', DRESSER);
      S.par(() => S.to(drawer, { y: 518 }, 0.3), () => bear.reach('L', { x: DRESSER - 40, y: 409 }, 0.3));
      S.set(shirt, { layer: inDrawer });
      bear.reach('R', { x: DRESSER + 14, y: 346 }, 0.4);
      S.drop(shirt, { x: DRESSER + 14, y: 368 });
      S.to(shirt, { y: 404, sy: 0.6 }, 0.25, 'in');
      S.sound('cloth', DRESSER);
      S.set(shirt, { show: false });
      S.sound('drawerClose', DRESSER);
      S.par(() => S.to(drawer, { y: 498 }, 0.3), () => bear.reach('L', { x: DRESSER - 40, y: 389 }, 0.3), () => bear.rest('R'));
      bear.rest('L');
    });
    bear.look(null);
    bear.walkTo(500);
    S.wait(0.3);

    S.ask({
      id: 'a4.q', say: 'a4.q', correct: 'toybox',
      things: [
        { value: 'toybox', label: 'The toy box', hit: { x: TOY, y: 506, rx: 130, ry: 118 } },
        { value: 'dresser', label: 'The dresser', hit: { x: DRESSER, y: 420, rx: 126, ry: 108 } },
      ],
    });
  },
});
