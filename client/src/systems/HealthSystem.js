export class HealthSystem {
  constructor(options = {}) {
    this.maxHealth =
      options.maxHealth ?? 100;

    this.maxArmor =
      options.maxArmor ?? 50;

    this.health =
      this.maxHealth;

    this.armor =
      this.maxArmor;

    this.alive = true;

    this.invulnerable = false;

    this.regenerationEnabled =
      options.regenerationEnabled ??
      false;

    this.regenerationDelay =
      options.regenerationDelay ??
      5;

    this.regenerationRate =
      options.regenerationRate ??
      8;

    this.timeSinceDamage = 0;

    this.callbacks = {
      onDamage:
        options.onDamage || null,

      onHeal:
        options.onHeal || null,

      onDeath:
        options.onDeath || null,

      onRespawn:
        options.onRespawn || null
    };
  }

  update(dt) {
    if (!this.alive) {
      return;
    }

    if (!Number.isFinite(dt)) {
      return;
    }

    this.timeSinceDamage += dt;

    if (
      !this.regenerationEnabled
    ) {
      return;
    }

    if (
      this.timeSinceDamage <
      this.regenerationDelay
    ) {
      return;
    }

    if (
      this.health >=
      this.maxHealth
    ) {
      return;
    }

    this.heal(
      this.regenerationRate * dt
    );
  }

  damage(
    amount,
    options = {}
  ) {
    if (
      !this.alive ||
      this.invulnerable
    ) {
      return 0;
    }

    const damage =
      Math.max(
        0,
        Number(amount) || 0
      );

    if (damage <= 0) {
      return 0;
    }

    this.timeSinceDamage = 0;

    let remaining =
      damage;

    let armorDamage = 0;
    let healthDamage = 0;

    const armorAbsorption =
      options.armorAbsorption ??
      0.65;

    if (
      this.armor > 0
    ) {
      const absorbed =
        Math.min(
          this.armor,
          remaining *
            armorAbsorption
        );

      this.armor -=
        absorbed;

      remaining -=
        absorbed;

      armorDamage =
        absorbed;
    }

    if (
      remaining > 0
    ) {
      healthDamage =
        Math.min(
          this.health,
          remaining
        );

      this.health -=
        healthDamage;
    }

    const totalDamage =
      armorDamage +
      healthDamage;

    if (
      typeof this.callbacks.onDamage ===
      "function"
    ) {
      this.callbacks.onDamage(
        totalDamage,
        {
          armorDamage,
          healthDamage,
          health:
            this.health,
          armor:
            this.armor
        }
      );
    }

    if (
      this.health <= 0
    ) {
      this.health = 0;

      this.kill();
    }

    return totalDamage;
  }

  heal(amount) {
    if (!this.alive) {
      return 0;
    }

    const value =
      Math.max(
        0,
        Number(amount) || 0
      );

    if (value <= 0) {
      return 0;
    }

    const oldHealth =
      this.health;

    this.health =
      Math.min(
        this.maxHealth,
        this.health + value
      );

    const healed =
      this.health -
      oldHealth;

    if (
      healed > 0 &&
      typeof this.callbacks.onHeal ===
        "function"
    ) {
      this.callbacks.onHeal(
        healed,
        this.health
      );
    }

    return healed;
  }

  addArmor(amount) {
    const value =
      Math.max(
        0,
        Number(amount) || 0
      );

    const oldArmor =
      this.armor;

    this.armor =
      Math.min(
        this.maxArmor,
        this.armor + value
      );

    return (
      this.armor -
      oldArmor
    );
  }

  removeArmor(amount) {
    const value =
      Math.max(
        0,
        Number(amount) || 0
      );

    const oldArmor =
      this.armor;

    this.armor =
      Math.max(
        0,
        this.armor - value
      );

    return (
      oldArmor -
      this.armor
    );
  }

  kill() {
    if (!this.alive) {
      return;
    }

    this.alive = false;
    this.health = 0;

    if (
      typeof this.callbacks.onDeath ===
      "function"
    ) {
      this.callbacks.onDeath();
    }
  }

  respawn(
    health = this.maxHealth,
    armor = this.maxArmor
  ) {
    this.health =
      Math.min(
        this.maxHealth,
        Math.max(0, health)
      );

    this.armor =
      Math.min(
        this.maxArmor,
        Math.max(0, armor)
      );

    this.alive = true;

    this.timeSinceDamage = 0;

    if (
      typeof this.callbacks.onRespawn ===
      "function"
    ) {
      this.callbacks.onRespawn();
    }
  }

  setInvulnerable(
    value
  ) {
    this.invulnerable =
      Boolean(value);
  }

  setRegeneration(
    enabled
  ) {
    this.regenerationEnabled =
      Boolean(enabled);
  }

  setHealth(
    value
  ) {
    this.health =
      Math.min(
        this.maxHealth,
        Math.max(
          0,
          Number(value) || 0
        )
      );

    if (
      this.health <= 0
    ) {
      this.kill();
    }
  }

  setArmor(
    value
  ) {
    this.armor =
      Math.min(
        this.maxArmor,
        Math.max(
          0,
          Number(value) || 0
        )
      );
  }

  getHealth() {
    return this.health;
  }

  getMaxHealth() {
    return this.maxHealth;
  }

  getArmor() {
    return this.armor;
  }

  getMaxArmor() {
    return this.maxArmor;
  }

  getHealthPercent() {
    return (
      this.health /
      this.maxHealth
    );
  }

  getArmorPercent() {
    return (
      this.armor /
      this.maxArmor
    );
  }

  isAlive() {
    return this.alive;
  }

  isDead() {
    return !this.alive;
  }

  getState() {
    return {
      health:
        this.health,

      maxHealth:
        this.maxHealth,

      armor:
        this.armor,

      maxArmor:
        this.maxArmor,

      healthPercent:
        this.getHealthPercent(),

      armorPercent:
        this.getArmorPercent(),

      alive:
        this.alive
    };
  }

  reset() {
    this.health =
      this.maxHealth;

    this.armor =
      this.maxArmor;

    this.alive = true;

    this.invulnerable = false;

    this.timeSinceDamage = 0;
  }

  destroy() {
    this.callbacks = {};
  }
}
