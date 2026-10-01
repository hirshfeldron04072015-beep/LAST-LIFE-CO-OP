import { ObjectiveSystem } from "./game/ObjectiveSystem.js";
import { Extraction } from "./game/Extraction.js";
import { EnemySpawner } from "./game/EnemySpawner.js";
import { HitEffects } from "./game/HitEffects.js";
import { SaveSystem } from "./systems/SaveSystem.js";
import { Statistics } from "./systems/Statistics.js";
import { MissionResult } from "./ui/MissionResult.js";import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { PointerLockControls } from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

import { World } from "./game/World.js";
import { Player } from "./game/Player.js";
import { AIController } from "./game/AI.js";
import { Combat } from "./game/Combat.js";
import {
  WeaponSystem,
  WEAPONS
} from "./game/Weapons.js";

import { Particles } from "./game/Particles.js";

import {
  Progression
} from "./systems/Progression.js";

import {
  Mission,
  MISSIONS
} from "./systems/Missions.js";

import {
  CaseSystem
} from "./systems/CaseSystem.js";

import {
  Settings
} from "./systems/Settings.js";

import { Input } from "./input/Input.js";
import { Touch } from "./input/Touch.js";

import { HUD } from "./ui/HUD.js";

import {
  MissionVoice
} from "./game/MissionVoice.js";


/* =========================================================
   HELPERS
   ========================================================= */

const $ = id =>
  document.getElementById(id);


/* =========================================================
   DOM
   ========================================================= */

const menu =
  $("menu");

const hudElement =
  $("hud");

const deploy =
  $("deploy");

const missionSelect =
  $("mission");

const callsignInput =
  $("callsign");


/* =========================================================
   RENDERER
   ========================================================= */

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(
    0x071018
  );

scene.fog =
  new THREE.Fog(
    0x071018,
    35,
    170
  );


const camera =
  new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.05,
    400
  );

camera.position.set(
  0,
  1.7,
  12
);


const renderer =
  new THREE.WebGLRenderer({
    antialias: true,
    powerPreference:
      "high-performance"
  });

renderer.setSize(
  innerWidth,
  innerHeight
);

renderer.setPixelRatio(
  Math.min(
    devicePixelRatio,
    2
  )
);

renderer.shadowMap.enabled =
  true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

document.body.prepend(
  renderer.domElement
);


/* =========================================================
   LIGHTING
   ========================================================= */

const hemisphere =
  new THREE.HemisphereLight(
    0xbad7e5,
    0x101820,
    1.5
  );

scene.add(
  hemisphere
);


const sun =
  new THREE.DirectionalLight(
    0xffffff,
    2
  );

sun.position.set(
  30,
  45,
  15
);

sun.castShadow =
  true;

sun.shadow.mapSize.width =
  2048;

sun.shadow.mapSize.height =
  2048;

scene.add(
  sun
);


/* =========================================================
   SYSTEMS
   ========================================================= */

const input =
  new Input();

input.bindMouse(
  renderer.domElement
);


const settings =
  new Settings();

settings.load();


camera.fov =
  settings.data.fov;

camera.updateProjectionMatrix();


const player =
  new Player(
    camera
  );


const world =
  new World(
    scene
  );


const enemies =
  new THREE.Group();

scene.add(
  enemies
);


const effects =
  new THREE.Group();

scene.add(
  effects
);


const particles =
  new Particles(
    effects
  );


const progression =
  new Progression(
    player
  );


const caseSystem =
  new CaseSystem(
    progression
  );


const hud =
  new HUD();


const missionVoice =
  new MissionVoice();


let mission = null;


const combat =
  new Combat(
    camera,
    enemies,
    effects,
    player
  );


const ai =
  new AIController(
    scene,
    enemies,
    player
  );


const weapon =
  new WeaponSystem(
    camera,
    combat,
    effects
  );


const touch =
  new Touch(
    input
  );


/* =========================================================
   POINTER LOCK
   ========================================================= */

const controls =
  new PointerLockControls(
    camera,
    document.body
  );


let pointerLocked =
  false;


controls.addEventListener(
  "lock",
  () => {
    pointerLocked = true;
  }
);


controls.addEventListener(
  "unlock",
  () => {
    pointerLocked = false;
  }
);


/* =========================================================
   LOOK SYSTEM
   ========================================================= */

