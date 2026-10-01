import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Extraction {
  constructor(scene) {
    this.scene = scene;
    this.marker = null;
  }

  create(position) {
    this.remove();

    this.marker =
      new THREE.Group();

    const ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          2.5,
          0.08,
          10,
          40
        ),
        new THREE.MeshBasicMaterial({
          color: 0x42e8ff
        })
      );

    ring.rotation.x =
      Math.PI / 2;

    this.marker.add(ring);

    const pillar =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.06,
          0.06,
          3,
          8
        ),
        new THREE.MeshBasicMaterial({
          color: 0x42e8ff
        })
      );

    pillar.position.y = 1.5;

    this.marker.add(pillar);

    this.marker.position.copy(
      position
    );

    this.scene.add(
      this.marker
    );
  }

  update(time) {
    if (!this.marker) return;

    this.marker.children[0]
      .rotation.z =
      time * 1.5;
  }

  remove() {
    if (!this.marker) return;

    this.scene.remove(
      this.marker
    );

    this.marker = null;
  }
}
