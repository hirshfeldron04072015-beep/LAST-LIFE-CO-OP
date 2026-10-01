export class HUD {
  constructor() {
    this.healthFill =
      document.getElementById(
        "health-fill"
      );

    this.healthNumber =
      document.getElementById(
        "health-number"
      );

    this.weaponName =
      document.getElementById(
        "weapon-name"
      );

    this.ammo =
      document.getElementById("ammo");

    this.reserve =
      document.getElementById("reserve");

    this.missionName =
      document.getElementById(
        "mission-name"
      );

    this.objective =
      document.getElementById(
        "objective"
      );

    this.feed =
      document.getElementById(
        "kill-feed"
      );
  }

  health(value) {
    this.healthFill.style.width =
      `${value}%`;

    this.healthNumber.textContent =
      Math.ceil(value);
  }

  weapon(weapon, ammo, reserve) {
    this.weaponName.textContent =
      weapon.name;

    this.ammo.textContent = ammo;
    this.reserve.textContent = reserve;
  }

  mission(name, objective) {
    this.missionName.textContent =
      name;

    this.objective.textContent =
      objective;
  }

  kill(text) {
    const item =
      document.createElement("div");

    item.className = "kill";
    item.textContent = text;

    this.feed.prepend(item);

    setTimeout(() => {
      item.remove();
    }, 3500);
  }
}
