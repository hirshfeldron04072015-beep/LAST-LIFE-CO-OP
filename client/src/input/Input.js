export class Input {
  constructor() {
    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;

    this.fire = false;
    this.reload = false;

    window.addEventListener(
      "keydown",
      e => this.key(e, true)
    );

    window.addEventListener(
      "keyup",
      e => this.key(e, false)
    );

    window.addEventListener(
      "mousedown",
      e => {
        if (e.button === 0) {
          this.fire = true;
        }
      }
    );

    window.addEventListener(
      "mouseup",
      e => {
        if (e.button === 0) {
          this.fire = false;
        }
      }
    );
  }

  key(e, down) {
    switch (e.code) {
      case "KeyW":
        this.forward = down;
        break;

      case "KeyS":
        this.backward = down;
        break;

      case "KeyA":
        this.left = down;
        break;

      case "KeyD":
        this.right = down;
        break;

      case "KeyR":
        if (down) {
          this.reload = true;
        }
        break;
    }
  }

  consumeReload() {
    const value = this.reload;
    this.reload = false;
    return value;
  }
}
