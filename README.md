# False-belief story

A story for 3-5-year-olds that tests whether they understand that someone can believe something that is no longer
true. The child watches short scenes and answers by tapping a picture. It runs in a browser from plain files (no
build step), so it works on GitHub Pages as it is.

## The story

| Screen | What happens | Question | Answer the child taps |
| --- | --- | --- | --- |
| `s1` | Setup checklist for the grown-up | | |
| `s2` | The green "ready" button | | |
| `s3a` | Mr. Bear goes to the red school | Which school does he go to? | a school, or its button |
| `s4` | Cookie in the blue jar; Mr. Turtle moves it to the red jar | Where does Mr. Bear think his cookie is? | a jar |
| `s5` | His favourite toy is the jungle gym | What is his favourite toy? | jungle gym / teeter-totter |
| `s6` | He draws a butterfly; Mr. Duck wipes it off and draws a school bus | What does he think his drawing shows? | button |
| `s7` | His favourite cereal is the star cereal | What is his favourite cereal? | button |
| `s8` | A crayon box turns out to hold marbles; then Mr. Duck arrives | What did *you* think was inside? What does Mr. Duck think? | button |
| `s9` | Blocks go in the toy box, clothes in the dresser | Where do the blocks go? | toy box / dresser |
| `s10` | Pizza in the fridge; Mr. Pig eats a slice | What shape does he think his pizza is? | button |
| `s11` | He likes the snowman show, not the news | What does he like to watch? | button |
| `s12` | Three candies in a jar; his sister eats one | How many does he think are in the jar? | button |
| `s13` | He takes the scooter, not the bike | Which does he take? | button |
| `s14` | He drinks most of a glass of water; Mr. Turtle fills it up | How much water does he think is in it? | button |
| `s15` | His favourite game is soccer | What is his favourite game? | button |
| `s16` | His yellow book; his dad spills blue paint on it | What colour does he think his book is? | button |
| `s17` | Mr. Rabbit is his teacher; Mr. Duck is in his class | Who is his teacher? | button |
| `s18` | A little balloon; his sister blows it up big | What size does he think his balloon is? | button |
| `s19` | Everyone waves goodbye | | |
| `end` | The grown-up saves the answers | | |

After the two schools and the cookie jars, attention checks (odd numbers) and test trials (even numbers) take
turns. The eight tests each change a different thing behind Mr. Bear's back: where something is, what a drawing
shows, what is inside a box, a shape, a number, an amount, a colour, a size.

### How the screens are made

`s1` to `s4` are each drawn and animated by hand, in their own script and stylesheet in `screens/`.

`s5` onward continue them. They use the same drawings (Mr. Bear and Mr. Turtle as they are in `s4`, with the
same chunky arms and paws; `s4`'s striped room, doors and table; `s3a`'s outdoors), the same way of leaving a
room (walking back to the door, getting smaller, and off up the path or down a hall), and the same kind of
answers (buttons whose face presses down onto a dark ledge, and the yellow guide ring round things that can be
tapped). What is new is how they are written: each is a short list of stage directions that a small animation
engine plays, so adding or changing a scene doesn't mean hand-timing it. Mr. Duck, Mr. Pig, Mr. Rabbit and
Mr. Bear's family are new characters drawn the same way as Mr. Bear.

### Choices built into the screens after `s4`

- **No text on the child's screens.** Only `s1`, `end` and the script page have words.
- **Nothing shows whether an answer was right.** The button tapped stays pressed and the other fades, whichever it is.
- **Answers can't be tapped until the question has been asked,** and the question is asked again after 12 seconds
  without an answer.
- **Left and right are balanced.** For half of the test trials and half of the attention checks the right answer is on
  the left, in an order shuffled per child (`shared/study.js`). (`s3a` and `s4` are drawn one way round.)
