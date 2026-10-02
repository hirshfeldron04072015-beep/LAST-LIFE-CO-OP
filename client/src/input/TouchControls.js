export class TouchControls {
  constructor() {
    this.joystick = document.getElementById("movementJoystick");
    this.lookArea = document.getElementById("lookArea");

    this.shootButton = document.getElementById("shootButton");
    this.reloadButton = document.getElementById("reloadButton");
    this.crouchButton = document.getElementById("crouchButton");
    this.sprintButton = document.getElementById("sprintButton");
    this.jumpButton = document.getElementById("jumpButton");

    this.weaponButtons = [
      document.getElementById("weapon1"),
      document.getElementById("weapon2"),
      document.getElementById("weapon3")
    ];

    this.moveX = 0;
    this.moveY = 0;

    this.lookX = 0;
    this.lookY = 0;

    this.shooting = false;
    this.sprinting = false;
    this.crouching = false;

    this.reloadPressed = false;
    this.jumpPressed = false;

    this.weaponPressed = null;

    this.joystickPointer = null;
    this.lookPointer = null;

    this.joystickCenter = {
      x: 0,
      y: 0
    };

    this.maxJoystickDistance = 55;

    this.lastLookX = 0;
    this.lastLookY = 0;

    this.setupJoystick();
    this.setupLook();
    this.setupButtons();
    this.setupWeaponButtons();
  }

  setupJoystick() {
    if (!this.joystick) return;

    this.joystick.addEventListener("pointerdown", (event) => {
      event.preventDefault();

      this.joystickPointer = event.pointerId;

      this.joystick.setPointerCapture(event.pointerId);

      const rect = this.joystick.getBoundingClientRect();

      this.joystickCenter.x =
        rect.left + rect.width / 2;

      this.joystickCenter.y =
        rect.top + rect.height / 2;

      this.updateJoystick(
        event.clientX,
        event.clientY
      );
    });

    this.joystick.addEventListener("pointermove", (event) => {
      if (event.pointerId !== this.joystickPointer) return;

      event.preventDefault();

      this.updateJoystick(
        event.clientX,
        event.clientY
      );
    });

    const releaseJoystick = (event) => {
      if (event.pointerId !== this.joystickPointer) return;

      this.joystickPointer = null;

      this.moveX = 0;
      this.moveY = 0;

      this.resetJoystickVisual();
    };

    this.joystick.addEventListener(
      "pointerup",
      releaseJoystick
    );

    this.joystick.addEventListener(
      "pointercancel",
      releaseJoystick
    );
  }

  updateJoystick(clientX, clientY) {
    let dx =
      clientX - this.joystickCenter.x;

    let dy =
      clientY - this.joystickCenter.y;

    const distance =
      Math.sqrt(dx * dx + dy * dy);

    if (distance > this.maxJoystickDistance) {
      const scale =
        this.maxJoystickDistance / distance;

      dx *= scale;
      dy *= scale;
    }

    this.moveX =
      dx / this.maxJoystickDistance;

    this.moveY =
      dy / this.maxJoystickDistance;

    this.moveX =
      Math.max(-1, Math.min(1, this.moveX));

    this.moveY =
      Math.max(-1, Math.min(1, this.moveY));

    this.updateJoystickVisual(dx, dy);
  }

  updateJoystickVisual(dx, dy) {
    const knob =
      this.joystick.querySelector(".joystickKnob");

    if (!knob) return;

    knob.style.transform =
      `translate(${dx}px, ${dy}px)`;
  }

  resetJoystickVisual() {
    const knob =
      this.joystick?.querySelector(".joystickKnob");

    if (!knob) return;

    knob.style.transform =
      "translate(0px, 0px)";
  }

  setupLook() {
    if (!this.lookArea) return;

    this.lookArea.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();

        this.lookPointer = event.pointerId;

        this.lookArea.setPointerCapture(
          event.pointerId
        );

        this.lastLookX = event.clientX;
        this.lastLookY = event.clientY;
      }
    );

    this.lookArea.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerId !== this.lookPointer) {
          return;
        }

        event.preventDefault();

        const dx =
          event.clientX - this.lastLookX;

        const dy =
          event.clientY - this.lastLookY;

        this.lookX += dx;
        this.lookY += dy;

        this.lastLookX = event.clientX;
        this.lastLookY = event.clientY;
      }
    );

    const releaseLook = (event) => {
      if (event.pointerId !== this.lookPointer) {
        return;
      }

      this.lookPointer = null;
    };

    this.lookArea.addEventListener(
      "pointerup",
      releaseLook
    );

    this.lookArea.addEventListener(
      "pointercancel",
      releaseLook
    );
  }

  setupButtons() {
    this.bindHoldButton(
      this.shootButton,
      () => {
        this.shooting = true;
      },
      () => {
        this.shooting = false;
      }
    );

    this.bindHoldButton(
      this.sprintButton,
      () => {
        this.sprinting = true;
      },
      () => {
        this.sprinting = false;
      }
    );

    this.bindHoldButton(
      this.crouchButton,
      () => {
        this.crouching = true;
      },
      () => {
        this.crouching = false;
      }
    );

    this.bindPressButton(
      this.reloadButton,
      () => {
        this.reloadPressed = true;
      }
    );

    this.bindPressButton(
      this.jumpButton,
      () => {
        this.jumpPressed = true;
      }
    );
  }

  bindHoldButton(button, onStart, onEnd) {
    if (!button) return;

    button.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();

        button.setPointerCapture(
          event.pointerId
        );

        onStart();
      }
    );

    const end = (event) => {
      event.preventDefault();
      onEnd();
    };

    button.addEventListener(
      "pointerup",
      end
    );

    button.addEventListener(
      "pointercancel",
      end
    );
  }

  bindPressButton(button, callback) {
    if (!button) return;

    button.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();

        callback();
      }
    );
  }

  setupWeaponButtons() {
    this.weaponButtons.forEach(
      (button, index) => {
        if (!button) return;

        button.addEventListener(
          "pointerdown",
          (event) => {
            event.preventDefault();

            this.weaponPressed =
              index;
          }
        );
      }
    );
  }

  update() {
    const controls = {
      moveX: this.moveX,
      moveY: this.moveY,

      lookX: this.lookX,
      lookY: this.lookY,

      shooting: this.shooting,
      sprinting: this.sprinting,
      crouching: this.crouching,

      reload: this.reloadPressed,
      jump: this.jumpPressed,

      weapon: this.weaponPressed
    };

    /*
     * Look input is consumed once per frame.
     * This prevents the camera from continuing
     * to rotate after the finger stops.
     */
    this.lookX = 0;
    this.lookY = 0;

    /*
     * These are also one-frame actions.
     */
    this.reloadPressed = false;
    this.jumpPressed = false;
    this.weaponPressed = null;

    return controls;
  }

  reset() {
    this.moveX = 0;
    this.moveY = 0;

    this.lookX = 0;
    this.lookY = 0;

    this.shooting = false;
    this.sprinting = false;
    this.crouching = false;

    this.reloadPressed = false;
    this.jumpPressed = false;

    this.weaponPressed = null;

    this.joystickPointer = null;
    this.lookPointer = null;

    this.resetJoystickVisual();
  }
}
