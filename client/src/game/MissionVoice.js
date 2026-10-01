export class MissionVoice {
  constructor() {
    this.el = document.createElement("div");

    this.el.id = "mission-voice";

    this.el.innerHTML = `
      <div class="mission-voice-box">
        <div
          class="mission-voice-speaker"
          id="mission-voice-speaker"
        >
          COMMAND
        </div>

        <div
          class="mission-voice-text"
          id="mission-voice-text"
        ></div>
      </div>
    `;

    document.body.appendChild(this.el);

    this.speaker = this.el.querySelector(
      "#mission-voice-speaker"
    );

    this.text = this.el.querySelector(
      "#mission-voice-text"
    );

    this.queue = [];
    this.running = false;
  }

  say(speaker, text, duration = 3500) {
    this.queue.push({
      speaker,
      text,
      duration
    });

    this.process();
  }

  async process() {
    if (this.running || this.queue.length === 0) {
      return;
    }

    this.running = true;

    const line = this.queue.shift();

    this.speaker.textContent = line.speaker;
    this.text.textContent = line.text;

    this.el.classList.add("visible");

    await this.wait(line.duration);

    this.el.classList.remove("visible");

    await this.wait(350);

    this.running = false;

    this.process();
  }

  wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  clear() {
    this.queue = [];
    this.el.classList.remove("visible");
    this.running = false;
  }
}

export const MISSION_LINES = {
  tdm: [
    {
      speaker: "COMMAND",
      text: "Two teams. One objective. Eliminate the opposition."
    },
    {
      speaker: "COMMAND",
      text: "Stay together and control the center."
    },
    {
      speaker: "INTEL",
      text: "Enemy contacts approaching your position."
    },
    {
      speaker: "COMMAND",
      text: "We're losing ground. Push forward."
    },
    {
      speaker: "COMMAND",
      text: "Enemy team is almost wiped out. Finish this."
    },
    {
      speaker: "COMMAND",
      text: "Area secure. Good work."
    }
  ],

  hostage: [
    {
      speaker: "COMMAND",
      text: "Hostage is inside the building."
    },
    {
      speaker: "INTEL",
      text: "Multiple hostiles detected."
    },
    {
      speaker: "COMMAND",
      text: "Get in, secure the hostage, and get out."
    },
    {
      speaker: "COMMAND",
      text: "Hostage located. Move to extraction."
    },
    {
      speaker: "COMMAND",
      text: "Extraction route is clear. Move."
    }
  ],

  hvt: [
    {
      speaker: "INTEL",
      text: "High-value target confirmed."
    },
    {
      speaker: "COMMAND",
      text: "Do not let the target escape."
    },
    {
      speaker: "INTEL",
      text: "Target is moving. Intercept."
    },
    {
      speaker: "COMMAND",
      text: "Target neutralized. Secure the area."
    }
  ],

  survival: [
    {
      speaker: "COMMAND",
      text: "We've lost contact with the rest of the unit."
    },
    {
      speaker: "COMMAND",
      text: "Hold this position until extraction arrives."
    },
    {
      speaker: "INTEL",
      text: "Movement detected. They're coming."
    },
    {
      speaker: "COMMAND",
      text: "More contacts incoming."
    },
    {
      speaker: "COMMAND",
      text: "Keep holding. Extraction is almost here."
    },
    {
      speaker: "COMMAND",
      text: "Extraction confirmed. You made it."
    }
  ]
};
