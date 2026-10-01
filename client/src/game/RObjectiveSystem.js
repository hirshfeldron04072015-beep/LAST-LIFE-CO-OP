export class ObjectiveSystem {
  constructor(type, player, enemies, world) {
    this.type = type;
    this.player = player;
    this.enemies = enemies;
    this.world = world;

    this.complete = false;
    this.failed = false;

    this.kills = 0;
    this.time = 0;

    this.extractionActive = false;
    this.extractionPosition = null;
  }

  update(dt) {
    if (this.complete || this.failed) return;

    this.time += dt;

    if (this.type === "tdm") {
      this.updateTDM();
    }

    if (this.type === "hostage") {
      this.updateHostage();
    }

    if (this.type === "hvt") {
      this.updateHVT();
    }

    if (this.type === "survival") {
      this.updateSurvival();
    }

    if (
      this.extractionActive &&
      this.extractionPosition
    ) {
      const distance =
        this.player.camera.position.distanceTo(
          this.extractionPosition
        );

      if (distance < 4) {
        this.complete = true;
      }
    }
  }

  updateTDM() {
    if (this.kills >= 18) {
      this.complete = true;
    }
  }

  updateHostage() {
    if (!this.extractionActive) {
      return;
    }
  }

  updateHVT() {
    const target =
      this.enemies.children.find(
        enemy => enemy.userData.isHVT
      );

    if (!target) {
      this.activateExtraction();
    }
  }

  updateSurvival() {
    if (this.time >= 60) {
      this.activateExtraction();
    }
  }

  registerKill(enemy) {
    this.kills++;

    if (
      this.type === "hvt" &&
      enemy.userData.isHVT
    ) {
      this.activateExtraction();
    }
  }

  hostageSecured() {
    if (this.type !== "hostage") return;

    this.activateExtraction();
  }

  activateExtraction() {
    if (this.extractionActive) return;

    this.extractionActive = true;

    this.extractionPosition =
      this.world.getExtractionPoint();
  }

  getStatus() {
    if (this.type === "tdm") {
      return `HOSTILES: ${this.kills}/18`;
    }

    if (this.type === "survival") {
      return `SURVIVE: ${Math.max(
        0,
        Math.ceil(60 - this.time)
      )}s`;
    }

    if (this.extractionActive) {
      return "MOVE TO EXTRACTION";
    }

    return "OBJECTIVE ACTIVE";
  }
}
