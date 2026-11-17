// S10. TEST: what shape something is. Mr. Bear makes a pizza, puts it in the fridge and goes to watch TV. While
// he is away, Mr. Pig eats a slice and puts the rest back. Mr. Bear comes back for his pizza: what shape does he
// think it is? The fridge is shut, so (like the cookie jars) he can be back in the room for the question.
Story.scene({
  id: 's10', kind: 'test', title: 'The pizza',
  build(S) {
    const { m } = Engine;
    const CRUST = '#f9a840', CHEESE = '#ffd564', PEPPERONI = '#e63b1f', STEEL = '#92aab5';
    // A pie-shaped piece of a circle, from angle `from` clockwise round to `to` (degrees)
    const pie = (r, from, to) => {
      const at = a => (r * Math.cos(a * Math.PI / 180)).toFixed(1) + ' ' + (r * Math.sin(a * Math.PI / 180)).toFixed(1);
      return `M0 0L${at(from)}A${r} ${r} 0 ${(to - from + 360) % 360 > 180 ? 1 : 0} 1 ${at(to)}Z`;
    };
    const dots = [[-22, -20], [-26, 16], [4, 27], [-2, -34], [23, 22]].map(([cx, cy]) => m.c(cx, cy, 7, PEPPERONI)).join('');
    const WHOLE = m.c(0, 0, 56, CRUST) + m.c(0, 0, 47, CHEESE) + dots + m.c(27, -15, 7, PEPPERONI);
    const CUT = m.p(pie(56, 0, -60), CRUST) + m.p(pie(47, 0, -60), CHEESE) + dots;
    const SLICE = m.p(pie(56, -60, 0), CRUST) + m.p(pie(47, -60, 0), CHEESE) + m.c(27, -15, 7, PEPPERONI);

    const doors = Kit.room(S, { kind: 'kitchen', left: 'hall', right: 'hall' });
    // A counter with an oven, so it reads as a kitchen
    S.thing(Kit.shadow(655, 480, 150) + m.r(520, 392, 270, 86, 8, '#ecdec5') + m.r(512, 380, 286, 16, 6, '#d9be90') +
      m.r(600, 410, 112, 56, 8, '#e0d1b7') + m.r(614, 422, 84, 26, 5, '#98866d') + [546, 572, 738, 764].map(cx => m.c(cx, 402, 5, STEEL)).join(''),
      { layer: S.L.back });

    // The fridge (drawn a size that suits the characters): its lower door swings open (`open` 0..1) on its left
    // side; the pizza goes on the shelf inside
    const FR = { x: 362, y: 478 }, BIG = 1.2;
    S.thing(Kit.shadow(0, 2, 96) + m.r(-88, -322, 176, 322, 12, '#d1e1e7') + m.r(-80, -314, 160, 86, 8, '#e0ebf0') + m.r(56, -294, 8, 46, 4, STEEL) +
      m.r(-80, -220, 160, 210, 6, '#f5fafa') + m.r(-80, -86, 160, 7, 0, '#c0d2d9') +
      m.r(-62, -62, 30, 52, 8, '#cae5cf') + m.r(-22, -50, 44, 40, 6, '#f1debd') + m.r(34, -70, 22, 60, 9, '#d4e1f5'),
      { layer: S.L.back, x: FR.x, y: FR.y, sx: BIG, sy: BIG });
    const inFridge = S.slot(S.L.back);
    const fridgeDoor = S.thing(`<g>${m.r(-80, -220, 160, 210, 8, '#e0ebf0') + m.r(56, -172, 8, 74, 4, STEEL)}</g>`, {
      layer: S.L.back, x: FR.x, y: FR.y, sx: BIG, sy: BIG, open: 0,
      draw: (s, thing) => {
        if (thing.openWas === s.open) return;
        thing.openWas = s.open;
        thing.el.firstChild.setAttribute('transform', `translate(-80 0) scale(${(1 - 0.86 * s.open).toFixed(3)} 1) translate(80 0)`);
      },
    });
    // The handle is the bar down the door's right edge
    const handleAt = open => ({ x: FR.x + (-80 + 140 * (1 - 0.86 * open)) * BIG, y: FR.y - 148 });
    const handle = { point: () => handleAt(fridgeDoor.s.open) };
    const SHELF = { x: FR.x + 12, y: FR.y - 86 * BIG - 56 }, GRIP = { dy: -6 };
    // Where they stand: beside the fridge to open it and reach in, and nearer its middle to push the door shut
    const BESIDE = 535, FRONT = 455;

    const pizza = S.thing(`<g>${WHOLE}</g><g display="none">${CUT}</g>`, {
      layer: S.L.top, cut: false,
      draw: (s, thing) => {
        if (thing.cutWas === s.cut) return;
        thing.cutWas = s.cut;
        thing.el.children[0].setAttribute('display', s.cut ? 'none' : 'inline');
        thing.el.children[1].setAttribute('display', s.cut ? 'inline' : 'none');
      },
    });
    const slice = S.thing(SLICE, { layer: S.L.top, show: false });
    const bear = S.cast('bear', { x: 690, y: 592 });
    const pig = S.cast('pig', { show: false });

    // The paw nearer the fridge pulls the door open, and lets it swing
    const openFridge = p => {
      p.reach('L', handleAt(0), 0.35);
      S.sound('fridgeOpen', FR.x);
      S.par(() => S.to(fridgeDoor, { open: 1 }, 0.45), () => p.rest('L', 0.35));
    };
    // A step across to the open door, and the same paw pushes it shut
    const shutFridge = p => {
      p.walkTo(FRONT);
      p.reach('L', handleAt(1), 0.35);
      p.follow('L', handle);
      S.to(fridgeDoor, { open: 0 }, 0.45, 'in');
      S.sound('fridgeClose', FR.x);
      p.unfollow('L', handleAt(0));
      p.rest('L');
    };
    // The pizza goes from one paw to the other, in front of the chest
    const pass = (p, from, to) => {
      const middle = p.at(0, -200);
      S.par(() => p.reach(from, middle, 0.35), () => p.reach(to, middle, 0.35));
      S.hold(pizza, p, to, Object.assign({ layer: S.L.top }, GRIP));
      p.rest(from, 0.3);
    };
    const hand = { x: SHELF.x, y: SHELF.y + 6 }; // where a paw holds the pizza when it is on the shelf

    // Mr. Bear shows his pizza and puts it in the fridge
    bear.pose('R', 128, -272);
    S.hold(pizza, bear, 'R', GRIP);
    bear.look(pizza);
    S.wait(0.6);
    S.par(() => S.say('s10.1'), () => {
      S.wait(1.6);
      bear.face('wide');
      bear.hop(22);
      S.wait(0.6);
      bear.face('smile');
    });
    S.par(() => S.say('s10.2'), () => {
      bear.look({ x: FR.x, y: 340 });
      bear.walkTo(BESIDE);
      openFridge(bear);
      pass(bear, 'R', 'L'); // into the paw nearer the fridge
      bear.reach('L', hand, 0.5);
      S.drop(pizza, Object.assign({ layer: inFridge }, SHELF));
      S.wait(0.15);
      shutFridge(bear);
      bear.look(null);
    });
    S.par(() => S.say('s10.3'), () => Kit.leave(S, bear, doors.R));
    S.wait(0.4);

    // Mr. Pig takes it out, eats a slice, and puts it back
    S.par(() => S.say('s10.4'), () => {
      Kit.arrive(S, pig, doors.L, { x: BESIDE, y: 592 });
      pig.look({ x: FR.x, y: 340 });
    });
    S.par(() => S.say('s10.5'), () => {
      openFridge(pig);
      pig.reach('L', hand, 0.45);
      S.hold(pizza, pig, 'L', Object.assign({ layer: S.L.top }, GRIP));
      pig.carry('L', -30, -190, 0.45);
      pig.look(pizza);
      // one piece comes away in his other paw, and into his mouth
      const held = pig.at(-30, -190); // where his left paw holds the pizza
      pig.reach('R', { x: held.x + 34, y: held.y - 30 }, 0.35);
      S.set(pizza, { cut: true });
      S.set(slice, { show: true });
      S.hold(slice, pig, 'R', { dx: -34, dy: 24 });
      pig.carry('R', 4, -262, 0.4);
      S.to(slice, { sx: 0.3, sy: 0.3 }, 0.3, 'in');
      S.set(slice, { show: false });
      S.sound('munch', pig);
      pig.face('chew');
      pig.rest('R');
      S.wait(0.9);
      pig.face('smile');
    });
    S.par(() => S.say('s10.6'), () => {
      pig.look({ x: FR.x, y: 340 });
      pig.reach('L', hand, 0.5);
      S.drop(pizza, Object.assign({ layer: inFridge }, SHELF));
      S.wait(0.15);
      shutFridge(pig);
      pig.look(null);
    });
    S.say('s10.7');
    S.par(() => S.say('s10.8'), () => Kit.leave(S, pig, doors.L));
    S.wait(0.4);

    // Mr. Bear comes back; the fridge is shut
    S.par(() => S.say('s10.9'), () => {
      Kit.arrive(S, bear, doors.R, { x: 650, y: 592 });
      bear.look({ x: FR.x, y: 340 });
    });
    S.wait(0.3);

    const cards = [
      { value: 'whole', label: 'A whole pizza', art: m.g('scale(1.28)', WHOLE) },
      { value: 'slice-missing', label: 'A pizza with a slice missing', art: m.g('scale(1.28)', CUT) },
    ];
    S.ask({ id: 's10.q', say: 's10.q', cards, correct: 'whole' });
    if (STUDY.realityChecks) S.ask({ id: 's10.r', say: 's10.r', kind: 'reality', cards, correct: 'slice-missing' });
  },
});
