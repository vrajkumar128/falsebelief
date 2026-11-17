// The animation engine every story screen runs on.
//
// A scene is written like stage directions (see any screens/a*.js or t*.js):
//
//   Story.scene({ id: 's6', kind: 'test', title: 'The drawing', build(S) {
//     const doors = Kit.room(S, { left: 'hall' });       // the room and its doors (shared/kit.js)
//     const bear = S.cast('bear', { x: 500, y: 552 });   // a character (shared/cast.js)
//     S.say('s6.1');                                     // a narration line (shared/narration.js)
//     bear.walkTo(290);                                  // each direction takes its time, one after another
//     S.par(() => S.say('s6.2'), () => bear.wave('L'));  // ...unless they are put side by side
//     S.ask({ ... });                                    // the story waits here for the child's answer
//   } });
//
// HOW IT WORKS. The directions don't run as they are written; they are collected into one timeline: for every
// thing that moves, a list of "from time A to time B, go to value V". While the scene plays, one clock decides
// the time, and everything on screen is worked out from that time alone. So the picture can never get out of
// step with itself: a slow device or a hidden tab just makes the clock stop and start (it never skips ahead),
// and any moment of a scene can be shown on its own (Engine.current.seek(12.5)), which is how scenes are checked.
// Sounds and narration are "cues": they fire as the clock passes them.
//
// Coordinates are the picture's own: 1000 wide, 650 tall, (0, 0) at the top left. A scene can be drawn mirrored
// (S.flip) to put its two answers on the other sides; the directions are always written unmirrored.
const Engine = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1000;

  // ---------- drawing ----------
  function svg(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    if (attrs) for (const name in attrs) node.setAttribute(name, attrs[name]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function group(markup, parent, attrs) {
    const g = svg('g', attrs, parent);
    if (markup) g.innerHTML = markup;
    return g;
  }

  // Short ways to write shapes. `plain` gives exactly the shape asked for; `m` (below) is what scenes draw with.
  const x = extra => (extra ? ' ' + extra : '');
  const plain = {
    c: (cx, cy, r, fill, extra) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${x(extra)}/>`,
    e: (cx, cy, rx, ry, fill, extra) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${x(extra)}/>`,
    r: (rx, ry, w, h, round, fill, extra) => `<rect x="${rx}" y="${ry}" width="${w}" height="${h}" rx="${round}" fill="${fill}"${x(extra)}/>`,
    p: (d, fill, extra) => `<path d="${d}" fill="${fill}"${x(extra)}/>`,
    l: (d, stroke, width, extra) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${x(extra)}/>`,
    g: (transform, inner, extra) => `<g transform="${transform}"${x(extra)}>${inner}</g>`,
  };

  // WHAT SCENES DRAW WITH: the same shapes, each given the look of the hand-drawn screens (S3a, S4): a dark
  // outline (thicker on bigger shapes) and soft shading on anything big enough to show it (shared/look.js).
  // See-through shapes (shadows, shines) and shapes that already have a line of their own are left alone.
  //   m.u(() => shapes)      shapes that make up one thing (a book and the paint dripping off it) get one
  //                          outline around all of them, instead of one each
  //   m.flat(() => shapes)   no outlines at all (snowflakes, a pattern)
  //   m.scaled(k, () => ...) for art that will be shown k times bigger: keeps its outlines the usual thickness
  const m = (() => {
    let bare = 0;
    const seeThrough = extra => /(^|\s)opacity=/.test(extra || '');
    const shape = (open, w, h, fill, extra) => {
      if (!Look.isHex(fill)) return `${open} fill="${fill}"${x(extra)}/>`;
      const soft = seeThrough(extra), lined = /(^|\s)stroke=/.test(extra || '');
      const paint = soft || bare || Math.max(w, h) < 26 ? fill : Look.paint(fill);
      const edge = soft || lined || bare ? '' : ` stroke="${Look.INK}" stroke-width="${Look.outline(Math.min(w, h))}" stroke-linejoin="round"`;
      return `${open} fill="${paint}"${edge}${x(extra)}/>`;
    };
    return {
      c: (cx, cy, r, fill, extra) => shape(`<circle cx="${cx}" cy="${cy}" r="${r}"`, r * 2, r * 2, fill, extra),
      e: (cx, cy, rx, ry, fill, extra) => shape(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"`, rx * 2, ry * 2, fill, extra),
      r: (rx, ry, w, h, round, fill, extra) => shape(`<rect x="${rx}" y="${ry}" width="${w}" height="${h}" rx="${round}"`, w, h, fill, extra),
      p: (d, fill, extra) => {
        const size = Look.box(d);
        return shape(`<path d="${d}"`, size.w, size.h, fill, extra);
      },
      // A thick coloured line (a bike's frame, a jug's handle) gets a dark line under it, a little wider
      l: (d, stroke, width, extra) => {
        const line = plain.l(d, stroke, width, extra);
        if (bare || width < 7 || seeThrough(extra) || Look.isDark(stroke)) return line;
        return plain.l(d, Look.INK, width + (width > 10 ? 6 : 5), extra) + line;
      },
      g: plain.g,
      u: (draw, width = 4) => {
        bare++;
        let inner;
        try {
          inner = draw();
        } finally {
          bare--;
        }
        if (bare) return inner;
        return `<g stroke="${Look.INK}" stroke-width="${Look.outline(100) / 5 * width * 2}" stroke-linejoin="round" stroke-linecap="round">${inner}</g>${inner}`;
      },
      flat: draw => {
        bare++;
        try {
          return draw();
        } finally {
          bare--;
        }
      },
      scaled: (k, draw) => Look.scaled(k, draw),
    };
  })();

  const r1 = v => Math.round(v * 10) / 10;
  const r3 = v => Math.round(v * 1000) / 1000;

  // ---------- timing ----------
  const EASE = {
    linear: p => p,
    in: p => p * p,
    out: p => 1 - (1 - p) * (1 - p),
    inOut: p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    back: p => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2),
  };

  const isNumber = v => typeof v === 'number';
  const isPoint = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;

  // A value part-way from a to b. Numbers and {x, y} points glide; anything else (a name, a layer, on/off)
  // switches over at the end.
  function mix(a, b, p) {
    if (isNumber(a) && isNumber(b)) return a + (b - a) * p;
    if (isPoint(a) && isPoint(b)) {
      const out = {};
      for (const key in b) out[key] = isNumber(a[key]) && isNumber(b[key]) ? a[key] + (b[key] - a[key]) * p : b[key];
      return out;
    }
    return p >= 1 ? b : a;
  }

  function valueIn(segment, t) {
    if (t >= segment.t1) return segment.to;
    return mix(segment.from, segment.to, EASE[segment.ease]((t - segment.t0) / (segment.t1 - segment.t0)));
  }

  // ---------- a thing on the stage ----------
  // `s` is its state (where it is, how big, whether it shows...). The timeline writes the state; render() puts
  // it on screen. `draw` is for things with more to them than a position (a door's swing, a glass's water).
  class Thing {
    constructor(el, state, draw) {
      this.el = el;
      this.s = Object.assign({ x: 0, y: 0, rot: 0, sx: 1, sy: 1, opacity: 1, show: true, layer: null, attach: null }, state);
      this.draw = draw || null;
      this.was = {};
    }

    point() {
      return { x: this.s.x, y: this.s.y };
    }

    render(dt, wall) {
      const s = this.s, was = this.was;
      // Held in a hand, it goes where the hand goes
      if (s.attach) {
        const hand = s.attach.ref.point();
        s.x = hand.x + s.attach.dx;
        s.y = hand.y + s.attach.dy;
      }
      if (s.layer && this.el.parentNode !== s.layer) s.layer.appendChild(this.el);
      if (s.show !== was.show) {
        was.show = s.show;
        if (s.show) this.el.removeAttribute('display');
        else this.el.setAttribute('display', 'none');
      }
      if (!s.show) return;
      const transform = `translate(${r1(s.x)} ${r1(s.y)})` + (s.rot ? ` rotate(${r1(s.rot)})` : '') +
        (s.sx !== 1 || s.sy !== 1 ? ` scale(${r3(s.sx)} ${r3(s.sy)})` : '');
      if (transform !== was.transform) this.el.setAttribute('transform', was.transform = transform);
      if (s.opacity !== was.opacity) {
        was.opacity = s.opacity;
        if (s.opacity >= 1) this.el.removeAttribute('opacity');
        else this.el.setAttribute('opacity', r3(Math.max(0, s.opacity)));
      }
      if (this.draw) this.draw(s, this, dt, wall);
    }
  }

  // ---------- a scene ----------
  class Scene {
    constructor(svgEl, options) {
      this.svg = svgEl;
      this.section = svgEl.closest('.screen');
      this.id = options.id;
      this.kind = options.kind;
      this.flip = !!options.flip;
      this.firstOnLeft = options.firstOnLeft !== false;
      this.surface = 'floor';
      svgEl.textContent = '';
      this.defs = svg('defs', null, svgEl);
      // A soft shadow under anything asked to stand out a little (the "lift" option of S.thing)
      this.defs.innerHTML = '<filter id="lift" x="-20%" y="-20%" width="140%" height="150%" color-interpolation-filters="sRGB">' +
        '<feDropShadow dx="0" dy="5" stdDeviation="3.5" flood-color="#000000" flood-opacity="0.2"/></filter>';
      Look.sink(this.defs);
      // Nothing shows outside the picture (the stage can be wider than it): a scooter riding off goes out of sight
      svg('clipPath', { id: 'picture' }, this.defs).innerHTML = `<rect width="${W}" height="650"/>`;
      this.world = svg('g', Object.assign({ 'clip-path': 'url(#picture)' }, this.flip ? { transform: `translate(${W} 0) scale(-1 1)` } : null), svgEl);
      // Back to front: backdrop, things against the wall, characters, things in front of them, things on top
      this.L = {};
      ['bg', 'back', 'chars', 'front', 'top'].forEach(name => { this.L[name] = svg('g', null, this.world); });
      this.ui = svg('g', null, svgEl); // answer buttons: never mirrored
      this.things = [];
      this.puppets = [];
      this.segments = [];
      this.cues = [];
      this.holds = [];
      this.caption = { s: { line: null } };
      this.c = 0; // the "now" of whatever direction is being written
      this.count = 0;
      this.clips = 0;
      this.t = 0;
      this.wall = 0;
      this.playing = false;
      this.asking = null;
      this.ended = false;
      this.cueIndex = 0;
      this.tick = this.tick.bind(this);
    }

    // ----- writing directions -----
    now() {
      return this.c;
    }

    wait(seconds) {
      this.c += seconds;
      return this;
    }

    // Side by side: each starts now; the scene carries on when the longest has finished
    par(...directions) {
      const start = this.c;
      let end = start;
      directions.forEach(direction => {
        this.c = start;
        direction();
        if (this.c > end) end = this.c;
      });
      this.c = end;
      return this;
    }

    // Starts now, but the scene doesn't wait for it
    bg(direction) {
      const start = this.c;
      direction();
      this.c = start;
      return this;
    }

    // Glide a thing's state to new values over `seconds`
    to(thing, values, seconds = 0.4, ease = 'inOut') {
      for (const prop in values) {
        this.segments.push({ thing, prop, t0: this.c, t1: this.c + seconds, to: values[prop], ease, n: this.count++ });
      }
      this.c += seconds;
      return this;
    }

    // Change a thing's state at once
    set(thing, values) {
      for (const prop in values) {
        this.segments.push({ thing, prop, t0: this.c, t1: this.c, to: values[prop], ease: 'linear', n: this.count++ });
      }
      return this;
    }

    // Something that happens once as the clock passes (a sound)
    cue(action) {
      this.cues.push({ t: this.c, action, n: this.count++ });
      return this;
    }

    // A sound from where it happens: `where` is a thing, a character, a point or an x position
    sound(type, where, options) {
      return this.cue(() => Sounds.play(type, Object.assign(this.place(where), options)));
    }

    place(where) {
      if (where === undefined || where === null) return {};
      const at = isNumber(where) ? where : (where.point ? where.point().x : where.x);
      const onScreen = this.flip ? W - at : at;
      return { pan: Math.max(-1, Math.min(1, (onScreen - W / 2) / (W / 2) * 0.7)) };
    }

    // A narration line: the scene waits while it is said (put it in par() to act during it)
    say(id, options = {}) {
      this.cue(() => Narration.play(id));
      this.set(this.caption, { line: id });
      this.c += Narration.duration(id);
      this.set(this.caption, { line: null });
      this.c += options.gap === undefined ? 0.3 : options.gap;
      return this;
    }

    // The story stops here until the child answers (see shared/question.js)
    ask(question) {
      this.holds.push({ t: this.c, question, done: false });
      this.c += 0.5;
      return this;
    }

    // ----- putting things on the stage -----
    thing(markup, options = {}) {
      const { layer, lift, draw, ...state } = options;
      const parent = layer || this.L.front;
      const el = group(markup, parent);
      if (lift) el.setAttribute('filter', 'url(#lift)');
      const made = new Thing(el, Object.assign(state, { layer: parent }), draw);
      this.things.push(made);
      return made;
    }

    // A place between layers for things to be moved into (inside a jar, behind a door)
    slot(parent, attrs) {
      return svg('g', attrs || null, parent || this.L.front);
    }

    clip(markup) {
      const id = 'clip' + (++this.clips);
      svg('clipPath', { id }, this.defs).innerHTML = markup;
      return id;
    }

    cast(kind, options) {
      const puppet = Cast.make(this, kind, options || {});
      this.puppets.push(puppet);
      return puppet;
    }

    // A character takes hold of a thing, and lets go of it
    hold(thing, puppet, side, options = {}) {
      const values = { attach: { ref: puppet.handRef(side), dx: options.dx || 0, dy: options.dy || 0 } };
      if (options.layer) values.layer = options.layer;
      return this.set(thing, values);
    }

    drop(thing, values) {
      return this.set(thing, Object.assign({ attach: null }, values));
    }

    // ----- playing -----
    compile() {
      const byThing = new Map();
      this.segments.forEach(segment => {
        let props = byThing.get(segment.thing);
        if (!props) byThing.set(segment.thing, props = {});
        (props[segment.prop] || (props[segment.prop] = [])).push(segment);
      });
      this.channels = [];
      byThing.forEach((props, thing) => {
        for (const prop in props) {
          const segments = props[prop].sort((a, b) => a.t0 - b.t0 || a.n - b.n);
          const base = thing.s[prop];
          segments.forEach((segment, i) => { segment.from = i ? valueIn(segments[i - 1], segment.t0) : base; });
          this.channels.push({ thing, prop, segments, base });
        }
      });
      this.cues.sort((a, b) => a.t - b.t || a.n - b.n);
      this.holds.sort((a, b) => a.t - b.t);
      this.duration = this.c + 0.7;
    }

    apply(t) {
      for (let i = 0; i < this.channels.length; i++) {
        const channel = this.channels[i], segments = channel.segments;
        let value = channel.base;
        if (t >= segments[0].t0) {
          let lo = 0, hi = segments.length - 1;
          while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (segments[mid].t0 <= t) lo = mid; else hi = mid - 1;
          }
          value = valueIn(segments[lo], t);
        }
        channel.thing.s[channel.prop] = value;
      }
    }

    renderAll(dt) {
      // Characters first: a thing held in a hand needs to know where the hand is
      for (let i = 0; i < this.puppets.length; i++) this.puppets[i].render(dt, this.wall);
      for (let i = 0; i < this.things.length; i++) this.things[i].render(dt, this.wall);
      const line = this.asking && this.asking.line ? this.asking.line : this.caption.s.line;
      if (line !== this.shownLine) {
        this.shownLine = line;
        const text = line ? Narration.text(line) : '';
        const reader = this.section && this.section.querySelector('.sr-only');
        if (reader && text) reader.textContent = text;
        const caption = this.section && this.section.querySelector('.caption');
        if (caption && Study.flags.captions) {
          caption.textContent = text;
          caption.hidden = !text;
        }
      }
      if (Study.flags.dev) hud(this);
    }

    start() {
      this.compile();
      this.playing = true;
      this.last = performance.now();
      this.apply(0);
      this.renderAll(0);
      this.raf = requestAnimationFrame(this.tick);
      Engine.current = this;
    }

    stop() {
      cancelAnimationFrame(this.raf);
      this.playing = false;
      Narration.stop();
      Question.cancel(this);
      if (Engine.current === this) Engine.current = null;
      this.svg.textContent = '';
    }

    tick(now) {
      this.raf = requestAnimationFrame(this.tick);
      // A stall (slow device, hidden tab) never skips story time: the clock just carries on from where it was
      let dt = (now - this.last) / 1000;
      this.last = now;
      if (!(dt > 0)) dt = 0;
      if (dt > 0.1) dt = 0.1;
      this.wall += dt;
      const step = dt * Engine.speed; // faster only when reviewing (?speed=4)
      if (this.playing && !this.asking && !this.ended) {
        let t = this.t + step;
        const hold = this.holds.find(h => !h.done && h.t <= t);
        if (hold) t = hold.t;
        this.t = t;
        while (this.cueIndex < this.cues.length && this.cues[this.cueIndex].t <= t) {
          try {
            this.cues[this.cueIndex].action();
          } catch (error) {
            console.warn('Scene cue failed', error);
          }
          this.cueIndex++;
        }
        if (hold) {
          this.asking = hold;
          Question.present(this, hold, () => {
            hold.done = true;
            this.asking = null;
          });
        } else if (t >= this.duration) {
          this.ended = true;
          if (this.onEnd) this.onEnd();
        }
      }
      if (this.asking) Question.tick(this, step);
      this.apply(this.t);
      this.renderAll(dt);
    }

    // ----- for looking at a scene -----
    seek(t) {
      t = Math.max(0, Math.min(this.duration, t));
      if (this.asking) {
        Question.cancel(this);
        this.asking = null;
      }
      this.holds.forEach(hold => { hold.done = hold.t < t; });
      this.t = t;
      this.cueIndex = this.cues.findIndex(cue => cue.t > t);
      if (this.cueIndex < 0) this.cueIndex = this.cues.length;
      this.ended = false;
      Narration.stop();
      this.apply(t);
      this.renderAll(1);
      return this;
    }
  }

  // ---------- review tools (?dev) ----------
  function hud(scene) {
    let el = document.getElementById('dev-hud');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dev-hud';
      document.body.appendChild(el);
    }
    const text = `${scene.id}  ${scene.t.toFixed(1)} / ${scene.duration.toFixed(1)} s` + (scene.playing ? '' : '  paused') + (scene.flip ? '  mirrored' : '');
    if (el.textContent !== text) el.textContent = text;
  }

  // Many moments of the current scene side by side: Engine.sheet([0, 2, 4, 6])
  function sheet(times, columns = 4) {
    const scene = Engine.current;
    if (!scene) return 'no scene is playing';
    scene.playing = false;
    let box = document.getElementById('dev-sheet');
    if (box) box.remove();
    if (!times) return 'cleared';
    box = document.createElement('div');
    box.id = 'dev-sheet';
    box.style.cssText = `position:fixed;inset:0;z-index:99;display:grid;grid-template-columns:repeat(${columns},1fr);gap:3px;padding:3px;align-content:start;overflow:auto;background:#26221c`;
    times.forEach((t, i) => {
      scene.seek(t);
      const cell = document.createElement('div');
      cell.style.cssText = 'position:relative;aspect-ratio:1000/650;background:#fcefdc';
      cell.innerHTML = scene.svg.outerHTML
        .replace(/ id="([^"]+)"/g, ` id="$1_${i}"`)
        .replace(/url\(#([^)]+)\)/g, `url(#$1_${i})`)
        .replace(/url\(&quot;#([^&]+)&quot;\)/g, `url(#$1_${i})`) +
        `<span style="position:absolute;left:3px;top:2px;padding:0 4px;background:#fffc;font:11px monospace">${t.toFixed(1)}</span>`;
      box.appendChild(cell);
    });
    document.body.appendChild(box);
    return times.length + ' frames';
  }

  window.addEventListener('keydown', event => {
    if (!Study.flags.dev) return;
    const scene = Engine.current;
    if (event.key === 'n') Storyline.next();
    else if (event.key === 'b') Storyline.back();
    else if (!scene) return;
    else if (event.key === ' ') scene.playing = !scene.playing;
    else if (event.key === 'ArrowRight') scene.seek(scene.t + 1);
    else if (event.key === 'ArrowLeft') scene.seek(scene.t - 1);
    else return;
    event.preventDefault();
  });

  return { svg, group, m, plain, mix, EASE, Thing, Scene, sheet, current: null, W, speed: Study.flags.speed };
})();

// Registers a story screen. `build(S)` puts the scene on the stage and writes its directions; it runs afresh
// every time the screen is shown, so a scene always starts clean.
//   spatial: true  the two answers are things in the scene (written with the first answer on the left), so the
//                  whole scene is mirrored when the first answer should be on the right
const Story = (() => {
  let playing = null;

  // Looking at a scene from the address bar: ?dev&at=12.5 shows that moment and stays there; ?dev&sheet=12 lays
  // that many moments side by side (?dev&sheet=2,5.5,9 for those moments)
  function review(S) {
    const { at, sheet } = Study.flags;
    if (sheet) {
      const list = sheet.split(',').map(Number).filter(value => value >= 0);
      const count = Math.max(1, Math.round(list[0]) || 8);
      const times = list.length > 1 ? list : Array.from({ length: count }, (_, i) => S.duration * (i + 0.5) / count);
      Engine.sheet(times, Math.min(4, Math.ceil(Math.sqrt(times.length))));
    } else if (at !== null && isFinite(at)) {
      S.playing = false;
      S.seek(at);
    } else if (Study.flags.ask && S.holds[Study.flags.ask - 1]) {
      // ?dev&ask=1: straight to a question, with its answers ready to tap (&pick=left taps one)
      const hold = S.holds[Study.flags.ask - 1], frame = window.requestAnimationFrame;
      S.seek(Math.max(0, hold.t - 0.02));
      S.holds.forEach((other, i) => { other.done = i < Study.flags.ask - 1; });
      window.requestAnimationFrame = () => 0; // the clock is stepped by hand here
      let now = S.last = performance.now();
      const step = () => S.tick(now += 100);
      for (let i = 0; i < 400 && !(Question.live && Question.live.phase === 'open'); i++) step();
      if (Study.flags.pick && Question.answer(Study.flags.pick)) for (let i = 0; i < 3; i++) step();
      window.requestAnimationFrame = frame;
    }
  }

  function scene(definition) {
    Storyline.addScreen({
      id: definition.id,
      kind: definition.kind,
      title: definition.title,
      markup: `<section aria-label="${definition.title}" class="screen scene-screen" data-screen="${definition.id}" id="screen-${definition.id}">` +
        `<svg aria-label="${definition.title}" class="w-full h-full block scene-svg" role="img" viewBox="0 0 1000 650"></svg>` +
        '<p aria-live="polite" class="sr-only"></p><p class="caption" hidden></p></section>',
      enter() {
        const section = document.getElementById('screen-' + definition.id);
        const firstOnLeft = Study.firstOnLeft(definition.id);
        const S = new Engine.Scene(section.querySelector('svg'), {
          id: definition.id,
          kind: definition.kind,
          firstOnLeft,
          flip: !!definition.spatial && !firstOnLeft,
        });
        definition.build(S);
        S.onEnd = () => Storyline.next();
        S.start();
        playing = S;
        if (Study.flags.dev) review(S);
      },
      leave() {
        if (playing) playing.stop();
        playing = null;
      },
    });
  }

  return { scene };
})();
