import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import {
  PointerLockControls
} from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

import { Player } from "./game/Player.js";
import { World } from "./game/World.js";
import {
  WeaponSystem
} from "./game/Weapons.js";
import {
  EnemyManager
} from "./game/AI.js";
import { Combat } from "./game/Combat.js";
import {
  MissionVoice
} from "./game/MissionVoice.js";
import {
  Mission
} from "./systems/Missions.js";
import {
  Progression
} from "./systems/Progression.js";
import { Input } from "./input/Input.js";
import { HUD } from "./ui/HUD.js";

const menu =
  document.getElementById("menu");

const hud =
  document.getElementById("hud");

const deploy =
  document.getElementById("deploy");

const callsign =
  document.getElementById("callsign");

const missionSelect =
  document.getElementById(
    "mission-select"
  );

const status =
  document.getElementById(
    "menu-status"
  );

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(0x080c10);

const camera =
  new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    500
  );

camera.position.set(
  0,
  1.7,
  12
);

const renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });

renderer.setPixelRatio(
  Math.min(devicePixelRatio, 2)
);

renderer.setSize(
  innerWidth,
  innerHeight
);

renderer.shadowMap.enabled = true;

document.body.appendChild(
  renderer.domElement
);

const controls =
  new PointerLockControls(
    camera,
    renderer.domElement
  );

const world =
  new World(scene);

const player =
  new Player(camera);

const input =
  new Input();

const weapons =
  new WeaponSystem();

const enemies =
  new EnemyManager(
    scene,
    player
  );

const combat =
  new Combat(
    camera,
    scene,
    enemies,
    weapons
  );

const progression =
  new Progression();

const hud =
  new HUD();

const missionVoice =
  new MissionVoice();

let mission = null;
let playing = false;
let lastTime = performance.now();

deploy.addEventListener(
  "click",
  () => {
    const name =
      callsign.value.trim() ||
      "OPERATIVE";

    const type =
      missionSelect.value;

    status.textContent =
      `CALLSIGN: ${name}`;

    mission =
      new Mission(type);

    hud.mission(
      mission.data.name,
      mission.getObjective()
    );

    enemies.spawn(
      type === "survival"
        ? 10
        : 8
    );

    menu.classList.add(
      "hidden"
    );

    hud.classList.remove(
      "hidden"
    );

    playing = true;

    controls.lock();

    missionVoice.playMission(
      type
    );
  }
);

controls.addEventListener(
  "lock",
  () => {
    playing = true;
  }
);

controls.addEventListener(
  "unlock",
  () => {
    if (playing) {
      playing = false;
    }
  }
);

function shoot() {
  if (!playing || !mission) {
    return;
  }

  const result =
    combat.shoot();

  if (!result) {
    return;
  }

  if (result.hit) {
    if (result.kill) {
      progression.addKill();

      mission.kill();

      hud.kill(
        result.headshot
          ? "HEADSHOT — ENEMY DOWN"
          : "ENEMY DOWN"
      );
    }
  }
}

function update(dt) {
  if (!playing) {
    return;
  }

  player.update(
    dt,
    input,
    world
  );

  enemies.update(
    dt,
    damage => {
      const dead =
        player.damage(
          damage
        );

      if (dead) {
        playing = false;

        controls.unlock();

        missionVoice.say(
          "COMMAND",
          "Operative down. Mission failed.",
          3500
        );

        setTimeout(() => {
          location.reload();
        }, 3500);
      }
    }
  );

  mission.update();

  hud.health(
    player.health
  );

  hud.weapon(
    weapons.current,
    weapons.ammo[
      weapons.currentKey
    ],
    weapons.reserve[
      weapons.currentKey
    ]
  );

  hud.mission(
    mission.data.name,
    mission.getObjective()
  );

  if (input.consumeReload()) {
    weapons.reload();
  }

  if (input.fire) {
    shoot();
  }

  if (mission.complete) {
    playing = false;

    controls.unlock();

    missionVoice.say(
      "COMMAND",
      "Mission complete. Extraction successful.",
      4000
    );

    setTimeout(() => {
      location.reload();
    }, 4500);
  }
}

function animate() {
  requestAnimationFrame(
    animate
  );

  const now =
    performance.now();

  const dt =
    Math.min(
      (now - lastTime) / 1000,
      0.05
    );

  lastTime = now;

  update(dt);

  renderer.render(
    scene,
    camera
  );
}

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

window.addEventListener(
  "mousedown",
  e => {
    if (
      e.button === 0 &&
      playing
    ) {
      shoot();
    }
  }
);

document
  .getElementById("mobile-fire")
  ?.addEventListener(
    "touchstart",
    e => {
      e.preventDefault();
      shoot();
    }
  );

document
  .getElementById("mobile-reload")
  ?.addEventListener(
    "touchstart",
    e => {
      e.preventDefault();
      weapons.reload();
    }
  );

document
  .getElementById("mobile-switch")
  ?.addEventListener(
    "touchstart",
    e => {
      e.preventDefault();
      weapons.next();
    }
  );

animate();
