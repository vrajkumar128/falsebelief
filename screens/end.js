// The end of the story: first everyone waves goodbye (for the child), then a page for the grown-up with the
// answers to save.
(() => {
  // BYE: the friends wave, one after another, and the narrator says goodbye (line end.1)
  Story.scene({
    id: 'bye', kind: 'bye', title: 'Goodbye',
    build(S) {
      Kit.outdoors(S);
      const friends = [['pig', 150], ['turtle', 325], ['bear', 500], ['duck', 675], ['rabbit', 850]]
        .map(([kind, x]) => S.cast(kind, { x, y: 604, k: 0.6 }));
      S.wait(0.5);
      S.par(() => S.say('end.1'), ...friends.map((friend, i) => () => {
        S.wait(0.25 + Math.abs(i - 2) * 0.3);
        friend.wave(i < 2 ? 'L' : 'R', 3);
        if (i === 2) friend.hop(22);
      }));
      S.wait(1);
    },
  });

  // END: for the grown-up
  const markup = /* html */ `
    <section aria-labelledby="end-title" class="screen screen--page" data-screen="end" id="screen-end">
      <div class="sheet">
        <h1 id="end-title">All done. Thank you!</h1>
        <p class="lead">That's the end of the story. If you were asked to send in the answers, save them here and
          send the file it gives you.</p>
        <div class="end-actions">
          <button class="paper-button paper-button--primary" id="end-save-button" type="button">Save the answers</button>
          <button class="paper-button" id="end-again-button" type="button">Start again</button>
        </div>
        <p class="end-note" id="end-note"></p>
      </div>
    </section>
  `;

  function setup(screen) {
    screen.querySelector('#end-save-button').addEventListener('click', () => Study.download());
    screen.querySelector('#end-again-button').addEventListener('click', () => {
      location.href = location.pathname + location.search;
    });
  }

  function enter() {
    Study.complete();
    const answered = Study.rows.length;
    document.getElementById('end-note').textContent =
      answered + (answered === 1 ? ' answer' : ' answers') + ' recorded' + (Study.pid ? ' for participant ' + Study.pid : '') + '.';
  }

  Storyline.addScreen({ id: 'end', markup, setup, enter });
})();
