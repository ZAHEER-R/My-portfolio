/* =========================================================
   Zaheer Rachakula — Portfolio
   Vanilla JS + GSAP + ScrollTrigger
   ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------------------------------------------------
   0. BOOT SEQUENCE
--------------------------------------------------------- */
const bootLines = [
  '$ initializing environment...',
  '$ loading profile:  Zaheer Rachakula',
  '$ role:             Software Engineer / Entrepreneur',
  '$ status:           Directionless (compiling purpose...)',
  '$ mounting sections: about, stack, projects, play, contact',
  '$ done. welcome.'
];

function runBoot(){
  const el = document.getElementById('boot-lines');
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to('#boot-overlay', {
        opacity: 0, duration: .6, ease: 'power2.out',
        onComplete: () => {
          document.getElementById('boot-overlay').style.display = 'none';
          playHeroIntro();
        }
      });
    }
  });

  bootLines.forEach((line, i) => {
    const p = document.createElement('p');
    p.style.margin = '0 0 4px';
    el.appendChild(p);
    const chars = { count: 0 };
    tl.to(chars, {
      count: line.length,
      duration: Math.min(line.length * 0.018, 0.7),
      ease: 'none',
      onUpdate: () => { p.textContent = line.slice(0, Math.floor(chars.count)); }
    }, i === 0 ? 0 : '+=0.05');
  });
}

/* Respect reduced motion: skip boot animation entirely */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.getElementById('boot-overlay').style.display = 'none';
  gsap.set('.reveal-line, .reveal-up', { opacity: 1, y: 0 });
} else {
  runBoot();
}

/* ---------------------------------------------------------
   1. HERO INTRO (after boot)
--------------------------------------------------------- */
function playHeroIntro(){
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.eyebrow', { y: 16, opacity: 0, duration: .6 })
    .from('.hero-title .line', { y: '110%', opacity: 0, duration: .8, stagger: .12 }, '-=.3')
    .from('.hero-sub', { y: 16, opacity: 0, duration: .6 }, '-=.35')
    .from('.hero-cta', { y: 16, opacity: 0, duration: .6 }, '-=.4')
    .from('.hero-tags span', { y: 10, opacity: 0, duration: .4, stagger: .06 }, '-=.35')
    .from('.hero-terminal', { y: 30, opacity: 0, duration: .7 }, '-=.3', )
    .add(typeTerminal, '-=.2');

  gsap.set('.reveal-line, .hero-terminal, .hero-cta, .hero-tags span', { clearProps: 'none' });
}

/* Typewriter effect inside the hero terminal window */
function typeTerminal(){
  const el = document.getElementById('term-typed');
  const script = [
    { d: 500, t: '$ whoami\n' },
    { d: 300, t: '> zaheer_rachakula — engineer, builder, directionless (allegedly)\n\n' },
    { d: 300, t: '$ cat focus.txt\n' },
    { d: 300, t: '> backend systems · automation · student platforms\n\n' },
    { d: 300, t: '$ ./ship.sh --project "Z-VITPYQ"\n' },
    { d: 300, t: '> deployed to vitpyqpapers.in ✓\n\n' },
    { d: 300, t: '$ echo $STATUS\n' },
    { d: 300, t: '> open to opportunities_' }
  ];

  let str = '';
  const tl = gsap.timeline();
  script.forEach(line => {
    const chars = { i: 0 };
    tl.to(chars, {
      i: line.t.length,
      duration: line.t.length * 0.018,
      ease: 'none',
      onUpdate: () => { el.textContent = str + line.t.slice(0, Math.floor(chars.i)); }
    }, '+=' + (line.d / 1000));
    tl.add(() => { str += line.t; });
  });
}

/* ---------------------------------------------------------
   2. SCROLL PROGRESS RAIL
--------------------------------------------------------- */
gsap.registerPlugin(ScrollTrigger);

gsap.to('#progress-fill', {
  width: '100%',
  ease: 'none',
  scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
});

