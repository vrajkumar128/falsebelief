// A5. ATTENTION CHECK: on TV there is a snowman show and there is the news; Mr. Bear likes the snowman show.
// What does he like to watch? (The snowman is a plain, made-up one, not a character from any film.) He turns
// the TV off before the question, so the picture gives nothing away.
Story.scene({
  id: 'a5', kind: 'attention', title: 'Watching TV',
  build(S) {
    const { m } = Engine;
    const INK = '#3a281e', SNOW = '#fffdf7', FRAME = '#4a4540';
    // What is on the screen, drawn in a 308 x 190 box
    const SHOW = {
      off: m.r(0, 0, 308, 190, 8, '#2e2b28'),
      snow: m.r(0, 0, 308, 190, 8, '#bfe0f0') + m.p('M0 152Q154 122 308 152V182Q308 190 300 190H8Q0 190 0 182Z', '#e9f3f7') +
        m.l('M124 116L96 96M184 116L212 96', '#7d5133', 5) + m.c(154, 126, 36, SNOW) + m.c(154, 74, 25, SNOW) +
        m.c(146, 69, 3.4, INK) + m.c(162, 69, 3.4, INK) + m.p('M154 76L180 81L154 86Z', '#ee8a2c') +
        m.c(154, 112, 3.6, INK) + m.c(154, 128, 3.6, INK) + m.c(154, 144, 3.6, INK) +
        [[58, 40, 4.5], [250, 54, 4.5], [92, 100, 3.5], [236, 118, 3.5], [38, 118, 3.5], [270, 24, 3.5], [208, 34, 3]]
          .map(([cx, cy, r]) => m.c(cx, cy, r, SNOW)).join(''),
      news: m.r(0, 0, 308, 190, 8, '#b9c7d6') + m.r(172, 22, 114, 76, 8, '#8fb4cf') + m.e(208, 52, 22, 14, '#9cc08a') + m.e(252, 68, 18, 11, '#9cc08a') +
        m.p('M62 190V142Q62 112 98 112H134Q170 112 170 142V190Z', '#55606e') + m.p('M102 112L116 152L130 112Z', SNOW) +
        m.p('M111 122H121L123 150L116 158L109 150Z', '#d1495b') + m.c(88, 50, 13, '#c9b28f') + m.c(144, 50, 13, '#c9b28f') + m.c(116, 76, 35, '#c9b28f') +
        m.c(105, 72, 3.6, INK) + m.c(127, 72, 3.6, INK) + m.e(116, 89, 13, 9, '#e9dcc5') + m.c(116, 85, 3.2, INK) +
        m.p('M0 164H308V182Q308 190 300 190H8Q0 190 0 182Z', '#3b4a63') + m.r(22, 172, 150, 8, 4, '#d1495b'),
    };

    S.thing(m.r(0, 0, 1000, 650, 0, '#f1ebe1') + m.r(0, Kit.FLOOR - 12, 1000, 12, 0, '#e7dfd2') + m.r(0, Kit.FLOOR, 1000, 180, 0, '#d8d5ca') +
      m.e(500, 592, 340, 40, '#cfc6b4'), { layer: S.L.bg });
    S.thing(Kit.shadow(500, 472, 150) + m.r(352, 398, 296, 72, 8, '#cdbb9c') + m.r(366, 412, 128, 44, 6, '#bfab89') + m.r(506, 412, 128, 44, 6, '#bfab89') +
      m.r(476, 380, 48, 20, 4, FRAME) + m.r(326, 166, 348, 226, 16, FRAME), { layer: S.L.back, lift: true });
    const screen = S.thing(Object.keys(SHOW).map(name => `<g data-show="${name}">${SHOW[name]}</g>`).join(''), {
      layer: S.L.back, x: 346, y: 184, show_: 'snow',
      draw: (s, thing) => {
        if (thing.showing === s.show_) return;
        thing.showing = s.show_;
        Array.from(thing.el.children).forEach(g => {
          if (g.dataset.show === s.show_) g.removeAttribute('display'); else g.setAttribute('display', 'none');
        });
      },
    });
    const TV = { x: 500, y: 280 };

    const bear = S.cast('bear', { x: 196, y: 596 });
    const remote = S.thing(m.r(-8, -30, 16, 44, 6, FRAME) + m.c(0, -20, 4, '#d1495b') + m.c(0, -8, 2.6, '#8d8478') + m.c(0, 0, 2.6, '#8d8478'),
      { layer: S.L.top, lift: true });
    bear.pose('R', 66, -262);
    S.hold(remote, bear, 'R', { dy: -8 });
    bear.look(TV);
    // He points the remote and presses: the picture changes with the click
    const press = show => {
      bear.carry('R', 80, -276, 0.14);
      S.sound('click', bear);
      S.set(screen, { show_: show });
      bear.carry('R', 66, -262, 0.18);
    };

    S.wait(0.6);
    S.say('a5.1');
    const naming = Narration.duration('a5.2');
    S.par(() => S.say('a5.2'), () => {
      S.wait(naming * 0.5);
      press('news');
    });
    S.wait(0.2);
    S.par(() => S.say('a5.3'), () => {
      press('snow');
      bear.face('wide');
      bear.hop(24);
      S.wait(0.9);
      bear.face('smile');
    });
    S.wait(0.5);
    press('off');
    bear.look(null);
    S.wait(0.3);

    const card = show => m.g('translate(-92 -57) scale(0.6)', m.r(-13, -13, 334, 216, 16, FRAME) + SHOW[show]);
    S.ask({
      id: 'a5.q', say: 'a5.q', correct: 'snowman',
      cards: [
        { value: 'snowman', label: 'The snowman show', art: card('snow') },
        { value: 'news', label: 'The news', art: card('news') },
      ],
    });
  },
});
