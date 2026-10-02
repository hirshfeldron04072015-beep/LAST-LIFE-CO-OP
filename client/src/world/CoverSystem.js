import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class CoverSystem {
  constructor(world) {
    this.world = world;

    this.coverObjects = [];

    this.tempVector = new THREE.Vector3();
    this.tempDirection = new THREE.Vector3();

    this.refresh();
  }

  refresh() {
    this.coverObjects = [];

    if (
      this.world &&
      typeof this.world.getCoverObjects === "function"
    ) {
      this.coverObjects =
        this.world.getCoverObjects();
    }
  }

  getCoverBetween(
    attackerPosition,
    targetPosition
  ) {
    const direction =
      new THREE.Vector3()
        .subVectors(
          targetPosition,
          attackerPosition
        );

    const distance =
      direction.length();

    if (distance <= 0.01) {
      return null;
    }

    direction.normalize();

    const raycaster =
      new THREE.Raycaster(
        attackerPosition,
        direction,
        0,
        distance
      );

    const intersections =
      raycaster.intersectObjects(
        this.coverObjects,
        true
      );

    if (
      intersections.length === 0
    ) {
      return null;
    }

    return intersections[0];
  }

  hasCover(
    attackerPosition,
    targetPosition
  ) {
    return (
      this.getCoverBetween(
        attackerPosition,
        targetPosition
      ) !== null
    );
  }

  isPositionCovered(
    position,
    enemyPosition
  ) {
    if (!position || !enemyPosition) {
      return false;
    }

    return this.hasCover(
      enemyPosition,
      position
    );
  }

  findNearestCover(
    position,
    threatPosition,
    maxDistance = 20
  ) {
    if (
      !position ||
      !threatPosition
    ) {
      return null;
    }

    let bestCover = null;
    let bestDistance =
      Infinity;

    for (
      const object of this.coverObjects
    ) {
      if (!object) {
        continue;
      }

      const worldPosition =
        new THREE.Vector3();

      object.getWorldPosition(
        worldPosition
      );

      const distance =
        position.distanceTo(
          worldPosition
        );

      if (
        distance > maxDistance
      ) {
        continue;
      }

      const covered =
        this.isPositionCovered(
          worldPosition,
          threatPosition
        );

      if (!covered) {
        continue;
      }

      if (
        distance <
        bestDistance
      ) {
        bestDistance =
          distance;

        bestCover =
          worldPosition.clone();
      }
    }

    return bestCover;
  }

  findCoverPoint(
    position,
    threatPosition,
    maxDistance = 18
  ) {
    const cover =
      this.findNearestCover(
        position,
        threatPosition,
        maxDistance
      );

    if (!cover) {
      return null;
    }

    const direction =
      new THREE.Vector3()
        .subVectors(
          cover,
          threatPosition
        )
        .normalize();

    const point =
      cover.clone().add(
        direction.multiplyScalar(
          1.5
        )
      );

    point.y = 0;

    return point;
  }

  getExposure(
    attackerPosition,
    targetPosition
  ) {
    if (
      !attackerPosition ||
      !targetPosition
    ) {
      return 1;
    }

    const blocked =
      this.hasCover(
        attackerPosition,
        targetPosition
      );

    return blocked
      ? 0
      : 1;
  }

  canSee(
    attackerPosition,
    targetPosition
  ) {
    return (
      !this.hasCover(
        attackerPosition,
        targetPosition
      )
    );
  }

  getObjects() {
    return this.coverObjects;
  }

  addCoverObject(object) {
    if (!object) {
      return;
    }

    if (
      !this.coverObjects.includes(
        object
      )
    ) {
      this.coverObjects.push(
        object
      );
    }
  }

  removeCoverObject(object) {
    const index =
      this.coverObjects.indexOf(
        object
      );

    if (index !== -1) {
      this.coverObjects.splice(
        index,
        1
      );
    }
  }

  clear() {
    this.coverObjects.length = 0;
  }
}
