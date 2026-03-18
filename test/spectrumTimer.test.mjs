import test from "node:test";
import assert from "node:assert/strict";

import {
  formatPhaseTime,
  normalizePhaseDuration,
  normalizePhases,
} from "../src/lib/spectrumTimer.js";

test("normalizePhaseDuration falls back to 0 when duration is missing", () => {
  assert.equal(normalizePhaseDuration(undefined), 0);
});

test("formatPhaseTime renders 00:00 for invalid durations", () => {
  assert.equal(formatPhaseTime(Number.NaN), "00:00");
});

test("normalizePhases preserves valid sides and strips invalid ones", () => {
  const phases = normalizePhases([
    { name: "Agree", duration: 60, side: "agree" },
    { name: "Invalid", duration: "15", side: "center" },
  ]);

  assert.deepEqual(phases, [
    { name: "Agree", duration: 60, side: "agree" },
    { name: "Invalid", duration: 15, side: undefined },
  ]);
});
