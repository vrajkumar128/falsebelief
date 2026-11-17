// S15. ATTENTION CHECK: at the gym there is a basketball and a soccer ball; Mr. Bear's favourite game is soccer.
// What is his favourite game? He kicks the soccer ball into the goal and it rolls back out, so both balls are on
// the floor again for the question.
Story.scene({
  id: 's15', kind: 'attention', title: 'The gym',
  build(S) {
    const { m } = Engine;
    const INK = '#2c1e14', NET = '#c1b69e', WHITE = '#ffffff';
    // Both balls stand on (0, 0)
    const basketballArt = () => m.c(0, -28, 28, '#f4762a') + m.l('M-28 -28H28M0 -56V0M-20 -48Q-6 -28 -20 -8M20 -48Q6 -28 20 -8', '#8d3405', 2.6);
    const soccerArt = () => m.c(0, -27, 27, WHITE) + m.p('M0 -40L12 -31L7 -17H-7L-12 -31Z', INK) +
      [0, 72, 144, 216, 288].map(a => m.g(`rotate(${a} 0 -27)`, m.p('M-7 -54H7L4 -46H-4Z', INK))).join('');
    const BASKETBALL = basketballArt(), SOCCER = soccerArt();

    // (the line across the floor is the edge of the court)
    Kit.room(S, { kind: 'gym', also: m.flat(() => m.r(0, 536, 1000, 6, 0, '#fbedcb')) });
    // A basketball hoop on the wall, and a soccer goal
    S.thing(m.r(-80, -330, 160, 108, 8, WHITE) + m.r(-30, -288, 60, 46, 3, 'none', 'stroke="#e53935" stroke-width="5"') +
      m.l('M-38 -212L-24 -162M-13 -208L-9 -162M13 -208L9 -162M38 -212L24 -162M-24 -162H24', NET, 3) +
      m.e(0, -214, 40, 10, 'none', 'stroke="#f4762a" stroke-width="7"'), { layer: S.L.back, x: 215, y: Kit.FLOOR });
    const GOAL = { x: 770, y: 486 };
    S.thing(m.l([-74, -37, 0, 37, 74].map(px => `M${px} -170V0`).join('') + [-128, -86, -44].map(py => `M-110 ${py}H110`).join(''), NET, 2.5) +
      m.l('M-110 0V-170H110V0', WHITE, 11), { layer: S.L.back, x: GOAL.x, y: GOAL.y });
    const FLOOR = 592;
    const basketball = S.thing(BASKETBALL, { x: 320, y: FLOOR });
    const soccer = S.thing(SOCCER, { x: 560, y: FLOOR });
    const bear = S.cast('bear', { x: 440, y: 596, k: 0.85 });
    const bounce = thing => {
      S.to(thing, { y: FLOOR - 40 }, 0.2, 'out');
      S.to(thing, { y: FLOOR }, 0.2, 'in');
      S.sound('bounce', thing);
    };

    S.wait(0.5);
    S.say('s15.1');
    const naming = Narration.duration('s15.2');
    S.par(() => S.say('s15.2'), () => {
      S.wait(naming * 0.25);
      bear.look(basketball);
      bounce(basketball);
      S.wait(naming * 0.3);
      bear.look(soccer);
      bounce(soccer);
    });

    // He kicks the soccer ball into the goal; the net sends it rolling back
    S.par(() => S.say('s15.3'), () => {
      bear.walkTo(508);
      S.par(() => S.to(bear, { lean: 7 }, 0.14, 'out'), () => bear.hop(12, 0.26));
      S.sound('kick', soccer);
      S.par(() => S.to(bear, { lean: 0 }, 0.3), () => S.to(soccer, { x: GOAL.x - 6, y: GOAL.y + 4, sx: 0.82, sy: 0.82, rot: 560 }, 0.5, 'out'));
      S.sound('net', GOAL.x);
      bear.look(null);
      S.par(() => bear.cheer(1.1), () => {
        S.wait(0.12);
        S.to(soccer, { x: 650, y: FLOOR, sx: 1, sy: 1, rot: 260 }, 1, 'out');
      });
    });
    bear.walkTo(470);
    S.wait(0.3);

    const card = ball => m.g('translate(0 60) scale(2.1)', m.scaled(2.1, ball));
    S.ask({
      id: 's15.q', say: 's15.q', correct: 'soccer',
      cards: [
        { value: 'soccer', label: 'Soccer', art: card(soccerArt) },
        { value: 'basketball', label: 'Basketball', art: card(basketballArt) },
      ],
    });
  },
});
