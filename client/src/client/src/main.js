/* =========================================================
   LAST LINE — MAIN ENTRY
   ========================================================= */


/* =========================================================
   DOM
   ========================================================= */

const gameContainer =
  document.getElementById("game");

const menu =
  document.getElementById("menu");

const deployButton =
  document.getElementById("deployButton");

const callsignInput =
  document.getElementById("callsign");

const modeSelect =
  document.getElementById("mode");

const loadingScreen =
  document.getElementById("loadingScreen");

const loadingProgress =
  document.getElementById("loadingProgress");

const menuStatus =
  document.getElementById("menuStatus");


/* =========================================================
   STATE
   ========================================================= */

let THREE = null;
let core = null;
let scene = null;
let camera = null;
let renderer = null;

let gameStarted = false;


/* =========================================================
   IMMEDIATE BUTTON TEST
   ========================================================= */

function setStatus(text) {

  if (menuStatus) {
    menuStatus.textContent = text;
  }

}


/* =========================================================
   DEPLOY
   ========================================================= */

async function deploy(event) {

  if (event) {
    event.preventDefault();
  }


  if (gameStarted) {
    return;
  }


  const callsign =
    callsignInput &&
    callsignInput.value.trim()
      ? callsignInput.value.trim()
      : "Phantom";


  const mode =
    modeSelect
      ? modeSelect.value
      : "rescue";


  /*
   * This happens BEFORE loading Three.js.
   * Therefore we know the button itself works.
   */

  setStatus(
    "INITIALIZING..."
  );


  deployButton.disabled =
    true;


  loadingScreen.style.display =
    "flex";


  loadingProgress.style.width =
    "5%";


  try {

    /* =====================================================
       LOAD THREE.JS
    ===================================================== */

    setStatus(
      "LOADING ENGINE..."
    );


    loadingProgress.style.width =
      "20%";


    THREE =
      await import(
        "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
      );


    /* =====================================================
       CREATE SCENE
    ===================================================== */

    setStatus(
      "CREATING WORLD..."
    );


    loadingProgress.style.width =
      "40%";


    scene =
      new THREE.Scene();


    scene.background =
      new THREE.Color(
        0x111518
      );


    scene.fog =
      new THREE.Fog(
        0x111518,
        35,
        220
      );


    /* =====================================================
       CAMERA
    ===================================================== */

    camera =
      new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
          window.innerHeight,
        0.05,
        500
      );


    camera.position.set(
      0,
      1.7,
      5
    );


    /* =====================================================
       RENDERER
    ===================================================== */

    renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        powerPreference:
          "high-performance"
      });


    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        2
      )
    );


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );


    renderer.shadowMap.enabled =
      true;


    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;


    renderer.outputColorSpace =
      THREE.SRGBColorSpace;


    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
      1.0;


    gameContainer.appendChild(
      renderer.domElement
    );


    /* =====================================================
       LIGHTING
    ===================================================== */

    const hemisphere =
      new THREE.HemisphereLight(
        0xc9d5dc,
        0x252a27,
        1.6
      );


    scene.add(
      hemisphere
    );


    const sun =
      new THREE.DirectionalLight(
        0xfff1d2,
        2.5
      );


    sun.position.set(
      40,
      60,
      25
    );


    sun.castShadow =
      true;


    sun.shadow.mapSize.width =
      2048;


    sun.shadow.mapSize.height =
      2048;


    sun.shadow.camera.near =
      1;


    sun.shadow.camera.far =
      180;


    sun.shadow.camera.left =
      -80;


    sun.shadow.camera.right =
      80;


    sun.shadow.camera.top =
      80;


    sun.shadow.camera.bottom =
      -80;


    scene.add(
      sun
    );


    const fill =
      new THREE.DirectionalLight(
        0x9bb8d4,
        0.45
      );


    fill.position.set(
      -30,
      20,
      -40
    );


    scene.add(
      fill
    );


    /* =====================================================
       LOAD CORE
    ===================================================== */

    setStatus(
      "LOADING GAME..."
    );


    loadingProgress.style.width =
      "60%";


    const coreModule =
      await import(
        "./core.js"
      );


    if (
      !coreModule ||
      !coreModule.Core
    ) {

      throw new Error(
        "Core class not found"
      );

    }


    /* =====================================================
       CREATE CORE
    ===================================================== */

    core =
      new coreModule.Core({
        scene,
        camera,
        renderer
      });


    loadingProgress.style.width =
      "85%";


    setStatus(
      "DEPLOYING..."
    );


    /* Small delay so the loading UI is visible */

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          300
        )
    );


    /* =====================================================
       START
    ===================================================== */

    core.start({
      callsign,
      mode
    });


    gameStarted =
      true;


    loadingProgress.style.width =
      "100%";


    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          150
        )
    );


    menu.style.display =
      "none";


    loadingScreen.style.display =
      "none";


    /*
     * Mobile controls are deliberately
     * NOT shown here yet.
     *
     * Core/TouchControls will handle them
     * when gameplay is actually active.
     */


  } catch (error) {

    console.error(
      "LAST LINE ERROR:",
      error
    );


    loadingScreen.style.display =
      "none";


    deployButton.disabled =
      false;


    setStatus(
      "ERROR — GAME FAILED TO LOAD"
    );


    /*
     * Keep the error in the console
     * so we can identify the exact file
     * if something is still broken.
     */

    console.error(
      error.stack ||
      error.message ||
      error
    );

  }

}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

/*
 * CLICK
 */

deployButton.addEventListener(
  "click",
  deploy
);


/*
 * TOUCH / IPAD
 *
 * Safari should normally turn this into
 * a click, but this makes the interaction
 * reliable on the iPad.
 */

deployButton.addEventListener(
  "touchend",
  event => {

    event.preventDefault();

    deploy(event);

  },
  {
    passive: false
  }
);


/*
 * POINTER
 */

deployButton.addEventListener(
  "pointerup",
  event => {

    /*
     * Don't trigger twice if Safari
     * already generated touchend.
     */

    if (
      event.pointerType !==
      "touch"
    ) {

      deploy(event);

    }

  }
);


/* =========================================================
   ENTER KEY
   ========================================================= */

callsignInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

      deploy(event);

    }

  }
);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
  "resize",
  () => {

    if (
      !camera ||
      !renderer
    ) {

      return;

    }


    camera.aspect =
      window.innerWidth /
      window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );


    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        2
      )
    );

  }
);


/* =========================================================
   VISIBILITY
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (!core) {
      return;
    }


    if (
      document.hidden
    ) {

      if (
        typeof core.pause ===
        "function"
      ) {

        core.pause();

      }

    } else {

      if (
        typeof core.resume ===
        "function"
      ) {

        core.resume();

      }

    }

  }
);


/* =========================================================
   GAME LOOP
   ========================================================= */

let lastTime =
  performance.now();


function gameLoop(
  currentTime
) {

  const elapsed =
    currentTime -
    lastTime;


  lastTime =
    currentTime;


  const dt =
    Math.min(
      elapsed / 1000,
      0.05
    );


  if (
    core &&
    typeof core.update ===
      "function"
  ) {

    core.update(
      dt
    );

  }


  if (
    renderer &&
    scene &&
    camera
  ) {

    renderer.render(
      scene,
      camera
    );

  }


  requestAnimationFrame(
    gameLoop
  );

}


requestAnimationFrame(
  gameLoop
);
