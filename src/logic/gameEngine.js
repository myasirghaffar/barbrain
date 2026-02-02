import { clonePlayer } from "../types/Player";

/**
 * Core pure game logic for 301/501 darts.
 *
 * This file is intentionally UI-agnostic so it can be tested and reused.
 *
 * Game shape matches the JSDoc type in `types/Game.js`.
 */

const MAX_SCORE_PER_TURN = 180;

/**
 * Validate a raw score entry.
 * @param {number} score
 * @returns {{ ok: boolean, error?: string }}
 */
export const validateScore = (score) => {
  if (Number.isNaN(score) || !Number.isFinite(score)) {
    return { ok: false, error: "Score must be a number." };
  }
  if (!Number.isInteger(score)) {
    return { ok: false, error: "Score must be a whole number." };
  }
  if (score < 0 || score > MAX_SCORE_PER_TURN) {
    return { ok: false, error: "Score must be between 0 and 180." };
  }
  return { ok: true };
};

/**
 * Apply a scoring turn to the game.
 *
 * This function does NOT mutate the input game – it returns a new copy.
 *
 * @param {import("../types/Game").Game} game
 * @param {Object} params
 * @param {number} params.score - 0–180
 * @param {boolean} params.finishedOnDouble - Whether player confirmed checkout on a double (only matters when double-out is enabled).
 *
 * @returns {{
 *   game: import("../types/Game").Game,
 *   error?: string,
 *   bust: boolean,
 *   finished: boolean
 * }}
 */
export const applyTurn = (game, { score, finishedOnDouble }) => {
  const validation = validateScore(score);
  if (!validation.ok) {
    return { game, error: validation.error, bust: false, finished: false };
  }

  if (game.status === "finished") {
    return {
      game,
      error: "Game is already finished.",
      bust: false,
      finished: false,
    };
  }

  const currentIndex = game.currentPlayerIndex ?? 0;
  const currentPlayer = game.players[currentIndex];
  if (!currentPlayer) {
    return {
      game,
      error: "Invalid current player.",
      bust: false,
      finished: false,
    };
  }

  const previousRemaining = currentPlayer.remainingScore;
  const tentativeRemaining = previousRemaining - score;

  let wasBust = false;
  let finished = false;
  let newRemaining = previousRemaining;

  // Bust rules
  if (tentativeRemaining < 0) {
    // Score exceeds remaining → bust
    wasBust = true;
  } else if (tentativeRemaining === 1 && game.doubleOut) {
    // Cannot be left on 1 when double-out is enabled
    wasBust = true;
  } else if (tentativeRemaining === 0) {
    // Attempting to finish the game
    if (game.doubleOut && !finishedOnDouble) {
      // Must finish on a double if double-out is enabled
      wasBust = true;
    } else {
      // Valid finish
      finished = true;
      newRemaining = 0;
    }
  } else {
    // Regular valid scoring turn, update remaining
    newRemaining = tentativeRemaining;
  }

  const players = game.players.map((p, index) =>
    index === currentIndex
      ? {
          ...clonePlayer(p),
          remainingScore: wasBust ? previousRemaining : newRemaining,
        }
      : clonePlayer(p)
  );

  const turn = {
    id: `turn_${Date.now()}_${game.history.length}`,
    playerId: currentPlayer.id,
    score,
    wasBust,
    previousRemaining,
    newRemaining: wasBust ? previousRemaining : newRemaining,
    finishedGame: finished,
    finishedOnDouble: !!finishedOnDouble,
    createdAt: Date.now(),
  };

  let status = game.status;
  let winnerPlayerId = game.winnerPlayerId;

  if (finished) {
    status = "finished";
    winnerPlayerId = currentPlayer.id;
  }

  // Advance to next player (always, even after bust or finish).
  // If finished, we still advance for consistency, but UI will
  // typically navigate away.
  const nextPlayerIndex = (currentIndex + 1) % players.length;

  const nextGame = {
    ...game,
    players,
    currentPlayerIndex: nextPlayerIndex,
    status,
    winnerPlayerId,
    history: [...game.history, turn],
  };

  return {
    game: nextGame,
    bust: wasBust,
    finished,
  };
};

/**
 * Undo the last recorded turn.
 *
 * Restores:
 * - Player remaining score
 * - Current player index
 * - Game status / winner
 *
 * @param {import("../types/Game").Game} game
 * @returns {{
 *   game: import("../types/Game").Game,
 *   error?: string
 * }}
 */
export const undoLastTurn = (game) => {
  if (!game.history.length) {
    return { game, error: "No turns to undo." };
  }

  const lastTurn = game.history[game.history.length - 1];
  const remainingHistory = game.history.slice(0, -1);

  const players = game.players.map((p) =>
    p.id === lastTurn.playerId
      ? {
          ...clonePlayer(p),
          remainingScore: lastTurn.previousRemaining,
        }
      : clonePlayer(p)
  );

  // After undoing, the "current player" becomes the one who took the undone turn.
  const currentPlayerIndex = players.findIndex(
    (p) => p.id === lastTurn.playerId
  );

  let status = game.status;
  let winnerPlayerId = game.winnerPlayerId;

  if (game.status === "finished") {
    // If the last turn had finished the game, undoing it should un-finish it.
    status = "inProgress";
    winnerPlayerId = null;
  }

  const nextGame = {
    ...game,
    players,
    currentPlayerIndex: currentPlayerIndex === -1 ? 0 : currentPlayerIndex,
    status,
    winnerPlayerId,
    history: remainingHistory,
  };

  return { game: nextGame };
};
