export const EnemyTypes = {
  RIFLEMAN: {
    id: "rifleman",
    name: "RIFLEMAN",

    health: 100,
    damage: 10,

    moveSpeed: 1.8,
    detectionRange: 35,
    attackRange: 18,
    attackCooldown: 1.0,

    xp: 100,

    scale: 1.0
  },

  ASSAULT: {
    id: "assault",
    name: "ASSAULT",

    health: 125,
    damage: 13,

    moveSpeed: 2.4,
    detectionRange: 38,
    attackRange: 20,
    attackCooldown: 0.75,

    xp: 140,

    scale: 1.05
  },

  HEAVY: {
    id: "heavy",
    name: "HEAVY",

    health: 240,
    damage: 18,

    moveSpeed: 1.15,
    detectionRange: 32,
    attackRange: 22,
    attackCooldown: 1.4,

    xp: 250,

    scale: 1.2
  },

  SCOUT: {
    id: "scout",
    name: "SCOUT",

    health: 75,
    damage: 8,

    moveSpeed: 3.2,
    detectionRange: 45,
    attackRange: 16,
    attackCooldown: 0.65,

    xp: 120,

    scale: 0.95
  },

  ELITE: {
    id: "elite",
    name: "ELITE",

    health: 180,
    damage: 16,

    moveSpeed: 2.5,
    detectionRange: 45,
    attackRange: 25,
    attackCooldown: 0.65,

    xp: 300,

    scale: 1.08
  },

  HVT_GUARD: {
    id: "hvt_guard",
    name: "HVT GUARD",

    health: 160,
    damage: 15,

    moveSpeed: 2.0,
    detectionRange: 42,
    attackRange: 22,
    attackCooldown: 0.8,

    xp: 200,

    scale: 1.05
  }
};

export function getEnemyType(id) {
  return (
    Object.values(EnemyTypes).find(
      (type) => type.id === id
    ) || EnemyTypes.RIFLEMAN
  );
}

export function getRandomEnemyType(wave = 1) {
  const available = [
    EnemyTypes.RIFLEMAN
  ];

  if (wave >= 2) {
    available.push(
      EnemyTypes.SCOUT
    );
  }

  if (wave >= 3) {
    available.push(
      EnemyTypes.ASSAULT
    );
  }

  if (wave >= 5) {
    available.push(
      EnemyTypes.HEAVY
    );
  }

  if (wave >= 7) {
    available.push(
      EnemyTypes.ELITE
    );
  }

  const index = Math.floor(
    Math.random() * available.length
  );

  return available[index];
}

export function createEnemyConfig(
  type,
  wave = 1
) {
  const base = type || EnemyTypes.RIFLEMAN;

  const difficultyMultiplier =
    1 + Math.max(0, wave - 1) * 0.04;

  return {
    ...base,

    health:
      Math.round(
        base.health *
        difficultyMultiplier
      ),

    damage:
      Math.round(
        base.damage *
        Math.min(
          1.5,
          difficultyMultiplier
        )
      ),

    moveSpeed:
      base.moveSpeed *
      Math.min(
        1.25,
        1 + Math.max(0, wave - 1) * 0.015
      )
  };
}
