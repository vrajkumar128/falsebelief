// The characters. Every one is the same paper puppet with different shapes and colours: a body, a head that can
// tilt and turn, two eyes that look at things and blink, two legs that step, and two arms that reach.
//
// A character is drawn standing on (0, 0), about 470 tall (the head's centre is near y = -380), then placed in
// the scene by its feet: S.cast('bear', { x, y, k }) where k is its size (0.8 unless said). Directions:
//   bear.walkTo(x)                    walks there; its feet plant, and each footfall makes a sound
//   bear.reach('L', point) / .rest()  moves a hand ('L' is the hand on the left of the screen) and lets it hang
//   bear.look(thing) / .face('open')  where the eyes look (null = at us); the mouth: smile, open, wide, chew
//   bear.wave() / .hop() / .tiltTo()  small gestures
// Arms are drawn from the shoulder to wherever the hand is, bending at a soft elbow so they keep their length;
// an arm can be moved into another layer (S.set(bear, { layerL: jar.slot })) to reach inside something.
const Cast = (() => {
  const { m } = Engine;
  const DARK = '#3a281e', WHITE = '#fffdf7';
  const SIDES = ['L', 'R'];

  // ---------- the shapes ----------
  const BEAR = {
    fur: '#94603c', light: '#e7c9a2', limb: '#94603c', foot: '#94603c', who: 'bear',
    armW: 46, pawR: 27, armLen: 150, legW: 46, footRx: 33, footRy: 14, footX: 35,
    shoulder: [58, -259], hip: [31, -150], rest: [86, -128],
    eye: [34, -390], eyeR: [11.5, 13.5], pupil: 6.6, neck: -303, headY: -383,
    back: () => '',
    body: q => m.e(0, -195, 102, 118, q.fur) + m.e(0, -199, 60, 70, q.light),
    ears: q => m.c(-64, -453, 30, q.fur) + m.c(64, -453, 30, q.fur) + m.c(-64, -453, 15, q.light) + m.c(64, -453, 15, q.light),
    head: q => m.c(0, -383, 88, q.fur),
    snout: q => m.e(0, -355, 37, 28, q.light) + m.e(0, -368, 12.5, 9, DARK),
    mouth: {
      smile: m.l('M-11 -347Q0 -339 11 -347', DARK, 3.5),
      open: m.e(0, -343, 7.5, 8.5, DARK),
      wide: m.p('M-15 -349Q0 -327 15 -349Z', DARK),
    },
  };

  const TURTLE = {
    fur: '#86b562', light: '#ead9a0', limb: '#86b562', foot: '#78a857', shell: '#4f7f4a', who: 'turtle',
    armW: 42, pawR: 24, armLen: 142, legW: 44, footRx: 31, footRy: 13, footX: 36,
    shoulder: [66, -256], hip: [34, -140], rest: [98, -130],
    eye: [30, -388], eyeR: [11.5, 13.5], pupil: 6.6, neck: -310, headY: -376,
    back: q => m.e(0, -196, 116, 124, q.shell),
    body: q => m.e(0, -196, 88, 100, q.light) + m.l('M0 -290V-102M-80 -232H80M-82 -166H82', '#d7c486', 4),
    ears: () => '',
    head: q => m.e(0, -322, 40, 34, q.fur) + m.e(0, -376, 76, 72, q.fur),
    snout: () => '',
    mouth: {
      smile: m.l('M-12 -352Q0 -343 12 -352', DARK, 3.5),
      open: m.e(0, -349, 7.5, 8.5, DARK),
      wide: m.p('M-15 -354Q0 -332 15 -354Z', DARK),
    },
  };

  const BILL = '#ee8a2c', BILL_DARK = '#d8741b';
  const DUCK = {
    fur: '#f5cf45', light: '#fbe69a', limb: '#e9bd32', foot: BILL, leg: BILL, who: 'duck',
    armW: 40, pawR: 22, armLen: 138, legW: 15, footRx: 27, footRy: 11, footX: 32,
    shoulder: [60, -246], hip: [30, -96], rest: [92, -122],
    eye: [30, -394], eyeR: [11, 13], pupil: 6.4, neck: -296, headY: -372,
    back: () => '',
    body: q => m.e(0, -186, 96, 108, q.fur) + m.e(0, -178, 58, 66, q.light),
    ears: q => m.p('M-8 -446C-28 -470 -10 -496 10 -488C2 -478 4 -462 8 -446Z', q.limb),
    head: q => m.c(0, -372, 82, q.fur),
    snout: () => '',
    mouth: {
      smile: m.e(0, -351, 34, 15, BILL) + m.l('M-21 -346Q0 -339 21 -346', BILL_DARK, 3),
      open: m.e(0, -337, 25, 13, BILL_DARK) + m.e(0, -343, 17, 7, DARK) + m.e(0, -355, 34, 14, BILL),
      wide: m.e(0, -331, 26, 15, BILL_DARK) + m.e(0, -340, 19, 10, DARK) + m.e(0, -357, 34, 14, BILL),
    },
  };

  const PIG = {
    fur: '#f0a8b2', light: '#f8ccd2', limb: '#f0a8b2', foot: '#d97f8e', dark: '#e58d9b', nostril: '#c5687a', who: 'pig',
    armW: 46, pawR: 26, armLen: 146, legW: 46, footRx: 31, footRy: 14, footX: 35,
    shoulder: [60, -256], hip: [32, -148], rest: [88, -126],
    eye: [34, -396], eyeR: [11.5, 13.5], pupil: 6.6, neck: -300, headY: -378,
    back: q => m.l('M96 -150C126 -162 130 -128 110 -126C98 -126 100 -142 112 -140', q.dark, 9),
    body: q => m.e(0, -192, 104, 116, q.fur) + m.e(0, -194, 62, 70, q.light),
    ears: q => m.p('M-86 -424Q-100 -488 -50 -470Q-36 -448 -52 -426Z', q.dark) + m.p('M86 -424Q100 -488 50 -470Q36 -448 52 -426Z', q.dark),
    head: q => m.c(0, -378, 88, q.fur),
    snout: q => m.e(0, -354, 33, 24, q.dark) + m.e(-11, -354, 5, 8, q.nostril) + m.e(11, -354, 5, 8, q.nostril),
    mouth: {
      smile: m.l('M-12 -321Q0 -312 12 -321', DARK, 3.5),
      open: m.e(0, -317, 7.5, 8, DARK),
      wide: m.p('M-15 -323Q0 -303 15 -323Z', DARK),
    },
  };

  const RABBIT = {
    fur: '#aaa197', light: '#f4efe6', limb: '#aaa197', foot: '#958c82', pink: '#f0b9bb', who: 'rabbit',
    armW: 44, pawR: 25, armLen: 150, legW: 44, footRx: 34, footRy: 14, footX: 35,
    shoulder: [56, -258], hip: [31, -150], rest: [84, -128],
    eye: [34, -394], eyeR: [11.5, 13.5], pupil: 6.6, neck: -303, headY: -380,
    back: () => '',
    body: q => m.e(0, -196, 98, 116, q.fur) + m.e(0, -198, 58, 70, q.light),
    ears: q => m.g('rotate(-8 -36 -450)', m.e(-36, -516, 24, 76, q.fur) + m.e(-36, -512, 11, 54, q.pink)) +
      m.g('rotate(8 36 -450)', m.e(36, -516, 24, 76, q.fur) + m.e(36, -512, 11, 54, q.pink)),
    head: q => m.e(0, -380, 84, 82, q.fur),
    snout: q => m.e(-15, -350, 20, 16, q.light) + m.e(15, -350, 20, 16, q.light) + m.p('M-8 -367H8L0 -357Z', '#e79aa0'),
    mouth: {
      smile: m.r(-8, -338, 16, 13, 3, WHITE) + m.l('M0 -338V-326', '#d9d2c6', 1.5),
      open: m.e(0, -334, 9, 9, DARK) + m.r(-8, -340, 16, 11, 3, WHITE),
      wide: m.e(0, -332, 11, 12, DARK) + m.r(-8, -341, 16, 11, 3, WHITE),
    },
    // A teacher's glasses and bow tie
    featAcc: () => `<g fill="none" stroke="${DARK}" stroke-width="4"><circle cx="-34" cy="-394" r="21"/><circle cx="34" cy="-394" r="21"/><path d="M-13 -394H13"/></g>`,
    bodyAcc: () => m.p('M-5 -284L-34 -302V-266Z', '#d1495b') + m.p('M5 -284L34 -302V-266Z', '#d1495b') + m.c(0, -284, 8, '#b63c4c'),
  };

  // Mr. Bear's family: the same bear, bigger or smaller, each with one thing to tell them apart
  const KINDS = {
    bear: BEAR,
    turtle: TURTLE,
    duck: DUCK,
    pig: PIG,
    rabbit: Object.assign({}, RABBIT, { size: 1.06 }),
    sister: Object.assign({}, BEAR, {
      fur: '#a56f49', limb: '#a56f49', foot: '#a56f49', size: 0.78, who: 'cub',
      headAcc: () => m.p('M-64 -476L-94 -496V-456Z', '#ea6f7f') + m.p('M-64 -476L-34 -496V-456Z', '#ea6f7f') + m.c(-64, -476, 9, '#d4566a'),
    }),
    mom: Object.assign({}, BEAR, {
      fur: '#a06944', limb: '#a06944', foot: '#a06944', size: 1.04, who: 'big',
      bodyAcc: () => [[-36, -286], [-19, -277], [0, -274], [19, -277], [36, -286]].map(([bx, by]) => m.c(bx, by, 7.5, '#f2c230')).join(''),
    }),
    dad: Object.assign({}, BEAR, {
      fur: '#7d5133', limb: '#7d5133', foot: '#7d5133', size: 1.07, who: 'big',
      bodyAcc: () => m.p('M-10 -292H10L7 -278L13 -226L0 -210L-13 -226L-7 -278Z', '#3f6fb5'),
    }),
  };

  // Everything above the neck, in the puppet's own frame
  function headArt(q) {
    const [ex, ey] = q.eye, [erx, ery] = q.eyeR;
    const eye = sign => `<g class="p-eye">${m.e(sign * ex, ey, erx, ery, WHITE)}<g class="p-pupil">${m.c(sign * ex, ey, q.pupil, DARK)}</g></g>`;
    const mouths = Object.keys(q.mouth).map(name =>
      `<g class="p-mouth" data-m="${name}"${name === 'smile' ? '' : ' display="none"'}>${q.mouth[name]}</g>`).join('');
    return q.ears(q) + q.head(q) + `<g class="p-feat">${q.snout(q)}${mouths}${eye(-1)}${eye(1)}${q.featAcc ? q.featAcc(q) : ''}</g>` +
      (q.headAcc ? q.headAcc(q) : '');
  }

  // Just a character's head, centred on (0, 0): for the "who is this about" badge and the teacher cards
  function head(kind) {
    const q = KINDS[kind];
    return m.g(`translate(0 ${-q.headY})`, headArt(q));
  }

  class Puppet {
    constructor(S, kind, o) {
      const q = KINDS[kind];
      this.S = S;
      this.kind = kind;
      this.q = q;
      this.k0 = (o.k || 0.8) * (q.size || 1);
      const layer = o.layer || S.L.chars;
      this.s = {
        x: o.x || 0, y: o.y || 0, k: this.k0, show: o.show !== false, layer,
        lean: 0, tilt: 0, turn: 0, hop: 0, crouch: 0, squash: 1, walk: 0, walkAmp: 0, stride: 0,
        handL: { x: 0, y: 0 }, handLW: 0, relL: false, bendL: 1, followL: null, layerL: null,
        handR: { x: 0, y: 0 }, handRW: 0, relR: false, bendR: 1, followR: null, layerR: null,
        lookAt: null, face: 'smile', eyes: 'open',
      };
      // Where the directions being written have got this character to
      this.b = { x: this.s.x, y: this.s.y, k: this.k0, walk: 0, w: { L: 0, R: 0 }, rel: { L: null, R: null } };
      this.hands = { L: { x: this.s.x, y: this.s.y }, R: { x: this.s.x, y: this.s.y } };
      this.gaze = { x: 0, y: 0 };
      this.nextBlink = 1 + Math.random() * 3;
      this.was = {};

      const limb = `fill="none" stroke-linecap="round"`;
      const root = Engine.group(
        m.e(0, 2, 74, 9, '#4f5a45', 'class="p-shadow" opacity=".16"') +
        `<path class="p-leg" ${limb} stroke="${q.leg || q.limb}" stroke-width="${q.legW}"/>` +
        `<path class="p-leg" ${limb} stroke="${q.leg || q.limb}" stroke-width="${q.legW}"/>` +
        m.e(0, 0, q.footRx, q.footRy, q.foot, 'class="p-foot"') + m.e(0, 0, q.footRx, q.footRy, q.foot, 'class="p-foot"') +
        `<g class="p-body">${q.back(q)}${q.body(q)}${q.bodyAcc ? q.bodyAcc(q) : ''}<g class="p-head">${headArt(q)}</g></g>`,
        layer, { filter: 'url(#lift)' });
      const pick = selector => Array.from(root.querySelectorAll(selector));
      this.e = {
        root, shadow: root.querySelector('.p-shadow'), legs: pick('.p-leg'), feet: pick('.p-foot'),
        body: root.querySelector('.p-body'), head: root.querySelector('.p-head'), feat: root.querySelector('.p-feat'),
        eyes: pick('.p-eye'), pupils: pick('.p-pupil'), mouths: pick('.p-mouth'), arm: {},
      };
      SIDES.forEach(side => {
        const g = Engine.group(`<path ${limb} stroke="${q.limb}"/>` + m.c(0, 0, 1, q.paw || q.limb), layer, { filter: 'url(#lift)' });
        this.e.arm[side] = { g, path: g.firstChild, paw: g.lastChild };
      });
    }

    // ----- where things are -----
    point() {
      return { x: this.s.x, y: this.s.y - this.s.hop + this.s.k * this.q.headY };
    }

    // A point given in the puppet's own frame, as a place in the scene (where the directions have got it to)
    at(dx, dy) {
      return { x: this.b.x + dx * this.b.k, y: this.b.y + dy * this.b.k };
    }

    handRef(side) {
      return { point: () => this.hands[side] };
    }

    // ----- directions -----
    stepSound() {
      this.S.cue(() => Sounds.play('step', Object.assign({
        who: this.q.who, surface: this.S.surface, gain: Math.max(0.35, Math.min(1, this.s.k / this.k0)),
      }, this.S.place(this))));
    }

    walkTo(x, o = {}) {
      const S = this.S, from = this.b.x, distance = Math.abs(x - from);
      if (distance < 2) return this;
      const seconds = o.dur || Math.max(0.5, distance / (o.speed || 185));
      const steps = Math.max(1, Math.round(seconds / 0.36));
      const direction = Math.sign(x - from), phase = this.b.walk + steps * Math.PI;
      S.par(
        () => S.to(this, { x }, seconds, 'linear'),
        () => S.to(this, { walk: phase }, seconds, 'linear'),
        () => {
          S.set(this, { stride: direction * distance / steps });
          S.to(this, { walkAmp: 1 }, 0.12, 'out');
          S.wait(Math.max(0, seconds - 0.24));
          S.to(this, { walkAmp: 0 }, 0.12, 'in');
        },
        () => {
          if (o.turn === false) return;
          S.to(this, { turn: direction * 0.75 }, 0.18);
          S.wait(Math.max(0, seconds - 0.36));
          S.to(this, { turn: 0 }, 0.18);
        },
        () => {
          for (let i = 0; i < steps; i++) {
            S.wait(seconds / steps);
            this.stepSound();
          }
        });
      this.b.x = x;
      this.b.walk = phase;
      return this;
    }

    // Steps on the spot, for walking toward or away from us
    stepInPlace(seconds, steps) {
      const S = this.S, phase = this.b.walk + steps * Math.PI;
      S.par(
        () => S.to(this, { walk: phase }, seconds, 'linear'),
        () => {
          S.set(this, { stride: 0 });
          S.to(this, { walkAmp: 1 }, 0.12, 'out');
          S.wait(Math.max(0, seconds - 0.24));
          S.to(this, { walkAmp: 0 }, 0.12, 'in');
        },
        () => {
          for (let i = 0; i < steps; i++) {
            S.wait(seconds / steps);
            this.stepSound();
          }
        });
      this.b.walk = phase;
      return this;
    }

    // Walks nearer or further away: up or down the picture, getting bigger or smaller
    depth(y, k, seconds = 0.6, steps = 2) {
      this.S.par(() => this.S.to(this, { y, k }, seconds, 'inOut'), () => this.stepInPlace(seconds, steps));
      this.b.y = y;
      this.b.k = k;
      return this;
    }

    // Puts the character somewhere at once (off stage, or behind a door)
    place(values) {
      this.S.set(this, values);
      if ('x' in values) this.b.x = values.x;
      if ('y' in values) this.b.y = values.y;
      if ('k' in values) this.b.k = values.k;
      return this;
    }

    // Moves a hand to a place in the scene
    reach(side, target, seconds = 0.42, o = {}) {
      const S = this.S, P = target.point ? target.point() : target, hand = 'hand' + side;
      if (o.bend !== undefined) S.set(this, { ['bend' + side]: o.bend });
      const held = this.b.rel[side];
      if (held) { // it was holding a pose on its own body: carry on from where that is in the scene
        S.set(this, { [hand]: this.at(held.dx, held.dy), ['rel' + side]: false });
        this.b.rel[side] = null;
      }
      if (this.b.w[side] < 0.5) {
        S.set(this, { [hand]: { x: P.x, y: P.y } });
        S.to(this, { [hand + 'W']: 1 }, seconds, o.ease || 'inOut');
        this.b.w[side] = 1;
      } else {
        S.to(this, { [hand]: { x: P.x, y: P.y } }, seconds, o.ease || 'inOut');
      }
      return this;
    }

    // Holds a hand at a place on its own body ((dx, dy) from its feet, in its own size), so the hand comes
    // along when it walks: carrying something, or a hand held up
    carry(side, dx, dy, seconds = 0.35) {
      const S = this.S, hand = 'hand' + side;
      if (this.b.w[side] < 0.5) {
        S.set(this, { [hand]: { x: dx, y: dy }, ['rel' + side]: true });
        S.to(this, { [hand + 'W']: 1 }, seconds);
        this.b.w[side] = 1;
      } else if (this.b.rel[side]) {
        S.to(this, { [hand]: { x: dx, y: dy } }, seconds);
      } else {
        S.to(this, { [hand]: this.at(dx, dy) }, seconds);
        S.set(this, { [hand]: { x: dx, y: dy }, ['rel' + side]: true });
      }
      this.b.rel[side] = { dx, dy };
      return this;
    }

    // The same, at once (how a scene starts with something already in a hand)
    pose(side, dx, dy) {
      this.S.set(this, { ['hand' + side]: { x: dx, y: dy }, ['rel' + side]: true, ['hand' + side + 'W']: 1 });
      this.b.w[side] = 1;
      this.b.rel[side] = { dx, dy };
      return this;
    }

    rest(side, seconds = 0.38) {
      const S = this.S;
      if (!side) {
        S.par(() => this.rest('L', seconds), () => this.rest('R', seconds));
        return this;
      }
      S.to(this, { ['hand' + side + 'W']: 0 }, seconds);
      S.set(this, { ['bend' + side]: 1, ['rel' + side]: false });
      this.b.w[side] = 0;
      this.b.rel[side] = null;
      return this;
    }

    // The hand stays on something that moves (a door's handle); `now` is where that is when it lets go
    follow(side, ref) {
      this.S.set(this, { ['follow' + side]: ref });
      this.b.w[side] = 1;
      return this;
    }

    unfollow(side, now) {
      this.S.set(this, { ['follow' + side]: null, ['hand' + side]: { x: now.x, y: now.y }, ['hand' + side + 'W']: 1 });
      this.b.w[side] = 1;
      return this;
    }

    look(target) {
      this.S.set(this, { lookAt: target || null });
      return this;
    }

    face(name) {
      this.S.set(this, { face: name });
      return this;
    }

    tiltTo(degrees, seconds = 0.25) {
      this.S.to(this, { tilt: degrees }, seconds);
      return this;
    }

    wave(side = 'R', times = 2) {
      const high = this.at(...this.raised(side)), out = this.at(...this.raised(side, 1));
      this.reach(side, high, 0.3);
      for (let i = 0; i < times; i++) {
        this.reach(side, out, 0.17);
        this.reach(side, high, 0.17);
      }
      this.rest(side, 0.3);
      return this;
    }

    // Bends its knees to get down to something low (`amount` in its own size; 0 stands back up)
    crouch(amount, seconds = 0.35) {
      this.S.to(this, { crouch: amount }, seconds);
      return this;
    }

    // A hand held up as high as the arm goes (`out` = further to the side), in the puppet's own frame
    raised(side, out = 0) {
      const sign = side === 'L' ? -1 : 1, [sx, sy] = this.q.shoulder, reach = this.q.armLen * 0.985;
      const angle = (20 + out * 20) * Math.PI / 180;
      return [sign * (sx + Math.sin(angle) * reach), sy - Math.cos(angle) * reach];
    }

    // Both arms up: hooray
    cheer(seconds = 0.9) {
      const S = this.S;
      S.par(() => this.carry('L', ...this.raised('L'), 0.25), () => this.carry('R', ...this.raised('R'), 0.25));
      this.face('wide');
      this.hop(26, 0.36);
      S.wait(Math.max(0, seconds - 0.61));
      this.face('smile');
      this.rest();
      return this;
    }

    hop(height = 22, seconds = 0.34) {
      this.S.to(this, { hop: height }, seconds / 2, 'out');
      this.S.to(this, { hop: 0 }, seconds / 2, 'in');
      this.stepSound();
      return this;
    }

    // ----- drawing -----
    render(dt, wall) {
      const s = this.s, q = this.q, e = this.e, was = this.was, k = s.k;

      let moved = false;
      if (s.layer && e.root.parentNode !== s.layer) {
        s.layer.appendChild(e.root);
        moved = true;
      }
      SIDES.forEach(side => {
        const g = e.arm[side].g, slot = s['layer' + side];
        if (slot) {
          if (g.parentNode !== slot) slot.appendChild(g);
        } else if (moved || g.parentNode !== e.root.parentNode) {
          e.root.parentNode.insertBefore(g, e.root.nextSibling);
        }
      });
      if (s.show !== was.show) {
        was.show = s.show;
        [e.root, e.arm.L.g, e.arm.R.g].forEach(el => {
          if (s.show) el.removeAttribute('display'); else el.setAttribute('display', 'none');
        });
      }
      if (!s.show) return;

      // The walk: one foot is planted while the other swings past it; the body rises between footfalls
      const amp = s.walkAmp, cycle = s.walk / Math.PI, count = Math.floor(cycle + 1e-9), f = cycle - count;
      const stride = s.stride / k, swing = Math.sin(Math.PI * f);
      const planted = [stride * (0.5 - f) * amp, 0], lifted = [stride * (f - 0.5) * amp, 16 * swing * amp];
      const feet = count % 2 === 0 ? [planted, lifted] : [lifted, planted];
      const bob = -5 * swing * amp + s.crouch;
      const lean = s.lean + Math.sign(stride) * 2.5 * amp;
      const cos = Math.cos(lean * Math.PI / 180), sin = Math.sin(lean * Math.PI / 180);
      const wide = 1 + (1 - s.squash) * 0.6;
      // A point on the body (in the puppet's frame) after its lean and bob
      const onBody = (px, py) => {
        const bx = px * wide, by = py * s.squash;
        return [bx * cos - by * sin, bx * sin + by * cos + bob];
      };
      const baseY = s.y - s.hop;
      const inScene = (px, py) => {
        const [bx, by] = onBody(px, py);
        return { x: s.x + k * bx, y: baseY + k * by };
      };

      this.put(e.root, 'root', `translate(${r(s.x)} ${r(baseY)}) scale(${r3(k)})`);
      this.put(e.body, 'body', `translate(0 ${r(bob)}) rotate(${r(lean)}) scale(${r3(wide)} ${r3(s.squash)})`);
      this.put(e.head, 'head', `rotate(${r(s.tilt)} 0 ${q.neck})`);
      this.put(e.feat, 'feat', `translate(${r(s.turn * 10)} 0)`);
      this.put(e.shadow, 'shadow', `translate(0 ${r(s.hop / k)}) scale(${r3(Math.max(0.5, 1 - s.hop / 160))})`);
      for (let i = 0; i < 2; i++) {
        const sign = i ? 1 : -1, [hx, hy] = onBody(sign * q.hip[0], q.hip[1]);
        const fx = sign * q.footX + feet[i][0], fy = -q.footRy - feet[i][1];
        this.put(e.legs[i], 'leg' + i, `M${r(hx)} ${r(hy)}L${r(fx)} ${r(fy - 2)}`, 'd');
        this.put(e.feet[i], 'foot' + i, `translate(${r(fx + sign * 3)} ${r(fy)})`);
      }

      // Eyes: where they look (eased, so glances aren't jerky), and a blink every few seconds
      let gx = 0, gy = 0;
      if (s.lookAt) {
        const P = s.lookAt.point ? s.lookAt.point() : s.lookAt;
        const dx = P.x - s.x, dy = P.y - (baseY + k * q.eye[1]), far = Math.hypot(dx, dy) || 1, pull = Math.min(1, far / 80);
        gx = dx / far * pull;
        gy = dy / far * pull;
      }
      gx = Math.max(-1, Math.min(1, gx + s.turn * 0.5));
      const ease = dt >= 1 ? 1 : Math.min(1, dt * 12);
      this.gaze.x += (gx - this.gaze.x) * ease;
      this.gaze.y += (gy - this.gaze.y) * ease;
      const pupil = `translate(${r(this.gaze.x * 4.4)} ${r(this.gaze.y * 3.6)})`;
      if (wall > this.nextBlink + 0.13) this.nextBlink = wall + 2.8 + Math.random() * 2.6;
      const shut = s.eyes === 'closed' || (wall >= this.nextBlink && dt < 1);
      for (let i = 0; i < 2; i++) {
        const ex = (i ? 1 : -1) * q.eye[0], ey = q.eye[1];
        this.put(e.pupils[i], 'pupil' + i, pupil);
        this.put(e.eyes[i], 'eye' + i, shut ? `translate(${ex} ${ey}) scale(1 0.1) translate(${-ex} ${-ey})` : '');
      }
      const mouth = s.face === 'chew' ? (Math.sin(wall * 19) > 0 ? 'open' : 'smile') : s.face;
      if (mouth !== was.mouth) {
        was.mouth = mouth;
        e.mouths.forEach(el => {
          if (el.dataset.m === mouth) el.removeAttribute('display'); else el.setAttribute('display', 'none');
        });
      }

      // Arms, drawn in the scene's own coordinates so they can be moved into other layers
      const sway = Math.sin(s.walk) * 12 * amp;
      SIDES.forEach(side => {
        const sign = side === 'L' ? -1 : 1, A = e.arm[side];
        const shoulder = inScene(sign * q.shoulder[0], q.shoulder[1]);
        const hang = inScene(sign * q.rest[0] + sway, q.rest[1]);
        const follow = s['follow' + side], weight = s['hand' + side + 'W'];
        const aim = s['hand' + side], target = s['rel' + side] ? inScene(aim.x, aim.y) : aim;
        const hand = follow ? follow.point()
          : weight <= 0 ? hang
            : { x: hang.x + (target.x - hang.x) * weight, y: hang.y + (target.y - hang.y) * weight };
        this.hands[side] = hand;
        const dx = hand.x - shoulder.x, dy = hand.y - shoulder.y, far = Math.hypot(dx, dy) || 0.001, length = q.armLen * k;
        let cx = (shoulder.x + hand.x) / 2, cy = (shoulder.y + hand.y) / 2;
        if (far < length) {
          // The elbow sits where two half-arms would meet (but never sticks out too far: a hand held close to
          // the shoulder just makes a shorter arm); it points outward and down unless told otherwise
          const out = Math.min(0.42 * length, Math.sqrt(length * length - far * far) / 2 * 1.7) * s['bend' + side];
          let nx = -dy / far, ny = dx / far;
          if (nx * sign * 0.8 + ny < 0) {
            nx = -nx;
            ny = -ny;
          }
          cx += nx * out;
          cy += ny * out;
        }
        this.put(A.path, 'arm' + side, `M${r(shoulder.x)} ${r(shoulder.y)}Q${r(cx)} ${r(cy)} ${r(hand.x)} ${r(hand.y)}`, 'd');
        this.put(A.path, 'armW' + side, r(q.armW * k), 'stroke-width');
        this.put(A.paw, 'paw' + side, `translate(${r(hand.x)} ${r(hand.y)}) scale(${r(q.pawR * k)})`);
      });
    }

    put(el, key, value, attr = 'transform') {
      if (this.was[key] === value) return;
      this.was[key] = value;
      if (value === '') el.removeAttribute(attr); else el.setAttribute(attr, value);
    }
  }

  const r = v => Math.round(v * 10) / 10;
  const r3 = v => Math.round(v * 1000) / 1000;

  return { make: (S, kind, o) => new Puppet(S, kind, o), head, KINDS };
})();
