// S1. SET UP: a checklist for the grown-up before the child starts (a quiet spot, sound on with a test sound,
// full screen, and letting the child answer). "Go to the story" moves on to S2. This page has text, because
// it is for the grown-up; nothing after it does.
(() => {
  const icon = (badge, shapes) => `<span aria-hidden="true" class="setup-icon" style="--badge: ${badge}">` +
    `<svg fill="#3a281e" viewBox="0 0 30 30">${shapes}</svg></span>`;
  const ICONS = {
    spot: icon('#cfe0f2', '<path d="M7 5h16a2 2 0 0 1 2 2v8H5V7a2 2 0 0 1 2-2Z"/><rect height="6" rx="2" width="24" x="3" y="15"/><rect height="4" rx="1" width="3" x="6" y="21"/><rect height="4" rx="1" width="3" x="21" y="21"/>'),
    sound: icon('#d5e8c8', '<path d="M4 11h5l7-6v20l-7-6H4Z"/><path d="M20 10a7 7 0 0 1 0 10M23.5 6.5a12 12 0 0 1 0 17" fill="none" stroke="#3a281e" stroke-linecap="round" stroke-width="2.6"/>'),
    full: icon('#f6dcbc', '<path d="M4 11V4h7M19 4h7v7M26 19v7h-7M11 26H4v-7" fill="none" stroke="#3a281e" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/>'),
    answer: icon('#f3d3dc', '<circle cx="15" cy="15" fill="none" r="10" stroke="#3a281e" stroke-dasharray="1 5.3" stroke-linecap="round" stroke-width="2.6"/><circle cx="15" cy="15" r="4.5"/>'),
  };

  const markup = /* html */ `
    <section aria-labelledby="setup-title" class="screen screen--page" data-screen="s1" id="screen-s1">
      <div class="sheet">
        <h1 id="setup-title">Before the story starts</h1>
        <p class="lead">A few quick things for the grown-up to set up. The story takes about 12 minutes.</p>
        <ul class="setup-list">
          <li class="setup-item">
            ${ICONS.spot}
            <div class="setup-text">
              <h2>Find a quiet spot</h2>
              <p>Sit your child in front of the screen, away from TV, music and other noise.</p>
            </div>
          </li>
          <li class="setup-item">
            ${ICONS.sound}
            <div class="setup-text">
              <h2>Turn the sound on</h2>
              <p>Play the test sound (a chime, footsteps and a door), then set a volume your child can hear clearly.</p>
            </div>
            <button class="paper-button" id="test-sound-button" type="button">Play test sound</button>
          </li>
          <li class="setup-item" id="setup-fullscreen-item">
            ${ICONS.full}
            <div class="setup-text">
              <h2>Go full screen</h2>
              <p>It hides other tabs and windows, so there's less to distract.</p>
            </div>
            <button class="paper-button" id="fullscreen-button" type="button">Go full screen</button>
          </li>
          <li class="setup-item">
            ${ICONS.answer}
            <div class="setup-text">
              <h2>Let your child answer</h2>
              <p>Your child answers by tapping a picture. Stay nearby to help with the screen, but please don't
                suggest answers. There are no right or wrong answers to worry about.</p>
            </div>
          </li>
        </ul>
        <button class="paper-button paper-button--primary" id="setup-continue-button" type="button">Go to the story</button>
      </div>
    </section>
  `;

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  // A short sample of the story's sounds (the "your turn" chime, a few footsteps, a door closing), so the volume
  // can be set for the quietest and loudest of them
  let testSoundTimers = [];
  function playTestSound() {
    testSoundTimers.forEach(clearTimeout);
    Sounds.play('prompt');
    testSoundTimers = [
      ...[1100, 1460, 1820].map(t => setTimeout(() => Sounds.play('step', { who: 'bear', surface: 'floor' }), t)),
      setTimeout(() => Sounds.play('doorClose'), 2400),
    ];
  }

  function toggleFullscreen() {
    const root = document.documentElement;
    const request = fullscreenElement()
      ? (document.exitFullscreen || document.webkitExitFullscreen).call(document)
      : (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    if (request && request.catch) request.catch(() => { });
  }

  function updateFullscreenButton() {
    document.getElementById('fullscreen-button').textContent =
      fullscreenElement() ? 'Exit full screen' : 'Go full screen';
  }

  function setup(screen) {
    screen.querySelector('#test-sound-button').addEventListener('click', playTestSound);
    screen.querySelector('#fullscreen-button').addEventListener('click', toggleFullscreen);
    screen.querySelector('#setup-continue-button').addEventListener('click', () => {
      Narration.unlock(); // this tap is what lets the voiceover play from here on
      Storyline.next();
    });
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
  }

  // The full-screen step is left out where the browser can't do it (e.g. iPhone)
  function enter() {
    const supported = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    document.getElementById('setup-fullscreen-item').hidden = !supported;
    updateFullscreenButton();
  }

  // Don't let the rest of the test sample play over the next screen
  function leave() {
    testSoundTimers.forEach(clearTimeout);
    testSoundTimers = [];
  }

  Storyline.addScreen({ id: 's1', markup, setup, enter, leave });
})();
