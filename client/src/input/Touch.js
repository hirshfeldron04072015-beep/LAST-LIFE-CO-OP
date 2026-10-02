export class Touch {
  constructor(input) {
    this.input = input;

    this.move = { x: 0, y: 0 };
    this.look = { x: 0, y: 0 };
    this.firing = false;

    this.bind();
  }

  bind() {
    const moveStick = document.getElementById("moveStick");
    const lookStick = document.getElementById("lookStick");
    const fireBtn = document.getElementById("fireBtn");
    const reloadBtn = document.getElementById("reloadBtn");

    if (moveStick) {
      this.attachStick(
        moveStick,
        (x, y) => {
          this.move.x = THREE_CLAMP(x / 55);
          this.move.y = THREE_CLAMP(y / 55);
        },
        () => {
          this.move.x = 0;
          this.move.y = 0;
        }
      );
    }

    if (lookStick) {
      this.attachStick(
        lookStick,
        (x, y) => {
          this.look.x = THREE_CLAMP(x / 55);
          this.look.y = THREE_CLAMP(y / 55);
        },
        () => {
          this.look.x = 0;
          this.look.y = 0;
        }
      );
    }

    if (fireBtn) {
      fireBtn.addEventListener("pointerdown", () => {
        this.firing = true;

        if (this.input) {
          this.input.mouse.down = true;
        }
      });

      const stopFire = () => {
        this.firing = false;

        if (this.input) {
          this.input.mouse.down = false;
        }
      };

      fireBtn.addEventListener("pointerup", stopFire);
      fireBtn.addEventListener("pointercancel", stopFire);
      fireBtn.addEventListener("pointerleave", stopFire);
    }

    if (reloadBtn) {
      reloadBtn.addEventListener("pointerdown", () => {
        if (this.input && typeof this.input.reload === "function") {
          this.input.reload();
        }

        window.dispatchEvent(
          new KeyboardEvent("keydown", { code: "KeyR" })
        );
      });
    }
  }

  attachStick(element, onMove, onEnd) {
    let active = false;
    let centerX = 0;
    let centerY = 0;

    element.addEventListener("pointerdown", event => {
      active = true;

      try {
        element.setPointerCapture(event.pointerId);
      } catch {}

      const rect = element.getBoundingClientRect();

      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;

      onMove(
        event.clientX - centerX,
        event.clientY - centerY
      );
    });

    element.addEventListener("pointermove", event => {
      if (!active) return;

      onMove(
        event.clientX - centerX,
        event.clientY - centerY
      );
    });

    const end = () => {
      if (!active) return;

      active = false;
      onEnd();
    };

    element.addEventListener("pointerup", end);
    element.addEventListener("pointercancel", end);
  }
}

function THREE_CLAMP(value) {
  return Math.max(-1, Math.min(1, value));
}