- **Reality checks.** After each test question the child is also asked what is really true now ("What does the
  drawing really show now?"). A child who gets that wrong was not following the story, so their test answer can't
  be read as a false-belief answer. Turn them off with `realityChecks: false` in `shared/study.js`, or `?reality=0`.
- **Mr. Bear is still away when the question is about something in plain view** (the drawing, the candies, the water,
  the book, the balloon): if he came back he would see it. Where the thing is hidden (the fridge) he comes back
  first, as he does for the jars in `s4`.
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

Open `index.html` through a web server (any will do).

| Add to the address | What it does |
| --- | --- |
| `#s10` | starts on that screen |
| `#script` | the voiceover script page |
| `?pid=ABC` | participant id, saved with every answer; also fixes that child's left/right layout |
| `?seed=123` | fixes the left/right layout without naming a participant |
| `?reality=0` | no reality checks |

For reviewing the screens after `s4`:

| Add to the address | What it does |
| --- | --- |
| `?dev` | review tools: captions, a clock, and keys (space = pause, arrows = 1 s back or forward, N / B = next or previous screen, 1 / 2 = answer left or right) |
| `?dev&at=12.5` | shows that moment of a screen and stays there |
| `?dev&sheet=12` | lays that many moments of a screen side by side (`?dev&sheet=2,5.5,9` for those moments) |
| `?dev&ask=1` | jumps to a screen's first question (`2` = its second); add `&pick=left` to tap an answer |
| `?captions` | shows the narration as text |
| `?speed=4` | plays faster |

In the browser console, `Engine.current.seek(12.5)` shows any moment of the screen that is playing.

## The answers

Every answer is one row. They are kept in the page (`Study.rows`), saved in the browser's local storage, sent as a
`studyResponse` event on `window` (and a `studyComplete` event with all of them at the end), and posted to the parent
page if the story is embedded in one. The grown-up can download them as a CSV file from the last page.

| Column | Meaning |
| --- | --- |
| `n`, `pid`, `seed` | row number, participant id, layout seed |
| `screen`, `question` | e.g. `s10`, `s10.q` (`.q` test or attention question, `.r` reality check, `s8.p` the guess) |
| `kind` | `attention`, `test`, `reality` or `guess` |
| `asked` | the words of the question |
| `left`, `right` | which answer was on which side |
| `choice`, `side` | what the child tapped, and where it was |
| `correctAnswer`, `correct` | the right answer, and 1 or 0 (blank for the guess) |
| `rtMs` | time from when the answers could be tapped to the tap |
| `reprompts` | how many times the question had to be asked again |
| `sinceStartMs`, `at` | when |

`s3a` and `s4` announce their answers as events of their own (`attentionCheckAnswered`, `jarSelected`);
`shared/study.js` writes each in the log like the others. `s4` is scored as the false-belief question: the blue jar,
where Mr. Bear put his cookie and thinks it still is, is the right answer.

Nothing is sent to a server: where the rows go from here is up to you.

## The voiceover

Nothing is recorded yet. Every line the narrator says on the screens after `s4` is in `shared/narration.js`; until
there are recordings each line gets a silent pause of about the right length. To add the voice, record one file per
line, named after the line (`audio/s6.3.mp3`), and set `STUDY.voiceover.enabled` to `true` in `shared/study.js`. Each
of those screens then waits exactly as long as its recordings last, so the animation stays in step however the
lines are read. `index.html#script` lists the lines and file names. (`s3a` keeps its two lines in its own script and
runs to its own fixed timing, as does `s4`.)

## How the code is laid out

- `index.html` loads everything.
- `shared/storyline.js` is the order of the screens.
- `shared/base.css` has the styles the hand-made screens share; `shared/story.css` has the little the later ones need.
- `shared/sounds.js` makes the sound effects (no sound files); `shared/sounds-more.js` adds the ones the later
  screens need, made from the same building blocks.
- `shared/study.js` has the settings, the left/right layout and the answer log.
- `shared/narration.js` has the later screens' script and plays the voiceover.
- `shared/engine.js` is the animation engine. A scene is written as stage directions; the engine turns them into one
  timeline and works out everything on screen from one clock, so a slow device or a hidden tab can only pause a
  scene, never break it or skip part of it.
- `shared/look.js` gives every shape the engine draws the look of the hand-made screens: a dark outline and soft shading.
- `shared/art.js` has the drawings the later screens share with `s3a` and `s4`: the characters, the room, the doors,
  the table, the outdoors.
- `shared/cast.js` makes the characters into puppets: walking, reaching, looking, blinking.
- `shared/kit.js` builds rooms, and takes characters out and in through the doors.
- `shared/question.js` puts up the two answers and records the tap.
- `screens/` has one file per screen.

To add a scene, copy one of `screens/s5` to `s18`, give it a new `id`, add a `<script>` for it in `index.html`, add
the id to `SCREEN_ORDER` in `shared/storyline.js`, and add its lines to `shared/narration.js`. Everything a scene
draws goes through the small shape helpers in `shared/engine.js` (`m.r`, `m.c`, `m.p`...), which give each shape its
outline and shading. Where the automatic outline isn't right there are two more: `m.u(() => shapes)` puts one outline
around several shapes that make up one thing, and `m.flat(() => shapes)` draws them with no outline.
