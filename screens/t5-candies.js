// T5. TEST: how many there are. Mr. Bear's mom gives him three candies; he puts them in a glass jar and goes
// outside. While he is out, his sister eats one. How many does Mr. Bear think are in the jar?
// Three and two, not four and three: young children can tell two from three at a glance, so the question
// tests what Mr. Bear knows rather than counting. The jar is glass (the child can see two are left), so Mr. Bear
// is still outside when the question is asked.
Story.scene({
  id: 't5', kind: 'test', title: 'The candies',
  build(S) {
    const { m } = Engine;
    const RED = '#d1495b', RED_DARK = '#a8323f';
    const candy = m.p('M-13 0L-30 -10V10Z', RED_DARK) + m.p('M13 0L30 -10V10Z', RED_DARK) + m.e(0, 0, 17, 11.5, RED) +
      m.l('M-5 -8Q1 0 -5 8M5 -8Q11 0 5 8', '#fffdf7', 2.4, 'opacity=".7"');
    const doors = Kit.room(S, { wall: '#f4eee4', left: 'outside', right: 'hall' });
    Kit.table(S);

    // A low glass jar: what is inside shows through its front
    const JAR = { x: 500, y: Kit.TABLE }, RIM = Kit.TABLE - 100;
    S.thing(m.r(-66, -100, 132, 100, 24, '#dcebf0', 'opacity=".6"'), { x: JAR.x, y: JAR.y });
    const inJar = S.slot();
    S.thing(Kit.shadow(0, 1, 66) + m.r(-66, -100, 132, 100, 24, '#cfe3ea', 'opacity=".2"') + m.r(-50, -86, 12, 62, 6, '#fffdf7', 'opacity=".6"') +
      m.r(-70, -108, 140, 16, 8, '#b9d3dc'), { x: JAR.x, y: JAR.y });
    const REST = [{ x: 478, y: 433 }, { x: 524, y: 433 }, { x: 501, y: 412 }]; // where the three end up in the jar
    const HELD = [{ dx: -16, dy: -8 }, { dx: 15, dy: -10 }, { dx: 0, dy: -27 }]; // and how they sit in a paw
    const candies = REST.map(() => S.thing(candy, { layer: S.L.top, lift: true }));
    const look = { x: JAR.x, y: 400 };

    const bear = S.cast('bear', { x: 436, y: Kit.BACK });
    const mom = S.cast('mom', { x: 664, y: Kit.BACK });
    const sister = S.cast('sister', { show: false });

    // Mom hands him three candies
    mom.pose('L', -70, -270);
    candies.forEach((thing, i) => S.hold(thing, mom, 'L', HELD[i]));
    mom.look(bear);
    bear.look(mom);
    S.wait(0.6);
    const give = { x: 556, y: 334 };
    S.par(() => S.say('t5.1'), () => {
      S.wait(0.7);
      S.par(() => mom.reach('L', give, 0.5), () => bear.reach('R', give, 0.5));
      candies.forEach((thing, i) => S.hold(thing, bear, 'R', HELD[i]));
      S.par(() => mom.rest('L'), () => bear.carry('R', 92, -300, 0.4));
      bear.look(candies[2]);
      bear.face('wide');
      bear.hop(20);
      S.wait(0.5);
      bear.face('smile');
    });

    // He drops them into the jar one at a time ("One, two, three"), while Mom goes
    S.bg(() => {
      mom.look(null);
      mom.wave('R', 1);
      Kit.leave(S, mom, doors.R);
    });
    const counting = Narration.duration('t5.2');
    S.par(() => S.say('t5.2'), () => {
      const over = { x: JAR.x + 2, y: RIM - 50 };
      bear.look(look);
      bear.reach('R', over, 0.5);
      S.wait(Math.max(0, counting * 0.45 - 0.5));
      candies.forEach((thing, i) => {
        S.set(thing, { layer: inJar });
        S.drop(thing, { x: over.x + HELD[i].dx, y: over.y + HELD[i].dy });
        S.to(thing, REST[i], 0.3, 'in');
        S.sound('plink', JAR.x);
        S.wait(Math.max(0.2, counting * 0.16 - 0.3));
      });
      bear.rest('R');
      bear.look(null);
    });
    S.par(() => S.say('t5.3'), () => Kit.leave(S, bear, doors.L));
    S.wait(0.4);

    // His sister takes one out and eats it
    S.par(() => S.say('t5.4'), () => {
      Kit.arrive(S, sister, doors.R);
      sister.look(look);
      sister.walkTo(476);
    });
    S.par(() => S.say('t5.5'), () => {
      S.set(sister, { layerR: inJar });
      sister.reach('R', { x: 505, y: 404 }, 0.45);
      S.hold(candies[2], sister, 'R', { dx: -4, dy: 8 });
      sister.reach('R', { x: 526, y: RIM - 26 }, 0.42);
      S.set(sister, { layerR: null });
      S.set(candies[2], { layer: S.L.top });
      sister.look(candies[2]);
      sister.carry('R', 18, -354, 0.42);
      S.sound('wrapper', sister);
      S.wait(0.35);
      S.to(candies[2], { sx: 0.2, sy: 0.2 }, 0.3, 'in');
      S.set(candies[2], { show: false });
      S.sound('munch', sister);
      sister.face('chew');
      sister.rest('R');
      S.wait(0.9);
      sister.face('smile');
      sister.look(null);
    });
    S.say('t5.6');
    S.par(() => S.say('t5.7'), () => Kit.leave(S, sister, doors.R));
    S.wait(0.3);
    S.say('t5.8');

    const row = xs => xs.map(cx => m.g(`translate(${cx} 0) scale(1.5)`, candy)).join('');
    const cards = [
      { value: 'three', label: 'Three candies', art: row([-64, 0, 64]) },
      { value: 'two', label: 'Two candies', art: row([-34, 34]) },
    ];
    S.ask({ id: 't5.q', say: 't5.q', who: 'bear', cards, correct: 'three' });
    if (STUDY.realityChecks) S.ask({ id: 't5.r', say: 't5.r', kind: 'reality', cards, correct: 'two' });
  },
});
