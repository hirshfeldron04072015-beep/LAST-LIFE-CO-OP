export class SurvivalMission {
  constructor(options = {}) {
    this.id = "survival";
    this.mode = "SURVIVAL";

    this.player = options.player || null;
    this.spawner = options.spawner || null;

    this.started = false;
    this.completed = false;
    this.failed = false;

    this.elapsedTime = 0;
    this.targetTime =
      options.targetTime || 300;

    this.wave = 1;
    this.kills = 0;

    this.maxWaves =
      options.maxWaves || 10;

    this.lastWave = 0;

    this.objectives = [
      {
        id: "survive",
        title: "Survive",
        description:
          "Stay alive until the extraction window opens.",
        progress: 0,
        target: this.targetTime
      },

      {
        id: "waves",
        title: "Survive the waves",
        description:
          "Push through increasingly difficult enemy waves.",
        progress: 0,
        target: this.maxWaves
      }
    ];
  }

  start() {
    this.started = true;
    this.completed = false;
    this.failed = false;

    this.elapsedTime = 0;
    this.wave = 1;
    this.kills = 0;
    this.lastWave = 0;

    this.resetObjectives();

    if (
      this.spawner &&
      typeof this.spawner.reset === "function"
    ) {
      this.spawner.reset();
    }

    if (
      this.spawner &&
      typeof this.spawner.setEnabled === "function"
    ) {
      this.spawner.setEnabled(true);
    }
  }

  update(dt) {
    if (
      !this.started ||
      this.completed ||
      this.failed
    ) {
      return;
    }

    if (!Number.isFinite(dt)) {
      return;
    }

    this.elapsedTime += dt;

    this.updateWave();

    this.updateObjectives();

    this.checkPlayer();

    if (
      this.elapsedTime >=
      this.targetTime
    ) {
      this.complete();
    }
  }

  updateWave() {
    if (
      !this.spawner ||
      typeof this.spawner.getWave !== "function"
    ) {
      return;
    }

    const currentWave =
      this.spawner.getWave();

    if (
      currentWave !== this.lastWave
    ) {
      this.wave =
        currentWave;

      this.lastWave =
        currentWave;

      this.setObjectiveProgress(
        "waves",
        Math.min(
          this.maxWaves,
          currentWave - 1
        )
      );
    }
  }

  updateObjectives() {
    this.setObjectiveProgress(
      "survive",
      Math.min(
        this.targetTime,
        this.elapsedTime
      )
    );

    if (
      this.spawner &&
      typeof this.spawner.getWave ===
        "function"
    ) {
      const wave =
        this.spawner.getWave();

      this.setObjectiveProgress(
        "waves",
        Math.min(
          this.maxWaves,
          Math.max(
            0,
            wave - 1
          )
        )
      );
    }
  }

  checkPlayer() {
    if (!this.player) {
      return;
    }

    if (
      typeof this.player.isDead ===
      "function"
    ) {
      if (
        this.player.isDead()
      ) {
        this.fail(
          "You were eliminated."
        );
      }
    }
  }

  addKill() {
    this.kills++;
  }

  complete() {
    if (
      this.completed ||
      this.failed
    ) {
      return;
    }

    this.completed = true;
    this.started = false;

    this.setObjectiveProgress(
      "survive",
      this.targetTime
    );

    this.setObjectiveProgress(
      "waves",
      this.maxWaves
    );

    if (
      this.spawner &&
      typeof this.spawner.setEnabled ===
        "function"
    ) {
      this.spawner.setEnabled(false);
    }
  }

  fail(
    reason = "Mission failed"
  ) {
    if (
      this.completed ||
      this.failed
    ) {
      return;
    }

    this.failed = true;
    this.started = false;

    this.failReason =
      reason;

    if (
      this.spawner &&
      typeof this.spawner.setEnabled ===
        "function"
    ) {
      this.spawner.setEnabled(false);
    }
  }

  setObjectiveProgress(
    id,
    progress
  ) {
    const objective =
      this.objectives.find(
        (item) =>
          item.id === id
      );

    if (!objective) {
      return;
    }

    objective.progress =
      Math.max(
        0,
        Math.min(
          objective.target,
          progress
        )
      );
  }

  resetObjectives() {
    for (
      const objective of
      this.objectives
    ) {
      objective.progress = 0;
    }
  }

  getActiveObjective() {
    return (
      this.objectives.find(
        (objective) =>
          objective.progress <
          objective.target
      ) || null
    );
  }

  getRemainingTime() {
    return Math.max(
      0,
      this.targetTime -
        this.elapsedTime
    );
  }

  getState() {
    return {
      id: this.id,
      mode: this.mode,

      started: this.started,
      completed: this.completed,
      failed: this.failed,

      elapsedTime:
        this.elapsedTime,

      targetTime:
        this.targetTime,

      remainingTime:
        this.getRemainingTime(),

      wave: this.wave,
      kills: this.kills,

      objectives:
        this.objectives.map(
          (objective) => ({
            ...objective
          })
        ),

      activeObjective:
        this.getActiveObjective(),

      failReason:
        this.failReason || null
    };
  }

  destroy() {
    this.player = null;
    this.spawner = null;
    this.objectives = [];
  }
}
