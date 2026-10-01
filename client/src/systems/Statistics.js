const KEY =
  "lastline_stats_v1";

export class Statistics {
  constructor() {
    this.data = {
      kills: 0,
      deaths: 0,
      headshots: 0,
      missions: 0,
      victories: 0,
      shots: 0
    };

    this.load();
  }

  kill(headshot = false) {
    this.data.kills++;

    if (headshot) {
      this.data.headshots++;
    }

    this.save();
  }

  death() {
    this.data.deaths++;
    this.save();
  }

  shot() {
    this.data.shots++;
  }

  missionComplete() {
    this.data.missions++;
    this.save();
  }

  victory() {
    this.data.victories++;
    this.save();
  }

  save() {
    localStorage.setItem(
      KEY,
      JSON.stringify(this.data)
    );
  }

  load() {
    try {
      const raw =
        localStorage.getItem(
          KEY
        );

      if (raw) {
        Object.assign(
          this.data,
          JSON.parse(raw)
        );
      }
    } catch {}
  }
}
