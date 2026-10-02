import { Carbine } from "./Carbine.js";
import { SMG } from "./SMG.js";
import { DMR } from "./DMR.js";

export class WeaponManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.weapons = [];
    this.activeIndex = 0;

    this.targets = [];

    this.lastShotResult = null;

    this.createWeapons();

    this.equipWeapon(0);
  }

  // =========================================
  // CREATE WEAPONS
  // =========================================

  createWeapons() {
    this.weapons = [
      new Carbine(),
      new SMG(),
      new DMR()
    ];

    for (const weapon of this.weapons) {
      weapon.setup(
        this.scene,
        this.camera
      );
    }
  }

  // =========================================
  // UPDATE
  // =========================================

  update(dt, input = {}) {
    const weapon =
      this.getActiveWeapon();

    if (!weapon) {
      return;
    }

    weapon.update(dt);

    // Weapon switching
    if (
      input.weapon !== null &&
      input.weapon !== undefined
    ) {
      this.equipWeapon(
        input.weapon
      );
    }

    // Reload
    if (input.reload) {
      this.reload();
    }

    // Shooting
    if (input.shooting) {
      this.shoot();
    }
  }

  // =========================================
  // EQUIP WEAPON
  // =========================================

  equipWeapon(index) {
    if (
      index < 0 ||
      index >= this.weapons.length
    ) {
      return;
    }

    const oldWeapon =
      this.getActiveWeapon();

    if (oldWeapon) {
      oldWeapon.weaponObject.visible =
        false;
    }

    this.activeIndex = index;

    const newWeapon =
      this.getActiveWeapon();

    if (newWeapon) {
      newWeapon.weaponObject.visible =
        true;
    }

    this.updateVisibility();
  }

  // =========================================
  // VISIBILITY
  // =========================================

  updateVisibility() {
    for (
      let i = 0;
      i < this.weapons.length;
      i++
    ) {
      this.weapons[i]
        .weaponObject
        .visible =
        i === this.activeIndex;
    }
  }

  // =========================================
  // SHOOT
  // =========================================

  shoot() {
    const weapon =
      this.getActiveWeapon();

    if (!weapon) {
      return null;
    }

    const result =
      weapon.shoot(
        this.targets
      );

    this.lastShotResult =
      result;

    return result;
  }

  // =========================================
  // RELOAD
  // =========================================

  reload() {
    const weapon =
      this.getActiveWeapon();

    if (!weapon) {
      return;
    }

    weapon.startReload();
  }

  // =========================================
  // TARGETS
  // =========================================

  setTargets(targets) {
    this.targets =
      Array.isArray(targets)
        ? targets
        : [];
  }

  addTarget(target) {
    if (!target) {
      return;
    }

    if (
      !this.targets.includes(target)
    ) {
      this.targets.push(target);
    }
  }

  removeTarget(target) {
    const index =
      this.targets.indexOf(target);

    if (index !== -1) {
      this.targets.splice(
        index,
        1
      );
    }
  }

  // =========================================
  // ACTIVE WEAPON
  // =========================================

  getActiveWeapon() {
    return this.weapons[
      this.activeIndex
    ];
  }

  getActiveIndex() {
    return this.activeIndex;
  }

  getActiveName() {
    const weapon =
      this.getActiveWeapon();

    return weapon
      ? weapon.name
      : "";
  }

  // =========================================
  // AMMO
  // =========================================

  getAmmo() {
    const weapon =
      this.getActiveWeapon();

    return weapon
      ? weapon.getAmmo()
      : 0;
  }

  getReserveAmmo() {
    const weapon =
      this.getActiveWeapon();

    return weapon
      ? weapon.getReserveAmmo()
      : 0;
  }

  getAmmoText() {
    const weapon =
      this.getActiveWeapon();

    return weapon
      ? weapon.getAmmoText()
      : "0/0";
  }

  isReloading() {
    const weapon =
      this.getActiveWeapon();

    return weapon
      ? weapon.isReloadingNow()
      : false;
  }

  // =========================================
  // WEAPON INFORMATION
  // =========================================

  getWeapon(index) {
    if (
      index < 0 ||
      index >= this.weapons.length
    ) {
      return null;
    }

    return this.weapons[index];
  }

  getWeaponCount() {
    return this.weapons.length;
  }

  getAllWeapons() {
    return this.weapons;
  }

  // =========================================
  // RESET
  // =========================================

  reset() {
    for (const weapon of this.weapons) {
      weapon.reset();
    }

    this.activeIndex = 0;

    this.updateVisibility();

    this.lastShotResult = null;
  }

  // =========================================
  // DESTROY
  // =========================================

  destroy() {
    for (const weapon of this.weapons) {
      weapon.destroy();
    }

    this.weapons = [];
    this.targets = [];

    this.lastShotResult = null;
  }
}
