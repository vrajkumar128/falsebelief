// What the screens after S4 are built from: the room, its doors (and going out and coming in through them), the
// table, and a few small helpers. The drawings are S4's (shared/art.js), in S4's places: the wall meets the floor
// at y = 460, the doorways are 200 wide at either end of the back wall, the table's top is at y = 445, and a
// character behind the table stands with its feet at y = 552 (Kit.BACK), as Mr. Bear does in S4.
const Kit = (() => {
  const { m, svg } = Engine, P = Engine.plain;
  const FLOOR = 460, BACK = 552, TABLE = 444;

  // ---------- rooms ----------
  // kind:  which room it is; every room is drawn like S4's, in its own colours ('home' is S4's: see ROOMS in
  //        shared/art.js)
  // doors: { left: 'outside' | 'hall', right: ... } puts a door at that end of the back wall, with the sunny
  //        path or a hallway showing through it
  // also:  anything else that is part of the room itself (a bed, a blackboard, a rug), drawn with the room
  function room(S, o = {}) {
    const kind = o.kind || 'home';
    S.thing(Art.wall(kind), { layer: S.L.bg });
    const made = {};
    if (o.left) made.L = door(S, -1, o.left, kind);
    if (o.right) made.R = door(S, 1, o.right, kind);
    S.thing(Art.floor(kind) + (o.also || ''), { layer: S.L.back });
    return made;
  }

  // The outdoors of S3a; scenes add what stands on it. The ground starts around y = 430.
  function outdoors(S) {
    S.surface = 'ground';
    S.thing(Art.outdoors(), { layer: S.L.bg });
  }

  // ---------- doors ----------
  // The door swings on the edge nearer the side of the picture, as in S4: it squeezes toward its hinge and
  // tips a little (`open` 0..1). `slot` is the space through the doorway: a character put there is behind the
  // door and inside the frame, as if outside.
  function door(S, side, beyond, kind) {
    const left = side < 0 ? 35 : 765, hinge = side < 0 ? 35 : 965, x = left + 100;
    S.thing(Art.doorView(side, beyond, kind) + Art.doorFrame(side), { layer: S.L.back });
    const slot = S.slot(S.L.back, { 'clip-path': `url(#${S.clip(P.r(left, 65, 200, 385, 6, '#000'))})` });
    const leaf = S.thing(`<g>${Art.doorLeaf(side)}</g>`, {
      layer: S.L.back, open: 0,
      draw: (s, thing) => {
        if (thing.openWas === s.open) return;
        thing.openWas = s.open;
        thing.el.firstChild.setAttribute('transform', s.open < 0.001 ? '' :
          `translate(${hinge} 257.5) scale(${(1 - 0.95 * s.open).toFixed(3)} 1) skewY(${(side * 8 * s.open).toFixed(2)}) translate(${-hinge} -257.5)`);
      },
    });
    // Where the handle is as the door swings
    const handleAt = open => ({ x: hinge - side * 175 * (1 - 0.95 * open), y: 256 - 24.6 * open });
    return { x, side, beyond, slot, leaf, handleAt, knob: handleAt(0), handle: { point: () => handleAt(leaf.s.open) } };
  }

  // The way out through a doorway, as Mr. Bear and Mr. Turtle go in S4: at the doorway a character is small
  // enough to fit it (feet at y = 437.5), then smaller as it goes up the path (or down the hall), to far away
  const DOORWAY = 437.5, OUTSIDE = { y: 393.5, k: 0.5 }, FAR = { y: 370, k: 0.38 };
  const doorwayX = (p, D) => D.x - D.side * (p.q.doorway < 0.68 ? 6 : 0); // the wide ones keep clear of the open door
  const beyondSurface = D => (D.beyond === 'outside' ? 'ground' : 'floor');

  // Out through a door: walks back to it (getting smaller, as it is on the far wall), lifts a paw to the handle
  // as it gets there and the door swings open, goes through and away without stopping, and the door closes
  // behind. `carrying` lists anything in its hands, so that goes through the doorway with it.
  function leave(S, p, D, carrying = []) {
    const k0 = p.k0, q = p.q, arm = D.side < 0 ? 'L' : 'R', at = doorwayX(p, D);
    const seconds = Math.max(1.8, Math.hypot(at - p.b.x, DOORWAY - p.b.y) / 140);
    // the arm turned up toward the door, as far round as in S4
    const up = [D.side * (q.shoulder[0] + 0.73 * q.armLength), -(q.shoulder[1] + 0.69 * q.armLength)];
    S.par(
      () => p.go({ x: at, y: DOORWAY, k: k0 * q.doorway }, seconds, 'in'),
      () => {
        S.wait(Math.max(0, seconds - 1.15));
        p.carry(arm, up[0], up[1], 0.45);
        S.sound('doorOpen', D.x);
        S.to(D.leaf, { open: 1 }, 0.7, 'out');
      });
    S.set(p, { layer: D.slot, surface: beyondSurface(D) });
    carrying.forEach(thing => S.set(thing, { layer: D.slot }));
    S.par(
      () => {
        S.par(() => p.go({ y: OUTSIDE.y, k: k0 * OUTSIDE.k }, 1.1, 'linear'), () => p.rest(arm, 0.4));
        p.go({ y: FAR.y, k: k0 * FAR.k }, 1.1, 'linear');
      },
      () => {
        S.wait(0.25);
        S.to(D.leaf, { open: 0 }, 0.8, 'in');
        S.sound('doorClose', D.x);
        S.set(p, { muffled: true });
      });
    S.set(p, { show: false, muffled: false, surface: null });
    carrying.forEach(thing => S.set(thing, { show: false }));
  }

  // In through a door: comes down the path behind the shut door, pushes it open as it gets there, steps
  // through and walks to `to` (a place in the room: { x, y }, y = Kit.BACK unless said), growing to its full
  // size, while the door swings shut behind it. `carrying` lists anything in its hands.
  function arrive(S, p, D, to = {}, carrying = []) {
    const k0 = p.k0, q = p.q, at = doorwayX(p, D);
    const goal = { x: to.x === undefined ? at : to.x, y: to.y === undefined ? BACK : to.y };
    p.place({ x: at, y: FAR.y, k: k0 * FAR.k, show: true, layer: D.slot });
    S.set(p, { muffled: true, surface: beyondSurface(D) });
    carrying.forEach(thing => S.set(thing, { show: true, layer: D.slot }));
    p.go({ y: OUTSIDE.y, k: k0 * OUTSIDE.k }, 0.8, 'linear');
    S.par(
      () => p.go({ y: DOORWAY, k: k0 * q.doorway }, 0.9, 'linear'),
      () => {
        S.wait(0.4);
        S.sound('doorOpen', D.x);
        S.set(p, { muffled: false });
        S.to(D.leaf, { open: 1 }, 0.45, 'out');
      });
    S.set(p, { layer: S.L.chars, surface: null });
    carrying.forEach(thing => S.set(thing, { layer: S.L.top }));
    const seconds = Math.max(1.6, Math.hypot(goal.x - at, goal.y - DOORWAY) / 150);
    S.par(
      () => p.go({ x: goal.x, y: goal.y, k: k0 }, seconds, 'out'),
      () => {
        S.wait(0.4);
        S.to(D.leaf, { open: 0 }, 0.85, 'in');
        S.sound('doorClose', D.x);
      });
  }

  // ---------- furniture ----------
  // S4's table. Things stand on it at y = Kit.TABLE; characters behind it show from the waist up. `x`, `w` and
  // `y` make it another table: somewhere else, another width, or with its top's front edge at another height.
  function table(S, o = {}) {
    return S.thing(Art.table(o.x === undefined ? 500 : o.x, o.w || 740, o.y || 445), { layer: o.layer || S.L.front });
  }

  // ---------- small helpers ----------
  // A soft contact shadow under something standing on the floor or a table
  const shadow = (cx, cy, rx, ry = 7) => P.e(cx, cy, rx + 2, ry + 1, '#000000', 'opacity=".2"');

  // A five-pointed star
  function star(cx, cy, r, fill) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return m.p(d + 'Z', fill);
  }

  // For a thing that is made bigger or smaller as the story goes (a balloon being blown up): keeps its outline
  // the same thickness
  function steady(thing) {
    const lined = Array.from(thing.el.querySelectorAll('[stroke-width]')).map(el => [el, parseFloat(el.getAttribute('stroke-width'))]);
    const before = thing.draw;
    thing.draw = (s, self, dt, wall) => {
      if (before) before(s, self, dt, wall);
      if (self.steadyAt === s.sx) return;
      self.steadyAt = s.sx;
      lined.forEach(([el, width]) => el.setAttribute('stroke-width', (width / Math.max(0.2, s.sx)).toFixed(2)));
    };
    return thing;
  }

  return { FLOOR, BACK, TABLE, room, outdoors, door, leave, arrive, table, shadow, star, steady };
})();
