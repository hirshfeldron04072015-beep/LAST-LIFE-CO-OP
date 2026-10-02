import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Weapon {
  constructor(options = {}) {
    this.name = options.name || "Weapon";

    this.damage = options.damage ?? 25;
    this.fireRate = options.fireRate ?? 8;
    this.magazineSize = options.magazineSize ?? 30;
    this.reserveAmmo = options.reserveAmmo ?? 120;

    this.reloadTime = options.reloadTime ?? 1.8;

    this.range = options.range ?? 100;
    this.spread = options.spread ?? 0.015;

    this.automatic =
      options.automatic ?? true;

    this.ammo = this.magazineSize;

    this.isReloading = false;
    this.reloadTimer = 0;

    this.lastShotTime = -Infinity;

    this.shotInterval =
      1 / this.fireRate;

    this.scene = null;
    this.camera = null;

    this.weaponObject =
      new THREE.Group();

    this.raycaster =
      new THREE.Raycaster();

    this.direction =
      new THREE.Vector3();

    this.createWeaponModel();
  }

  // =========================================
  // WEAPON MODEL
  // =========================================

  createWeaponModel() {
    const bodyGeometry =
      new THREE.BoxGeometry(
        0.18,
        0.22,
        0.8
      );

    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x1b1e22,
        roughness: 0.55,
        metalness: 0.55
      });

    const body =
      new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
      );

    body.position.set(
      0,
      -0.02,
      -0.42
    );

    this.weaponObject.add(body);

    // Barrel

    const barrelGeometry =
      new THREE.CylinderGeometry(
        0.035,
        0.035,
        0.55,
        12
      );

    const barrelMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x111316,
        roughness: 0.4,
        metalness: 0.8
      });

    const barrel =
      new THREE.Mesh(
        barrelGeometry,
        barrelMaterial
      );

    barrel.rotation.x =
      Math.PI / 2;

    barrel.position.set(
      0,
      0,
      -0.82
    );

    this.weaponObject.add(barrel);

    // Magazine

    const magazineGeometry =
      new THREE.BoxGeometry(
        0.12,
        0.38,
        0.18
      );

    const magazine =
      new THREE.Mesh(
        magazineGeometry,
        bodyMaterial
      );

    magazine.position.set(
      0,
      -0.25,
      -0.3
    );

    magazine.rotation.x =
      -0.15;

    this.weaponObject.add(
      magazine
    );

    // Grip

    const gripGeometry =
      new THREE.BoxGeometry(
        0.12,
        0.35,
        0.15
      );

    const grip =
      new THREE.Mesh(
        gripGeometry,
        bodyMaterial
      );

    grip.position.set(
      0,
      -0.22,
      0.02
    );

    grip.rotation.x =
      -0.15;

    this.weaponObject.add(grip);
  }

  // =========================================
  // SETUP
  // =========================================

  setup(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.camera.add(
      this.weaponObject
    );

    this.weaponObject.position.set(
      0.32,
      -0.27,
      -0.55
    );

    this.weaponObject.rotation.set(
      0,
      0,
      0
    );
  }

  // =========================================
  // UPDATE
  // =========================================

  update(dt) {
    if (!this.isReloading) {
      return;
    }

    this.reloadTimer -= dt;

    if (this.reloadTimer <= 0) {
      this.finishReload();
    }
  }

  // =========================================
  // SHOOT
  // =========================================

  shoot(targets = []) {
    if (this.isReloading) {
      return {
        fired: false,
        reason: "reloading"
      };
    }

    if (this.ammo <= 0) {
      this.startReload();

      return {
        fired: false,
        reason: "empty"
      };
    }

    const now =
      performance.now() / 1000;

    if (
      now - this.lastShotTime <
      this.shotInterval
    ) {
      return {
        fired: false,
        reason: "cooldown"
      };
    }

    this.lastShotTime = now;

    this.ammo--;

    const hit =
      this.performRaycast(
        targets
      );

    return {
      fired: true,
      hit,
      ammo: this.ammo
    };
  }

  // =========================================
  // RAYCAST
  // =========================================

  performRaycast(targets = []) {
    if (!this.camera) {
      return null;
    }

    this.direction.set(
      0,
      0,
      -1
    );

    this.direction.applyQuaternion(
      this.camera.quaternion
    );

    // Weapon spread
    this.direction.x +=
      (Math.random() - 0.5) *
      this.spread;

    this.direction.y +=
      (Math.random() - 0.5) *
      this.spread;

    this.direction.normalize();

    this.raycaster.set(
      this.camera.position,
      this.direction
    );

    this.raycaster.far =
      this.range;

    const objects = [];

    for (
      const target of targets
    ) {
      if (!target) continue;

      if (target.object) {
        objects.push(
          target.object
        );
      } else if (
        target.isObject3D
      ) {
        objects.push(target);
      }
    }

    if (objects.length === 0) {
      return null;
    }

    const intersections =
      this.raycaster.intersectObjects(
        objects,
        true
      );

    if (
      intersections.length === 0
    ) {
      return null;
    }

    const hit =
      intersections[0];

    return {
      object: hit.object,
      point: hit.point.clone(),
      distance: hit.distance,
      damage: this.damage
    };
  }

  // =========================================
  // RELOAD
  // =========================================

  startReload() {
    if (this.isReloading) {
      return;
    }

    if (
      this.ammo >=
      this.magazineSize
    ) {
      return;
    }

    if (this.reserveAmmo <= 0) {
      return;
    }

    this.isReloading = true;

    this.reloadTimer =
      this.reloadTime;
  }

  finishReload() {
    const missing =
      this.magazineSize -
      this.ammo;

    const amount =
      Math.min(
        missing,
        this.reserveAmmo
      );

    this.ammo += amount;

    this.reserveAmmo -= amount;

    this.isReloading = false;

    this.reloadTimer = 0;
  }

  // =========================================
  // AMMO
  // =========================================

  getAmmo() {
    return this.ammo;
  }

  getReserveAmmo() {
    return this.reserveAmmo;
  }

  getMagazineSize() {
    return this.magazineSize;
  }

  getAmmoText() {
    return `${this.ammo}/${this.reserveAmmo}`;
  }

  isEmpty() {
    return this.ammo <= 0;
  }

  isReloadingNow() {
    return this.isReloading;
  }

  // =========================================
  // RESET
  // =========================================

  reset() {
    this.ammo =
      this.magazineSize;

    this.reserveAmmo = 120;

    this.isReloading = false;

    this.reloadTimer = 0;

    this.lastShotTime =
      -Infinity;
  }

  // =========================================
  // DESTROY
  // =========================================

  destroy() {
    if (
      this.weaponObject &&
      this.weaponObject.parent
    ) {
      this.weaponObject.parent.remove(
        this.weaponObject
      );
    }

    this.scene = null;
    this.camera = null;
  }
}
