export function shouldPlayDebateTimerEndJingle({
  role,
  previousTimerState,
  nextTimerState,
}) {
  return (
    role === "facilitator" &&
    previousTimerState === "running" &&
    nextTimerState === "finished"
  );
}

export function isDebateTimerInWarningState({
  currentPhaseIndex,
  timeRemaining,
  timerState,
  phases,
}) {
  if (currentPhaseIndex < 0 || timerState !== "running") {
    return false;
  }

  const phase = phases[currentPhaseIndex];

  if (!phase || phase.duration === 0) {
    return false;
  }

  return timeRemaining <= 10;
}
