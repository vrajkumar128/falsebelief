// T1. TEST: where something is. Mr. Bear puts his cookie in the blue jar and goes outside. While he is out,
// Mr. Turtle moves it to the orange jar. Mr. Bear comes back for his cookie: where does he think it is?
// (The classic "unexpected transfer" false-belief task.) The child answers by tapping a jar.
Story.scene({
  id: 't1', kind: 'test', title: 'The cookie jars', spatial: true,
  build(S) {
    const doors = Kit.room(S, { left: 'outside', right: 'hall' });
    Kit.table(S);
    const blue = Kit.crock(S, { x: 300, color: 'blue' });
    const orange = Kit.crock(S, { x: 700, color: 'orange' });
    const bear = S.cast('bear', { x: 500, y: Kit.BACK });
    const turtle = S.cast('turtle', { show: false });
    const cookie = Kit.cookie(S);
    const grip = { dx: -4, dy: -30 }; // the cookie sits on top of the paw that holds it

    // Mr. Bear has a cookie, and puts it in the blue jar
    bear.pose('R', 104, -318);
    S.hold(cookie, bear, 'R', grip);
    bear.look(cookie);
    S.wait(0.6);
    S.say('t1.1');
    S.par(() => S.say('t1.2'), () => {
      bear.look(blue);
      bear.walkTo(blue.stand);
      blue.open(bear, 'L');
      blue.put(bear, 'R', cookie, grip);
      S.par(() => blue.close(bear, 'L'), () => bear.rest('R'));
      bear.look(null);
    });

    // He goes outside
    S.par(() => S.say('t1.3'), () => Kit.leave(S, bear, doors.L));
    S.wait(0.4);

    // Mr. Turtle comes in and moves the cookie to the orange jar
    S.par(() => S.say('t1.4'), () => Kit.arrive(S, turtle, doors.R));
    S.par(() => S.say('t1.5'), () => {
      turtle.look(blue);
      turtle.walkTo(blue.stand);
      blue.open(turtle, 'L');
      blue.take(turtle, 'R', cookie, grip);
      turtle.look(cookie);
      S.par(() => blue.close(turtle, 'L'), () => turtle.carry('R', 104, -318));
    });
    S.par(() => S.say('t1.6'), () => {
      turtle.look(orange);
      turtle.walkTo(orange.stand);
      orange.open(turtle, 'L');
      orange.put(turtle, 'R', cookie, grip);
      S.par(() => orange.close(turtle, 'L'), () => turtle.rest('R'));
      turtle.look(null);
    });
    S.say('t1.7');
    S.par(() => S.say('t1.8'), () => Kit.leave(S, turtle, doors.R));
    S.wait(0.4);

    // Mr. Bear comes back; both jars look just as he left them
    S.par(() => S.say('t1.9'), () => {
      Kit.arrive(S, bear, doors.L);
      bear.walkTo(500);
    });
    S.wait(0.3);

    const jars = [
      { value: 'blue', label: 'The blue jar', hit: blue.hit },
      { value: 'orange', label: 'The orange jar', hit: orange.hit },
    ];
    S.ask({ id: 't1.q', say: 't1.q', things: jars, correct: 'blue', tap: 'jarTap' });
    if (STUDY.realityChecks) S.ask({ id: 't1.r', say: 't1.r', kind: 'reality', things: jars, correct: 'orange', tap: 'jarTap' });
  },
});
