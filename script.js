document.addEventListener("DOMContentLoaded", () => {

  const ensureAudioContext = () => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;
    if (!window.__zaheerAudioContext) {
      window.__zaheerAudioContext = new AudioContextCtor();
    }
    return window.__zaheerAudioContext;
  };

  const playCinematicTone = ({ frequency, duration = 0.12, type = "sine", gain = 0.03, startDelay = 0 }) => {
    const context = ensureAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    const startTime = context.currentTime + startDelay;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.03);
  };

  const playNoiseBurst = ({ duration = 0.16, gain = 0.018, startDelay = 0 }) => {
    const context = ensureAudioContext();
    if (!context || !context.createBufferSource) return;

    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      channel[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = context.createBufferSource();
    const gainNode = context.createGain();
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(context.destination);

    const startTime = context.currentTime + startDelay;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    source.start(startTime);
    source.stop(startTime + duration + 0.02);
  };

  const audioCue = (name) => {
    if (name === "car") {
      playCinematicTone({ frequency: 96, duration: 0.18, type: "sawtooth", gain: 0.022 });
      playCinematicTone({ frequency: 64, duration: 0.28, type: "triangle", gain: 0.01, startDelay: 0.02 });
    }
    if (name === "engine") {
      playCinematicTone({ frequency: 68, duration: 0.42, type: "sawtooth", gain: 0.045 });
      playCinematicTone({ frequency: 104, duration: 0.28, type: "triangle", gain: 0.02, startDelay: 0.03 });
      playCinematicTone({ frequency: 84, duration: 0.18, type: "sawtooth", gain: 0.024, startDelay: 0.12 });
      playNoiseBurst({ duration: 0.18, gain: 0.02, startDelay: 0.01 });
    }
    if (name === "sinister") playCinematicTone({ frequency: 56, duration: 0.28, type: "triangle", gain: 0.03 });
    if (name === "stamp") playCinematicTone({ frequency: 680, duration: 0.08, type: "square", gain: 0.02 });
    if (name === "break") playCinematicTone({ frequency: 160, duration: 0.12, type: "sawtooth", gain: 0.025 });
    if (name === "drag") playCinematicTone({ frequency: 220, duration: 0.1, type: "triangle", gain: 0.018 });
    if (name === "fall") playCinematicTone({ frequency: 420, duration: 0.06, type: "triangle", gain: 0.01 });
    if (name === "clash") {
      playCinematicTone({ frequency: 210, duration: 0.08, type: "square", gain: 0.016 });
      playNoiseBurst({ duration: 0.08, gain: 0.012, startDelay: 0.005 });
    }
  };

  // 1. Google Form Submission Handler (AJAX POST)
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfD_uLp57_9JdZ8Q7S_7S_6v-Z8M-9g-X_9k-8Aw/formResponse";
  const ENTRY_IDS = {
    name: "entry.1000001", 
    email: "entry.1000002", 
    message: "entry.1000003"
  };

  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const submitText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin mr-1"></i> Transmitting...`;
      formStatus.className = "text-center text-xs mt-2 font-medium text-text-secondary";
      formStatus.innerText = "Submitting response to Google Form...";
      formStatus.classList.remove("hidden");

      const nameVal = document.getElementById("name").value;
      const emailVal = document.getElementById("email").value;
      const messageVal = document.getElementById("message").value;

      const formData = new URLSearchParams();
      formData.append(ENTRY_IDS.name, nameVal);
      formData.append(ENTRY_IDS.email, emailVal);
      formData.append(ENTRY_IDS.message, messageVal);

      fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      })
      .then(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitText;
        formStatus.className = "text-center text-xs mt-2 font-medium text-green-400";
        formStatus.innerText = "Message submitted successfully to Google Form database!";
        contactForm.reset();
      })
      .catch((error) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitText;
        formStatus.className = "text-center text-xs mt-2 font-medium text-red-500";
        formStatus.innerText = "Failed to submit message. Please try again.";
        console.error("Submission error:", error);
      });
    });
  }

  // Register GSAP ScrollTrigger
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 2. Setup Cinematic Loader & Falling Logos (10 Seconds total)
  const loader = document.getElementById("loader");
  const effectsContainer = document.getElementById("loader-effects-container");
  const nameContainer = document.getElementById("intro-name-container");
  const loaderStatus = document.getElementById("loader-status");
  const loaderLogosRow = document.getElementById("loader-logos-row");
  const loaderMergedLogo = document.getElementById("loader-merged-logo");
  const loaderBlastContainer = document.getElementById("loader-blast-container");
  const bentoCards = document.querySelectorAll(".glass-card");

  document.body.classList.add("loader-active");
  document.documentElement.style.overflow = "hidden";
  window.scrollTo(0, 0);

 /* const primeLoaderAudio = () => {
    const context = ensureAudioContext();
    if (!context) return;
    context.resume().catch(() => {});
    audioCue("engine");
  };
  primeLoaderAudio();*/


