// The storyline: which screens play, in what order, and moving from one to the next.
//
// Each screen is a script in screens/ (with a matching .css) that registers itself:
//   Storyline.addScreen({
//     id,      // 's1', 's2', 's3a', ... as on the whiteboard
//     markup,  // the screen's <section class="screen" data-screen="<id>" id="screen-<id>"> ... </section>
//     setup,   // optional: runs once, after the markup is on the page (hook up buttons here)
//     enter,   // optional: runs each time the screen is shown
//     leave,   // optional: runs when the story moves on from it (stop timers here)
//   });
// A screen moves the story on by calling Storyline.next().
//
// To add a screen: create screens/<id>-<name>.js and .css, link both in index.html, and add its id to
// SCREEN_ORDER. While working on one screen, open index.html#<id> (for example index.html#s4) to start there.
const Storyline = (() => {
  const SCREEN_ORDER = ['s1', 's2', 's3a', 's4'];
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
    if (screen.enter) screen.enter();
    // Keyboard focus follows the story (not on first load, where it would only show a stray focus ring)
    const target = document.querySelector(`#screen-${id} [data-autofocus]`);
    if (target && !firstScreen) target.focus({ preventScroll: true });
  }

  function next() {
    const nextId = order[order.indexOf(currentId) + 1];
    if (nextId) show(nextId);
  }

  // Puts every screen on the stage (hidden), then shows the first one, or the one named in the URL (#s4)
  function start() {
    const stage = document.getElementById('game-stage');
    order = SCREEN_ORDER.filter(id => {
      if (screens[id]) return true;
      console.warn(`Storyline: no script in screens/ registered a screen called "${id}"`);
      return false;
    });
    order.forEach(id => {
      stage.insertAdjacentHTML('beforeend', screens[id].markup);
      const section = stage.lastElementChild;
      section.hidden = true;
      if (screens[id].setup) screens[id].setup(section);
    });
    const requested = location.hash.slice(1);
    show(order.includes(requested) ? requested : order[0]);
  }

  window.addEventListener('DOMContentLoaded', start);

  return {
    addScreen,
    show,
    next,
    get current() {
      return currentId;
    },
  };
})();
