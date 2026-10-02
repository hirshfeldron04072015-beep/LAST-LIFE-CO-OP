export class MissionManager {
  constructor(options = {}) {
    this.player = options.player || null;
    this.scene = options.scene || null;

    this.currentMission = null;
    this.currentMode = null;

    this.running = false;
    this.completed = false;
    this.failed = false;

    this.elapsedTime = 0;

    this.objectives = [];
    this.activeObjective = 0;

    this.callbacks = {
      onStart: null,
      onObjectiveComplete: null,
      onComplete: null,
      onFail: null,
      onUpdate: null
    };
  }

  setPlayer(player) {
    this.player = player;
  }

  setScene(scene) {
    this.scene = scene;
  }

  setCallbacks(callbacks = {}) {
    this.callbacks = {
      ...this.callbacks,
      ...callbacks
    };
  }

  startMission(mission) {
    if (!mission) {
      return false;
    }

    this.stopMission();

    this.currentMission = mission;
    this.currentMode =
      mission.mode || mission.id || "unknown";

    this.running = true;
    this.completed = false;
    this.failed = false;

    this.elapsedTime = 0;

    this.objectives = (
      mission.objectives || []
    ).map(
      (objective, index) => ({
        id:
          objective.id ||
          `objective_${index}`,

        title:
          objective.title ||
          `Objective ${index + 1}`,

        description:
          objective.description || "",

        completed: false,
        failed: false,

        progress:
          objective.progress || 0,

        target:
          objective.target || 1
      })
    );

    this.activeObjective = 0;

    if (
      typeof this.callbacks.onStart ===
      "function"
    ) {
      this.callbacks.onStart(
        this.currentMission
      );
    }

    return true;
  }

  update(dt) {
    if (!this.running) {
      return;
    }

    if (!Number.isFinite(dt)) {
      return;
    }

    this.elapsedTime += dt;

    this.updateMission(dt);

    if (
      typeof this.callbacks.onUpdate ===
      "function"
    ) {
      this.callbacks.onUpdate(
        this.getState()
      );
    }
  }

  updateMission(dt) {
    if (!this.currentMission) {
      return;
    }

    if (
      typeof this.currentMission.update ===
      "function"
    ) {
      this.currentMission.update(
        dt,
        this
      );
    }

    this.checkObjectives();
  }

  checkObjectives() {
    const objective =
      this.getActiveObjective();

    if (!objective) {
      return;
    }

    if (
      objective.completed ||
      objective.failed
    ) {
      return;
    }

    if (
      objective.progress >=
      objective.target
    ) {
      this.completeObjective(
        objective.id
      );
    }
  }

  completeObjective(
    objectiveId
  ) {
    const objective =
      this.objectives.find(
        (item) =>
          item.id === objectiveId
      );

    if (
      !objective ||
      objective.completed
    ) {
      return false;
    }

    objective.completed = true;
    objective.progress =
      objective.target;

    if (
      typeof this.callbacks
        .onObjectiveComplete ===
      "function"
    ) {
      this.callbacks.onObjectiveComplete(
        objective,
        this.getState()
      );
    }

    const nextIndex =
      this.objectives.findIndex(
        (item) =>
          !item.completed &&
          !item.failed
      );

    if (nextIndex === -1) {
      this.completeMission();
    } else {
      this.activeObjective =
        nextIndex;
    }

    return true;
  }

  failObjective(
    objectiveId
  ) {
    const objective =
      this.objectives.find(
        (item) =>
          item.id === objectiveId
      );

    if (
      !objective ||
      objective.completed ||
      objective.failed
    ) {
      return false;
    }

    objective.failed = true;

    this.failMission(
      `Objective failed: ${objective.title}`
    );

    return true;
  }

  setObjectiveProgress(
    objectiveId,
    progress
  ) {
    const objective =
      this.objectives.find(
        (item) =>
          item.id === objectiveId
      );

    if (!objective) {
      return false;
    }

    objective.progress =
      Math.max(
        0,
        Math.min(
          objective.target,
          progress
        )
      );

    this.checkObjectives();

    return true;
  }

  addObjectiveProgress(
    objectiveId,
    amount = 1
  ) {
    const objective =
      this.objectives.find(
        (item) =>
          item.id === objectiveId
      );

    if (!objective) {
      return false;
    }

    objective.progress +=
      amount;

    objective.progress =
      Math.max(
        0,
        Math.min(
          objective.target,
          objective.progress
        )
      );

    this.checkObjectives();

    return true;
  }

  getActiveObjective() {
    return (
      this.objectives[
        this.activeObjective
      ] || null
    );
  }

  getObjective(
    objectiveId
  ) {
    return (
      this.objectives.find(
        (objective) =>
          objective.id ===
          objectiveId
      ) || null
    );
  }

  completeMission() {
    if (
      !this.running ||
      this.completed
    ) {
      return false;
    }

    this.running = false;
    this.completed = true;
    this.failed = false;

    if (
      typeof this.callbacks.onComplete ===
      "function"
    ) {
      this.callbacks.onComplete(
        this.getState()
      );
    }

    return true;
  }

  failMission(
    reason = "Mission failed"
  ) {
    if (
      !this.running ||
      this.failed
    ) {
      return false;
    }

    this.running = false;
    this.failed = true;
    this.completed = false;

    if (
      typeof this.callbacks.onFail ===
      "function"
    ) {
      this.callbacks.onFail(
        reason,
        this.getState()
      );
    }

    return true;
  }

  stopMission() {
    this.running = false;

    this.currentMission = null;
    this.currentMode = null;

    this.completed = false;
    this.failed = false;

    this.elapsedTime = 0;

    this.objectives = [];
    this.activeObjective = 0;
  }

  restartMission() {
    if (!this.currentMission) {
      return false;
    }

    const mission =
      this.currentMission;

    return this.startMission(
      mission
    );
  }

  isRunning() {
    return this.running;
  }

  isCompleted() {
    return this.completed;
  }

  isFailed() {
    return this.failed;
  }

  getMode() {
    return this.currentMode;
  }

  getElapsedTime() {
    return this.elapsedTime;
  }

  getState() {
    return {
      mode: this.currentMode,
      running: this.running,
      completed: this.completed,
      failed: this.failed,

      elapsedTime:
        this.elapsedTime,

      objectives:
        this.objectives.map(
          (objective) => ({
            ...objective
          })
        ),

      activeObjective:
        this.getActiveObjective()
    };
  }

  destroy() {
    this.stopMission();

    this.player = null;
    this.scene = null;

    this.callbacks = {};
  }
}
