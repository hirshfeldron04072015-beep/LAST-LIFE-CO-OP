export class MissionHUD {
  constructor(options = {}) {
    this.root = options.root || document.body;

    this.element = null;
    this.modeElement = null;
    this.titleElement = null;
    this.objectiveElement = null;
    this.progressElement = null;
    this.progressFill = null;
    this.timerElement = null;
    this.statusElement = null;

    this.visible = true;

    this.build();
  }

  build() {
    this.element = document.createElement("div");
    this.element.id = "mission-hud";

    Object.assign(this.element.style, {
      position: "fixed",
      top: "22px",
      left: "22px",
      zIndex: "120",
      width: "min(340px, 72vw)",
      padding: "12px 14px",
      boxSizing: "border-box",
      color: "#ffffff",
      fontFamily: "Arial, Helvetica, sans-serif",
      pointerEvents: "none",
      userSelect: "none",
      textShadow: "0 2px 5px rgba(0,0,0,.9)",
      background: "rgba(5,8,10,.38)",
      borderLeft: "2px solid rgba(220,225,228,.75)",
      backdropFilter: "blur(4px)"
    });

    // Operation label
    this.modeElement =
      document.createElement("div");

    Object.assign(this.modeElement.style, {
      fontSize: "9px",
      fontWeight: "800",
      letterSpacing: "2.5px",
      color: "#929da4",
      marginBottom: "5px"
    });

    this.modeElement.textContent =
      "OPERATION";

    this.element.appendChild(
      this.modeElement
    );

    // Mission title
    this.titleElement =
      document.createElement("div");

    Object.assign(this.titleElement.style, {
      fontSize: "18px",
      fontWeight: "900",
      letterSpacing: "1px",
      marginBottom: "10px"
    });

    this.titleElement.textContent =
      "MISSION";

    this.element.appendChild(
      this.titleElement
    );

    // Objective
    this.objectiveElement =
      document.createElement("div");

    Object.assign(
      this.objectiveElement.style,
      {
        fontSize: "13px",
        lineHeight: "1.4",
        color: "#d2d8dc",
        marginBottom: "9px"
      }
    );

    this.objectiveElement.textContent =
      "Awaiting orders";

    this.element.appendChild(
      this.objectiveElement
    );

    // Progress bar
    const progressContainer =
      document.createElement("div");

    Object.assign(
      progressContainer.style,
      {
        width: "100%",
        height: "4px",
        background:
          "rgba(255,255,255,.13)",
        overflow: "hidden",
        marginBottom: "8px"
      }
    );

    this.progressFill =
      document.createElement("div");

    Object.assign(
      this.progressFill.style,
      {
        width: "0%",
        height: "100%",
        background: "#d7dde0",
        transition: "width .15s linear"
      }
    );

    progressContainer.appendChild(
      this.progressFill
    );

    this.element.appendChild(
      progressContainer
    );

    // Progress text
    this.progressElement =
      document.createElement("div");

    Object.assign(
      this.progressElement.style,
      {
        fontSize: "9px",
        letterSpacing: "1.5px",
        color: "#879299",
        marginBottom: "7px"
      }
    );

    this.progressElement.textContent =
      "0%";

    this.element.appendChild(
      this.progressElement
    );

    // Timer
    this.timerElement =
      document.createElement("div");

    Object.assign(
      this.timerElement.style,
      {
        display: "none",
        fontSize: "13px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        color: "#ffffff",
        marginBottom: "6px"
      }
    );

    this.element.appendChild(
      this.timerElement
    );

    // Status
    this.statusElement =
      document.createElement("div");

    Object.assign(
      this.statusElement.style,
      {
        display: "none",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        color: "#aeb7bd"
      }
    );

    this.element.appendChild(
      this.statusElement
    );

    this.root.appendChild(
      this.element
    );
  }

  update(data = {}) {
    if (!data) return;

    if (data.mode !== undefined) {
      this.setMode(data.mode);
    }

    if (data.title !== undefined) {
      this.setTitle(data.title);
    }

    if (data.objective !== undefined) {
      this.setObjective(data.objective);
    }

    if (data.progress !== undefined) {
      this.setProgress(data.progress);
    }

    if (data.timer !== undefined) {
      this.setTimer(data.timer);
    }

    if (data.status !== undefined) {
      this.setStatus(data.status);
    }
  }

  setMode(mode) {
    const labels = {
      RESCUE: "RESCUE OPERATION",
      SURVIVAL: "SURVIVAL OPERATION",
      TDM: "TEAM DEATHMATCH",
      HVT: "HIGH VALUE TARGET"
    };

    this.modeElement.textContent =
      labels[mode] ||
      String(mode || "OPERATION")
        .replaceAll("_", " ")
        .toUpperCase();
  }

  setTitle(title) {
    this.titleElement.textContent =
      String(title || "MISSION");
  }

  setObjective(objective) {
    this.objectiveElement.textContent =
      String(
        objective || "Awaiting orders"
      );
  }

  setProgress(value) {
    let progress = Number(value);

    if (!Number.isFinite(progress)) {
      progress = 0;
    }

    // Accept either 0–1 or 0–100.
    if (progress <= 1) {
      progress *= 100;
    }

    progress = Math.max(
      0,
      Math.min(100, progress)
    );

    this.progressFill.style.width =
      `${progress}%`;

    this.progressElement.textContent =
      `${Math.round(progress)}%`;
  }

  setTimer(seconds) {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      this.timerElement.style.display =
        "none";
      return;
    }

    const totalSeconds = Math.max(
      0,
      Math.floor(Number(seconds))
    );

    if (!Number.isFinite(totalSeconds)) {
      this.timerElement.style.display =
        "none";
      return;
    }

    const minutes =
      Math.floor(totalSeconds / 60);

    const remainingSeconds =
      totalSeconds % 60;

    this.timerElement.textContent =
      `TIME ${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
      ).padStart(2, "0")}`;

    this.timerElement.style.display =
      "block";

    if (totalSeconds <= 10) {
      this.timerElement.style.color =
        "#ffb347";
    } else {
      this.timerElement.style.color =
        "#ffffff";
    }
  }

  setStatus(status) {
    if (!status) {
      this.statusElement.style.display =
        "none";
      return;
    }

    this.statusElement.textContent =
      String(status).toUpperCase();

    this.statusElement.style.display =
      "block";
  }

  setComplete(message = "MISSION COMPLETE") {
    this.statusElement.textContent =
      message.toUpperCase();

    this.statusElement.style.display =
      "block";

    this.statusElement.style.color =
      "#d7dde0";

    this.progressFill.style.width =
      "100%";
  }

  setFailed(message = "MISSION FAILED") {
    this.statusElement.textContent =
      message.toUpperCase();

    this.statusElement.style.display =
      "block";

    this.statusElement.style.color =
      "#ff6666";
  }

  show() {
    this.element.style.display =
      "block";

    this.visible = true;
  }

  hide() {
    this.element.style.display =
      "none";

    this.visible = false;
  }

  reset() {
    this.setMode("RESCUE");
    this.setTitle("MISSION");
    this.setObjective("Awaiting orders");
    this.setProgress(0);
    this.setTimer(null);
    this.setStatus("");
  }

  destroy() {
    if (this.element) {
      this.element.remove();
    }

    this.element = null;
  }
}
