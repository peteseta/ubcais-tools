import test from "node:test";
import assert from "node:assert/strict";

import {
  getEditorContentType,
  shouldPlayTimerEndJingle,
} from "../src/lib/sessionBoardUiState.js";

test("getEditorContentType prefers the live override over the stage type", () => {
  assert.equal(
    getEditorContentType({
      mainContentState: "timer",
      stageContentType: "text",
    }),
    "timer"
  );
});

test("getEditorContentType falls back to the stage type when there is no override", () => {
  assert.equal(
    getEditorContentType({
      mainContentState: undefined,
      stageContentType: "qotd",
    }),
    "qotd"
  );
});

test("shouldPlayTimerEndJingle only enables audio for the facilitator timer view", () => {
  assert.equal(
    shouldPlayTimerEndJingle({
      mainContentState: "timer",
      role: "facilitator",
    }),
    true
  );
  assert.equal(
    shouldPlayTimerEndJingle({
      mainContentState: "timer",
      role: "audience",
    }),
    false
  );
  assert.equal(
    shouldPlayTimerEndJingle({
      mainContentState: "text",
      role: "facilitator",
    }),
    false
  );
});
