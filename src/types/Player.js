/**
 * Core player model for The Oche darts app.
 *
 * This is plain JS plus JSDoc so it works nicely
 * with TypeScript-aware tooling without requiring TS.
 */

/**
 * @typedef {Object} Player
 * @property {string} id - Stable identifier (uuid-like string).
 * @property {string} name - Display name.
 *
 * @property {number} startingScore - Game starting score (301 or 501).
 * @property {number} remainingScore - Current remaining score.
 * @property {number} legsWon - Number of legs won in the current match.
 *
 * // Future-proofing for team mode (not implemented in UI):
 * @property {string | null} [teamId] - Optional team identifier.
 */

export const createPlayer = (id, name, startingScore) => ({
  id,
  name,
  startingScore,
  remainingScore: startingScore,
  legsWon: 0,
  teamId: null,
});

/**
 * Simple helper to clone a player (to avoid accidental mutation).
 * @param {Player} player
 * @returns {Player}
 */
export const clonePlayer = (player) => ({
  ...player,
});
