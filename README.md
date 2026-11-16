# False-belief story

A story for 3-5-year-olds that tests whether they understand that someone can believe something that is no longer
true. The child watches short scenes and answers by tapping one of two pictures. It runs in a browser from plain
files (no build step), so it works on GitHub Pages as it is.

## The story

After a setup page for the grown-up (`s1`) and a green "ready" button (`s2`), sixteen scenes alternate between an
attention check (`a`) and a test trial (`t`), then everyone waves goodbye (`bye`) and the grown-up gets a page to save
the answers (`end`).

| Screen | What happens | Question | Answer the child taps |
| --- | --- | --- | --- |
| `a1` | Mr. Bear goes to the red school | Which school does he go to? | a school |
| `t1` | Cookie in the blue jar; Mr. Turtle moves it to the orange jar | Where does Mr. Bear think his cookie is? | a jar |
| `a2` | His favourite toy is the jungle gym | What is his favourite toy? | jungle gym / teeter-totter |
| `t2` | He draws a butterfly; Mr. Duck wipes it off and draws a school bus | What does he think his drawing shows? | card |
| `a3` | His favourite cereal is the star cereal | What is his favourite cereal? | card |
| `t3` | A crayon box turns out to hold marbles; then Mr. Duck arrives | What did *you* think was inside? What does Mr. Duck think? | card |
| `a4` | Blocks go in the toy box, clothes in the dresser | Where do the blocks go? | toy box / dresser |
| `t4` | Pizza in the fridge; Mr. Pig eats a slice | What shape does he think his pizza is? | card |
| `a5` | He likes the snowman show, not the news | What does he like to watch? | card |
| `t5` | Three candies in a jar; his sister eats one | How many does he think are in the jar? | card |
| `a6` | He takes the scooter, not the bike | Which does he take? | card |
| `t6` | He drinks most of a glass of water; Mr. Turtle fills it up | How much water does he think is in it? | card |
| `a7` | His favourite game is soccer | What is his favourite game? | card |
| `t7` | His yellow book; his dad spills blue paint on it | What colour does he think his book is? | card |
| `a8` | Mr. Rabbit is his teacher; Mr. Duck is in his class | Who is his teacher? | card |
| `t8` | A little balloon; his sister blows it up big | What size does he think his balloon is? | card |

The eight tests each change a different thing behind Mr. Bear's back: where something is, what a drawing shows, what
is inside a box, a shape, a number, an amount, a colour, a size.

### Choices built into the design

- **No text on the child's screens.** Only `s1`, `end` and the script page have words.
- **Nothing shows whether an answer was right.** The picture tapped gets a ring and the other fades, whichever it is.
- **Answers can't be tapped until the question has been asked,** and the question is asked again after 12 seconds
  without an answer.
- **Left and right are balanced.** For half of the test trials and half of the attention checks the right answer is on
  the left, in an order shuffled per child (`shared/study.js`). Always tapping one side scores exactly half.
- **Reality checks.** After each test question the child is also asked what is really true now ("Where is the cookie
  really?"). A child who gets that wrong was not following the story, so their test answer can't be read as a
  false-belief answer. Turn them off with `realityChecks: false` in `shared/study.js`, or `?reality=0`.
- **Mr. Bear is still away when the question is about something in plain view** (the drawing, the candies, the water,
  the book, the balloon): if he came back he would see it. Where the thing is hidden (jars, fridge) he comes back
  first, as in the classic version of the task.
- **The picture at the end of an attention check gives nothing away:** the cereal box is in the basket, the TV is
  off, both balls are back on the floor, Mr. Bear is back in the middle.
- **Three candies and two, not four and three.** Young children can tell two from three at a glance, so the trial
  tests what Mr. Bear knows, not counting.
- **The crayon box starts with a guess** ("What do you think is inside?"), as the standard version of that task
  does. It has no right answer, but a child who doesn't guess crayons can't be scored on the two questions after it.
- **Mr. Pig, not Mr. Otter,** eats the pizza: a pig is an animal every three-year-old can name, and he looks nothing
  like Mr. Bear.
- **The snowman show is a plain, made-up snowman,** not a character from a film.

## Looking at it

Open `index.html` through a web server (any will do; `.claude/launch.json` starts one on port 8124).

| Add to the address | What it does |
| --- | --- |
| `#t4` | starts on that screen |
| `#script` | the voiceover script page |
| `?dev` | review tools: captions, a clock, and keys (space = pause, arrows = 1 s back or forward, N / B = next or previous screen, 1 / 2 = answer left or right) |
| `?captions` | shows the narration as text |
| `?speed=4` | plays faster |
| `?pid=ABC` | participant id, saved with every answer; also fixes that child's left/right layout |
| `?seed=123` | fixes the left/right layout without naming a participant |
| `?reality=0` | no reality checks |

In the browser console, `Engine.current.seek(12.5)` shows any moment of the scene that is playing, and
`Engine.sheet([2, 4, 6, 8])` lays several moments side by side.

## The answers

Every answer is one row. They are kept in the page (`Study.rows`), saved in the browser's local storage, sent as a
`studyResponse` event on `window` (and a `studyComplete` event with all of them at the end), and posted to the parent
page if the story is embedded in one. The grown-up can download them as a CSV file from the last page.

| Column | Meaning |
| --- | --- |
| `n`, `pid`, `seed` | row number, participant id, layout seed |
| `screen`, `question` | e.g. `t4`, `t4.q` (`.q` test or attention question, `.r` reality check, `t3.p` the guess) |
| `kind` | `attention`, `test`, `reality` or `guess` |
| `asked` | the words of the question |
| `left`, `right` | which answer was on which side |
| `choice`, `side` | what the child tapped, and where it was |
| `correctAnswer`, `correct` | the right answer, and 1 or 0 (blank for the guess) |
| `rtMs` | time from when the answers could be tapped to the tap |
| `reprompts` | how many times the question had to be asked again |
| `sinceStartMs`, `at` | when |

Nothing is sent to a server: where the rows go from here is up to you.

## The voiceover

Nothing is recorded yet. Every line the narrator says is in `shared/narration.js`; until there are recordings each
line gets a silent pause of about the right length. To add the voice, record one file per line, named after the line
(`audio/t1.3.mp3`), and set `STUDY.voiceover.enabled` to `true` in `shared/study.js`. Each scene then waits exactly as
long as its recordings last, so the animation stays in step however the lines are read. `index.html#script` lists the
lines and file names. A line without a recording keeps its silent pause.

## How the code is laid out

- `index.html` loads everything.
- `shared/storyline.js` is the order of the screens.
- `shared/engine.js` is the animation engine. A scene is written as stage directions; the engine turns them into one
  timeline and works out everything on screen from one clock, so a slow device or a hidden tab can only pause a
  scene, never break it or skip part of it.
- `shared/cast.js` draws the characters (one paper puppet, different shapes and colours).
- `shared/kit.js` has what scenes share: rooms, doors, tables, the cookie jars.
- `shared/question.js` puts up the two answers and records the tap.
- `shared/study.js` has the settings, the left/right layout and the answer log.
- `shared/narration.js` has the script and plays the voiceover.
- `shared/sounds.js` makes the sound effects (no sound files).
- `screens/` has one file per screen.

To add a scene, copy one in `screens/`, give it a new `id`, add a `<script>` for it in `index.html`, add the id to
`SCREEN_ORDER` in `shared/storyline.js`, and add its lines to `shared/narration.js`.

The whole look is flat "cut paper": plain shapes with no outlines or gradients, pale near-empty rooms, and strong
colour only on the things a scene is about.
