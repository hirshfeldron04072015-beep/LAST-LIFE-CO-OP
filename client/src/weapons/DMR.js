import { Weapon } from "./Weapon.js";

export class DMR extends Weapon {
  constructor() {
    super({
      name: "DMR",
      damage: 55,
      fireRate: 2.2,
      magazineSize: 12,
      reserveAmmo: 72,
      reloadTime: 2.1,
      range: 180,
      spread: 0.004,
      automatic: false
    });

    this.recoil = 0.045;
    this.recoilRecovery = 7;

    this.hipSpread = 0.004;
    this.aimSpread = 0.0015;

    this.ads = false;

    this.recoilOffset = 0;
  }

  update(dt) {
    super.update(dt);

    // Recover from recoil
    this.recoilOffset = Math.max(
      0,
      this.recoilOffset -
        this.recoilRecovery * dt
    );

    // DMR is extremely accurate
    this.spread = this.ads
      ? this.aimSpread
      : this.hipSpread;

    // Visual recoil
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
          0.16
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
