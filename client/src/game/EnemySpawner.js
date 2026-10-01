export class EnemySpawner {
  constructor(ai) {
    this.ai = ai;
    this.wave = 0;
    this.timer = 0;
    this.interval = 12;
  }

  start() {
    this.wave = 0;
    this.timer = 0;
    this.spawnWave();
  }

  update(dt) {
    this.timer += dt;

    if (this.timer >= this.interval) {
      this.timer = 0;
      this.spawnWave();
    }
  }

  spawnWave() {
    this.wave++;

    const count = Math.min(
      4 + this.wave * 2,
      24
    );

    this.ai.spawn(count);
  }
}
