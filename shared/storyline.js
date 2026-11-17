// The storyline: which screens play, in what order, and moving from one to the next.
//
// Each screen is a script in screens/ (with a matching .css) that registers itself:
//   Storyline.addScreen({
//     id,      // 's1', 's2', 's3a', ... as on the whiteboard
//     kind,    // optional: 'attention' or 'test' for the screens that ask a question
//     markup,  // the screen's <section class="screen" data-screen="<id>" id="screen-<id>"> ... </section>
//     setup,   // optional: runs once, after the markup is on the page (hook up buttons here)
//     enter,   // optional: runs each time the screen is shown
//     leave,   // optional: runs when the story moves on from it (stop timers here)
//   });
// A screen moves the story on by calling Storyline.next().
//
// S1 to S4 are each drawn and animated by hand in their own script and stylesheet. The screens after S4 are
// written as stage directions with Story.scene({...}) (shared/engine.js), which registers them here.
//
// To add a screen: create screens/<id>-<name>.js (and a .css, if it has styles of its own), link it in
// index.html, and add its id to SCREEN_ORDER. While working on one screen, open index.html#<id> (for example
// index.html#s4) to start there.
const Storyline = (() => {
  // After the two schools (S3a) and the cookie jars (S4), attention checks and test trials take turns, so two
  // "trick" stories never come back to back. S19 is everyone waving goodbye; 'end' is for the grown-up.
  const SCREEN_ORDER = ['s1', 's2', 's3a', 's4',
    's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15', 's16', 's17', 's18',
    's19', 'end'];
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

  function step(by) {
    const nextId = order[order.indexOf(currentId) + by];
    if (nextId) show(nextId);
  }

  // Puts every screen on the stage (hidden), then shows the first one, or the one named in the URL (#s4).
  // (Screens that aren't in the order, like the voiceover script at #script, can only be reached by name.)
  function start() {
    const stage = document.getElementById('game-stage');
    order = SCREEN_ORDER.filter(id => {
      if (screens[id]) return true;
      console.warn(`Storyline: no script in screens/ registered a screen called "${id}"`);
      return false;
    });
    Object.keys(screens).forEach(id => {
      stage.insertAdjacentHTML('beforeend', screens[id].markup);
      const section = stage.lastElementChild;
      section.hidden = true;
      if (screens[id].setup) screens[id].setup(section);
    });
    Study.assignSides(order.map(id => screens[id])); // which side each answer goes on (shared/study.js)
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
