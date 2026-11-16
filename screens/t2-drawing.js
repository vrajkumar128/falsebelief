// T2. TEST: what something shows. Mr. Bear draws a butterfly on the drawing board and goes to the bathroom.
// While he is away, Mr. Duck wipes it off and draws a school bus. What does Mr. Bear think his drawing shows?
// Mr. Bear is still away when the question is asked (the board is in plain view, so if he came back he'd see it).
Story.scene({
  id: 't2', kind: 'test', title: 'The drawing',
  build(S) {
    const { m } = Engine;
    const INK = '#3a281e';
    const BUTTERFLY = [
      { d: 'M0 -34V34', color: INK, width: 8 },
      { d: 'M0 -20C-30 -70 -92 -62 -84 -18C-80 4 -30 6 0 -6', color: '#8e6bbf', fill: '#cdb9ea' },
      { d: 'M0 -20C30 -70 92 -62 84 -18C80 4 30 6 0 -6', color: '#8e6bbf', fill: '#cdb9ea' },
      { d: 'M0 2C-34 8 -74 22 -60 50C-48 68 -12 48 0 20', color: '#8e6bbf', fill: '#e3d6f5' },
      { d: 'M0 2C34 8 74 22 60 50C48 68 12 48 0 20', color: '#8e6bbf', fill: '#e3d6f5' },
      { d: 'M0 -34Q-12 -58 -24 -62M0 -34Q12 -58 24 -62', color: INK, width: 4 },
    ];
    const BUS = [
      { d: 'M-92 30V-22Q-92 -40 -74 -40H60Q92 -40 92 -8V30Z', color: '#d9920f', fill: '#f7cf4a' },
      { d: 'M-74 -26H-44V-2H-74Z', color: INK, width: 4, fill: '#cfe6f2' },
      { d: 'M-32 -26H-2V-2H-32Z', color: INK, width: 4, fill: '#cfe6f2' },
      { d: 'M10 -26H40V-2H10Z', color: INK, width: 4, fill: '#cfe6f2' },
      { d: 'M-92 8H92', color: INK, width: 4 },
      { d: 'M-66 30a16 16 0 1 0 32 0a16 16 0 1 0 -32 0', color: INK, width: 5, fill: INK },
      { d: 'M28 30a16 16 0 1 0 32 0a16 16 0 1 0 -32 0', color: INK, width: 5, fill: INK },
    ];
    const strokeArt = (strokes, drawn) => strokes.map(s =>
      `<path d="${s.d}" fill="${s.fill || 'none'}"${drawn ? '' : ' fill-opacity="0"'} stroke="${s.color}" stroke-width="${s.width || 6}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');

    const doors = Kit.room(S, { wall: '#f4ece2', left: 'hall', right: 'hall' });
    Kit.table(S);
    // A drawing board propped on the table, tilted toward us so we can see what is on it. Whoever draws stands
    // behind it, far enough back (feet at y = FEET) that their shoulders clear its top edge, so the arm comes
    // over the top of the board and down onto it.
    const AT = { x: 500, y: 372 }, SCALE = 0.72, FEET = 522;
    S.thing(m.r(-134, -138, 268, 138, 12, '#cdbb9c') + m.r(-124, -128, 248, 118, 6, '#fffdf7'), { x: 500, y: Kit.TABLE, lift: true });

    // A marker drawing: `p` draws it stroke by stroke (0..1); `wipe` rubs it out from left to right (0..1).
    // `pen` is where the marker's tip is; it glides between strokes rather than jumping.
    function sketch(strokes) {
      const clipId = S.clip(m.r(-100, -80, 220, 160, 0, '#000'));
      const cover = S.defs.querySelector('#' + clipId + ' rect');
      let paths, lengths, total, shown = {}, at = null;
      const made = S.thing(`<g clip-path="url(#${clipId})"><g transform="scale(${SCALE})">${strokeArt(strokes, false)}</g></g>`, {
        x: AT.x, y: AT.y, p: 0, wipe: 0,
        draw: s => {
          if (shown.p !== s.p) {
            shown.p = s.p;
            let before = 0;
            paths.forEach((path, i) => {
              const part = Math.max(0, Math.min(1, (s.p * total - before) / lengths[i]));
              path.style.strokeDasharray = lengths[i] + 1;
              path.style.strokeDashoffset = (lengths[i] + 1) * (1 - part);
              path.setAttribute('fill-opacity', part >= 1 ? 1 : 0);
              path.style.visibility = part > 0 ? 'visible' : 'hidden';
              before += lengths[i];
            });
          }
          if (shown.wipe !== s.wipe) {
            shown.wipe = s.wipe;
            cover.setAttribute('x', -72 + 146 * s.wipe);
          }
        },
      });
      paths = Array.from(made.el.querySelectorAll('path'));
      lengths = paths.map(path => path.getTotalLength());
      total = lengths.reduce((sum, length) => sum + length, 0);
      const tip = () => {
        let along = made.s.p * total, i = 0;
        while (i < paths.length - 1 && along > lengths[i]) along -= lengths[i++];
        const spot = paths[i].getPointAtLength(Math.min(along, lengths[i]));
        return { x: AT.x + spot.x * SCALE, y: AT.y + spot.y * SCALE };
      };
      made.start = () => {
        const spot = paths[0].getPointAtLength(0);
        return { x: AT.x + spot.x * SCALE + 12, y: AT.y + spot.y * SCALE - 26 };
      };
      made.end = () => {
        const last = paths[paths.length - 1], spot = last.getPointAtLength(lengths[lengths.length - 1]);
        return { x: AT.x + spot.x * SCALE + 12, y: AT.y + spot.y * SCALE - 26 };
      };
      // The hand that holds the marker: up and to the right of its tip
      made.pen = {
        point: () => {
          const want = tip();
          if (!at || Math.hypot(want.x - at.x, want.y - at.y) > 400) at = want;
          const dx = want.x - at.x, dy = want.y - at.y, far = Math.hypot(dx, dy), stride = Math.min(1, 16 / (far || 1));
          at = { x: at.x + dx * stride, y: at.y + dy * stride };
          return { x: at.x + 12, y: at.y - 26 };
        },
      };
      return made;
    }

    const butterfly = sketch(BUTTERFLY), bus = sketch(BUS);
    const marker = S.thing(m.g('rotate(24)', m.r(-5, -46, 10, 42, 4, '#4a4540') + m.p('M-5 -6H5L0 3Z', '#8e6bbf')), { layer: S.L.top, lift: true });
    const ERASER_REST = { x: 692, y: 432 };
    const eraser = S.thing(m.r(-22, -13, 44, 16, 5, '#5e7f97') + m.r(-22, 1, 44, 10, 3, '#f4efe6'), Object.assign({ lift: true }, ERASER_REST));
    const bear = S.cast('bear', { x: 455, y: FEET });
    const duck = S.cast('duck', { show: false });
    const GRIP = { dx: -12, dy: 26 }, MARKER_REST = { x: 636, y: 438, rot: 62 }, STAND = 455, TOOLS = 580;

    // Draws `drawing` with the marker in the right hand. The arm comes over the top of the board, in front of it.
    const draw = (p, drawing, seconds) => {
      S.set(p, { layerR: S.L.top });
      p.reach('R', drawing.start(), 0.4);
      p.follow('R', drawing.pen);
      S.par(() => S.to(drawing, { p: 1 }, seconds, 'linear'), () => {
        for (let t = 0; t < seconds - 0.2; t += 0.46) {
          S.sound('marker', AT.x);
          S.wait(0.46);
        }
      });
      p.unfollow('R', drawing.end());
      p.carry('R', 78, -246, 0.3);
      S.set(p, { layerR: null });
    };
    const putMarkerDown = p => {
      p.walkTo(TOOLS);
      p.reach('R', { x: MARKER_REST.x + 6, y: MARKER_REST.y - 14 }, 0.4);
      S.drop(marker, Object.assign({ layer: S.L.front }, MARKER_REST));
      p.rest('R');
    };

    // Mr. Bear draws a butterfly
    bear.pose('R', 78, -246);
    S.hold(marker, bear, 'R', GRIP);
    S.wait(0.6);
    S.say('t2.1');
    S.par(() => S.say('t2.2'), () => {
      bear.look(butterfly);
      draw(bear, butterfly, 3.4);
    });
    putMarkerDown(bear);
    bear.look(null);
    S.par(() => S.say('t2.3'), () => Kit.leave(S, bear, doors.L));
    S.wait(0.4);

    // Mr. Duck wipes it away...
    S.par(() => S.say('t2.4'), () => {
      Kit.arrive(S, duck, doors.R, FEET);
      duck.walkTo(TOOLS);
    });
    S.par(() => S.say('t2.5'), () => {
      duck.look(butterfly);
      duck.reach('R', eraser, 0.4);
      S.hold(eraser, duck, 'R', { layer: S.L.top });
      duck.carry('R', 70, -230, 0.3);
      duck.walkTo(STAND);
      S.set(duck, { layerR: S.L.top });
      duck.reach('R', { x: 428, y: 330 }, 0.35);
      S.par(() => S.to(butterfly, { wipe: 1 }, 2.4, 'linear'), () => {
        for (let i = 0; i < 6; i++) {
          S.sound('eraser', AT.x);
          duck.reach('R', { x: 428 + 146 * (i + 1) / 6, y: i % 2 ? 330 : 416 }, 0.4, { ease: 'linear' });
        }
      });
      S.set(butterfly, { show: false });
      duck.carry('R', 70, -230, 0.3);
      S.set(duck, { layerR: null });
      duck.walkTo(TOOLS);
      duck.reach('R', { x: ERASER_REST.x, y: ERASER_REST.y - 8 }, 0.35);
      S.drop(eraser, Object.assign({ layer: S.L.front }, ERASER_REST));
    });
    // ...and draws a school bus
    S.par(() => S.say('t2.6'), () => {
      duck.reach('R', { x: MARKER_REST.x + 6, y: MARKER_REST.y - 14 }, 0.35);
      S.hold(marker, duck, 'R', Object.assign({ layer: S.L.top }, GRIP));
      S.set(marker, { rot: 0 });
      duck.carry('R', 70, -230, 0.3);
      duck.walkTo(STAND);
      duck.look(bus);
      draw(duck, bus, 3.6);
      putMarkerDown(duck);
      duck.look(null);
    });
    S.say('t2.7');
    S.par(() => S.say('t2.8'), () => Kit.leave(S, duck, doors.R));
    S.wait(0.3);
    S.say('t2.9');

    const card = strokes => m.g('scale(0.92)', strokeArt(strokes, true));
    const cards = [
      { value: 'butterfly', label: 'A butterfly', art: card(BUTTERFLY) },
      { value: 'bus', label: 'A school bus', art: card(BUS) },
    ];
    S.ask({ id: 't2.q', say: 't2.q', who: 'bear', cards, correct: 'butterfly' });
    if (STUDY.realityChecks) S.ask({ id: 't2.r', say: 't2.r', kind: 'reality', cards, correct: 'bus' });
  },
});
