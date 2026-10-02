import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { TouchControls } from "./input/TouchControls.js";
import { KeyboardControls } from "./input/KeyboardControls.js";

import { Player } from "./player/Player.js";

import { WeaponManager } from "./weapons/WeaponManager.js";

import { EnemySpawner } from "./enemies/EnemySpawner.js";

import { World } from "./world/World.js";
import { Environment } from "./world/Environment.js";
import { Collision } from "./world/Collision.js";
import { CoverSystem } from "./world/CoverSystem.js";

import { MissionManager } from "./missions/MissionManager.js";

import { HealthSystem } from "./systems/HealthSystem.js";
import { DamageSystem } from "./systems/DamageSystem.js";
import { Progression } from "./systems/Progression.js";
import { SaveSystem } from "./systems/SaveSystem.js";
import { Statistics } from "./systems/Statistics.js";

import { AnimationManager } from "./animation/AnimationManager.js";

import { MuzzleFlash } from "./effects/MuzzleFlash.js";
import { HitEffects } from "./effects/HitEffects.js";
import { BloodEffects } from "./effects/BloodEffects.js";
import { Explosion } from "./effects/Explosion.js";
import { Smoke } from "./effects/Smoke.js";

import { HUD } from "./ui/HUD.js";
import { MainMenu } from "./ui/MainMenu.js";
import { MissionResult } from "./ui/MissionResult.js";
import { WeaponHUD } from "./ui/WeaponHUD.js";
import { MissionHUD } from "./ui/MissionHUD.js";
import { LevelHUD } from "./ui/LevelHUD.js";


/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

export const TAU = Math.PI * 2;

export const clamp = (v, min, max) =>
  Math.max(min, Math.min(max, v));

export const lerp = (a, b, t) =>
  a + (b - a) * t;

export const rand = (min, max) =>
  min + Math.random() * (max - min);

export const choice = arr =>
  arr[Math.floor(Math.random() * arr.length)];

