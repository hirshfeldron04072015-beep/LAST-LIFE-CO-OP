export const WEAPONS = {
  vanguard: {
    name: "VANGUARD AR",
    damage: 34,
    headDamage: 72,
    fireDelay: 85,
    magazine: 30,
    reserve: 120,
    reload: 850,
    range: 140,
    recoil: 0.015
  },

  spectre: {
    name: "SPECTRE SMG",
    damage: 25,
    headDamage: 58,
    fireDelay: 55,
    magazine: 36,
    reserve: 144,
    reload: 780,
    range: 90,
    recoil: 0.022
  },

  sentinel: {
    name: "SENTINEL DMR",
    damage: 64,
    headDamage: 115,
    fireDelay: 380,
    magazine: 12,
    reserve: 72,
    reload: 1150,
    range: 220,
    recoil: 0.04
  },

  breach: {
    name: "BREACH SHOTGUN",
    damage: 18,
    headDamage: 30,
    fireDelay: 700,
    magazine: 8,
    reserve: 40,
    reload: 1350,
    range: 45,
    recoil: 0.09,
    pellets: 8
  }
};

export class WeaponSystem {
  constructor() {
    this.order = [
      "vanguard",
      "spectre",
      "sentinel",
      "breach"
    ];

    this.index = 0;

    this.ammo = {};
    this.reserve = {};

    for (const key of this.order) {
      this.ammo[key] = WEAPONS[key].magazine;
      this.reserve[key] = WEAPONS[key].reserve;
    }

    this.lastShot = 0;
    this.reloading = false;
  }

  get current() {
    return WEAPONS[this.order[this.index]];
  }

  get currentKey() {
    return this.order[this.index];
  }

  canFire() {
    return (
      !this.reloading &&
      this.ammo[this.currentKey] > 0 &&
      performance.now() - this.lastShot >= this.current.fireDelay
    );
  }

  fire() {
    if (!this.canFire()) return false;

    this.ammo[this.currentKey]--;
    this.lastShot = performance.now();

    return true;
  }

  async reload() {
    if (this.reloading) return;

    const key = this.currentKey;
    const weapon = this.current;

    if (
      this.ammo[key] >= weapon.magazine ||
      this.reserve[key] <= 0
    ) {
      return;
    }

    this.reloading = true;

    await new Promise(resolve =>
      setTimeout(resolve, weapon.reload)
    );

    const needed = weapon.magazine - this.ammo[key];
    const amount = Math.min(
      needed,
      this.reserve[key]
    );

    this.ammo[key] += amount;
    this.reserve[key] -= amount;

    this.reloading = false;
  }

  next() {
    this.index =
      (this.index + 1) % this.order.length;
  }

  previous() {
    this.index =
      (this.index - 1 + this.order.length) %
      this.order.length;
  }
}