let yaw = 0;
let pitch = 0;

let lookSensitivity =
  settings.data.sensitivity;


window.addEventListener(
  "mousemove",
  event => {
    if (!running) return;

    if (
      !pointerLocked &&
      !("ontouchstart" in window)
    ) {
      return;
    }

    yaw -=
      event.movementX *
      lookSensitivity;

    pitch -=
      event.movementY *
      lookSensitivity;

    pitch =
      Math.max(
        -Math.PI / 2 + 0.05,
        Math.min(
          Math.PI / 2 - 0.05,
          pitch
        )
      );

    camera.rotation.order =
      "YXZ";

    camera.rotation.y =
      yaw;

    camera.rotation.x =
      pitch;
  }
);


/* =========================================================
   MOBILE AIM
   ========================================================= */

let touchLookActive =
  false;

let touchLookX = 0;
let touchLookY = 0;


renderer.domElement.addEventListener(
  "pointerdown",
  event => {
    if (
      event.pointerType ===
      "touch"
    ) {
      touchLookActive = true;
      touchLookX =
        event.clientX;
      touchLookY =
        event.clientY;
    }
  }
);


renderer.domElement.addEventListener(
  "pointermove",
  event => {
    if (
      !touchLookActive ||
      event.pointerType !==
        "touch"
    ) {
      return;
    }

    const dx =
      event.clientX -
      touchLookX;

    const dy =
      event.clientY -
      touchLookY;

    touchLookX =
      event.clientX;

    touchLookY =
      event.clientY;

    yaw -=
      dx *
      lookSensitivity *
      1.7;

    pitch -=
      dy *
      lookSensitivity *
      1.7;

    pitch =
      Math.max(
        -Math.PI / 2 + 0.05,
        Math.min(
          Math.PI / 2 - 0.05,
          pitch
        )
      );

    camera.rotation.order =
      "YXZ";

    camera.rotation.y =
      yaw;

    camera.rotation.x =
      pitch;
  }
);


renderer.domElement.addEventListener(
  "pointerup",
  event => {
    if (
      event.pointerType ===
      "touch"
    ) {
      touchLookActive = false;
    }
  }
);


/* =========================================================
   GAME STATE
   ========================================================= */

let running = false;
let gameFinished = false;

let currentMissionType =
  "tdm";

let missionStartedAt =
  0;

let hostageMarker = null;

let hvt = null;


/* =========================================================
   BUILD WORLD
   ========================================================= */

world.build();


/* =========================================================
   HOSTAGE MARKER
   ========================================================= */

function createHostageMarker() {
  if (hostageMarker) {
    scene.remove(
      hostageMarker
    );
  }

  hostageMarker =
    new THREE.Group();

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.35,
        0.8,
        4,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0x42e8ff
      })
    );

  body.position.y =
    0.8;

  hostageMarker.add(
    body
  );


  const ring =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        1.2,
        0.05,
        8,
        32
      ),
      new THREE.MeshBasicMaterial({
        color: 0x42e8ff
      })
    );

  ring.rotation.x =
    Math.PI / 2;

  ring.position.y =
    0.05;

  hostageMarker.add(
    ring
  );


  hostageMarker.position.set(
    20,
    0,
    -18
  );

  scene.add(
    hostageMarker
  );
}


/* =========================================================
   HVT
   ========================================================= */

function createHVT() {
  hvt = null;

  const candidate =
    enemies.children[0];

  if (!candidate) return;

  candidate.userData.isHVT =
    true;

  candidate.userData.hp =
    250;

  hvt =
    candidate;
}


/* =========================================================
   CLEAR ENEMIES
   ========================================================= */

function clearEnemies() {
  while (
    enemies.children.length
  ) {
    const enemy =
      enemies.children[
        enemies.children.length - 1
      ];

    enemies.remove(
      enemy
    );
  }
}


/* =========================================================
   START MISSION
   ========================================================= */

