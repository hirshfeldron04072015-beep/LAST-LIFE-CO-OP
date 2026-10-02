import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AnimationManager {
  constructor() {
    this.mixers = new Map();
    this.actions = new Map();
    this.clips = new Map();

    this.fadeDuration = 0.18;
  }

  register(
    object,
    animations = []
  ) {
    if (!object) {
      return null;
    }

    const mixer =
      new THREE.AnimationMixer(
        object
      );

    this.mixers.set(
      object,
      mixer
    );

    const objectActions =
      new Map();

    for (const clip of animations) {
      if (!clip) {
        continue;
      }

      const action =
        mixer.clipAction(clip);

      action.enabled = true;

      objectActions.set(
        clip.name,
        action
      );

      this.clips.set(
        `${this.getObjectId(object)}:${clip.name}`,
        clip
      );
    }

    this.actions.set(
      object,
      objectActions
    );

    return mixer;
  }

  getObjectId(object) {
    if (!object.userData.animationId) {
      object.userData.animationId =
        THREE.MathUtils.generateUUID();
    }

    return object.userData.animationId;
  }

  play(
    object,
    animationName,
    options = {}
  ) {
    if (!object) {
      return false;
    }

    const objectActions =
      this.actions.get(object);

    if (!objectActions) {
      return false;
    }

    const action =
      objectActions.get(
        animationName
      );

    if (!action) {
      return false;
    }

    const loop =
      options.loop ??
      THREE.LoopRepeat;

    const repetitions =
      options.repetitions ??
      Infinity;

    const fade =
      options.fade ??
      this.fadeDuration;

    const previous =
      this.getCurrentAction(
        object
      );

    if (
      previous &&
      previous !== action
    ) {
      previous.fadeOut(fade);
    }

    action.reset();

    action.setLoop(
      loop,
      repetitions
    );

    action.clampWhenFinished =
      options.clampWhenFinished ??
      false;

    action.fadeIn(fade);

    action.play();

    object.userData.currentAnimation =
      animationName;

    return true;
  }

  stop(
    object,
    animationName = null
  ) {
    const objectActions =
      this.actions.get(object);

    if (!objectActions) {
      return;
    }

    if (animationName) {
      const action =
        objectActions.get(
          animationName
        );

      if (action) {
        action.stop();
      }

      return;
    }

    for (const action of objectActions.values()) {
      action.stop();
    }

    object.userData.currentAnimation =
      null;
  }

  pause(object) {
    const mixer =
      this.mixers.get(object);

    if (!mixer) {
      return;
    }

    mixer.timeScale = 0;
  }

  resume(object) {
    const mixer =
      this.mixers.get(object);

    if (!mixer) {
      return;
    }

    mixer.timeScale = 1;
  }

  update(dt) {
    if (!Number.isFinite(dt)) {
      return;
    }

    for (const mixer of this.mixers.values()) {
      mixer.update(dt);
    }
  }

  getCurrentAction(object) {
    const objectActions =
      this.actions.get(object);

    if (!objectActions) {
      return null;
    }

    for (const action of objectActions.values()) {
      if (action.isRunning()) {
        return action;
      }
    }

    return null;
  }

  getCurrentAnimation(object) {
    if (!object) {
      return null;
    }

    return (
      object.userData.currentAnimation ||
      null
    );
  }

  hasAnimation(
    object,
    animationName
  ) {
    const objectActions =
      this.actions.get(object);

    return (
      !!objectActions &&
      objectActions.has(
        animationName
      )
    );
  }

  fadeTo(
    object,
    animationName,
    duration = 0.2
  ) {
    const objectActions =
      this.actions.get(object);

    if (!objectActions) {
      return false;
    }

    const next =
      objectActions.get(
        animationName
      );

    if (!next) {
      return false;
    }

    const current =
      this.getCurrentAction(
        object
      );

    if (
      current &&
      current !== next
    ) {
      current.fadeOut(
        duration
      );
    }

    next.reset();
    next.fadeIn(
      duration
    );
    next.play();

    object.userData.currentAnimation =
      animationName;

    return true;
  }

  setWeight(
    object,
    animationName,
    weight
  ) {
    const objectActions =
      this.actions.get(object);

    if (!objectActions) {
      return;
    }

    const action =
      objectActions.get(
        animationName
      );

    if (!action) {
      return;
    }

    action.setEffectiveWeight(
      THREE.MathUtils.clamp(
        weight,
        0,
        1
      )
    );
  }

  setTimeScale(
    object,
    scale
  ) {
    const mixer =
      this.mixers.get(object);

    if (!mixer) {
      return;
    }

    mixer.timeScale = scale;
  }

  getMixer(object) {
    return (
      this.mixers.get(object) ||
      null
    );
  }

  getAnimations(object) {
    const objectActions =
      this.actions.get(object);

    if (!objectActions) {
      return [];
    }

    return [
      ...objectActions.keys()
    ];
  }

  remove(object) {
    const mixer =
      this.mixers.get(object);

    if (mixer) {
      mixer.stopAllAction();
      mixer.uncacheRoot(object);
    }

    this.mixers.delete(object);
    this.actions.delete(object);

    const prefix =
      this.getObjectId(object) +
      ":";

    for (const key of this.clips.keys()) {
      if (key.startsWith(prefix)) {
        this.clips.delete(key);
      }
    }

    if (
      object &&
      object.userData
    ) {
      delete object.userData.animationId;
      delete object.userData.currentAnimation;
    }
  }

  clear() {
    for (const object of this.mixers.keys()) {
      const mixer =
        this.mixers.get(object);

      if (mixer) {
        mixer.stopAllAction();
        mixer.uncacheRoot(object);
      }
    }

    this.mixers.clear();
    this.actions.clear();
    this.clips.clear();
  }

  destroy() {
    this.clear();
  }
}
