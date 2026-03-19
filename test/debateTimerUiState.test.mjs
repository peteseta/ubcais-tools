import test from "node:test";
import assert from "node:assert/strict";

import {
  isDebateTimerInWarningState,
  shouldPlayDebateTimerEndJingle,
} from "../src/lib/debateTimerUiState.js";

test("shouldPlayDebateTimerEndJingle only triggers for the facilitator when a running timer finishes", () => {
  assert.equal(
    shouldPlayDebateTimerEndJingle({
      role: "facilitator",
      previousTimerState: "running",
      nextTimerState: "finished",
    }),
    true
  );

  assert.equal(
    shouldPlayDebateTimerEndJingle({
      role: "audience",
      previousTimerState: "running",
      nextTimerState: "finished",
    }),
    false
  );

  assert.equal(
    shouldPlayDebateTimerEndJingle({
      role: "facilitator",
      previousTimerState: "idle",
      nextTimerState: "finished",
    }),
    false
  );
});

test("isDebateTimerInWarningState ignores zero-duration phases", () => {
  assert.equal(
    isDebateTimerInWarningState({
      currentPhaseIndex: 2,
      timeRemaining: 10,
      timerState: "running",
      phases: [{ duration: 60 }, { duration: 30 }, { duration: 0 }],
    }),
    false
  );

  assert.equal(
    isDebateTimerInWarningState({
      currentPhaseIndex: 0,
      timeRemaining: 10,
      timerState: "running",
      phases: [{ duration: 60 }],
    }),
    true
  );
});
