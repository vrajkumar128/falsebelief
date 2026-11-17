// THE DRAWINGS the screens after S4 share with S3a and S4: Mr. Bear and Mr. Turtle, the striped room with the blue
// floor, the doors and what shows through them, the table, and the outdoors. They are the same drawings as in
// screens/s3a-bear-intro.js and screens/s4-cookie-jars.js, in the same coordinates, cut into the pieces the
// puppets and the scene kit need (shared/cast.js, shared/kit.js). Mr. Duck, Mr. Pig, Mr. Rabbit and Mr. Bear's
// family are new, drawn the same way as Mr. Bear: same build, same chunky arms, same outlines.
const Art = (() => {
  const P = Engine.plain, G = Look.gradient;
  const INK = '#2c1e14', PAD = '#f8bbd0', BLUSH = '#ff8a80', WHITE = '#ffffff';
  const O = width => `stroke="${INK}" stroke-width="${width}" stroke-linejoin="round"`;
  const line = (d, width, color = INK) => `<path d="${d}" fill="none" stroke="${color}" stroke-linecap="round" stroke-width="${width}"/>`;

  // ================= THE CHARACTERS =================
  // Each is drawn standing in the original drawings' coordinates: facing us, centred on x = `cx`, feet on
  // y = 552. For the puppet, a character is these pieces:
  //   legs(sign)   one leg and foot (sign -1 = the one on the left of the screen), which steps as a whole
  //   body         torso; `under` is the soft shadow behind him that S4 has
  //   ears, head, face, mouth, eyes   the head, in layers; `mouth` has a smile, an "oh" and a wide grin
  //   arm          the arm's outline as a list of points measured across (u) and along (v) the arm from the
  //                shoulder, so it can be drawn pointing anywhere; at rest it is exactly the original arm
  //   paw(sign)    the hand, drawn around its own middle (its pads stay upright, as when Mr. Bear waves)
  // and these numbers (x from his middle, y up from his feet): where the shoulders, hips and resting hands
  // are, how long the arm is, where he leans from, and how small he is when he stands in a doorway.

  // The original arm is a chunky limb with a round shoulder: across the arm, then along it
  const BEAR_ARM = {
    length: 81.9,
    shape: [['M', [27, 0]], ['C', [27, -14.9], [14.9, -27], [0, -27]], ['C', [-14.9, -27], [-27, -14.9], [-27, 0]],
      ['C', [-25.2, 28.5], [-29, 55.7], [-24.1, 81.9]], ['L', [24, 81.9]], ['C', [22, 55.9], [25.8, 26.5], [27, 0]]],
  };
  // Mr. Turtle's is a soft flipper that wraps round his hand
  const TURTLE_ARM = {
    length: 85,
    shape: [['M', [-4.5, -8.9]], ['C', [-26.8, 2.2], [-47, 51.4], [-4.5, 89.4]], ['C', [15.2, 102], [34.9, 78.7], [28.6, 43.8]],
      ['C', [22.4, 13.4], [8.9, -13.4], [-4.5, -8.9]]],
  };

  const eyes = (cx, y, dx, rx, ry) => [-1, 1].map(sign => '<g class="p-eye"><g class="p-pupil">' + P.e(cx + sign * dx, y, rx, ry, INK) +
    P.e(cx + sign * dx - 3, y - 5, rx * 0.41, ry * 0.43, WHITE) + P.c(cx + sign * dx + 4, y + 5, 2.5, WHITE) + '</g></g>').join('');
  const brows = (cx, y, dx, width = 4) => line(`M${cx - dx - 13} ${y - 21}Q${cx - dx} ${y - 29} ${cx - dx + 12} ${y - 22}`, width) +
    line(`M${cx + dx - 12} ${y - 22}Q${cx + dx} ${y - 29} ${cx + dx + 13} ${y - 21}`, width);
  const blush = (cx, y, dx, rx = 14, ry = 9, color = BLUSH, opacity = 0.65) =>
    P.e(cx - dx, y, rx, ry, color, `opacity="${opacity}"`) + P.e(cx + dx, y, rx, ry, color, `opacity="${opacity}"`);
  const footShadows = (cx, dx, rx) => P.e(cx - dx, 565, rx, 12, '#000000', 'opacity=".25"') + P.e(cx + dx, 565, rx, 12, '#000000', 'opacity=".25"');

  // Mr. Bear, exactly as in S4 (and his family: the same bear in other browns, each with one thing to tell
  // them apart)
  function bear(name, fur, more) {
    const coat = () => G('fur-' + name, fur, 'd'), cream = () => G('cream', ['#fae2be', '#ecc99a']);
    return Object.assign({
      who: 'bear', cx: 500, size: 1, doorway: 0.64,
      shoulder: [82, 222], hand: [117, 148], hip: [60, 112], armLength: 81.9, leanFrom: 82, neck: 248,
      eyeAt: [32, 327], headAt: 312, earAt: [[430, 170], [570, 170]],
      shadows: () => footShadows(500, 60, 35),
      under: () => P.e(500, 455, 145, 24, '#000000', 'opacity=".18"'),
      legs: sign => {
        const x = sign < 0 ? 0 : 120, toes = sign < 0 ? [423, 436, 449] : [551, 564, 577], foot = sign < 0 ? 438 : 562;
        return P.p(`M${420 + x} 440L${415 + x} 540C${415 + x} 558 ${465 + x} 558 ${465 + x} 540L${460 + x} 440Z`, coat(), O(5.5)) +
          P.e(foot, 552, 32, 15, coat(), O(5)) + P.e(foot, 553, 15, 9, PAD, O(1.5)) +
          toes.map((tx, i) => P.c(tx, i === 1 ? 541 : 544, 4.5, PAD, O(1.2))).join('');
      },
      body: () => P.e(500, 380, 122, 125, coat(), O(6)) + P.e(500, 385, 65, 70, cream(), 'opacity=".9" ' + O(4)),
      ears: () => [430, 570].map(ex => `<g class="p-ear">${P.c(ex, 180, 34, coat(), O(5))}${P.c(ex, 180, 18, PAD, O(3))}</g>`).join(''),
      head: () => P.c(500, 240, 88, coat(), O(6)),
      face: () => blush(500, 265, 55) + P.e(500, 265, 46, 34, cream(), O(4.5)) +
        P.p('M485 246C485 240 515 240 515 246C515 258 485 258 485 246Z', INK) + P.e(495, 245, 4, 2, WHITE),
      mouth: {
        smile: P.p('M487 271Q500 293 513 271Z', '#d32f2f', O(3)) + line('M485 268Q500 274 515 268', 4) + P.p('M492 284Q500 281 508 284', BLUSH),
        open: P.e(500, 281, 9, 10.5, '#b71c1c', O(3)) + P.e(500, 286, 5, 4, BLUSH),
        wide: P.p('M483 269Q500 304 517 269Z', '#d32f2f', O(3)) + line('M481 267Q500 273 519 267', 4) + P.e(500, 287, 7, 4, BLUSH),
      },
      eyes: () => eyes(500, 225, 32, 11, 15),
      // eyebrows, and the tuft of hair on top
      top: () => brows(500, 225, 32) + P.p('M492 154Q500 138 506 153Q512 142 516 156', coat(), `stroke="${INK}" stroke-width="4"`),
      arm: BEAR_ARM, armFill: coat, armLine: 5,
      paw: sign => P.c(0, 0, 24, coat(), O(5)) + P.e(0, 0, 13, 11, PAD) +
        [[17, -13], [9, -22], [-5, -23]].map(([px, py]) => P.c(sign * px, py, 5, PAD, O(1.2))).join(''),
    }, more);
  }

  // Mr. Turtle, exactly as in S4
  const TURTLE = (() => {
    const skin = () => G('turtle-skin', ['#8bc34a', '#558b2f'], 'd'), LINE = '#223717';
    return {
      who: 'turtle', cx: 845, size: 1, doorway: 0.7,
      shoulder: [55, 212], hand: [93, 136], hip: [40, 102], armLength: 85, leanFrom: 82, neck: 240,
      eyeAt: [25, 326], headAt: 312, earAt: null,
      shadows: () => footShadows(845, 40, 28).replace(/opacity=".25"/g, 'opacity=".22"').replace(/ry="12"/g, 'ry="10"'),
      under: () => P.e(845, 465, 115, 20, '#000000', 'opacity=".18"'),
      legs: sign => {
        const x = sign < 0 ? 0 : 74;
        return P.p(`M${790 + x} 450L${788 + x} 544C${788 + x} 558 ${826 + x} 558 ${826 + x} 544L${824 + x} 450Z`, skin(), O(5)) +
          P.e(sign < 0 ? 806 : 882, 550, 26, 14, skin(), O(4.5)) +
          line(`M${790 + x} 554Q${792 + x} 562 ${795 + x} 554M${804 + x} 556Q${807 + x} 564 ${810 + x} 556M${818 + x} 554Q${820 + x} 562 ${823 + x} 554`, 2.5);
      },
      // his shell (behind), its plates, and his pale front
      body: () => P.e(845, 375, 112, 105, G('turtle-shell', ['#4e7037', '#2e491f'], 'd'), O(6)) +
        `<path d="M740 375Q845 285 950 375Q845 465 740 375Z" fill="none" stroke="${LINE}" stroke-width="4.5"/>` +
        `<polygon points="845,310 885,340 885,395 845,425 805,395 805,340" fill="#3c5b2a" stroke="${LINE}" stroke-width="3.5"/>` +
        `<path d="M845 310V275M885 340L935 325M885 395L935 415M845 425V475M805 395L755 415M805 340L755 325" fill="none" stroke="${LINE}" stroke-width="3.5"/>` +
        P.e(845, 382, 68, 78, G('turtle-belly', ['#fff9c4', '#f0e68c']), O(4.5)) +
        '<path d="M845 308V456" fill="none" stroke="#d4c46a" stroke-width="3.5"/><path d="M785 355H905M785 410H905" fill="none" stroke="#d4c46a" stroke-width="3"/>',
      ears: () => P.p('M825 280V320H865V280Z', skin(), `stroke="${INK}" stroke-width="5"`), // his neck
      head: () => P.c(845, 240, 72, skin(), O(5.5)),
      face: () => blush(845, 262, 45, 11, 7, BLUSH, 0.55) + P.e(845, 260, 34, 22, '#7cb342', O(3.5)) + P.c(838, 250, 2.5, INK) + P.c(852, 250, 2.5, INK),
      mouth: {
        smile: P.p('M830 268Q845 286 860 268Z', '#d32f2f', O(3)) + line('M827 266Q845 272 863 266', 3.5) + P.p('M837 279Q845 276 853 279', BLUSH),
        open: P.e(845, 274, 8.5, 9.5, '#b71c1c', O(3)) + P.e(845, 278, 4.5, 3.5, BLUSH),
        wide: P.p('M828 266Q845 296 862 266Z', '#d32f2f', O(3)) + line('M826 264Q845 270 864 264', 3.5) + P.e(845, 281, 6, 3.5, BLUSH),
      },
      eyes: () => eyes(845, 226, 25, 9.5, 13),
      top: () => line('M808 208Q819 201 830 207', 3.5) + line('M860 207Q871 201 882 208', 3.5),
      arm: TURTLE_ARM, armFill: skin, armLine: 5,
      paw: sign => P.c(0, 0, 16, skin(), O(3.5)) + P.c(sign * 8, -2, 2.5, WHITE, 'opacity=".4"'),
    };
  })();

  // Mr. Pig: Mr. Bear's build in pink, with pointed ears, a snout, trotters and a curly tail
  const PIG = (() => {
    const DEEP = '#ec7f97', HOOF = '#d9607c', TAIL = 'M612 424C642 412 646 446 626 448C614 448 616 432 628 434';
    const coat = () => G('pig', ['#fbc4cf', '#ef95a8'], 'd');
    return Object.assign(bear('pig', ['#fbc4cf', '#ef95a8']), {
      who: 'pig', earAt: null,
      legs: sign => {
        const x = sign < 0 ? 0 : 120, foot = sign < 0 ? 438 : 562;
        return P.p(`M${420 + x} 440L${415 + x} 540C${415 + x} 558 ${465 + x} 558 ${465 + x} 540L${460 + x} 440Z`, coat(), O(5.5)) +
          P.e(foot, 552, 32, 15, HOOF, O(5)) + line(`M${foot} 553V565`, 2.5);
      },
      body: () => line(TAIL, 15) + line(TAIL, 7.5, DEEP) + P.e(500, 380, 122, 125, coat(), O(6)) +
        P.e(500, 385, 65, 70, G('pig-belly', ['#ffe9ee', '#fbcbd5']), 'opacity=".9" ' + O(4)),
      ears: () => P.p('M414 194Q400 130 450 148Q464 170 448 192Z', DEEP, O(5)) + P.p('M586 194Q600 130 550 148Q536 170 552 192Z', DEEP, O(5)),
      face: () => blush(500, 272, 60, 14, 9, '#f06292', 0.5) + P.e(500, 264, 34, 25, DEEP, O(4.5)) + P.e(489, 264, 5, 8, '#a83a55') + P.e(511, 264, 5, 8, '#a83a55'),
      mouth: {
        smile: P.p('M488 295Q500 313 512 295Z', '#d32f2f', O(3)) + line('M486 293Q500 298 514 293', 3.5),
        open: P.e(500, 303, 8, 9, '#b71c1c', O(3)),
        wide: P.p('M485 293Q500 321 515 293Z', '#d32f2f', O(3)) + line('M483 291Q500 296 517 291', 3.5),
      },
      eyes: () => eyes(500, 222, 34, 11, 15),
      eyeAt: [34, 330],
      top: () => brows(500, 222, 34),
      paw: () => P.c(0, 0, 24, coat(), O(5)) + line('M0 8V23', 2.5),
    });
  })();

  // Mr. Duck: a round yellow body, an orange bill, thin legs and webbed feet; his wings are his arms
  const DUCK = (() => {
    const BILL = '#fb8c00', BILL_DARK = '#e65100', THROAT = '#7a1f1f';
    const coat = () => G('duck', ['#ffe57f', '#f9b925'], 'd');
    const nostrils = y => P.c(494, y, 1.8, INK) + P.c(506, y, 1.8, INK);
    return {
      who: 'duck', cx: 500, size: 1, doorway: 0.66,
      shoulder: [78, 214], hand: [112, 142], hip: [58, 84], armLength: 80, leanFrom: 82, neck: 246,
      eyeAt: [30, 332], headAt: 310, earAt: null,
      shadows: () => footShadows(500, 58, 30),
      under: () => P.e(500, 455, 135, 22, '#000000', 'opacity=".18"'),
      legs: sign => {
        const foot = sign < 0 ? 442 : 558;
        return P.r(foot - 8, 468, 16, 82, 7, BILL, O(4)) + P.e(foot, 552, 30, 12, BILL, O(4.5)) + line(`M${foot - 10} 553V561M${foot + 10} 553V561`, 2.2);
      },
      body: () => P.e(500, 386, 114, 118, coat(), O(6)) + P.e(500, 394, 64, 68, G('duck-belly', ['#fffde7', '#fff3b0']), 'opacity=".92" ' + O(4)),
      ears: () => P.p('M492 168C472 144 490 118 510 126C502 136 504 152 508 168Z', coat(), O(4.5)), // the tuft on his head
      head: () => P.c(500, 242, 84, coat(), O(6)),
      face: () => blush(500, 264, 56),
      mouth: {
        smile: P.e(500, 263, 36, 15, BILL, O(4)) + line('M478 268Q500 275 522 268', 3) + nostrils(257),
        open: P.e(500, 279, 26, 14, BILL_DARK, O(3.5)) + P.e(500, 274, 15, 7, THROAT) + P.e(500, 259, 36, 14, BILL, O(4)) + nostrils(255),
        wide: P.e(500, 285, 28, 17, BILL_DARK, O(3.5)) + P.e(500, 278, 17, 9, THROAT) + P.e(500, 257, 36, 14, BILL, O(4)) + nostrils(253),
      },
      eyes: () => eyes(500, 220, 30, 10.5, 14.5),
      top: () => brows(500, 220, 30),
      arm: { length: 80, shape: BEAR_ARM.shape.map(([c, ...pts]) => [c, ...pts.map(([u, v]) => [u * 0.9, v > 0 ? v * 80 / 81.9 : v * 0.9])]) },
      armFill: coat, armLine: 5,
      paw: sign => P.c(0, 0, 21, coat(), O(4.5)) + P.c(sign * 8, -8, 3.5, WHITE, 'opacity=".6"'),
    };
  })();

  // Mr. Rabbit, the teacher: Mr. Bear's build in grey, with long ears, glasses, two front teeth and a bow tie
  const RABBIT = (() => {
    const LIGHT = '#faf6ef';
    const coat = () => G('rabbit', ['#c2b9ae', '#958b80'], 'd');
    return Object.assign(bear('rabbit', ['#c2b9ae', '#958b80']), {
      who: 'rabbit', size: 1.04, earAt: [[464, 172], [536, 172]],
      legs: sign => {
        const x = sign < 0 ? 0 : 120, foot = sign < 0 ? 438 : 562;
        return P.p(`M${420 + x} 440L${415 + x} 540C${415 + x} 558 ${465 + x} 558 ${465 + x} 540L${460 + x} 440Z`, coat(), O(5.5)) +
          P.e(foot, 552, 33, 15, coat(), O(5)) + P.e(foot, 553, 15, 8, PAD, O(1.5));
      },
      body: () => P.e(500, 380, 118, 125, coat(), O(6)) + P.e(500, 385, 62, 70, G('rabbit-belly', [WHITE, '#efe9df']), 'opacity=".92" ' + O(4)),
      ears: () => [[464, -8], [536, 8]].map(([ex, turn]) => `<g class="p-ear">${P.g(`rotate(${turn} ${ex} 172)`,
        P.e(ex, 104, 25, 76, coat(), O(5)) + P.e(ex, 108, 11, 54, PAD, O(2.5)))}</g>`).join(''),
      head: () => P.e(500, 240, 86, 84, coat(), O(6)),
      face: () => blush(500, 270, 60) + P.e(485, 270, 20, 16, LIGHT, O(3.5)) + P.e(515, 270, 20, 16, LIGHT, O(3.5)) + P.p('M492 253H508L500 263Z', '#f06292', O(2.5)),
      mouth: {
        smile: P.r(492, 282, 16, 14, 3, WHITE, O(2.5)) + line('M500 282V295', 1.5),
        open: P.e(500, 287, 9.5, 10, '#b71c1c', O(3)) + P.r(492, 279, 16, 11, 3, WHITE, O(2.5)),
        wide: P.e(500, 289, 11.5, 13, '#b71c1c', O(3)) + P.r(492, 278, 16, 11, 3, WHITE, O(2.5)),
      },
      eyes: () => eyes(500, 226, 34, 10.5, 14.5),
      eyeAt: [34, 326],
      // his glasses; his bow tie goes under his chin
      top: () => `<g fill="${WHITE}" fill-opacity=".22" stroke="${INK}" stroke-width="4.5"><circle cx="466" cy="226" r="22"/><circle cx="534" cy="226" r="22"/></g>` + line('M488 226H512', 4.5),
      chin: () => P.p('M495 338L464 319V357Z', '#e53935', O(3.5)) + P.p('M505 338L536 319V357Z', '#e53935', O(3.5)) + P.c(500, 338, 9, '#b71c1c', O(3)),
      paw: sign => P.c(0, 0, 24, coat(), O(5)) + P.e(0, 0, 13, 11, PAD) + [[17, -13], [9, -22], [-5, -23]].map(([px, py]) => P.c(sign * px, py, 5, PAD, O(1.2))).join(''),
    });
  })();

  const KINDS = {
    bear: bear('bear', ['#9d6b46', '#7a4f2f']),
    turtle: TURTLE,
    duck: DUCK,
    pig: PIG,
    rabbit: RABBIT,
    // his little sister has a bow on one ear
    sister: bear('sister', ['#b98558', '#94643f'], {
      size: 0.78, who: 'cub',
      hat: () => P.p('M430 150L398 129V171Z', '#f06292', O(3.5)) + P.p('M430 150L462 129V171Z', '#f06292', O(3.5)) + P.c(430, 150, 10, '#d81b60', O(3)),
    }),
    // his mom wears a necklace
    mom: bear('mom', ['#a87650', '#845738'], {
      size: 1.04, who: 'big',
      chin: () => [[460, 333], [479, 342], [500, 346], [521, 342], [540, 333]].map(([bx, by]) => P.c(bx, by, 7.5, '#ffd54f', O(2.5))).join(''),
    }),
    // his dad wears a tie
    dad: bear('dad', ['#7d5235', '#5a3922'], {
      size: 1.07, who: 'big',
      chin: () => P.p('M490 328H510L507 343L513 396L500 412L487 396L493 343Z', '#1e88e5', O(3)),
    }),
  };

  // ================= ROOMS AND THE OUTDOORS =================
  // Every room is drawn like the one in S4 (a striped wall, a baseboard, a floor of long boards), in its own
  // colours. 'home' is S4's room: Mr. Bear's house.
  const ROOMS = {
    home: { wall: ['#fff7ed', '#f5e1cb'], stripe: '#d48b47', base: '#e0cbaf', floor: '#5c6bc0', line: '#3f51b5' },
    art: { wall: ['#f3f9ec', '#dcedc8'], stripe: '#7cb342', base: '#e0cbaf', floor: '#b98d62', line: '#8d6239' },
    turtle: { wall: ['#e8f6f3', '#c5e8df'], stripe: '#26a69a', base: '#e0cbaf', floor: '#8d6e63', line: '#6d4c41' },
    kitchen: { wall: ['#eaf4fd', '#cfe5f8'], stripe: '#42a5f5', base: '#eceff1', floor: '#cfd8dc', line: '#90a4ae' },
    bedroom: { wall: ['#f1ecfa', '#ddd2f0'], stripe: '#7e57c2', base: '#e0cbaf', floor: '#c49a6c', line: '#9c6f43' },
    living: { wall: ['#fff3e0', '#ffe0b2'], stripe: '#fb8c00', base: '#e0cbaf', floor: '#8d6e63', line: '#6d4c41' },
    gym: { wall: ['#e3f6f9', '#bfe8ef'], stripe: '#26c6da', base: '#cfd8dc', floor: '#e8b96a', line: '#c08a3e' },
    class: { wall: ['#fffbe6', '#fff0b8'], stripe: '#f9a825', base: '#e0cbaf', floor: '#78909c', line: '#546e7a' },
    store: { wall: ['#fdeef2', '#f9d5df'], stripe: '#ec407a', base: '#eceff1', floor: '#b0bec5', line: '#78909c' },
  };

  // The wall, its stripes and the baseboard (what stands against the wall is drawn over these)...
  function wall(kind) {
    const c = ROOMS[kind] || ROOMS.home;
    return P.r(0, 0, 1000, 460, 0, G('wall-' + kind, c.wall)) +
      `<g opacity="0.07" stroke="${c.stripe}" stroke-linecap="round" stroke-width="26">` +
      [70, 200, 330, 460, 590, 720, 850, 970].map(sx => `<line x1="${sx}" x2="${sx}" y1="0" y2="460"/>`).join('') + '</g>' +
      P.r(0, 445, 1000, 18, 0, c.base, `stroke="${INK}" stroke-width="3.5"`);
  }

  // ...and the floor, with its boards running away from us
  function floor(kind) {
    const c = ROOMS[kind] || ROOMS.home;
    return P.r(0, 460, 1000, 190, 0, c.floor) + `<g opacity="0.45" stroke="${c.line}" stroke-width="4">` +
      [[120, 0], [280, 180], [440, 380], [600, 580], [760, 780], [920, 980]].map(([top, bottom]) => `<line x1="${top}" x2="${bottom}" y1="460" y2="650"/>`).join('') +
      '<line x1="0" x2="1000" y1="520" y2="520"/><line x1="0" x2="1000" y1="585" y2="585"/></g>';
  }

  const SKY = () => G('sky', [['#60a5fa', 0], ['#93c5fd', 0.55], ['#e0f2fe', 1]]);
  const SAND = () => G('sand', ['#fed7aa', '#fcd34d']);

  // The outdoors of S3a: sky, sun, clouds, hills, grass and a few bushes
  function outdoors() {
    return P.r(0, 0, 1000, 650, 0, SKY()) + P.c(56, 56, 44, '#fef08a', 'opacity=".45"') + P.c(56, 56, 30, '#fde047') +
      '<g fill="#ffffff"><ellipse cx="376" cy="182" opacity="0.85" rx="46" ry="15"/><ellipse cx="356" cy="175" opacity="0.92" rx="26" ry="21"/>' +
      '<ellipse cx="394" cy="176" opacity="0.88" rx="24" ry="16"/><ellipse cx="640" cy="146" opacity="0.85" rx="40" ry="13"/>' +
      '<ellipse cx="624" cy="140" opacity="0.92" rx="22" ry="18"/><ellipse cx="656" cy="141" opacity="0.88" rx="20" ry="14"/></g>' +
      P.p('M0 392Q170 316 340 368Q500 412 660 356Q840 300 1000 370L1000 650L0 650Z', G('hill', ['#86efac', '#4ade80'])) +
      P.p('M0 430Q500 410 1000 430L1000 650L0 650Z', G('grass', ['#4ade80', '#22c55e'])) +
      P.c(34, 440, 21, '#15803d') + P.c(58, 447, 16, '#16a34a') + P.c(28, 434, 4.5, '#fbbf24') +
      P.c(966, 440, 21, '#15803d') + P.c(942, 447, 16, '#16a34a') + P.c(972, 434, 4.5, '#f43f5e');
  }

  // A sandy path or pavement, as in S3a
  const sand = d => P.p(d, SAND(), 'stroke="#d97706" stroke-width="3" stroke-linejoin="round"');

  // ================= DOORS =================
  // The two doorways of S4: openings 200 wide (x 35-235 on the left, 765-965 on the right, y 65-450), each with
  // its frame and its door (hinged on the edge nearer the side of the picture). `side` is -1 (left) or 1.
  // Everything is drawn for the left door and mirrored for the right one, as in S4.
  const mirrored = (side, inner) => (side < 0 ? inner : `<g transform="translate(1000 0) scale(-1 1)">${inner}</g>`);

  // What shows through the doorway: the sunny path outside, or a hallway inside the house
  function doorView(side, beyond, kind) {
    const jamb = P.p('M35 65L48 78L48 438L35 450Z', '#000000', 'opacity=".15"') + P.p('M35 65L235 65L222 78L48 78Z', '#000000', 'opacity=".2"');
    if (beyond === 'outside') {
      return mirrored(side, P.r(35, 65, 200, 385, 0, SKY()) +
        (side < 0 ? P.c(75, 115, 32, '#fde047', 'opacity=".9"') + P.c(75, 115, 48, '#fef08a', 'opacity=".4"') : '') +
        P.e(160, 120, 30, 12, WHITE, 'opacity=".85"') + P.e(145, 115, 18, 15, WHITE, 'opacity=".9"') + P.e(175, 118, 20, 12, WHITE, 'opacity=".85"') +
        P.p('M30 310Q120 250 240 295L240 450L30 450Z', G('hill', ['#86efac', '#4ade80'])) +
        P.p('M30 350Q130 315 240 360L240 450L30 450Z', G('grass', ['#4ade80', '#22c55e'])) +
        P.c(65, 370, 18, '#15803d') + P.c(85, 375, 15, '#16a34a') + P.c(58, 368, 4.5, side < 0 ? '#fbbf24' : '#f43f5e') +
        P.c(195, 375, 16, '#15803d') + P.c(205, 370, 4, side < 0 ? '#f43f5e' : '#fbbf24') +
        P.p('M85 450L185 450L155 365L115 365Z', SAND(), 'stroke="#d97706" stroke-width="1.5"') + jamb);
    }
    // a hallway: its far wall, side walls and floor, in the room's own colours but dimmer
    const c = ROOMS[kind] || ROOMS.home;
    return mirrored(side, P.r(35, 65, 200, 385, 0, Look.blend(c.wall[1], '#6b4a2e', 0.2)) +
      P.p('M35 65L75 104V366L35 450Z', '#000000', 'opacity=".16"') + P.p('M235 65L195 104V366L235 450Z', '#000000', 'opacity=".1"') +
      P.p('M35 450L75 366H195L235 450Z', Look.blend(c.floor, '#000000', 0.22)) +
      P.r(75, 357, 120, 9, 0, Look.blend(c.base, '#6b4a2e', 0.25), `stroke="${INK}" stroke-width="2"`) +
      P.r(112, 150, 46, 58, 4, '#fff4e0', `stroke="${INK}" stroke-width="3"`) + P.r(120, 158, 30, 42, 2, Look.blend(c.stripe, '#ffffff', 0.45)) + jamb);
  }

  const doorFrame = side => mirrored(side, `<path d="M18 48L252 48L252 455L18 455ZM35 65L35 450L235 450L235 65Z" fill="#d98236" fill-rule="evenodd" stroke="${INK}" stroke-width="5.5"/>`);

  const doorLeaf = side => mirrored(side, P.r(35, 65, 200, 385, 7, '#e89b4f', `stroke="${INK}" stroke-width="4.5"`) +
    P.r(51, 85, 168, 155, 6, '#c9732b', `stroke="${INK}" stroke-width="3.5"`) + P.r(57, 91, 156, 143, 4, '#df8d41') +
    P.r(51, 255, 168, 175, 6, '#c9732b', `stroke="${INK}" stroke-width="3.5"`) + P.r(57, 261, 156, 163, 4, '#df8d41') +
    P.c(210, 256, 9.5, '#ffd54f', `stroke="${INK}" stroke-width="3.5"`) + P.c(207, 253, 3, '#fff9c4') + P.r(216, 254, 7, 4.5, 1.5, INK));

  // ================= THE TABLE =================
  // S4's table (740 wide, its top's front edge at y = 445), or the same table another size or height
  function table(cx = 500, w = 740, y = 445) {
    const x0 = cx - w / 2, x1 = cx + w / 2;
    const blur = Look.def('k-table-shadow', '<filter id="k-table-shadow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>');
    const drop = Look.def('k-drop', '<filter id="k-drop" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-opacity="0.18"/></filter>');
    const lined = `stroke="${INK}" stroke-width="5"`;
    return P.r(x0 + 100, y + 25, 26, 590 - y - 25, 6, '#8d5423', lined) + P.r(x1 - 126, y + 25, 26, 590 - y - 25, 6, '#8d5423', lined) +
      `<polygon points="${x0 + 35},580 ${x1 - 35},580 ${x1 + 2},622 ${x0 - 2},622" fill="#000000" opacity="0.22"${blur ? ` filter="${blur}"` : ''}/>` +
      P.r(x0 + 50, y + 35, 32, 615 - y - 35, 8, '#a05d28', lined) + P.r(x1 - 82, y + 35, 32, 615 - y - 35, 8, '#a05d28', lined) +
      P.r(x0 + 30, y + 20, w - 60, 28, 4, '#a05d28', lined) +
      `<g${drop ? ` filter="${drop}"` : ''}>` + P.r(x0, y, w, 30, 14, '#8d5423', `stroke="${INK}" stroke-width="5.5"`) +
      `<polygon points="${x0 - 10},${y} ${x0 + 30},${y - 25} ${x1 - 30},${y - 25} ${x1 + 10},${y}" fill="${G('table-top', ['#d48b47', '#b86d2b'])}" stroke="${INK}" stroke-linejoin="round" stroke-width="5.5"/>` +
      `<path d="M${x0 + 60} ${y - 13}L${x1 - 60} ${y - 13}" opacity="0.6" stroke="#f6be86" stroke-linecap="round" stroke-width="3"/></g>` +
      (w >= 500 ? P.r(x0 + 110, y - 15, w - 220, 14, 4, '#fff9c4', `stroke="${INK}" stroke-width="3"`) : '');
  }

  return { INK, O, KINDS, ROOMS, wall, floor, outdoors, sand, doorView, doorFrame, doorLeaf, table };
})();
