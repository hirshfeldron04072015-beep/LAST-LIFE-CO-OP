export class KeyboardControls {
  constructor() {
    this.keys = new Set();

    this.lookX = 0;
    this.lookY = 0;

    this.shooting = false;
    this.sprinting = false;
    this.crouching = false;

    this.reloadPressed = false;
    this.jumpPressed = false;

    this.weaponPressed = null;

    this.enabled = true;

    this.setupKeyboard();
    this.setupMouse();
  }

  setupKeyboard() {
    window.addEventListener("keydown", (event) => {
      if (!this.enabled) return;

      this.keys.add(
        event.code
      );

      /*
       * Prevent browser scrolling with
       * movement keys and space.
       */
      if (
        [
          "Space",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight"
        ].includes(event.code)
      ) {
        event.preventDefault();
      }

      if (
        event.code === "KeyR" &&
        !event.repeat
      ) {
        this.reloadPressed = true;
      }

      if (
        event.code === "Space" &&
        !event.repeat
      ) {
        this.jumpPressed = true;
      }

      if (
        event.code === "Digit1" &&
        !event.repeat
      ) {
        this.weaponPressed = 0;
      }

      if (
        event.code === "Digit2" &&
        !event.repeat
      ) {
        this.weaponPressed = 1;
      }

      if (
        event.code === "Digit3" &&
        !event.repeat
      ) {
        this.weaponPressed = 2;
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(
        event.code
      );
    });

    window.addEventListener("blur", () => {
      this.keys.clear();

      this.shooting = false;
    });
  }

  setupMouse() {
    /*
     * Desktop mouse look.
     *
     * Touch devices will use TouchControls.js
     * instead.
     */
    window.addEventListener(
      "mousedown",
      (event) => {
        if (!this.enabled) return;

        if (event.button === 0) {
          this.shooting = true;
        }
      }
    );

    window.addEventListener(
      "mouseup",
      (event) => {
        if (event.button === 0) {
          this.shooting = false;
        }
      }
    );

    window.addEventListener(
      "mousemove",
      (event) => {
        if (!this.enabled) return;

        /*
         * Only use mouse movement while
         * the left mouse button is not
         * being used for UI interaction.
         */
        this.lookX +=
          event.movementX || 0;

        this.lookY +=
          event.movementY || 0;
      }
    );
  }

  update() {
    if (!this.enabled) {
      return this.emptyInput();
    }

    let moveX = 0;
    let moveY = 0;

    /*
     * A / D
     */
    if (
      this.keys.has("KeyA") ||
      this.keys.has("ArrowLeft")
    ) {
      moveX -= 1;
    }

    if (
      this.keys.has("KeyD") ||
      this.keys.has("ArrowRight")
    ) {
      moveX += 1;
    }

    /*
     * W / S
     */
    if (
      this.keys.has("KeyW") ||
      this.keys.has("ArrowUp")
    ) {
      moveY -= 1;
    }

    if (
      this.keys.has("KeyS") ||
      this.keys.has("ArrowDown")
    ) {
      moveY += 1;
    }

    /*
     * Normalize diagonal movement.
     */
    const magnitude =
      Math.sqrt(
        moveX * moveX +
        moveY * moveY
      );

    if (magnitude > 1) {
      moveX /= magnitude;
      moveY /= magnitude;
    }

    this.sprinting =
      this.keys.has("ShiftLeft") ||
      this.keys.has("ShiftRight");

    this.crouching =
      this.keys.has("ControlLeft") ||
      this.keys.has("ControlRight") ||
      this.keys.has("KeyC");

    const result = {
      moveX,
      moveY,

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
     * Look and button actions are consumed
     * once per frame.
     */
    this.lookX = 0;
    this.lookY = 0;

    this.reloadPressed = false;
    this.jumpPressed = false;

    this.weaponPressed = null;

    return result;
  }

  emptyInput() {
    return {
      moveX: 0,
      moveY: 0,

      lookX: 0,
      lookY: 0,

      shooting: false,

      sprinting: false,

      crouching: false,

      reload: false,

      jump: false,

      weapon: null
    };
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;

    if (!this.enabled) {
      this.reset();
    }
  }

  reset() {
    this.keys.clear();

    this.lookX = 0;
    this.lookY = 0;

    this.shooting = false;
    this.sprinting = false;
    this.crouching = false;

    this.reloadPressed = false;
    this.jumpPressed = false;

    this.weaponPressed = null;
  }

  isKeyDown(code) {
    return this.keys.has(code);
  }
}
