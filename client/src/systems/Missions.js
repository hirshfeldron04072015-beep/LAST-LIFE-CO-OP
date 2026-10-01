export const MISSIONS = {
  tdm: {
    name: "TEAM DEATHMATCH",
    objective: "Eliminate enemy forces",
    target: 20
  },

  hostage: {
    name: "HOSTAGE RESCUE",
    objective: "Locate and extract the hostage",
    target: 1
  },

  hvt: {
    name: "HIGH VALUE TARGET",
    objective: "Eliminate the HVT",
    target: 1
  },

  survival: {
    name: "SURVIVAL",
    objective: "Survive for 60 seconds",
    target: 60
  }
};

export class Mission {
  constructor(type) {
    this.type = type;
    this.data = MISSIONS[type];

    this.progress = 0;
    this.complete = false;

    this.startTime = performance.now();
  }

  kill() {
    if (
      this.type !== "tdm" ||
      this.complete
    ) {
      return;
    }

    this.progress++;

    if (
      this.progress >= this.data.target
    ) {
      this.complete = true;
    }
  }

  update() {
    if (
      this.type === "survival" &&
      !this.complete
    ) {
      this.progress =
        (performance.now() -
          this.startTime) / 1000;

      if (this.progress >= 60) {
        this.progress = 60;
        this.complete = true;
      }
    }
  }

  getObjective() {
    if (this.type === "tdm") {
      return `${this.data.objective}: ${this.progress}/${this.data.target}`;
    }

    if (this.type === "survival") {
      return `${this.data.objective}: ${Math.floor(this.progress)}/${this.data.target}s`;
    }

    if (this.complete) {
      return "OBJECTIVE COMPLETE";
    }

    return this.data.objective;
  }
}
