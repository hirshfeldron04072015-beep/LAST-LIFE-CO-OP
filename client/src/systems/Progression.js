export class Progression {
  constructor() {
    this.xp = Number(
      localStorage.getItem("lastline_xp") || 0
    );

    this.level = Number(
      localStorage.getItem("lastline_level") || 1
    );

    this.kills = Number(
      localStorage.getItem("lastline_kills") || 0
    );
  }

  addXP(amount) {
    this.xp += amount;

    while (
      this.xp >= this.level * 1000
    ) {
      this.xp -= this.level * 1000;
      this.level++;
    }

    this.save();
  }

  addKill() {
    this.kills++;
    this.addXP(100);
  }

  save() {
    localStorage.setItem(
      "lastline_xp",
      this.xp
    );

    localStorage.setItem(
      "lastline_level",
      this.level
    );

    localStorage.setItem(
      "lastline_kills",
      this.kills
    );
  }
}
