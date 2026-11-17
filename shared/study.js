// The study's settings, which side each answer goes on, and the log of the child's answers.
//
// SETTINGS (edit here, or override in the address bar):
//   realityChecks  on the screens after S4: after each test question, also ask what is really true now ("What
//                  does the drawing really show now?"). A child who gets that wrong wasn't following the
//                  story, so their test answer can't be read as a false-belief answer. Address bar: ?reality=0.
//   voiceover      set enabled to true once the recordings are in the folder (index.html#script lists the
//                  lines and file names). Until then each line is given a silent pause of about its length.
//   repromptAfter  seconds without an answer before a question is asked again.
//
// ADDRESS BAR:
//   ?pid=ABC       participant id, saved with every answer; it also fixes the left/right layout for that child
//   ?seed=123      fixes the left/right layout without naming a participant
//   ?dev           review tools: captions, a clock, keys (space pause, arrows +-1 s, N / B next / back)
//   ?dev&at=12.5   shows that moment of a screen after S4 and stays there (with #s10, say, to pick the screen)
//   ?dev&sheet=12  lays that many moments of a screen side by side (or ?dev&sheet=2,5.5,9 for those moments)
//   ?dev&ask=1     jumps to a screen's first question (2 = its second...); add &pick=left to tap an answer
//   ?captions      show the narration as text (for grown-ups reviewing; children's screens never show text)
//   ?speed=4       play the screens after S4 faster, for reviewing
//   #s10           start on a given screen
const STUDY = {
  realityChecks: true,
  voiceover: { enabled: false, folder: 'audio/', type: 'mp3' },
  repromptAfter: 12,
};

const Study = (() => {
  const params = new URLSearchParams(location.search);
  const pid = params.get('pid') || '';
  const seed = params.get('seed') || pid || String(Math.floor(Math.random() * 1e9));
  const flags = {
    dev: params.has('dev'),
    captions: params.has('captions') || params.has('dev'),
    speed: Math.max(0.25, Math.min(20, parseFloat(params.get('speed')) || 1)),
    at: params.has('at') ? parseFloat(params.get('at')) : null,
    sheet: params.get('sheet') || '',
    ask: parseInt(params.get('ask'), 10) || 0,
    pick: params.get('pick') || '',
  };
  if (params.has('reality')) STUDY.realityChecks = params.get('reality') !== '0';
  if (params.has('voice')) STUDY.voiceover.enabled = params.get('voice') !== '0';

  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // A small repeatable random number generator, so the same seed always gives the same layout
  function randomFrom(text) {
    let a = hash(text);
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // WHICH SIDE (the screens after S4): every question has two answers, written in its screen as [first,
  // second]. For half of the test trials and half of the attention checks the first answer is on the left, for
  // the other half on the right, in an order shuffled per child (never more than three in a row on one side).
  // So always tapping one side scores about half, and nothing about a side predicts the right answer.
  // (S3a and S4 are drawn one way round: the red school and the blue jar are always on the left.)
  let sides = null;
  function assignSides(screens) {
    const random = randomFrom('sides:' + seed);
    sides = {};
    ['attention', 'test'].forEach(kind => {
      const ids = screens.filter(s => s && s.kind === kind).map(s => s.id);
      let marks;
      for (let tries = 0; tries < 200; tries++) {
        marks = ids.map((_, i) => i < Math.floor(ids.length / 2));
        if (ids.length % 2) marks[ids.length - 1] = random() < 0.5;
        for (let i = marks.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [marks[i], marks[j]] = [marks[j], marks[i]];
        }
        if (!marks.some((mark, i) => i >= 3 && marks[i - 1] === mark && marks[i - 2] === mark && marks[i - 3] === mark)) break;
      }
      ids.forEach((id, i) => { sides[id] = marks[i]; });
    });
  }

  function firstOnLeft(screenId) {
    return sides && screenId in sides ? sides[screenId] : true;
  }

  // ANSWERS: one row per question answered, in order
  const rows = [];
  const startedAt = Date.now();
  const storageKey = 'false-belief-study:' + (pid || seed) + ':' + startedAt;
  const COLUMNS = ['n', 'pid', 'seed', 'screen', 'kind', 'question', 'asked', 'left', 'right', 'choice', 'side',
    'correctAnswer', 'correct', 'rtMs', 'reprompts', 'sinceStartMs', 'at'];

  function tell(type, detail) {
    window.dispatchEvent(new CustomEvent(type, { detail }));
    // When the study is embedded in a survey page, that page hears about every answer too
    if (window.parent !== window) window.parent.postMessage({ source: 'false-belief-study', type, detail }, '*');
  }

  function record(answer) {
    const row = Object.assign({ n: rows.length + 1, pid, seed }, answer, {
      sinceStartMs: Date.now() - startedAt,
      at: new Date().toISOString(),
    });
    rows.push(row);
    try {
      localStorage.setItem(storageKey, JSON.stringify(rows));
    } catch (e) { /* private browsing: the rows are still in memory and in the events */ }
    tell('studyResponse', row);
    return row;
  }

  // S3a AND S4 announce their answers as events of their own ('attentionCheckAnswered', 'jarSelected'). Each
  // is written in the log like the others. S4's is scored as the false-belief question it is: Mr. Bear put his
  // cookie in the blue jar (the left one) and did not see it moved, so blue is where he thinks it is.
  // S4 used to be the last screen, so it does not move on by itself: that is done here, a moment after the tap.
  window.addEventListener('attentionCheckAnswered', event => {
    const d = event.detail || {};
    record({
      screen: d.screen || 's3a', kind: 'attention', question: 's3a.q', asked: d.question || '',
      left: 'red', right: 'blue', choice: d.choice, side: d.choice === 'red' ? 'left' : 'right',
      correctAnswer: 'red', correct: d.correct ? 1 : 0, rtMs: d.responseTimeMs, reprompts: 0,
    });
  });
  window.addEventListener('jarSelected', event => {
    const d = event.detail || {};
    if (Storyline.current !== 's4') return;
    record({
      screen: 's4', kind: 'test', question: 's4.q', asked: 'Where does Mr. Bear think his cookie is?',
      left: 'blue', right: 'red', choice: d.side === 'left' ? 'blue' : 'red', side: d.side,
      correctAnswer: 'blue', correct: d.side === 'left' ? 1 : 0, rtMs: d.responseTimeMs, reprompts: 0,
    });
    setTimeout(() => {
      if (Storyline.current === 's4') Storyline.next();
    }, 1400);
  });

  function csv() {
    const cell = value => {
      const text = value === undefined || value === null ? '' : String(value);
      return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
    };
    return [COLUMNS.join(',')].concat(rows.map(row => COLUMNS.map(c => cell(row[c])).join(','))).join('\n');
  }

  function download() {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv()], { type: 'text/csv' }));
    link.download = 'false-belief-' + (pid || seed) + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  }

  function summary() {
    const of = kind => rows.filter(r => r.kind === kind);
    const right = list => list.filter(r => r.correct === 1).length;
    return {
      test: [right(of('test')), of('test').length],
      attention: [right(of('attention')), of('attention').length],
      reality: [right(of('reality')), of('reality').length],
    };
  }

  function complete() {
    tell('studyComplete', { pid, seed, rows: rows.slice(), summary: summary() });
  }

  return { pid, seed, flags, assignSides, firstOnLeft, record, rows, csv, download, summary, complete };
})();
