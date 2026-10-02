import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { Core } from "./core.js";


/* =========================================================
   BASIC DOM REFERENCES
   ========================================================= */

const gameContainer =
  document.getElementById("game");

const menu =
  document.getElementById("menu");

const deployButton =
  document.getElementById("deployButton");

const callsignInput =
  document.getElementById("callsign");

const loadingScreen =
  document.getElementById("loadingScreen");

const loadingProgress =
  document.getElementById("loadingProgress");

const menuStatus =
  document.getElementById("menuStatus");


/* =========================================================
   THREE.JS SCENE
   ========================================================= */

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(0x111518);


/* =========================================================
   FOG
   ========================================================= */

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

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.near = 1;
sun.shadow.camera.far = 180;

sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;

scene.add(
  sun
);


/* =========================================================
   SECONDARY LIGHT
   ========================================================= */

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
   CORE GAME
   ========================================================= */

const core =
  new Core({
    scene,
    camera,
    renderer
  });


/* =========================================================
   DEPLOY BUTTON
   ========================================================= */

deployButton.addEventListener(
  "click",
  () => {

    const callsign =
      callsignInput.value.trim();

    if (callsign.length === 0) {

      menuStatus.textContent =
        "ENTER CALLSIGN";

      callsignInput.focus();

      return;
    }


    menuStatus.textContent =
      "INITIALIZING...";


    deployButton.disabled = true;


    loadingScreen.style.display =
      "flex";


    /*
     * Small loading sequence.
     * Later this will be replaced by
     * the real asset-loading system.
     */

    let progress = 0;


    const loadingTimer =
      setInterval(() => {

        progress += 10;

        loadingProgress.style.width =
          `${progress}%`;


        if (progress >= 100) {

          clearInterval(
            loadingTimer
          );


          loadingScreen.style.display =
            "none";

          menu.style.display =
            "none";


          core.start({
            callsign
          });

        }

      }, 40);

  }
);


/* =========================================================
   ENTER KEY
   ========================================================= */

callsignInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter"
    ) {

      deployButton.click();

    }

  }
);


/* =========================================================
   WINDOW RESIZE
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
   VISIBILITY HANDLING
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      core.pause();

    } else {

      core.resume();

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


  /*
   * Prevent enormous
   * time jumps when the
   * browser pauses the tab.
   */

  const deltaTime =
    Math.min(
      elapsed / 1000,
      0.05
    );


  core.update(
    deltaTime
  );


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
