const SAVE_KEY =
  "lastline_save_v1";

export class SaveSystem {
  constructor(player, progression) {
    this.player = player;
    this.progression =
      progression;
  }

  save() {
    const data = {
      level:
        this.player.level,

      xp:
        this.player.xp,

      keys:
        this.player.keys,

      unlocks:
        [...this.progression.unlocks]
    };

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(data)
    );
  }

  load() {
    try {
      const raw =
        localStorage.getItem(
          SAVE_KEY
        );

      if (!raw) return;

      const data =
        JSON.parse(raw);

      this.player.level =
        Number(data.level) || 1;

      this.player.xp =
        Number(data.xp) || 0;

      this.player.keys =
        Number(data.keys) || 0;

      if (
        Array.isArray(
          data.unlocks
        )
      ) {
        this.progression.unlocks =
          new Set(
            data.unlocks
          );
      }
    } catch {
      console.warn(
        "Could not load save."
      );
    }
  }
}
