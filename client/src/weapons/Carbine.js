import { Weapon } from "./Weapon.js";

export class Carbine extends Weapon {
  constructor() {
    super({
      name: "CARBINE",
      damage: 28,
      fireRate: 8,
      magazineSize: 30,
      reserveAmmo: 150,
      reloadTime: 1.7,
      range: 120,
      spread: 0.012,
      automatic: true
    });

    // Carbine-specific handling
    this.recoil = 0.018;
    this.recoilRecovery = 9;

    this.aimSpread = 0.006;
    this.hipSpread = 0.012;

    this.ads = false;

    this.recoilOffset = 0;
  }

  update(dt) {
    super.update(dt);

    // Gradually recover from recoil
    this.recoilOffset =
      Math.max(
        0,
        this.recoilOffset -
          this.recoilRecovery * dt
      );

    // Slightly reduce spread while aiming
    this.spread = this.ads
      ? this.aimSpread
      : this.hipSpread;

    // Weapon settles back after firing
    if (this.weaponObject) {
      this.weaponObject.rotation.x =
        this.recoilOffset;
    }
  }

  shoot(targets = []) {
    const result =
      super.shoot(targets);

    if (result.fired) {
      this.recoilOffset +=
        this.recoil;

      this.recoilOffset =
        Math.min(
          this.recoilOffset,
          0.12
        );
    }

    return result;
  }

  setAiming(aiming) {
    this.ads = !!aiming;
  }

  isAiming() {
    return this.ads;
  }

  reset() {
    super.reset();

    this.ads = false;
    this.recoilOffset = 0;
    this.spread = this.hipSpread;
  }
}
