// S17. ATTENTION CHECK: Mr. Bear is at school. Mr. Rabbit is his teacher; Mr. Duck is in his class. Who is his
// teacher? Both are on screen for the question, and Mr. Duck is someone the child already knows, so the right
// answer has to come from listening.
Story.scene({
  id: 's17', kind: 'attention', title: 'The classroom',
  build(S) {
    const { m } = Engine;
    const CHALK = '#f7f0e3';
    Kit.room(S, {
      kind: 'class',
      // the blackboard, with a few chalk doodles (shapes, never letters)
      also: m.r(330, 118, 340, 216, 10, '#d9be90') + m.r(344, 132, 312, 188, 5, '#428c6c') + m.r(360, 326, 280, 10, 5, '#cdaf7b') +
        m.c(404, 196, 20, 'none', `stroke="${CHALK}" stroke-width="4"`) +
        m.l('M404 164V156M404 228V236M372 196H364M436 196H444M381 173L375 167M427 219L433 225M427 173L433 167M381 219L375 225', CHALK, 4) +
        m.l('M474 266L512 206L550 266Z', CHALK, 4) + m.l('M578 190Q594 168 610 190T642 190', '#ffe082', 4) + m.l('M586 250H636', '#fbaeb1', 4),
    });
    // Mr. Duck's desk
    Kit.table(S, { x: 215, w: 236, y: 474 });

    const duck = S.cast('duck', { x: 215, y: 584, k: 0.8 });
    const bear = S.cast('bear', { x: 500, y: 598, k: 0.8 });
    const rabbit = S.cast('rabbit', { x: 785, y: 598, k: 0.8 });

    S.wait(0.5);
    S.par(() => S.say('s17.1'), () => {
      S.wait(0.3);
      bear.wave('R', 1);
    });
    S.par(() => S.say('s17.2'), () => {
      bear.look(rabbit);
      rabbit.look(bear);
      S.wait(0.4);
      rabbit.wave('L');
      rabbit.hop(14);
    });
    S.par(() => S.say('s17.3'), () => {
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
      id: 's17.q', say: 's17.q', correct: 'rabbit',
      cards: [
        { value: 'rabbit', label: 'Mr. Rabbit', art: m.g('translate(0 40) scale(0.4)', Cast.head('rabbit')) },
        { value: 'duck', label: 'Mr. Duck', art: m.g('translate(0 10) scale(0.56)', Cast.head('duck')) },
      ],
    });
  },
});
