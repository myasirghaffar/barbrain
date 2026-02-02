import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../styles/globalStyles";

function TurnIndicator({ playerName, remaining }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Player</Text>
      <Text style={styles.name}>{playerName}</Text>
      <Text style={styles.remainingLabel}>Remaining</Text>
      <Text style={styles.remaining}>{remaining}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  name: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  remainingLabel: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textSecondary,
  },
  remaining: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.warning,
  },
});

export default TurnIndicator;
