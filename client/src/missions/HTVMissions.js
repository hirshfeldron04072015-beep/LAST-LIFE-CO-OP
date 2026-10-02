import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class HVTMission {
  constructor(options = {}) {
    this.id = "hvt";
    this.mode = "HIGH VALUE TARGET";

    this.player = options.player || null;
    this.spawner = options.spawner || null;
    this.target = options.target || null;
    this.extraction = options.extraction || null;

    this.started = false;
    this.completed = false;
    this.failed = false;

    this.targetEliminated = false;
    this.targetEscaped = false;

    this.elapsedTime = 0;

    this.timeLimit =
      options.timeLimit || 420;

    this.targetDistance =
      options.targetDistance || 3;

    this.extractionDistance =
      options.extractionDistance || 4;

    this.targetName =
      options.targetName ||
      "HIGH VALUE TARGET";

    this.objectives = [
      {
        id: "locate_target",
        title: "Locate the HVT",
        description:
          "Find the high value target inside the hostile zone.",
        progress: 0,
        target: 1
      },

      {
        id: "eliminate_target",
        title: "Eliminate the HVT",
        description:
          "Neutralize the high value target.",
        progress: 0,
        target: 1
      },

      {
        id: "extract",
        title: "Reach extraction",
        description:
          "Reach the extraction zone after eliminating the target.",
        progress: 0,
        target: 1
      }
    ];
  }

  start() {
    this.started = true;
    this.completed = false;
    this.failed = false;

    this.targetEliminated = false;
    this.targetEscaped = false;

    this.elapsedTime = 0;

    this.resetObjectives();

    if (
      this.spawner &&
      typeof this.spawner.reset ===
        "function"
    ) {
      this.spawner.reset();
    }

    if (
      this.spawner &&
      typeof this.spawner.setEnabled ===
        "function"
    ) {
      this.spawner.setEnabled(true);
    }

    if (
      this.target &&
      typeof this.target.revive ===
        "function"
    ) {
      this.target.revive();
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

    this.checkTarget();

    this.checkPlayer();

    this.checkExtraction();

    if (
      this.elapsedTime >=
      this.timeLimit
    ) {
      this.fail(
        "The HVT escaped."
      );
    }
  }

  checkTarget() {
    if (!this.target) {
      return;
    }

    const playerPosition =
      this.getPlayerPosition();

    const targetPosition =
      this.getTargetPosition();

    if (
      !playerPosition ||
      !targetPosition
    ) {
      return;
    }

    const distance =
      playerPosition.distanceTo(
        targetPosition
      );

    if (
      distance <= 25 &&
      !this.targetEliminated
    ) {
      this.setObjectiveProgress(
        "locate_target",
        1
      );
    }

    if (
      this.targetEliminated
    ) {
      return;
    }

    if (
      typeof this.target.isAlive ===
      "function"
    ) {
      if (
        !this.target.isAlive()
      ) {
        this.eliminateTarget();
      }
    }

    if (
      this.target.health !==
      undefined &&
      this.target.health <= 0
    ) {
      this.eliminateTarget();
    }
  }

  eliminateTarget() {
    if (
      this.targetEliminated
    ) {
      return;
    }

    this.targetEliminated =
      true;

    this.setObjectiveProgress(
      "locate_target",
      1
    );

    this.setObjectiveProgress(
      "eliminate_target",
      1
    );

    if (
      this.target &&
      typeof this.target.onEliminated ===
        "function"
    ) {
      this.target.onEliminated();
    }
  }

  checkExtraction() {
    if (
      !this.targetEliminated ||
      !this.extraction
    ) {
      return;
    }

    const playerPosition =
      this.getPlayerPosition();

    const extractionPosition =
      this.getExtractionPosition();

    if (
      !playerPosition ||
      !extractionPosition
    ) {
      return;
    }

    const distance =
      playerPosition.distanceTo(
        extractionPosition
      );

    if (
      distance <=
      this.extractionDistance
    ) {
      this.complete();
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
          "Operator eliminated."
        );
      }
    }
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
      "locate_target",
      1
    );

    this.setObjectiveProgress(
      "eliminate_target",
      1
    );

    this.setObjectiveProgress(
      "extract",
      1
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

  getPlayerPosition() {
    if (!this.player) {
      return null;
    }

    if (
      typeof this.player.getPosition ===
      "function"
    ) {
      const position =
        this.player.getPosition();

      return position
        ? position.clone()
        : null;
    }

    if (
      this.player.position
    ) {
      return this.player.position.clone();
    }

    if (
      this.player.object &&
      this.player.object.position
    ) {
      return this.player.object.position.clone();
    }

    return null;
  }

  getTargetPosition() {
    if (!this.target) {
      return null;
    }

    if (
      typeof this.target.getPosition ===
      "function"
    ) {
      const position =
        this.target.getPosition();

      return position
        ? position.clone()
        : null;
    }

    if (
      this.target.position
    ) {
      return this.target.position.clone();
    }

    if (
      this.target.object &&
      this.target.object.position
    ) {
      return this.target.object.position.clone();
    }

    return null;
  }

  getExtractionPosition() {
    if (!this.extraction) {
      return null;
    }

    if (
      typeof this.extraction.getPosition ===
      "function"
    ) {
      const position =
        this.extraction.getPosition();

      return position
        ? position.clone()
        : null;
    }

    if (
      this.extraction.position
    ) {
      return this.extraction.position.clone();
    }

    if (
      this.extraction.object &&
      this.extraction.object.position
    ) {
      return this.extraction.object.position.clone();
    }

    return null;
  }

  getRemainingTime() {
    return Math.max(
      0,
      this.timeLimit -
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

      targetName:
        this.targetName,

      targetEliminated:
        this.targetEliminated,

      targetEscaped:
        this.targetEscaped,

      elapsedTime:
        this.elapsedTime,

      timeLimit:
        this.timeLimit,

      remainingTime:
        this.getRemainingTime(),

      objectives:
        this.objectives.map(
          (objective) => ({
            ...objective
          })
        ),

      activeObjective:
        this.getActiveObjective(),

      failReason:
        this.failReason ||
        null
    };
  }

  destroy() {
    this.player = null;
    this.spawner = null;
    this.target = null;
    this.extraction = null;

    this.objectives = [];
  }
}