function startMission() {
  currentMissionType =
    missionSelect.value;

  mission =
    new Mission(
      currentMissionType
    );

  player.reset();

  clearEnemies();

  if (hostageMarker) {
    scene.remove(
      hostageMarker
    );

    hostageMarker =
      null;
  }


  ai.spawn(
    currentMissionType ===
      "survival"
      ? 9
      : 14
  );


  if (
    currentMissionType ===
    "hvt"
  ) {
    createHVT();
  }


  if (
    currentMissionType ===
    "hostage"
  ) {
    createHostageMarker();
  }


  weapon.equip(
    "vanguard"
  );


  running = true;
  gameFinished = false;

  missionStartedAt =
    performance.now();


  menu.classList.add(
    "hidden"
  );

  hudElement.classList.remove(
    "hidden"
  );


  const missionInfo =
    MISSIONS[
      currentMissionType
    ];


  $("missionName").textContent =
    missionInfo.name;


  $("objective").textContent =
    missionInfo.objective;


  missionVoice.playMission(
    currentMissionType
  );


  if (
    !("ontouchstart" in window)
  ) {
    controls.lock();
  }
}


/* =========================================================
   END MISSION
   ========================================================= */

function finishMission(success) {
  if (gameFinished) return;

  gameFinished = true;
  running = false;

  if (success) {
    progression.rewardXP(
      500
    );

    player.score +=
      500;

    hud.toast(
      "MISSION COMPLETE"
    );

    missionVoice.say(
      "COMMAND",
      "Mission complete. Return to base."
    );
  } else {
    hud.toast(
      "MISSION FAILED"
    );

    missionVoice.say(
      "COMMAND",
      "Operator down. Mission failed."
    );
  }


  if (
    pointerLocked
  ) {
    controls.unlock();
  }


  setTimeout(
    () => {
      hud.hide();
      menu.classList.remove(
        "hidden"
      );
    },
    2500
  );
}


/* =========================================================
   COMBAT CALLBACKS
   ========================================================= */

combat.onHit =
  (
    enemy,
    damage,
    headshot
  ) => {

    const position =
      enemy.position.clone();

    position.y +=
      1.2;

    particles.burst(
      position,
      headshot
        ? 0xffffff
        : 0xffc86b,
      headshot
        ? 16
        : 8
    );
  };


combat.onKill =
  (
    enemy,
    headshot
  ) => {

    progression.rewardXP(
      headshot
        ? 75
        : 50
    );


    particles.burst(
      enemy.position,
      0xff4055,
      18
    );


    if (
      currentMissionType ===
      "tdm"
    ) {
      mission.kill();
    }


    if (
      currentMissionType ===
      "hvt" &&
      enemy.userData.isHVT
    ) {
      mission.kill();
    }


    scoreUpdate();
  };


/* =========================================================
   UI SCORE
   ========================================================= */

function scoreUpdate() {
  $("score").textContent =
    player.score;

  $("level").textContent =
    player.level;

  $("xp-value").textContent =
    player.xp;
}


/* =========================================================
   WEAPON SWITCH
   ========================================================= */

const weaponOrder = [
  "vanguard",
  "spectre",
  "sentinel",
  "breach"
];


let weaponIndex = 0;


function switchWeapon() {
  weaponIndex =
    (weaponIndex + 1) %
    weaponOrder.length;

  weapon.equip(
    weaponOrder[
      weaponIndex
    ]
  );

  hud.toast(
    WEAPONS[
      weaponOrder[
        weaponIndex
      ]
    ].name
  );
}


/* =========================================================
   KEYBOARD WEAPONS
   ========================================================= */

window.addEventListener(
  "keydown",
  event => {
    if (!running) return;

    if (
      event.code ===
      "Digit1"
    ) {
      weaponIndex = 0;
      weapon.equip(
        "vanguard"
      );
    }

    if (
      event.code ===
      "Digit2"
    ) {
      weaponIndex = 1;
      weapon.equip(
        "spectre"
      );
    }

    if (
      event.code ===
      "Digit3"
    ) {
      weaponIndex = 2;
      weapon.equip(
        "sentinel"
      );
    }

    if (
      event.code ===
      "Digit4"
    ) {
      weaponIndex = 3;
      weapon.equip(
        "breach"
      );
    }

    if (
      event.code ===
      "KeyR"
    ) {
      weapon.reload();
    }

    if (
      event.code ===
      "Escape"
    ) {
      if (
        pointerLocked
      ) {
        controls.unlock();
      }
    }
  }
);


/* =========================================================
   MOBILE BUTTONS
   ========================================================= */

$("mobile-switch")
  ?.addEventListener(
    "pointerdown",
    () => {
      if (running) {
        switchWeapon();
      }
    }
  );


