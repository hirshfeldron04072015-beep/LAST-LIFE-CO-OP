import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class World {
  constructor(scene) {
    this.scene = scene;

    this.width = 90;
    this.depth = 90;

    this.solids = [];

    this.build();
  }

  build() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(
        this.width,
        this.depth
      ),
      new THREE.MeshStandardMaterial({
        color: 0x151b20,
        roughness: 1
      })
    );

    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(
      90,
      30,
      0x314047,
      0x20292e
    );

    grid.position.y = 0.01;
    this.scene.add(grid);

    this.wall(0, 2.5, -45, 90, 5, 2);
    this.wall(0, 2.5, 45, 90, 5, 2);
    this.wall(-45, 2.5, 0, 2, 5, 90);
    this.wall(45, 2.5, 0, 2, 5, 90);

    const cover = [
      [-18, 1.5, -12, 14, 3, 3],
      [15, 1.5, -10, 12, 3, 3],
      [-8, 1.5, 10, 16, 3, 3],
      [18, 1.5, 16, 10, 3, 3],
      [0, 2, -5, 4, 4, 14],
      [-27, 1.5, 20, 7, 3, 7],
      [28, 1.5, -24, 7, 3, 7]
    ];

    for (const c of cover) {
      this.wall(...c);
    }

    const light = new THREE.HemisphereLight(
      0x9bc7d8,
      0x10151a,
      1.5
    );

    this.scene.add(light);

    const sun = new THREE.DirectionalLight(
      0xffffff,
      2
    );

    sun.position.set(20, 40, 10);
    this.scene.add(sun);
  }

  wall(x, y, z, sx, sy, sz) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz),
      new THREE.MeshStandardMaterial({
        color: 0x263238,
        roughness: 0.85
      })
    );

    mesh.position.set(x, y, z);

    mesh.userData.solid = true;

    this.scene.add(mesh);
    this.solids.push(mesh);
  }

  clampPosition(position) {
    const limit = 42;

    position.x = THREE.MathUtils.clamp(
      position.x,
      -limit,
      limit
    );

    position.z = THREE.MathUtils.clamp(
      position.z,
      -limit,
      limit
    );
  }
}
