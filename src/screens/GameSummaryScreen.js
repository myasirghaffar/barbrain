import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../styles/globalStyles";
import { clearGame, loadGame, saveGame } from "../storage/localGameStore";
import { TrophyIcon } from "../assets/icons/icons";

function GameSummaryScreen({ navigation }) {
  const [game, setGame] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      const saved = await loadGame();
      if (!saved) {
        navigation.replace("Home");
        return;
      }
      setGame(saved);
    };
    bootstrap();
  }, [navigation]);

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading summary...</Text>
      </View>
    );
  }

  const winner = game.players.find((p) => p.id === game.winnerPlayerId);

  const handleNewGame = async () => {
    await clearGame();
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  const handleRematch = async () => {
    // Create a fresh game with same settings and players, resetting scores.
    const startingScore = game.gameType === "301" ? 301 : 501;
    const rematchPlayers = game.players.map((p) => ({
      ...p,
      startingScore,
      remainingScore: startingScore,
    }));

    const rematchGame = {
      ...game,
      id: `game_${Date.now()}`,
      players: rematchPlayers,
      currentPlayerIndex: 0,
      status: "inProgress",
      winnerPlayerId: null,
      history: [],
    };

    await saveGame(rematchGame);
    navigation.reset({
      index: 0,
      routes: [{ name: "Game" }],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Trophy Section */}
      <View style={styles.trophyContainer}>
        <View style={styles.trophyShadow}>
          <View style={styles.trophyCircle}>
            <View style={styles.trophyIconWrapper}>
              {/* Part 1: Left handle */}
              <View style={[styles.iconPart, { left: 6.67, top: 13.33 }]}>
                <Svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                  <Path d="M16.6634 19.9964H11.6643C9.45461 19.9964 7.33537 19.1186 5.77285 17.556C4.21033 15.9935 3.33252 13.8743 3.33252 11.6646C3.33252 9.45482 4.21033 7.33559 5.77285 5.77307C7.33537 4.21055 9.45461 3.33273 11.6643 3.33273H16.6634" stroke="white" strokeWidth="6.66546" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              {/* Part 2: Right handle */}
              <View style={[styles.iconPart, { left: 59.99, top: 13.33 }]}>
                <Svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                  <Path d="M3.33252 19.9964H8.33161C10.5414 19.9964 12.6606 19.1186 14.2231 17.556C15.7856 15.9935 16.6634 13.8743 16.6634 11.6646C16.6634 9.45482 15.7856 7.33559 14.2231 5.77307C12.6606 4.21055 10.5414 3.33273 8.33161 3.33273H3.33252" stroke="white" strokeWidth="6.66546" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              {/* Part 3: Base line */}
              <View style={[styles.iconPart, { left: 13.33, top: 73.32 }]}>
                <Svg width="60" height="7" viewBox="0 0 60 7" fill="none">
                  <Path d="M3.33252 3.33273H56.6562" stroke="white" strokeWidth="6.66546" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              {/* Part 4: Left stand */}
              <View style={[styles.iconPart, { left: 23.33, top: 48.86 }]}>
                <Svg width="17" height="32" viewBox="0 0 17 32" fill="none">
                  <Path d="M13.3307 3.33273V11.1313C13.3307 12.9643 11.7643 14.3974 10.098 15.1639C6.16534 16.9636 3.33252 21.9294 3.33252 27.795" stroke="white" strokeWidth="6.66546" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              {/* Part 5: Right stand */}
              <View style={[styles.iconPart, { left: 46.66, top: 48.86 }]}>
                <Svg width="17" height="32" viewBox="0 0 17 32" fill="none">
                  <Path d="M3.33252 3.33273V11.1313C3.33252 12.9643 4.8989 14.3974 6.56527 15.1639C10.4979 16.9636 13.3307 21.9294 13.3307 27.795" stroke="white" strokeWidth="6.66546" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              {/* Part 6: Cup body */}
              <View style={[styles.iconPart, { left: 20, top: 6.67 }]}>
                <Svg width="47" height="50" viewBox="0 0 47 50" fill="none">
                  <Path d="M43.3253 3.33273H3.33252V26.6618C3.33252 31.9652 5.43928 37.0514 9.18932 40.8014C12.9394 44.5515 18.0255 46.6582 23.3289 46.6582C28.6323 46.6582 33.7184 44.5515 37.4685 40.8014C41.2185 37.0514 43.3253 31.9652 43.3253 26.6618V3.33273Z" stroke="white" strokeWidth="6.66546" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Winner Announcement */}
      <View style={styles.winnerContainer}>
        <Text style={styles.winnerName}>{winner?.name ?? "Unknown"}</Text>
        <Text style={styles.winnerSubtext}>wins the game!</Text>
      </View>

      {/* Game Type Card */}
      <View style={styles.gameTypeCard}>
        <Text style={styles.gameTypeLabel}>Game Type</Text>
        <Text style={styles.gameTypeValue}>{game.gameType}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.rematchButton} onPress={handleRematch}>
          <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <Path
              d="M1.99902 7.99653C1.99902 9.1827 2.35076 10.3422 3.00977 11.3285C3.66877 12.3148 4.60543 13.0835 5.70131 13.5374C6.7972 13.9913 8.00307 14.1101 9.16645 13.8787C10.3298 13.6473 11.3985 13.0761 12.2372 12.2373C13.076 11.3986 13.6472 10.3299 13.8786 9.16656C14.11 8.00318 13.9912 6.7973 13.5373 5.70142C13.0834 4.60554 12.3147 3.66888 11.3284 3.00987C10.3421 2.35087 9.18259 1.99913 7.99642 1.99913C6.31978 2.00544 4.71049 2.65966 3.50504 3.825L1.99902 5.33102"
              stroke="white"
              strokeWidth="1.33275"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M1.99902 1.99913V5.33102H5.33091"
              stroke="white"
              strokeWidth="1.33275"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.rematchText}>Rematch</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame}>
          <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <Path
              d="M9.99582 13.9939V8.6629C9.99582 8.48616 9.92561 8.31667 9.80064 8.1917C9.67567 8.06673 9.50618 7.99652 9.32944 7.99652H6.66394C6.4872 7.99652 6.31771 8.06673 6.19274 8.1917C6.06777 8.31667 5.99756 8.48616 5.99756 8.6629V13.9939"
              stroke="white"
              strokeWidth="1.33275"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M1.99902 6.6638C1.99898 6.46993 2.04123 6.27838 2.12283 6.10252C2.20443 5.92666 2.32341 5.77072 2.47149 5.64558L7.13613 1.64798C7.37668 1.44467 7.68146 1.33313 7.99642 1.33313C8.31138 1.33313 8.61616 1.44467 8.85671 1.64798L13.5214 5.64558C13.6694 5.77072 13.7884 5.92666 13.87 6.10252C13.9516 6.27838 13.9939 6.46993 13.9938 6.6638V12.6612C13.9938 13.0147 13.8534 13.3537 13.6035 13.6036C13.3535 13.8535 13.0145 13.9939 12.6611 13.9939H3.33178C2.97831 13.9939 2.63932 13.8535 2.38938 13.6036C2.13944 13.3537 1.99902 13.0147 1.99902 12.6612V6.6638Z"
              stroke="white"
              strokeWidth="1.33275"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.newGameText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
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
  trophyContainer: {
    marginBottom: 48,
    alignItems: "center",
  },
  trophyShadow: {
    shadowColor: "rgba(208, 135, 0, 0.3)",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 15,
  },
  trophyCircle: {
    width: 127.98,
    height: 127.98,
    backgroundColor: "#FDC700", // Fallback for gradient
    borderRadius: 43474500, // Large value for circle
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 0.02,
  },
  trophyIconWrapper: {
    width: 79.99,
    height: 79.99,
    position: "relative",
    overflow: "hidden",
  },
  iconPart: {
    position: "absolute",
  },
  winnerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  winnerName: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  winnerSubtext: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  gameTypeCard: {
    width: 122.66,
    height: 82.58,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 14,
    borderWidth: 1.3,
    borderColor: "rgba(255, 255, 255, 0.20)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  gameTypeLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "Roboto",
    marginBottom: 4,
  },
  gameTypeValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    fontFamily: "Roboto",
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
  },
  rematchButton: {
    width: "100%",
    height: 63.99,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#009966",
    borderRadius: 14,
    gap: 12,
  },
  rematchText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    fontFamily: "Roboto",
    lineHeight: 28,
  },
  newGameButton: {
    width: "100%",
    height: 63.99,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 14,
    borderWidth: 1.3,
    borderColor: "rgba(255, 255, 255, 0.20)",
    gap: 12,
  },
  newGameText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    fontFamily: "Roboto",
    lineHeight: 28,
  },
});

export default GameSummaryScreen;
