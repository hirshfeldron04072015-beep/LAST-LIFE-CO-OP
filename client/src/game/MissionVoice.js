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
    this.element =
      document.getElementById(
        "mission-voice"
      );

    this.speaker =
      document.getElementById(
        "mission-speaker"
      );

    this.text =
      document.getElementById(
        "mission-text"
      );

    this.queue = [];
    this.active = false;
  }

  playMission(type) {
    const lines = MISSION_LINES[type] || [];

    for (const line of lines) {
      this.queue.push(line);
    }

    this.process();
  }

  say(speaker, text, duration = 3000) {
    this.queue.push([
      speaker,
      text,
      duration
    ]);

    this.process();
  }

  async process() {
    if (
      this.active ||
      this.queue.length === 0
    ) {
      return;
    }

    this.active = true;

    const line = this.queue.shift();

    this.speaker.textContent = line[0];
    this.text.textContent = line[1];

    this.element.classList.add("visible");

    const duration = line[2] || 3000;

    await new Promise(resolve =>
      setTimeout(resolve, duration)
    );

    this.element.classList.remove(
      "visible"
    );

    await new Promise(resolve =>
      setTimeout(resolve, 300)
    );

    this.active = false;

    this.process();
  }
}
