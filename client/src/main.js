import {
  MissionVoice,
  MISSION_LINES
} from "./game/MissionVoice.js";

const missionVoice = new MissionVoice();

function playMissionIntro(type) {
  const lines = MISSION_LINES[type];

  if (!lines) {
    return;
  }

  for (const line of lines) {
    missionVoice.say(
      line.speaker,
      line.text,
      3200
    );
  }
}
