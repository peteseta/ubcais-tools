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
