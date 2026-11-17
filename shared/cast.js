// The characters, as puppets for the screens after S4. Their drawings are the ones in S3a and S4 (shared/art.js);
// this is what moves them: legs that step as a whole, a body that bobs and leans as it walks, ears that wiggle,
// eyes that blink and look where things are, and arms that turn at the shoulder, as they do in S4.
//
// A character is placed in the scene by its feet: S.cast('bear', { x, y, k }), where k is its size (1 is the
// size it is in S4; S3a's Mr. Bear is 0.62). Directions:
//   bear.walkTo(x)                    walks there, a footstep sounding as each foot lands
//   bear.reach('L', point) / .rest()  moves a hand ('L' is the hand on the left of the screen) and lets it hang
//   bear.carry('R', dx, dy)           holds a hand at a place on its own body, so it comes along when it walks
//   bear.look(thing) / .face('open')  where the eyes look (null = at us); the mouth: smile, open, wide, chew
//   bear.wave() / .hop() / .cheer()   small gestures
// An arm is the original chunky arm, drawn from the shoulder to wherever the hand is: turned when the hand is an
// arm's length away (as in S4), and a little longer or shorter when it is not. An arm can be moved into another
// layer (S.set(bear, { layerL: slot })) to reach inside something.
const Cast = (() => {
  const SIDES = ['L', 'R'];
  const kinds = Art.KINDS;
  // From a drawing's own coordinates (centred on x = cx, feet on y = 552) to the puppet's (feet on 0, 0)
  const placed = (q, inner) => `<g transform="translate(${-q.cx} -552)">${inner}</g>`;
  const mouths = q => Object.keys(q.mouth).map(name =>
    `<g class="p-mouth" data-m="${name}"${name === 'smile' ? '' : ' display="none"'}>${q.mouth[name]}</g>`).join('');
  const headArt = q => `<g class="p-head">${placed(q, q.ears() + q.head())}<g class="p-feat">${placed(q, q.face() + mouths(q) + q.eyes() + q.top())}</g>` +
    (q.hat ? placed(q, q.hat()) : '') + '</g>';

  // Just a character's head, centred on (0, 0): for the "who is this about" badge and the teacher buttons
  function head(kind) {
    const q = kinds[kind];
    return Engine.m.g(`translate(0 ${q.headAt})`, headArt(q));
  }

  // The arm's outline from shoulder to hand: its shape (shared/art.js) turned to point at the hand, and made
  // longer or shorter along its length only, so the round shoulder and the width stay as drawn
  function sleeve(arm, from, to, k, flip) {
    const dx = to.x - from.x, dy = to.y - from.y, far = Math.hypot(dx, dy) || 0.001;
    const ax = dx / far, ay = dy / far, stretch = far / (arm.length * k);
    const spot = ([u, v]) => {
      const across = (flip ? -u : u) * k, along = v <= 0 ? v * k : v * k * stretch;
      return r(from.x + across * ay + along * ax) + ' ' + r(from.y - across * ax + along * ay);
    };
    return arm.shape.map(([command, ...points]) => command + points.map(spot).join(' ')).join('') + 'Z';
  }

  class Puppet {
    constructor(S, kind, o) {
      const q = kinds[kind];
      this.S = S;
      this.kind = kind;
      this.q = q;
      this.k0 = (o.k || 1) * (q.size || 1);
      const layer = o.layer || S.L.chars;
      this.s = {
        x: o.x || 0, y: o.y || 0, k: this.k0, show: o.show !== false, layer,
        lean: 0, tilt: 0, turn: 0, hop: 0, crouch: 0, squash: 1, walk: 0, walkAmp: 0, stride: 0,
        handL: { x: 0, y: 0 }, handLW: 0, relL: false, followL: null, layerL: null,
        handR: { x: 0, y: 0 }, handRW: 0, relR: false, followR: null, layerR: null,
        lookAt: null, face: 'smile', eyes: 'open',
      };
      // Where the directions being written have got this character to
      this.b = { x: this.s.x, y: this.s.y, k: this.k0, walk: 0, w: { L: 0, R: 0 }, rel: { L: null, R: null } };
      this.hands = { L: { x: this.s.x, y: this.s.y }, R: { x: this.s.x, y: this.s.y } };
      this.gaze = { x: 0, y: 0 };
      this.nextBlink = 1 + Math.random() * 3;
      this.wiggleAt = Math.random() * 5;
      this.was = {};

      const root = Engine.group(
        `<g class="p-shadow">${placed(q, q.shadows())}</g>` +
        `<g class="p-leg">${placed(q, q.legs(-1))}</g><g class="p-leg">${placed(q, q.legs(1))}</g>` +
        `<g class="p-body"><g class="p-under">${placed(q, q.under())}</g>${placed(q, q.body())}${headArt(q)}${q.chin ? placed(q, q.chin()) : ''}</g>`,
        layer);
      const pick = selector => Array.from(root.querySelectorAll(selector));
      this.e = {
        root, shadow: root.querySelector('.p-shadow'), legs: pick('.p-leg'), body: root.querySelector('.p-body'),
        under: root.querySelector('.p-under'), head: root.querySelector('.p-head'), ears: pick('.p-ear'),
        eyes: pick('.p-eye'), pupils: pick('.p-pupil'), mouths: pick('.p-mouth'), arm: {},
      };
      SIDES.forEach(side => {
        const g = Engine.group(`<path fill="${q.armFill()}" stroke="${Look.INK}" stroke-linejoin="round"/><g>${q.paw(side === 'L' ? -1 : 1)}</g>`, layer);
        this.e.arm[side] = { g, path: g.firstChild, paw: g.lastChild };
      });
    }

    // ----- where things are -----
    point() {
      return { x: this.s.x, y: this.s.y - this.s.hop - this.s.k * this.q.headAt };
    }

    // A point given in the puppet's own frame ((dx, dy) from its feet, in its own size; up is negative), as a
    // place in the scene (where the directions have got it to)
    at(dx, dy) {
      return { x: this.b.x + dx * this.b.k, y: this.b.y + dy * this.b.k };
    }

    handRef(side) {
      return { point: () => this.hands[side] };
    }

    // ----- directions -----
    stepSound() {
      this.S.cue(() => Sounds.play('step', Object.assign({
        who: this.q.who, surface: this.s.surface || this.S.surface, gain: Math.max(0.3, Math.min(1, this.s.k / this.k0)), muffled: !!this.s.muffled,
      }, this.S.place(this))));
    }

    walkTo(x, o = {}) {
      const S = this.S, from = this.b.x, distance = Math.abs(x - from);
      if (distance < 2) return this;
      const seconds = o.dur || Math.max(0.5, distance / (o.speed || 150));
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
        () => { // the eyes look where they're going
          if (o.turn === false) return;
          S.to(this, { turn: direction }, 0.18);
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

    // Walks to another place in the room, nearer or further from us: across, up or down the picture, and
    // getting bigger or smaller (as Mr. Bear does on his way to the door in S4)
    go(to, seconds, ease = 'inOut') {
      const S = this.S, steps = Math.max(2, Math.round(seconds / 0.36));
      const sideways = (to.x === undefined ? this.b.x : to.x) - this.b.x;
      S.par(() => S.to(this, to, seconds, ease), () => {
        if (Math.abs(sideways) < 30) return this.stepInPlace(seconds, steps);
        const phase = this.b.walk + steps * Math.PI, direction = Math.sign(sideways);
        S.par(
          () => S.to(this, { walk: phase }, seconds, 'linear'),
          () => {
            S.set(this, { stride: sideways / steps });
            S.to(this, { walkAmp: 1, turn: direction }, 0.15, 'out');
            S.wait(Math.max(0, seconds - 0.3));
            S.to(this, { walkAmp: 0, turn: 0 }, 0.15, 'in');
          },
          () => {
            for (let i = 0; i < steps; i++) {
              S.wait(seconds / steps);
              this.stepSound();
            }
          });
        this.b.walk = phase;
      });
      if ('x' in to) this.b.x = to.x;
      if ('y' in to) this.b.y = to.y;
      if ('k' in to) this.b.k = to.k;
      return this;
    }

    // Walks nearer or further away without moving across
    depth(y, k, seconds = 0.6) {
      return this.go({ y, k }, seconds);
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
      S.set(this, { ['rel' + side]: false });
      this.b.w[side] = 0;
      this.b.rel[side] = null;
      return this;
    }

    // The hand stays on something that moves (a handle); `now` is where that is when it lets go
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

    // A hand held up at arm's length, in the puppet's own frame: as high as Mr. Bear's wave in S3a goes
    // (`out` = 1: the other end of the wave, further out to the side)
    raised(side, out = 0) {
      const sign = side === 'L' ? -1 : 1, [sx, sy] = this.q.shoulder, angle = (29 + out * 26) * Math.PI / 180;
      return [sign * (sx + Math.sin(angle) * this.q.armLength), -sy - Math.cos(angle) * this.q.armLength];
    }

    // The wave from S3a: the arm goes up, swings out and back, and comes down
    wave(side = 'L', times = 2) {
      this.carry(side, ...this.raised(side), 0.35);
      for (let i = 0; i < times; i++) {
        this.carry(side, ...this.raised(side, 1), 0.2);
        this.carry(side, ...this.raised(side), 0.2);
      }
      this.rest(side, 0.32);
      return this;
    }

    // Bends its knees to get down to something low (`amount` in its own size; 0 stands back up)
    crouch(amount, seconds = 0.35) {
      this.S.to(this, { crouch: Math.min(amount, 58) }, seconds);
      return this;
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

      // The walk, as in S3a and S4: one foot stays where it is on the floor while the other lifts and swings
      // past; the body rises between footfalls and leans a little the way it is going
      const amp = s.walkAmp, cycle = s.walk / Math.PI, count = Math.floor(cycle + 1e-9), f = cycle - count;
      const stride = s.stride / k, swing = Math.sin(Math.PI * f);
      const planted = [stride * (0.5 - f) * amp, 0], lifted = [stride * (f - 0.5) * amp, 12 * swing * amp];
      const feet = count % 2 === 0 ? [planted, lifted] : [lifted, planted];
      const bob = -5 * swing * amp + s.crouch;
      const lean = s.lean + Math.sign(stride) * 3 * amp;
      const cos = Math.cos(lean * Math.PI / 180), sin = Math.sin(lean * Math.PI / 180);
      const wide = 1 + (1 - s.squash) * 0.6;
      // A point on the body (in the puppet's frame) after its lean (about its middle) and bob
      const onBody = (px, py) => {
        const bx = px * wide, by = py * s.squash + q.leanFrom;
        return [bx * cos - by * sin, bx * sin + by * cos - q.leanFrom + bob];
      };
      const baseY = s.y - s.hop;
      const inScene = (px, py) => {
        const [bx, by] = onBody(px, py);
        return { x: s.x + k * bx, y: baseY + k * by };
      };

      this.put(e.root, 'root', `translate(${r(s.x)} ${r(baseY)}) scale(${r3(k)})`);
      this.put(e.body, 'body', `translate(0 ${r(bob)}) rotate(${r(lean)} 0 ${-q.leanFrom}) scale(${r3(wide)} ${r3(s.squash)})`);
      this.put(e.head, 'head', s.tilt ? `rotate(${r(s.tilt)} 0 ${-q.neck})` : '');
      this.put(e.shadow, 'shadow', `translate(0 ${r(s.hop / k)}) scale(${r3(Math.max(0.5, 1 - s.hop / 160))})`);
      // The soft shadow behind him belongs to where he stands in S4: not outdoors, and not when he is far off
      const grounded = this.S.surface === 'floor' && k > this.k0 * 0.9;
      this.put(e.under, 'under', grounded ? '' : 'none', 'display');
      for (let i = 0; i < 2; i++) {
        const sign = i ? 1 : -1, lift = feet[i][1];
        this.put(e.legs[i], 'leg' + i, `translate(${r(feet[i][0])} ${r(-lift)})` +
          (lift > 0.05 ? ` rotate(${r(sign * 0.5 * lift)} ${sign * q.hip[0]} ${-q.hip[1]})` : ''));
      }

      // Ears: a little wiggle every few seconds (the second ear just after the first)
      const live = dt < 1 && this.S.playing;
      e.ears.forEach((ear, i) => {
        const part = live ? ((wall + this.wiggleAt - i * 0.4) % 5 + 5) % 5 : 0;
        const turn = part < 4 ? 0 : part < 4.25 ? -4 * (part - 4) / 0.25 : part < 4.5 ? -4 + 6 * (part - 4.25) / 0.25 : 2 * (5 - part) / 0.5;
        const [ex, ey] = q.earAt[i];
        this.put(ear, 'ear' + i, turn ? `rotate(${r(turn)} ${ex} ${ey})` : '');
      });

      // Eyes: where they look (eased, so glances aren't jerky), and a blink every few seconds
      let gx = 0, gy = 0;
      if (s.lookAt) {
        const P = s.lookAt.point ? s.lookAt.point() : s.lookAt;
        const dx = P.x - s.x, dy = P.y - (baseY - k * q.eyeAt[1]), far = Math.hypot(dx, dy) || 1, pull = Math.min(1, far / 80);
        gx = dx / far * pull;
        gy = dy / far * pull;
      }
      gx = Math.max(-1, Math.min(1, gx + s.turn));
      const ease = dt >= 1 ? 1 : Math.min(1, dt * 12);
      this.gaze.x += (gx - this.gaze.x) * ease;
      this.gaze.y += (gy - this.gaze.y) * ease;
      const pupil = `translate(${r(this.gaze.x * 6)} ${r(this.gaze.y * 3 + Math.abs(this.gaze.x))})`;
      if (wall > this.nextBlink + 0.13) this.nextBlink = wall + 2.8 + Math.random() * 2.6;
      // (no blinking while a scene is paused for review, so a moment looked at twice looks the same twice)
      const shut = s.eyes === 'closed' || (wall >= this.nextBlink && live);
      for (let i = 0; i < 2; i++) {
        const ex = q.cx + (i ? 1 : -1) * q.eyeAt[0], ey = 552 - q.eyeAt[1];
        this.put(e.pupils[i], 'pupil' + i, pupil);
        this.put(e.eyes[i], 'eye' + i, shut ? `translate(${ex} ${ey}) scale(1 0.08) translate(${-ex} ${-ey})` : '');
      }
      const mouth = s.face === 'chew' ? (Math.sin(wall * 19) > 0 ? 'open' : 'smile') : s.face;
      if (mouth !== was.mouth) {
        was.mouth = mouth;
        e.mouths.forEach(el => {
          if (el.dataset.m === mouth) el.removeAttribute('display'); else el.setAttribute('display', 'none');
        });
      }

      // Arms, drawn in the scene's own coordinates so they can be moved into other layers. As it walks, each
      // arm swings out a little in turn, as in S4.
      SIDES.forEach(side => {
        const sign = side === 'L' ? -1 : 1, A = e.arm[side];
        const shoulder = inScene(sign * q.shoulder[0], -q.shoulder[1]);
        const swingOut = Math.max(0, -sign * Math.sin(s.walk)) * 12 * amp;
        const hang = inScene(sign * (q.hand[0] + swingOut), -q.hand[1]);
        const follow = s['follow' + side], weight = s['hand' + side + 'W'];
        const aim = s['hand' + side], target = s['rel' + side] ? inScene(aim.x, aim.y) : aim;
        const hand = follow ? follow.point()
          : weight <= 0 ? hang
            : { x: hang.x + (target.x - hang.x) * weight, y: hang.y + (target.y - hang.y) * weight };
        this.hands[side] = hand;
        this.put(A.path, 'arm' + side, sleeve(q.arm, shoulder, hand, k, sign > 0), 'd');
        this.put(A.path, 'armW' + side, r(q.armLine * k), 'stroke-width');
        this.put(A.paw, 'paw' + side, `translate(${r(hand.x)} ${r(hand.y)}) scale(${r3(k)})`);
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

  return { make: (S, kind, o) => new Puppet(S, kind, o), head, KINDS: kinds };
})();
