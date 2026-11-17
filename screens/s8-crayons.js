// S8. TEST: what is inside something. At Mr. Turtle's house Mr. Bear finds a crayon box; it turns out to be
// full of marbles. Then Mr. Duck arrives, who has never looked inside. (The classic "unexpected contents"
// task.) Four questions, always with the same two cards:
//   t3.p   before the box is opened: what do you think is inside? (a guess; there is no right answer, but a
//          child who doesn't say crayons here can't be scored on the next two)
//   t3.q1  before the box was opened, what did you think was inside?   (the child's own earlier belief)
//   t3.q2  what does Mr. Duck think is inside?                         (someone else's false belief)
//   t3.r   what is really inside?
Story.scene({
  id: 's8', kind: 'test', title: 'The crayon box',
  build(S) {
    const { m } = Engine;
    const COLORS = ['#e53935', '#1e88e5', '#43a047', '#9575cd'];
    const doors = Kit.room(S, { kind: 'turtle', right: 'hall' });
    Kit.table(S);

    // The box: its front shows crayons; the flap on top opens (`lid` 0..1)
    const BOX = { x: 520, y: Kit.TABLE };
    const crayonsOnFront = COLORS.map((color, i) => {
      const cx = -33 + i * 22;
      return m.r(cx - 6, -98, 12, 30, 3, color) + m.p(`M${cx - 6} -98L${cx} -109L${cx + 6} -98Z`, color);
    }).join('');
    const box = S.thing(
      m.r(-42, -117, 84, 9, 3, '#9a7200') + `<g>${m.r(-46, -128, 92, 18, 5, '#fcba00')}</g>` +
      m.r(-46, -112, 92, 112, 6, '#ffca28') + m.r(-46, -58, 92, 22, 0, '#26a69a') + crayonsOnFront,
      {
        x: BOX.x, y: BOX.y, lid: 0,
        draw: (s, thing) => {
          if (thing.lidWas === s.lid) return;
          thing.lidWas = s.lid;
          thing.el.children[1].setAttribute('transform', `rotate(${(-112 * s.lid).toFixed(1)} -46 -112)`);
        },
      });
    const marbleArt = (color, r = 12) => m.c(0, 0, r, color) + m.p(`M${-r / 2} ${-r / 3}Q0 ${-r * 0.85} ${r / 2} ${-r / 3}Q0 0 ${-r / 2} ${-r / 3}Z`, '#ffffff', 'opacity=".55"');
    const marbles = COLORS.map(color => S.thing(marbleArt(color), { x: 640, y: 428, show: false }));

    const bear = S.cast('bear', { x: 400, y: Kit.BACK });
    const duck = S.cast('duck', { show: false });
    const crayonCard = [-46, 0, 46].map((cx, i) => m.g(`translate(${cx} 14) rotate(${[-9, 0, 9][i]})`,
      m.r(-12, -52, 24, 92, 5, COLORS[i]) + m.p('M-12 -52L0 -78L12 -52Z', COLORS[i]) + m.r(-12, -14, 24, 26, 0, '#ffffff', 'opacity=".35"'))).join('');
    const marbleCard = [[-48, -12], [2, -30], [50, 4], [-4, 28]].map(([cx, cy], i) => m.g(`translate(${cx} ${cy})`, marbleArt(COLORS[i], 25))).join('');
    const cards = [
      { value: 'crayons', label: 'Crayons', art: crayonCard },
      { value: 'marbles', label: 'Marbles', art: marbleCard },
    ];

    // He finds the box. What does the child think is in it?
    S.wait(0.5);
    S.say('s8.1');
    S.par(() => S.say('s8.2'), () => {
      bear.look(box);
      S.wait(0.5);
      S.to(box, { sy: 1.07 }, 0.16, 'out');
      S.to(box, { sy: 1 }, 0.22, 'in');
    });
    S.ask({ id: 's8.p', say: 's8.p', kind: 'guess', cards });

    // He opens it and tips it over: marbles roll out
    S.par(() => S.say('s8.3'), () => {
      bear.reach('R', { x: BOX.x + 20, y: BOX.y - 122 }, 0.4);
      S.sound('boxFlap', BOX.x);
      S.par(() => S.to(box, { lid: 1 }, 0.3, 'out'), () => bear.reach('R', { x: BOX.x - 20, y: BOX.y - 150 }, 0.3));
      bear.reach('R', { x: BOX.x, y: BOX.y - 60 }, 0.35);
    });
    S.par(() => S.say('s8.4'), () => {
      S.par(() => S.to(box, { rot: 100, y: 400 }, 0.5), () => bear.reach('R', { x: BOX.x + 30, y: 372 }, 0.5));
      S.sound('rattle', 660, { length: 0.9 });
      S.par(...marbles.map((marble, i) => () => {
        S.wait(i * 0.13);
        S.set(marble, { show: true });
        S.to(marble, { x: 690 + (3 - i) * 31, y: 434, rot: 540 }, 0.5, 'out');
      }));
      bear.face('open');
      bear.look(marbles[1]);
      bear.hop(20);
    });
    S.wait(0.5);

    // He puts them back and shuts the box, so it looks just as it did
    S.par(() => S.say('s8.5'), () => {
      bear.face('smile');
      S.sound('rattle', 660, { length: 0.8 });
      S.par(...marbles.map((marble, i) => () => {
        S.wait((3 - i) * 0.13);
        S.to(marble, { x: 640, y: 428, rot: 0 }, 0.42, 'in');
        S.set(marble, { show: false });
      }));
      S.par(() => S.to(box, { rot: 0, y: BOX.y }, 0.5), () => bear.reach('R', { x: BOX.x - 20, y: BOX.y - 150 }, 0.5));
      S.sound('boxFlap', BOX.x);
      S.par(() => S.to(box, { lid: 0 }, 0.28, 'in'), () => bear.reach('R', { x: BOX.x + 20, y: BOX.y - 124 }, 0.28));
      bear.rest('R');
      bear.look(null);
    });
    S.wait(0.3);
    S.ask({ id: 's8.q1', say: 's8.q1', cards, correct: 'crayons' });

    // Mr. Duck comes in; he has never looked inside
    S.par(() => S.say('s8.6'), () => {
      Kit.arrive(S, duck, doors.R, { x: 700 });
      bear.look(duck);
      duck.look(box);
      bear.look(box);
    });
    S.wait(0.3);
    S.ask({ id: 's8.q2', say: 's8.q2', who: 'duck', cards, correct: 'crayons' });
    if (STUDY.realityChecks) S.ask({ id: 's8.r', say: 's8.r', kind: 'reality', cards, correct: 'marbles' });
  },
});
