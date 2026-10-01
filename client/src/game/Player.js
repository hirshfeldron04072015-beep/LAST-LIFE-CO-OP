import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Player {
  constructor(camera) {
    this.camera = camera;

    this.position = new THREE.Vector3(
      0,
      1.7,
      12
    );

    this.velocity = new THREE.Vector3();

    this.health = 100;
    this.speed = 6;

    this.pitch = 0;
    this.yaw = 0;
  }

  update(dt, input, world) {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(
      forward,
      new THREE.Vector3(0, 1, 0)
    ).normalize();

    const movement = new THREE.Vector3();

    if (input.forward) movement.add(forward);
    if (input.backward) movement.sub(forward);
    if (input.right) movement.add(right);
    if (input.left) movement.sub(right);

    if (movement.lengthSq() > 0) {
      movement.normalize();
      this.velocity.x = movement.x * this.speed;
      this.velocity.z = movement.z * this.speed;
    } else {
      this.velocity.x *= 0.75;
      this.velocity.z *= 0.75;
    }

    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;

    world.clampPosition(this.position);

    this.camera.position.copy(this.position);
  }

  damage(amount) {
    this.health = Math.max(
      0,
      this.health - amount
    );

    return this.health <= 0;
  }

  heal(amount) {
    this.health = Math.min(
      100,
      this.health + amount
    );
  }
}
