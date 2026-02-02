import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors } from "../styles/globalStyles";
import { loadGame, saveGame } from "../storage/localGameStore";
import { applyTurn, undoLastTurn } from "../logic/gameEngine";
import NumericKeypad from "../components/NumericKeypad";
import Header from "../components/Header";

function GameScreen({ navigation }) {
  const [game, setGame] = useState(null);
  const [scoreInput, setScoreInput] = useState("");
  const [finishedOnDouble, setFinishedOnDouble] = useState(false);
  const [bustMessage, setBustMessage] = useState("");

  const persistGame = async (nextGame) => {
    setGame(nextGame);
    await saveGame(nextGame);
  };

  const handleUndo = async () => {
    if (!game) return;
    const { game: nextGame, error: undoError } = undoLastTurn(game);
    if (undoError) {
      return;
    }

    setBustMessage("");
    setScoreInput("");
    await persistGame(nextGame);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const saved = await loadGame();
      if (!saved) {
        navigation.replace("GameSetup");
        return;
      }
      setGame(saved);
    };
    bootstrap();
  }, [navigation]);

  useLayoutEffect(() => {
    if (game) {
      const centerContent = (
        <>
          <Text style={styles.gameTypeHeader}>{game.gameType}</Text>
          {game.doubleOut && (
            <Text style={styles.doubleOutHeader}>Double Out</Text>
          )}
        </>
      );

      const rightContent = (
        <TouchableOpacity
          onPress={() => handleUndo()}
          disabled={game.history.length === 0}
          style={[
            styles.undoButtonHeader,
            game.history.length === 0 && styles.undoButtonDisabled,
          ]}
        >
          <Text style={styles.undoIconHeader}>↩</Text>
          <Text style={styles.undoTextHeader}>Undo</Text>
        </TouchableOpacity>
      );

      navigation.setOptions({
        header: () => (
          <Header
            onBack={() => {
              // Navigate back to GameSetup since Game uses replace()
              navigation.navigate("GameSetup");
            }}
            center={centerContent}
            right={rightContent}
            showBack={true}
          />
        ),
      });
    }
  }, [game, navigation, game?.history.length]);

  const handleNumberPress = (num) => {
    const newScore = scoreInput + num.toString();
    if (parseInt(newScore, 10) <= 180) {
      setScoreInput(newScore);
      setBustMessage("");
    }
  };

  const handleBackspace = () => {
    setScoreInput((prev) => prev.slice(0, -1));
    setBustMessage("");
  };

  const handleSubmitScore = async () => {
    if (!game) return;
    const parsed = parseInt(scoreInput, 10);
    if (Number.isNaN(parsed) || scoreInput === "") {
      return;
    }

    const {
      game: nextGame,
      error: logicError,
      bust,
      finished,
    } = applyTurn(game, {
      score: parsed,
      finishedOnDouble,
    });

    if (logicError) {
      setBustMessage(logicError);
      return;
    }

    if (bust) {
      // Determine bust message
      const currentPlayer = game.players[game.currentPlayerIndex];
      const remaining = currentPlayer?.remainingScore || 0;
      const tentativeRemaining = remaining - parsed;

      let message = "BUST! ";
      if (tentativeRemaining < 0) {
        message += "Score went below zero";
      } else if (tentativeRemaining === 1 && game.doubleOut) {
        message += "Can't finish on 1 with double-out";
      } else if (
        tentativeRemaining === 0 &&
        game.doubleOut &&
        !finishedOnDouble
      ) {
        message += "Must finish on a double";
      } else {
        message += "Invalid score";
      }

      setBustMessage(message);
      // Still apply the turn (which will bust)
      await persistGame(nextGame);
      setScoreInput("");
      setFinishedOnDouble(false);
      return;
    }

    setBustMessage("");
    setScoreInput("");
    setFinishedOnDouble(false);
    await persistGame(nextGame);

    if (finished) {
      navigation.replace("GameSummary");
    }
  };

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const currentPlayer =
    game.players[game.currentPlayerIndex] ?? game.players[0];
  const scoreValue = scoreInput || "0";
  const isValidScore = scoreInput && parseInt(scoreInput, 10) <= 180;
  const canSubmit = isValidScore && scoreInput !== "";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Player Cards */}
        <View style={styles.playersContainer}>
          {game.players.map((player, index) => {
            const isCurrent = index === game.currentPlayerIndex;
            return (
              <View
                key={player.id}
                style={[
                  styles.playerCard,
                  isCurrent && styles.playerCardActive,
                ]}
              >
                <View style={styles.playerCardContent}>
                  <View style={styles.playerLeft}>
                    <View
                      style={[
                        styles.playerBadge,
                        isCurrent
                          ? styles.playerBadgeActive
                          : styles.playerBadgeInactive,
                      ]}
                    >
                      <Text style={styles.playerBadgeText}>{index + 1}</Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      {isCurrent && (
                        <Text style={styles.yourTurn}>Your Turn</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.playerScore}>
                    {player.remainingScore}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Enter Score Section */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Enter Score</Text>
          <View
            style={[
              styles.scoreDisplay,
              bustMessage && styles.scoreDisplayError,
            ]}
          >
            <Text
              style={[
                styles.scoreDisplayText,
                bustMessage && styles.scoreDisplayTextError,
              ]}
            >
              {scoreValue}
            </Text>
          </View>

          {bustMessage && (
            <View style={styles.bustAlert}>
              <View style={styles.bustIcon}>
                <Text style={styles.bustIconText}>!</Text>
              </View>
              <Text style={styles.bustText}>{bustMessage}</Text>
            </View>
          )}

          {game.doubleOut &&
            parseInt(scoreValue, 10) > 0 &&
            game.players[game.currentPlayerIndex]?.remainingScore -
              parseInt(scoreValue, 10) ===
              0 && (
              <TouchableOpacity
                style={[
                  styles.doubleToggle,
                  finishedOnDouble && styles.doubleToggleActive,
                ]}
                onPress={() => setFinishedOnDouble((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.doubleToggleText,
                    finishedOnDouble && styles.doubleToggleTextActive,
                  ]}
                >
                  ✓ Finished on double
                </Text>
              </TouchableOpacity>
            )}
        </View>

        {/* Numeric Keypad */}
        <View style={styles.keypadContainer}>
          <NumericKeypad
            onNumberPress={handleNumberPress}
            onBackspace={handleBackspace}
            onSubmit={handleSubmitScore}
            canSubmit={canSubmit}
          />
          <Text style={styles.hintText}>
            Enter total score for 3 darts (0-180)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  playersContainer: {
    gap: 12,
    marginBottom: 24,
  },
  playerCard: {
    borderRadius: 16,
    backgroundColor: "#224734",
    padding: 16,
  },
  playerCardActive: {
    backgroundColor: "#2D5C3E",
  },
  playerCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  playerBadgeActive: {
    backgroundColor: "#009966",
  },
  playerBadgeInactive: {
    backgroundColor: colors.card,
  },
  playerBadgeText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  playerInfo: {
    gap: 4,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  yourTurn: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  playerScore: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  scoreSection: {
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  scoreDisplay: {
    height: 100,
    borderRadius: 16,
    backgroundColor: colors.scoreInputBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  scoreDisplayError: {
    backgroundColor: colors.scoreInputError,
  },
  scoreDisplayText: {
    fontSize: 56,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  scoreDisplayTextError: {
    color: colors.textPrimary,
  },
  bustAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  bustIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  bustIconText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  bustText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  doubleToggle: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
  },
  doubleToggleActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  doubleToggleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  doubleToggleTextActive: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  keypadContainer: {
    marginTop: 8,
  },
  hintText: {
    textAlign: "center",
    color: colors.textHint,
    fontSize: 12,
    marginTop: 16,
  },
  gameTypeHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  doubleOutHeader: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  undoButtonHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 6,
  },
  undoButtonDisabled: {
    opacity: 0.4,
  },
  undoIconHeader: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  undoTextHeader: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});

export default GameScreen;
