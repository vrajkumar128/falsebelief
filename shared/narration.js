// Every line the narrator says on the screens after S4, and the voiceover player.
//
// NARRATION is those screens' script: one entry per line, named <screen>.<line>. Each screen plays its lines by
// name (S.say('s6.3')), so to change the wording, change it here. Lines ending in .q are test or attention
// questions, .r are "what is really true" checks, and s8.p is the crayon-box guess. (S3a keeps its two lines in
// its own script, and S4 has none.)
//
// VOICEOVER: nothing is recorded yet, so each line is given a silent slot about as long as it takes to say
// (see `estimate`). To add the voice, record one file per line, named after the line (audio/s6.3.mp3), and set
// STUDY.voiceover.enabled in shared/study.js. Each scene then waits exactly as long as its recordings last, so
// the animation stays in step however fast or slowly the lines are read. Open index.html#script for the list.
const NARRATION = {
  's5.1': 'Mr. Bear is at the playground.',
  's5.2': 'There is a teeter-totter, and there is a jungle gym.',
  's5.3': "Mr. Bear's favorite toy is the jungle gym.",
  's5.q': "What is Mr. Bear's favorite toy?",

  's6.1': 'Mr. Bear is in the art room.',
  's6.2': 'He draws a butterfly.',
  's6.3': 'Then Mr. Bear goes to the bathroom.',
  's6.4': 'Look! Here comes Mr. Duck.',
  's6.5': 'Mr. Duck wipes the butterfly away.',
  's6.6': 'And he draws a school bus.',
  's6.7': 'Mr. Bear did not see that.',
  's6.8': 'Then Mr. Duck goes away.',
  's6.9': 'Mr. Bear is still in the bathroom.',
  's6.q': 'What does Mr. Bear think his drawing shows?',
  's6.r': 'What does the drawing really show now?',

  's7.1': 'Mr. Bear is at the grocery store. He wants to buy cereal.',
  's7.2': 'There is star cereal, and there is circle cereal.',
  's7.3': "Mr. Bear's favorite is the star cereal.",
  's7.q': "What is Mr. Bear's favorite cereal?",

  's8.1': "Mr. Bear is at Mr. Turtle's house.",
  's8.2': 'Look what Mr. Bear finds!',
  's8.p': 'What do you think is inside this box?',
  's8.3': "Let's see. Mr. Bear opens the box.",
  's8.4': 'Oh! There are marbles inside!',
  's8.5': 'Mr. Bear puts the marbles back, and closes the box.',
  's8.q1': 'Before Mr. Bear opened the box, what did you think was inside?',
  's8.6': 'Look! Here comes Mr. Duck. Mr. Duck has never looked inside this box.',
  's8.q2': 'What does Mr. Duck think is inside the box?',
  's8.r': 'What is really inside the box?',

  's9.1': 'Mr. Bear is cleaning up his room.',
  's9.2': 'The blocks go in the toy box.',
  's9.3': 'And the clothes go in the dresser.',
  's9.q': 'Where do the blocks go?',

  's10.1': 'Mr. Bear is in the kitchen. He made a pizza!',
  's10.2': 'He puts the pizza in the fridge.',
  's10.3': 'Then Mr. Bear goes to watch TV.',
  's10.4': 'Look! Here comes Mr. Pig.',
  's10.5': 'Mr. Pig takes out the pizza, and eats a slice. Yum!',
  's10.6': 'Then he puts the pizza back in the fridge.',
  's10.7': 'Mr. Bear did not see that.',
  's10.8': 'Then Mr. Pig goes away.',
  's10.9': 'Now Mr. Bear comes back. He wants his pizza.',
  's10.q': 'What shape does Mr. Bear think his pizza is?',
  's10.r': 'What shape is the pizza really?',

  's11.1': 'Mr. Bear is watching TV.',
  's11.2': 'There is a snowman show, and there is the news.',
  's11.3': 'Mr. Bear likes to watch the snowman show.',
  's11.q': 'What does Mr. Bear like to watch?',

  's12.1': "Mr. Bear's mom gives him three candies.",
  's12.2': 'He puts them in a jar. One, two, three.',
  's12.3': 'Then Mr. Bear goes outside to play.',
  's12.4': "Look! Here comes Mr. Bear's sister.",
  's12.5': 'She takes one candy, and eats it.',
  's12.6': 'Mr. Bear did not see that.',
  's12.7': 'Then his sister goes away.',
  's12.8': 'Mr. Bear is still outside.',
  's12.q': 'How many candies does Mr. Bear think are in the jar?',
  's12.r': 'How many candies are really in the jar?',

  's13.1': "Mr. Bear wants to go to Mr. Duck's house.",
  's13.2': 'He has a bike, and he has a scooter.',
  's13.3': 'Today, Mr. Bear takes his scooter.',
  's13.q': 'Does Mr. Bear take the bike, or the scooter?',

  's14.1': 'Mr. Bear is thirsty. He pours a glass of water.',
  's14.2': 'He drinks and drinks. Now there is only a little water left.',
  's14.3': 'Then Mr. Bear goes to his room.',
  's14.4': 'Look! Here comes Mr. Turtle.',
  's14.5': 'Mr. Turtle pours more water into the glass. Now it is full.',
  's14.6': 'Mr. Bear did not see that.',
  's14.7': 'Then Mr. Turtle goes away.',
  's14.8': 'Mr. Bear is still in his room.',
  's14.q': 'How much water does Mr. Bear think is in the glass?',
  's14.r': 'How much water is really in the glass?',

  's15.1': 'Mr. Bear is at the gym.',
  's15.2': 'There is a basketball, and there is a soccer ball.',
  's15.3': "Mr. Bear's favorite game is soccer.",
  's15.q': "What is Mr. Bear's favorite game?",

  's16.1': 'Mr. Bear has a book. It is a yellow book.',
  's16.2': 'He puts his book on the table.',
  's16.3': 'Then Mr. Bear goes up to his room.',
  's16.4': "Look! Here comes Mr. Bear's dad. He has blue paint.",
  's16.5': 'Oh no! The paint spills on the book. Now the book is blue.',
  's16.6': 'Mr. Bear did not see that.',
  's16.7': 'Then his dad goes away.',
  's16.8': 'Mr. Bear is still in his room.',
  's16.q': 'What color does Mr. Bear think his book is?',
  's16.r': 'What color is the book really?',

  's17.1': 'Mr. Bear is at school.',
  's17.2': "This is Mr. Rabbit. Mr. Rabbit is Mr. Bear's teacher.",
  's17.3': "And this is Mr. Duck. Mr. Duck is in Mr. Bear's class.",
  's17.q': "Who is Mr. Bear's teacher?",

  's18.1': 'Mr. Turtle gives Mr. Bear a balloon. It is a little balloon.',
  's18.2': 'Mr. Bear says thank you. He puts the balloon on his table.',
  's18.3': 'Then Mr. Bear goes outside to play.',
  's18.4': "Look! Here comes Mr. Bear's sister.",
  's18.5': 'She blows and blows. Now the balloon is big!',
  's18.6': 'Mr. Bear did not see that.',
  's18.7': 'Then his sister goes away.',
  's18.8': 'Mr. Bear is still outside.',
  's18.q': 'What size does Mr. Bear think his balloon is?',
  's18.r': 'What size is the balloon really?',

  's19.1': 'The end! Thank you for helping. Goodbye!',
};

