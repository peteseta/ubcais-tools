const EMPTY_PROMPT = Object.freeze({ text: "", subtitle: "" });

export function hasReadyDebatePrompt(prompts) {
  return prompts.some((prompt) => prompt.text.trim().length > 0);
}

export function removePromptAtIndex(prompts, currentPromptIndex, removedPromptIndex) {
  const nextPrompts = prompts.filter((_, index) => index !== removedPromptIndex);

  if (nextPrompts.length === 0) {
    return {
      prompts: [{ ...EMPTY_PROMPT }],
      currentPromptIndex: 0,
    };
  }

  return {
    prompts: nextPrompts,
    currentPromptIndex: Math.min(currentPromptIndex, nextPrompts.length - 1),
  };
}
