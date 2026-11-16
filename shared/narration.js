// Every line the narrator says, and the voiceover player.
//
// NARRATION is the whole script: one entry per line, named <screen>.<line>. Each story screen plays its lines by
// name (S.say('t1.3')), so to change the wording, change it here. Lines ending in .q are test or attention
// questions, .r are "what is really true" checks, and t3.p is the crayon-box guess.
//
// VOICEOVER: nothing is recorded yet, so each line is given a silent slot about as long as it takes to say
// (see `estimate`). To add the voice, record one file per line, named after the line (audio/t1.3.mp3), and set
// STUDY.voiceover.enabled in shared/study.js. Each scene then waits exactly as long as its recordings last, so
// the animation stays in step however fast or slowly the lines are read. Open index.html#script for the list.
const NARRATION = {
  's2.1': "We're going to tell you a story today! Press the green button when you're ready!",

  'a1.1': 'This is Mr. Bear.',
  'a1.2': 'Look, here are two schools. A red school, and a blue school.',
  'a1.3': 'Mr. Bear goes to the red school.',
  'a1.q': 'Which school does Mr. Bear go to?',

  't1.1': 'Mr. Bear has a cookie.',
  't1.2': 'He puts his cookie in the blue jar.',
  't1.3': 'Then Mr. Bear goes outside to play.',
  't1.4': 'Look! Here comes Mr. Turtle.',
  't1.5': 'Mr. Turtle takes the cookie out of the blue jar.',
  't1.6': 'And he puts it in the orange jar.',
  't1.7': 'Mr. Bear did not see that.',
  't1.8': 'Then Mr. Turtle goes home.',
  't1.9': 'Now Mr. Bear comes back. He wants his cookie.',
  't1.q': 'Where does Mr. Bear think his cookie is?',
  't1.r': 'Where is the cookie really?',

  'a2.1': 'Mr. Bear is at the playground.',
  'a2.2': 'There is a teeter-totter, and there is a jungle gym.',
  'a2.3': "Mr. Bear's favorite toy is the jungle gym.",
  'a2.q': "What is Mr. Bear's favorite toy?",

  't2.1': 'Mr. Bear is in the art room.',
  't2.2': 'He draws a butterfly.',
  't2.3': 'Then Mr. Bear goes to the bathroom.',
  't2.4': 'Look! Here comes Mr. Duck.',
  't2.5': 'Mr. Duck wipes the butterfly away.',
  't2.6': 'And he draws a school bus.',
  't2.7': 'Mr. Bear did not see that.',
  't2.8': 'Then Mr. Duck goes away.',
  't2.9': 'Mr. Bear is still in the bathroom.',
  't2.q': 'What does Mr. Bear think his drawing shows?',
  't2.r': 'What does the drawing really show now?',

  'a3.1': 'Mr. Bear is at the grocery store. He wants to buy cereal.',
  'a3.2': 'There is star cereal, and there is circle cereal.',
  'a3.3': "Mr. Bear's favorite is the star cereal.",
  'a3.q': "What is Mr. Bear's favorite cereal?",

  't3.1': "Mr. Bear is at Mr. Turtle's house.",
  't3.2': 'Look what Mr. Bear finds!',
  't3.p': 'What do you think is inside this box?',
  't3.3': "Let's see. Mr. Bear opens the box.",
  't3.4': 'Oh! There are marbles inside!',
  't3.5': 'Mr. Bear puts the marbles back, and closes the box.',
  't3.q1': 'Before Mr. Bear opened the box, what did you think was inside?',
  't3.6': 'Look! Here comes Mr. Duck. Mr. Duck has never looked inside this box.',
  't3.q2': 'What does Mr. Duck think is inside the box?',
  't3.r': 'What is really inside the box?',

  'a4.1': 'Mr. Bear is cleaning up his room.',
  'a4.2': 'The blocks go in the toy box.',
  'a4.3': 'And the clothes go in the dresser.',
  'a4.q': 'Where do the blocks go?',

  't4.1': 'Mr. Bear is in the kitchen. He made a pizza!',
  't4.2': 'He puts the pizza in the fridge.',
  't4.3': 'Then Mr. Bear goes to watch TV.',
  't4.4': 'Look! Here comes Mr. Pig.',
  't4.5': 'Mr. Pig takes out the pizza, and eats a slice. Yum!',
  't4.6': 'Then he puts the pizza back in the fridge.',
  't4.7': 'Mr. Bear did not see that.',
  't4.8': 'Then Mr. Pig goes away.',
  't4.9': 'Now Mr. Bear comes back. He wants his pizza.',
  't4.q': 'What shape does Mr. Bear think his pizza is?',
  't4.r': 'What shape is the pizza really?',

  'a5.1': 'Mr. Bear is watching TV.',
  'a5.2': 'There is a snowman show, and there is the news.',
  'a5.3': 'Mr. Bear likes to watch the snowman show.',
  'a5.q': 'What does Mr. Bear like to watch?',

  't5.1': "Mr. Bear's mom gives him three candies.",
  't5.2': 'He puts them in a jar. One, two, three.',
  't5.3': 'Then Mr. Bear goes outside to play.',
  't5.4': "Look! Here comes Mr. Bear's sister.",
  't5.5': 'She takes one candy, and eats it.',
  't5.6': 'Mr. Bear did not see that.',
  't5.7': 'Then his sister goes away.',
  't5.8': 'Mr. Bear is still outside.',
  't5.q': 'How many candies does Mr. Bear think are in the jar?',
  't5.r': 'How many candies are really in the jar?',

  'a6.1': "Mr. Bear wants to go to Mr. Duck's house.",
  'a6.2': 'He has a bike, and he has a scooter.',
  'a6.3': 'Today, Mr. Bear takes his scooter.',
  'a6.q': 'Does Mr. Bear take the bike, or the scooter?',

  't6.1': 'Mr. Bear is thirsty. He pours a glass of water.',
  't6.2': 'He drinks and drinks. Now there is only a little water left.',
  't6.3': 'Then Mr. Bear goes to his room.',
  't6.4': 'Look! Here comes Mr. Turtle.',
  't6.5': 'Mr. Turtle pours more water into the glass. Now it is full.',
  't6.6': 'Mr. Bear did not see that.',
  't6.7': 'Then Mr. Turtle goes away.',
  't6.8': 'Mr. Bear is still in his room.',
  't6.q': 'How much water does Mr. Bear think is in the glass?',
  't6.r': 'How much water is really in the glass?',

  'a7.1': 'Mr. Bear is at the gym.',
  'a7.2': 'There is a basketball, and there is a soccer ball.',
  'a7.3': "Mr. Bear's favorite game is soccer.",
  'a7.q': "What is Mr. Bear's favorite game?",

  't7.1': 'Mr. Bear has a book. It is a yellow book.',
  't7.2': 'He puts his book on the table.',
  't7.3': 'Then Mr. Bear goes up to his room.',
  't7.4': "Look! Here comes Mr. Bear's dad. He has blue paint.",
  't7.5': 'Oh no! The paint spills on the book. Now the book is blue.',
  't7.6': 'Mr. Bear did not see that.',
  't7.7': 'Then his dad goes away.',
  't7.8': 'Mr. Bear is still in his room.',
  't7.q': 'What color does Mr. Bear think his book is?',
  't7.r': 'What color is the book really?',

  'a8.1': 'Mr. Bear is at school.',
  'a8.2': "This is Mr. Rabbit. Mr. Rabbit is Mr. Bear's teacher.",
  'a8.3': "And this is Mr. Duck. Mr. Duck is in Mr. Bear's class.",
  'a8.q': "Who is Mr. Bear's teacher?",

  't8.1': 'Mr. Turtle gives Mr. Bear a balloon. It is a little balloon.',
  't8.2': 'Mr. Bear says thank you. He puts the balloon on his table.',
  't8.3': 'Then Mr. Bear goes outside to play.',
  't8.4': "Look! Here comes Mr. Bear's sister.",
  't8.5': 'She blows and blows. Now the balloon is big!',
  't8.6': 'Mr. Bear did not see that.',
  't8.7': 'Then his sister goes away.',
  't8.8': 'Mr. Bear is still outside.',
  't8.q': 'What size does Mr. Bear think his balloon is?',
  't8.r': 'What size is the balloon really?',

  'end.1': 'The end! Thank you for helping. Goodbye!',
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
