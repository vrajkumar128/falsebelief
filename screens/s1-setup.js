// S1. SET UP: a checklist for the grown-up before the child starts (a quiet spot, sound on with a test sound,
// full screen, and letting the child answer). "Go to the story" moves on to S2.
(() => {
  const markup = /* html */ `
    <section aria-labelledby="setup-title" class="screen setup-screen" data-screen="s1" id="screen-s1">
      <div class="setup-sheet">
        <h1 class="setup-title" id="setup-title">Before the story starts</h1>
        <p class="setup-lead">A few quick things for the grown-up to set up.</p>
        <ul class="setup-list">
          <li class="setup-item">
            <span aria-hidden="true" class="setup-icon" style="--badge: #bfe3ff"><span
                class="material-symbols-rounded">chair</span></span>
            <div class="setup-text">
              <h2>Find a quiet spot</h2>
              <p>Sit your child in front of the screen, away from TV, music and other noise.</p>
            </div>
          </li>
          <li class="setup-item">
            <span aria-hidden="true" class="setup-icon" style="--badge: #c6f0c2"><span
                class="material-symbols-rounded">volume_up</span></span>
            <div class="setup-text">
              <h2>Turn the sound on</h2>
              <p>Play the test sound (a chime, footsteps and a door), then set a volume your child can hear clearly.</p>
            </div>
            <button class="toy-button" id="test-sound-button" type="button">Play test sound</button>
          </li>
          <li class="setup-item" id="setup-fullscreen-item">
            <span aria-hidden="true" class="setup-icon" style="--badge: #ffd9b0"><span
                class="material-symbols-rounded">fullscreen</span></span>
            <div class="setup-text">
              <h2>Go full screen</h2>
              <p>It hides other tabs and windows, so there's less to distract.</p>
            </div>
            <button class="toy-button" id="fullscreen-button" type="button">Go full
              screen</button>
          </li>
          <li class="setup-item">
            <span aria-hidden="true" class="setup-icon" style="--badge: #f8d3e0"><span
                class="material-symbols-rounded">front_hand</span></span>
            <div class="setup-text">
              <h2>Let your child answer</h2>
              <p>Stay nearby to help with the screen, but please don't suggest answers.</p>
            </div>
          </li>
        </ul>
        <button class="toy-button toy-button--primary" id="setup-continue-button" type="button">Go to the story</button>
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
      ...[1100, 1450, 1800].map(t => setTimeout(() => Sounds.play('footstep', { surface: 'tile' }), t)),
      setTimeout(() => Sounds.play('doorClose'), 2350),
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
    screen.querySelector('#setup-continue-button').addEventListener('click', () => Storyline.next());
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
