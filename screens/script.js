// The voiceover script, as a page: open index.html#script. It lists every narration line of the screens after
// S4 (from shared/narration.js, so it is always up to date), the name to give its recording, and about how long
// the story currently waits for it. It isn't part of the story; nothing links to it. (S3a's two lines are in
// screens/s3a-bear-intro.js; S4 has none of its own.)
(() => {
  const markup = /* html */ `
    <section aria-labelledby="script-title" class="screen setup-screen script-screen" data-screen="script" id="screen-script">
      <div class="setup-sheet">
        <h1 class="setup-title" id="script-title">Voiceover script</h1>
        <p class="setup-lead">Record one file per line, named as shown, and put the files in the <code>audio</code> folder. Then
          set <code>STUDY.voiceover.enabled</code> to <code>true</code> in <code>shared/study.js</code>. Each of these screens waits
          exactly as long as its recordings last, so read at whatever pace suits the children. The wording lives in
          <code>shared/narration.js</code>.</p>
        <table class="script-table">
          <thead><tr><th scope="col">File</th><th scope="col">Line</th><th scope="col">Waits about</th></tr></thead>
          <tbody id="script-rows"></tbody>
        </table>
      </div>
    </section>
  `;

  const KINDS = { attention: 'attention check', test: 'test trial' };

  function enter() {
    const body = document.getElementById('script-rows');
    body.textContent = '';
    let screen = null;
    Object.keys(NARRATION).forEach(id => {
      const from = id.split('.')[0];
      if (from !== screen) {
        screen = from;
        const about = Storyline.screens[from] || {};
        const heading = body.insertRow();
        heading.className = 'script-screen-row';
        const cell = heading.insertCell();
        cell.colSpan = 3;
        cell.textContent = from.toUpperCase() + (about.title ? ': ' + about.title : '') + (KINDS[about.kind] ? ' (' + KINDS[about.kind] + ')' : '');
      }
      const row = body.insertRow();
      row.insertCell().innerHTML = '<code>' + Narration.file(id) + '</code>';
      row.insertCell().textContent = NARRATION[id];
      row.insertCell().textContent = Narration.duration(id).toFixed(1) + ' s';
    });
  }

  Storyline.addScreen({ id: 'script', markup, enter });
})();
