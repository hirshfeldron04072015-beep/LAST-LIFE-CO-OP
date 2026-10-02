import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Collision {
  constructor(world) {
    this.world = world;

    this.colliders = [];

    this.playerRadius = 0.45;
    this.tempBox = new THREE.Box3();
    this.tempPoint = new THREE.Vector3();

    this.refresh();
  }

  refresh() {
    this.colliders = [];

    if (
      this.world &&
      typeof this.world.getColliders === "function"
    ) {
      this.colliders =
        this.world.getColliders();
    }
  }

  canMove(
    currentPosition,
    desiredPosition
  ) {
    if (!desiredPosition) {
      return false;
    }

    const x =
      desiredPosition.x;

    const z =
      desiredPosition.z;

    for (const collider of this.colliders) {
      if (
        this.intersectsCollider(
          x,
          z,
          collider
        )
      ) {
        return false;
      }
    }

    return true;
  }

  resolveMovement(
    currentPosition,
    desiredPosition
  ) {
    const result =
      desiredPosition.clone();

    if (
      this.canMove(
        currentPosition,
        result
      )
    ) {
      return result;
    }

    const xOnly =
      new THREE.Vector3(
        desiredPosition.x,
        currentPosition.y,
        currentPosition.z
      );

    if (
      this.canMove(
        currentPosition,
        xOnly
      )
    ) {
      result.x =
        xOnly.x;
    } else {
      result.x =
        currentPosition.x;
    }

    const zOnly =
      new THREE.Vector3(
        result.x,
        currentPosition.y,
        desiredPosition.z
      );

    if (
      this.canMove(
        currentPosition,
        zOnly
      )
    ) {
      result.z =
        zOnly.z;
    } else {
      result.z =
        currentPosition.z;
    }

    return result;
  }

  intersectsCollider(
    x,
    z,
    collider
  ) {
    if (!collider) {
      return false;
    }

    const width =
      collider.width || 1;

    const depth =
      collider.depth || 1;

    const rotation =
      collider.rotation || 0;

    if (
      Math.abs(rotation) <
      0.0001
    ) {
      return (
        x >
          collider.x -
            width / 2 -
            this.playerRadius &&
        x <
          collider.x +
            width / 2 +
            this.playerRadius &&
        z >
          collider.z -
            depth / 2 -
            this.playerRadius &&
        z <
          collider.z +
            depth / 2 +
            this.playerRadius
      );
    }

    const cos =
      Math.cos(-rotation);

    const sin =
      Math.sin(-rotation);

    const dx =
      x - collider.x;

    const dz =
      z - collider.z;

    const localX =
      dx * cos -
      dz * sin;

    const localZ =
      dx * sin +
      dz * cos;

    return (
      Math.abs(localX) <
        width / 2 +
          this.playerRadius &&
      Math.abs(localZ) <
        depth / 2 +
          this.playerRadius
    );
  }

  lineOfSight(
    start,
    end
  ) {
    const direction =
      new THREE.Vector3()
        .subVectors(
          end,
          start
        )
        .normalize();

    const distance =
      start.distanceTo(end);

    const raycaster =
      new THREE.Raycaster(
        start,
        direction,
        0,
        distance
      );

    for (
      const collider of this.colliders
    ) {
      const box =
        this.colliderToBox(
          collider
        );

      if (
        raycaster.ray.intersectsBox(
          box
        )
      ) {
        return false;
      }
    }

    return true;
  }

  colliderToBox(
    collider
  ) {
    const width =
      collider.width || 1;

    const depth =
      collider.depth || 1;

    const height =
      collider.height || 2;

    const box =
      new THREE.Box3();

    box.min.set(
      collider.x -
        width / 2,
      0,
      collider.z -
        depth / 2
    );

    box.max.set(
      collider.x +
        width / 2,
      height,
      collider.z +
        depth / 2
    );

    return box;
  }

  addCollider(
    collider
  ) {
    if (!collider) {
      return;
    }

    this.colliders.push(
      collider
    );
  }

  removeCollider(
    collider
  ) {
    const index =
      this.colliders.indexOf(
        collider
      );

    if (index !== -1) {
      this.colliders.splice(
        index,
        1
      );
    }
  }

  clear() {
    this.colliders.length = 0;
  }

  getColliders() {
    return this.colliders;
  }
}
