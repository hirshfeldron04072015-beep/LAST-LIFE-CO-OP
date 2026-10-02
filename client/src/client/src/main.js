import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


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
   THREE.JS
   ========================================================= */

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(0x111518);

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
    powerPreference: "high-performance"
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

renderer.shadowMap.enabled = true;

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

sun.castShadow = true;

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
   GAME CORE
   ========================================================= */

/*
   IMPORTANT:
   Core is loaded ONLY after DEPLOY.

   This prevents an error inside core.js
   from killing the menu before the button
   can respond.
*/

let core = null;


/* =========================================================
   DEPLOY
   ========================================================= */

async function deploy() {

  if (deployButton.disabled) {
    return;
  }


  const callsign =
    callsignInput.value.trim() ||
    "Phantom";


  const mode =
    modeSelect
      ? modeSelect.value
      : "rescue";


  /* -------------------------
     UI
  ------------------------- */

  menuStatus.textContent =
    "INITIALIZING...";

  deployButton.disabled =
    true;

  loadingScreen.style.display =
    "flex";

  loadingProgress.style.width =
    "0%";


  /* -------------------------
     Loading animation
  ------------------------- */

  let progress = 0;

  const loadingTimer =
    setInterval(() => {

      progress += 10;

      loadingProgress.style.width =
        `${progress}%`;

    }, 40);


  try {

    /*
     * Load Core now.
     */

    const module =
      await import("./core.js");


    if (
      !module ||
      !module.Core
    ) {

      throw new Error(
        "Core class was not exported from core.js"
      );

    }


    /*
     * Create the game core.
     */

    core =
      new module.Core({
        scene,
        camera,
        renderer
      });


    /*
     * Finish loading animation.
     */

    await new Promise(
      resolve =>
        setTimeout(resolve, 450)
    );


    clearInterval(
      loadingTimer
    );

    loadingProgress.style.width =
      "100%";


    await new Promise(
      resolve =>
        setTimeout(resolve, 120)
    );


    /* -------------------------
       Start game
    ------------------------- */

    menu.style.display =
      "none";

    loadingScreen.style.display =
      "none";


    core.start({
      callsign,
      mode
    });


  } catch (error) {

    clearInterval(
      loadingTimer
    );


    console.error(
      "LAST LINE CORE ERROR:",
      error
    );


    loadingScreen.style.display =
      "none";


    deployButton.disabled =
      false;


    menuStatus.textContent =
      "GAME ERROR — CHECK CORE";


    /*
     * Make the error visible
     * instead of silently failing.
     */

    setTimeout(() => {

      menuStatus.textContent =
        "CORE FAILED TO LOAD";

    }, 1000);

  }

}


/* =========================================================
   BUTTON
   ========================================================= */

deployButton.addEventListener(
  "click",
  deploy
);


/*
 * iPad / touch fallback.
 *
 * Safari normally generates a click,
 * but this gives the button an explicit
 * pointer handler as well.
 */

deployButton.addEventListener(
  "pointerup",
  event => {

    event.preventDefault();

    deploy();

  }
);


/* =========================================================
   ENTER KEY
   ========================================================= */

callsignInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      deploy();

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


  const deltaTime =
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
