// How the screens after S4 get the same look as the hand-drawn ones (S3a and S4): a dark outline round every
// shape, thicker on bigger shapes, and soft top-to-bottom shading on anything big enough to show it.
//
// Those screens are written as stage directions (shared/engine.js) and draw with small shape helpers
// (Engine.m); the helpers use what is here to outline and shade each shape. The characters, the room, the doors
// and the table are not left to that: they are the original drawings, kept in shared/art.js.
const Look = (() => {
  const INK = '#2c1e14';

  // ---------- colours ----------
  const isHex = color => /^#[0-9a-f]{6}$/i.test(color);
  const toRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const toHex = rgb => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  // Part-way from one colour to another
  const blend = (a, b, part) => {
    const A = toRgb(a), B = toRgb(b);
    return toHex(A.map((v, i) => v + (B[i] - v) * part));
  };
  const isDark = color => {
    if (!isHex(color)) return false;
    const [r, g, b] = toRgb(color);
    return (Math.max(r, g, b) + Math.min(r, g, b)) / 510 < 0.24;
  };

  // ---------- shading ----------
  // Gradients live in the <defs> of the scene being drawn (Engine.Scene hands it over with Look.sink)
  let defs = null, made = null;
  function sink(element) {
    defs = element;
    made = new Set();
  }

  // Adds a definition (a gradient, say) to the scene once, and returns how to paint with it
  function def(id, markup) {
    if (!defs) return null;
    if (!made.has(id)) {
      made.add(id);
      defs.insertAdjacentHTML('beforeend', markup);
    }
    return `url(#${id})`;
  }

  const stops = colors => colors.map((color, i) => {
    const [value, at] = Array.isArray(color) ? color : [color, colors.length > 1 ? i / (colors.length - 1) : 0];
    return `<stop offset="${at}" stop-color="${value}"/>`;
  }).join('');

  // A named gradient: across ('h'), down ('v') or corner to corner ('d')
  function gradient(id, colors, direction = 'v') {
    const middle = colors[Math.floor(colors.length / 2)]; // what to paint with when there is no scene to shade in
    return def('k-' + id, `<linearGradient id="k-${id}" x1="0" y1="0" x2="${direction === 'v' ? 0 : 1}" y2="${direction === 'h' ? 0 : 1}">${stops(colors)}</linearGradient>`) ||
      (Array.isArray(middle) ? middle[0] : middle);
  }

  // A colour as a shape is painted with it: lighter at the top, darker at the bottom
  function paint(color) {
    if (!isHex(color) || !defs) return color;
    return gradient('g' + color.slice(1).toLowerCase(), [blend(color, '#ffffff', 0.16), blend(color, '#000000', 0.13)]);
  }

  // How thick the outline of a shape this big (its smaller side) is
  let zoom = 1;
  function outline(size) {
    const width = size >= 90 ? 5 : size >= 45 ? 4 : size >= 20 ? 3 : size >= 9 ? 2 : 1.2;
    return Math.round(width / zoom * 100) / 100;
  }

  // Runs `draw` for something that will be shown `k` times its drawn size, so its outlines come out the usual
  // thickness (for the pictures on the answer buttons)
  function scaled(k, draw) {
    const before = zoom;
    zoom = before * k;
    try {
      return draw();
    } finally {
      zoom = before;
    }
  }

  // ---------- how big a path is ----------
  // Roughly: the box around its points (curves' control points count, arcs' bulges don't)
  function box(d) {
    const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || [];
    const takes = { M: 2, L: 2, T: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, A: 7, Z: 0 };
    let i = 0, command = 'M', x = 0, y = 0, startX = 0, startY = 0;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const see = (px, py) => {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    };
    let guard = 0;
    while (i < tokens.length && guard++ < 4000) {
      if (/[a-zA-Z]/.test(tokens[i])) command = tokens[i++];
      const kind = command.toUpperCase(), relative = command !== kind, count = takes[kind];
      if (count === undefined) break;
      if (kind === 'Z') {
        x = startX;
        y = startY;
        continue;
      }
      if (i + count > tokens.length) break;
      const args = tokens.slice(i, i + count).map(Number);
      i += count;
      if (kind === 'H') x = args[0] + (relative ? x : 0);
      else if (kind === 'V') y = args[0] + (relative ? y : 0);
      else {
        const first = kind === 'A' ? 5 : 0;
        for (let n = first; n < count; n += 2) see(args[n] + (relative ? x : 0), args[n + 1] + (relative ? y : 0));
        const endX = args[count - 2] + (relative ? x : 0), endY = args[count - 1] + (relative ? y : 0);
        x = endX;
        y = endY;
      }
      see(x, y);
      if (kind === 'M') {
        startX = x;
        startY = y;
        command = relative ? 'l' : 'L';
      }
    }
    return minX === Infinity ? { w: 40, h: 40 } : { w: maxX - minX, h: maxY - minY };
  }

  return { INK, paint, blend, isDark, isHex, sink, def, gradient, outline, scaled, box };
})();
