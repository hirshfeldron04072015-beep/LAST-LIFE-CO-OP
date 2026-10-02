import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Environment {
  constructor(scene) {
    this.scene = scene;

    this.root = new THREE.Group();
    this.root.name = "EnvironmentDetails";

    this.scene.add(this.root);

    this.animatedObjects = [];
    this.createAtmosphere();
    this.createFog();
    this.createSky();
  }

  createAtmosphere() {
    const hemiLight =
      new THREE.HemisphereLight(
        0x9aa8b8,
        0x252018,
        1.15
      );

    this.root.add(hemiLight);

    const sun =
      new THREE.DirectionalLight(
        0xffead0,
        2.0
      );

    sun.position.set(
      -25,
      45,
      20
    );

    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;

    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;

    sun.shadow.bias = -0.0005;

    this.root.add(sun);
  }

  createFog() {
    this.scene.fog =
      new THREE.Fog(
        0x68717a,
        35,
        105
      );

    this.scene.background =
      new THREE.Color(
        0x68717a
      );
  }

  createSky() {
    const skyGeometry =
      new THREE.SphereGeometry(
        110,
        32,
        16
      );

    const skyMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x66717a,
        side: THREE.BackSide
      });

    const sky =
      new THREE.Mesh(
        skyGeometry,
        skyMaterial
      );

    sky.name = "Sky";

    this.root.add(sky);

    this.sky = sky;
  }

  update(dt) {
    // Reserved for environmental animation.
    // Later this will control:
    // - smoke
    // - moving lights
    // - dust
    // - weather
    // - animated props
  }

  setTimeOfDay(mode) {
    if (mode === "night") {
      this.scene.background =
        new THREE.Color(
          0x101722
        );

      if (this.scene.fog) {
        this.scene.fog.color =
          new THREE.Color(
            0x101722
          );
      }
    }

    if (mode === "day") {
      this.scene.background =
        new THREE.Color(
          0x68717a
        );

      if (this.scene.fog) {
        this.scene.fog.color =
          new THREE.Color(
            0x68717a
          );
      }
    }
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

    this.animatedObjects.length = 0;
  }
}
