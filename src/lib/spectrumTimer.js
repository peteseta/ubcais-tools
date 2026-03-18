/**
 * @typedef {{ name: string; duration: number; side?: 'disagree' | 'agree' }} Phase
 */

/**
 * @param {unknown} value
 * @returns {number}
 */
export const normalizePhaseDuration = (value) => {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.floor(parsed);
};

/**
 * @param {ArrayLike<{ name?: string; duration?: unknown; side?: string }>} phases
 * @returns {Phase[]}
 */
export const normalizePhases = (phases) =>
  Array.from(phases).map((phase) => ({
    name: phase.name ?? "",
    duration: normalizePhaseDuration(phase.duration),
    side:
      phase.side === "agree" || phase.side === "disagree" ? phase.side : undefined,
  }));

/**
 * @param {number} seconds
 * @returns {string}
 */
export const formatPhaseTime = (seconds) => {
  const safeSeconds = normalizePhaseDuration(seconds);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
};
