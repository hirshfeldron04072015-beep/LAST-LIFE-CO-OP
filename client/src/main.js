import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { Core } from "./core.js";


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
   SAFETY CHECK
   ========================================================= */

if (!gameContainer) {
  throw new Error("Missing #game");
}

if (!menu) {
  throw new Error("Missing #menu");
}

if (!deployButton) {
  throw new Error("Missing #deployButton");
}

if (!callsignInput) {
  throw new Error("Missing #callsign");
}

if (!loadingScreen) {
  throw new Error("Missing #loadingScreen");
}

if (!loadingProgress) {
  throw new Error("Missing #loadingProgress");
}

if (!menuStatus) {
  throw new Error("Missing #menuStatus");
}


/* =========================================================
   SCENE
   ========================================================= */

const scene =
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


/* =========================================================
   CAMERA
   ========================================================= */

const camera =
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


/* =========================================================
   RENDERER
   ========================================================= */

const renderer =
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


/* =========================================================
   LIGHTING
   ========================================================= */

const hemisphereLight =
  new THREE.HemisphereLight(
    0xc9d5dc,
    0x252a27,
    1.6
  );

scene.add(
  hemisphereLight
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


const fillLight =
  new THREE.DirectionalLight(
    0x9bb8d4,
    0.45
  );

fillLight.position.set(
  -30,
  20,
  -40
);

scene.add(
  fillLight
);


/* =========================================================
   CORE
   ========================================================= */

const core =
  new Core({
    scene,
    camera,
    renderer
  });


/* =========================================================
   DEPLOY STATE
   ========================================================= */

let deploying = false;
let running = false;


/* =========================================================
   DEPLOY FUNCTION
   ========================================================= */

async function deploy(event) {

  if (event) {
    event.preventDefault();
  }

  if (deploying || running) {
    return;
  }

  deploying = true;


  const callsign =
    callsignInput.value.trim() ||
    "Phantom";

  const mode =
    modeSelect
      ? modeSelect.value
      : "rescue";


  menuStatus.textContent =
    "INITIALIZING...";

  deployButton.disabled =
    true;

  loadingScreen.style.display =
    "flex";

  loadingProgress.style.width =
    "0%";


  /* =====================================================
     LOADING
     ===================================================== */

  let progress = 0;

  const timer =
    setInterval(() => {

      progress += 10;

      loadingProgress.style.width =
        `${Math.min(progress, 90)}%`;

    }, 45);


  try {

    /*
     * Give the browser a moment to
     * render the loading screen.
     */

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          100
        )
    );


    loadingProgress.style.width =
      "35%";

    menuStatus.textContent =
      "LOADING WORLD...";


    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          100
        )
    );


    loadingProgress.style.width =
      "70%";

    menuStatus.textContent =
      "DEPLOYING...";


    /*
     * Start the actual game.
     */

    core.start({
      callsign,
      mode
    });


    running =
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


    clearInterval(
      timer
    );


    loadingScreen.style.display =
      "none";

    menu.style.display =
      "none";


    deploying =
      false;


  } catch (error) {

    clearInterval(
      timer
    );


    console.error(
      "LAST LINE DEPLOY ERROR:",
      error
    );


    loadingScreen.style.display =
      "none";

    deployButton.disabled =
      false;

    deploying =
      false;


    menuStatus.textContent =
      "DEPLOY ERROR";


    /*
     * Keep menu visible so the
     * game doesn't become stuck.
     */

    setTimeout(() => {

      menuStatus.textContent =
        "READY FOR DEPLOYMENT";

    }, 2500);

  }

}


/* =========================================================
   DEPLOY BUTTON
   ========================================================= */

/*
 * Use pointerup for iPad + desktop.
 */

deployButton.addEventListener(
  "pointerup",
  event => {

    deploy(event);

  }
);


/*
 * Normal click fallback.
 */

deployButton.addEventListener(
  "click",
  event => {

    /*
     * Safari can generate both
     * pointerup and click.
     *
     * Only deploy if the pointer
     * handler didn't already start it.
     */

    if (!deploying && !running) {
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

    const width =
      window.innerWidth;

    const height =
      window.innerHeight;


    camera.aspect =
      width / height;

    camera.updateProjectionMatrix();


    renderer.setSize(
      width,
      height
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

    if (!running) {
      return;
    }


    if (document.hidden) {

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


  const deltaTime =
    Math.min(
      elapsed / 1000,
      0.05
    );


  if (
    typeof core.update ===
    "function"
  ) {

    core.update(
      deltaTime
    );

  }


  renderer.render(
    scene,
    camera
  );


  requestAnimationFrame(
    gameLoop
  );

}


requestAnimationFrame(
  gameLoop
);
