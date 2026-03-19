/**
 * @param {{ isSupported: boolean; isFullscreen: boolean }} state
 * @returns {string}
 */
export const getFullscreenTooltipText = (state) => {
  if (!state.isSupported) {
    return "Fullscreen unavailable";
  }

  return state.isFullscreen ? "Exit fullscreen" : "Enter fullscreen";
};
