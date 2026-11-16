// A8. ATTENTION CHECK: Mr. Bear is at school. Mr. Rabbit is his teacher; Mr. Duck is in his class. Who is his
// teacher? Both are on screen for the question, and Mr. Duck is someone the child already knows, so the right
// answer has to come from listening.
Story.scene({
  id: 'a8', kind: 'attention', title: 'The classroom',
  build(S) {
    const { m } = Engine;
    const CHALK = '#f4efe6';
    S.thing(m.r(0, 0, 1000, 650, 0, '#f1ece2') + m.r(0, Kit.FLOOR - 12, 1000, 12, 0, '#e7dfd2') + m.r(0, Kit.FLOOR, 1000, 180, 0, '#d9d5c9') +
      // the blackboard, with a few chalk doodles (shapes, never letters)
      m.r(330, 118, 340, 216, 10, '#cdbb9c') + m.r(344, 132, 312, 188, 5, '#4f7f6a') + m.r(360, 326, 280, 10, 5, '#bfab89') +
      m.c(404, 196, 20, 'none', `stroke="${CHALK}" stroke-width="4"`) +
      m.l('M404 164V156M404 228V236M372 196H364M436 196H444M381 173L375 167M427 219L433 225M427 173L433 167M381 219L375 225', CHALK, 4) +
      m.l('M474 266L512 206L550 266Z', CHALK, 4) + m.l('M578 190Q594 168 610 190T642 190', '#f6d68a', 4) + m.l('M586 250H636', '#f0b9bb', 4),
      { layer: S.L.bg });
    // Mr. Duck's desk
    Kit.table(S, { x: 215, w: 236, y: 474 });

    const duck = S.cast('duck', { x: 215, y: 574 });
    const bear = S.cast('bear', { x: 500, y: 598 });
    const rabbit = S.cast('rabbit', { x: 772, y: 598 });

    S.wait(0.5);
    S.par(() => S.say('a8.1'), () => {
      S.wait(0.3);
      bear.wave('R', 1);
    });
    S.par(() => S.say('a8.2'), () => {
      bear.look(rabbit);
      rabbit.look(bear);
      S.wait(0.4);
      rabbit.wave('L');
      rabbit.hop(14);
    });
    S.par(() => S.say('a8.3'), () => {
      rabbit.look(null);
      bear.look(duck);
      duck.look(bear);
      S.wait(0.6);
      duck.wave('R');
      duck.hop(14);
    });
    bear.look(null);
    duck.look(null);
    S.wait(0.4);

    S.ask({
      id: 'a8.q', say: 'a8.q', correct: 'rabbit',
      cards: [
        { value: 'rabbit', label: 'Mr. Rabbit', art: m.g('translate(0 32) scale(0.43)', Cast.head('rabbit')) },
        { value: 'duck', label: 'Mr. Duck', art: m.g('translate(0 8) scale(0.62)', Cast.head('duck')) },
      ],
    });
  },
});
