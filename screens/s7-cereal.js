// S7. ATTENTION CHECK: at the grocery store there is star cereal and circle cereal; Mr. Bear's favourite is the
// star cereal. What is his favourite cereal? The box he takes goes into his basket, out of sight, and the same
// number of each kind is left on the shelf, so the picture at the end gives nothing away.
Story.scene({
  id: 's7', kind: 'attention', title: 'The grocery store',
  build(S) {
    const { m } = Engine;
    const SHELF = 342; // the top of the board the cereal stands on
    const box = kind => kind === 'star'
      ? m.r(-38, -104, 76, 104, 6, '#1e88e5') + m.r(-38, -104, 76, 16, 6, '#1565c0') + Kit.star(0, -48, 25, '#ffca28') +
        Kit.star(-20, -16, 8, '#ffca28') + Kit.star(20, -18, 7, '#ffca28')
      : m.r(-38, -104, 76, 104, 6, '#e53935') + m.r(-38, -104, 76, 16, 6, '#b71c1c') +
        m.c(-11, -56, 14, 'none', 'stroke="#ffffff" stroke-width="7"') + m.c(15, -30, 11, 'none', 'stroke="#ffffff" stroke-width="6"') +
        m.c(-17, -22, 7, 'none', 'stroke="#ffffff" stroke-width="5"');

    Kit.room(S, {
      kind: 'store',
      // the shelves, with a few pale things on them that aren't cereal
      also: m.r(140, 96, 720, 374, 10, '#f1debd') + m.r(154, 110, 692, 346, 6, '#faf0de') +
        m.r(154, 214, 692, 14, 0, '#e3cca3') + m.r(154, SHELF, 692, 14, 0, '#e3cca3') +
        [[196, 44, 58], [250, 44, 58], [330, 56, 40], [470, 36, 72], [516, 36, 72], [640, 60, 46], [716, 44, 58], [770, 44, 58]]
          .map(([px, w, h], i) => m.r(px, 214 - h, w, h, 7, ['#dfe9d4', '#ecdec5', '#d5e4e9'][i % 3])).join('') +
        [[210, 70, 50], [300, 50, 76], [362, 50, 76], [470, 80, 44], [600, 46, 70], [660, 46, 70], [742, 70, 50]]
          .map(([px, w, h], i) => m.r(px, 456 - h, w, h, 7, ['#ecdec5', '#d5e4e9', '#dfe9d4'][i % 3])).join(''),
    });
    const boxAt = (kind, x) => S.thing(box(kind), { layer: S.L.back, x, y: SHELF });
    const stars = [190, 270, 350].map(x => boxAt('star', x));
    const circles = [650, 730].map(x => boxAt('circle', x));

    // A deep shopping basket by his feet
    const BASKET = 300;
    S.thing(m.l('M-58 -112Q0 -214 58 -112', '#cc8e35', 9) + m.e(0, -112, 74, 13, '#bc7d29'), { x: BASKET, y: 604 });
    const inBasket = S.slot();
    S.thing(Kit.shadow(0, 1, 70) + m.p('M-74 -112A74 13 0 0 0 74 -112L62 -8Q61 0 52 0H-52Q-61 0 -62 -8Z', '#dda756') +
      m.l('M-70 -78H70M-67 -44H67', '#cc8e35', 5), { x: BASKET, y: 604 });

    const bear = S.cast('bear', { x: 500, y: 600 });
    const nod = things => S.par(...things.map(thing => () => {
      S.to(thing, { y: SHELF - 14 }, 0.15, 'out');
      S.to(thing, { y: SHELF }, 0.2, 'in');
    }));

    S.wait(0.5);
    S.say('s7.1');
    const naming = Narration.duration('s7.2');
    S.par(() => S.say('s7.2'), () => {
      S.wait(naming * 0.3);
      bear.look(stars[1]);
      nod(stars);
      S.wait(naming * 0.3);
      bear.look(circles[0]);
      nod(circles);
    });
    bear.look(null);

    // He takes a box of the star cereal, happily, and puts it in his basket
    const mine = stars[2];
    S.par(() => S.say('s7.3'), () => {
      bear.look(mine);
      bear.walkTo(436);
      bear.reach('L', { x: 350, y: SHELF - 52 }, 0.45);
      S.hold(mine, bear, 'L', { dy: 52, layer: S.L.top });
      bear.carry('L', -118, -285, 0.45);
      bear.look(null);
      bear.face('wide');
      bear.hop(24);
      S.wait(0.7);
      bear.face('smile');
    });
    bear.look({ x: BASKET, y: 520 });
    S.set(mine, { layer: inBasket });
    S.par(() => bear.crouch(50, 0.4), () => bear.reach('L', { x: BASKET, y: 440 }, 0.45));
    S.drop(mine, { x: BASKET, y: 492 });
    S.to(mine, { y: 600 }, 0.22, 'in');
    S.sound('cardboard', BASKET);
    S.par(() => bear.crouch(0, 0.35), () => bear.rest('L'));
    bear.look(null);
    bear.walkTo(500);
    S.wait(0.3);

    S.ask({
      id: 's7.q', say: 's7.q', correct: 'star',
      cards: [
        { value: 'star', label: 'Star cereal', art: m.g('translate(0 64) scale(1.22)', m.scaled(1.22, () => box('star'))) },
        { value: 'circle', label: 'Circle cereal', art: m.g('translate(0 64) scale(1.22)', m.scaled(1.22, () => box('circle'))) },
      ],
    });
  },
});