/* ---------------------------------------------------------
   3. SCROLL REVEALS
--------------------------------------------------------- */
gsap.utils.toArray('.reveal-up').forEach((el) => {
  gsap.from(el, {
    y: 40, opacity: 0, duration: .8, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
  });
});

/* Section command labels get a little cursor blink-in */
gsap.utils.toArray('.cmd-label').forEach((el) => {
  gsap.from(el, {
    opacity: 0, x: -12, duration: .5,
    scrollTrigger: { trigger: el, start: 'top 90%', once: true }
  });
});

/* ---------------------------------------------------------
   4. COUNTERS (GitHub stats)
--------------------------------------------------------- */
gsap.utils.toArray('.stat-num').forEach((el) => {
  const target = parseInt(el.dataset.target, 10);
  const counter = { val: 0 };
  ScrollTrigger.create({
    trigger: el, start: 'top 92%', once: true,
    onEnter: () => {
      gsap.to(counter, {
        val: target, duration: 1.4, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.floor(counter.val); }
      });
    }
  });
});

/* ---------------------------------------------------------
   5. SKILL BARS
--------------------------------------------------------- */
gsap.utils.toArray('.bar-item').forEach((el) => {
  const pct = el.dataset.pct;
  const fill = el.querySelector('.bar-fill');
  ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => gsap.to(fill, { width: pct + '%', duration: 1.1, ease: 'power2.out' })
  });
});

/* ---------------------------------------------------------
   6. INFINITE MARQUEE
--------------------------------------------------------- */
const track = document.getElementById('marquee-track');
if (track) {
  track.innerHTML += track.innerHTML; // duplicate for seamless loop
  gsap.to(track, {
    xPercent: -50, duration: 22, ease: 'none', repeat: -1
  });
}

/* ---------------------------------------------------------
   7. CUSTOM CURSOR + MAGNETIC BUTTONS
--------------------------------------------------------- */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  gsap.set(dot, { x: mouseX, y: mouseY });
});
gsap.ticker.add(() => {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  gsap.set(ring, { x: ringX, y: ringY });
});

document.querySelectorAll('a, button, .ttt-cell').forEach((el) => {
  el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
  el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
});

document.querySelectorAll('.magnetic').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const relX = e.clientX - r.left - r.width / 2;
    const relY = e.clientY - r.top - r.height / 2;
    gsap.to(btn, { x: relX * 0.3, y: relY * 0.4, duration: .3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: .4, ease: 'elastic.out(1, 0.4)' });
  });
});

/* ---------------------------------------------------------
   8. ACTIVE NAV LINK ON SCROLL
--------------------------------------------------------- */
gsap.utils.toArray('main .section, .hero').forEach((sec) => {
  ScrollTrigger.create({
    trigger: sec, start: 'top 50%', end: 'bottom 50%',
    onEnter: () => setActiveNav(sec.id),
    onEnterBack: () => setActiveNav(sec.id)
  });
});
function setActiveNav(id){
  document.querySelectorAll('[data-nav]').forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + id ? 'var(--accent)' : '';
  });
}

