import { Weapon } from "./Weapon.js";

export class SMG extends Weapon {
  constructor() {
    super({
      name: "SMG",
      damage: 19,
      fireRate: 13,
      magazineSize: 40,
      reserveAmmo: 200,
      reloadTime: 1.9,
      range: 75,
      spread: 0.025,
      automatic: true
    });

    // SMG-specific handling
    this.recoil = 0.011;
    this.recoilRecovery = 12;

    this.hipSpread = 0.025;
    this.aimSpread = 0.013;

    this.ads = false;

    this.recoilOffset = 0;
  }

  update(dt) {
    super.update(dt);

    // Recover recoil smoothly
    this.recoilOffset = Math.max(
      0,
      this.recoilOffset -
        this.recoilRecovery * dt
    );

    // Aiming improves accuracy
    this.spread = this.ads
      ? this.aimSpread
      : this.hipSpread;

    // Apply visual recoil
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
          0.10
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

    this.spread =
      this.hipSpread;
  }
}
