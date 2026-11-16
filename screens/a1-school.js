// A1. ATTENTION CHECK: Mr. Bear goes to the red school. Which school does he go to? Meets Mr. Bear, and teaches
// how answering works: tap one of two things. The child answers by tapping a school.
Story.scene({
  id: 'a1', kind: 'attention', title: 'The two schools', spatial: true,
  build(S) {
    const { m } = Engine;
    Kit.outdoors(S);
    // A path from each school's door to where Mr. Bear stands
    S.thing(m.p('M178 470Q330 545 430 650H570Q670 545 822 470H748Q640 530 520 600H480Q360 530 252 470Z', '#e9dfc4'), { layer: S.L.bg });
    const school = (x, wall, dark) => S.thing(
      Kit.shadow(0, 2, 150, 9) +
      m.r(-22, -330, 44, 62, 4, wall) + m.p('M-32 -330L0 -360L32 -330Z', dark) + m.c(0, -300, 10, '#f2c230') +
      m.p('M-150 -200L0 -282L150 -200Z', dark) + m.r(-128, -200, 256, 200, 6, wall) +
      m.r(-26, -96, 52, 96, 5, dark) + m.c(12, -48, 5, '#f2c230') +
      m.r(-104, -160, 50, 50, 7, '#fdf6e3') + m.r(54, -160, 50, 50, 7, '#fdf6e3'),
      { layer: S.L.back, x, y: 478, lift: true });
    const red = school(215, '#d1495b', '#a8323f');
    const blue = school(785, '#2f6db5', '#23538c');
    const bear = S.cast('bear', { x: 500, y: 596 });
    const nod = thing => {
      S.to(thing, { sx: 1.04, sy: 1.06 }, 0.16, 'out');
      S.to(thing, { sx: 1, sy: 1 }, 0.22, 'in');
    };

    S.wait(0.5);
    S.par(() => S.say('a1.1'), () => {
      S.wait(0.2);
      bear.wave('R');
    });
    // Each school gives a little bounce as it is named
    const naming = Narration.duration('a1.2');
    S.par(() => S.say('a1.2'), () => {
      S.wait(naming * 0.5);
      bear.look(red);
      nod(red);
      S.wait(naming * 0.2);
      bear.look(blue);
      nod(blue);
    });
    bear.look(null);

    // He walks over to his school, waves, and comes back to the middle (so where he stands gives nothing away)
    S.par(() => S.say('a1.3'), () => {
      bear.look(red);
      bear.walkTo(318);
      bear.wave('L');
    });
    bear.look(null);
    bear.walkTo(500);
    S.wait(0.3);

    S.ask({
      id: 'a1.q', say: 'a1.q', correct: 'red',
      things: [
        { value: 'red', label: 'The red school', hit: { x: 215, y: 300, rx: 172, ry: 196 } },
        { value: 'blue', label: 'The blue school', hit: { x: 785, y: 300, rx: 172, ry: 196 } },
      ],
    });
  },
});
