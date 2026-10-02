export class HostageMission {
  constructor(options = {}) {
    this.id = "hostage";
    this.mode = "RESCUE HOSTAGE";

    this.player = options.player || null;
    this.scene = options.scene || null;
    this.hostage = options.hostage || null;
    this.extraction = options.extraction || null;

    this.state = "search";
    this.started = false;
    this.completed = false;
    this.failed = false;

    this.hostageRescued = false;
    this.hostageAtExtraction = false;

    this.rescueDistance = 3;
    this.followDistance = 2.2;
    this.extractionDistance = 4;

    this.followSpeed = 2.7;
    this.elapsedTime = 0;

    this.objectives = [
      {
        id: "find_hostage",
        title: "Find the hostage",
        description:
          "Locate the hostage inside the hostile area.",
        progress: 0,
        target: 1
      },

      {
        id: "rescue_hostage",
        title: "Rescue the hostage",
        description:
          "Reach the hostage and secure them.",
        progress: 0,
        target: 1
      },

      {
        id: "extract_hostage",
        title: "Extract the hostage",
        description:
          "Bring the hostage to the extraction zone.",
        progress: 0,
        target: 1
      }
    ];
  }

  start() {
    this.started = true;
    this.completed = false;
    this.failed = false;

    this.state = "search";
    this.hostageRescued = false;
    this.hostageAtExtraction = false;

    this.elapsedTime = 0;

    this.resetObjectives();

    if (this.hostage) {
      this.hostage.setFollowing?.(
        false
      );
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

    this.elapsedTime += dt;

    if (!this.player) {
      return;
    }

    this.updateState();

    if (
      this.hostageRescued
    ) {
      this.updateHostageFollow(
        dt
      );
    }

    this.checkExtraction();
  }

  updateState() {
    if (
      !this.hostage
    ) {
      return;
    }

    const playerPosition =
      this.getPlayerPosition();

    const hostagePosition =
      this.getHostagePosition();

    if (
      !playerPosition ||
      !hostagePosition
    ) {
      return;
    }

    const distance =
      playerPosition.distanceTo(
        hostagePosition
      );

    if (
      !this.hostageRescued &&
      distance <= this.rescueDistance
    ) {
      this.rescueHostage();
      return;
    }

    if (
      !this.hostageRescued
    ) {
      this.state =
        "search";

      this.setObjectiveProgress(
        "find_hostage",
        distance <= 10
          ? 1
          : 0
      );

      return;
    }

    this.state =
      "escort";

    this.setObjectiveProgress(
      "rescue_hostage",
      1
    );
  }

  rescueHostage() {
    if (
      this.hostageRescued
    ) {
      return;
    }

    this.hostageRescued =
      true;

    this.state =
      "escort";

    this.setObjectiveProgress(
      "find_hostage",
      1
    );

    this.setObjectiveProgress(
      "rescue_hostage",
      1
    );

    if (
      this.hostage
        .setFollowing
    ) {
      this.hostage.setFollowing(
        true
      );
    }

    if (
      this.hostage
        .onRescued
    ) {
      this.hostage.onRescued();
    }
  }

  updateHostageFollow(dt) {
    if (
      !this.hostage ||
      !this.player
    ) {
      return;
    }

    const playerPosition =
      this.getPlayerPosition();

    if (!playerPosition) {
      return;
    }

    if (
      typeof this.hostage.updateFollow ===
      "function"
    ) {
      this.hostage.updateFollow(
        playerPosition,
        dt,
        this.followDistance,
        this.followSpeed
      );

      return;
    }

    const hostagePosition =
      this.getHostagePosition();

    if (!hostagePosition) {
      return;
    }

    const direction =
      playerPosition.clone()
        .sub(hostagePosition);

    direction.y = 0;

    const distance =
      direction.length();

    if (
      distance <=
      this.followDistance
    ) {
      return;
    }

    direction.normalize();

    const movement =
      Math.min(
        this.followSpeed * dt,
        distance -
          this.followDistance
      );

    hostagePosition.add(
      direction.multiplyScalar(
        movement
      )
    );

    this.setHostagePosition(
      hostagePosition
    );

    if (
      typeof this.hostage.lookAt ===
      "function"
    ) {
      this.hostage.lookAt(
        playerPosition.x,
        hostagePosition.y,
        playerPosition.z
      );
    }
  }

  checkExtraction() {
    if (
      !this.hostageRescued ||
      !this.extraction
    ) {
      return;
    }

    const extractionPosition =
      this.getExtractionPosition();

    const hostagePosition =
      this.getHostagePosition();

    if (
      !extractionPosition ||
      !hostagePosition
    ) {
      return;
    }

    const distance =
      extractionPosition.distanceTo(
        hostagePosition
      );

    if (
      distance <=
      this.extractionDistance
    ) {
      this.extractHostage();
    }
  }

  extractHostage() {
    if (
      this.hostageAtExtraction
    ) {
      return;
    }

    this.hostageAtExtraction =
      true;

    this.state =
      "complete";

    this.setObjectiveProgress(
      "extract_hostage",
      1
    );

    this.completed = true;
    this.started = false;

    if (
      this.hostage &&
      this.hostage.onExtracted
    ) {
      this.hostage.onExtracted();
    }
  }

  fail(reason = "Hostage lost") {
    if (
      this.completed ||
      this.failed
    ) {
      return;
    }

    this.failed = true;
    this.started = false;
    this.state = "failed";
    this.failReason = reason;
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

  getHostagePosition() {
    if (!this.hostage) {
      return null;
    }

    if (
      typeof this.hostage.getPosition ===
      "function"
    ) {
      const position =
        this.hostage.getPosition();

      return position
        ? position.clone()
        : null;
    }

    if (
      this.hostage.position
    ) {
      return this.hostage.position.clone();
    }

    if (
      this.hostage.object &&
      this.hostage.object.position
    ) {
      return this.hostage.object.position.clone();
    }

    return null;
  }

  setHostagePosition(
    position
  ) {
    if (!this.hostage) {
      return;
    }

    if (
      typeof this.hostage.setPosition ===
      "function"
    ) {
      this.hostage.setPosition(
        position
      );

      return;
    }

    if (
      this.hostage.position
    ) {
      this.hostage.position.copy(
        position
      );

      return;
    }

    if (
      this.hostage.object &&
      this.hostage.object.position
    ) {
      this.hostage.object.position.copy(
        position
      );
    }
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

  getState() {
    return {
      id: this.id,
      mode: this.mode,

      state: this.state,

      started: this.started,
      completed: this.completed,
      failed: this.failed,

      hostageRescued:
        this.hostageRescued,

      hostageAtExtraction:
        this.hostageAtExtraction,

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
    this.player = null;
    this.scene = null;
    this.hostage = null;
    this.extraction = null;

    this.objectives = [];
  }
}