$("mobile-reload")
  ?.addEventListener(
    "pointerdown",
    () => {
      if (running) {
        weapon.reload();
      }
    }
  );


/* =========================================================
   DEPLOY
   ========================================================= */

deploy.addEventListener(
  "click",
  () => {
    startMission();
  }
);


/* =========================================================
   CASE SYSTEM
   ========================================================= */

window.openCase =
  () => {

    const result =
      caseSystem.open();

    if (!result) {
      hud.toast(
        "NO CASE KEY"
      );

      return;
    }

    hud.toast(
      `${result.rarity.toUpperCase()} — ${result.item}`
    );
  };


/* =========================================================
   GAME UPDATE
   ========================================================= */

const clock =
  new THREE.Clock();


function update(dt) {
  if (!running) return;


  /* PLAYER */

  player.update(
    dt,
    input
  );


  /* WEAPON */

  weapon.update(
    dt
  );


  /* FIRE */

  if (
    input.mouse.down
  ) {
    weapon.fire();
  }


  /* RELOAD */

  if (
    input.reload
  ) {
    weapon.reload();
    input.reload = false;
  }


  /* AI */

  ai.update(
    dt
  );


  /* PARTICLES */

  particles.update(
    dt
  );


  /* MISSION */

  mission.update(
    dt
  );


  /* HOSTAGE */

  if (
    currentMissionType ===
    "hostage" &&
    hostageMarker
  ) {

    const distance =
      camera.position.distanceTo(
        hostageMarker.position
      );

    if (
      distance < 3
    ) {
      mission.hostageSecured();

      hostageMarker
        .children[0]
        .material.color
        .setHex(
          0x55ff88
        );

      $("objective").textContent =
        "HOSTAGE SECURED — EXTRACTION COMPLETE";
    }
  }


  /* SURVIVAL */

  if (
    currentMissionType ===
    "survival"
  ) {

    const remaining =
      Math.max(
        0,
        60 -
        mission.time
      );

    $("objective").textContent =
      `SURVIVE — ${Math.ceil(remaining)} SECONDS`;
  }


  /* TDM */

  if (
    currentMissionType ===
    "tdm"
  ) {

    $("objective").textContent =
      `ELIMINATE HOSTILES — ${mission.progress}/18`;
  }


  /* HVT */

  if (
    currentMissionType ===
    "hvt"
  ) {

    $("objective").textContent =
      hvt &&
      hvt.userData.hp > 0
        ? "ELIMINATE HIGH VALUE TARGET"
        : "TARGET NEUTRALIZED";
  }


  /* MISSION COMPLETE */

  if (
    mission.complete
  ) {
    finishMission(
      true
    );
  }


  /* PLAYER DEATH */

  if (
    player.dead
  ) {
    finishMission(
      false
    );
  }


  /* HUD */

  hud.update(
    player,
    weapon,
    $("objective")
      .textContent
  );


  scoreUpdate();
}


/* =========================================================
   RENDER LOOP
   ========================================================= */

function animate() {
  requestAnimationFrame(
    animate
  );

  const dt =
    Math.min(
      clock.getDelta(),
      0.05
    );

  update(dt);

  renderer.render(
    scene,
    camera
  );
}


animate();


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      innerWidth /
      innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      innerWidth,
      innerHeight
    );
  }
);


/* =========================================================
   INITIAL UI
   ========================================================= */

hud.hide();

$("missionName").textContent =
  "READY";

$("objective").textContent =
  "SELECT AN OPERATION";


/* =========================================================
   CALLSIGN
   ========================================================= */

callsignInput?.addEventListener(
  "change",
  () => {

    const value =
      callsignInput.value
        .trim()
        .toUpperCase();

    if (value) {
      localStorage.setItem(
        "lastline_callsign",
        value
      );
    }
  }
);


const savedCallsign =
  localStorage.getItem(
    "lastline_callsign"
  );

if (
  savedCallsign &&
  callsignInput
) {
  callsignInput.value =
    savedCallsign;
}


/* =========================================================
   DEBUG / CONSOLE
   ========================================================= */

window.LastLine = {
  scene,
  camera,
  player,
  world,
  enemies,
  weapon,
  mission,
  progression,
  caseSystem
};

console.log(
  "LAST LINE INITIALIZED"
);
