export class DamageSystem {
  constructor(options = {}) {
    this.defaultArmorAbsorption =
      options.armorAbsorption ?? 0.65;

    this.headshotMultiplier =
      options.headshotMultiplier ?? 2.0;

    this.bodyMultiplier =
      options.bodyMultiplier ?? 1.0;

    this.legMultiplier =
      options.legMultiplier ?? 0.75;

    this.callbacks = {
      onHit: options.onHit || null,
      onKill: options.onKill || null,
      onHeadshot: options.onHeadshot || null,
      onDamage: options.onDamage || null
    };
  }

  calculateDamage(
    baseDamage,
    hitZone = "body",
    distance = 0,
    range = Infinity
  ) {
    let multiplier =
      this.bodyMultiplier;

    if (hitZone === "head") {
      multiplier =
        this.headshotMultiplier;
    } else if (
      hitZone === "legs"
    ) {
      multiplier =
        this.legMultiplier;
    }

    let damage =
      Math.max(
        0,
        Number(baseDamage) || 0
      );

    damage *= multiplier;

    if (
      Number.isFinite(range) &&
      range > 0 &&
      distance > range
    ) {
      const falloff =
        Math.max(
          0.35,
          1 -
            (distance - range) /
              range
        );

      damage *= falloff;
    }

    return damage;
  }

  applyDamage(
    target,
    baseDamage,
    options = {}
  ) {
    if (!target) {
      return {
        success: false,
        damage: 0,
        killed: false,
        headshot: false
      };
    }

    const hitZone =
      options.hitZone ||
      "body";

    const distance =
      options.distance || 0;

    const range =
      options.range ??
      Infinity;

    const damage =
      this.calculateDamage(
        baseDamage,
        hitZone,
        distance,
        range
      );

    if (damage <= 0) {
      return {
        success: false,
        damage: 0,
        killed: false,
        headshot:
          hitZone === "head"
      };
    }

    let actualDamage =
      damage;

    let killed = false;

    const headshot =
      hitZone === "head";

    if (
      typeof target.damage ===
      "function"
    ) {
      actualDamage =
        target.damage(
          damage,
          {
            hitZone,
            armorAbsorption:
              options.armorAbsorption ??
              this.defaultArmorAbsorption
          }
        );

      if (
        typeof target.isAlive ===
        "function"
      ) {
        killed =
          !target.isAlive();
      }
    } else if (
      typeof target.takeDamage ===
      "function"
    ) {
      actualDamage =
        target.takeDamage(
          damage
        );

      if (
        typeof target.isDead ===
        "function"
      ) {
        killed =
          target.isDead();
      }
    } else if (
      target.health !==
      undefined
    ) {
      target.health -=
        damage;

      actualDamage =
        damage;

      if (
        target.health <= 0
      ) {
        target.health = 0;
        killed = true;
      }
    }

    const result = {
      success: true,
      damage:
        actualDamage,
      rawDamage:
        damage,
      hitZone,
      headshot,
      killed,
      distance
    };

    if (
      typeof this.callbacks.onHit ===
      "function"
    ) {
      this.callbacks.onHit(
        target,
        result
      );
    }

    if (
      typeof this.callbacks.onDamage ===
      "function"
    ) {
      this.callbacks.onDamage(
        target,
        result
      );
    }

    if (
      headshot &&
      typeof this.callbacks.onHeadshot ===
      "function"
    ) {
      this.callbacks.onHeadshot(
        target,
        result
      );
    }

    if (
      killed &&
      typeof this.callbacks.onKill ===
      "function"
    ) {
      this.callbacks.onKill(
        target,
        result
      );
    }

    return result;
  }

  detectHitZone(
    object
  ) {
    if (!object) {
      return "body";
    }

    if (
      object.userData &&
      object.userData.hitZone
    ) {
      return object.userData.hitZone;
    }

    const name =
      String(
        object.name || ""
      ).toLowerCase();

    if (
      name.includes("head") ||
      name.includes("helmet")
    ) {
      return "head";
    }

    if (
      name.includes("leg") ||
      name.includes("foot")
    ) {
      return "legs";
    }

    return "body";
  }

  getHitZoneMultiplier(
    hitZone
  ) {
    if (
      hitZone === "head"
    ) {
      return this.headshotMultiplier;
    }

    if (
      hitZone === "legs"
    ) {
      return this.legMultiplier;
    }

    return this.bodyMultiplier;
  }

  isHeadshot(
    hitZone
  ) {
    return hitZone === "head";
  }

  setHeadshotMultiplier(
    value
  ) {
    this.headshotMultiplier =
      Math.max(
        1,
        Number(value) || 1
      );
  }

  setArmorAbsorption(
    value
  ) {
    this.defaultArmorAbsorption =
      Math.max(
        0,
        Math.min(
          1,
          Number(value) || 0
        )
      );
  }

  reset() {
    this.defaultArmorAbsorption =
      0.65;

    this.headshotMultiplier =
      2.0;

    this.bodyMultiplier =
      1.0;

    this.legMultiplier =
      0.75;
  }

  destroy() {
    this.callbacks = {};
  }
}
