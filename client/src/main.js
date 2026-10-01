import * as THREE from
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

import {
  ObjectiveSystem
} from "./game/ObjectiveSystem.js";

import {
  Extraction
} from "./game/Extraction.js";

import {
  EnemySpawner
} from "./game/EnemySpawner.js";

import {
  HitEffects
} from "./game/HitEffects.js";

import {
  SaveSystem
} from "./systems/SaveSystem.js";

import {
  Statistics
} from "./systems/Statistics.js";

import {
  MissionResult
} from "./ui/MissionResult.js";


/* =========================================================
   DOM
   ========================================================= */

const $ = id =>
  document.getElementById(id);

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
   THREE.JS
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

scene.add(
  new THREE.HemisphereLight(
    0xbad7e5,
    0x101820,
    1.5
  )
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
   CORE SYSTEMS
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
  new Player(camera);


const world =
  new World(scene);

world.build();


const enemies =
  new THREE.Group();

scene.add(enemies);


const effects =
  new THREE.Group();

scene.add(effects);


const particles =
  new Particles(effects);


const progression =
  new Progression(player);


const caseSystem =
  new CaseSystem(progression);


const hud =
  new HUD();


const missionVoice =
  new MissionVoice();


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


new Touch(input);


/* =========================================================
   NEW SYSTEMS
   ========================================================= */

const saveSystem =
  new SaveSystem(
    player,
    progression
  );

saveSystem.load();


const statistics =
  new Statistics();


const extraction =
  new Extraction(scene);


const resultScreen =
  new MissionResult();


let objectives = null;
let enemySpawner = null;


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
   LOOK
   ========================================================= */

let yaw = 0;
let pitch = 0;

const sensitivity =
  Number(
    settings.data.sensitivity ||
    0.002
  );


window.addEventListener(
  "mousemove",
  event => {

    if (!running) return;

    if (
      !pointerLocked
    ) {
      return;
    }

    yaw -=
      event.movementX *
      sensitivity;

    pitch -=
      event.movementY *
      sensitivity;

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
   MOBILE LOOK
   ========================================================= */

let touchLook = false;
let lastTouchX = 0;
let lastTouchY = 0;


renderer.domElement.addEventListener(
  "pointerdown",
  event => {

    if (
      event.pointerType ===
      "touch"
    ) {
      touchLook = true;

      lastTouchX =
        event.clientX;

      lastTouchY =
        event.clientY;
    }
  }
);


renderer.domElement.addEventListener(
  "pointermove",
  event => {

    if (
      !touchLook ||
      event.pointerType !==
        "touch"
    ) {
      return;
    }

    const dx =
      event.clientX -
      lastTouchX;

    const dy =
      event.clientY -
      lastTouchY;

    lastTouchX =
      event.clientX;

    lastTouchY =
      event.clientY;

    yaw -=
      dx *
      sensitivity *
      1.7;

    pitch -=
      dy *
      sensitivity *
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
      touchLook = false;
    }
  }
);

renderer.domElement.addEventListener(
  "pointercancel",
  () => {
    touchLook = false;
  }
);


/* =========================================================
   GAME STATE
   ========================================================= */

let running = false;
let finished = false;

let currentMissionType =
  "tdm";

let mission = null;


/* =========================================================
   EXTRACTION LOCATION
   ========================================================= */

function getExtractionPoint() {

  /*
   * We deliberately don't depend on a method that may not
   * exist in the older World.js file.
   */

  return new THREE.Vector3(
    -35,
    0,
    -35
  );
}


/* =========================================================
   HOSTAGE
   ========================================================= */

let hostage = null;

function createHostage() {

  if (hostage) {
    scene.remove(
      hostage
    );
  }

  hostage =
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


  hostage.add(body);
  hostage.add(ring);


  hostage.position.set(
    20,
    0,
    -18
  );


  scene.add(
    hostage
  );
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
   HVT
   ========================================================= */

function createHVT() {

  const target =
    enemies.children[0];

  if (!target) return;

  target.userData.isHVT =
    true;

  target.userData.hp =
    250;
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

  extraction.remove();


  if (hostage) {
    scene.remove(
      hostage
    );

    hostage = null;
  }


  const enemyCount =
    currentMissionType ===
      "survival"
      ? 8
      : 14;


  ai.spawn(
    enemyCount
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
    createHostage();
  }


  if (
    currentMissionType ===
    "survival"
  ) {

    enemySpawner =
      new EnemySpawner(ai);

    enemySpawner.start();

  } else {

    enemySpawner =
      null;
  }


  objectives =
    new ObjectiveSystem(
      currentMissionType,
      player,
      enemies,
      {
        getExtractionPoint
      }
    );


  weapon.equip(
    "vanguard"
  );


  finished = false;
  running = true;


  menu.classList.add(
    "hidden"
  );

  hudElement.classList.remove(
    "hidden"
  );


  const info =
    MISSIONS[
      currentMissionType
    ];


  $("missionName").textContent =
    info.name;

  $("objective").textContent =
    info.objective;


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
   COMPLETE MISSION
   ========================================================= */

function completeMission() {

  if (finished) return;

  finished = true;
  running = false;


  const reward =
    500;

  progression.rewardXP(
    reward
  );

  player.score +=
    reward;


  statistics.missionComplete();
  statistics.victory();

  saveSystem.save();


  missionVoice.say(
    "COMMAND",
    "Mission complete. Return to base."
  );


  if (pointerLocked) {
    controls.unlock();
  }


  resultScreen.show(
    true,
    player.score,
    reward
  );


  setTimeout(
    () => {
      hud.hide();
    },
    100
  );
}


/* =========================================================
   FAIL MISSION
   ========================================================= */

function failMission() {

  if (finished) return;

  finished = true;
  running = false;


  statistics.death();

  saveSystem.save();


  missionVoice.say(
    "COMMAND",
    "Operator down. Mission failed."
  );


  if (pointerLocked) {
    controls.unlock();
  }


  resultScreen.show(
    false,
    player.score,
    0
  );


  setTimeout(
    () => {
      hud.hide();
    },
    100
  );
}


/* =========================================================
   COMBAT
   ========================================================= */

combat.onHit =
  (
    enemy,
    damage,
    headshot
  ) => {

    const position =
      enemy.position.clone();

    position.y += 1;


    particles.burst(
      position,
      headshot
        ? 0xffffff
        : 0xffb84d,
      headshot
        ? 14
        : 8
    );
  };


combat.onKill =
  (
    enemy,
    headshot
  ) => {

    statistics.kill(
      headshot
    );


    progression.rewardXP(
      headshot
        ? 75
        : 50
    );


    particles.burst(
      enemy.position,
      0xff4055,
      15
    );


    objectives?.registerKill(
      enemy
    );


    if (
      mission &&
      currentMissionType ===
        "tdm"
    ) {
      mission.kill();
    }


    if (
      mission &&
      currentMissionType ===
        "hvt" &&
      enemy.userData.isHVT
    ) {
      mission.kill();
    }
  };


/* =========================================================
   WEAPONS
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
  }
);


/* =========================================================
   MOBILE ACTIONS
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
   CASE
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


    saveSystem.save();
  };


/* =========================================================
   GAME UPDATE
   ========================================================= */

const clock =
  new THREE.Clock();


function update(dt) {

  if (!running) {
    return;
  }


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

    const fired =
      weapon.fire();

    if (fired) {
      statistics.shot();
    }
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


  /* SURVIVAL WAVES */

  enemySpawner?.update(
    dt
  );


  /* PARTICLES */

  particles.update(
    dt
  );


  /* OBJECTIVES */

  objectives?.update(
    dt
  );


  /* MISSION */

  mission?.update(
    dt
  );


  /* HOSTAGE */

  if (
    currentMissionType ===
      "hostage" &&
    hostage
  ) {

    const distance =
      camera.position.distanceTo(
        hostage.position
      );


    if (
      distance < 3
    ) {

      objectives?.hostageSecured();

      hostage.children[0]
        .material.color
        .setHex(
          0x55ff88
        );


      $("objective").textContent =
        "HOSTAGE SECURED — MOVE TO EXTRACTION";
    }
  }


  /* EXTRACTION */

  if (
    objectives?.extractionActive
  ) {

    const point =
      objectives.extractionPosition ||
      getExtractionPoint();


    extraction.create(
      point
    );


    const distance =
      camera.position.distanceTo(
        point
      );


    if (
      distance < 4
    ) {

      objectives.complete =
        true;
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
        Math.ceil(
          60 -
          mission.time
        )
      );


    if (
      objectives?.extractionActive
    ) {

      $("objective").textContent =
        "EXTRACTION ACTIVE — REACH THE ZONE";

    } else {

      $("objective").textContent =
        `SURVIVE — ${remaining} SECONDS`;
    }
  }


  /* TDM */

  if (
    currentMissionType ===
    "tdm"
  ) {

    $("objective").textContent =
      `ELIMINATE HOSTILES — ${
        objectives?.kills ||
        mission.progress
      }/18`;
  }


  /* HVT */

  if (
    currentMissionType ===
    "hvt"
  ) {

    if (
      objectives?.extractionActive
    ) {

      $("objective").textContent =
        "TARGET NEUTRALIZED — MOVE TO EXTRACTION";

    } else {

      $("objective").textContent =
        "ELIMINATE HIGH VALUE TARGET";
    }
  }


  /* HOSTAGE */

  if (
    currentMissionType ===
    "hostage" &&
    objectives?.extractionActive
  ) {

    $("objective").textContent =
      "HOSTAGE SECURED — MOVE TO EXTRACTION";
  }


  /* SUCCESS */

  if (
    objectives?.complete ||
    mission?.complete
  ) {

    completeMission();

    return;
  }


  /* PLAYER DEAD */

  if (
    player.dead
  ) {

    failMission();

    return;
  }


  /* HUD */

  hud.update(
    player,
    weapon,
    $("objective")
      .textContent
  );


  $("score").textContent =
    player.score;

  $("level").textContent =
    player.level;

  $("xp-value").textContent =
    player.xp;
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
   CALLSIGN
   ========================================================= */

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


/* =========================================================
   INITIAL STATE
   ========================================================= */

hud.hide();

$("missionName").textContent =
  "READY";

$("objective").textContent =
  "SELECT AN OPERATION";


/* =========================================================
   DEBUG ACCESS
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
  caseSystem,
  objectives,
  statistics
};


console.log(
  "LAST LINE READY"
);
