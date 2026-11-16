// The storyline: which screens play, in what order, and moving from one to the next.
//
// Each screen is a script in screens/ that registers itself. Story screens do it with Story.scene({...})
// (shared/engine.js), which draws and animates them; the grown-up pages register directly:
//   Storyline.addScreen({
//     id,      // 's1', 'a3', 't5', ... (a = attention check, t = test trial)
//     kind,    // 'attention' | 'test' for story screens, nothing for the others
//     markup,  // the screen's <section class="screen" data-screen="<id>" id="screen-<id>"> ... </section>
//     setup,   // optional: runs once, after the markup is on the page (hook up buttons here)
//     enter,   // optional: runs each time the screen is shown
//     leave,   // optional: runs when the story moves on from it (stop timers here)
//   });
// A screen moves the story on by calling Storyline.next().
//
// To add a screen: create screens/<id>-<name>.js, add a <script> for it in index.html, and add its id to
// SCREEN_ORDER. To look at one screen on its own, open index.html#<id> (for example index.html#t4).
const Storyline = (() => {
  // Attention checks and test trials take turns, so two "trick" stories never come back to back
  const SCREEN_ORDER = ['s1', 's2',
    'a1', 't1', 'a2', 't2', 'a3', 't3', 'a4', 't4', 'a5', 't5', 'a6', 't6', 'a7', 't7', 'a8', 't8',
    'bye', 'end'];
  const screens = {};
  let order = [];
  let currentId = null;

  function addScreen(screen) {
    screens[screen.id] = screen;
  }

  function show(id) {
    const screen = screens[id];
    if (!screen) return;
    const leaving = screens[currentId];
    if (leaving && leaving.leave) leaving.leave();
    const firstScreen = currentId === null;
    currentId = id;
    document.querySelectorAll('#game-stage > .screen').forEach(section => {
      section.hidden = section.dataset.screen !== id;
    });
    // Each screen fades in from the paper-coloured stage
    const section = document.getElementById('screen-' + id);
    if (section && !firstScreen) {
      section.classList.add('is-entering');
      section.getBoundingClientRect();
      section.classList.remove('is-entering');
    }
    if (screen.enter) screen.enter();
    // Keyboard focus follows the story (not on first load, where it would only show a stray focus ring)
    const target = document.querySelector(`#screen-${id} [data-autofocus]`);
    if (target && !firstScreen) target.focus({ preventScroll: true });
    if (Study.flags.dev) history.replaceState(null, '', '#' + id);
  }

  function step(by) {
    const nextId = order[order.indexOf(currentId) + by];
    if (nextId) show(nextId);
  }

  // Puts every screen on the stage (hidden), then shows the first one, or the one named in the address (#t4)
  function start() {
    const stage = document.getElementById('game-stage');
    order = SCREEN_ORDER.filter(id => {
      if (screens[id]) return true;
      console.warn(`Storyline: no script in screens/ registered a screen called "${id}"`);
      return false;
    });
    Study.assignSides(order.map(id => screens[id]));
    Object.keys(screens).forEach(id => {
      stage.insertAdjacentHTML('beforeend', screens[id].markup);
      const section = stage.lastElementChild;
      section.hidden = true;
      if (screens[id].setup) screens[id].setup(section);
    });
    Narration.load();
    const requested = location.hash.slice(1);
    show(screens[requested] ? requested : order[0]);
  }

  window.addEventListener('DOMContentLoaded', start);

  return {
    addScreen,
    show,
    next: () => step(1),
    back: () => step(-1),
    screens,
    get order() {
      return order.slice();
    },
    get current() {
      return currentId;
    },
  };
})();