const Narration = (() => {
  const lengths = {}; // seconds, for lines that have a recording
  let player = null;
  let loading = null;
  // A moment of silence: playing it inside a tap lets phones and tablets play the voice later without one
  const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

  // How long a line takes to say, for a child: about 2.3 words a second, with a breath
  function estimate(text) {
    const words = text.trim().split(/\s+/).length;
    return Math.min(9, Math.max(1.3, words / 2.3 + 0.45));
  }

  function text(id) {
    if (!(id in NARRATION)) console.warn('Narration: there is no line called "' + id + '"');
    return NARRATION[id] || '';
  }

  function duration(id) {
    return lengths[id] || estimate(text(id));
  }

  function file(id) {
    return STUDY.voiceover.folder + id + '.' + STUDY.voiceover.type;
  }

  // Finds out how long every recording is, so each scene can be timed to its voice before it starts
  function load() {
    if (!STUDY.voiceover.enabled) return Promise.resolve();
    if (!loading) {
      loading = Promise.all(Object.keys(NARRATION).map(id => new Promise(resolve => {
        const probe = new Audio();
        const done = () => { clearTimeout(timer); resolve(); };
        const timer = setTimeout(done, 6000);
        probe.preload = 'metadata';
        probe.onloadedmetadata = () => {
          if (isFinite(probe.duration) && probe.duration > 0) lengths[id] = probe.duration;
          done();
        };
        probe.onerror = done;
        probe.src = file(id);
      })));
    }
    return loading;
  }

  // Call from a tap (the green button): after that the browser lets the voice play on its own
  function unlock() {
    if (!STUDY.voiceover.enabled) return;
    player = player || new Audio();
    player.src = SILENCE;
    const attempt = player.play();
    if (attempt && attempt.catch) attempt.catch(() => { });
  }

  function play(id) {
    window.dispatchEvent(new CustomEvent('narration', { detail: { id, text: text(id) } }));
    if (!STUDY.voiceover.enabled || !lengths[id]) return;
    player = player || new Audio();
    player.src = file(id);
    const attempt = player.play();
    if (attempt && attempt.catch) attempt.catch(() => { });
  }

  function stop() {
    if (player) player.pause();
  }

  // A hidden tab stops the story's clock; the voice stops with it, and picks up again when the tab is back
  document.addEventListener('visibilitychange', () => {
    if (!player || !player.src || player.ended) return;
    if (document.hidden) player.pause();
    else if (player.currentTime > 0 && player.src !== SILENCE) player.play().catch(() => { });
  });

  return { text, duration, estimate, load, unlock, play, stop, file, has: id => !!lengths[id] };
})();
