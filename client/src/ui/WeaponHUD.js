export class WeaponHUD {
  constructor(options = {}) {
    this.root = options.root || document.body;

    this.element = null;
    this.weaponName = null;
    this.ammoCurrent = null;
    this.ammoReserve = null;
    this.fireMode = null;
    this.reloadText = null;
    this.aimText = null;

    this.visible = true;
    this.build();
  }

  build() {
    this.element = document.createElement("div");
    this.element.id = "weapon-hud";

    Object.assign(this.element.style, {
      position: "fixed",
      right: "22px",
      bottom: "22px",
      zIndex: "120",
      minWidth: "190px",
      padding: "12px 14px",
      boxSizing: "border-box",
      color: "#ffffff",
      fontFamily: "Arial, Helvetica, sans-serif",
      pointerEvents: "none",
      userSelect: "none",
      textShadow: "0 2px 5px rgba(0,0,0,.9)"
    });

    // Weapon name
    this.weaponName = document.createElement("div");

    Object.assign(this.weaponName.style, {
      fontSize: "12px",
      fontWeight: "800",
      letterSpacing: "2px",
      color: "#c9d0d5",
      marginBottom: "4px",
      textAlign: "right"
    });

    this.weaponName.textContent = "CARBINE";

    this.element.appendChild(this.weaponName);

    // Ammo row
    const ammoRow = document.createElement("div");

    Object.assign(ammoRow.style, {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "flex-end",
      gap: "7px"
    });

    this.ammoCurrent = document.createElement("span");

    Object.assign(this.ammoCurrent.style, {
      fontSize: "36px",
      lineHeight: "1",
      fontWeight: "900",
      letterSpacing: "1px"
    });

    this.ammoCurrent.textContent = "30";

    this.ammoReserve = document.createElement("span");

    Object.assign(this.ammoReserve.style, {
      fontSize: "17px",
      color: "#aab2b8",
      fontWeight: "700"
    });

    this.ammoReserve.textContent = "/ 150";

    ammoRow.appendChild(this.ammoCurrent);
    ammoRow.appendChild(this.ammoReserve);

    this.element.appendChild(ammoRow);

    // Fire mode
    this.fireMode = document.createElement("div");

    Object.assign(this.fireMode.style, {
      marginTop: "5px",
      fontSize: "9px",
      letterSpacing: "2px",
      color: "#8c979e",
      textAlign: "right"
    });

    this.fireMode.textContent = "AUTO";

    this.element.appendChild(this.fireMode);

    // Aim indicator
    this.aimText = document.createElement("div");

    Object.assign(this.aimText.style, {
      display: "none",
      marginTop: "6px",
      fontSize: "10px",
      fontWeight: "800",
      letterSpacing: "2px",
      textAlign: "right",
      color: "#d7dde0"
    });

    this.aimText.textContent = "AIMING";

    this.element.appendChild(this.aimText);

    // Reload indicator
    this.reloadText = document.createElement("div");

    Object.assign(this.reloadText.style, {
      display: "none",
      marginTop: "7px",
      fontSize: "11px",
      fontWeight: "900",
      letterSpacing: "2px",
      textAlign: "right",
      color: "#ffffff"
    });

    this.reloadText.textContent = "RELOADING";

    this.element.appendChild(this.reloadText);

    this.root.appendChild(this.element);
  }

  update(data = {}) {
    if (!data) return;

    if (data.weaponName !== undefined) {
      this.setWeapon(data.weaponName);
    }

    if (
      data.currentAmmo !== undefined ||
      data.reserveAmmo !== undefined
    ) {
      this.setAmmo(
        data.currentAmmo,
        data.reserveAmmo
      );
    }

    if (data.fireMode !== undefined) {
      this.setFireMode(data.fireMode);
    }

    if (data.reloading !== undefined) {
      this.setReloading(data.reloading);
    }

    if (data.aiming !== undefined) {
      this.setAiming(data.aiming);
    }
  }

  setWeapon(name) {
    this.weaponName.textContent =
      String(name || "UNKNOWN").toUpperCase();
  }

  setAmmo(current, reserve) {
    if (current !== undefined) {
      this.ammoCurrent.textContent =
        String(Math.max(0, current));
    }

    if (reserve !== undefined) {
      this.ammoReserve.textContent =
        `/ ${Math.max(0, reserve)}`;
    }

    this.updateAmmoWarning(current);
  }

  updateAmmoWarning(current) {
    if (current === undefined) return;

    const ammo = Number(current);

    if (ammo <= 0) {
      this.ammoCurrent.style.color = "#ff5555";
    } else if (ammo <= 5) {
      this.ammoCurrent.style.color = "#ffb347";
    } else {
      this.ammoCurrent.style.color = "#ffffff";
    }
  }

  setFireMode(mode) {
    this.fireMode.textContent =
      String(mode || "AUTO").toUpperCase();
  }

  setReloading(value) {
    const active = Boolean(value);

    this.reloadText.style.display =
      active ? "block" : "none";
  }

  setAiming(value) {
    const active = Boolean(value);

    this.aimText.style.display =
      active ? "block" : "none";
  }

  show() {
    this.element.style.display = "block";
    this.visible = true;
  }

  hide() {
    this.element.style.display = "none";
    this.visible = false;
  }

  isVisible() {
    return this.visible;
  }

  reset() {
    this.setWeapon("CARBINE");
    this.setAmmo(30, 150);
    this.setFireMode("AUTO");
    this.setReloading(false);
    this.setAiming(false);
  }

  destroy() {
    if (this.element) {
      this.element.remove();
    }

    this.element = null;
  }
}
