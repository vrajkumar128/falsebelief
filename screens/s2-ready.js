// S2. READY: just the big green button, with no text on screen because the children can't read yet. The
// voiceover (not recorded yet) will say "We're going to tell you a story today! Press the green button when
// you're ready!". Pressing the button starts the story (S3a).
(() => {
  const markup = /* html */ `
    <section aria-label="Ready to start the story" class="screen ready-screen" data-screen="s2" id="screen-s2">
      <button aria-label="I'm ready" class="go-button" data-autofocus id="go-button" type="button">
        <span class="go-button__base"></span>
        <span class="go-button__face">
          <svg aria-hidden="true" viewBox="0 0 100 100">
            <path d="M 21 45 A 30 30 0 0 1 40 22" fill="none" opacity="0.75" stroke="#e8f5e9"
              stroke-linecap="round" stroke-width="6"></path>
            <path d="M 40 31 L 71 50 L 40 69 Z" fill="#ffffff" stroke="#2c1e14" stroke-linejoin="round"
              stroke-width="6"></path>
          </svg>
        </span>
      </button>
    </section>
  `;

  function setup(screen) {
    screen.querySelector('#go-button').addEventListener('click', pressGoButton);
  }

  function enter() {
    const button = document.getElementById('go-button');
    button.disabled = false;
    button.classList.remove('is-pressed');
  }

  function pressGoButton() {
    const button = document.getElementById('go-button');
    if (button.disabled) return;
    button.disabled = true;
    button.classList.add('is-pressed');
    Sounds.play('select');
    setTimeout(() => Storyline.next(), 280);
  }

  Storyline.addScreen({ id: 's2', markup, setup, enter });
})();
