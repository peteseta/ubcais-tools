import test from "node:test";
import assert from "node:assert/strict";

import { getFullscreenTooltipText } from "../src/lib/spectrumFullscreen.js";

test("getFullscreenTooltipText returns unavailable copy when fullscreen is not supported", () => {
  assert.equal(
    getFullscreenTooltipText({ isSupported: false, isFullscreen: false }),
    "Fullscreen unavailable"
  );
});

test("getFullscreenTooltipText returns enter copy when fullscreen is available but inactive", () => {
  assert.equal(
    getFullscreenTooltipText({ isSupported: true, isFullscreen: false }),
    "Enter fullscreen"
  );
});

test("getFullscreenTooltipText returns exit copy when fullscreen is active", () => {
  assert.equal(
    getFullscreenTooltipText({ isSupported: true, isFullscreen: true }),
    "Exit fullscreen"
  );
});
