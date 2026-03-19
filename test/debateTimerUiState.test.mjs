import test from "node:test";
import assert from "node:assert/strict";

import { shouldPlayDebateTimerEndJingle } from "../src/lib/debateTimerUiState.js";

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
