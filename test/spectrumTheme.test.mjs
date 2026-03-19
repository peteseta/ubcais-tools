import test from "node:test";
import assert from "node:assert/strict";

import { getThemeToggleText } from "../src/lib/spectrumTheme.js";

test("getThemeToggleText returns light-theme copy when the page is dark", () => {
  assert.equal(getThemeToggleText(false), "Use light theme");
});

test("getThemeToggleText returns dark-theme copy when the page is light", () => {
  assert.equal(getThemeToggleText(true), "Use dark theme");
});
