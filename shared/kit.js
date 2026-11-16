// What the scenes are built from: rooms and the outdoors, doors (and going through them), tables, and the
// props that more than one scene uses. Props that only one scene needs are drawn in that scene's own file.
//
// Everything is flat "cut paper": plain shapes, no outlines, no gradients. Rooms are pale and nearly empty so
// the things the story is about (which get the strong colours) are what the eye goes to.
//
// The usual room: the wall meets the floor at y = 470; a door is 160 wide and stands on that line; a table's top
// is at y = 446; characters stand behind the table with their feet at y = 552 (Kit.BACK).
const Kit = (() => {
  const { m, svg } = Engine;
  const FLOOR = 470, BACK = 552, TABLE = 446;
  const SHADOW = '#4f5a45';

  // ---------- rooms ----------
  // doors: { left: 'outside' | 'hall', right: ... } puts a door at that end of the back wall
  function room(S, o = {}) {
    const wall = o.wall || '#f5eee0', floor = o.floor || '#d6dccd', trim = o.trim || '#ebe3d2';
    S.thing(m.r(0, 0, 1000, 650, 0, wall) + m.r(0, FLOOR - 12, 1000, 12, 0, trim) + m.r(0, FLOOR, 1000, 650 - FLOOR, 0, floor),
      { layer: S.L.bg });
    const made = {};
    if (o.left) made.L = door(S, 105, o.left, o.door);
    if (o.right) made.R = door(S, 895, o.right, o.door);
    return made;
  }

  // Sky, ground, and soft hills; scenes add what stands on it
  function outdoors(S, o = {}) {
    S.surface = 'ground';
    S.thing(m.r(0, 0, 1000, 650, 0, o.sky || '#dfeaf0') +
      m.e(230, FLOOR + 8, 420, 92, o.hill || '#cfdcbd') + m.e(820, FLOOR + 14, 380, 76, o.hill || '#cfdcbd') +
      m.r(0, FLOOR, 1000, 650 - FLOOR, 0, o.ground || '#c3d3a8') +
      m.e(805, 96, 44, 44, '#f7e3a1') +
      m.g('translate(190 110)', m.e(0, 0, 62, 22, '#f8fbfb') + m.e(-30, -14, 30, 20, '#f8fbfb') + m.e(18, -18, 36, 24, '#f8fbfb')) +
      m.g('translate(560 70) scale(0.8)', m.e(0, 0, 62, 22, '#f8fbfb') + m.e(-30, -14, 30, 20, '#f8fbfb') + m.e(18, -18, 36, 24, '#f8fbfb')),
      { layer: S.L.bg });
  }

  // ---------- doors ----------
  // The leaf swings on the side nearer the edge of the picture, so the opening faces the middle of the room.
  // `slot` is the space just through the doorway: a character put there is behind the leaf and inside the frame.
  function door(S, x, beyond, colors = {}) {
    const w = 160, top = 105, left = x - w / 2, tall = FLOOR - top;
    const hingeLeft = x < 500, hinge = hingeLeft ? left : left + w, dir = hingeLeft ? 1 : -1;
    const tone = colors.tone || '#dcc9a6', panel = colors.panel || '#cfba93', frame = colors.frame || '#e9dcc4';
    const view = beyond === 'outside'
      ? m.r(left, top, w, tall, 0, '#cfe3ea') + m.r(left, FLOOR - 74, w, 74, 0, '#b9cf9f')
      : m.r(left, top, w, tall, 0, '#a39585') + m.r(left, FLOOR - 50, w, 50, 0, '#8d7f6f');
    S.thing(m.r(left - 13, top - 13, w + 26, tall + 13, 6, frame) + view, { layer: S.L.back });
    const slot = S.slot(S.L.back, { 'clip-path': `url(#${S.clip(m.r(left, top, w, tall, 0, '#000'))})` });
    const knob = hingeLeft ? left + w - 26 : left + 26;
    const leaf = S.thing(
      `<g>${m.r(left, top, w, tall, 3, tone)}${m.r(left + 18, top + 22, w - 36, 132, 6, panel)}${m.r(left + 18, top + 176, w - 36, 168, 6, panel)}${m.c(knob, 300, 9, '#b08d4f')}</g>`,
      {
        layer: S.L.back, open: 0,
        draw: (s, thing) => {
          const across = 1 - 0.86 * s.open;
          if (thing.across === across) return;
          thing.across = across;
          thing.el.firstChild.setAttribute('transform', `translate(${hinge} 0) scale(${across.toFixed(3)} 1) translate(${-hinge} 0)`);
        },
      });
    const handleAt = open => ({ x: hinge + dir * (w - 26) * (1 - 0.86 * open), y: 300 });
    return {
      x, slot, leaf, hingeLeft, handleAt,
      sill: FLOOR - 4,
      knob: handleAt(0),
      handleOpen: handleAt(1),
      handle: { point: () => handleAt(leaf.s.open) },
    };
  }

  // Out through a door: walks to it, opens it by the handle, steps through, and pulls it shut behind.
  // `carrying` lists anything in its hands, so that goes through the doorway with it.
  function leave(S, p, D, carrying = []) {
    const opening = D.hingeLeft ? 'R' : 'L', pulling = D.hingeLeft ? 'L' : 'R';
    p.walkTo(D.x);
    p.look(D.knob);
    p.reach(opening, D.knob, 0.3);
    // turns the handle and starts the door moving, then lets go: it swings the rest of the way by itself
    p.follow(opening, D.handle);
    S.sound('doorOpen', D.x);
    S.to(D.leaf, { open: 0.3 }, 0.18, 'in');
    p.unfollow(opening, D.handleAt(0.3));
    S.par(() => S.to(D.leaf, { open: 1 }, 0.34, 'out'), () => p.rest(opening, 0.3));
    p.look(null);
    p.depth(D.sill, p.k0 * 0.9);
    S.set(p, { layer: D.slot });
    carrying.forEach(thing => S.set(thing, { layer: D.slot }));
    p.reach(pulling, D.handleOpen, 0.25);
    p.follow(pulling, D.handle);
    S.to(D.leaf, { open: 0 }, 0.5, 'in');
    S.sound('doorClose', D.x);
    S.set(p, { show: false, ['follow' + pulling]: null, ['hand' + pulling + 'W']: 0 });
    carrying.forEach(thing => S.set(thing, { show: false }));
    p.b.w[pulling] = 0;
  }

  // In through a door: pushes it open from the other side, steps into the room (to feet at y = `y`), and the
  // door swings shut behind. `carrying` lists anything in its hands (held in the hand away from the door's
  // hinge, or it would be the hand that pushes).
  function arrive(S, p, D, y = BACK, carrying = []) {
    const pushing = D.hingeLeft ? 'L' : 'R';
    p.place({ x: D.x, y: D.sill, k: p.k0 * 0.9, show: true, layer: D.slot });
    carrying.forEach(thing => S.set(thing, { show: true, layer: D.slot }));
    p.follow(pushing, D.handle);
    S.sound('doorOpen', D.x);
    S.to(D.leaf, { open: 1 }, 0.5);
    p.unfollow(pushing, D.handleOpen);
    S.set(p, { layer: S.L.chars });
    carrying.forEach(thing => S.set(thing, { layer: S.L.top }));
    S.par(() => p.depth(y, p.k0), () => p.rest(pushing, 0.3));
    S.bg(() => {
      S.wait(0.1);
      S.to(D.leaf, { open: 0 }, 0.55, 'in');
      S.sound('doorClose', D.x);
    });
  }

  // ---------- furniture ----------
  // Things stand on the table at y = `y` (TABLE unless said); characters behind it show from the waist up
  function table(S, o = {}) {
    const cx = o.x === undefined ? 500 : o.x, w = o.w || 640, y = o.y || TABLE, x0 = cx - w / 2, x1 = cx + w / 2;
    const [top, edge, leg] = o.colors || ['#e9dcc5', '#d9c9ad', '#cdbb9c'];
    return S.thing(
      m.e(cx, 606, w / 2 + 4, 10, SHADOW, 'opacity=".13"') +
      m.r(x0 + 34, y + 30, 38, 576 - y, 4, leg) + m.r(x1 - 72, y + 30, 38, 576 - y, 4, leg) +
      m.p(`M${x0} ${y + 10}H${x1}V${y + 28}Q${x1} ${y + 36} ${x1 - 8} ${y + 36}H${x0 + 8}Q${x0} ${y + 36} ${x0} ${y + 28}Z`, edge) +
      m.p(`M${x0 + 20} ${y - 22}H${x1 - 20}L${x1} ${y + 10}H${x0}Z`, top),
      { layer: o.layer || S.L.front, lift: true });
  }

  // ---------- the cookie jars ----------
  // A wide, low crock with a lid. Whatever goes in is put in `slot`, between the back of the mouth and the front
  // wall, so it (and the arm that reaches in) disappears behind the front. A character stands behind it at
  // `stand`, a little to the left of its middle, so what its right hand puts in doesn't pass across its face.
  const JAR = { blue: ['#2f6db5', '#23538c', '#152f52'], orange: ['#ee982a', '#c97512', '#7a4409'] };
  function crock(S, o) {
    const [body, dark, deep] = JAR[o.color], x = o.x, y = o.y || TABLE, h = 96, rim = y - h;
    S.thing(m.e(0, -h, 94, 13, dark) + m.e(0, -h + 1.5, 82, 8.5, deep), { x, y });
    const slot = S.slot();
    S.thing(m.e(0, 1, 94, 7, '#6b5437', 'opacity=".16"') +
      m.p(`M-94 ${-h}C-105 ${-h + 30} -105 -32 -92 -10Q-88 0 -76 0H76Q88 0 92 -10C105 -32 105 ${-h + 30} 94 ${-h}A94 13 0 0 1 -94 ${-h}Z`, body),
      { x, y, lift: true });
    const lid = S.thing(m.p(`M-99 ${-h}A99 36 0 0 1 99 ${-h}A99 13 0 0 1 -99 ${-h}Z`, dark) + m.c(0, -h - 40, 12, body), { x, y, lift: true });
    const J = {
      x, y, slot, lid, rim, color: o.color,
      stand: x - 46,
      knob: { x, y: rim - 40 },
      above: { x: x + 46, y: rim - 30 },
      inside: { x: x + 42, y: rim + 54 },
      point: () => ({ x, y: rim }),
      // What a tap on it should cover (generous, for small fingers)
      hit: { x, y: y - 62, rx: 128, ry: 92 },
    };
    // Takes the lid off with one hand and holds it out to the side
    J.open = (p, side) => {
      const out = side === 'L' ? -1 : 1;
      p.reach(side, J.knob, 0.4);
      S.sound('lidOff', x);
      S.hold(lid, p, side, { dy: h + 40 });
      S.par(() => p.reach(side, { x: x + out * 132, y: rim - 34 }, 0.42), () => S.to(lid, { rot: out * 10 }, 0.42));
    };
    J.close = (p, side) => {
      S.par(() => p.reach(side, J.knob, 0.42), () => S.to(lid, { rot: 0 }, 0.42));
      S.drop(lid, { x, y });
      S.sound('lidOn', x);
      p.rest(side, 0.35);
    };
    // The other hand lowers the thing it holds (at `grip` from the hand) into the jar, lets it go to settle on
    // the bottom, and comes back out empty
    J.put = (p, side, item, grip = {}) => {
      p.reach(side, J.above, 0.45);
      S.set(p, { ['layer' + side]: slot });
      S.set(item, { layer: slot });
      p.reach(side, J.inside, 0.38, { ease: 'in' });
      S.drop(item, { x: J.inside.x + (grip.dx || 0), y: J.inside.y + (grip.dy || 0) });
      S.par(
        () => {
          S.to(item, { y: y - 36 }, 0.15, 'in');
          S.sound('drop', x, { soft: true });
          S.set(item, { show: false });
        },
        () => p.reach(side, J.above, 0.32, { ease: 'out' }));
      S.set(p, { ['layer' + side]: null });
    };
    // ...or reaches in and brings it out, held at (dx, dy) from the hand
    J.take = (p, side, item, grip) => {
      p.reach(side, J.above, 0.45);
      S.set(p, { ['layer' + side]: slot });
      p.reach(side, J.inside, 0.38, { ease: 'in' });
      S.set(item, { show: true, layer: slot });
      S.hold(item, p, side, grip);
      S.sound('cookiePickup', x);
      p.reach(side, { x: J.above.x, y: J.above.y - 26 }, 0.42, { ease: 'out' });
      S.set(p, { ['layer' + side]: null });
      S.set(item, { layer: S.L.top });
    };
    return J;
  }

  function cookie(S, o = {}) {
    return S.thing(cookieArt(), Object.assign({ layer: S.L.top, lift: true }, o));
  }

  function cookieArt(r = 32) {
    const k = r / 44;
    const chip = (cx, cy, cr) => m.c(Math.round(cx * k), Math.round(cy * k), (cr * k).toFixed(1), '#4a3021');
    return m.c(0, 0, r, '#d7954a') + chip(-18, -20, 6.4) + chip(8, -27, 5.4) + chip(25, -8, 5.8) + chip(-1, 1, 6.8) + chip(-26, 8, 5.6) + chip(-4, 28, 5.4) + chip(20, 20, 5);
  }

  // ---------- small helpers ----------
  // A soft contact shadow under something standing on the floor or a table
  const shadow = (cx, cy, rx, ry = 7) => m.e(cx, cy, rx, ry, SHADOW, 'opacity=".15"');

  // A five-pointed star (for the cereal)
  function star(cx, cy, r, fill) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return m.p(d + 'Z', fill);
  }

  return { FLOOR, BACK, TABLE, room, outdoors, door, leave, arrive, table, crock, cookie, cookieArt, shadow, star, JAR };
})();
