import AsyncStorage from "@react-native-async-storage/async-storage";

const GAME_KEY = "currentGame_v1";

/**
 * Persist the full game state locally.
 * @param {import("../types/Game").Game | null} game
 */
export const saveGame = async (game) => {
  try {
    if (!game) {
      await AsyncStorage.removeItem(GAME_KEY);
      return;
    }
    await AsyncStorage.setItem(GAME_KEY, JSON.stringify(game));
  } catch (error) {
    console.warn("Failed to save game:", error);
  }
};

/**
 * Load the last saved game state, if any.
 * @returns {Promise<import("../types/Game").Game | null>}
 */
export const loadGame = async () => {
  try {
    const raw = await AsyncStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    console.warn("Failed to load game:", error);
    return null;
  }
};

/**
 * Remove any saved game from storage.
 */
export const clearGame = async () => {
  try {
    await AsyncStorage.removeItem(GAME_KEY);
  } catch (error) {
    console.warn("Failed to clear game:", error);
  }
};
