export const MISSION_LINES = {
  tdm: [
    ["COMMAND", "Two teams. One objective. Eliminate the opposition."],
    ["COMMAND", "Stay together and control the center."],
    ["INTEL", "Enemy contacts approaching your position."],
    ["COMMAND", "We're losing ground. Push forward."],
    ["COMMAND", "Enemy team is almost wiped out. Finish this."],
    ["COMMAND", "Area secure. Good work."]
  ],

  hostage: [
    ["COMMAND", "Hostage is inside the building."],
    ["INTEL", "Multiple hostiles detected."],
    ["COMMAND", "Get in, secure the hostage, and get out."],
    ["COMMAND", "Hostage located. Move to extraction."],
    ["COMMAND", "Extraction route is clear. Move."]
  ],

  hvt: [
    ["INTEL", "High-value target confirmed."],
    ["COMMAND", "Do not let the target escape."],
    ["INTEL", "Target is moving. Intercept."],
    ["COMMAND", "Target neutralized. Secure the area."]
  ],

  survival: [
    ["COMMAND", "We've lost contact with the rest of the unit."],
    ["COMMAND", "Hold this position until extraction arrives."],
    ["INTEL", "Movement detected. They're coming."],
    ["COMMAND", "More contacts incoming."],
    ["COMMAND", "Keep holding. Extraction is almost here."],
    ["COMMAND", "Extraction confirmed. You made it."]
  ]
};

export class MissionVoice {
  constructor() {
    this.element = document.createElement("div");

    this.element.id = "mission-voice";

    this.element.innerHTML = `
      <div class="voice-box">
        <div id="voice-speaker">COMMAND</div>
        <div id="voice-text"></div>
      </div>
    `;

    document.body.appendChild(this.element);

    this.speaker =
      this.element.querySelector("#voice-speaker");

    this.text =
      this.element.querySelector("#voice-text");

    this.queue = [];
    this.playing = false;
    this.timer = null;
  }

  say(speaker, text, duration = 3200) {
    this.queue.push({
      speaker,
      text,
      duration
    });

    this.process();
  }

  playMission(type) {
    const lines =
      MISSION_LINES[type];

    if (!lines) return;

    for (const line of lines) {
      this.queue.push({
        speaker: line[0],
        text: line[1],
        duration: 3200
      });
    }

    this.process();
  }

  async process() {
    if (this.playing) return;
    if (!this.queue.length) return;

    this.playing = true;

    const line =
      this.queue.shift();

    this.speaker.textContent =
      line.speaker;

    this.text.textContent =
      line.text;

    this.element.classList.add(
      "visible"
    );

    await new Promise(resolve => {
      this.timer =
        setTimeout(
          resolve,
          line.duration
        );
    });

    this.element.classList.remove(
      "visible"
    );

    await new Promise(resolve => {
      setTimeout(
        resolve,
        300
      );
    });

    this.playing = false;

    this.process();
  }

  clear() {
    this.queue = [];

    clearTimeout(this.timer);

    this.element.classList.remove(
      "visible"
    );

    this.playing = false;
  }
}
