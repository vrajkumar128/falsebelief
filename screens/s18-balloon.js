// S18. TEST: what size something is. Mr. Turtle gives Mr. Bear a little balloon; he leaves it on his table and
// goes outside. While he is out, his sister blows it up big. What size does Mr. Bear think his balloon is?
// The balloon is in plain view, so Mr. Bear is still outside when the question is asked.
Story.scene({
  id: 's18', kind: 'test', title: 'The balloon',
  build(S) {
    const { m } = Engine;
    const RED = '#ef5350', RED_DARK = '#c62828', BIG = 2.8;
    // Drawn standing on its knot at (0, 0), so it grows upward from where it is held
    const balloonArt = () => m.p('M-7 0L0 -11L7 0Z', RED_DARK) + m.e(0, -38, 24, 29, RED);
    const BALLOON = balloonArt();

    const doors = Kit.room(S, { left: 'outside', right: 'hall' });
    Kit.table(S);
    const balloon = Kit.steady(S.thing(BALLOON, { layer: S.L.top, show: false }));
    const bear = S.cast('bear', { x: 400, y: Kit.BACK });
    const turtle = S.cast('turtle', { show: false });
    const sister = S.cast('sister', { show: false });
    const SPOT = { x: 490, y: Kit.TABLE };

    // Mr. Turtle brings a little balloon and gives it to Mr. Bear
    turtle.pose('L', -70, -292);
    S.hold(balloon, turtle, 'L');
    S.wait(0.4);
    const give = { x: 532, y: 312 };
    S.par(() => S.say('s18.1'), () => {
      Kit.arrive(S, turtle, doors.R, { x: 640 }, [balloon]);
      bear.look(turtle);
      turtle.look(bear);
      S.par(() => turtle.reach('L', give, 0.5), () => bear.reach('R', give, 0.5));
      S.hold(balloon, bear, 'R');
      S.par(() => turtle.rest('L'), () => bear.carry('R', 104, -298, 0.4));
      bear.look(balloon);
    });
    // He says thank you and puts it on his table; Mr. Turtle goes
    S.par(() => S.say('s18.2'), () => {
      bear.look(turtle);
      bear.face('wide');
      bear.hop(20);
      S.wait(0.4);
      bear.face('smile');
      S.bg(() => {
        turtle.look(null);
        turtle.wave('R', 1);
        Kit.leave(S, turtle, doors.R);
      });
      S.wait(0.9);
      bear.look(SPOT);
      S.par(() => bear.crouch(20, 0.5), () => bear.reach('R', { x: SPOT.x, y: SPOT.y - 8 }, 0.55));
      S.drop(balloon, Object.assign({ layer: S.L.front }, SPOT));
      S.par(() => bear.crouch(0, 0.4), () => bear.rest('R'));
      bear.look(null);
    });
    S.wait(1.2);
    S.par(() => S.say('s18.3'), () => Kit.leave(S, bear, doors.L));
    S.wait(0.4);

    // His sister picks it up and blows: three long breaths, and it is big
    S.par(() => S.say('s18.4'), () => {
      Kit.arrive(S, sister, doors.R, { x: 580 });
      sister.look(balloon);
    });
    S.par(() => S.say('s18.5'), () => {
      sister.reach('L', { x: SPOT.x, y: SPOT.y - 8 }, 0.4);
      S.hold(balloon, sister, 'L', { layer: S.L.top });
      S.par(() => sister.carry('L', -12, -268, 0.45), () => S.to(balloon, { rot: -90 }, 0.45));
      [1.55, 2.15, BIG].forEach(size => {
        S.sound('blow', sister);
        sister.face('open');
        S.to(balloon, { sx: size, sy: size }, 0.55, 'out');
        sister.face('smile');
        S.wait(0.28);
      });
      // ...and she sets it back on the table
      S.par(() => sister.reach('L', { x: 462, y: SPOT.y - 8 }, 0.55), () => S.to(balloon, { rot: 0 }, 0.55));
      S.drop(balloon, { x: 462, y: SPOT.y, layer: S.L.front });
      sister.rest('L');
      sister.look(null);
    });
    S.say('s18.6');
    S.par(() => S.say('s18.7'), () => Kit.leave(S, sister, doors.R));
    S.wait(0.3);
    S.say('s18.8');

    const cards = [
      { value: 'little', label: 'A little balloon', art: m.g('translate(0 34) scale(0.9)', BALLOON) },
      { value: 'big', label: 'A big balloon', art: m.g('translate(0 80) scale(2.3)', m.scaled(2.3, balloonArt)) },
    ];
    S.ask({ id: 's18.q', say: 's18.q', who: 'bear', cards, correct: 'little' });
    if (STUDY.realityChecks) S.ask({ id: 's18.r', say: 's18.r', kind: 'reality', cards, correct: 'big' });
  },
});