/*window.addEventListener(
  "click",
  () => {
    const engineSound = new Audio("./assets/engine-rev.mp3");
    engineSound.volume = 1;
    engineSound.play();
  },
  { once: true }
);
*/
const primeLoaderAudio = () => {
    const engineSound = new Audio("./assets/engine-rev.mp3");
    engineSound.volume = 1;

    engineSound.play().catch(err => {
        console.log("Autoplay blocked by browser:", err);
    });
};

primeLoaderAudio();
  // Create stamp letter nodes
  const introName = "ZAHEER RACHAKULA";
  introName.split("").forEach(char => {
    const span = document.createElement("span");
    span.className = char === " " ? "intro-letter space" : "intro-letter";
    span.innerText = char;
    nameContainer.appendChild(span);
  });

  // Setup dust widgets & light flares in loader
  if (effectsContainer && typeof gsap !== "undefined") {
    for (let i = 0; i < 20; i++) {
      const dust = document.createElement("div");
      dust.className = "loader-dust";
      gsap.set(dust, {
        x: gsap.utils.random(0, window.innerWidth),
        y: gsap.utils.random(0, window.innerHeight),
        opacity: gsap.utils.random(0.1, 0.4),
        scale: gsap.utils.random(0.5, 1.5)
      });
      effectsContainer.appendChild(dust);
      
      gsap.to(dust, {
        y: "-=100",
        x: "+=40",
        duration: gsap.utils.random(5, 9),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    for (let i = 0; i < 4; i++) {
      const light = document.createElement("div");
      light.className = "loader-light-beam";
      gsap.set(light, {
        x: gsap.utils.random(10, 90) + "%",
        y: gsap.utils.random(10, 90) + "%",
        scale: gsap.utils.random(1.0, 2.0)
      });
      effectsContainer.appendChild(light);
      
      gsap.to(light, {
        opacity: gsap.utils.random(0.2, 0.5),
        scale: "+=0.4",
        duration: gsap.utils.random(4, 6),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    for (let i = 0; i < 28; i++) {
      const spark = document.createElement("div");
      spark.className = "fire-sparkle";
      effectsContainer.appendChild(spark);

      const startX = gsap.utils.random(0, window.innerWidth);
      const startY = gsap.utils.random(window.innerHeight * 0.18, window.innerHeight * 0.9);
      const driftX = gsap.utils.random(-140, 140);
      const driftY = gsap.utils.random(-160, -70);
      const size = gsap.utils.random(3, 8);

      gsap.set(spark, {
        x: startX,
        y: startY,
        width: size,
        height: size,
        opacity: gsap.utils.random(0.05, 0.55),
        scale: gsap.utils.random(0.55, 1.25)
      });

      gsap.to(spark, {
        x: `+=${driftX}`,
        y: `+=${driftY}`,
        opacity: 0,
        scale: 0.2,
        duration: gsap.utils.random(2.6, 4.2),
        repeat: -1,
        ease: "power1.out",
        onRepeat: function () {
          gsap.set(this.targets()[0], {
            x: gsap.utils.random(0, window.innerWidth),
            y: gsap.utils.random(window.innerHeight * 0.18, window.innerHeight * 0.92),
            opacity: gsap.utils.random(0.05, 0.55),
            scale: gsap.utils.random(0.55, 1.25)
          });
        }
      });
    }
  }

  // Silver monochrome falling logos
  const fallingLogosData = [
    { type: "icon", prefix: "fa-solid", value: "fa-code" },
    { type: "icon", prefix: "fa-solid", value: "fa-laptop-code" },
    { type: "icon", prefix: "fa-solid", value: "fa-car" },
    { type: "icon", prefix: "fa-brands", value: "fa-github" },
    { type: "icon", prefix: "fa-brands", value: "fa-youtube" },
    { type: "icon", prefix: "fa-brands", value: "fa-instagram" },
    { type: "icon", prefix: "fa-solid", value: "fa-envelope" },
    { type: "icon", prefix: "fa-solid", value: "fa-bolt" },
    { type: "icon", prefix: "fa-solid", value: "fa-microchip" },
    { type: "icon", prefix: "fa-solid", value: "fa-layer-group" },
    { type: "icon", prefix: "fa-solid", value: "fa-rocket" },
    { type: "icon", prefix: "fa-solid", value: "fa-globe" }
  ];

  const spawnedLogos = [];

  if (loaderLogosRow && typeof gsap !== "undefined") {
    fallingLogosData.forEach((logo, index) => {
      const logoEl = document.createElement("div");
      logoEl.className = "loader-falling-logo";
      
      if (logo.type === "icon") {
        logoEl.innerHTML = `<i class="${logo.prefix} ${logo.value}"></i>`;
      } else {
        logoEl.innerText = logo.value;
      }
      
      // Initially positioned high off-screen
      gsap.set(logoEl, {
        y: -160,
        x: 0,
        opacity: 0,
        scale: 1.2
      });

      loaderLogosRow.appendChild(logoEl);
      spawnedLogos.push(logoEl);
    });
  }

  const installCornerShapes = () => {
    if (typeof gsap === "undefined") return;

    bentoCards.forEach((card) => {
      if (card.querySelector(".card-corner-layer")) return;

      const cornerLayer = document.createElement("div");
      cornerLayer.className = "card-corner-layer";
      cornerLayer.innerHTML = `
        <span class="card-corner-shape card-corner-diamond card-corner-top-left"></span>
        <span class="card-corner-shape card-corner-triangle card-corner-bottom-right"></span>
      `;
      card.appendChild(cornerLayer);

      const shapes = cornerLayer.querySelectorAll(".card-corner-shape");
      gsap.set(shapes, { scale: 0.9, opacity: 0.24 });

      shapes.forEach((shape, index) => {
        gsap.to(shape, {
          scale: index === 0 ? 1.08 : 1.15,
          opacity: 0.38,
          duration: 4.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.35
        });

        gsap.to(shape, {
          filter: index === 0 ? "drop-shadow(0 0 12px rgba(255,255,255,0.18))" : "drop-shadow(0 0 10px rgba(203,213,225,0.14))",
          duration: 5.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.25
        });
      });
    });
  };

  const setupShowcaseShuffle = () => {
    if (typeof gsap === "undefined") return;

    const showcaseCanvas = document.querySelector(".showcase-canvas");
    if (!showcaseCanvas) return;

    const showcaseShapes = Array.from(showcaseCanvas.querySelectorAll(".showcase-shape-svg"));
    if (showcaseShapes.length === 0) return;

    let showcaseTimeline = null;
    let restartTimer = null;
    let pickedShapeName = "";

    const showcaseTag = document.createElement("div");
    showcaseTag.className = "showcase-status-tag";
    showcaseTag.textContent = "Click a shape";
    showcaseCanvas.parentElement.insertBefore(showcaseTag, showcaseCanvas);

    const shapeLabels = {
      "shape-ball": "Sphere",
      "shape-cube": "Cube",
      "shape-cone": "Cone",
      "shape-prism": "Prism"
    };

    showcaseShapes.forEach((shape) => {
      shape.dataset.shapeName = shapeLabels[shape.id] || shape.id;
      shape.style.pointerEvents = "auto";
    });

    const shuffle = (items) => items.slice().sort(() => Math.random() - 0.5);

    const getSlots = () => {
      const isNarrow = window.innerWidth < 768;
      return isNarrow
        ? [
            { x: -56, y: -72, scale: 0.86, rotation: -8 },
            { x: 54, y: -24, scale: 0.92, rotation: 10 },
            { x: -50, y: 22, scale: 0.84, rotation: -12 },
            { x: 58, y: 74, scale: 0.9, rotation: 14 }
          ]
        : [
            { x: -112, y: -28, scale: 0.9, rotation: -8 },
            { x: -10, y: -28, scale: 0.92, rotation: 6 },
            { x: 92, y: -28, scale: 0.9, rotation: -10 },
            { x: 194, y: -28, scale: 0.92, rotation: 8 }
          ];
    };

    const resetShapes = () => {
      gsap.killTweensOf(showcaseShapes);
      gsap.set(showcaseShapes, { opacity: 0, scale: 0.18, x: 0, y: 0, rotation: 0 });
    };

    const startCycle = () => {
      if (restartTimer) {
        window.clearTimeout(restartTimer);
        restartTimer = null;
      }

      if (showcaseTimeline) {
        showcaseTimeline.kill();
      }

      const ordered = shuffle(showcaseShapes);
      showcaseCanvas.append(...ordered);
      resetShapes();

      showcaseTag.classList.remove("is-picked");
      showcaseTag.textContent = pickedShapeName ? `Picked: ${pickedShapeName}` : "Click a shape";

      const slots = getSlots();
      showcaseTimeline = gsap.timeline({
        onComplete: () => {
          restartTimer = window.setTimeout(startCycle, 900);
        }
      });

      ordered.forEach((shape, index) => {
        const slot = slots[index % slots.length];
        showcaseTimeline.to(shape, {
          opacity: 1,
          x: slot.x,
          y: slot.y,
          scale: slot.scale,
          rotation: slot.rotation,
          duration: 0.52,
          ease: "back.out(2.1)"
        }, index * 0.1);
      });

      showcaseTimeline.to({}, { duration: 0.65 });

      ordered.forEach((shape, index) => {
        showcaseTimeline.to(shape, {
          opacity: 0,
          scale: 0.18,
          duration: 0.34,
          ease: "power2.in"
        }, 1.55 + index * 0.08);
      });

      showcaseTimeline.call(() => {
        if (!pickedShapeName) {
          showcaseTag.textContent = "Click a shape";
        }
      });
    };

    const handlePick = (shape) => {
      pickedShapeName = shape.dataset.shapeName || "Shape";
      showcaseTag.textContent = pickedShapeName;
      showcaseTag.classList.add("is-picked");
      audioCue("stamp");
      if (showcaseTimeline) {
        showcaseTimeline.kill();
      }
      if (restartTimer) {
        window.clearTimeout(restartTimer);
      }
      gsap.to(showcaseShapes, {
        opacity: 1,
        scale: 1,
        duration: 0.22,
        ease: "power2.out",
        onComplete: () => {
          restartTimer = window.setTimeout(() => {
            startCycle();
          }, 550);
        }
      });
    };

    showcaseShapes.forEach((shape) => {
      shape.addEventListener("click", () => handlePick(shape));
    });

    window.addEventListener("resize", () => {
      if (showcaseTimeline) {
        startCycle();
      }
    });

    startCycle();
  };

  const setupTicTacToeGame = () => {
    const board = document.getElementById("tic-board");
    const status = document.getElementById("tic-status");
    const resetButton = document.getElementById("tic-reset-btn");

    if (!board || !status || !resetButton) return;

    const cells = Array.from(board.querySelectorAll(".tic-cell"));
    const winLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    let state = Array(9).fill("");
    let gameOver = false;
    let botTimer = null;

    const setStatus = (text, picked = false) => {
      status.textContent = text;
      status.classList.toggle("is-picked", picked);
    };

    const render = () => {
      cells.forEach((cell, index) => {
        const value = state[index];
        cell.textContent = value;
        cell.classList.toggle("is-x", value === "X");
        cell.classList.toggle("is-o", value === "O");
        cell.disabled = gameOver || Boolean(value);
      });
    };

    const checkWinner = () => {
      for (const line of winLines) {
        const [a, b, c] = line;
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
          return { winner: state[a], line };
        }
      }
      if (!state.includes("")) {
        return { winner: "Draw", line: [] };
      }
      return null;
    };

    const markWinningLine = (line) => {
      line.forEach((index) => cells[index].classList.add("is-win"));
    };

    const endGame = (message, line = []) => {
      gameOver = true;
      if (line.length) {
        markWinningLine(line);
      }
      setStatus(message, true);
      render();
    };

    const botMove = () => {
      if (gameOver) return;

      const availableMoves = state
        .map((value, index) => (value === "" ? index : null))
        .filter((index) => index !== null);

      if (!availableMoves.length) {
        endGame("Draw game");
        return;
      }

      const pick = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      state[pick] = "O";
      render();

      const result = checkWinner();
      if (result) {
        if (result.winner === "O") {
          endGame("Bot wins", result.line);
        } else {
          endGame("Draw game");
        }
        return;
      }

      setStatus("Your turn: X");
    };

    const playMove = (index) => {
      if (gameOver || state[index]) return;

      state[index] = "X";
      render();

      const result = checkWinner();
      if (result) {
        if (result.winner === "X") {
          endGame("You win!", result.line);
        } else {
          endGame("Draw game");
        }
        return;
      }

      setStatus("Bot thinking...", true);
      render();

      if (botTimer) {
        window.clearTimeout(botTimer);
      }

      botTimer = window.setTimeout(botMove, 380);
    };

    cells.forEach((cell) => {
      cell.addEventListener("click", () => playMove(Number(cell.dataset.ticCell)));
    });

    resetButton.addEventListener("click", () => {
      if (botTimer) {
        window.clearTimeout(botTimer);
      }

      state = Array(9).fill("");
      gameOver = false;
      cells.forEach((cell) => cell.classList.remove("is-win"));
      setStatus("Your turn: X", false);
      render();
    });

    render();
  };

  // Camera Shake trigger
  function shakeScreen(strength = 3) {
    gsap.fromTo("body", 
      { x: gsap.utils.random(-strength, strength), y: gsap.utils.random(-strength, strength) },
      { x: 0, y: 0, duration: 0.1, ease: "power1.inOut" }
    );
  }

  // Radially emitting strikes
  function spawnStrikes(letterElement) {
    const rect = letterElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 6; i++) {
      const line = document.createElement("div");
      line.className = "strike-line";
      document.body.appendChild(line);
      
      const angle = (i * 60) * (Math.PI / 180);
      const startDist = 5;
      const endDist = gsap.utils.random(40, 70);
      
      gsap.set(line, {
        x: centerX + Math.cos(angle) * startDist,
        y: centerY + Math.sin(angle) * startDist,
        width: 1.5,
        height: 8,
        rotation: (i * 60) + 90,
        opacity: 1
      });
      
      gsap.to(line, {
        x: centerX + Math.cos(angle) * endDist,
        y: centerY + Math.sin(angle) * endDist,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => line.remove()
      });
    }
  }

  // Explode merged logo into particles
  function triggerBombBlast() {
    shakeScreen(15); // Large impact shake
    
    // Spawns 40 blast particles
    const particleCount = 45;
    const colors = ["#F8FAFC", "#E5E7EB", "#C7CDD6", "#A8B0BA"];
    
    for (let i = 0; i < particleCount; i++) {
      const part = document.createElement("div");
      part.className = "blast-piece";
      part.style.backgroundColor = gsap.utils.random(colors);
      
      const angle = gsap.utils.random(0, 360) * (Math.PI / 180);
      const speed = gsap.utils.random(150, 320);
      const startX = window.innerWidth / 2;
      const startY = window.innerHeight / 2;
      
      gsap.set(part, {
        x: startX,
        y: startY,
        opacity: 1,
        scale: gsap.utils.random(0.8, 1.8)
      });
      
      loaderBlastContainer.appendChild(part);
      
      gsap.to(part, {
        x: startX + Math.cos(angle) * speed,
        y: startY + Math.sin(angle) * speed,
        opacity: 0,
        scale: 0.2,
        duration: gsap.utils.random(0.8, 1.4),
        ease: "power3.out",
        onComplete: () => part.remove()
      });
    }
  }

  // 10-Second Loader Timeline Orchestration
  if (typeof gsap !== "undefined") {
    const tl = gsap.timeline();
    
    // 1. Stagger drop logos to horizontal line (0s - 3.5s)
    spawnedLogos.forEach((logo, index) => {
      tl.to(logo, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "bounce.out",
        onStart: () => {
          shakeScreen(3);
          audioCue("fall");
        }
      }, 0.2 + index * 0.22);
    });

    // 2. Logos clash into center (3.8s - 4.5s)
    const rowRect = loaderLogosRow.getBoundingClientRect();
    const rowCenterX = rowRect.width / 2;
    const rowCenterY = rowRect.height / 2;

    tl.to(spawnedLogos, {
      x: (index, target) => {
        const logoRect = target.getBoundingClientRect();
        const logoCenterX = logoRect.left + logoRect.width / 2 - rowRect.left;
        return rowCenterX - logoCenterX;
      },
      y: (index, target) => {
        const logoRect = target.getBoundingClientRect();
        const logoCenterY = logoRect.top + logoRect.height / 2 - rowRect.top;
        return rowCenterY - logoCenterY;
      },
      scale: 0.72,
      opacity: 0.95,
      duration: 0.78,
      ease: "power3.in",
      stagger: { each: 0.03, from: "center" },
      onStart: () => audioCue("clash"),
      onComplete: () => {
        shakeScreen(7);
        audioCue("engine");
      }
    }, "+=0.35");

    tl.to(spawnedLogos, {
      scale: 0.48,
      filter: "drop-shadow(0 0 18px rgba(255,255,255,0.65))",
      duration: 0.35,
      stagger: 0.02,
      ease: "back.out(1.6)"
    }, "<0.1");

    // 3. Merge into central logo and flash (4.5s - 5.5s)
    tl.to(loaderMergedLogo, {
      opacity: 1,
      scale: 1.4,
      duration: 0.4,
      ease: "back.out(1.5)",
      onStart: () => {
        // Remove individual logos once clashed
        spawnedLogos.forEach(logo => logo.remove());
        shakeScreen(6);
        audioCue("sinister");
      }
    });

    tl.to(loaderMergedLogo, {
      scale: 1.6,
      filter: "brightness(1.5) drop-shadow(0 0 35px #FF0066)",
      duration: 0.6,
      repeat: 1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // 4. Bomb blast explosion (5.5s)
    tl.to(loaderMergedLogo, {
      scale: 0,
      opacity: 0,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        triggerBombBlast();
        loaderMergedLogo.remove();
        audioCue("break");
      }
    });

    // 5. Letter Stamp reveal: ZAHEER RACHAKULA (5.7s - 8.5s)
    const letters = document.querySelectorAll(".intro-letter");
    letters.forEach((letter, index) => {
      if (letter.classList.contains("space")) return;
      
      tl.to(letter, {
        y: 0,
        duration: 0.25,
        ease: "power2.in"
      }, 5.6 + index * 0.08);

      tl.to(letter, {
        scaleY: 0.7,
        scaleX: 1.25,
        duration: 0.08,
        ease: "power1.out"
      });

      tl.to(letter, {
        scaleY: 1,
        scaleX: 1,
        duration: 0.12,
        ease: "back.out(2.2)",
        onStart: () => {
          shakeScreen(4);
          spawnStrikes(letter);
          if (index === 0) {
            audioCue("engine");
            audioCue("engine");
            audioCue("engine");
          }
          audioCue("stamp");
        }
      });
    });

    tl.fromTo(letters, {
      opacity: 0,
      y: 44,
      rotationX: -88,
      scale: 0.78,
      filter: "blur(9px)",
      transformPerspective: 900,
      transformOrigin: "50% 50%"
    }, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.36,
      stagger: 0.055,
      ease: "power3.out",
      onStart: () => audioCue("engine")
    }, 5.48);

    // 6. Environment assembly text (8.5s - 9.2s)
    tl.to(loaderStatus, {
      opacity: 1,
      duration: 0.5
    }, "-=0.2");

    tl.to("#intro-name-container", {
      scale: 1.12,
      filter: "drop-shadow(0 0 25px rgba(255, 61, 0, 0.75))",
      duration: 0.4
    });

    tl.to("#intro-name-container, #loader-status", {
      opacity: 0,
      scale: 0.9,
      filter: "blur(10px)",
      duration: 0.45,
      ease: "power2.in"
    }, "+=0.3");

    // 7. Loader slide away and open website (9.2s - 10.0s)
    tl.to(loader, {
      opacity: 0,
      y: -50,
      duration: 0.7,
      ease: "power3.inOut",
      onComplete: () => {
        loader.style.display = "none";
        document.body.classList.remove("loader-active");
        document.documentElement.style.overflow = "auto";
        animateCounters();
      }
    });

    // Stagger bento cards reveal
    tl.from(bentoCards, {
      opacity: 0,
      y: 60,
      scale: 0.94,
      duration: 0.9,
      stagger: 0.08,
      ease: "power3.out"
    }, "-=0.3");

    // Typography Showcase reveals
    tl.from("#showcase-title", {
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: "back.out(1.5)"
    }, "-=0.4");

    tl.from("#showcase-subtitle", {
      opacity: 0,
      scale: 0.8,
      duration: 1.0,
      ease: "elastic.out(1, 0.4)"
    }, "-=0.6");

    // SVG shape models pop-in
    tl.from(".showcase-shape-svg", {
      opacity: 0,
      scale: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "back.out(2)"
    }, "-=0.4");

    installCornerShapes();

    gsap.to(".showcase-shape-svg", {
      y: "random(-10, 10)",
      x: "random(-8, 8)",
      rotation: "random(-10, 10)",
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.1
    });

    gsap.to(".showcase-shape-svg circle, .showcase-shape-svg polygon, .showcase-shape-svg path, .showcase-shape-svg ellipse", {
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      attr: {
        fill: (index) => ["#f8fafc", "#e5e7eb", "#cbd5e1", "#94a3b8"][index % 4]
      },
      stagger: 0.08
    });

    gsap.to(letters, {
      textShadow: "0 0 24px rgba(255, 170, 77, 0.42), 0 0 44px rgba(255, 61, 0, 0.28)",
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      stagger: 0.04,
      ease: "sine.inOut"
    });

  } else {
    loader.style.display = "none";
    animateCountersFallback();
  }

  // 3. Sunlight Particles Generator
  const particlesContainer = document.getElementById("particles-container");
  if (particlesContainer && typeof gsap !== "undefined") {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "light-particle";
      
      const size = gsap.utils.random(4, 10);
      const startX = gsap.utils.random(0, window.innerWidth);
      const startY = gsap.utils.random(0, document.documentElement.scrollHeight);
      
      gsap.set(particle, {
        x: startX,
        y: startY,
        width: size,
        height: size,
        opacity: gsap.utils.random(0.1, 0.35),
        scale: gsap.utils.random(0.5, 1.3)
      });
      
      particlesContainer.appendChild(particle);
      
      gsap.to(particle, {
        x: `+=${gsap.utils.random(-60, 60)}`,
        y: `-=${gsap.utils.random(100, 200)}`,
        opacity: 0,
        duration: gsap.utils.random(5, 10),
        repeat: -1,
        ease: "none",
        onRepeat: function() {
          gsap.set(this.targets()[0], {
            x: gsap.utils.random(0, window.innerWidth),
            y: document.documentElement.scrollHeight - gsap.utils.random(0, 200),
            opacity: gsap.utils.random(0.1, 0.35)
          });
        }
      });
    }
  }

  // 4. Scroll level button text fill animations (GSAP ScrollTrigger)
  const fillButtons = document.querySelectorAll(".scroll-fill-btn");
  if (fillButtons.length > 0 && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    fillButtons.forEach(btn => {
      gsap.fromTo(btn,
        { 
          backgroundColor: "rgba(255,255,255,0.0)", 
          color: "#FFFFFF",
          borderColor: "rgba(255,255,255,0.15)"
        },
        {
          backgroundColor: "#FFFFFF",
          color: "#050505",
          borderColor: "#FFFFFF",
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: btn,
            start: "top 88%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }

  // 5. Mouse following focusing circle effect
  const focusCircle = document.getElementById("focus-circle");
  if (focusCircle && typeof gsap !== "undefined") {
    const setCircleX = gsap.quickSetter(focusCircle, "x", "px");
    const setCircleY = gsap.quickSetter(focusCircle, "y", "px");
    
    gsap.set(focusCircle, { xPercent: -50, yPercent: -50 });

    window.addEventListener("mousemove", (e) => {
      gsap.to(focusCircle, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: "power2.out"
      });
    });

    // Make circle reactive when hovering over grid cards
    bentoCards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        gsap.to(focusCircle, {
          scale: 3.5,
          opacity: 0.35,
          borderColor: "#FF3D00",
          duration: 0.3
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(focusCircle, {
          scale: 1,
          opacity: 0,
          borderColor: "#FF3D00",
          duration: 0.4
        });
      });
    });
  }

  // 6. Spotlight coordinates
  bentoCards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  const setupSectionScrollAnimations = () => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const motionCards = Array.from(document.querySelectorAll("main .glass-card"));
    motionCards.forEach((card, index) => {
      const direction = index % 4;
      const fromVars = [
        { x: -90, y: 42, rotate: -9, skewY: 8 },
        { x: 90, y: 42, rotate: 9, skewY: -8 },
        { x: -70, y: -46, rotate: -7, skewX: 7 },
        { x: 70, y: -46, rotate: 7, skewX: -7 }
      ][direction];

      const headings = card.querySelectorAll("h1, h2, h3, h4");
      const copyBlocks = card.querySelectorAll("p, li, .tech-badge, .tic-cell, button, a");

      gsap.fromTo(card,
        {
          opacity: 0,
          x: fromVars.x,
          y: fromVars.y,
          rotate: fromVars.rotate,
          skewY: fromVars.skewY || 0,
          skewX: fromVars.skewX || 0,
          scale: 0.72,
          transformPerspective: 1000,
          transformOrigin: "50% 50%"
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotate: 0,
          skewY: 0,
          skewX: 0,
          scale: 1,
          duration: 1.05,
          ease: "back.out(2.3)",
          scrollTrigger: {
            trigger: card,
            start: "top 86%",
            toggleActions: "play none none reverse"
          },
          onComplete: () => {
            if (card.dataset.motionReady) return;
            card.dataset.motionReady = "true";
            gsap.to(card, {
              rotate: index % 2 === 0 ? 0.6 : -0.6,
              x: index % 2 === 0 ? 2 : -2,
              duration: 3.2,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut"
            });

            gsap.to(headings, {
              rotation: index % 2 === 0 ? 0.8 : -0.8,
              y: 1.5,
              duration: 2.8,
              repeat: -1,
              yoyo: true,
              stagger: 0.08,
              ease: "sine.inOut"
            });
          }
        }
      );

      if (headings.length) {
        gsap.fromTo(headings,
          {
            opacity: 0,
            y: 18,
            rotationX: -68,
            transformPerspective: 900
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "back.out(1.8)",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      if (copyBlocks.length) {
        gsap.fromTo(copyBlocks,
          {
            opacity: 0,
            y: 12,
            rotateX: -22
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.7,
            stagger: 0.04,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });
  };

  // 7. GitHub counters
  function animateCounters() {
    if (typeof gsap !== "undefined") {
      gsap.to("#repo-count", {
        innerText: 24, 
        duration: 2.2,
        snap: { innerText: 1 },
        ease: "power1.out"
      });
      gsap.to("#contribution-count", {
        innerText: 342,
        duration: 2.5,
        snap: { innerText: 1 },
        ease: "power2.out"
      });
    } else {
      animateCountersFallback();
    }
  }

  function animateCountersFallback() {
    document.getElementById("repo-count").innerText = "24";
    document.getElementById("contribution-count").innerText = "342";
  }

  // 8. Swiper Carousel
  if (typeof Swiper !== "undefined") {
    new Swiper(".project-swiper", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      grabCursor: true,
      speed: 650,
      effect: "slide",
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-next-btn",
        prevEl: ".swiper-prev-btn",
      },
    });
  }

  // 9. Mobile Drawer
  const mobileToggleBtn = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (mobileToggleBtn && mobileMenu) {
    mobileToggleBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      const icon = mobileToggleBtn.querySelector("i");
      if (icon) {
        if (mobileMenu.classList.contains("hidden")) {
          icon.className = "fa-solid fa-bars-staggered text-xl";
        } else {
          icon.className = "fa-solid fa-xmark text-xl";
        }
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        const icon = mobileToggleBtn.querySelector("i");
        if (icon) {
          icon.className = "fa-solid fa-bars-staggered text-xl";
        }
      });
    });
  }

  // 10. Interactive SVG Shapes (Showcase Card)
  if (typeof gsap !== "undefined") {
    gsap.set("#shape-ball", { left: "15%", top: "35%" });
    gsap.set("#shape-cube", { left: "40%", top: "25%" });
    gsap.set("#shape-cone", { left: "62%", top: "20%" });
    gsap.set("#shape-prism", { left: "80%", top: "30%" });

    setupShowcaseShuffle();
    setupTicTacToeGame();
    setupSectionScrollAnimations();
  }

  // 11. Scroll Parallaxes for glows
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.to(".blur-circle:nth-child(2)", {
      y: 100,
      x: 30,
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
      }
    });

    gsap.to(".blur-circle:nth-child(3)", {
      y: -120,
      x: -50,
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2
      }
    });

    gsap.to(".sunlight-flare", {
      y: 60,
      x: -30,
      scale: 1.05,
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5
      }
    });
  }

});