export function id(prefix = "id") {
  return `${prefix}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function weightedChoice(items) {
  const total = items.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  let r = Math.random() * total;

  for (const item of items) {
    r -= item.weight;

    if (r <= 0) {
      return item.value;
    }
  }

  return items[items.length - 1].value;
}

export function distance2D(a, b) {
  return Math.hypot(
    a.x - b.x,
    a.z - b.z
  );
}

export function formatTime(seconds) {
  seconds = Math.max(
    0,
    Math.floor(seconds)
  );

  return `${String(
    Math.floor(seconds / 60)
  ).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;
}


/* =========================================================
   CORE
   ========================================================= */

export class Core {

  constructor({
    scene,
    camera,
    renderer
  }) {

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.started = false;
    this.paused = false;
    this.destroyed = false;

    this.callsign = "PHANTOM";
    this.mode = "RESCUE";

    this.time = 0;

    this.enemyCount = 0;
    this.kills = 0;
    this.deaths = 0;

    this.lastShotPosition =
      new THREE.Vector3();

    this.tmpVector =
      new THREE.Vector3();

    this.tmpDirection =
      new THREE.Vector3();

    this.systems = {};
    this.ui = {};

    this.setupSystems();
    this.setupUI();
    this.setupCallbacks();
  }


  /* =======================================================
     SYSTEM CREATION
     ======================================================= */

  setupSystems() {

    /*
     * WORLD
     */

    this.environment =
      new Environment(this.scene);

    this.world =
      new World(this.scene);


    /*
     * COLLISION / COVER
     */

    this.collision =
      new Collision(this.scene);

    this.cover =
      new CoverSystem(
        this.scene,
        this.collision
      );


    /*
     * TOUCH INPUT
     */

    this.touchControls =
      new TouchControls();


    /*
     * DESKTOP INPUT
     */

    this.keyboardControls =
      new KeyboardControls();


    /*
     * PLAYER
     */

    this.player =
      new Player(
        this.scene,
        this.camera,
        this.touchControls
      );


    /*
     * WEAPONS
     */

    this.weaponManager =
      new WeaponManager(
        this.scene,
        this.camera,
        this.player
      );


    /*
     * HEALTH
     */

    this.health =
      new HealthSystem({
        maxHealth: 100,
        maxArmor: 50
      });


    /*
     * DAMAGE
     */

    this.damage =
      new DamageSystem({
        healthSystem: this.health
      });


    /*
     * ENEMIES
     */

    this.enemySpawner =
      new EnemySpawner(
        this.scene,
        {
          player: this.player,
          collision: this.collision
        }
      );


    /*
     * MISSIONS
     */

    this.missions =
      new MissionManager({
        scene: this.scene,
        player: this.player,
        enemySpawner: this.enemySpawner,
        world: this.world
      });


    /*
     * PROGRESSION
     */

    this.progression =
      new Progression();


    /*
     * SAVE
     */

    this.save =
      new SaveSystem();


    /*
     * STATISTICS
     */

    this.statistics =
      new Statistics();


    /*
     * ANIMATION
     */

    this.animations =
      new AnimationManager();


    /*
     * EFFECTS
     */

    this.muzzleFlash =
      new MuzzleFlash(this.scene);

    this.hitEffects =
      new HitEffects(this.scene);

    this.bloodEffects =
      new BloodEffects(this.scene);

    this.explosion =
      new Explosion(this.scene);

    this.smoke =
      new Smoke(this.scene);


    /*
     * SYSTEM REGISTRY
     */

    this.systems = {
      environment: this.environment,
      world: this.world,
      collision: this.collision,
      cover: this.cover,
      player: this.player,
      weapons: this.weaponManager,
      enemies: this.enemySpawner,
      missions: this.missions,
      health: this.health,
      damage: this.damage,
      progression: this.progression,
      save: this.save,
      statistics: this.statistics,
      animations: this.animations,
      muzzleFlash: this.muzzleFlash,
      hitEffects: this.hitEffects,
      bloodEffects: this.bloodEffects,
      explosion: this.explosion,
      smoke: this.smoke
    };
  }


  /* =======================================================
     UI
     ======================================================= */

  setupUI() {

    /*
     * Existing HUD
     *
     * We keep your existing HUD.js.
     */

    try {
      this.ui.hud =
        new HUD();
    } catch {
      this.ui.hud = null;
    }


    /*
     * Weapon HUD
     */

    this.ui.weapon =
      new WeaponHUD();


    /*
     * Mission HUD
     */

    this.ui.mission =
      new MissionHUD();


    /*
     * Level HUD
     */

    this.ui.level =
      new LevelHUD();


    /*
     * Mission Result
     *
     * Your existing MissionResult.js
     * remains untouched.
     */

    try {
      this.ui.result =
        new MissionResult();
    } catch {
      this.ui.result = null;
    }


    /*
     * Main Menu
     *
     * main.js already owns the original
     * deploy menu, so we don't display
     * this second menu automatically.
     */

    this.ui.mainMenu = null;
  }


  /* =======================================================
     CALLBACKS
     ======================================================= */

  setupCallbacks() {

    /*
     * PLAYER DAMAGE
     */

    if (this.player) {

      this.player.onDamage =
        (amount, health, armor) => {

          this.handlePlayerDamage(
            amount,
            health,
            armor
          );
        };

      this.player.onDeath =
        () => {
          this.handlePlayerDeath();
        };
    }


    /*
     * ENEMY EVENTS
     */

    if (this.enemySpawner) {

      this.enemySpawner.onKill =
        (enemy) => {
          this.handleEnemyKill(enemy);
        };

      this.enemySpawner.onEnemyAttack =
        (enemy, damage) => {
          this.handleEnemyAttack(
            enemy,
            damage
          );
        };
    }


    /*
     * WEAPON EVENTS
     */

    if (this.weaponManager) {

      this.weaponManager.onShoot =
        (weapon, position, direction) => {

          this.handleWeaponShot(
            weapon,
            position,
            direction
          );
        };

      this.weaponManager.onHit =
        (hit) => {
          this.handleWeaponHit(hit);
        };

      this.weaponManager.onReload =
        () => {
          this.showReload();
        };
    }
  }


  /* =======================================================
     START
     ======================================================= */

  start(options = {}) {

    if (this.destroyed) {
      return;
    }

    this.callsign =
      options.callsign ||
      "PHANTOM";

    this.mode =
      options.mode ||
      "RESCUE";

    this.started = true;
    this.paused = false;
    this.time = 0;

    this.kills = 0;
    this.deaths = 0;


    /*
     * Enable input
     */

    if (this.touchControls?.setEnabled) {
      this.touchControls.setEnabled(true);
    }

    if (this.keyboardControls?.setEnabled) {
      this.keyboardControls.setEnabled(true);
    }


    /*
     * Refresh world collision
     */

    if (this.collision?.refresh) {
      this.collision.refresh();
    }


    /*
     * Reset player
     */

    if (this.player?.reset) {
      this.player.reset();
    }


    /*
     * Reset weapons
     */

    if (this.weaponManager?.reset) {
      this.weaponManager.reset();
    }


    /*
     * Reset enemies
     */

    if (this.enemySpawner?.reset) {
      this.enemySpawner.reset();
    }


    /*
     * Reset effects
     */

    this.clearEffects();


    /*
     * Start mission
     */

    this.startMission(
      this.mode
    );


    /*
     * UI
     */

    this.showGameUI();

    this.updateHUD();


    /*
     * Focus
     */

    this.focusGame();
  }


  /* =======================================================
     MISSION START
     ======================================================= */

  startMission(mode) {

    if (!this.missions) {
      return;
    }

    const missionMode =
      String(mode || "RESCUE")
        .toUpperCase();

    this.mode =
      missionMode;

    try {

      if (
        this.missions.start
      ) {

        this.missions.start(
          missionMode
        );

      } else if (
        this.missions.startMission
      ) {

        this.missions.startMission(
          missionMode
        );
      }

    } catch (error) {

      console.warn(
        "Mission start failed:",
        error
      );

    }
  }


  /* =======================================================
     UPDATE
     ======================================================= */

  update(dt) {

    if (
      !this.started ||
      this.paused ||
      this.destroyed
    ) {
      return;
    }

    dt = Math.min(
      Math.max(dt, 0),
      0.05
    );

    this.time += dt;


    /*
     * INPUT
     */

    const keyboard =
      this.keyboardControls?.update
        ? this.keyboardControls.update()
        : null;


    /*
     * PLAYER
     */

    if (this.player?.update) {
      this.player.update(dt);
    }


    /*
     * WEAPONS
     */

    if (this.weaponManager?.update) {
      this.weaponManager.update(dt);
    }


    /*
     * ENEMIES
     */

    if (this.enemySpawner?.update) {

      this.enemySpawner.update(
        dt,
        this.player
      );
    }


    /*
     * MISSIONS
     */

    if (this.missions?.update) {

      this.missions.update(
        dt
      );
    }


    /*
     * WORLD
     */

    if (this.environment?.update) {
      this.environment.update(dt);
    }


    /*
     * ANIMATIONS
     */

    if (this.animations?.update) {
      this.animations.update(dt);
    }


    /*
     * EFFECTS
     */

    this.muzzleFlash?.update(dt);

    this.hitEffects?.update(dt);

    this.bloodEffects?.update(dt);

    this.explosion?.update(dt);

    this.smoke?.update(dt);


    /*
     * KEYBOARD WEAPON INPUT
     */

    this.processKeyboardInput(
      keyboard
    );


    /*
     * UPDATE UI
     */

    this.updateHUD();


    /*
     * SAVE / STATISTICS
     */

    this.updateStatistics(dt);
  }


  /* =======================================================
     KEYBOARD INPUT
     ======================================================= */

  processKeyboardInput(input) {

    if (!input) {
      return;
    }


    /*
     * Shoot
     */

    if (input.shoot) {

      this.shoot();
    }


    /*
     * Reload
     */

    if (input.reload) {

      this.reload();
    }


    /*
     * Weapon switching
     */

    if (
      input.weapon1 &&
      this.weaponManager?.switchTo
    ) {

      this.weaponManager.switchTo(0);
    }

    if (
      input.weapon2 &&
      this.weaponManager?.switchTo
    ) {

      this.weaponManager.switchTo(1);
    }

    if (
      input.weapon3 &&
      this.weaponManager?.switchTo
    ) {

      this.weaponManager.switchTo(2);
    }
  }


  /* =======================================================
     SHOOT
     ======================================================= */

  shoot() {

    if (!this.weaponManager) {
      return;
    }

    try {

      if (
        this.weaponManager.shoot
      ) {

        const result =
          this.weaponManager.shoot(
            this.scene,
            this.camera
          );

        if (result) {
          this.handleWeaponResult(
            result
          );
        }

      }

    } catch (error) {

      console.warn(
        "Weapon fire error:",
        error
      );

    }
  }


  /* =======================================================
     RELOAD
     ======================================================= */

  reload() {

    if (
      this.weaponManager?.reload
    ) {

      this.weaponManager.reload();
    }
  }


  /* =======================================================
     WEAPON SHOT
     ======================================================= */

  handleWeaponShot(
    weapon,
    position,
    direction
  ) {

    if (!position) {

      position =
        this.camera.getWorldPosition(
          new THREE.Vector3()
        );
    }

    if (!direction) {

      direction =
        this.camera
          .getWorldDirection(
            new THREE.Vector3()
          );
    }


    this.lastShotPosition.copy(
      position
    );


    /*
     * Silent muzzle flash
     */

    if (this.muzzleFlash?.create) {

      this.muzzleFlash.create(
        position,
        direction
      );
    }
  }


  /* =======================================================
     WEAPON RESULT
     ======================================================= */

  handleWeaponResult(result) {

    if (!result) {
      return;
    }

    if (
      result.hit &&
      result.point
    ) {

      this.handleWeaponHit(
        result
      );
    }
  }


  /* =======================================================
     HIT
     ======================================================= */

  handleWeaponHit(hit) {

    if (!hit) {
      return;
    }

    const point =
      hit.point ||
      hit.position;

    if (!point) {
      return;
    }


    /*
     * Normal impact
     */

    if (this.hitEffects?.impact) {

      this.hitEffects.impact(
        point,
        hit.normal
      );
    }


    /*
     * Enemy hit
     */

    if (
      hit.enemy ||
      hit.target?.userData?.enemy
    ) {

      const enemy =
        hit.enemy ||
        hit.target.userData.enemy;

      const damage =
        Number(hit.damage) || 0;

      this.applyEnemyDamage(
        enemy,
        damage,
        hit
      );
    }
  }


  /* =======================================================
     ENEMY DAMAGE
     ======================================================= */

  applyEnemyDamage(
    enemy,
    damage,
    hit = {}
  ) {

    if (!enemy) {
      return;
    }

    try {

      if (
        enemy.takeDamage
      ) {

        enemy.takeDamage(
          damage,
          hit.hitZone ||
          hit.zone ||
          "body"
        );

      } else if (
        enemy.damage
      ) {

        enemy.damage(
          damage
        );
      }

    } catch (error) {

      console.warn(
        "Enemy damage error:",
        error
      );
    }


    /*
     * Blood effect
     */

    const position =
      hit.point ||
      enemy.position;

    if (
      position &&
      this.bloodEffects
    ) {

      if (
        hit.headshot &&
        this.bloodEffects.headshot
      ) {

        this.bloodEffects.headshot(
          position
        );

      } else if (
        this.bloodEffects.bodyHit
      ) {

        this.bloodEffects.bodyHit(
          position
        );
      }
    }
  }


  /* =======================================================
     ENEMY KILL
     ======================================================= */

  handleEnemyKill(enemy) {

    this.kills++;

    /*
     * Progression
     */

    const xp =
      this.getKillXP(enemy);

    if (
      this.progression?.addXP
    ) {

      this.progression.addXP(
        xp
      );
    }


    /*
     * Player XP
     */

    if (
      this.player?.addXP
    ) {

      this.player.addXP(
        xp
      );
    }


    /*
     * Statistics
     */

    if (
      this.statistics?.recordKill
    ) {

      this.statistics.recordKill(
        enemy
      );
    }


    this.updateHUD();
  }


  getKillXP(enemy) {

    if (!enemy) {
      return 100;
    }

    const type =
      enemy.type ||
      enemy.enemyType ||
      "RIFLEMAN";

    const values = {
      RIFLEMAN: 100,
      ASSAULT: 125,
      SCOUT: 110,
      HEAVY: 175,
      ELITE: 250,
      HVT_GUARD: 300
    };

    return values[type] || 100;
  }


  /* =======================================================
     PLAYER DAMAGE
     ======================================================= */

  handlePlayerDamage(
    amount,
    health,
    armor
  ) {

    /*
     * Hit feedback
     */

    if (
      this.hitEffects?.playerDamage
    ) {

      this.hitEffects.playerDamage();
    }


    this.updateHUD();
  }


  /* =======================================================
     ENEMY ATTACK
     ======================================================= */

  handleEnemyAttack(
    enemy,
    damage
  ) {

    if (!this.player) {
      return;
    }

    const amount =
      Number(damage) || 10;


    /*
     * Player damage
     */

    if (
      this.player.takeDamage
    ) {

      this.player.takeDamage(
        amount
      );

      return;
    }


    /*
     * Health fallback
     */

    if (
      this.health?.damage
    ) {

      this.health.damage(
        amount
      );
    }
  }


  /* =======================================================
     PLAYER DEATH
     ======================================================= */

  handlePlayerDeath() {

    this.deaths++;


    if (
      this.statistics?.recordDeath
    ) {

      this.statistics.recordDeath();
    }


    /*
     * Team Deathmatch can respawn.
     */

    if (this.mode === "TDM") {

      setTimeout(
        () => {

          if (
            !this.destroyed &&
            this.started
          ) {

            this.respawnPlayer();
          }

        },
        1800
      );

      return;
    }


    /*
     * Other modes fail the mission.
     */

    if (
      this.missions?.fail
    ) {

      this.missions.fail(
        "OPERATOR DOWN"
      );
    }
  }


  /* =======================================================
     RESPAWN
     ======================================================= */

  respawnPlayer() {

    if (
      this.player?.respawn
    ) {

      this.player.respawn();
    }

    if (
      this.health?.respawn
    ) {

      this.health.respawn();
    }

    if (
      this.weaponManager?.reset
    ) {

      this.weaponManager.reset();
    }

    this.updateHUD();
  }


  /* =======================================================
     HUD
     ======================================================= */

  updateHUD() {

    if (!this.started) {
      return;
    }


    /*
     * Player health
     */

    const playerHealth =
      this.getPlayerHealth();

    const playerArmor =
      this.getPlayerArmor();


    /*
     * Existing HUD
     */

    if (this.ui.hud) {

      try {

        this.ui.hud.update({
          health: playerHealth,
          armor: playerArmor,
          kills: this.kills,
          callsign: this.callsign
        });

      } catch {
        /*
         * Existing HUD may use a
         * different API. Leave it alone.
         */
      }
    }


    /*
     * Weapon HUD
     */

    if (this.ui.weapon) {

      const weaponData =
        this.getWeaponHUDData();

      this.ui.weapon.update(
        weaponData
      );
    }


    /*
     * Level HUD
     */

    if (this.ui.level) {

      const levelData =
        this.getLevelData();

      this.ui.level.update(
        levelData
      );
    }


    /*
     * Mission HUD
     */

    if (this.ui.mission) {

      const missionData =
        this.getMissionData();

      this.ui.mission.update(
        missionData
      );
    }
  }


  /* =======================================================
     HEALTH DATA
     ======================================================= */

  getPlayerHealth() {

    if (
      this.player?.getHealth
    ) {

      return this.player.getHealth();
    }

    if (
      this.health?.getHealth
    ) {

      return this.health.getHealth();
    }

    if (
      this.player?.health !== undefined
    ) {

      return this.player.health;
    }

    return 100;
  }


  getPlayerArmor() {

    if (
      this.player?.getArmor
    ) {

      return this.player.getArmor();
    }

    if (
      this.health?.getArmor
    ) {

      return this.health.getArmor();
    }

    if (
      this.player?.armor !== undefined
    ) {

      return this.player.armor;
    }

    return 0;
  }


  /* =======================================================
     WEAPON HUD DATA
     ======================================================= */

  getWeaponHUDData() {

    const manager =
      this.weaponManager;

    if (!manager) {

      return {
        weaponName: "CARBINE",
        currentAmmo: 0,
        reserveAmmo: 0,
        fireMode: "AUTO",
        reloading: false,
        aiming: false
      };
    }


    let weapon = null;

    if (manager.getActiveWeapon) {

      weapon =
        manager.getActiveWeapon();
    }


    if (!weapon) {

      weapon =
        manager.activeWeapon ||
        manager.currentWeapon ||
        null;
    }


    return {
      weaponName:
        weapon?.name ||
        manager.weaponName ||
        "CARBINE",

      currentAmmo:
        weapon?.ammo ??
        weapon?.currentAmmo ??
        manager.getCurrentAmmo?.() ??
        0,

      reserveAmmo:
        weapon?.reserveAmmo ??
        weapon?.reserve ??
        manager.getReserveAmmo?.() ??
        0,

      fireMode:
        weapon?.automatic === false
          ? "SEMI"
          : "AUTO",

      reloading:
        weapon?.reloading ||
        manager.reloading ||
        false,

      aiming:
        weapon?.aiming ||
        manager.aiming ||
        false
    };
  }


  /* =======================================================
     LEVEL DATA
     ======================================================= */

  getLevelData() {

    let level = 1;
    let xp = 0;
    let xpRequired = 100;


    if (this.player) {

      level =
        this.player.level ||
        this.player.getLevel?.() ||
        1;

      xp =
        this.player.xp ||
        this.player.getXP?.() ||
        0;
    }


    if (this.progression) {

      level =
        this.progression.level ||
        this.progression.getLevel?.() ||
        level;

      xp =
        this.progression.xp ||
        this.progression.getXP?.() ||
        xp;

      xpRequired =
        this.progression.xpRequired ||
        this.progression.getXPRequired?.() ||
        xpRequired;
    }


    return {
      level,
      xp,
      xpRequired,
      rank: this.getRank(level)
    };
  }


  getRank(level) {

    if (level >= 30) {
      return "COMMANDER";
    }

    if (level >= 20) {
      return "SPECIALIST";
    }

    if (level >= 10) {
      return "VETERAN";
    }

    if (level >= 5) {
      return "OPERATIVE";
    }

    return "RECRUIT";
  }


  /* =======================================================
     MISSION DATA
     ======================================================= */

  getMissionData() {

    const fallback = {
      mode: this.mode,
      title: this.getMissionTitle(),
      objective: "Complete the operation",
      progress: 0,
      timer: null,
      status: ""
    };


    if (!this.missions) {
      return fallback;
    }


    let state = null;


    try {

      if (
        this.missions.getState
      ) {

        state =
          this.missions.getState();
      }

    } catch {
      state = null;
    }


    if (!state) {
      return fallback;
    }


    return {
      mode:
        state.mode ||
        this.mode,

      title:
        state.title ||
        state.missionName ||
        this.getMissionTitle(),

      objective:
        state.objective ||
        state.currentObjective ||
        "Complete the operation",

      progress:
        state.progress ??
        state.progressPercent ??
        0,

      timer:
        state.timeRemaining ??
        state.timer ??
        null,

      status:
        state.status ||
        ""
    };
  }


  getMissionTitle() {

    const titles = {
      RESCUE: "HOSTAGE RESCUE",
      SURVIVAL: "SURVIVAL",
      TDM: "TEAM DEATHMATCH",
      HVT: "HIGH VALUE TARGET"
    };

    return (
      titles[this.mode] ||
      "TACTICAL OPERATION"
    );
  }


  /* =======================================================
     STATISTICS
     ======================================================= */

  updateStatistics(dt) {

    if (
      !this.statistics
    ) {
      return;
    }


    try {

      if (
        this.statistics.update
      ) {

        this.statistics.update(
          dt
        );
      }

    } catch {
      /*
       * Statistics API can evolve
       * independently.
       */
    }
  }


  /* =======================================================
     GAME UI
     ======================================================= */

  showGameUI() {

    this.ui.weapon?.show();
    this.ui.mission?.show();
    this.ui.level?.show();


    if (this.ui.hud?.show) {
      this.ui.hud.show();
    }
  }


  hideGameUI() {

    this.ui.weapon?.hide();
    this.ui.mission?.hide();
    this.ui.level?.hide();


    if (this.ui.hud?.hide) {
      this.ui.hud.hide();
    }
  }


  showReload() {

    if (
      this.ui.weapon
    ) {

      this.ui.weapon.setReloading(
        true
      );

      setTimeout(
        () => {

          if (
            this.ui.weapon
          ) {

            this.ui.weapon.setReloading(
              false
            );
          }

        },
        900
      );
    }
  }


  /* =======================================================
     EFFECT CLEANUP
     ======================================================= */

  clearEffects() {

    this.muzzleFlash?.clear();
    this.hitEffects?.clear();
    this.bloodEffects?.clear();
    this.explosion?.clear();
    this.smoke?.clear();
  }


  /* =======================================================
     FOCUS
     ======================================================= */

  focusGame() {

    try {

      if (
        this.renderer?.domElement
      ) {

        this.renderer.domElement.focus();
      }

    } catch {
      // Mobile browsers may reject focus.
    }
  }


  /* =======================================================
     PAUSE
     ======================================================= */

  pause() {

    if (!this.started) {
      return;
    }

    this.paused = true;

    if (
      this.keyboardControls?.setEnabled
    ) {

      this.keyboardControls.setEnabled(
        false
      );
    }

    if (
      this.touchControls?.setEnabled
    ) {

      this.touchControls.setEnabled(
        false
      );
    }
  }


  /* =======================================================
     RESUME
     ======================================================= */

  resume() {

    if (!this.started) {
      return;
    }

    this.paused = false;

    if (
      this.keyboardControls?.setEnabled
    ) {

      this.keyboardControls.setEnabled(
        true
      );
    }

    if (
      this.touchControls?.setEnabled
    ) {

      this.touchControls.setEnabled(
        true
      );
    }
  }


  /* =======================================================
     STOP
     ======================================================= */

  stop() {

    this.started = false;
    this.paused = true;

    this.hideGameUI();

    this.clearEffects();
  }


  /* =======================================================
     DESTROY
     ======================================================= */

  destroy() {

    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.started = false;
    this.paused = true;


    /*
     * Input
     */

    try {
      this.touchControls?.destroy?.();
    } catch {}

    try {
      this.keyboardControls?.destroy?.();
    } catch {}


    /*
     * Player
     */

    try {
      this.player?.destroy?.();
    } catch {}


    /*
     * Weapons
     */

    try {
      this.weaponManager?.destroy?.();
    } catch {}


    /*
     * Enemies
     */

    try {
      this.enemySpawner?.destroy?.();
    } catch {}


    /*
     * Missions
     */

    try {
      this.missions?.destroy?.();
    } catch {}


    /*
     * World
     */

    try {
      this.cover?.destroy?.();
    } catch {}

    try {
      this.collision?.destroy?.();
    } catch {}

    try {
      this.world?.destroy?.();
    } catch {}

    try {
      this.environment?.destroy?.();
    } catch {}


    /*
     * Effects
     */

    this.clearEffects();

    try {
      this.muzzleFlash?.destroy?.();
    } catch {}

    try {
      this.hitEffects?.destroy?.();
    } catch {}

    try {
      this.bloodEffects?.destroy?.();
    } catch {}

    try {
      this.explosion?.destroy?.();
    } catch {}

    try {
      this.smoke?.destroy?.();
    } catch {}


    /*
     * Animation
     */

    try {
      this.animations?.destroy?.();
    } catch {}


    /*
     * UI
     */

    try {
      this.ui.weapon?.destroy?.();
    } catch {}

    try {
      this.ui.mission?.destroy?.();
    } catch {}

    try {
      this.ui.level?.destroy?.();
    } catch {}

    try {
      this.ui.hud?.destroy?.();
    } catch {}

    try {
      this.ui.result?.destroy?.();
    } catch {}
  }
}
