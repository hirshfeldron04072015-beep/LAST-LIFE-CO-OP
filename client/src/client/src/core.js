import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


export class Core {

  constructor({
    scene,
    camera,
    renderer
  }) {

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.started = false;
    this.paused = false;

    this.callsign = "OPERATIVE";

    this.time = 0;

    this.player = null;
    this.world = null;
    this.weaponManager = null;
    this.enemyManager = null;

    this.createTemporaryWorld();

  }


  /* =======================================================
     START GAME
     ======================================================= */

  start({
    callsign = "OPERATIVE"
  } = {}) {

    this.callsign =
      callsign || "OPERATIVE";

    this.started = true;
    this.paused = false;

    const objective =
      document.getElementById(
        "objectiveText"
      );

    if (objective) {

      objective.textContent =
        "SECURE THE AREA";

    }

    console.log(
      `LAST LINE deployed: ${this.callsign}`
    );

  }


  /* =======================================================
     PAUSE
     ======================================================= */

  pause() {

    this.paused = true;

  }


  /* =======================================================
     RESUME
     ======================================================= */

  resume() {

    this.paused = false;

  }


  /* =======================================================
     TEMPORARY WORLD
     
     This is only the foundation.
     The proper environment will be added later.
     ======================================================= */

  createTemporaryWorld() {

    this.createGround();

    this.createBuildings();

    this.createCoverObjects();

    this.createSpawnMarker();

  }


  /* =======================================================
     GROUND
     ======================================================= */

  createGround() {

    const geometry =
      new THREE.PlaneGeometry(
        220,
        220
      );


    const material =
      new THREE.MeshStandardMaterial({
        color: 0x303631,
        roughness: 0.95,
        metalness: 0.02
      });


    const ground =
      new THREE.Mesh(
        geometry,
        material
      );


    ground.rotation.x =
      -Math.PI / 2;


    ground.position.y = 0;


    ground.receiveShadow = true;


    this.scene.add(
      ground
    );


    /*
     * Grid gives us temporary
     * spatial reference while
     * the real environment is
     * being built.
     */

    const grid =
      new THREE.GridHelper(
        220,
        110,
        0x59605b,
        0x3a403c
      );


    grid.position.y =
      0.01;


    grid.material.opacity =
      0.22;


    grid.material.transparent =
      true;


    this.scene.add(
      grid
    );

  }


  /* =======================================================
     BUILDINGS
     ======================================================= */

  createBuildings() {

    const buildings = [

      {
        x: -28,
        y: 3,
        z: -20,
        width: 16,
        height: 6,
        depth: 14
      },

      {
        x: 5,
        y: 3,
        z: -28,
        width: 22,
        height: 6,
        depth: 12
      },

      {
        x: 34,
        y: 3,
        z: -16,
        width: 14,
        height: 6,
        depth: 18
      },

      {
        x: -34,
        y: 3,
        z: 18,
        width: 20,
        height: 6,
        depth: 14
      },

      {
        x: 5,
        y: 3,
        z: 25,
        width: 14,
        height: 6,
        depth: 18
      },

      {
        x: 35,
        y: 3,
        z: 25,
        width: 18,
        height: 6,
        depth: 14
      }

    ];


    for (
      const buildingData
      of buildings
    ) {

      this.createBuilding(
        buildingData
      );

    }

  }


  createBuilding({
    x,
    y,
    z,
    width,
    height,
    depth
  }) {

    const geometry =
      new THREE.BoxGeometry(
        width,
        height,
        depth
      );


    const material =
      new THREE.MeshStandardMaterial({
        color: 0x4a4e4b,
        roughness: 0.9,
        metalness: 0.05
      });


    const building =
      new THREE.Mesh(
        geometry,
        material
      );


    building.position.set(
      x,
      y,
      z
    );


    building.castShadow = true;

    building.receiveShadow = true;


    this.scene.add(
      building
    );


    /*
     * Roof trim
     */

    const roofGeometry =
      new THREE.BoxGeometry(
        width + 0.35,
        0.25,
        depth + 0.35
      );


    const roofMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x252a28,
        roughness: 0.8
      });


    const roof =
      new THREE.Mesh(
        roofGeometry,
        roofMaterial
      );


    roof.position.set(
      x,
      height + 0.12,
      z
    );


    roof.castShadow = true;

    roof.receiveShadow = true;


    this.scene.add(
      roof
    );

  }


  /* =======================================================
     TEMPORARY COVER
     ======================================================= */

  createCoverObjects() {

    const covers = [

      [-12, 1, 5, 5, 2, 1.5],

      [15, 1, 7, 6, 2, 1.5],

      [25, 1, -2, 4, 2, 2],

      [-5, 1, -8, 3, 2, 2],

      [18, 1, -18, 5, 2, 1.5],

      [-20, 1, 26, 6, 2, 1.5]

    ];


    for (
      const [
        x,
        y,
        z,
        width,
        height,
        depth
      ]
      of covers
    ) {

      const geometry =
        new THREE.BoxGeometry(
          width,
          height,
          depth
        );


      const material =
        new THREE.MeshStandardMaterial({
          color: 0x565a55,
          roughness: 0.8
        });


      const cover =
        new THREE.Mesh(
          geometry,
          material
        );


      cover.position.set(
        x,
        y,
        z
      );


      cover.castShadow = true;

      cover.receiveShadow = true;


      this.scene.add(
        cover
      );

    }

  }


  /* =======================================================
     PLAYER SPAWN MARKER
     ======================================================= */

  createSpawnMarker() {

    const geometry =
      new THREE.CylinderGeometry(
        1.5,
        1.5,
        0.08,
        32
      );


    const material =
      new THREE.MeshBasicMaterial({
        color: 0x8fa7a9,
        transparent: true,
        opacity: 0.35
      });


    const marker =
      new THREE.Mesh(
        geometry,
        material
      );


    marker.position.set(
      0,
      0.04,
      5
    );


    this.scene.add(
      marker
    );


    this.spawnMarker =
      marker;

  }


  /* =======================================================
     GAME UPDATE
     ======================================================= */

  update(deltaTime) {

    if (!this.started) {

      return;

    }


    if (this.paused) {

      return;

    }


    this.time +=
      deltaTime;


    /*
     * Temporary spawn marker
     * animation.
     */

    if (this.spawnMarker) {

      this.spawnMarker.rotation.y +=
        deltaTime * 0.8;

    }


    /*
     * Player, weapons, enemies,
     * missions and animation systems
     * will be connected here in
     * the next blocks.
     */

    if (this.player) {

      this.player.update(
        deltaTime
      );

    }


    if (this.weaponManager) {

      this.weaponManager.update(
        deltaTime
      );

    }


    if (this.enemyManager) {

      this.enemyManager.update(
        deltaTime
      );

    }

  }

}
