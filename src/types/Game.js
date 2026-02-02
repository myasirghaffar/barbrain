/**
 * Core game / match models for The Oche darts app.
 *
 * These are JS + JSDoc type descriptions – no TS build step required.
 */

/**
 * @typedef {"301" | "501"} GameType
 */

/**
 * @typedef {"single" | "bestOf"} LegsMode
 */

/**
 * Represents a single scoring turn for a player.
 *
 * @typedef {Object} Turn
 * @property {string} id - Unique id for this turn.
 * @property {string} playerId
 * @property {number} score - Entered score (0–180).
 * @property {boolean} wasBust - Whether the turn resulted in a bust.
 * @property {number} previousRemaining - Remaining score before this turn.
 * @property {number} newRemaining - Remaining score after this turn (same as previousRemaining if bust).
 * @property {boolean} finishedGame - True if this turn won the game.
 * @property {boolean} finishedOnDouble - True if user confirmed double-out finish.
 * @property {number} createdAt - Timestamp (ms) when this turn was recorded.
 */

/**
 * Core game state for one leg of 301/501.
 *
 * @typedef {Object} Game
 * @property {string} id
 * @property {GameType} gameType
 * @property {boolean} doubleOut
 * @property {LegsMode} legsMode
 * @property {number} legsCount - Stored for future best-of support, even if only single leg is active.
 * @property {import("./Player").Player[]} players
 * @property {number} currentPlayerIndex
 * @property {"setup" | "inProgress" | "finished"} status
 * @property {string | null} winnerPlayerId
 * @property {Turn[]} history
 *
 * // Future-proofing for teams & competitions (not implemented in UI):
 * @property {Array<{ id: string, name: string, playerIds: string[] }>} [teams]
 * @property {string | null} [competitionId]
 * @property {string | null} [matchId]
 */

/**
 * Lightweight factory to create a new game object.
 *
 * @param {Object} params
 * @param {GameType} params.gameType
 * @param {boolean} params.doubleOut
 * @param {LegsMode} params.legsMode
 * @param {number} params.legsCount
 * @param {import("./Player").Player[]} params.players
 * @returns {Game}
 */
export const createGame = ({
  gameType,
  doubleOut,
  legsMode,
  legsCount,
  players,
}) => {
  const startingStatus = "inProgress";

  return {
    id: `game_${Date.now()}`,
    gameType,
    doubleOut,
    legsMode,
    legsCount,
    players,
    currentPlayerIndex: 0,
    status: startingStatus,
    winnerPlayerId: null,
    history: [],
    teams: [], // reserved for future team mode
    competitionId: null, // reserved for future competitions
    matchId: null, // reserved for future knockout/match entities
  };
};
