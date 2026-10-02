export class MainMenu {
  constructor(options = {}) {
    this.root = options.root || document;
    this.onDeploy = options.onDeploy || (() => {});
    this.onModeChange = options.onModeChange || (() => {});
    this.onSettings = options.onSettings || (() => {});

    this.element = null;
    this.callsignInput = null;
    this.modeSelect = null;
    this.deployButton = null;

    this.visible = true;

    this.build();
  }

  build() {
    this.element = document.createElement("div");

    this.element.id = "game-main-menu";

    Object.assign(this.element.style, {
      position: "fixed",
      inset: "0",
      zIndex: "1000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "radial-gradient(circle at center, rgba(35,42,48,.82), rgba(5,7,9,.98))",
      color: "#ffffff",
      fontFamily:
        "Arial, Helvetica, sans-serif",
      userSelect: "none",
      WebkitUserSelect: "none"
    });

    const panel =
      document.createElement("div");

    Object.assign(panel.style, {
      width: "min(92vw, 520px)",
      padding: "32px",
      boxSizing: "border-box",
      background:
        "rgba(12,16,20,.94)",
      border:
        "1px solid rgba(255,255,255,.14)",
      boxShadow:
        "0 25px 80px rgba(0,0,0,.65)",
      backdropFilter: "blur(12px)"
    });

    const title =
      document.createElement("div");

    title.textContent = "LAST LINE";

    Object.assign(title.style, {
      fontSize: "clamp(38px, 8vw, 64px)",
      fontWeight: "900",
      letterSpacing: "8px",
      lineHeight: "1",
      marginBottom: "8px"
    });

    panel.appendChild(title);

    const subtitle =
      document.createElement("div");

    subtitle.textContent =
      "TACTICAL OPERATIONS";

    Object.assign(subtitle.style, {
      color: "#aab4bc",
      fontSize: "13px",
      letterSpacing: "4px",
      marginBottom: "34px"
    });

    panel.appendChild(subtitle);

    // CALLSIGN
    const callsignLabel =
      document.createElement("label");

    callsignLabel.textContent =
      "CALLSIGN";

    Object.assign(callsignLabel.style, {
      display: "block",
      color: "#8f9ba3",
      fontSize: "11px",
      letterSpacing: "2px",
      marginBottom: "8px"
    });

    panel.appendChild(callsignLabel);

    this.callsignInput =
      document.createElement("input");

    this.callsignInput.type = "text";
    this.callsignInput.maxLength = 16;
    this.callsignInput.value =
      localStorage.getItem(
        "lastline_callsign"
      ) || "PHANTOM";

    Object.assign(
      this.callsignInput.style,
      {
        width: "100%",
        height: "48px",
        boxSizing: "border-box",
        padding: "0 14px",
        marginBottom: "22px",
        background: "#171d22",
        border:
          "1px solid rgba(255,255,255,.14)",
        color: "#fff",
        fontSize: "16px",
        outline: "none"
      }
    );

    panel.appendChild(
      this.callsignInput
    );

    // OPERATION
    const modeLabel =
      document.createElement("label");

    modeLabel.textContent =
      "OPERATION";

    Object.assign(modeLabel.style, {
      display: "block",
      color: "#8f9ba3",
      fontSize: "11px",
      letterSpacing: "2px",
      marginBottom: "8px"
    });

    panel.appendChild(modeLabel);

    this.modeSelect =
      document.createElement("select");

    const modes = [
      ["RESCUE", "Rescue Hostage"],
      ["SURVIVAL", "Survival"],
      ["TDM", "Team Deathmatch"],
      ["HVT", "High Value Target"]
    ];

    modes.forEach(
      ([value, label]) => {
        const option =
          document.createElement("option");

        option.value = value;
        option.textContent = label;

        this.modeSelect.appendChild(
          option
        );
      }
    );

    Object.assign(
      this.modeSelect.style,
      {
        width: "100%",
        height: "48px",
        boxSizing: "border-box",
        padding: "0 12px",
        marginBottom: "24px",
        background: "#171d22",
        border:
          "1px solid rgba(255,255,255,.14)",
        color: "#fff",
        fontSize: "15px",
        outline: "none"
      }
    );

    panel.appendChild(
      this.modeSelect
    );

    // DEPLOY
    this.deployButton =
      document.createElement("button");

    this.deployButton.textContent =
      "DEPLOY";

    Object.assign(
      this.deployButton.style,
      {
        width: "100%",
        height: "58px",
        border: "0",
        background: "#d8dde0",
        color: "#101316",
        fontSize: "16px",
        fontWeight: "900",
        letterSpacing: "3px",
        cursor: "pointer",
        touchAction: "manipulation"
      }
    );

    panel.appendChild(
      this.deployButton
    );

    // SETTINGS
    const settingsButton =
      document.createElement("button");

    settingsButton.textContent =
      "SETTINGS";

    Object.assign(
      settingsButton.style,
      {
        display: "block",
        width: "100%",
        marginTop: "12px",
        padding: "12px",
        border: "0",
        background: "transparent",
        color: "#87929a",
        fontSize: "11px",
        letterSpacing: "2px",
        cursor: "pointer"
      }
    );

    panel.appendChild(
      settingsButton
    );

    // Status text
    const status =
      document.createElement("div");

    status.textContent =
      "NO AUDIO • TOUCH / MOUSE CONTROLS";

    Object.assign(status.style, {
      marginTop: "22px",
      textAlign: "center",
      color: "#59636a",
      fontSize: "9px",
      letterSpacing: "1.5px"
    });

    panel.appendChild(status);

    this.element.appendChild(panel);

    this.root.body.appendChild(
      this.element
    );

    // EVENTS

    this.deployButton.addEventListener(
      "click",
      () => {
        this.deploy();
      }
    );

    this.deployButton.addEventListener(
      "touchend",
      event => {
        event.preventDefault();
        this.deploy();
      },
      { passive: false }
    );

    this.modeSelect.addEventListener(
      "change",
      () => {
        this.onModeChange(
          this.modeSelect.value
        );
      }
    );

    settingsButton.addEventListener(
      "click",
      () => {
        this.onSettings();
      }
    );

    this.callsignInput.addEventListener(
      "change",
      () => {
        this.saveCallsign();
      }
    );

    this.callsignInput.addEventListener(
      "keydown",
      event => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.deploy();
        }
      }
    );
  }

  deploy() {
    this.saveCallsign();

    const callsign =
      this.getCallsign();

    const mode =
      this.getMode();

    this.hide();

    this.onDeploy({
      callsign,
      mode
    });
  }

  saveCallsign() {
    const value =
      this.getCallsign();

    localStorage.setItem(
      "lastline_callsign",
      value
    );
  }

  getCallsign() {
    const value =
      this.callsignInput.value
        .trim()
        .toUpperCase();

    return value || "PHANTOM";
  }

  getMode() {
    return this.modeSelect.value;
  }

  setMode(mode) {
    const validModes = [
      "RESCUE",
      "SURVIVAL",
      "TDM",
      "HVT"
    ];

    if (
      validModes.includes(mode)
    ) {
      this.modeSelect.value = mode;
    }
  }

  setCallsign(callsign) {
    if (!callsign) return;

    this.callsignInput.value =
      String(callsign)
        .slice(0, 16)
        .toUpperCase();
  }

  show() {
    if (!this.element) return;

    this.element.style.display =
      "flex";

    this.visible = true;
  }

  hide() {
    if (!this.element) return;

    this.element.style.display =
      "none";

    this.visible = false;
  }

  isVisible() {
    return this.visible;
  }

  destroy() {
    if (this.element) {
      this.element.remove();
    }

    this.element = null;
  }
}
