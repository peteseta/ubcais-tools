import test from "node:test";
import assert from "node:assert/strict";

import {
  hasReadyDebatePrompt,
  removePromptAtIndex,
} from "../src/lib/debatePrompts.js";

test("removePromptAtIndex keeps a blank prompt when removing the final item", () => {
  assert.deepEqual(removePromptAtIndex([{ text: "Prompt", subtitle: "" }], 0, 0), {
    prompts: [{ text: "", subtitle: "" }],
    currentPromptIndex: 0,
  });
});

test("hasReadyDebatePrompt requires at least one non-empty prompt text", () => {
  assert.equal(hasReadyDebatePrompt([{ text: "", subtitle: "Context" }]), false);
  assert.equal(hasReadyDebatePrompt([{ text: "  Debate this  ", subtitle: "" }]), true);
});
