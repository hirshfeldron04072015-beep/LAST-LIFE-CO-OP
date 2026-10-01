import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class RemotePlayers {
  constructor(scene) {
    this.scene = scene;
    this.players = new Map();
  }

  create(id) {
    if (this.players.has(id)) {
      return this.players.get(id);
    }

    const group =
      new THREE.Group();

    const body =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          .38,
          .8,
          4,
          8
        ),
        new THREE.MeshStandardMaterial({
          color: 0x3e8cff
        })
      );

    body.position.y =
      1;

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          .24,
          10,
          8
        ),
        new THREE.MeshStandardMaterial({
          color: 0xc79f8e
        })
      );

    head.position.y =
      1.7;

    group.add(body);
    group.add(head);

    this.scene.add(
      group
    );

    this.players.set(
      id,
      group
    );

    return group;
  }

  update(player) {
    const mesh =
      this.create(
        player.id
      );

    mesh.position.set(
      player.x,
      player.y - 1.7,
      player.z
    );

    mesh.rotation.y =
      player.ry || 0;
  }

  remove(id) {
    const mesh =
      this.players.get(id);

    if (!mesh) return;

    this.scene.remove(
      mesh
    );

    this.players.delete(
      id
    );
  }
}
