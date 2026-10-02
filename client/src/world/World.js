import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class World {
  constructor(scene) {
    this.scene = scene;

    this.root = new THREE.Group();
    this.root.name = "World";

    this.environment = new THREE.Group();
    this.environment.name = "Environment";

    this.cover = new THREE.Group();
    this.cover.name = "Cover";

    this.structures = new THREE.Group();
    this.structures.name = "Structures";

    this.decorations = new THREE.Group();
    this.decorations.name = "Decorations";

    this.root.add(this.environment);
    this.root.add(this.cover);
    this.root.add(this.structures);
    this.root.add(this.decorations);

    this.scene.add(this.root);

    this.colliders = [];
    this.coverObjects = [];

    this.build();
  }

  build() {
    this.createGround();
    this.createMainRoad();
    this.createBuildings();
    this.createWalls();
    this.createContainers();
    this.createBarricades();
    this.createMilitaryObjects();
    this.createStreetLights();
    this.createTrees();
    this.createDebris();
    this.createSpawnAreas();
  }

  createGround() {
    const geometry = new THREE.PlaneGeometry(
      120,
      120,
      32,
      32
    );

    const material = new THREE.MeshStandardMaterial({
      color: 0x303437,
      roughness: 0.95,
      metalness: 0.02
    });

    const ground = new THREE.Mesh(
      geometry,
      material
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = "Ground";

    this.environment.add(ground);
  }

  createMainRoad() {
    const roadMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x17191b,
        roughness: 0.92
      });

    const road = new THREE.Mesh(
      new THREE.BoxGeometry(
        18,
        0.08,
        110
      ),
      roadMaterial
    );

    road.position.set(
      0,
      0.04,
      0
    );

    road.receiveShadow = true;

    this.environment.add(road);

    this.createRoadMarkings();
  }

  createRoadMarkings() {
    const markingMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xb6b6a8,
        roughness: 0.7
      });

    for (
      let z = -52;
      z <= 52;
      z += 8
    ) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.18,
          0.025,
          4
        ),
        markingMaterial
      );

      line.position.set(
        0,
        0.095,
        z
      );

      this.environment.add(line);
    }
  }

  createBuildings() {
    this.createBuilding(
      -27,
      -20,
      17,
      14,
      10
    );

    this.createBuilding(
      28,
      -22,
      18,
      16,
      13
    );

    this.createBuilding(
      -29,
      23,
      19,
      15,
      12
    );

    this.createBuilding(
      29,
      24,
      16,
      18,
      9
    );
  }

  createBuilding(
    x,
    z,
    width,
    depth,
    height
  ) {
    const building =
      new THREE.Group();

    building.position.set(
      x,
      0,
      z
    );

    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x55585a,
        roughness: 0.88
      });

    const roofMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x292b2d,
        roughness: 0.9
      });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      wallMaterial
    );

    body.position.y =
      height / 2;

    body.castShadow = true;
    body.receiveShadow = true;

    building.add(body);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.5,
        0.35,
        depth + 0.5
      ),
      roofMaterial
    );

    roof.position.y =
      height + 0.15;

    roof.castShadow = true;

    building.add(roof);

    this.createWindows(
      building,
      width,
      depth,
      height
    );

    this.structures.add(building);

    this.addCollider(
      x,
      z,
      width,
      depth,
      height
    );
  }

  createWindows(
    building,
    width,
    depth,
    height
  ) {
    const glassMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x18272d,
        roughness: 0.2,
        metalness: 0.5
      });

    const rows =
      Math.max(
        2,
        Math.floor(height / 3)
      );

    const columns =
      Math.max(
        2,
        Math.floor(width / 3)
      );

    for (
      let row = 0;
      row < rows;
      row++
    ) {
      for (
        let column = 0;
        column < columns;
        column++
      ) {
        if (
          Math.random() < 0.18
        ) {
          continue;
        }

        const window =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              1.1,
              1.25,
              0.08
            ),
            glassMaterial
          );

        const x =
          -width / 2 +
          1.8 +
          column * 2.6;

        const y =
          2 +
          row * 2.7;

        window.position.set(
          x,
          y,
          depth / 2 + 0.05
        );

        building.add(window);

        const opposite =
          window.clone();

        opposite.position.z =
          -depth / 2 - 0.05;

        building.add(opposite);
      }
    }
  }

  createWalls() {
    this.createWall(
      -8,
      -8,
      14,
      1.2,
      2.4
    );

    this.createWall(
      12,
      8,
      12,
      1.2,
      2.0
    );

    this.createWall(
      -14,
      12,
      1.2,
      14,
      2.2
    );

    this.createWall(
      15,
      -10,
      1.2,
      12,
      2.3
    );
  }

  createWall(
    x,
    z,
    width,
    depth,
    height
  ) {
    const material =
      new THREE.MeshStandardMaterial({
        color: 0x64605a,
        roughness: 0.9
      });

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      material
    );

    wall.position.set(
      x,
      height / 2,
      z
    );

    wall.castShadow = true;
    wall.receiveShadow = true;

    this.cover.add(wall);

    this.addCollider(
      x,
      z,
      width,
      depth,
      height
    );

    this.coverObjects.push(wall);
  }

  createContainers() {
    const positions = [
      [-12, -30, 0],
      [-7, -30, 0],
      [13, 30, Math.PI / 2],
      [18, 30, Math.PI / 2],
      [23, 30, Math.PI / 2]
    ];

    for (const [
      x,
      z,
      rotation
    ] of positions) {
      this.createContainer(
        x,
        z,
        rotation
      );
    }
  }

  createContainer(
    x,
    z,
    rotation = 0
  ) {
    const group =
      new THREE.Group();

    group.position.set(
      x,
      0,
      z
    );

    group.rotation.y =
      rotation;

    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x455044,
        roughness: 0.85,
        metalness: 0.12
      });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(
        7,
        2.6,
        2.5
      ),
      bodyMaterial
    );

    body.position.y =
      1.3;

    body.castShadow = true;
    body.receiveShadow = true;

    group.add(body);

    const doorMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x25282a,
        roughness: 0.75,
        metalness: 0.25
      });

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.08,
        2.1,
        2.05
      ),
      doorMaterial
    );

    door.position.set(
      3.53,
      1.3,
      0
    );

    group.add(door);

    this.cover.add(group);

    this.addRotatedCollider(
      x,
      z,
      7,
      2.5,
      2.6,
      rotation
    );

    this.coverObjects.push(
      body
    );
  }

  createBarricades() {
    const positions = [
      [-5, 16, 0],
      [6, -17, Math.PI / 2],
      [20, 4, 0],
      [-21, 2, Math.PI / 2]
    ];

    for (const [
      x,
      z,
      rotation
    ] of positions) {
      this.createBarricade(
        x,
        z,
        rotation
      );
    }
  }

  createBarricade(
    x,
    z,
    rotation
  ) {
    const group =
      new THREE.Group();

    group.position.set(
      x,
      0,
      z
    );

    group.rotation.y =
      rotation;

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x8b7658,
        roughness: 0.95
      });

    for (
      let i = -1;
      i <= 1;
      i++
    ) {
      const block =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.5,
            1.1,
            0.8
          ),
          material
        );

      block.position.set(
        i * 1.4,
        0.55,
        0
      );

      block.rotation.z =
        (Math.random() - 0.5) *
        0.12;

      block.castShadow = true;

      group.add(block);
    }

    this.cover.add(group);

    this.addRotatedCollider(
      x,
      z,
      5,
      1,
      1.1,
      rotation
    );
  }

  createMilitaryObjects() {
    this.createCrate(
      -18,
      -3,
      1.4
    );

    this.createCrate(
      -20,
      -5,
      1.4
    );

    this.createCrate(
      18,
      -3,
      1.4
    );

    this.createCrate(
      20,
      -5,
      1.4
    );

    this.createSandbags(
      4,
      22,
      Math.PI / 2
    );
  }

  createCrate(
    x,
    z,
    size
  ) {
    const material =
      new THREE.MeshStandardMaterial({
        color: 0x70563a,
        roughness: 0.9
      });

    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(
        size,
        size,
        size
      ),
      material
    );

    crate.position.set(
      x,
      size / 2,
      z
    );

    crate.rotation.y =
      Math.random() *
      Math.PI;

    crate.castShadow = true;
    crate.receiveShadow = true;

    this.cover.add(crate);

    this.addCollider(
      x,
      z,
      size,
      size,
      size
    );
  }

  createSandbags(
    x,
    z,
    rotation
  ) {
    const group =
      new THREE.Group();

    group.position.set(
      x,
      0,
      z
    );

    group.rotation.y =
      rotation;

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x756b57,
        roughness: 1
      });

    for (
      let i = -3;
      i <= 3;
      i++
    ) {
      const bag =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.55,
            8,
            6
          ),
          material
        );

      bag.scale.set(
        1.25,
        0.65,
        0.8
      );

      bag.position.set(
        i * 1.0,
        0.45,
        0
      );

      bag.castShadow = true;

      group.add(bag);
    }

    this.cover.add(group);

    this.addRotatedCollider(
      x,
      z,
      7,
      1.2,
      1,
      rotation
    );
  }

  createStreetLights() {
    const positions = [
      [-8, -26],
      [8, -26],
      [-8, 26],
      [8, 26]
    ];

    for (const [
      x,
      z
    ] of positions) {
      const poleMaterial =
        new THREE.MeshStandardMaterial({
          color: 0x292c2e,
          roughness: 0.75,
          metalness: 0.5
        });

      const pole =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.08,
            0.12,
            5,
            8
          ),
          poleMaterial
        );

      pole.position.set(
        x,
        2.5,
        z
      );

      pole.castShadow = true;

      this.decorations.add(pole);

      const lamp =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.18,
            8,
            8
          ),
          new THREE.MeshStandardMaterial({
            color: 0xc8c0a0,
            emissive: 0x302c20,
            emissiveIntensity: 1
          })
        );

      lamp.position.set(
        x,
        5.05,
        z
      );

      this.decorations.add(lamp);
    }
  }

  createTrees() {
    const positions = [
      [-48, -42],
      [48, -40],
      [-47, 38],
      [47, 42],
      [-38, 47],
      [37, -47]
    ];

    for (const [
      x,
      z
    ] of positions) {
      this.createTree(x, z);
    }
  }

  createTree(x, z) {
    const group =
      new THREE.Group();

    group.position.set(
      x,
      0,
      z
    );

    const trunk =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.3,
          0.45,
          4,
          8
        ),
        new THREE.MeshStandardMaterial({
          color: 0x4a3526,
          roughness: 1
        })
      );

    trunk.position.y = 2;
    trunk.castShadow = true;

    group.add(trunk);

    const foliageMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x26372a,
        roughness: 1
      });

    for (
      let i = 0;
      i < 3;
      i++
    ) {
      const foliage =
        new THREE.Mesh(
          new THREE.IcosahedronGeometry(
            1.8 - i * 0.25,
            1
          ),
          foliageMaterial
        );

      foliage.position.set(
        (Math.random() - 0.5) * 1.2,
        3.8 + i * 1.25,
        (Math.random() - 0.5) * 1.2
      );

      foliage.castShadow = true;

      group.add(foliage);
    }

    this.decorations.add(group);
  }

  createDebris() {
    for (
      let i = 0;
      i < 45;
      i++
    ) {
      const x =
        (Math.random() - 0.5) *
        100;

      const z =
        (Math.random() - 0.5) *
        100;

      const size =
        0.1 +
        Math.random() * 0.35;

      const debris =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            size,
            size,
            size
          ),
          new THREE.MeshStandardMaterial({
            color:
              0x4a4842,
            roughness: 1
          })
        );

      debris.position.set(
        x,
        size / 2,
        z
      );

      debris.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
      );

      debris.castShadow = true;

      this.decorations.add(
        debris
      );
    }
  }

  createSpawnAreas() {
    const material =
      new THREE.MeshBasicMaterial({
        color: 0xff3333,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });

    const points = [
      [-35, -35],
      [0, -42],
      [35, -35],
      [-42, -5],
      [42, -5],
      [-40, 25],
      [0, 40],
      [40, 25]
    ];

    for (const [
      x,
      z
    ] of points) {
      const marker =
        new THREE.Mesh(
          new THREE.CircleGeometry(
            2,
            16
          ),
          material
        );

      marker.rotation.x =
        -Math.PI / 2;

      marker.position.set(
        x,
        0.03,
        z
      );

      marker.userData.spawnPoint =
        true;

      this.environment.add(
        marker
      );
    }
  }

  addCollider(
    x,
    z,
    width,
    depth,
    height
  ) {
    this.colliders.push({
      x,
      z,
      width,
      depth,
      height,
      rotation: 0
    });
  }

  addRotatedCollider(
    x,
    z,
    width,
    depth,
    height,
    rotation
  ) {
    this.colliders.push({
      x,
      z,
      width,
      depth,
      height,
      rotation
    });
  }

  getColliders() {
    return this.colliders;
  }

  getCoverObjects() {
    return this.coverObjects;
  }

  getRoot() {
    return this.root;
  }

  destroy() {
    this.scene.remove(
      this.root
    );

    this.root.traverse(
      (object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (
            Array.isArray(
              object.material
            )
          ) {
            object.material.forEach(
              (material) =>
                material.dispose()
            );
          } else {
            object.material.dispose();
          }
        }
      }
    );

    this.colliders.length = 0;
    this.coverObjects.length = 0;
  }
}
