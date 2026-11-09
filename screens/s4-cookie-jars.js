// S4. TEST 1: WHICH JAR HAS THE COOKIE? Mr. Bear puts his cookie in the left jar and goes out; Mr. Turtle comes
// in, moves the cookie to the right jar and goes out; Mr. Bear comes back, and then the child picks a jar. The
// choice is reported as a 'jarSelected' event. The animations themselves are in s4-cookie-jars.css.
(() => {
  const markup = /* html */ `
    <section aria-label="Which jar has the cookie?" class="screen" data-screen="s4" id="screen-s4">
    <!-- FULL VECTOR SCENE SVG (1000 x 650) -->
    <svg class="w-full h-full block" id="scene-svg" viewbox="0 0 1000 650" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradients -->
        <lineargradient id="wallGrad" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#fff7ed"></stop>
          <stop offset="100%" stop-color="#f5e1cb"></stop>
        </lineargradient>
        <lineargradient id="tableTopGrad" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#d48b47"></stop>
          <stop offset="100%" stop-color="#b86d2b"></stop>
        </lineargradient>
        <lineargradient id="bearBodyGrad" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#9d6b46"></stop>
          <stop offset="100%" stop-color="#7a4f2f"></stop>
        </lineargradient>
        <lineargradient id="bearMuzzleGrad" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#fae2be"></stop>
          <stop offset="100%" stop-color="#ecc99a"></stop>
        </lineargradient>
        <!-- Rich Blue Glazed Ceramic For Both Jars -->
        <lineargradient id="jarUniformBlueGrad" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stop-color="#64b5f6"></stop>
          <stop offset="35%" stop-color="#1e88e5"></stop>
          <stop offset="100%" stop-color="#0d47a1"></stop>
        </lineargradient>
        <filter height="130%" id="dropShadow" width="130%" x="-10%" y="-10%">
          <fedropshadow dx="0" dy="8" flood-opacity="0.18" stddeviation="6"></fedropshadow>
        </filter>
        <filter height="160%" id="tableShadowBlur" width="120%" x="-10%" y="-30%">
          <fegaussianblur stddeviation="5"></fegaussianblur>
        </filter>
        <filter height="140%" id="sparkleGlow" width="140%" x="-20%" y="-20%">
          <fedropshadow dx="0" dy="0" flood-color="#ffd54f" flood-opacity="0.9" stddeviation="3"></fedropshadow>
        </filter>
        <!-- Clipping Path for Left Jar (rim at Y 350): what sits inside the opening or reaches over the rim is
             clipped to everything above the rim plus the opening; the front lip and wall are drawn over it -->
        <clippath id="jarCookieClip">
          <path d="M 150 -100 L 550 -100 L 550 350 A 46 13 0 0 1 284 350 L 150 350 Z"></path>
        </clippath>
        <!-- Clipping Path for Right Jar: mirror image of the left jar clip about X=500 -->
        <clippath id="jarRightCookieClip">
          <path d="M 850 -100 L 450 -100 L 450 350 A 46 13 0 0 0 716 350 L 850 350 Z"></path>
        </clippath>
        <!-- Doorway openings (200 x 385): outdoor scenery and characters who have stepped outside are clipped to these -->
        <clippath id="left-door-clip">
          <rect height="385" rx="6" width="200" x="35" y="65"></rect>
        </clippath>
        <clippath id="right-door-clip">
          <rect height="385" rx="6" width="200" x="765" y="65"></rect>
        </clippath>
        <lineargradient id="outdoorSkyGrad" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#60a5fa"></stop>
          <stop offset="55%" stop-color="#93c5fd"></stop>
          <stop offset="100%" stop-color="#e0f2fe"></stop>
        </lineargradient>
        <lineargradient id="outdoorHillGrad1" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#86efac"></stop>
          <stop offset="100%" stop-color="#4ade80"></stop>
        </lineargradient>
        <lineargradient id="outdoorHillGrad2" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#4ade80"></stop>
          <stop offset="100%" stop-color="#22c55e"></stop>
        </lineargradient>
        <lineargradient id="pathGrad" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#fed7aa"></stop>
          <stop offset="100%" stop-color="#fcd34d"></stop>
        </lineargradient>
        <!-- Door leaf artwork (hinged at outer edge). Each leaf is drawn twice: behind the characters, and in
             front of them for whenever a character is outside that door. -->
        <g id="door-left-leaf-art">
          <rect fill="#e89b4f" height="385" rx="7" stroke="#2c1e14" stroke-width="4.5" width="200" x="35" y="65"></rect>
          <rect fill="#c9732b" height="155" rx="6" stroke="#2c1e14" stroke-width="3.5" width="168" x="51" y="85"></rect>
          <rect fill="#df8d41" height="143" rx="4" width="156" x="57" y="91"></rect>
          <rect fill="#c9732b" height="175" rx="6" stroke="#2c1e14" stroke-width="3.5" width="168" x="51" y="255"></rect>
          <rect fill="#df8d41" height="163" rx="4" width="156" x="57" y="261"></rect>
          <circle cx="210" cy="256" fill="#ffd54f" r="9.5" stroke="#2c1e14" stroke-width="3.5"></circle>
          <circle cx="207" cy="253" fill="#fff9c4" r="3"></circle>
          <rect fill="#2c1e14" height="4.5" rx="1.5" width="7" x="216" y="254"></rect>
        </g>
        <g id="door-right-leaf-art">
          <rect fill="#e89b4f" height="385" rx="7" stroke="#2c1e14" stroke-width="4.5" width="200" x="765" y="65"></rect>
          <rect fill="#c9732b" height="155" rx="6" stroke="#2c1e14" stroke-width="3.5" width="168" x="781" y="85"></rect>
          <rect fill="#df8d41" height="143" rx="4" width="156" x="787" y="91"></rect>
          <rect fill="#c9732b" height="175" rx="6" stroke="#2c1e14" stroke-width="3.5" width="168" x="781" y="255"></rect>
          <rect fill="#df8d41" height="163" rx="4" width="156" x="787" y="261"></rect>
          <circle cx="790" cy="256" fill="#ffd54f" r="9.5" stroke="#2c1e14" stroke-width="3.5"></circle>
          <circle cx="787" cy="253" fill="#fff9c4" r="3"></circle>
          <rect fill="#2c1e14" height="4.5" rx="1.5" width="7" x="777" y="254"></rect>
        </g>
        <lineargradient id="turtleSkinGrad" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#8bc34a"></stop>
          <stop offset="100%" stop-color="#558b2f"></stop>
        </lineargradient>
        <lineargradient id="turtleShellGrad" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#4e7037"></stop>
          <stop offset="100%" stop-color="#2e491f"></stop>
        </lineargradient>
        <lineargradient id="turtleBellyGrad" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#fff9c4"></stop>
          <stop offset="100%" stop-color="#f0e68c"></stop>
        </lineargradient>
        <lineargradient id="turtleShellRimGrad" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#7cb342"></stop>
          <stop offset="100%" stop-color="#558b2f"></stop>
        </lineargradient>
        <!-- Master Cookie Symbol -->
        <g id="cookie-art-symbol">
          <circle cx="0" cy="0" fill="#000000" opacity="0.25" r="41"></circle>
          <circle cx="0" cy="0" fill="#e09848" filter="url(#dropShadow)" r="38" stroke="#2c1e14" stroke-width="5">
          </circle>
          <circle cx="-2" cy="-4" fill="none" opacity="0.5" r="33" stroke="#fff176" stroke-width="3"></circle>
          <circle cx="-29" cy="-9" fill="#c77b2e" r="3"></circle>
          <circle cx="27" cy="13" fill="#c77b2e" r="3.5"></circle>
          <circle cx="-15" cy="30" fill="#c77b2e" r="3"></circle>
          <!-- Chunks -->
          <circle cx="-15" cy="-15" fill="#3e2723" r="7" stroke="#2c1e14" stroke-width="1.5"></circle>
          <circle cx="-17" cy="-17" fill="#8d6e63" r="2.2"></circle>
          <circle cx="15" cy="-13" fill="#3e2723" r="7.5" stroke="#2c1e14" stroke-width="1.5"></circle>
          <circle cx="12" cy="-15" fill="#8d6e63" r="2.5"></circle>
          <circle cx="0" cy="1" fill="#311b16" r="8" stroke="#2c1e14" stroke-width="1.5"></circle>
          <circle cx="-3" cy="-2" fill="#8d6e63" r="2.8"></circle>
          <circle cx="2" cy="3" fill="#ffffff" opacity="0.6" r="1.5"></circle>
          <circle cx="-13" cy="17" fill="#3e2723" r="6.5" stroke="#2c1e14" stroke-width="1.5"></circle>
          <circle cx="-15" cy="15" fill="#8d6e63" r="2.2"></circle>
          <circle cx="17" cy="15" fill="#3e2723" r="7" stroke="#2c1e14" stroke-width="1.5"></circle>
          <circle cx="14" cy="13" fill="#8d6e63" r="2.2"></circle>
          <circle cx="7" cy="-23" fill="#ffffff" opacity="0.85" r="3"></circle>
          <circle cx="23" cy="-1" fill="#ffffff" opacity="0.75" r="2.4"></circle>
        </g>
        <!-- Reaching arms, each in its own arm-group coordinates. Used by the real arms and by the copies drawn
             inside a jar's layer (in front of the jar's back rim, behind its front lip) while reaching into it. -->
        <g id="turtle-arm-l-art">
          <path d="M 790 330 C 765 330, 725 365, 746 418 C 758 438, 786 426, 796 392 C 804 362, 804 332, 790 330 Z"
            fill="url(#turtleSkinGrad)" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5"></path>
          <circle cx="752" cy="416" fill="url(#turtleSkinGrad)" r="16" stroke="#2c1e14" stroke-width="3.5"></circle>
          <circle cx="744" cy="414" fill="#ffffff" opacity="0.4" r="2.5"></circle>
        </g>
        <g id="turtle-arm-r-art">
          <path d="M 900 330 C 925 330, 965 365, 944 418 C 932 438, 904 426, 894 392 C 886 362, 886 332, 900 330 Z"
            fill="url(#turtleSkinGrad)" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5"></path>
          <circle cx="938" cy="416" fill="url(#turtleSkinGrad)" r="16" stroke="#2c1e14" stroke-width="3.5"></circle>
          <circle cx="946" cy="414" fill="#ffffff" opacity="0.4" r="2.5"></circle>
        </g>
        <g id="bear-arm-r-art">
          <path d="M 442.4 341.5 A 27 27 0 0 0 393.6 318.5 C 383 345, 368 368, 361.3 393.7 L 404.7 414.3 C 414 390, 430 365, 442.4 341.5 Z"
            fill="url(#bearBodyGrad)" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5"></path>
          <use href="#bear-paw-circle-symbol"></use>
        </g>
        <circle id="bear-paw-circle-symbol" cx="383" cy="404" fill="url(#bearBodyGrad)" r="24" stroke="#2c1e14"
          stroke-width="5"></circle>
        <!-- Copies of the turtle's flippers (in #turtle-arm-l / #turtle-arm-r coordinates), drawn over a held cookie -->
        <g id="turtle-grip-l-symbol">
          <circle cx="752" cy="416" fill="url(#turtleSkinGrad)" r="16" stroke="#2c1e14" stroke-width="3.5"></circle>
          <circle cx="744" cy="414" fill="#ffffff" opacity="0.4" r="2.5"></circle>
        </g>
        <g id="turtle-grip-r-symbol">
          <circle cx="938" cy="416" fill="url(#turtleSkinGrad)" r="16" stroke="#2c1e14" stroke-width="3.5"></circle>
          <circle cx="946" cy="414" fill="#ffffff" opacity="0.4" r="2.5"></circle>
        </g>
        <!-- Bear's right paw pad & toe beans (in #bear-paw-grip coordinates, toes pointing up at rest; the script
             turns #bear-paw-grip so the toes face the cookie he's holding) -->
        <g id="bear-paw-r-pad-symbol">
          <ellipse cx="383" cy="404" fill="#f8bbd0" rx="13" ry="11"></ellipse>
          <circle cx="366" cy="391" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
          <circle cx="374" cy="382" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
          <circle cx="388" cy="381" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
        </g>
      </defs>
      <!-- ================= 1. BACKGROUND ROOM ================= -->
      <rect fill="url(#wallGrad)" height="460" width="1000" x="0" y="0"></rect>
      <!-- Wallpaper Soft Stripes -->
      <g opacity="0.07" stroke="#d48b47" stroke-linecap="round" stroke-width="26">
        <line x1="70" x2="70" y1="0" y2="460"></line>
        <line x1="200" x2="200" y1="0" y2="460"></line>
        <line x1="330" x2="330" y1="0" y2="460"></line>
        <line x1="460" x2="460" y1="0" y2="460"></line>
        <line x1="590" x2="590" y1="0" y2="460"></line>
        <line x1="720" x2="720" y1="0" y2="460"></line>
        <line x1="850" x2="850" y1="0" y2="460"></line>
        <line x1="970" x2="970" y1="0" y2="460"></line>
      </g>
      <!-- Baseboard Molding behind doors & characters -->
      <rect fill="#e0cbaf" height="18" stroke="#2c1e14" stroke-width="3.5" width="1000" x="0" y="445"></rect>
      <!-- ================= 2. DOORWAYS (200px openings onto a sunny outdoor path) ================= -->
      <g id="background-doors">
        <!-- LEFT DOORWAY OUTDOORS (X 35-235, Y 65-450) -->
        <g clip-path="url(#left-door-clip)">
          <rect fill="url(#outdoorSkyGrad)" height="385" width="200" x="35" y="65"></rect>
          <circle cx="75" cy="115" fill="#fde047" opacity="0.9" r="32"></circle>
          <circle cx="75" cy="115" fill="#fef08a" opacity="0.4" r="48"></circle>
          <ellipse cx="160" cy="120" fill="#ffffff" opacity="0.85" rx="30" ry="12"></ellipse>
          <ellipse cx="145" cy="115" fill="#ffffff" opacity="0.9" rx="18" ry="15"></ellipse>
          <ellipse cx="175" cy="118" fill="#ffffff" opacity="0.85" rx="20" ry="12"></ellipse>
          <path d="M 30 310 Q 120 250 240 295 L 240 450 L 30 450 Z" fill="url(#outdoorHillGrad1)"></path>
          <path d="M 30 350 Q 130 315 240 360 L 240 450 L 30 450 Z" fill="url(#outdoorHillGrad2)"></path>
          <circle cx="65" cy="370" fill="#15803d" r="18"></circle>
          <circle cx="85" cy="375" fill="#16a34a" r="15"></circle>
          <circle cx="58" cy="368" fill="#fbbf24" r="4.5"></circle>
          <circle cx="195" cy="375" fill="#15803d" r="16"></circle>
          <circle cx="205" cy="370" fill="#f43f5e" r="4"></circle>
          <path d="M 85 450 L 185 450 L 155 365 L 115 365 Z" fill="url(#pathGrad)" stroke="#d97706" stroke-width="1.5"></path>
          <path d="M 35 65 L 48 78 L 48 438 L 35 450 Z" fill="#000000" opacity="0.15"></path>
          <path d="M 35 65 L 235 65 L 222 78 L 48 78 Z" fill="#000000" opacity="0.2"></path>
        </g>
        <!-- RIGHT DOORWAY OUTDOORS (X 765-965, Y 65-450) -->
        <g clip-path="url(#right-door-clip)">
          <rect fill="url(#outdoorSkyGrad)" height="385" width="200" x="765" y="65"></rect>
          <ellipse cx="840" cy="120" fill="#ffffff" opacity="0.85" rx="30" ry="12"></ellipse>
          <ellipse cx="825" cy="115" fill="#ffffff" opacity="0.9" rx="18" ry="15"></ellipse>
          <ellipse cx="855" cy="118" fill="#ffffff" opacity="0.85" rx="20" ry="12"></ellipse>
          <path d="M 760 295 Q 880 250 970 310 L 970 450 L 760 450 Z" fill="url(#outdoorHillGrad1)"></path>
          <path d="M 760 360 Q 870 315 970 350 L 970 450 L 760 450 Z" fill="url(#outdoorHillGrad2)"></path>
          <circle cx="935" cy="370" fill="#15803d" r="18"></circle>
          <circle cx="915" cy="375" fill="#16a34a" r="15"></circle>
          <circle cx="942" cy="368" fill="#f43f5e" r="4.5"></circle>
          <circle cx="805" cy="375" fill="#15803d" r="16"></circle>
          <circle cx="795" cy="370" fill="#fbbf24" r="4"></circle>
          <path d="M 815 450 L 915 450 L 885 365 L 845 365 Z" fill="url(#pathGrad)" stroke="#d97706" stroke-width="1.5"></path>
          <path d="M 965 65 L 952 78 L 952 438 L 965 450 Z" fill="#000000" opacity="0.15"></path>
          <path d="M 765 65 L 965 65 L 952 78 L 778 78 Z" fill="#000000" opacity="0.2"></path>
        </g>
        <!-- Door frame casings around the openings -->
        <path d="M 18 48 L 252 48 L 252 455 L 18 455 Z M 35 65 L 35 450 L 235 450 L 235 65 Z" fill="#d98236"
          fill-rule="evenodd" stroke="#2c1e14" stroke-width="5.5"></path>
        <path d="M 748 48 L 982 48 L 982 455 L 748 455 Z M 765 65 L 765 450 L 965 450 L 965 65 Z" fill="#d98236"
          fill-rule="evenodd" stroke="#2c1e14" stroke-width="5.5"></path>
        <!-- Door leaves seen behind characters who are inside the room -->
        <g class="anim-door-swing door-left-leaf" id="door-left-leaf" style="transform-origin: 35px 257.5px;">
          <use href="#door-left-leaf-art"></use>
        </g>
        <g class="door-right-leaf" id="door-right-leaf" style="transform-origin: 965px 257.5px;">
          <use href="#door-right-leaf-art"></use>
        </g>
      </g>
      <!-- Floor -->
      <rect fill="#5c6bc0" height="190" width="1000" x="0" y="460"></rect>
      <!-- Floor Perspective Lines -->
      <g opacity="0.45" stroke="#3f51b5" stroke-width="4">
        <line x1="120" x2="0" y1="460" y2="650"></line>
        <line x1="280" x2="180" y1="460" y2="650"></line>
        <line x1="440" x2="380" y1="460" y2="650"></line>
        <line x1="600" x2="580" y1="460" y2="650"></line>
        <line x1="760" x2="780" y1="460" y2="650"></line>
        <line x1="920" x2="980" y1="460" y2="650"></line>
        <line x1="0" x2="1000" y1="520" y2="520"></line>
        <line x1="0" x2="1000" y1="585" y2="585"></line>
      </g>
      <!-- ================= 3. BEAR CHARACTER GROUP (Starts Center, Exits Left, Returns Left) ================= -->
      <!-- Slot gets clip-path="url(#left-door-clip)" while the bear is outside the left door -->
      <g id="bear-door-slot">
      <g class="anim-bear-departure" id="bear-character-wrapper">
        <g id="bear-legs-group">
          <ellipse cx="440" cy="565" fill="#000000" opacity="0.25" rx="35" ry="12"></ellipse>
          <ellipse cx="560" cy="565" fill="#000000" opacity="0.25" rx="35" ry="12"></ellipse>
          <!-- Left Leg -->
          <g class="anim-leg-l">
            <path d="M420 440 L415 540 C415 558, 465 558, 465 540 L460 440 Z" fill="url(#bearBodyGrad)" stroke="#2c1e14"
              stroke-linejoin="round" stroke-width="5.5"></path>
            <ellipse cx="438" cy="552" fill="url(#bearBodyGrad)" rx="32" ry="15" stroke="#2c1e14" stroke-width="5">
            </ellipse>
            <ellipse cx="438" cy="553" fill="#f8bbd0" rx="15" ry="9" stroke="#2c1e14" stroke-width="1.5"></ellipse>
            <circle cx="423" cy="544" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="436" cy="541" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="449" cy="544" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
          </g>
          <!-- Right Leg -->
          <g class="anim-leg-r">
            <path d="M540 440 L535 540 C535 558, 585 558, 585 540 L580 440 Z" fill="url(#bearBodyGrad)" stroke="#2c1e14"
              stroke-linejoin="round" stroke-width="5.5"></path>
            <ellipse cx="562" cy="552" fill="url(#bearBodyGrad)" rx="32" ry="15" stroke="#2c1e14" stroke-width="5">
            </ellipse>
            <ellipse cx="562" cy="553" fill="#f8bbd0" rx="15" ry="9" stroke="#2c1e14" stroke-width="1.5"></ellipse>
            <circle cx="551" cy="544" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="564" cy="541" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="577" cy="544" fill="#f8bbd0" r="4.5" stroke="#2c1e14" stroke-width="1.2"></circle>
          </g>
        </g>
        <!-- Bear Upper Body & Head -->
        <g id="bear-lean-grp">
          <ellipse cx="500" cy="455" fill="#000000" opacity="0.18" rx="145" ry="24"></ellipse>
          <!-- Ears -->
          <g class="anim-ear-l">
            <circle cx="430" cy="180" fill="url(#bearBodyGrad)" r="34" stroke="#2c1e14" stroke-width="5"></circle>
            <circle cx="430" cy="180" fill="#f8bbd0" r="18" stroke="#2c1e14" stroke-width="3"></circle>
          </g>
          <g class="anim-ear-r">
            <circle cx="570" cy="180" fill="url(#bearBodyGrad)" r="34" stroke="#2c1e14" stroke-width="5"></circle>
            <circle cx="570" cy="180" fill="#f8bbd0" r="18" stroke="#2c1e14" stroke-width="3"></circle>
          </g>
          <!-- Torso -->
          <ellipse cx="500" cy="380" fill="url(#bearBodyGrad)" rx="122" ry="125" stroke="#2c1e14" stroke-width="6">
          </ellipse>
          <ellipse cx="500" cy="385" fill="url(#bearMuzzleGrad)" opacity="0.9" rx="65" ry="70" stroke="#2c1e14"
            stroke-width="4"></ellipse>
          <!-- Head -->
          <circle cx="500" cy="240" fill="url(#bearBodyGrad)" r="88" stroke="#2c1e14" stroke-width="6"></circle>
          <!-- Cheeks -->
          <ellipse cx="445" cy="265" fill="#ff8a80" opacity="0.65" rx="14" ry="9"></ellipse>
          <ellipse cx="555" cy="265" fill="#ff8a80" opacity="0.65" rx="14" ry="9"></ellipse>
          <!-- Muzzle & Face -->
          <ellipse cx="500" cy="265" fill="url(#bearMuzzleGrad)" rx="46" ry="34" stroke="#2c1e14" stroke-width="4.5">
          </ellipse>
          <path d="M485 246 C485 240, 515 240, 515 246 C515 258, 485 258, 485 246 Z" fill="#2c1e14"></path>
          <ellipse cx="495" cy="245" fill="#ffffff" rx="4" ry="2"></ellipse>
          <!-- Smile -->
          <path d="M487 271 Q500 293 513 271 Z" fill="#d32f2f" id="bear-mouth" stroke="#2c1e14" stroke-width="3"></path>
          <path d="M485 268 Q500 274 515 268" fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="4">
          </path>
          <path d="M492 284 Q500 281 508 284" fill="#ff8a80"></path>
          <!-- Eyes -->
          <g class="anim-blink">
            <g class="intro-gaze" id="bear-pupils">
              <ellipse cx="468" cy="225" fill="#2c1e14" rx="11" ry="15"></ellipse>
              <ellipse cx="465" cy="220" fill="#ffffff" rx="4.5" ry="6.5"></ellipse>
              <circle cx="472" cy="230" fill="#ffffff" r="2.5"></circle>
              <ellipse cx="532" cy="225" fill="#2c1e14" rx="11" ry="15"></ellipse>
              <ellipse cx="529" cy="220" fill="#ffffff" rx="4.5" ry="6.5"></ellipse>
              <circle cx="536" cy="230" fill="#ffffff" r="2.5"></circle>
            </g>
          </g>
          <!-- Eyebrows & Tuft -->
          <path d="M455 204 Q468 196 480 203" fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="4">
          </path>
          <path d="M520 203 Q532 196 545 204" fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="4">
          </path>
          <path d="M492 154 Q500 138 506 153 Q512 142 516 156" fill="url(#bearBodyGrad)" stroke="#2c1e14"
            stroke-width="4"></path>
          <!-- Arms & Paws: mirror images about X=500. Each arm is a chunky tapered limb whose rounded shoulder is a
               semicircle centred on its pivot (his right 418,330 / his left 582,330), so rotating keeps it attached -->
          <!-- Bear's Right Arm & Paw (screen left): holds the cookie -->
          <g class="intro-arm" id="bear-lowering-arm">
            <use href="#bear-arm-r-art"></use>
            <g id="bear-paw-grip">
              <use href="#bear-paw-r-pad-symbol"></use>
            </g>
          </g>
          <!-- Bear's Left Arm & Paw (screen right) -->
          <g>
            <path d="M 557.6 341.5 A 27 27 0 0 1 606.4 318.5 C 617 345, 632 368, 638.7 393.7 L 595.3 414.3 C 586 390, 570 365, 557.6 341.5 Z"
              fill="url(#bearBodyGrad)" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5"></path>
            <circle cx="617" cy="404" fill="url(#bearBodyGrad)" r="24" stroke="#2c1e14" stroke-width="5"></circle>
            <ellipse cx="617" cy="404" fill="#f8bbd0" rx="13" ry="11"></ellipse>
            <circle cx="634" cy="391" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="626" cy="382" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
            <circle cx="612" cy="381" fill="#f8bbd0" r="5" stroke="#2c1e14" stroke-width="1.2"></circle>
          </g>
        </g>
      </g>
      </g>
      <!-- ================= 3B. TURTLE CHARACTER GROUP ================= -->
      <!-- Slot gets clip-path="url(#right-door-clip)" while the turtle is outside the right door -->
      <g id="turtle-door-slot">
      <g id="turtle-character-wrapper" opacity="0" style="transform-origin: 500px 440px;">
        <g id="turtle-choreography-subgroup">
          <!-- Base coords centered around X=500 -->
          <g transform="translate(-345, 0)">
            <g id="turtle-legs-group">
              <ellipse cx="805" cy="565" fill="#000000" opacity="0.22" rx="28" ry="10"></ellipse>
              <ellipse cx="885" cy="565" fill="#000000" opacity="0.22" rx="28" ry="10"></ellipse>
              <g class="anim-turtle-leg-l">
                <path d="M 790 450 L 788 544 C 788 558, 826 558, 826 544 L 824 450 Z" fill="url(#turtleSkinGrad)"
                  stroke="#2c1e14" stroke-linejoin="round" stroke-width="5"></path>
                <ellipse cx="806" cy="550" fill="url(#turtleSkinGrad)" rx="26" ry="14" stroke="#2c1e14"
                  stroke-width="4.5"></ellipse>
                <path d="M 790 554 Q 792 562 795 554 M 804 556 Q 807 564 810 556 M 818 554 Q 820 562 823 554"
                  fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="2.5"></path>
              </g>
              <g class="anim-turtle-leg-r">
                <path d="M 864 450 L 862 544 C 862 558, 900 558, 900 544 L 898 450 Z" fill="url(#turtleSkinGrad)"
                  stroke="#2c1e14" stroke-linejoin="round" stroke-width="5"></path>
                <ellipse cx="882" cy="550" fill="url(#turtleSkinGrad)" rx="26" ry="14" stroke="#2c1e14"
                  stroke-width="4.5"></ellipse>
                <path d="M 866 554 Q 868 562 871 554 M 880 556 Q 883 564 886 556 M 894 554 Q 896 562 899 554"
                  fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="2.5"></path>
              </g>
            </g>
            <!-- Stretch group: lifts the body (not the legs) when the turtle stands up taller to reach -->
            <g id="turtle-stretch-grp">
            <g id="turtle-body-grp">
              <ellipse cx="845" cy="465" fill="#000000" opacity="0.18" rx="115" ry="20"></ellipse>
              <!-- Back Carapace (Behind arms and torso) -->
              <ellipse cx="845" cy="375" fill="url(#turtleShellGrad)" rx="112" ry="105" stroke="#2c1e14"
                stroke-width="6"></ellipse>
              <path d="M 740 375 Q 845 285 950 375 Q 845 465 740 375 Z" fill="none" stroke="#223717" stroke-width="4.5">
              </path>
              <polygon fill="#3c5b2a" points="845,310 885,340 885,395 845,425 805,395 805,340" stroke="#223717"
                stroke-width="3.5"></polygon>
              <line stroke="#223717" stroke-width="3.5" x1="845" x2="845" y1="310" y2="275"></line>
              <line stroke="#223717" stroke-width="3.5" x1="885" x2="935" y1="340" y2="325"></line>
              <line stroke="#223717" stroke-width="3.5" x1="885" x2="935" y1="395" y2="415"></line>
              <line stroke="#223717" stroke-width="3.5" x1="845" x2="845" y1="425" y2="475"></line>
              <line stroke="#223717" stroke-width="3.5" x1="805" x2="755" y1="395" y2="415"></line>
              <line stroke="#223717" stroke-width="3.5" x1="805" x2="755" y1="340" y2="325"></line>
              <!-- Front Plastron -->
              <ellipse cx="845" cy="382" fill="url(#turtleBellyGrad)" rx="68" ry="78" stroke="#2c1e14"
                stroke-width="4.5"></ellipse>
              <line stroke="#d4c46a" stroke-width="3.5" x1="845" x2="845" y1="308" y2="456"></line>
              <line stroke="#d4c46a" stroke-width="3" x1="785" x2="905" y1="355" y2="355"></line>
              <line stroke="#d4c46a" stroke-width="3" x1="785" x2="905" y1="410" y2="410"></line>
              <!-- Neck & Head -->
              <path d="M 825 280 L 825 320 L 865 320 L 865 280 Z" fill="url(#turtleSkinGrad)" stroke="#2c1e14"
                stroke-width="5"></path>
              <circle cx="845" cy="240" fill="url(#turtleSkinGrad)" r="72" stroke="#2c1e14" stroke-width="5.5"></circle>
              <ellipse cx="800" cy="262" fill="#ff8a80" opacity="0.55" rx="11" ry="7"></ellipse>
              <ellipse cx="890" cy="262" fill="#ff8a80" opacity="0.55" rx="11" ry="7"></ellipse>
              <ellipse cx="845" cy="260" fill="#7cb342" rx="34" ry="22" stroke="#2c1e14" stroke-width="3.5"></ellipse>
              <circle cx="838" cy="250" fill="#2c1e14" r="2.5"></circle>
              <circle cx="852" cy="250" fill="#2c1e14" r="2.5"></circle>
              <!-- Friendly smile -->
              <path d="M 830 268 Q 845 286 860 268 Z" fill="#d32f2f" stroke="#2c1e14" stroke-width="3"></path>
              <path d="M 827 266 Q 845 272 863 266" fill="none" stroke="#2c1e14" stroke-linecap="round"
                stroke-width="3.5"></path>
              <path d="M 837 279 Q 845 276 853 279" fill="#ff8a80"></path>
              <!-- Turtle Eyes with Blink -->
              <g class="anim-blink">
                <g id="turtle-eyes">
                  <ellipse cx="820" cy="226" fill="#2c1e14" rx="9.5" ry="13"></ellipse>
                  <ellipse cx="818" cy="222" fill="#ffffff" rx="4.5" ry="5.5"></ellipse>
                  <circle cx="823" cy="231" fill="#ffffff" r="2.5"></circle>
                  <ellipse cx="870" cy="226" fill="#2c1e14" rx="9.5" ry="13"></ellipse>
                  <ellipse cx="868" cy="222" fill="#ffffff" rx="4.5" ry="5.5"></ellipse>
                  <circle cx="873" cy="231" fill="#ffffff" r="2.5"></circle>
                </g>
              </g>
              <path d="M 808 208 Q 819 201 830 207" fill="none" stroke="#2c1e14" stroke-linecap="round"
                stroke-width="3.5"></path>
              <path d="M 860 207 Q 871 201 882 208" fill="none" stroke="#2c1e14" stroke-linecap="round"
                stroke-width="3.5"></path>
              <!-- Continuous, Anatomically Anchored Turtle Arms (Pivoting at shoulders), in front of head so
                   both flippers can hold the cookie up together -->
              <g id="turtle-arms-pair">
                <!-- Left Arm anchored to left shoulder at (790, 340) -->
                <g id="turtle-arm-l" style="transform-origin: 790px 340px;">
                  <use href="#turtle-arm-l-art"></use>
                </g>
                <!-- Right Arm anchored to right shoulder at (900, 340) -->
                <g id="turtle-arm-r" style="transform-origin: 900px 340px;">
                  <use href="#turtle-arm-r-art"></use>
                </g>
              </g>
            </g>
            </g>
          </g>
        </g>
      </g>
      </g>
      <!-- Door leaves in front of the characters: shown only while a character is outside that door,
           animated in lockstep with the leaves behind the characters -->
      <g class="anim-door-swing door-left-leaf" id="door-left-leaf-front" style="transform-origin: 35px 257.5px;"
        visibility="hidden">
        <use href="#door-left-leaf-art"></use>
      </g>
      <g class="door-right-leaf" id="door-right-leaf-front" style="transform-origin: 965px 257.5px;">
        <use href="#door-right-leaf-art"></use>
      </g>
      <!-- ================= 4. TABLE IN FRONT OF CHARACTERS ================= -->
      <g id="table-group">
        <!-- Table Legs and Shadows -->
        <g stroke="#2c1e14" stroke-width="5">
          <rect fill="#8d5423" height="120" rx="6" width="26" x="230" y="470"></rect>
          <rect fill="#8d5423" height="120" rx="6" width="26" x="744" y="470"></rect>
          <!-- Floor shadow: a soft trapezoid under the rectangular top, from the back legs' feet (Y 590) to the front
               legs' feet (Y 615), widening toward the viewer like the tabletop itself -->
          <polygon fill="#000000" filter="url(#tableShadowBlur)" opacity="0.22" points="165,580 835,580 872,622 128,622"
            stroke="none"></polygon>
          <rect fill="#a05d28" height="135" rx="8" width="32" x="180" y="480"></rect>
          <rect fill="#a05d28" height="135" rx="8" width="32" x="788" y="480"></rect>
        </g>
        <!-- Under-apron rail -->
        <rect fill="#a05d28" height="28" rx="4" stroke="#2c1e14" stroke-width="5" width="680" x="160" y="465"></rect>
        <!-- Tabletop Surface -->
        <g filter="url(#dropShadow)">
          <rect fill="#8d5423" height="30" rx="14" stroke="#2c1e14" stroke-width="5.5" width="740" x="130" y="445">
          </rect>
          <polygon fill="url(#tableTopGrad)" points="120,445 160,420 840,420 880,445" stroke="#2c1e14"
            stroke-linejoin="round" stroke-width="5.5"></polygon>
          <path d="M190 432 L810 432" opacity="0.6" stroke="#f6be86" stroke-linecap="round" stroke-width="3"></path>
        </g>
        <!-- White table runner cloth -->
        <rect fill="#fff9c4" height="14" rx="4" stroke="#2c1e14" stroke-width="3" width="520" x="240" y="430"></rect>
      </g>
      <!-- ================= 5. TWO JARS & JUMBO COOKIES ================= -->
      <!-- 1. LEFT JAR (CENTERED AT X: 330) -->
      <g class="jar-interactive intro-jar1" id="jar-left-group">
        <!-- Hover / Tap focus indicator ring -->
        <ellipse class="transition-opacity duration-300" cx="330" cy="396" fill="none" id="jar-left-glow" opacity="0"
          rx="76" ry="62" stroke="#ffeb3b" stroke-width="8"></ellipse>
        <ellipse cx="330" cy="442" fill="#000000" opacity="0.25" rx="72" ry="14"></ellipse>
        <!-- Jar Back Cavity (opening at rim Y 350, below both characters' shoulders) -->
        <ellipse cx="330" cy="350" fill="#0d47a1" rx="46" ry="13" stroke="#2c1e14" stroke-width="5"></ellipse>
        <ellipse cx="330" cy="350" fill="#061838" rx="40" ry="10"></ellipse>
        <g clip-path="url(#jarCookieClip)">
          <!-- INSIDE LEFT JAR: arms reaching over the rim, then the cookie, then the hands holding it (all placed by
               script); in front of the back rim, behind the front lip and wall -->
          <g id="anim-turtle-lift-cookie">
            <use class="held-arm-bear" href="#bear-arm-r-art" visibility="hidden"></use>
            <use class="held-pad-bear" href="#bear-paw-r-pad-symbol" visibility="hidden"></use>
            <use class="held-arm-l" href="#turtle-arm-l-art" visibility="hidden"></use>
            <use class="held-arm-r" href="#turtle-arm-r-art" visibility="hidden"></use>
            <use class="held-cookie" href="#cookie-art-symbol" visibility="hidden"></use>
            <use class="held-grip-bear" href="#bear-paw-circle-symbol" visibility="hidden"></use>
            <use class="held-grip-bear-pad" href="#bear-paw-r-pad-symbol" visibility="hidden"></use>
            <use class="held-grip-l" href="#turtle-grip-l-symbol" visibility="hidden"></use>
            <use class="held-grip-r" href="#turtle-grip-r-symbol" visibility="hidden"></use>
          </g>
        </g>
        <!-- Front Jar Wall & Front Rim Lip (Layered over the descending and emerging cookie) -->
        <path d="M264 438 C258 408, 266 378, 288 364 L372 364 C394 378, 402 408, 396 438 C392 450, 268 450, 264 438 Z"
          fill="url(#jarUniformBlueGrad)" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5.5"></path>
        <path d="M280 384 C275 402, 278 420, 285 432" fill="none" opacity="0.65" stroke="#e1f5fe" stroke-linecap="round"
          stroke-width="6"></path>
        <!-- Rim lip: a curved band whose top edge follows the front edge of the opening, so the whole opening stays open -->
        <path d="M 284 350 A 46 13 0 0 0 376 350 L 376 368 A 46 13 0 0 1 284 368 Z" fill="#1e88e5" stroke="#2c1e14"
          stroke-linejoin="round" stroke-width="4.5"></path>
        <path d="M 284 350 A 46 13 0 0 0 376 350" fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="5">
        </path>
      </g>
      <!-- Star Sparkles on Left Jar (Intro), moved down to the rim at Y 350 -->
      <g transform="translate(0 54)">
      <g class="intro-stars" filter="url(#sparkleGlow)" id="drop-stars" opacity="0" pointer-events="none">
        <path d="M330 258 L334 274 L350 278 L334 282 L330 298 L326 282 L310 278 L326 274 Z" fill="#ffe082"
          stroke="#ffb300" stroke-width="1.5"></path>
        <path d="M298 250 L301 260 L311 263 L301 266 L298 276 L295 266 L285 263 L295 260 Z" fill="#fff59d"
          stroke="#fbc02d" stroke-width="1.2"></path>
        <path d="M362 252 L365 261 L374 264 L365 267 L362 276 L359 267 L350 264 L359 261 Z" fill="#fff59d"
          stroke="#fbc02d" stroke-width="1.2"></path>
        <circle cx="318" cy="242" fill="#fff9c4" r="3"></circle>
        <circle cx="344" cy="246" fill="#ffe082" r="3.5"></circle>
        <circle cx="282" cy="282" fill="#ffd54f" r="2.8"></circle>
        <circle cx="378" cy="286" fill="#ffe082" r="3.2"></circle>
      </g>
      </g>
      <!-- Star Sparkles on Left Jar (Turtle Lift-Out) -->
      <g transform="translate(0 54)">
      <g class="left-lift-stars-active" filter="url(#sparkleGlow)" id="drop-stars-left-lift" opacity="0"
        pointer-events="none">
        <path d="M330 258 L334 274 L350 278 L334 282 L330 298 L326 282 L310 278 L326 274 Z" fill="#ffe082"
          stroke="#ffb300" stroke-width="1.5"></path>
        <path d="M298 250 L301 260 L311 263 L301 266 L298 276 L295 266 L285 263 L295 260 Z" fill="#fff59d"
          stroke="#fbc02d" stroke-width="1.2"></path>
        <path d="M362 252 L365 261 L374 264 L365 267 L362 276 L359 267 L350 264 L359 261 Z" fill="#fff59d"
          stroke="#fbc02d" stroke-width="1.2"></path>
        <circle cx="318" cy="242" fill="#fff9c4" r="3"></circle>
        <circle cx="344" cy="246" fill="#ffe082" r="3.5"></circle>
        <circle cx="282" cy="282" fill="#ffd54f" r="2.8"></circle>
        <circle cx="378" cy="286" fill="#ffe082" r="3.2"></circle>
      </g>
      </g>
      <!-- 2. RIGHT JAR (CENTERED AT X: 670) WITH IDENTICAL RIM LAYERING AS LEFT JAR -->
      <g class="jar-interactive" id="jar-right-group">
        <!-- Hover / Tap focus indicator ring -->
        <ellipse class="transition-opacity duration-300" cx="670" cy="396" fill="none" id="jar-right-glow" opacity="0"
          rx="76" ry="62" stroke="#ffeb3b" stroke-width="8"></ellipse>
        <ellipse cx="670" cy="442" fill="#000000" opacity="0.25" rx="72" ry="14"></ellipse>
        <!-- Jar Back Cavity (Behind descending cookie) -->
        <ellipse cx="670" cy="350" fill="#0d47a1" rx="46" ry="13" stroke="#2c1e14" stroke-width="5"></ellipse>
        <ellipse cx="670" cy="350" fill="#061838" rx="40" ry="10"></ellipse>
        <!-- INSIDE RIGHT JAR: arms reaching over the rim, the cookie, the hands holding it (placed by script) -->
        <g clip-path="url(#jarRightCookieClip)">
          <g id="anim-right-jar-cookie">
            <use class="held-arm-l" href="#turtle-arm-l-art" visibility="hidden"></use>
            <use class="held-arm-r" href="#turtle-arm-r-art" visibility="hidden"></use>
            <use class="held-cookie" href="#cookie-art-symbol" visibility="hidden"></use>
            <use class="held-grip-bear" href="#bear-paw-circle-symbol" visibility="hidden"></use>
            <use class="held-grip-bear-pad" href="#bear-paw-r-pad-symbol" visibility="hidden"></use>
            <use class="held-grip-l" href="#turtle-grip-l-symbol" visibility="hidden"></use>
            <use class="held-grip-r" href="#turtle-grip-r-symbol" visibility="hidden"></use>
          </g>
        </g>
        <!-- Front Jar Wall & Front Rim Lip (Layered strictly over interior clipped cookie) -->
        <path d="M604 438 C598 408, 606 378, 628 364 L712 364 C734 378, 742 408, 736 438 C732 450, 608 450, 604 438 Z"
          fill="url(#jarUniformBlueGrad)" stroke="#2c1e14" stroke-linejoin="round" stroke-width="5.5"></path>
        <path d="M620 384 C615 402, 618 420, 625 432" fill="none" opacity="0.65" stroke="#e1f5fe" stroke-linecap="round"
          stroke-width="6"></path>
        <!-- Rim lip: a curved band whose top edge follows the front edge of the opening, so the whole opening stays open -->
        <path d="M 624 350 A 46 13 0 0 0 716 350 L 716 368 A 46 13 0 0 1 624 368 Z" fill="#1e88e5" stroke="#2c1e14"
          stroke-linejoin="round" stroke-width="4.5"></path>
        <path d="M 624 350 A 46 13 0 0 0 716 350" fill="none" stroke="#2c1e14" stroke-linecap="round" stroke-width="5">
        </path>
      </g>
      <!-- Star Sparkles on Right Jar (when turtle puts cookie into right jar), moved down to the rim at Y 350 -->
      <g transform="translate(0 54)">
      <g class="right-stars-active" filter="url(#sparkleGlow)" id="drop-stars-right" opacity="0" pointer-events="none">
        <path d="M670 258 L674 274 L690 278 L674 282 L670 298 L666 282 L650 278 L666 274 Z" fill="#ffe082"
          stroke="#ffb300" stroke-width="1.5"></path>
        <path d="M638 250 L641 260 L651 263 L641 266 L638 276 L635 266 L625 263 L635 260 Z" fill="#fff59d"
          stroke="#fbc02d" stroke-width="1.2"></path>
        <path d="M702 252 L705 261 L714 264 L705 267 L702 276 L699 267 L690 264 L699 261 Z" fill="#fff59d"
          stroke="#fbc02d" stroke-width="1.2"></path>
        <circle cx="658" cy="242" fill="#fff9c4" r="3"></circle>
        <circle cx="684" cy="246" fill="#ffe082" r="3.5"></circle>
        <circle cx="622" cy="282" fill="#ffd54f" r="2.8"></circle>
        <circle cx="718" cy="286" fill="#ffe082" r="3.2"></circle>
      </g>
      </g>
      <!-- ================= FREE MOVING COOKIE LAYER (only used once the cookie is clear of both jar rims, so it
           can sit above both jars, and above any arm reaching into a jar) ================= -->
      <g id="anim-carried-cookie" pointer-events="none">
        <use class="held-cookie" href="#cookie-art-symbol" visibility="hidden"></use>
        <use class="held-grip-bear" href="#bear-paw-circle-symbol" visibility="hidden"></use>
        <use class="held-grip-bear-pad" href="#bear-paw-r-pad-symbol" visibility="hidden"></use>
        <use class="held-grip-l" href="#turtle-grip-l-symbol" visibility="hidden"></use>
        <use class="held-grip-r" href="#turtle-grip-r-symbol" visibility="hidden"></use>
      </g>
    </svg>
    </section>
  `;

  let canClick = false;
  let selectedSide = null;
  let sequenceTimeouts = [];

  function clearAllTimeouts() {
    sequenceTimeouts.forEach(t => clearTimeout(t));
    sequenceTimeouts = [];
  }

  function schedule(fn, delay) {
    const id = setTimeout(fn, delay);
    sequenceTimeouts.push(id);
    return id;
  }

  function handleJarHover() {
    if (!canClick) return;
    Sounds.play('hover');
  }

  // ================= HANDS IN JARS & THE HELD COOKIE =================
  // Placed every frame from the characters' real (CSS-animated) arm transforms.
  // - A held cookie is pinched at its rim: its centre sits `pinch` from the hand in a wrist direction (world
  //   angle; 0deg = right, 90deg = straight down) keyframed in *_WRIST_KEYS. The cookie art turns with the
  //   wrist, and keeps still while the turtle holds it between both flippers.
  // - While an arm reaches over a jar's rim, a copy of it is drawn inside that jar's layer (in front of the back
  //   rim, behind the front lip) so it reads as going into the opening rather than behind the jar. Reaches are
  //   switched on/off only while the arm is clear of the opening, so the swap can't be seen.
  // - The cookie and the hands holding it go in a jar's layer when near/inside its opening, and in the free
  //   layer (above the left jar, below the right) once clear of both rims.
  const HANDS = {
    bear: { armId: 'bear-lowering-arm', hand: { x: 383, y: 404 }, pinch: 34, gripDist: 62 },
    l: { armId: 'turtle-arm-l', hand: { x: 752, y: 416 }, pinch: 34.4, gripDist: 54 },
    r: { armId: 'turtle-arm-r', hand: { x: 938, y: 416 }, pinch: 34.4, gripDist: 54 },
  };
  const HAND_OWNERS = { bear: ['bear'], l: ['l', 'r'], r: ['l', 'r'] };
  // [ms since the animation started, wrist angle]; segments line up with the arm keyframes so paths stay true
  const BEAR_WRIST_KEYS = [[0, 245], [432, 245], [1152, 118], [1512, 92]];
  const TURTLE_WRIST_KEYS = {
    // Wrist turns swing the cookie round the side away from the forearm: over the jar and up (left), and up
    // and over before hanging down (right); angles keep increasing so they turn the long way on purpose.
    l: [[1750, 90], [3100, 90], [3600, 300], [4700, 395.5]],
    r: [[5400, null], [6500, 240], [7000, 450]], // null: wherever the cookie is when the right flipper takes it
  };
  const BEAR_PAD_REST_TOES_DEG = 247.7; // toe beans' direction in #bear-paw-grip coordinates
  const BEAR_PAD_SETTLE_MS = 3060;      // pad back to normal as the arm reaches rest (bearArmLowering 85%)
  const LEFT_JAR_LAYER = 'anim-turtle-lift-cookie';
  const FREE_LAYER = 'anim-carried-cookie';
  const RIGHT_JAR_LAYER = 'anim-right-jar-cookie';
  const COOKIE_LAYER_IDS = [LEFT_JAR_LAYER, FREE_LAYER, RIGHT_JAR_LAYER];
  const COOKIE_RADIUS = 41;
  const FREE_LAYER_MAX_Y = 290; // above this the cookie clears both jar rims (back rim top at Y 337)
  const LEFT_JAR_RIGHT_EDGE = 401;
  const RIGHT_JAR_LEFT_EDGE = 599;
  const TWO_HAND_BLEND_MS = 150;
  const COOKIE_FALL_MS = 300;
  const COOKIE_FALL_DEPTH = 100;
  let heldCookie = { mode: 'hidden' };
  let reaching = {};          // hand key -> jar layer id its arm copy is drawn in
  let bearPadRelease = null;  // { t, toes, restToes } when the bear lets go (bear clock, on-screen degrees)

  // Everything that has to line up with the arms runs on the arm animations' own playback time rather than
  // the wall clock, so it stays in step even when the browser starts or throttles CSS animations late.
  const CLOCKS = {
    bear: { elId: 'bear-lowering-arm', animation: 'bearArmLowering' },
    turtle: { elId: 'turtle-choreography-subgroup', animation: 'turtleMoveCookieAction' },
  };
  // [clock ms, action]; times match the poses in bearArmLowering / turtleMoveCookieAction
  const CLOCK_EVENTS = {
    bear: [
      [0, () => { grabCookie('bear', BEAR_WRIST_KEYS, 'bear'); reaching.bear = LEFT_JAR_LAYER; }],
      [1600, () => dropCookie()],             // cookie down inside the opening: let go
      [2000, () => { reaching.bear = null; }], // paw lifted back out above the rim
    ],
    turtle: [
      [1300, () => { reaching.l = LEFT_JAR_LAYER; }],                   // flipper up above the left rim
      [1750, () => grabCookie('l', TURTLE_WRIST_KEYS.l, 'turtle')],     // pinch the cookie at the bottom
      [3100, () => { reaching.l = null; }],                             // cookie lifted clear of the rim
      [4700, () => holdCookieWithBothFlippers()],
      [5400, () => takeCookieWith('r', TURTLE_WRIST_KEYS.r, 'turtle')], // left flipper lets go
      [6500, () => { reaching.r = RIGHT_JAR_LAYER; }],                  // flipper up above the right rim
      [8250, () => hideCookie()],                                       // cookie at the bottom: let go
      [8800, () => { reaching.r = null; }],                             // flipper lifted back out
    ],
  };
  let clockMs = { bear: null, turtle: null };
  let clockEventIndex = { bear: 0, turtle: 0 };
  let sceneFrame = null;
  let sceneTimer = null;
  let lastSceneTick = -Infinity;
  const SCENE_TIMER_FALLBACK_MS = 40;

  function matrixFromTo(fromEl, toEl) {
    return toEl.getScreenCTM().inverse().multiply(fromEl.getScreenCTM());
  }

  function setMatrix(el, m) {
    el.setAttribute('transform', `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);
    el.setAttribute('visibility', 'visible');
  }

  function hide(el) {
    el.setAttribute('visibility', 'hidden');
  }

  function easeInOut(p) {
    // cubic-bezier(0.42, 0, 0.58, 1), the CSS `ease-in-out` the arm keyframes use
    let lo = 0, hi = 1, t = p;
    for (let i = 0; i < 20; i++) {
      t = (lo + hi) / 2;
      const x = 3 * (1 - t) * (1 - t) * t * 0.42 + 3 * (1 - t) * t * t * 0.58 + t * t * t;
      if (x < p) lo = t; else hi = t;
    }
    return 3 * (1 - t) * t * t + t * t * t;
  }

  function keyedAngle(keys, ms) {
    if (ms <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (ms <= keys[i][0]) {
        const [t0, a0] = keys[i - 1];
        const [t1, a1] = keys[i];
        return a0 + (a1 - a0) * easeInOut((ms - t0) / (t1 - t0));
      }
    }
    return keys[keys.length - 1][1];
  }

  function rotationDeg(el) {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return Math.atan2(m.b, m.a) * 180 / Math.PI;
  }

  function wrapDeg(d) {
    return ((d + 540) % 360) - 180;
  }

  function pickCookieLayer(x, y) {
    if (y > FREE_LAYER_MAX_Y && x - COOKIE_RADIUS < LEFT_JAR_RIGHT_EDGE) return LEFT_JAR_LAYER;
    if (y > FREE_LAYER_MAX_Y && x + COOKIE_RADIUS > RIGHT_JAR_LEFT_EDGE) return RIGHT_JAR_LAYER;
    return FREE_LAYER;
  }

  function handPoint(key, armToSvg) {
    const p = HANDS[key].hand;
    return new DOMPoint(p.x, p.y).matrixTransform(armToSvg[key]);
  }

  // Bear's paw pad faces the cookie he's holding, then turns back to normal as his arm returns to rest
  function updateBearPad() {
    let deg = 0;
    if (clockMs.bear !== null) {
      const armDeg = rotationDeg(document.getElementById('bear-lowering-arm'));
      if (heldCookie.mode === 'held' && heldCookie.hand === 'bear') {
        deg = wrapDeg(heldCookie.alpha - BEAR_PAD_REST_TOES_DEG - armDeg);
      } else if (bearPadRelease) {
        // Lowering the cookie turned the toes counterclockwise; bringing the paw back out and up to rest turns
        // them back clockwise
        const relaxFrom = bearPadRelease.t;
        const p = Math.min(Math.max((clockMs.bear - relaxFrom) / (BEAR_PAD_SETTLE_MS - relaxFrom), 0), 1);
        const toes = bearPadRelease.toes + (bearPadRelease.restToes - bearPadRelease.toes) * easeInOut(p);
        deg = toes - BEAR_PAD_REST_TOES_DEG - armDeg;
      }
    }
    document.getElementById('bear-paw-grip').setAttribute('transform', `rotate(${deg} 383 404)`);
  }

  // Copies of reaching arms inside the jar layers
  function updateReachCopies(svg, armToSvg) {
    COOKIE_LAYER_IDS.forEach(layerId => {
      const layer = document.getElementById(layerId);
      const svgToLayer = matrixFromTo(svg, layer);
      ['bear', 'l', 'r'].forEach(key => {
        const arm = layer.querySelector(`.held-arm-${key}`);
        if (!arm) return;
        const extra = key === 'bear' ? layer.querySelector('.held-pad-bear') : null;
        if (reaching[key] !== layerId) {
          hide(arm);
          if (extra) hide(extra);
          return;
        }
        setMatrix(arm, svgToLayer.multiply(armToSvg[key]));
        if (extra) {
          const extraSource = document.getElementById('bear-paw-grip');
          setMatrix(extra, svgToLayer.multiply(matrixFromTo(extraSource, svg)));
        }
      });
    });
  }

  function heldCookieCentre(armToSvg) {
    const ms = clockMs[heldCookie.clock] ?? heldCookie.lastMs;
    heldCookie.lastMs = ms;
    if (heldCookie.mode === 'held') {
      const key = heldCookie.hand;
      const alpha = keyedAngle(heldCookie.keys, ms);
      if (heldCookie.alpha !== undefined) heldCookie.rot += alpha - heldCookie.alpha;
      heldCookie.alpha = alpha;
      const h = handPoint(key, armToSvg);
      const a = alpha * Math.PI / 180;
      return { x: h.x + HANDS[key].pinch * Math.cos(a), y: h.y + HANDS[key].pinch * Math.sin(a) };
    }
    if (heldCookie.mode === 'both') {
      // Pinched between both flippers: on both rims, hanging below the line between them
      const hl = handPoint('l', armToSvg);
      const hr = handPoint('r', armToSvg);
      const dx = hr.x - hl.x, dy = hr.y - hl.y;
      const d = Math.hypot(dx, dy) || 1;
      const sag = Math.sqrt(Math.max(0, HANDS.l.pinch * HANDS.l.pinch - (d / 2) * (d / 2)));
      const both = { x: (hl.x + hr.x) / 2 - dy / d * sag, y: (hl.y + hr.y) / 2 + dx / d * sag };
      const w = Math.min(Math.max((ms - heldCookie.blendStart) / TWO_HAND_BLEND_MS, 0), 1);
      return {
        x: heldCookie.entry.x + (both.x - heldCookie.entry.x) * w,
        y: heldCookie.entry.y + (both.y - heldCookie.entry.y) * w,
      };
    }
    const t = Math.min(Math.max((ms - heldCookie.fallStart) / COOKIE_FALL_MS, 0), 1);
    return { x: heldCookie.fallX, y: heldCookie.fallY + COOKIE_FALL_DEPTH * t * t };
  }

  function advanceCookie(armToSvg) {
    if (heldCookie.mode === 'falling' && clockMs[heldCookie.clock] - heldCookie.fallStart >= COOKIE_FALL_MS) {
      hideCookie();
    }
    if (heldCookie.mode === 'hidden') return;
    const c = heldCookieCentre(armToSvg);
    heldCookie.x = c.x;
    heldCookie.y = c.y;
  }

  function renderCookie(svg, armToSvg) {
    if (heldCookie.mode === 'hidden') {
      COOKIE_LAYER_IDS.forEach(id => {
        document.getElementById(id).querySelectorAll('.held-cookie, [class^="held-grip"]').forEach(hide);
      });
      return;
    }

    const c = { x: heldCookie.x, y: heldCookie.y };
    const holders = heldCookie.mode === 'falling' ? [] : HAND_OWNERS[heldCookie.hand];
    const targetId = pickCookieLayer(c.x, c.y);

    COOKIE_LAYER_IDS.forEach(id => {
      const layer = document.getElementById(id);
      const cookie = layer.querySelector('.held-cookie');
      const grips = {
        bear: [layer.querySelector('.held-grip-bear'), layer.querySelector('.held-grip-bear-pad')],
        l: [layer.querySelector('.held-grip-l')],
        r: [layer.querySelector('.held-grip-r')],
      };
      if (id !== targetId) {
        hide(cookie);
        Object.values(grips).flat().forEach(hide);
        return;
      }
      const svgToLayer = matrixFromTo(svg, layer);
      const p = new DOMPoint(c.x, c.y).matrixTransform(svgToLayer);
      cookie.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${heldCookie.rot})`);
      cookie.setAttribute('visibility', 'visible');

      Object.entries(grips).forEach(([key, els]) => {
        const h = holders.includes(key) && handPoint(key, armToSvg);
        if (!h || Math.hypot(h.x - c.x, h.y - c.y) >= HANDS[key].gripDist) {
          els.forEach(hide);
          return;
        }
        setMatrix(els[0], svgToLayer.multiply(armToSvg[key]));
        if (els[1]) setMatrix(els[1], svgToLayer.multiply(matrixFromTo(document.getElementById('bear-paw-grip'), svg)));
      });
    });
  }

  function updateClocks() {
    Object.entries(CLOCKS).forEach(([name, clock]) => {
      const anim = document.getElementById(clock.elId).getAnimations()
        .find(a => a.animationName === clock.animation);
      clockMs[name] = anim && anim.currentTime !== null ? anim.currentTime : null;
      if (clockMs[name] === null) return;
      const events = CLOCK_EVENTS[name];
      while (clockEventIndex[name] < events.length && events[clockEventIndex[name]][0] <= clockMs[name]) {
        events[clockEventIndex[name]++][1]();
      }
    });
  }

  function sceneTick() {
    lastSceneTick = performance.now();
    updateClocks();
    const svg = document.getElementById('scene-svg');
    const armToSvg = {};
    Object.entries(HANDS).forEach(([key, hand]) => {
      armToSvg[key] = matrixFromTo(document.getElementById(hand.armId), svg);
    });
    advanceCookie(armToSvg);
    updateBearPad(); // before anything copies the pad's pose
    renderCookie(svg, armToSvg);
    updateReachCopies(svg, armToSvg);
  }

  function sceneFrameLoop() {
    sceneFrame = requestAnimationFrame(sceneFrameLoop);
    sceneTick();
  }

  // Some embedded browsers keep playing CSS animations but stop delivering animation frames; without frames
  // the cookie and the arm copies would freeze while the characters move on. A timer takes over until frames
  // arrive again.
  function startSceneTicks() {
    if (sceneFrame) cancelAnimationFrame(sceneFrame);
    sceneFrame = requestAnimationFrame(sceneFrameLoop);
    if (!sceneTimer) {
      sceneTimer = setInterval(() => {
        if (performance.now() - lastSceneTick > SCENE_TIMER_FALLBACK_MS) sceneTick();
      }, 16);
    }
  }

  // clock: which CLOCKS entry the wrist keys are timed against
  function grabCookie(handKey, keys, clock) {
    heldCookie = { mode: 'held', hand: handKey, keys, clock, rot: heldCookie.rot || 0 };
  }

  // The turtle's right flipper joins the left: the cookie is now pinched between both
  function holdCookieWithBothFlippers() {
    heldCookie = {
      mode: 'both', hand: 'l', clock: 'turtle', rot: heldCookie.rot,
      entry: { x: heldCookie.x, y: heldCookie.y }, blendStart: clockMs.turtle,
    };
  }

  // The left flipper lets go; the right flipper keeps its pinch where it is and carries on
  function takeCookieWith(handKey, keys, clock) {
    const svg = document.getElementById('scene-svg');
    const h = handPoint(handKey, { [handKey]: matrixFromTo(document.getElementById(HANDS[handKey].armId), svg) });
    const start = Math.atan2(heldCookie.y - h.y, heldCookie.x - h.x) * 180 / Math.PI;
    // first turn goes the short way from wherever the cookie is; later turns go exactly as keyed
    const resolved = [[keys[0][0], start], [keys[1][0], start + wrapDeg(keys[1][1] - start)]];
    for (let i = 2; i < keys.length; i++) {
      resolved.push([keys[i][0], resolved[i - 1][1] + (keys[i][1] - keys[i - 1][1])]);
    }
    heldCookie = { mode: 'held', hand: handKey, keys: resolved, clock, rot: heldCookie.rot, alpha: start };
  }

  // Let go: the cookie falls straight down from where it was held, then is hidden
  function dropCookie() {
    const clock = heldCookie.clock;
    if (heldCookie.hand === 'bear') {
      // toes' on-screen direction when he lets go, and the rest direction reached by turning clockwise
      const toes = heldCookie.alpha;
      let restToes = BEAR_PAD_REST_TOES_DEG;
      while (restToes < toes) restToes += 360;
      bearPadRelease = { t: clockMs.bear, toes, restToes };
    }
    heldCookie = {
      mode: 'falling', clock, x: heldCookie.x, y: heldCookie.y, fallX: heldCookie.x, fallY: heldCookie.y,
      rot: heldCookie.rot, fallStart: clockMs[clock],
    };
  }

  function hideCookie() {
    heldCookie = { mode: 'hidden' };
  }

  // ================= DOORWAYS =================
  // A character who has stepped through a doorway is clipped to the opening and drawn behind that
  // door's front leaf, so the door closing hides them. Switch only at the DOORWAY walk pose, where the
  // character fits entirely inside the opening, so the change is invisible.
  const DOORWAYS = {
    left: { clip: 'left-door-clip', frontLeaf: 'door-left-leaf-front' },
    right: { clip: 'right-door-clip', frontLeaf: 'door-right-leaf-front' },
  };
  const DOOR_ANIMATION_CLASSES = ['anim-door-swing', 'anim-door-left-return', 'anim-door-right-active', 'anim-door-right-exit'];

  function setCharacterOutside(slotId, side, outside) {
    const slot = document.getElementById(slotId);
    if (outside) slot.setAttribute('clip-path', `url(#${DOORWAYS[side].clip})`);
    else slot.removeAttribute('clip-path');
    document.getElementById(DOORWAYS[side].frontLeaf).setAttribute('visibility', outside ? 'visible' : 'hidden');
  }

  // Applies a swing animation to both copies of a door leaf at once so they stay in lockstep
  function setDoorAnimation(leafClass, animationClass) {
    document.querySelectorAll(`.${leafClass}`).forEach(leaf => {
      leaf.classList.remove(...DOOR_ANIMATION_CLASSES);
      void leaf.getBoundingClientRect();
      if (animationClass) leaf.classList.add(animationClass);
    });
  }

  function startSequence() {
    clearAllTimeouts();
    canClick = false;
    selectedSide = null;

    const bear = document.getElementById('bear-character-wrapper');
    const turtle = document.getElementById('turtle-character-wrapper');
    const turtleChoreo = document.getElementById('turtle-choreography-subgroup');
    const turtleArmL = document.getElementById('turtle-arm-l');
    const turtleArmR = document.getElementById('turtle-arm-r');
    const turtleStretch = document.getElementById('turtle-stretch-grp');
    const leftJar = document.getElementById('jar-left-group');
    const leftStarsLift = document.getElementById('drop-stars-left-lift');
    const rightJar = document.getElementById('jar-right-group');
    const rightStars = document.getElementById('drop-stars-right');

    // Reset highlights & state classes
    document.getElementById('jar-left-glow').setAttribute('opacity', '0');
    document.getElementById('jar-right-glow').setAttribute('opacity', '0');
    bear.classList.remove('bear-walking', 'anim-bear-return', 'anim-bear-departure');
    bear.style.transform = '';
    bear.style.opacity = '1';
    turtle.classList.remove('turtle-walking', 'anim-turtle-active', 'anim-turtle-exit-active');
    turtleChoreo.classList.remove('turtle-move-cookie');
    turtleStretch.classList.remove('turtle-stretch-active');
    turtleArmL.classList.remove('turtle-left-arm-active');
    turtleArmR.classList.remove('turtle-right-arm-active');
    hideCookie();
    reaching = {};
    bearPadRelease = null;
    clockEventIndex = { bear: 0, turtle: 0 };
    leftJar.classList.remove('left-jar-lift-pop-active');
    leftStarsLift.classList.remove('left-lift-stars-active');
    rightJar.classList.remove('right-jar-pop-active');
    rightStars.classList.remove('right-stars-active');
    setDoorAnimation('door-right-leaf', null);
    setDoorAnimation('door-left-leaf', 'anim-door-swing');
    setCharacterOutside('bear-door-slot', 'left', false);
    setCharacterOutside('turtle-door-slot', 'right', true);
    turtle.setAttribute('opacity', '0');

    // Restart intro & bear animation classes cleanly by triggering reflow
    const elementsToRestart = [
      { id: 'bear-lowering-arm', cls: 'intro-arm' },
      { id: 'jar-left-group', cls: 'intro-jar1' },
      { id: 'drop-stars', cls: 'intro-stars' },
      { id: 'bear-pupils', cls: 'intro-gaze' },
      { id: 'bear-character-wrapper', cls: 'anim-bear-departure' }
    ];

    elementsToRestart.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        el.classList.remove(item.cls);
        void el.getBoundingClientRect();
        el.classList.add(item.cls);
      }
    });

    // ================= CHOREOGRAPHY TIMELINE =================
    // 0. Bear starts out holding the cookie up in his right paw. Grabbing, letting go and the arm copies in the
    //    jars follow the arm animations' own clocks (CLOCK_EVENTS); this timeline handles sounds and classes.
    startSceneTicks();

    // 1. Swish sound as the bear lowers the cookie into the left jar
    schedule(() => {
      Sounds.play('swish');
    }, 1200);

    // 2. Plop & stars chime as the cookie sinks out of sight
    schedule(() => {
      Sounds.play('drop');
    }, 1750);

    // 3. Bear starts walking directly towards the left door (t = 2650ms)
    schedule(() => {
      bear.classList.add('bear-walking');
      Sounds.play('footstep');
    }, 2650);

    // Bear footsteps along path to door
    [3000, 3350, 3700, 4050, 4400, 4750, 5100, 5450, 5800, 6100].forEach(t => {
      schedule(() => {
        Sounds.play('footstep');
      }, t);
    });

    // 4. Left Door opens smoothly as the bear approaches the doorway (~3900ms)
    schedule(() => {
      Sounds.play('doorCreak');
    }, 3900);

    // Bear is passing through the doorway (departure 70% = 5250ms): from here on he is outside, behind the door
    schedule(() => {
      setCharacterOutside('bear-door-slot', 'left', true);
    }, 5310);

    // 5. Left Door swings shut behind the bear as he walks off up the path (~6300ms)
    schedule(() => {
      Sounds.play('doorShut');
    }, 6300);

    schedule(() => {
      bear.classList.remove('bear-walking');
    }, 7500);

    // 6. Right door begins swinging open for Turtle entrance (~6500ms)
    schedule(() => {
      Sounds.play('doorCreak');
      setDoorAnimation('door-right-leaf', 'anim-door-right-active');
    }, 6500);

    // Legs step (with a footstep sound every 400ms) exactly while the body is moving: windows match the walk and
    // choreography keyframes
    const walkWindow = (character, walkingClass, sound, from, to) => {
      schedule(() => { character.classList.add(walkingClass); Sounds.play(sound); }, from);
      for (let t = from + 400; t < to - 100; t += 400) schedule(() => Sounds.play(sound), t);
      schedule(() => character.classList.remove(walkingClass), to);
    };

    // 7. Turtle waits up the outdoor path while the door opens (~7100ms), then walks down it, through the right
    //    doorway and to table center (entrance 20%-90% = 8140-11780ms)
    schedule(() => {
      turtle.classList.add('anim-turtle-active');
    }, 7100);
    walkWindow(turtle, 'turtle-walking', 'turtleStep', 8200, 11700);

    // Turtle is passing through the doorway (entrance 52% = 9804ms): from here on he is inside the room
    schedule(() => {
      setCharacterOutside('turtle-door-slot', 'right', false);
    }, 9740);

    // 8. Right door shuts behind turtle (~10550ms)
    schedule(() => {
      Sounds.play('doorShut');
    }, 10550);

    // 9. Turtle reaches center behind table (~11700ms) and pauses

    // ================= TURTLE COOKIE RELOCATION CHOREOGRAPHY =================
    // 10. Turtle's left flipper rises behind the left jar (t = 12000ms, start of 10s choreography)
    schedule(() => {
      turtleChoreo.classList.add('turtle-move-cookie');
      turtleStretch.classList.add('turtle-stretch-active');
      turtleArmL.classList.add('turtle-left-arm-active');
      turtleArmR.classList.add('turtle-right-arm-active');
      leftJar.classList.add('left-jar-lift-pop-active');
      leftStarsLift.classList.add('left-lift-stars-active');
      rightJar.classList.add('right-jar-pop-active');
      rightStars.classList.add('right-stars-active');
    }, 12000);

    // Turtle sidesteps behind the left jar as his flipper rises over the rim and dips in (~12450-13700ms)
    walkWindow(turtle, 'turtle-walking', 'turtleStep', 12450, 13700);

    // 11. Flipper pinches the cookie at the bottom of the jar (~13750ms); turtle lifts it straight up, stepping
    //     back out from behind the jar (~13900-14700ms)
    schedule(() => {
      Sounds.play('liftSwish');
    }, 13900);
    walkWindow(turtle, 'turtle-walking', 'turtleStep', 13900, 14700);

    // Cookie is clear of the rim (~15100ms)
    schedule(() => {
      Sounds.play('cookieLift');
    }, 15100);

    // 12. Turtle steps back to center bringing the cookie in front of him; right flipper rises to meet it; both
    //     flippers then pinch it (~16700ms)
    schedule(() => {
      Sounds.play('carryGlide');
    }, 15600);
    walkWindow(turtle, 'turtle-walking', 'turtleStep', 15700, 16625);

    // 13. Left flipper lets go; the right flipper carries the cookie over to the right jar (~17400ms)
    schedule(() => {
      Sounds.play('carryGlide');
    }, 17400);
    walkWindow(turtle, 'turtle-walking', 'turtleStep', 17500, 18425);

    // Turtle sidesteps behind the right jar as he lowers the cookie in (~19450-20200ms), then steps back out and
    // returns to center as his flipper comes back up (~20400-21900ms)
    walkWindow(turtle, 'turtle-walking', 'turtleStep', 19450, 20200);
    walkWindow(turtle, 'turtle-walking', 'turtleStep', 20400, 21900);

    // 14. Right flipper lowers the cookie straight down into the right jar, plop + sparkle as it goes in
    schedule(() => {
      Sounds.play('swish');
    }, 19000);

    schedule(() => {
      Sounds.play('drop');
    }, 19300);

    // Cookie is at the bottom of the right jar (~20250ms); the flipper lets go and lifts back out, then the arm
    // drops behind the jar to rest (~20800ms)

    // 15. Turtle is back at center pose with arms at rest (~22000ms)
    schedule(() => {
      turtle.classList.remove('turtle-walking');
      turtleChoreo.classList.remove('turtle-move-cookie');
      turtleStretch.classList.remove('turtle-stretch-active');
      turtleArmL.classList.remove('turtle-left-arm-active');
      turtleArmR.classList.remove('turtle-right-arm-active');
    }, 22000);

    // ================= EXIT SEQUENCE FOR MR. TURTLE =================
    // 16. Mr. Turtle starts walking along exact reverse path back to the right door (~22400ms)
    schedule(() => {
      turtle.classList.remove('anim-turtle-active');
      void turtle.offsetWidth;
      turtle.classList.add('anim-turtle-exit-active', 'turtle-walking');
      Sounds.play('turtleStep');
    }, 22400);

    // Footsteps during exit walk back towards the right door
    [22800, 23200, 23600, 24000, 24400, 24800, 25200, 25600, 26000].forEach(t => {
      schedule(() => {
        Sounds.play('turtleStep');
      }, t);
    });

    // 17. Right door swings open as Turtle approaches (~23200ms)
    schedule(() => {
      Sounds.play('doorCreak');
      setDoorAnimation('door-right-leaf', 'anim-door-right-exit');
    }, 23200);

    // Turtle is passing through the doorway (exit 48% = 24896ms): from here on he is outside, behind the door
    schedule(() => {
      setCharacterOutside('turtle-door-slot', 'right', true);
    }, 24960);

    // 18. Right door clicks shut behind Turtle as he walks off up the path (~26080ms)
    schedule(() => {
      Sounds.play('doorShut');
    }, 26080);

    schedule(() => {
      turtle.classList.remove('turtle-walking');
    }, 26800);

    // ================= MR. BEAR RE-ENTRANCE SEQUENCE =================
    // 20. Left door begins swinging open for Mr. Bear's return (~28200ms)
    schedule(() => {
      Sounds.play('doorCreak');
      setDoorAnimation('door-left-leaf', 'anim-door-left-return');
    }, 28200);

    // 21. Mr. Bear walks back down the outdoor path toward the left doorway (~28700ms)
    schedule(() => {
      bear.classList.remove('anim-bear-departure');
      void bear.offsetWidth;
      bear.classList.add('anim-bear-return', 'bear-walking');
      Sounds.play('footstep');
    }, 28700);

    // Bear is passing through the doorway (return 32% = 30364ms): from here on he is inside the room
    schedule(() => {
      setCharacterOutside('bear-door-slot', 'left', false);
    }, 30300);

    // Bear footsteps mirroring his walk back from left door to center table
    [29100, 29500, 29900, 30300, 30700, 31100, 31500, 31900, 32300, 32700].forEach(t => {
      schedule(() => {
        Sounds.play('footstep');
      }, t);
    });

    // 22. Left door shuts behind Mr. Bear (~31600ms)
    schedule(() => {
      Sounds.play('doorShut');
    }, 31600);

    // 23. Mr. Bear arrives back at his original position behind the table and stops walking (return 88% = 33276ms)
    schedule(() => {
      bear.classList.remove('bear-walking');
    }, 33150);

    // ================= 24. ONLY ONCE MR. BEAR IS FIRMLY IN POSITION: JARS BECOME CLICKABLE (~34400ms) =================
    schedule(() => {
      canClick = true;

      // Gentle guide ring pulse to invite child's choice without revealing answer
      document.getElementById('jar-left-glow').setAttribute('opacity', '0.6');
      document.getElementById('jar-right-glow').setAttribute('opacity', '0.6');
      schedule(() => {
        if (!selectedSide) {
          document.getElementById('jar-left-glow').setAttribute('opacity', '0');
          document.getElementById('jar-right-glow').setAttribute('opacity', '0');
        }
      }, 750);

      Sounds.play('prompt');
    }, 34400);
  }

  function handleJarChoice(side) {
    if (!canClick) return;

    selectedSide = side;
    Sounds.play('select');

    // Neutral selection outline highlight on the chosen jar
    document.getElementById('jar-left-glow').setAttribute('opacity', side === 'left' ? '0.85' : '0');
    document.getElementById('jar-right-glow').setAttribute('opacity', side === 'right' ? '0.85' : '0');

    // Dispatch neutral event for parent or external tracking
    window.dispatchEvent(new CustomEvent('jarSelected', { detail: { side: side } }));
  }

  function setup(screen) {
    ['left', 'right'].forEach(side => {
      const jar = screen.querySelector(`#jar-${side}-group`);
      jar.addEventListener('click', () => handleJarChoice(side));
      jar.addEventListener('mouseenter', handleJarHover);
    });
  }

  Storyline.addScreen({ id: 's4', markup, setup, enter: startSequence });
})();
