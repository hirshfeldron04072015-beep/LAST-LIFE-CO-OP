import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


/* =========================================================
   CORE
   Central game controller.
   No audio.
========================================================= */

export class Core {

  constructor({
    scene,
    camera,
    renderer
  }) {

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.running = false;
    this.paused = false;

    this.callsign = "PHANTOM";
    this.mode = "survival";

    this.world = null;
    this.player = null;

    this.enemies = [];
    this.enemyGroup = new THREE.Group();

    this.elapsed = 0;
    this.wave = 0;
    this.score = 0;
    this.kills = 0;

    this.move = {
      x: 0,
      y: 0
    };

    this.look = {
      x: 0,
      y: 0
    };

    this.yaw = 0;
    this.pitch = 0;

    this.lastShot = 0;

    this.boundary = 60;

    this.createWorld();
    this.createLighting();

    this.scene.add(
      this.enemyGroup
    );
  }


  /* =======================================================
     WORLD
  ======================================================= */

  createWorld() {

    const groundMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x29332f,
        roughness: 0.92,
        metalness: 0.05
      });

    const ground =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          130,
          1,
          130
        ),
        groundMaterial
      );

    ground.position.y = -0.5;

    ground.receiveShadow = true;

    this.scene.add(ground);

    this.worldGround = ground;


    /* -----------------------------------------------
       ARENA WALLS
    ------------------------------------------------ */

    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x3d4648,
        roughness: 0.86
      });

    this.addBox(
      130,
      8,
      2,
      0,
      4,
      -65,
      wallMaterial
    );

    this.addBox(
      130,
      8,
      2,
      0,
      4,
      65,
      wallMaterial
    );

    this.addBox(
      2,
      8,
      130,
      -65,
      4,
      0,
      wallMaterial
    );

    this.addBox(
      2,
      8,
      130,
      65,
      4,
      0,
      wallMaterial
    );


    /* -----------------------------------------------
       COVER
    ------------------------------------------------ */

    this.addBox(
      9,
      3,
      3,
      -18,
      1.5,
      -12,
      wallMaterial
    );

    this.addBox(
      9,
      3,
      3,
      18,
      1.5,
      -12,
      wallMaterial
    );

    this.addBox(
      6,
      2.5,
      5,
      -25,
      1.25,
      15,
      wallMaterial
    );

    this.addBox(
      6,
      2.5,
      5,
      25,
      1.25,
      15,
      wallMaterial
    );


    /* -----------------------------------------------
       CENTRAL BARRIERS
    ------------------------------------------------ */

    const barrierMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x56605d,
        roughness: 0.8
      });

    this.addBox(
      12,
      2.2,
      2,
      0,
      1.1,
      -27,
      barrierMaterial
    );

    this.addBox(
      12,
      2.2,
      2,
      0,
      1.1,
      27,
      barrierMaterial
    );


    /* -----------------------------------------------
       CRATES
    ------------------------------------------------ */

    const crateMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x685b43,
        roughness: 0.95
      });

    const cratePositions = [
      [-10, 0, -22],
      [-7, 0, -22],
      [10, 0, -22],
      [13, 0, -22],
      [-12, 0, 21],
      [-9, 0, 21],
      [12, 0, 21],
      [15, 0, 21]
    ];

    for (const p of cratePositions) {

      this.addBox(
        2.2,
        2.2,
        2.2,
        p[0],
        1.1,
        p[2],
        crateMaterial
      );

    }


    /* -----------------------------------------------
       EXTRACTION ZONE
    ------------------------------------------------ */

    const extractionMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x00c9e8,
        emissive: 0x004b5a,
        emissiveIntensity: 1.8,
        roughness: 0.35
      });

    const extraction =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          4,
          4,
          0.12,
          32
        ),
        extractionMaterial
      );

    extraction.position.set(
      0,
      0.06,
      -50
    );

    extraction.receiveShadow = true;

    this.scene.add(
      extraction
    );

    this.extraction =
      extraction;


    /* -----------------------------------------------
       SIMPLE ROAD
    ------------------------------------------------ */

    const roadMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x202528,
        roughness: 1
      });

    const road =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          11,
          0.04,
          125
        ),
        roadMaterial
      );

    road.position.y = 0.025;

    this.scene.add(road);


    /* -----------------------------------------------
       ROAD MARKINGS
    ------------------------------------------------ */

    const markingMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xc9b45c
      });

    for (
      let z = -58;
      z <= 58;
      z += 8
    ) {

      const marking =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.22,
            0.045,
            3.2
          ),
          markingMaterial
        );

      marking.position.set(
        0,
        0.06,
        z
      );

      this.scene.add(marking);
    }
  }


  addBox(
    sx,
    sy,
    sz,
    x,
    y,
    z,
    material
  ) {

    const mesh =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          sx,
          sy,
          sz
        ),
        material
      );

    mesh.position.set(
      x,
      y,
      z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.scene.add(mesh);

    return mesh;
  }


  /* =======================================================
     LIGHTING
  ======================================================= */

  createLighting() {

    const ambient =
      new THREE.HemisphereLight(
        0xb8d2df,
        0x20251f,
        1.35
      );

    this.scene.add(
      ambient
    );


    const sun =
      new THREE.DirectionalLight(
        0xffe8c4,
        2.4
      );

    sun.position.set(
      35,
      55,
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
      160;

    sun.shadow.camera.left =
      -80;

    sun.shadow.camera.right =
      80;

    sun.shadow.camera.top =
      80;

    sun.shadow.camera.bottom =
      -80;

    this.scene.add(
      sun
    );


    const fill =
      new THREE.DirectionalLight(
        0x7fa4c4,
        0.4
      );

    fill.position.set(
      -30,
      20,
      -40
    );

    this.scene.add(
      fill
    );
  }


  /* =======================================================
     START
  ======================================================= */

  start(options = {}) {

    this.callsign =
      options.callsign ||
      "PHANTOM";

    this.mode =
      options.mode ||
      document
        .getElementById("mode")
        ?.value ||
      "survival";

    this.running = true;
    this.paused = false;

    this.wave = 0;
    this.score = 0;
    this.kills = 0;
    this.elapsed = 0;

    this.setupPlayer();
    this.setupMobileControls();

    this.spawnInitialEnemies();

    this.updateMenuHUD();

    this.showMobileControls();

    this.setObjective(
      this.getObjectiveText()
    );
  }


  /* =======================================================
     PLAYER
  ======================================================= */

  setupPlayer() {

    /*
     * We intentionally keep the player controller
     * independent from the menu so deployment cannot
     * fail because a secondary system is missing.
     */

    this.camera.position.set(
      0,
      1.7,
      12
    );

    this.camera.rotation.set(
      0,
      0,
      0
    );


    /* FPS body / weapon placeholder */

    this.weaponGroup =
      new THREE.Group();

    this.weaponGroup.position.set(
      0.34,
      -0.28,
      -0.62
    );

    this.camera.add(
      this.weaponGroup
    );

    this.scene.add(
      this.camera
    );


    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.18,
          0.18,
          0.7
        ),
        new THREE.MeshStandardMaterial({
          color: 0x151a1d,
          roughness: 0.45,
          metalness: 0.7
        })
      );

    body.position.set(
      0,
      0,
      -0.25
    );

    this.weaponGroup.add(
      body
    );


    const barrel =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.035,
          0.045,
          0.55,
          10
        ),
        new THREE.MeshStandardMaterial({
          color: 0x090b0c,
          roughness: 0.35,
          metalness: 0.85
        })
      );

    barrel.rotation.x =
      Math.PI / 2;

    barrel.position.set(
      0,
      0.02,
      -0.58
    );

    this.weaponGroup.add(
      barrel
    );


    this.health = 100;
    this.armor = 50;

    this.ammo = 30;
    this.reserveAmmo = 120;

    this.level = 1;
    this.xp = 0;

    this.fireCooldown = 0;
  }


  /* =======================================================
     MOBILE CONTROLS
  ======================================================= */

  setupMobileControls() {

    this.mobile =
      document.getElementById(
        "mobile"
      );

    this.moveStick =
      document.getElementById(
        "moveStick"
      );

    this.lookStick =
      document.getElementById(
        "lookStick"
      );

    this.fireButton =
      document.getElementById(
        "fire"
      );

    this.reloadButton =
      document.getElementById(
        "reload"
      );

    this.moveX = 0;
    this.moveY = 0;

    this.lookX = 0;
    this.lookY = 0;

    this.moveActive = false;
    this.lookActive = false;


    if (!this.moveStick)
      return;


    this.bindStick(
      this.moveStick,
      true
    );

    this.bindStick(
      this.lookStick,
      false
    );


    if (this.fireButton) {

      this.fireButton.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();

          this.shooting = true;

          this.shoot();

        }
      );

      this.fireButton.addEventListener(
        "pointerup",
        event => {

          event.preventDefault();

          this.shooting = false;

        }
      );

      this.fireButton.addEventListener(
        "pointercancel",
        () => {

          this.shooting = false;

        }
      );
    }


    if (this.reloadButton) {

      this.reloadButton.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();

          this.reload();

        }
      );
    }


    window.addEventListener(
      "keydown",
      event => {

        if (
          event.code ===
          "KeyR"
        ) {

          this.reload();

        }

      }
    );
  }


  bindStick(
    element,
    movement
  ) {

    if (!element)
      return;

    const knob =
      element.querySelector(
        ".knob"
      );

    let active = false;

    const update =
      event => {

        if (!active)
          return;

        const rect =
          element.getBoundingClientRect();

        const cx =
          rect.left +
          rect.width / 2;

        const cy =
          rect.top +
          rect.height / 2;

        let x =
          event.clientX - cx;

        let y =
          event.clientY - cy;

        const max =
          rect.width / 2 - 28;

        const distance =
          Math.hypot(
            x,
            y
          );

        if (
          distance > max
        ) {

          x =
            x / distance *
            max;

          y =
            y / distance *
            max;
        }

        const nx =
          x / max;

        const ny =
          y / max;

        if (knob) {

          knob.style.transform =
            `translate(${x}px,${y}px)`;

        }

        if (movement) {

          this.moveX = nx;
          this.moveY = ny;

        } else {

          this.lookX = nx;
          this.lookY = ny;

        }
      };


    const end =
      () => {

        active = false;

        if (knob) {

          knob.style.transform =
            "translate(0,0)";

        }

        if (movement) {

          this.moveX = 0;
          this.moveY = 0;

        } else {

          this.lookX = 0;
          this.lookY = 0;

        }
      };


    element.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        active = true;

        element.setPointerCapture(
          event.pointerId
        );

        update(event);

      }
    );


    element.addEventListener(
      "pointermove",
      update
    );


    element.addEventListener(
      "pointerup",
      end
    );


    element.addEventListener(
      "pointercancel",
      end
    );
  }


  showMobileControls() {

    if (
      this.mobile
    ) {

      this.mobile.style.display =
        "block";

    }
  }


  /* =======================================================
     ENEMIES
  ======================================================= */

  spawnInitialEnemies() {

    this.clearEnemies();

    const count =
      this.mode === "tdm"
        ? 6
        : 5;

    for (
      let i = 0;
      i < count;
      i++
    ) {

      this.spawnEnemy();
    }

    this.wave = 1;
  }


  spawnEnemy() {

    const enemy =
      new THREE.Group();

    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x303a40,
        roughness: 0.75,
        metalness: 0.15
      });


    const skinMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x9b705d,
        roughness: 0.9
      });


    /* torso */

    const torso =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.42,
          0.75,
          6,
          12
        ),
        bodyMaterial
      );

    torso.position.y =
      1.05;

    torso.castShadow = true;

    enemy.add(torso);


    /* head */

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.27,
          16,
          12
        ),
        skinMaterial
      );

    head.position.y =
      1.75;

    head.castShadow = true;

    enemy.add(head);


    /* helmet */

    const helmet =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.31,
          16,
          8,
          0,
          Math.PI * 2,
          0,
          Math.PI / 2
        ),
        bodyMaterial
      );

    helmet.position.y =
      1.84;

    enemy.add(helmet);


    /* arms */

    const armGeometry =
      new THREE.CapsuleGeometry(
        0.11,
        0.65,
        5,
        8
      );

    const leftArm =
      new THREE.Mesh(
        armGeometry,
        bodyMaterial
      );

    leftArm.position.set(
      -0.48,
      1.08,
      0
    );

    leftArm.rotation.z =
      -0.18;

    enemy.add(leftArm);


    const rightArm =
      new THREE.Mesh(
        armGeometry,
        bodyMaterial
      );

    rightArm.position.set(
      0.48,
      1.08,
      0
    );

    rightArm.rotation.z =
      0.18;

    enemy.add(rightArm);


    /* legs */

    const legGeometry =
      new THREE.CapsuleGeometry(
        0.14,
        0.65,
        5,
        8
      );

    const leftLeg =
      new THREE.Mesh(
        legGeometry,
        bodyMaterial
      );

    leftLeg.position.set(
      -0.18,
      0.4,
      0
    );

    enemy.add(leftLeg);


    const rightLeg =
      new THREE.Mesh(
        legGeometry,
        bodyMaterial
      );

    rightLeg.position.set(
      0.18,
      0.4,
      0
    );

    enemy.add(rightLeg);


    /* weapon */

    const weapon =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.12,
          0.12,
          0.85
        ),
        new THREE.MeshStandardMaterial({
          color: 0x101315,
          metalness: 0.75,
          roughness: 0.35
        })
      );

    weapon.position.set(
      0,
      1.02,
      -0.48
    );

    enemy.add(weapon);


    /* spawn position */

    const angle =
      Math.random() *
      Math.PI * 2;

    const radius =
      25 +
      Math.random() * 25;

    enemy.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );


    enemy.userData.hp =
      100;

    enemy.userData.speed =
      1.1 +
      Math.random() * 0.55;

    enemy.userData.attackTimer =
      1 +
      Math.random();

    enemy.userData.alive =
      true;

    enemy.userData.animTime =
      Math.random() *
      Math.PI * 2;


    this.enemyGroup.add(
      enemy
    );

    this.enemies.push(
      enemy
    );
  }


  clearEnemies() {

    while (
      this.enemyGroup.children.length
    ) {

      const enemy =
        this.enemyGroup.children[
          0
        ];

      this.enemyGroup.remove(
        enemy
      );
    }

    this.enemies = [];
  }


  /* =======================================================
     SHOOTING
  ======================================================= */

  shoot() {

    if (!this.running)
      return;

    if (
      this.fireCooldown >
      0
    )
      return;

    if (
      this.ammo <= 0
    ) {

      this.reload();

      return;
    }


    this.fireCooldown =
      0.12;

    this.ammo--;


    const raycaster =
      new THREE.Raycaster();

    raycaster.setFromCamera(
      new THREE.Vector2(
        0,
        0
      ),
      this.camera
    );


    const hits =
      raycaster.intersectObjects(
        this.enemyGroup.children,
        true
      );


    if (
      hits.length
    ) {

      let object =
        hits[0].object;

      while (
        object.parent &&
        object.parent !==
          this.enemyGroup
      ) {

        object =
          object.parent;

      }


      if (
        object.parent ===
        this.enemyGroup
      ) {

        this.damageEnemy(
          object,
          35
        );
      }
    }


    this.updateHUD();
  }


  damageEnemy(
    enemy,
    damage
  ) {

    enemy.userData.hp -=
      damage;


    /* hit flash */

    enemy.traverse(
      object => {

        if (
          object.material &&
          object.material.emissive
        ) {

          object.material.emissive
            .setHex(
              0x551111
            );

        }
      }
    );


    if (
      enemy.userData.hp <= 0
    ) {

      this.killEnemy(
        enemy
      );

    }
  }


  killEnemy(
    enemy
  ) {

    this.enemyGroup.remove(
      enemy
    );

    const index =
      this.enemies.indexOf(
        enemy
      );

    if (
      index >= 0
    ) {

      this.enemies.splice(
        index,
        1
      );
    }


    this.kills++;
    this.score += 100;

    this.addXP(50);


    if (
      this.enemies.length === 0
    ) {

      this.wave++;

      setTimeout(
        () => {

          if (
            this.running
          ) {

            const count =
              Math.min(
                5 +
                this.wave * 2,
                16
              );

            for (
              let i = 0;
              i < count;
              i++
            ) {

              this.spawnEnemy();

            }

            this.setObjective(
              this.getObjectiveText()
            );
          }

        },
        800
      );
    }

    this.updateHUD();
  }


  /* =======================================================
     RELOAD
  ======================================================= */

  reload() {

    if (
      this.ammo >= 30 ||
      this.reserveAmmo <= 0
    )
      return;


    const amount =
      Math.min(
        30 - this.ammo,
        this.reserveAmmo
      );

    this.ammo +=
      amount;

    this.reserveAmmo -=
      amount;

    this.updateHUD();
  }


  /* =======================================================
     XP / LEVEL
  ======================================================= */

  addXP(amount) {

    this.xp += amount;

    const required =
      this.level * 100;

    if (
      this.xp >= required
    ) {

      this.xp -=
        required;

      this.level++;

      this.showMessage(
        `LEVEL ${this.level}`
      );
    }

    this.updateHUD();
  }


  /* =======================================================
     UPDATE
  ======================================================= */

  update(dt) {

    if (
      !this.running ||
      this.paused
    )
      return;


    this.elapsed += dt;


    if (
      this.fireCooldown >
      0
    ) {

      this.fireCooldown =
        Math.max(
          0,
          this.fireCooldown - dt
        );
    }


    this.updatePlayer(
      dt
    );

    this.updateEnemies(
      dt
    );


    if (
      this.shooting
    ) {

      this.shoot();

    }


    this.updateHUD();
  }


  /* =======================================================
     PLAYER MOVEMENT
  ======================================================= */

  updatePlayer(dt) {

    const speed =
      3.2;

    const forward =
      new THREE.Vector3(
        Math.sin(
          this.yaw
        ),
        0,
        Math.cos(
          this.yaw
        )
      );

    const right =
      new THREE.Vector3(
        Math.cos(
          this.yaw
        ),
        0,
        -Math.sin(
          this.yaw
        )
      );


    const movement =
      new THREE.Vector3();


    movement
      .addScaledVector(
        forward,
        -this.moveY
      );

    movement
      .addScaledVector(
        right,
        this.moveX
      );


    if (
      movement.lengthSq() > 1
    ) {

      movement.normalize();

    }


    this.camera.position
      .addScaledVector(
        movement,
        speed * dt
      );


    this.camera.position.x =
      THREE.MathUtils.clamp(
        this.camera.position.x,
        -60,
        60
      );

    this.camera.position.z =
      THREE.MathUtils.clamp(
        this.camera.position.z,
        -60,
        60
      );


    /* -----------------------------------------------
       TOUCH LOOK
    ------------------------------------------------ */

    this.yaw -=
      this.lookX *
      0.035;

    this.pitch -=
      this.lookY *
      0.028;


    this.pitch =
      THREE.MathUtils.clamp(
        this.pitch,
        -1.35,
        1.35
      );


    this.camera.rotation.order =
      "YXZ";

    this.camera.rotation.y =
      this.yaw;

    this.camera.rotation.x =
      this.pitch;


    /* reset per-frame touch look */

    this.lookX = 0;
    this.lookY = 0;
  }


  /* =======================================================
     ENEMY AI
  ======================================================= */

  updateEnemies(dt) {

    const target =
      this.camera.position;


    for (
      const enemy of [
        ...this.enemies
      ]
    ) {

      if (
        !enemy.parent
      )
        continue;


      const dx =
        target.x -
        enemy.position.x;

      const dz =
        target.z -
        enemy.position.z;

      const distance =
        Math.hypot(
          dx,
          dz
        );


      if (
        distance > 3
      ) {

        enemy.position.x +=
          dx /
          distance *
          enemy.userData.speed *
          dt;

        enemy.position.z +=
          dz /
          distance *
          enemy.userData.speed *
          dt;

      } else {

        enemy.userData.attackTimer -=
          dt;

        if (
          enemy.userData.attackTimer <=
          0
        ) {

          this.damagePlayer(
            7
          );

          enemy.userData.attackTimer =
            1.4;
        }
      }


      enemy.rotation.y =
        Math.atan2(
          dx,
          dz
        );


      /* simple walk animation */

      enemy.userData.animTime +=
        dt * 7;

      const swing =
        Math.sin(
          enemy.userData.animTime
        ) *
        0.25;

      if (
        enemy.children[4]
      ) {

        enemy.children[4]
          .rotation.x =
          swing;

      }

      if (
        enemy.children[5]
      ) {

        enemy.children[5]
          .rotation.x =
          -swing;

      }
    }
  }


  damagePlayer(
    amount
  ) {

    let remaining =
      amount;


    const armorDamage =
      Math.min(
        this.armor,
        remaining
      );

    this.armor -=
      armorDamage;

    remaining -=
      armorDamage;


    if (
      remaining > 0
    ) {

      this.health -=
        remaining;
    }


    if (
      this.health <= 0
    ) {

      this.health = 0;

      this.showMessage(
        "KIA"
      );

      setTimeout(
        () => {

          if (
            this.running
          ) {

            this.respawn();

          }

        },
        1200
      );
    }


    this.updateHUD();
  }


  respawn() {

    this.health = 100;
    this.armor = 50;

    this.ammo = 30;
    this.reserveAmmo = 120;

    this.camera.position.set(
      0,
      1.7,
      12
    );

    this.yaw = 0;
    this.pitch = 0;

    this.camera.rotation.set(
      0,
      0,
      0
    );

    this.showMessage(
      "RESPAWN"
    );

    this.updateHUD();
  }


  /* =======================================================
     OBJECTIVE
  ======================================================= */

  getObjectiveText() {

    switch (
      this.mode
    ) {

      case "tdm":
        return "TEAM DEATHMATCH";

      case "hvt":
        return "LOCATE HIGH VALUE TARGET";

      case "hostage":
      case "rescue":
        return "LOCATE AND RESCUE HOSTAGE";

      default:
        return `SURVIVE WAVE ${this.wave}`;
    }
  }


  setObjective(
    text
  ) {

    const element =
      document.getElementById(
        "objective"
      ) ||
      document.getElementById(
        "missionObjective"
      );

    if (element) {

      element.textContent =
        text;

    }
  }


  showMessage(
    text
  ) {

    const element =
      document.getElementById(
        "message"
      ) ||
      document.getElementById(
        "missionMessage"
      );

    if (!element)
      return;

    element.textContent =
      text;

    element.style.opacity =
      "1";

    clearTimeout(
      this.messageTimer
    );

    this.messageTimer =
      setTimeout(
        () => {

          element.style.opacity =
            "0";

        },
        1200
      );
  }


  updateMenuHUD() {

    const name =
      document.getElementById(
        "hudName"
      );

    if (name) {

      name.textContent =
        this.callsign;

    }
  }


  updateHUD() {

    const score =
      document.getElementById(
        "score"
      );

    const enemies =
      document.getElementById(
        "enemies"
      );

    if (score) {

      score.textContent =
        this.score;

    }

    if (enemies) {

      enemies.textContent =
        this.enemies.length;

    }


    const health =
      document.getElementById(
        "health"
      ) ||
      document.getElementById(
        "hudHealth"
      );

    const armor =
      document.getElementById(
        "armor"
      ) ||
      document.getElementById(
        "hudArmor"
      );

    const ammo =
      document.getElementById(
        "ammo"
      ) ||
      document.getElementById(
        "hudAmmo"
      );

    const level =
      document.getElementById(
        "level"
      ) ||
      document.getElementById(
        "hudLevel"
      );


    if (health)
      health.textContent =
        Math.ceil(
          this.health
        );

    if (armor)
      armor.textContent =
        Math.ceil(
          this.armor
        );

    if (ammo)
      ammo.textContent =
        `${this.ammo} / ${this.reserveAmmo}`;

    if (level)
      level.textContent =
        `${this.level} — ${this.xp} XP`;
  }


  /* =======================================================
     PAUSE / RESUME
  ======================================================= */

  pause() {

    this.paused = true;

  }


  resume() {

    this.paused = false;

  }


  /* =======================================================
     DESTROY
  ======================================================= */

  destroy() {

    this.running = false;

    this.clearEnemies();

    if (
      this.weaponGroup
    ) {

      this.camera.remove(
        this.weaponGroup
      );

    }

    this.scene.remove(
      this.enemyGroup
    );
  }
}


/* =========================================================
   UTILITY EXPORTS
   Kept here so older imports don't break.
========================================================= */

export const TAU =
  Math.PI * 2;

export const clamp =
  (value, min, max) =>
    Math.max(
      min,
      Math.min(
        max,
        value
      )
    );

export const lerp =
  (a, b, t) =>
    a + (b - a) * t;

export const rand =
  (min, max) =>
    min +
    Math.random() *
    (max - min);

export const choice =
  array =>
    array[
      Math.floor(
        Math.random() *
        array.length
      )
    ];

export function distance2D(
  a,
  b
) {

  return Math.hypot(
    a.x - b.x,
    a.z - b.z
  );
}

export function formatTime(
  seconds
) {

  seconds =
    Math.max(
      0,
      Math.floor(seconds)
    );

  return (
    String(
      Math.floor(
        seconds / 60
      )
    ).padStart(2, "0") +
    ":" +
    String(
      seconds % 60
    ).padStart(2, "0")
  );
}
