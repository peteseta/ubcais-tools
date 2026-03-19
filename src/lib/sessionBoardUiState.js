export function getEditorContentType({
  mainContentState,
  stageContentType,
}) {
  return mainContentState ?? stageContentType ?? "qotd";
}

export function shouldPlayTimerEndJingle({ mainContentState, role }) {
  return role === "facilitator" && mainContentState === "timer";
}
