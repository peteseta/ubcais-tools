import config from "@/data/coworking-config.json";
import {
  bottomLeftNotes,
  bottomLeftText,
  bottomRightNotes,
  bottomRightText,
  centerText,
  countdownTitle,
  countdownToTime,
  mainContentState,
  qotd,
  qotdLocation,
  reset,
  stageIndex,
  topLeftNotes,
  topLeftText,
  topRightNotes,
  topRightText,
} from "./useSessionBoardState";

export const sessionConfig = config;
export const stages = config.stages;

export function currentTimePlusMinutesRoundedToNearest5Minutes(
  minuteOffset: number
) {
  const now = new Date();
  const currentMinutes = now.getMinutes();
  const roundedMinutes = Math.round(currentMinutes / 5) * 5;
  now.setMinutes(roundedMinutes + minuteOffset);
  return { hour: now.getHours(), minute: now.getMinutes() };
}

export function applyStage(index: number) {
  const stage = stages[index];
  if (!stage) return;

  stageIndex.value = index;

  // Notes — only listed corners have content; others cleared
  const notes = stage.notes as Record<string, string | undefined>;
  topLeftNotes.value = notes.topLeft ?? "";
  topRightNotes.value = notes.topRight ?? "";
  bottomLeftNotes.value = notes.bottomLeft ?? "";
  bottomRightNotes.value = notes.bottomRight ?? "";

  // Content
  const content = stage.content as Record<string, unknown>;
  if (content.type === "qotd") {
    mainContentState.value = "qotd";
    if (typeof content.qotd === "string") qotd.value = content.qotd;
    if (typeof content.qotdLocation === "string")
      qotdLocation.value = content.qotdLocation;
  } else if (content.type === "timer") {
    mainContentState.value = "timer";
    if (typeof content.timerTitle === "string")
      countdownTitle.value = content.timerTitle;
    if (typeof content.durationMinutes === "number") {
      countdownToTime.value =
        currentTimePlusMinutesRoundedToNearest5Minutes(content.durationMinutes);
    }
  } else if (content.type === "text") {
    mainContentState.value = "text";
    if (typeof content.text === "string") centerText.value = content.text;
  }
}

export function applyFirstStage() {
  reset();
  topLeftText.value = config.decoration.topLeftText;
  topRightText.value = config.decoration.topRightText;
  bottomLeftText.value = config.decoration.bottomLeftText;
  bottomRightText.value = config.decoration.bottomRightText;
  applyStage(0);
}
