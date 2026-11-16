// S2. READY: just the big green button, with no text on screen because the children can't read yet. The
// narrator says line s2.1 ("We're going to tell you a story today! Press the green button when you're ready!").
// Pressing the button starts the story.
(() => {
  const markup = /* html */ `
    <section aria-label="Ready to start the story" class="screen ready-screen" data-screen="s2" id="screen-s2">
      <button aria-label="I'm ready" class="go-button" data-autofocus id="go-button" type="button">
        <svg aria-hidden="true" viewBox="-112 -108 224 228">
          <circle cx="0" cy="10" fill="#356d37" r="100"></circle>
          <circle cx="0" cy="0" fill="#4c9a4e" r="100"></circle>
          <path d="M-24 -42L50 0L-24 42Z" fill="#fffdf7" stroke="#fffdf7" stroke-linejoin="round" stroke-width="12"></path>
        </svg>
      </button>
    </section>
  `;

  let sayTimer = null;

  function setup(screen) {
    const button = screen.querySelector('#go-button');
    button.addEventListener('click', pressGoButton);
    // The same soft tick as pointing at an answer later on
    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && !button.disabled) Sounds.play('hover');
    });
  }

  function enter() {
    const button = document.getElementById('go-button');
    button.disabled = false;
    button.classList.remove('is-pressed');
    sayTimer = setTimeout(() => Narration.play('s2.1'), 500);
  }

  function leave() {
    clearTimeout(sayTimer);
    Narration.stop();
  }

  function pressGoButton() {
    const button = document.getElementById('go-button');
    if (button.disabled) return;
    button.disabled = true;
    button.classList.add('is-pressed');
    Sounds.play('select');
    Narration.unlock();
    setTimeout(() => Storyline.next(), 320);
  }

  Storyline.addScreen({ id: 's2', markup, setup, enter, leave });
})();
