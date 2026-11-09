// S3a. INTRODUCE MR. BEAR + ATTENTION CHECK: Mr. Bear pops up between a red school and a blue school and waves.
// The voiceover (not recorded yet) will say "Mr. Bear goes to the red school.", then ask "Which school does
// Mr. Bear attend?". There's no text on screen because the children can't read yet. Tapping either school or its
// button answers. The first answer is reported as an 'attentionCheckAnswered' event (with no right/wrong feedback
// on screen), then the story moves on to S4.
(() => {
  // What the voiceover will say, and when (ms after the screen opens). Until it's recorded, the lines are only
  // announced to screen readers; nothing is shown.
  const BEAR_INTRO = {
    statement: 'Mr. Bear goes to the red school.',
    question: 'Which school does Mr. Bear attend?',
    correctChoice: 'red',
    waveAt: 650,                // he has popped up and waves hello
    statementAt: 900,
    questionAt: 4400,           // the schools and their buttons can be chosen from here on
    nextScreenAfterAnswer: 1400,
  };

  const markup = /* html */ `
    <section aria-label="Mr. Bear and the two schools" class="screen" data-screen="s3a" id="screen-s3a">
      <p aria-live="polite" class="sr-only" id="s3a-narration"></p>
      <svg class="w-full h-full block s3-scene" id="s3a-svg" viewBox="0 0 1000 650" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="s3SkyGrad" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#60a5fa"></stop>
            <stop offset="55%" stop-color="#93c5fd"></stop>
            <stop offset="100%" stop-color="#e0f2fe"></stop>
          </linearGradient>
          <linearGradient id="s3HillGrad" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#86efac"></stop>
            <stop offset="100%" stop-color="#4ade80"></stop>
          </linearGradient>
          <linearGradient id="s3GrassGrad" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#4ade80"></stop>
            <stop offset="100%" stop-color="#22c55e"></stop>
          </linearGradient>
          <linearGradient id="s3PathGrad" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#fed7aa"></stop>
            <stop offset="100%" stop-color="#fcd34d"></stop>
          </linearGradient>
          <linearGradient id="s3BearBodyGrad" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#9d6b46"></stop>
            <stop offset="100%" stop-color="#7a4f2f"></stop>
          </linearGradient>
          <linearGradient id="s3BearMuzzleGrad" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#fae2be"></stop>
            <stop offset="100%" stop-color="#ecc99a"></stop>
          </linearGradient>
          <!-- One schoolhouse window (top-left at 0,0) with its sill -->
          <g id="s3-window">
            <rect fill="#fff6c8" height="40" rx="5" stroke="#2c1e14" stroke-width="4" width="46" x="0" y="0"></rect>
            <path d="M 23 0 L 23 40 M 0 20 L 46 20" stroke="#2c1e14" stroke-width="3"></path>
            <rect fill="#ffffff" height="11" opacity="0.9" rx="2.5" width="5" x="5" y="5"></rect>
            <rect fill="#fff4e0" height="7" rx="3" stroke="#2c1e14" stroke-width="3" width="56" x="-5" y="38"></rect>
          </g>
          <!-- Schoolhouse (ground at Y 0, centred on X 0). Both schools use this one drawing and differ only in the
               --wall / --roof colours passed in, so telling them apart is about colour alone -->
          <g id="s3-school-art">
            <!-- bell tower, behind the roof -->
            <rect height="68" rx="4" stroke="#2c1e14" stroke-width="5" style="fill: var(--wall)" width="52" x="-26"
              y="-318"></rect>
            <path d="M -15 -266 L -15 -290 A 15 15 0 0 1 15 -290 L 15 -266 Z" fill="#3b2a1e"></path>
            <path d="M -10 -270 C -10 -293, 10 -293, 10 -270 Z" fill="#ffd54f" stroke="#2c1e14"
              stroke-linejoin="round" stroke-width="2.5"></path>
            <path d="M -36 -316 L 0 -352 L 36 -316 Z" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5"
              style="fill: var(--roof)"></path>
            <!-- gable roof and the wall face inside it -->
            <path d="M -162 -188 L 0 -272 L 162 -188 Z" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5.5"
              style="fill: var(--roof)"></path>
            <path d="M -111 -192 L 0 -249 L 111 -192 Z" stroke="#2c1e14" stroke-linejoin="round" stroke-width="3.5"
              style="fill: var(--wall)"></path>
            <!-- walls, corner boards, cornice, base -->
            <rect height="180" rx="6" stroke="#2c1e14" stroke-width="5.5" style="fill: var(--wall)" width="270"
              x="-135" y="-180"></rect>
            <rect fill="#fff4e0" height="164" stroke="#2c1e14" stroke-width="3" width="14" x="-133" y="-178"></rect>
            <rect fill="#fff4e0" height="164" stroke="#2c1e14" stroke-width="3" width="14" x="119" y="-178"></rect>
            <rect fill="#fff4e0" height="16" rx="4" stroke="#2c1e14" stroke-width="4" width="292" x="-146" y="-192">
            </rect>
            <rect fill="#e0cbaf" height="14" rx="3" stroke="#2c1e14" stroke-width="4" width="270" x="-135" y="-14">
            </rect>
            <!-- clock in the gable -->
            <circle cx="0" cy="-216" fill="#fffdf5" r="18" stroke="#2c1e14" stroke-width="4"></circle>
            <path d="M 0 -216 L 0 -227 M 0 -216 L 8 -211" fill="none" stroke="#2c1e14" stroke-linecap="round"
              stroke-width="3.5"></path>
            <!-- windows -->
            <use href="#s3-window" x="-98" y="-160"></use>
            <use href="#s3-window" x="52" y="-160"></use>
            <use href="#s3-window" x="-98" y="-92"></use>
            <use href="#s3-window" x="52" y="-92"></use>
            <!-- arched double door and step -->
            <path d="M -30 0 L -30 -74 A 30 30 0 0 1 30 -74 L 30 0 Z" fill="#a05d28" stroke="#2c1e14"
              stroke-linejoin="round" stroke-width="5"></path>
            <path d="M -19 -74 A 19 19 0 0 1 19 -74 Z" fill="#fff6c8" stroke="#2c1e14" stroke-linejoin="round"
              stroke-width="3"></path>
            <path d="M 0 -74 L 0 0" stroke="#2c1e14" stroke-width="3"></path>
            <circle cx="-8" cy="-42" fill="#ffd54f" r="3.5" stroke="#2c1e14" stroke-width="2"></circle>
            <circle cx="8" cy="-42" fill="#ffd54f" r="3.5" stroke="#2c1e14" stroke-width="2"></circle>
            <rect fill="#e0cbaf" height="12" rx="3" stroke="#2c1e14" stroke-width="3.5" width="88" x="-44" y="-5">
            </rect>
          </g>
          <!-- Little school for the answer buttons (centred on 0,0) -->
          <g id="s3-school-icon">
            <rect fill="#ffffff" height="14" stroke="#2c1e14" stroke-width="3" width="10" x="-5" y="-25"></rect>
            <path d="M -19 17 L -19 -3 L 0 -16 L 19 -3 L 19 17 Z" fill="#ffffff" stroke="#2c1e14"
              stroke-linejoin="round" stroke-width="3.5"></path>
            <path d="M -5 17 L -5 7 A 5 5 0 0 1 5 7 L 5 17 Z" fill="#2c1e14"></path>
          </g>
        </defs>

        <!-- Outdoors: the same sky, hills and sandy path seen through the doorways in S4 -->
        <g aria-hidden="true" pointer-events="none">
          <rect fill="url(#s3SkyGrad)" height="650" width="1000" x="0" y="0"></rect>
          <circle cx="56" cy="56" fill="#fef08a" opacity="0.45" r="44"></circle>
          <circle cx="56" cy="56" fill="#fde047" r="30"></circle>
          <g fill="#ffffff">
            <ellipse cx="376" cy="182" opacity="0.85" rx="46" ry="15"></ellipse>
            <ellipse cx="356" cy="175" opacity="0.92" rx="26" ry="21"></ellipse>
            <ellipse cx="394" cy="176" opacity="0.88" rx="24" ry="16"></ellipse>
            <ellipse cx="640" cy="146" opacity="0.85" rx="40" ry="13"></ellipse>
            <ellipse cx="624" cy="140" opacity="0.92" rx="22" ry="18"></ellipse>
            <ellipse cx="656" cy="141" opacity="0.88" rx="20" ry="14"></ellipse>
          </g>
          <path d="M 0 392 Q 170 316 340 368 Q 500 412 660 356 Q 840 300 1000 370 L 1000 650 L 0 650 Z"
            fill="url(#s3HillGrad)"></path>
          <path d="M 0 430 Q 500 410 1000 430 L 1000 650 L 0 650 Z" fill="url(#s3GrassGrad)"></path>
          <!-- bushes beside the schools -->
          <circle cx="34" cy="440" fill="#15803d" r="21"></circle>
          <circle cx="58" cy="447" fill="#16a34a" r="16"></circle>
          <circle cx="28" cy="434" fill="#fbbf24" r="4.5"></circle>
          <circle cx="336" cy="446" fill="#15803d" r="18"></circle>
          <circle cx="352" cy="438" fill="#f43f5e" r="4"></circle>
          <circle cx="664" cy="446" fill="#15803d" r="18"></circle>
          <circle cx="652" cy="440" fill="#fbbf24" r="4"></circle>
          <circle cx="966" cy="440" fill="#15803d" r="21"></circle>
          <circle cx="942" cy="447" fill="#16a34a" r="16"></circle>
          <circle cx="972" cy="434" fill="#f43f5e" r="4.5"></circle>
          <!-- path forking from where Mr. Bear stands to each school's door -->
          <path
            d="M 404 650 C 396 560, 250 512, 164 440 L 216 440 C 300 496, 468 520, 500 548 C 532 520, 700 496, 784 440 L 836 440 C 750 512, 604 560, 596 650 Z"
            fill="url(#s3PathGrad)" stroke="#d97706" stroke-linejoin="round" stroke-width="3"></path>
        </g>

        <!-- RED SCHOOL (left) -->
        <g transform="translate(190 440) scale(0.92)">
          <g aria-hidden="true" class="s3-choice" data-choice="red">
            <rect class="s3-glow" fill="none" height="386" opacity="0" rx="56" stroke="#ffeb3b" stroke-width="9"
              width="352" x="-176" y="-366"></rect>
            <use href="#s3-school-art" style="--wall: #e53935; --roof: #b71c1c"></use>
          </g>
        </g>
        <!-- BLUE SCHOOL (right) -->
        <g transform="translate(810 440) scale(0.92)">
          <g aria-hidden="true" class="s3-choice" data-choice="blue">
            <rect class="s3-glow" fill="none" height="386" opacity="0" rx="56" stroke="#ffeb3b" stroke-width="9"
              width="352" x="-176" y="-366"></rect>
            <use href="#s3-school-art" style="--wall: #1e88e5; --roof: #0d47a1"></use>
          </g>
        </g>

        <!-- MR. BEAR: the S4 bear art (same coordinates), scaled down to stand where the path forks -->
        <g aria-hidden="true" pointer-events="none" transform="translate(190 238.5) scale(0.62)">
          <g class="s3-bear" id="s3a-bear">
            <!-- legs -->
            <ellipse cx="440" cy="565" fill="#000000" opacity="0.2" rx="35" ry="12"></ellipse>
            <ellipse cx="560" cy="565" fill="#000000" opacity="0.2" rx="35" ry="12"></ellipse>
            <path d="M420 440 L415 540 C415 558, 465 558, 465 540 L460 440 Z" fill="url(#s3BearBodyGrad)"
              stroke="#2c1e14" stroke-linejoin="round" stroke-width="5.5"></path>
            <ellipse cx="438" cy="552" fill="url(#s3BearBodyGrad)" rx="32" ry="15" stroke="#2c1e14" stroke-width="5">
            </ellipse>
            <ellipse cx="438" cy="553" fill="#f8bbd0" rx="15" ry="9" stroke="#2c1e14" stroke-width="1.5"></ellipse>
            <circle cx="423" cy="544" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="436" cy="541" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="449" cy="544" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <path d="M540 440 L535 540 C535 558, 585 558, 585 540 L580 440 Z" fill="url(#s3BearBodyGrad)"
              stroke="#2c1e14" stroke-linejoin="round" stroke-width="5.5"></path>
            <ellipse cx="562" cy="552" fill="url(#s3BearBodyGrad)" rx="32" ry="15" stroke="#2c1e14" stroke-width="5">
            </ellipse>
            <ellipse cx="562" cy="553" fill="#f8bbd0" rx="15" ry="9" stroke="#2c1e14" stroke-width="1.5"></ellipse>
            <circle cx="551" cy="544" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="564" cy="541" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="577" cy="544" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <!-- ears -->
            <g class="anim-ear-l">
              <circle cx="430" cy="180" fill="url(#s3BearBodyGrad)" r="34" stroke="#2c1e14" stroke-width="5"></circle>
              <circle cx="430" cy="180" fill="#f8bbd0" r="18" stroke="#2c1e14" stroke-width="3"></circle>
            </g>
            <g class="anim-ear-r">
              <circle cx="570" cy="180" fill="url(#s3BearBodyGrad)" r="34" stroke="#2c1e14" stroke-width="5"></circle>
              <circle cx="570" cy="180" fill="#f8bbd0" r="18" stroke="#2c1e14" stroke-width="3"></circle>
            </g>
            <!-- torso and head -->
            <ellipse cx="500" cy="380" fill="url(#s3BearBodyGrad)" rx="122" ry="125" stroke="#2c1e14" stroke-width="6">
            </ellipse>
            <ellipse cx="500" cy="385" fill="url(#s3BearMuzzleGrad)" opacity="0.9" rx="65" ry="70" stroke="#2c1e14"
              stroke-width="4"></ellipse>
            <circle cx="500" cy="240" fill="url(#s3BearBodyGrad)" r="88" stroke="#2c1e14" stroke-width="6"></circle>
            <ellipse cx="445" cy="265" fill="#ff8a80" opacity="0.65" rx="14" ry="9"></ellipse>
            <ellipse cx="555" cy="265" fill="#ff8a80" opacity="0.65" rx="14" ry="9"></ellipse>
            <ellipse cx="500" cy="265" fill="url(#s3BearMuzzleGrad)" rx="46" ry="34" stroke="#2c1e14"
              stroke-width="4.5"></ellipse>
            <path d="M485 246 C485 240, 515 240, 515 246 C515 258, 485 258, 485 246 Z" fill="#2c1e14"></path>
            <ellipse cx="495" cy="245" fill="#ffffff" rx="4" ry="2"></ellipse>
            <path d="M487 271 Q500 293 513 271 Z" fill="#d32f2f" stroke="#2c1e14" stroke-width="3"></path>
            <path d="M485 268 Q500 274 515 268" fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="4">
            </path>
            <path d="M492 284 Q500 281 508 284" fill="#ff8a80"></path>
            <g class="anim-blink">
              <ellipse cx="468" cy="225" fill="#2c1e14" rx="11" ry="15"></ellipse>
              <ellipse cx="465" cy="220" fill="#ffffff" rx="4.5" ry="6.5"></ellipse>
              <circle cx="472" cy="230" fill="#ffffff" r="2.5"></circle>
              <ellipse cx="532" cy="225" fill="#2c1e14" rx="11" ry="15"></ellipse>
              <ellipse cx="529" cy="220" fill="#ffffff" rx="4.5" ry="6.5"></ellipse>
              <circle cx="536" cy="230" fill="#ffffff" r="2.5"></circle>
            </g>
            <path d="M455 204 Q468 196 480 203" fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="4">
            </path>
            <path d="M520 203 Q532 196 545 204" fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="4">
            </path>
            <path d="M492 154 Q500 138 506 153 Q512 142 516 156" fill="url(#s3BearBodyGrad)" stroke="#2c1e14"
              stroke-width="4"></path>
            <!-- his left arm (screen right), resting -->
            <path
              d="M 557.6 341.5 A 27 27 0 0 1 606.4 318.5 C 617 345, 632 368, 638.7 393.7 L 595.3 414.3 C 586 390, 570 365, 557.6 341.5 Z"
              fill="url(#s3BearBodyGrad)" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5"></path>
            <circle cx="617" cy="404" fill="url(#s3BearBodyGrad)" r="24" stroke="#2c1e14" stroke-width="5"></circle>
            <ellipse cx="617" cy="404" fill="#f8bbd0" rx="13" ry="11"></ellipse>
            <circle cx="634" cy="391" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="626" cy="382" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="612" cy="381" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <!-- his right arm (screen left), waving -->
            <g class="s3-wave-arm">
              <path
                d="M 442.4 341.5 A 27 27 0 0 0 393.6 318.5 C 383 345, 368 368, 361.3 393.7 L 404.7 414.3 C 414 390, 430 365, 442.4 341.5 Z"
                fill="url(#s3BearBodyGrad)" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5"></path>
              <circle cx="383" cy="404" fill="url(#s3BearBodyGrad)" r="24" stroke="#2c1e14" stroke-width="5"></circle>
              <g class="s3-wave-pad">
                <ellipse cx="383" cy="404" fill="#f8bbd0" rx="13" ry="11"></ellipse>
                <circle cx="366" cy="391" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
                <circle cx="374" cy="382" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
                <circle cx="388" cy="381" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
              </g>
            </g>
          </g>
        </g>

        <!-- Answer buttons, one under each school: its colour and a little school, no words -->
        <g class="s3-answers" id="s3a-answers">
          <g transform="translate(190 594)">
            <g class="s3-answer-reveal">
              <g aria-disabled="true" aria-label="Red school" class="s3-answer" data-choice="red" role="button"
                tabindex="-1">
                <rect class="s3-answer-focus" height="96" rx="48" width="196" x="-98" y="-50"></rect>
                <rect fill="#2c1e14" height="68" rx="34" width="170" x="-85" y="-29"></rect>
                <g class="s3-answer-top">
                  <rect fill="#d32f2f" height="68" rx="34" stroke="#2c1e14" stroke-width="5" width="170" x="-85"
                    y="-37"></rect>
                  <use href="#s3-school-icon" transform="translate(0 1.8) scale(1.2)"></use>
                </g>
              </g>
            </g>
          </g>
          <g transform="translate(810 594)">
            <g class="s3-answer-reveal">
              <g aria-disabled="true" aria-label="Blue school" class="s3-answer" data-choice="blue" role="button"
                tabindex="-1">
                <rect class="s3-answer-focus" height="96" rx="48" width="196" x="-98" y="-50"></rect>
                <rect fill="#2c1e14" height="68" rx="34" width="170" x="-85" y="-29"></rect>
                <g class="s3-answer-top">
                  <rect fill="#1976d2" height="68" rx="34" stroke="#2c1e14" stroke-width="5" width="170" x="-85"
                    y="-37"></rect>
                  <use href="#s3-school-icon" transform="translate(0 1.8) scale(1.2)"></use>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </section>
  `;

  let introTimeouts = [];
  let introAsking = false;
  let introQuestionShownAt = 0;

  function introSchedule(fn, delay) {
    introTimeouts.push(setTimeout(fn, delay));
  }

  function clearIntroTimeouts() {
    introTimeouts.forEach(t => clearTimeout(t));
    introTimeouts = [];
  }

  // Stand-in for the voiceover: the line goes to screen readers only (it isn't shown)
  function sayLine(text) {
    document.getElementById('s3a-narration').textContent = text;
  }

  function setSchoolGlow(choice, opacity) {
    document.querySelector(`#s3a-svg .s3-choice[data-choice="${choice}"] .s3-glow`).setAttribute('opacity', opacity);
  }

  function setIntroAsking(asking) {
    introAsking = asking;
    document.getElementById('s3a-svg').classList.toggle('is-asking', asking);
    document.querySelectorAll('#s3a-svg .s3-answer').forEach(button => {
      button.setAttribute('tabindex', asking ? '0' : '-1');
      button.setAttribute('aria-disabled', String(!asking));
    });
  }

  function enter() {
    clearIntroTimeouts();
    setIntroAsking(false);
    const svg = document.getElementById('s3a-svg');
    svg.classList.remove('is-answered');
    svg.querySelectorAll('.is-chosen').forEach(el => el.classList.remove('is-chosen'));
    setSchoolGlow('red', 0);
    setSchoolGlow('blue', 0);
    document.getElementById('s3a-answers').classList.remove('is-shown');
    sayLine('');

    // Mr. Bear pops up where the path forks (not from either side, so neither school is hinted), then waves
    const bear = document.getElementById('s3a-bear');
    bear.classList.remove('is-entering', 'is-waving');
    void bear.getBoundingClientRect();
    bear.classList.add('is-entering');
    Sounds.play('cookieLift');
    introSchedule(() => bear.classList.add('is-waving'), BEAR_INTRO.waveAt);
    introSchedule(() => sayLine(BEAR_INTRO.statement), BEAR_INTRO.statementAt);
    introSchedule(askIntroQuestion, BEAR_INTRO.questionAt);
  }

  function askIntroQuestion() {
    sayLine(BEAR_INTRO.question);
    document.getElementById('s3a-answers').classList.add('is-shown');
    // The same brief guide ring on both schools as on both jars in S4, so neither one is suggested
    setSchoolGlow('red', 0.6);
    setSchoolGlow('blue', 0.6);
    introSchedule(() => {
      if (!introAsking) return;
      setSchoolGlow('red', 0);
      setSchoolGlow('blue', 0);
    }, 750);
    Sounds.play('prompt');
    setIntroAsking(true);
    introQuestionShownAt = performance.now();
  }

  // First answer only: neutral highlight (no right/wrong feedback), report it, then go on to the next screen
  function chooseSchool(choice) {
    if (!introAsking) return;
    setIntroAsking(false);
    Sounds.play('select');
    const svg = document.getElementById('s3a-svg');
    svg.classList.add('is-answered');
    svg.querySelector(`.s3-answer[data-choice="${choice}"]`).classList.add('is-chosen');
    setSchoolGlow('red', choice === 'red' ? 0.85 : 0);
    setSchoolGlow('blue', choice === 'blue' ? 0.85 : 0);

    window.dispatchEvent(new CustomEvent('attentionCheckAnswered', {
      detail: {
        screen: 's3a',
        character: 'bear',
        question: BEAR_INTRO.question,
        choice: choice,
        correct: choice === BEAR_INTRO.correctChoice,
        responseTimeMs: Math.round(performance.now() - introQuestionShownAt),
      },
    }));
    introSchedule(() => Storyline.next(), BEAR_INTRO.nextScreenAfterAnswer);
  }

  // Both schools and both answer buttons carry data-choice; the buttons also answer to Enter / Space
  function setup(screen) {
    screen.querySelectorAll('[data-choice]').forEach(el => {
      el.addEventListener('click', () => chooseSchool(el.dataset.choice));
      el.addEventListener('mouseenter', () => {
        if (introAsking) Sounds.play('hover');
      });
      if (el.getAttribute('role') === 'button') {
        el.addEventListener('keydown', event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          chooseSchool(el.dataset.choice);
        });
      }
    });
  }

  Storyline.addScreen({ id: 's3a', markup, setup, enter, leave: clearIntroTimeouts });
})();