/* ---------------------------------------------------------
   9. TIC TAC TOE
--------------------------------------------------------- */
(function ticTacToe(){
  const boardEl = document.getElementById('ttt-board');
  const statusEl = document.getElementById('ttt-status');
  const resetBtn = document.getElementById('ttt-reset');
  let board, gameOver;

  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function init(){
    board = Array(9).fill(null);
    gameOver = false;
    statusEl.textContent = 'Your turn — X';
    boardEl.innerHTML = '';
    board.forEach((_, i) => {
      const cell = document.createElement('div');
      cell.className = 'ttt-cell';
      cell.dataset.i = i;
      cell.addEventListener('click', () => handleMove(i));
      boardEl.appendChild(cell);
    });
  }

  function handleMove(i){
    if (gameOver || board[i]) return;
    place(i, 'X');
    if (checkEnd('X', 'You win! 🎉')) return;
    gameOver = true; // lock while bot "thinks"
    statusEl.textContent = 'Bot thinking...';
    setTimeout(() => {
      gameOver = false;
      const move = botMove();
      if (move !== -1) place(move, 'O');
      if (checkEnd('O', 'Bot wins. Rematch?')) return;
      statusEl.textContent = 'Your turn — X';
    }, 450);
  }

  function place(i, mark){
    board[i] = mark;
    const cell = boardEl.children[i];
    cell.textContent = mark;
    gsap.from(cell, { scale: 0, duration: .3, ease: 'back.out(2)' });
  }

  function checkEnd(mark, msg){
    if (WINS.some(line => line.every(idx => board[idx] === mark))) {
      statusEl.textContent = msg;
      gameOver = true;
      return true;
    }
    if (board.every(Boolean)) {
      statusEl.textContent = "It's a draw.";
      gameOver = true;
      return true;
    }
    return false;
  }

  function botMove(){
    const empty = board.map((v, i) => v ? -1 : i).filter(i => i !== -1);
    // try to win
    for (const i of empty) { board[i] = 'O'; if (WINS.some(l => l.every(idx => board[idx]==='O'))) { board[i]=null; return i; } board[i] = null; }
    // block player
    for (const i of empty) { board[i] = 'X'; if (WINS.some(l => l.every(idx => board[idx]==='X'))) { board[i]=null; return i; } board[i] = null; }
    // take center
    if (board[4] === null) return 4;
    return empty.length ? empty[Math.floor(Math.random() * empty.length)] : -1;
  }

  resetBtn.addEventListener('click', init);
  init();
})();

/* ---------------------------------------------------------
   10. REFLEX CATCH MINI-GAME
--------------------------------------------------------- */
(function reflexCatch(){
  const stage = document.getElementById('catch-stage');
  const startBtn = document.getElementById('catch-start');
  const scoreEl = document.getElementById('catch-score');
  const timeEl = document.getElementById('catch-time');
  let score = 0, timeLeft = 20, spawnTimer, tickTimer, running = false;

  function spawnTarget(){
    if (!running) return;
    const target = document.createElement('div');
    target.className = 'catch-target';
    const w = stage.clientWidth, h = stage.clientHeight;
    const x = Math.random() * (w - 44) + 6;
    const y = Math.random() * (h - 44) + 6;
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    stage.appendChild(target);

    gsap.fromTo(target, { scale: 0 }, { scale: 1, duration: .25, ease: 'back.out(2)' });
    const life = gsap.to(target, {
      scale: 0, opacity: 0, duration: 1.1, delay: .9, ease: 'power1.in',
      onComplete: () => target.remove()
    });

    target.addEventListener('click', () => {
      life.kill();
      score++;
      scoreEl.textContent = score;
      gsap.to(target, { scale: 1.6, opacity: 0, duration: .25, onComplete: () => target.remove() });
    });

    spawnTimer = setTimeout(spawnTarget, 550 + Math.random() * 350);
  }

  function tick(){
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) return endGame();
    tickTimer = setTimeout(tick, 1000);
  }

  function endGame(){
    running = false;
    clearTimeout(spawnTimer);
    clearTimeout(tickTimer);
    stage.querySelectorAll('.catch-target').forEach(t => t.remove());
    startBtn.textContent = `Score: ${score} — Play again`;
    startBtn.style.display = 'block';
  }

  startBtn.addEventListener('click', () => {
    score = 0; timeLeft = 20;
    scoreEl.textContent = 0; timeEl.textContent = 20;
    running = true;
    startBtn.style.display = 'none';
    spawnTarget();
    tick();
  });
})();

/* ---------------------------------------------------------
   11. CONTACT FORM (client-side only demo)
--------------------------------------------------------- */
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const note = document.getElementById('form-note');
  note.textContent = 'Message captured locally — wire this form up to your backend or a form service to actually send it.';
  gsap.from(note, { opacity: 0, y: -6, duration: .4 });
  e.target.reset();
});
